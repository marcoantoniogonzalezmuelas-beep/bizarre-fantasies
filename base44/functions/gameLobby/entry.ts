import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = String(body.action || 'list');
    const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const token = String(body.token || '').slice(0, 80);
    const cutoff = Date.now() - 90000;
    const LEFT_TTL = 300000; // 5 minutos tras salir un jugador

    // ---- Auto-limpieza: elimina salas "playing" con left_at caducado ----
    async function cleanupStaleLeft() {
      try {
        const playing = await base44.asServiceRole.entities.GameRoom.filter({ status: 'playing' }, '-updated_date', 100);
        const now = Date.now();
        for (const room of playing) {
          const leftAt = room.left_at || room.state?.left_at;
          if (leftAt && now - leftAt > LEFT_TTL) {
            await base44.asServiceRole.entities.GameRoom.delete(room.id);
          }
        }
      } catch (e) {}
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
        .filter((room) => Date.parse(room.updated_date || room.created_date || 0) >= cutoff)
        .forEach((room) => {
          rooms.push({
            id: room.room_code,
            name: room.state?.room_name || room.host_name || room.room_code,
            hasPass: room.state?.has_pass === true,
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
        state: { room_name: String(body.name || code).slice(0, 28), has_pass: body.hasPass === true, owner_token: token, password: String(body.pass || '').slice(0, 40) },
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
      await base44.asServiceRole.entities.GameRoom.delete(existing.id);
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});