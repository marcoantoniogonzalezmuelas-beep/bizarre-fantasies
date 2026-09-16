// Relay por servidor para el multijugador (sustituye a WebRTC/P2P/TURN).
// El estado de la partida vive en el servidor (entidad GameRoom.state).
// Ambos jugadores hacen polling para recibir el estado más reciente y los
// mensajes pendientes (intents, FX, cinemáticas…). No hay conexión P2P.
//
// Acciones:
//  - join:   el invitado se une a la sala y recibe el estado actual
//  - poll:   ambos jugadores consultan actualizaciones (snap + msgs)
//  - snap:   el host envía el estado completo de la partida
//  - send:   cualquier jugador envía un mensaje (intent, FX, bye…)
//  - leave:  un jugador abandona la sala
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const STALE_MS = 15000; // 15 s sin poll = desconectado
const ROOM_TTL = 600000; // 10 min sin actividad = sala borrada
let lastCleanup = 0;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = String(body.action || '');
    const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const now = Date.now();

    // Auto-limpieza de salas estancadas (throttle 60 s por isolate)
    if (now - lastCleanup > 60000) {
      lastCleanup = now;
      try {
        const all = await base44.asServiceRole.entities.GameRoom.list('-updated_date', 200);
        const stale = (all || []).filter((r: any) => {
          const s = r.state || {};
          const lastActivity = Math.max(s.host_last_seen || 0, s.guest_last_seen || 0, Date.parse(r.updated_date || r.created_date || 0));
          return r.status === 'finished' || (now - lastActivity > ROOM_TTL);
        });
        await Promise.all(stale.map((r: any) => base44.asServiceRole.entities.GameRoom.delete(r.id).catch(() => {})));
      } catch (e) {}
    }

    if (!code) return Response.json({ error: 'Code required' }, { status: 400 });

    const rooms = await base44.asServiceRole.entities.GameRoom.filter({ room_code: code }, '-updated_date', 1);
    const room = rooms && rooms[0];
    if (!room) return Response.json({ error: 'Room not found' }, { status: 404 });

    const state: any = room.state || {};
    // Inicializar campos de relay si no existen (la sala viene del lobby)
    if (state.snap_seq === undefined) {
      state.snap = null;
      state.snap_seq = 0;
      state.msgs = [];
      state.msg_seq = 0;
    }

    // ---- JOIN: el invitado se une ----
    if (action === 'join') {
      if (state.password && String(body.password || '') !== state.password) {
        return Response.json({ error: 'Wrong password' }, { status: 403 });
      }
      state.guest_nick = String(body.nick || '').slice(0, 28);
      state.guest_avatar = String(body.avatar || '').slice(0, 600);
      state.guest_last_seen = now;
      state.guest_left_at = null;
      await base44.asServiceRole.entities.GameRoom.update(room.id, {
        status: 'playing',
        guest_name: state.guest_nick,
        left_at: null,
        state,
      });
      return Response.json({
        ok: true,
        snap: state.snap,
        snap_seq: state.snap_seq,
        msgs: (state.msgs || []).slice(-50),
        msg_seq: state.msg_seq,
        role: 'client',
        side: 'g',
      });
    }

    // ---- POLL: ambos jugadores consultan actualizaciones ----
    if (action === 'poll') {
      const side = String(body.side || 'p');
      const isHost = side === 'p';
      if (isHost) state.host_last_seen = now;
      else state.guest_last_seen = now;

      const otherLastSeen = isHost ? (state.guest_last_seen || 0) : (state.host_last_seen || 0);
      const otherLeft = isHost ? (state.guest_left_at || 0) : (state.host_left_at || 0);
      const otherStale = !!(otherLastSeen && now - otherLastSeen > STALE_MS);

      const updates: any = { state };
      if (otherStale && !room.left_at) updates.left_at = now;
      await base44.asServiceRole.entities.GameRoom.update(room.id, updates);

      return Response.json({
        ok: true,
        snap: (state.snap_seq || 0) > Number(body.snap_since || 0) ? state.snap : null,
        snap_seq: state.snap_seq || 0,
        msgs: (state.msgs || []).filter((m: any) => m.seq > Number(body.msg_since || 0)).slice(-50),
        msg_seq: state.msg_seq || 0,
        guest_joined: !!state.guest_nick,
        other_left: !!(otherLeft || otherStale),
      });
    }

    // ---- SNAP: el host envía el estado completo ----
    if (action === 'snap') {
      if (String(body.side || '') !== 'p') return Response.json({ error: 'Host only' }, { status: 403 });
      state.snap = body.snap;
      state.snap_seq = (state.snap_seq || 0) + 1;
      state.host_last_seen = now;
      await base44.asServiceRole.entities.GameRoom.update(room.id, { state });
      return Response.json({ ok: true, snap_seq: state.snap_seq });
    }

    // ---- SEND: cualquier jugador envía un mensaje ----
    if (action === 'send') {
      const side = String(body.side || 'p');
      state.msgs = state.msgs || [];
      state.msg_seq = (state.msg_seq || 0) + 1;
      state.msgs.push({ seq: state.msg_seq, side, data: body.data });
      // Podar mensajes antiguos para no crecer indefinidamente
      if (state.msgs.length > 80) state.msgs = state.msgs.slice(-40);
      if (side === 'p') state.host_last_seen = now;
      else state.guest_last_seen = now;
      await base44.asServiceRole.entities.GameRoom.update(room.id, { state });
      return Response.json({ ok: true, msg_seq: state.msg_seq });
    }

    // ---- LEAVE: un jugador abandona ----
    if (action === 'leave') {
      const side = String(body.side || 'p');
      if (side === 'p') state.host_left_at = now;
      else state.guest_left_at = now;
      await base44.asServiceRole.entities.GameRoom.update(room.id, { left_at: now, state });
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}