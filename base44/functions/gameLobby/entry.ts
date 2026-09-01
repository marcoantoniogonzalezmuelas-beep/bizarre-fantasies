import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Throttle de las limpiezas de BD, compartido entre peticiones del mismo
// isolate: cada cliente del lobby refresca cada ~8s y cada visitante de la
// Habitación Bizarra late cada pocos segundos, así que ejecutar el escaneo
// completo (200 filas + borrados) en CADA petición multiplicaba la carga
// sobre la BD y provocaba errores de rate-limit (el origen real de la
// inestabilidad del entorno). Las filas caducadas ya se filtran al responder,
// así que retrasar su borrado físico no cambia nada visible.
let lastRoomCleanup = 0;
let lastBizarreCleanup = 0;
const ROOM_CLEANUP_EVERY = 60000;
const BIZARRE_CLEANUP_EVERY = 30000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = String(body.action || 'list');
    const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const token = String(body.token || '').slice(0, 80);
    const cutoff = Date.now() - 90000;
    const LEFT_TTL = 300000; // 5 minutos tras salir un jugador
    // Una sala creada y en espera vive SIEMPRE 5 minutos (visible sin
    // intermitencias). Pasados los 5 minutos sin que nadie se una, se borra.
    const WAITING_TTL = 300000;

    // Borra una sala y su caché asociada (mensajes de chat de la sala).
    async function deleteRoomFully(room: any) {
      try { await base44.asServiceRole.entities.GameRoom.delete(room.id); } catch (e) {}
      try { await base44.asServiceRole.entities.ChatMessage.deleteMany({ room_code: room.room_code }); } catch (e) {}
    }

    // ---- Auto-limpieza total de la BD ----
    // Elimina: salas terminadas, salas con left_at caducado (nadie reanudó en
    // 5 min), salas en espera abandonadas (>10 min sin latido) y partidas
    // muertas (>3 h sin actividad). Así la BD queda siempre liberada aunque
    // algún cliente no llegara a llamar a 'unregister'.
    async function cleanupStaleLeft() {
      try {
        const nowT = Date.now();
        if (nowT - lastRoomCleanup < ROOM_CLEANUP_EVERY) return;
        lastRoomCleanup = nowT;
        const all = await base44.asServiceRole.entities.GameRoom.list('-updated_date', 200);
        const now = Date.now();
        const stale = all.filter((room) => {
          const upd = Date.parse(room.updated_date || room.created_date || 0);
          const created = Date.parse(room.created_date || room.updated_date || 0);
          const leftAt = room.left_at || room.state?.left_at;
          return (
            room.status === 'finished' ||
            (leftAt && now - leftAt > LEFT_TTL) ||
            (room.status === 'waiting' && now - created > WAITING_TTL) ||
            ((room.status === 'playing' || room.status === 'resuming') && now - upd > 10800000)
          );
        });
        // Borrados en paralelo: en serie, una lista con muchas salas caducadas
        // mantenía la petición abierta varios segundos.
        await Promise.all(stale.map((room) => deleteRoomFully(room)));
      } catch (e) {}
    }

    // ---- Habitación Bizarra: cola de visitantes + botón de pánico ----
    const BIZARRE_TIMEOUT = 40000; // 40 s sin latido = fuera
    const SPIN_PREFIX = 'SPIN-';
    const SPIN_TIMEOUT = 20000; // 20 s máximo de ruleta antes de cancelar
    async function cleanupBizarre() {
      try {
        const nowT = Date.now();
        if (nowT - lastBizarreCleanup < BIZARRE_CLEANUP_EVERY) return;
        lastBizarreCleanup = nowT;
        const all = await base44.asServiceRole.entities.BizarreVisitor.list('-created_date', 200);
        const now = Date.now();
        const jobs: Promise<unknown>[] = [];
        for (const v of all) {
          if (now - (v.last_heartbeat || 0) > BIZARRE_TIMEOUT) {
            jobs.push(base44.asServiceRole.entities.ChatMessage.deleteMany({ room_code: 'BIZARRE_ROOM', sender_nick: v.nick }).catch(() => {}));
            jobs.push(base44.asServiceRole.entities.BizarreVisitor.delete(v.id).catch(() => {}));
          } else if (v.match_code && String(v.match_code).startsWith(SPIN_PREFIX)) {
            // Ruleta caducada: limpia el estado de spin para desbloquear el botón
            const parts = String(v.match_code).split('-');
            const spinStart = parseInt(parts[1] || '0', 36);
            if (now - spinStart > SPIN_TIMEOUT) {
              jobs.push(base44.asServiceRole.entities.BizarreVisitor.update(v.id, { match_code: '', match_role: '', match_pass: '' }).catch(() => {}));
            }
          }
        }
        await Promise.all(jobs);
      } catch (e) {}
    }
    async function countWins(nick: string): Promise<number> {
      try {
        const rows = await base44.asServiceRole.entities.MatchResult.filter({ winner_nick: nick }, '-created_date', 500);
        return (rows || []).length;
      } catch (e) { return 0; }
    }

    if (action === 'bizarre_join') {
      await cleanupBizarre();
      const nick = String(body.nick || '').slice(0, 28).trim();
      const avatar = String(body.avatar || '').slice(0, 600);
      if (!nick) return Response.json({ error: 'Nick required' }, { status: 400 });
      // Capacidad máxima: 20 visitantes (10 partidas simultáneas). Si la
      // habitación está llena, bloquea el acceso salvo que el nick ya esté
      // dentro (reentrada tras recarga).
      const allForCap = await base44.asServiceRole.entities.BizarreVisitor.list('-created_date', 200);
      const nowCap = Date.now();
      const activeCap = allForCap.filter((v) => nowCap - (v.last_heartbeat || 0) < BIZARRE_TIMEOUT && !v.match_code);
      const isReentry = activeCap.some((v) => String(v.nick).toLowerCase() === nick.toLowerCase());
      if (activeCap.length >= 20 && !isReentry) {
        return Response.json({ ok: false, error: 'room_full' });
      }
      // Elimina visitantes existentes con el mismo nick (evita duplicados)
      const existing = await base44.asServiceRole.entities.BizarreVisitor.filter({ nick }, '-created_date', 10);
      for (const v of existing) {
        if (String(v.nick).toLowerCase() === nick.toLowerCase()) {
          await base44.asServiceRole.entities.BizarreVisitor.delete(v.id);
        }
      }
      const sessionToken = 'bv-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
      const wins = await countWins(nick);
      const visitor = await base44.asServiceRole.entities.BizarreVisitor.create({
        nick, avatar, total_wins: wins, session_token: sessionToken, last_heartbeat: Date.now(),
        match_code: '', match_role: '', match_pass: '',
      });
      return Response.json({ ok: true, session_token: sessionToken, visitor_id: visitor.id, total_wins: wins });
    }

    if (action === 'bizarre_list') {
      await cleanupBizarre();
      const all = await base44.asServiceRole.entities.BizarreVisitor.list('-created_date', 200);
      const now = Date.now();
      const visitors = all
        .filter((v) => now - (v.last_heartbeat || 0) < BIZARRE_TIMEOUT && !v.match_code)
        .map((v) => ({ nick: v.nick, avatar: v.avatar, total_wins: v.total_wins || 0 }));
      return Response.json({ visitors });
    }

    if (action === 'bizarre_heartbeat') {
      const sessionToken = String(body.session_token || '').slice(0, 80);
      if (!sessionToken) return Response.json({ error: 'session required' }, { status: 400 });
      const matches = await base44.asServiceRole.entities.BizarreVisitor.filter({ session_token: sessionToken }, '-created_date', 1);
      const v = matches[0];
      if (!v) return Response.json({ ok: false, error: 'session_expired' });
      // Auto-reparación: si mi ruleta caducó (SPIN- de hace más de SPIN_TIMEOUT),
      // se limpia aquí mismo, sin esperar al escaneo global (que va con throttle).
      let spinExpired = false;
      if (v.match_code && String(v.match_code).startsWith(SPIN_PREFIX)) {
        const spinStart = parseInt(String(v.match_code).split('-')[1] || '0', 36);
        if (Date.now() - spinStart > SPIN_TIMEOUT) { spinExpired = true; v.match_code = ''; v.match_role = ''; v.match_pass = ''; }
      }
      await base44.asServiceRole.entities.BizarreVisitor.update(v.id, spinExpired
        ? { match_code: '', match_role: '', match_pass: '', last_heartbeat: Date.now() }
        : { last_heartbeat: Date.now() });
      const all = await base44.asServiceRole.entities.BizarreVisitor.list('-created_date', 200);
      const now = Date.now();
      const visitors = all
        .filter((x) => now - (x.last_heartbeat || 0) < BIZARRE_TIMEOUT && !x.match_code)
        .map((x) => ({ nick: x.nick, avatar: x.avatar, total_wins: x.total_wins || 0 }));
      // Detecta si hay una ruleta en curso (par con código SPIN-)
      let spin: any = null;
      const spinning = all.filter((x) => x.match_code && String(x.match_code).startsWith(SPIN_PREFIX) && now - (x.last_heartbeat || 0) < BIZARRE_TIMEOUT);
      if (spinning.length >= 2) {
        const spinner = spinning.find((x) => x.match_role === 'host') || spinning[0];
        const target = spinning.find((x) => x.match_role === 'client') || spinning[1];
        const spinVisitors = all
          .filter((x) => now - (x.last_heartbeat || 0) < BIZARRE_TIMEOUT)
          .map((x) => ({ nick: x.nick, avatar: x.avatar, total_wins: x.total_wins || 0 }));
        spin = {
          spinner_nick: spinner.nick, spinner_avatar: spinner.avatar,
          target_nick: target.nick, target_avatar: target.avatar,
          visitors: spinVisitors,
        };
      }
      // No devuelve match si el código es SPIN- (la ruleta aún gira)
      const isSpinning = v.match_code && String(v.match_code).startsWith(SPIN_PREFIX);
      return Response.json({
        ok: true,
        visitors,
        match: (!isSpinning && v.match_code) ? { code: v.match_code, role: v.match_role, pass: v.match_pass } : null,
        spin,
      });
    }

    if (action === 'bizarre_panic') {
      await cleanupBizarre();
      const sessionToken = String(body.session_token || '').slice(0, 80);
      if (!sessionToken) return Response.json({ error: 'session required' }, { status: 400 });
      const meMatches = await base44.asServiceRole.entities.BizarreVisitor.filter({ session_token: sessionToken }, '-created_date', 1);
      const me = meMatches[0];
      if (!me) return Response.json({ ok: false, error: 'session_expired' });
      if (me.match_code) return Response.json({ ok: false, error: 'already_matched' });
      const all = await base44.asServiceRole.entities.BizarreVisitor.list('-created_date', 200);
      const now = Date.now();
      // Bloquea el pánico si ya hay una ruleta en curso
      const activeSpin = all.some((v) =>
        v.match_code && String(v.match_code).startsWith(SPIN_PREFIX) &&
        (now - parseInt(String(v.match_code).split('-')[1] || '0', 36)) < SPIN_TIMEOUT
      );
      if (activeSpin) return Response.json({ ok: false, error: 'spin_in_progress' });
      const eligible = all.filter((v) =>
        v.id !== me.id && !v.match_code && now - (v.last_heartbeat || 0) < BIZARRE_TIMEOUT
      );
      // Mínimo 2 jugadores MÁS aparte del propio (3 en total)
      if (eligible.length < 2) {
        return Response.json({ ok: false, error: 'need_3_total' });
      }
      const opponent = eligible[Math.floor(Math.random() * eligible.length)];
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let roomCode = '';
      for (let i = 0; i < 6; i++) roomCode += chars[Math.floor(Math.random() * chars.length)];
      let roomPass = '';
      for (let i = 0; i < 8; i++) roomPass += chars[Math.floor(Math.random() * chars.length)];
      // Marca a ambos con un código SPIN- temporal (la ruleta está girando).
      // El código real se asigna cuando el host confirma tras la animación.
      const spinCode = SPIN_PREFIX + now.toString(36) + '-' + roomCode;
      await base44.asServiceRole.entities.BizarreVisitor.update(me.id, { match_code: spinCode, match_role: 'host', match_pass: roomPass });
      await base44.asServiceRole.entities.BizarreVisitor.update(opponent.id, { match_code: spinCode, match_role: 'client', match_pass: roomPass });
      // Snapshot de todos los visitantes activos para la ruleta
      const spinVisitors = all
        .filter((v) => now - (v.last_heartbeat || 0) < BIZARRE_TIMEOUT)
        .map((v) => ({ nick: v.nick, avatar: v.avatar, total_wins: v.total_wins || 0 }));
      return Response.json({
        ok: true,
        spin: { target_nick: opponent.nick, target_avatar: opponent.avatar, visitors: spinVisitors },
        match: { code: roomCode, role: 'host', pass: roomPass, opponent: opponent.nick },
      });
    }

    // Cancela una ruleta en curso (el que pulsó el pánico cerró la habitación)
    if (action === 'bizarre_cancel_spin') {
      const sessionToken = String(body.session_token || '').slice(0, 80);
      if (!sessionToken) return Response.json({ ok: true });
      const matches = await base44.asServiceRole.entities.BizarreVisitor.filter({ session_token: sessionToken }, '-created_date', 1);
      const v = matches[0];
      if (!v || !v.match_code || !String(v.match_code).startsWith(SPIN_PREFIX)) return Response.json({ ok: true });
      const pair = await base44.asServiceRole.entities.BizarreVisitor.filter({ match_code: v.match_code }, '-created_date', 10);
      for (const p of pair) {
        await base44.asServiceRole.entities.BizarreVisitor.update(p.id, { match_code: '', match_role: '', match_pass: '' });
      }
      return Response.json({ ok: true });
    }

    // El host (pulsador de pánico) reporta el código real de la sala que el
    // juego generó al crearla, para que el cliente pueda unirse.
    if (action === 'bizarre_report_code') {
      const sessionToken = String(body.session_token || '').slice(0, 80);
      const realCode = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      if (!sessionToken || !realCode) return Response.json({ ok: false });
      const matches = await base44.asServiceRole.entities.BizarreVisitor.filter({ session_token: sessionToken }, '-created_date', 1);
      const v = matches[0];
      if (!v || !v.match_code) return Response.json({ ok: false });
      // Actualiza el código en ambos jugadores de la pareja
      const pair = await base44.asServiceRole.entities.BizarreVisitor.filter({ match_code: v.match_code }, '-created_date', 10);
      for (const p of pair) {
        await base44.asServiceRole.entities.BizarreVisitor.update(p.id, { match_code: realCode });
        await base44.asServiceRole.entities.ChatMessage.deleteMany({ room_code: 'BIZARRE_ROOM', sender_nick: p.nick });
      }
      return Response.json({ ok: true });
    }

    if (action === 'bizarre_leave') {
      const sessionToken = String(body.session_token || '').slice(0, 80);
      if (!sessionToken) return Response.json({ ok: true });
      const matches = await base44.asServiceRole.entities.BizarreVisitor.filter({ session_token: sessionToken }, '-created_date', 1);
      if (matches[0]) {
        await base44.asServiceRole.entities.ChatMessage.deleteMany({ room_code: 'BIZARRE_ROOM', sender_nick: matches[0].nick });
        await base44.asServiceRole.entities.BizarreVisitor.delete(matches[0].id);
      }
      return Response.json({ ok: true });
    }

    if (action === 'list') {
      await cleanupStaleLeft();
      const [waitingRecords, playingRecords, resumingRecords] = await Promise.all([
        base44.asServiceRole.entities.GameRoom.filter({ status: 'waiting' }, '-updated_date', 100),
        base44.asServiceRole.entities.GameRoom.filter({ status: 'playing' }, '-updated_date', 100),
        base44.asServiceRole.entities.GameRoom.filter({ status: 'resuming' }, '-updated_date', 100),
      ]);
      const rooms: any[] = [];
      waitingRecords
        // La sala en espera se mantiene visible 5 minutos completos desde su
        // creación, sin depender de los "toques" del anfitrión (antes
        // aparecía y desaparecía de la lista).
        .filter((room) => Date.now() - Date.parse(room.created_date || room.updated_date || 0) < WAITING_TTL)
        .forEach((room) => {
          rooms.push({
            id: room.room_code,
            name: room.state?.room_name || room.host_name || room.room_code,
            hasPass: room.state?.has_pass === true,
            avatar: room.state?.host_avatar || '',
            ts: Date.parse(room.updated_date || room.created_date || 0),
          });
        });
      // Salas "playing" con left_at: visibles como "Partida en curso" (reanudables).
      // Salas "playing" sin left_at: partida en juego activo, NO se muestran en la lista
      // (nadie puede unirse salvo los dos jugadores originales, que usan su token).
      playingRecords.forEach((room) => {
        const leftAt = room.left_at || room.state?.left_at;
        if (!leftAt || Date.now() - leftAt > LEFT_TTL) return;
        rooms.push({
          id: room.room_code,
          name: 'Partida en curso',
          hasPass: room.state?.has_pass === true,
          isResume: true,
          nicks: room.state?.resume_nicks || [room.host_name, room.guest_name].filter(Boolean),
          ts: Date.parse(room.updated_date || room.created_date || 0),
        });
      });
      // Legacy: salas "resuming" (compatibilidad con partidas antiguas).
      const resumeCutoff = Date.now() - LEFT_TTL;
      resumingRecords
        .filter((room) => Date.parse(room.updated_date || room.created_date || 0) >= resumeCutoff)
        .forEach((room) => {
          rooms.push({
            id: room.room_code,
            name: 'Partida en curso',
            hasPass: room.state?.has_pass === true,
            isResume: true,
            nicks: room.state?.resume_nicks || [room.host_name, room.guest_name].filter(Boolean),
            ts: Date.parse(room.updated_date || room.created_date || 0),
          });
        });
      return Response.json({ rooms });
    }

    if (!code || code.length < 3 || !token) {
      return Response.json({ error: 'Invalid room data' }, { status: 400 });
    }

    const matches = await base44.asServiceRole.entities.GameRoom.filter({ room_code: code }, '-updated_date', 1);
    const existing = matches[0];
    const ownsRoom = existing?.state?.owner_token === token;
    const resumeToken = String(body.resume_token || '').slice(0, 40);
    const hasResumeToken = !!(resumeToken && existing?.state?.resume_token && resumeToken === existing.state.resume_token);
    const passMatch = !!(existing?.state?.password && String(body.password || '') === existing.state.password);
    const canModify = ownsRoom || hasResumeToken || passMatch;
    const isStale = existing && Date.parse(existing.updated_date || existing.created_date || 0) < cutoff;

    if (action === 'register') {
      const data = {
        room_code: code,
        status: 'waiting',
        host_name: String(body.name || code).slice(0, 28),
        left_at: null,
        state: { room_name: String(body.name || code).slice(0, 28), has_pass: body.hasPass === true, owner_token: token, password: String(body.pass || '').slice(0, 40), host_avatar: String(body.avatar || '').slice(0, 600) },
      };
      if (existing && !ownsRoom && !isStale) return Response.json({ error: 'Room code already active' }, { status: 409 });
      const room = existing ? await base44.asServiceRole.entities.GameRoom.update(existing.id, data) : await base44.asServiceRole.entities.GameRoom.create(data);
      return Response.json({ ok: true, id: room.id });
    }

    // Marca la sala como "playing" (partida en juego) cuando arranca la partida.
    // La sala deja de ser visible en la lista pública: nadie puede unirse salvo
    // los dos jugadores originales, que usan su token de reanudación.
    if (action === 'register_playing') {
      const nicks = Array.isArray(body.nicks) ? body.nicks.slice(0, 2).map((n: any) => String(n || '').slice(0, 28)) : [];
      const data = {
        room_code: code,
        status: 'playing' as const,
        host_name: nicks[0] || String(body.name || code).slice(0, 28),
        guest_name: nicks[1] || '',
        left_at: null,
        state: { room_name: String(body.name || code).slice(0, 28), has_pass: body.hasPass === true, owner_token: token, resume_nicks: nicks, resume_token: String(body.resume_token || '').slice(0, 40), password: String(body.pass || '').slice(0, 40) },
      };
      if (existing && !ownsRoom && !isStale) return Response.json({ error: 'Room code already active' }, { status: 409 });
      const room = existing ? await base44.asServiceRole.entities.GameRoom.update(existing.id, data) : await base44.asServiceRole.entities.GameRoom.create(data);
      return Response.json({ ok: true, id: room.id });
    }

    // Marca que un jugador ha salido de la partida en curso. Empieza la cuenta
    // atrás de 5 minutos: si nadie reanuda, la sala se auto-elimina.
    if (action === 'mark_left') {
      if (!existing || !ownsRoom) return Response.json({ ok: true });
      await base44.asServiceRole.entities.GameRoom.update(existing.id, { left_at: Date.now(), status: 'playing' });
      return Response.json({ ok: true });
    }

    // Limpia el flag de salida: un jugador ha vuelto a la partida. La sala
    // vuelve a estar oculta de la lista pública (partida en juego activo).
    if (action === 'clear_left') {
      if (!existing || !ownsRoom) return Response.json({ ok: true });
      await base44.asServiceRole.entities.GameRoom.update(existing.id, { left_at: null, status: 'playing' });
      return Response.json({ ok: true });
    }

    if (!existing || !canModify) return Response.json({ ok: true });
    if (action === 'touch') {
      await base44.asServiceRole.entities.GameRoom.update(existing.id, { status: existing.status === 'resuming' ? 'resuming' : (existing.status === 'playing' ? 'playing' : 'waiting') });
      return Response.json({ ok: true });
    }
    if (action === 'unregister') {
      await deleteRoomFully(existing);
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});