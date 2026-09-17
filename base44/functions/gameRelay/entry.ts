// Relay por servidor para el multijugador (sustituye a WebRTC/P2P/TURN).
// El estado de la partida vive en el servidor (entidad GameRoom.state).
// Ambos jugadores hacen polling para recibir el estado más reciente y los
// mensajes pendientes (intents, FX, cinemáticas…). No hay conexión P2P.
//
// IMPORTANT: Todas las escrituras usan updateMany con operadores atómicos
// ($set con dot-notation, $inc, $push) para que un poll NUNCA pise un
// snap o un send concurrente. Antes, el poll leía el state entero, lo
// modificaba (last_seen) y lo escribía entero, sobreescribiendo cualquier
// snap/send que hubiera llegado entre la lectura y la escritura. Eso
// causaba que las pujas del invitado se perdieran al cambiar de fase.
//
// Acciones:
//  - join:   el invitado se une a la sala y recibe el estado actual
//  - poll:   ambos jugadores consultan actualizaciones (snap + msgs)
//  - snap:   el host envía el estado completo de la partida
//  - send:   cualquier jugador envía un mensaje (intent, FX, bye…)
//  - leave:  un jugador abandona la sala
//  - resume:  un jugador reanuda una partida en curso
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

    // ---- JOIN: el invitado se une ----
    if (action === 'join') {
      if (state.password && String(body.password || '') !== state.password) {
        return Response.json({ error: 'Wrong password' }, { status: 403 });
      }
      const guestNick = String(body.nick || '').slice(0, 28);
      const guestAvatar = String(body.avatar || '').slice(0, 600);
      const resumeNicks = [room.host_name || state.room_name || '', guestNick].filter(Boolean);

      // Escritura atómica: solo los campos del invitado. No toca snap/msgs.
      await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id }, {
        $set: {
          status: 'playing',
          guest_name: guestNick,
          left_at: null,
          'state.guest_nick': guestNick,
          'state.guest_avatar': guestAvatar,
          'state.guest_last_seen': now,
          'state.guest_left_at': null,
          'state.resume_nicks': resumeNicks,
          // Inicializar campos de relay si no existen (la sala viene del lobby)
          'state.snap': state.snap ?? null,
          'state.snap_seq': state.snap_seq ?? 0,
          'state.msgs': state.msgs ?? [],
          'state.msg_seq': state.msg_seq ?? 0,
        },
      });

      return Response.json({
        ok: true,
        snap: state.snap,
        snap_seq: state.snap_seq || 0,
        msgs: (state.msgs || []).slice(-50),
        msg_seq: state.msg_seq || 0,
        role: 'client',
        side: 'g',
      });
    }

    // ---- POLL: ambos jugadores consultan actualizaciones ----
    // SOLO LECTURA del state. La escritura de last_seen se hace como mucho
    // cada 3 s (no en cada poll) para no saturar el rate-limit de la BD.
    if (action === 'poll') {
      const side = String(body.side || 'p');
      const isHost = side === 'p';
      const otherSide = isHost ? 'g' : 'p';
      const myLastSeen = isHost ? (state.host_last_seen || 0) : (state.guest_last_seen || 0);
      const otherLastSeen = isHost ? (state.guest_last_seen || 0) : (state.host_last_seen || 0);
      const otherLeft = isHost ? (state.guest_left_at || 0) : (state.host_left_at || 0);
      const otherStale = !!(otherLastSeen && now - otherLastSeen > STALE_MS);

      // Escritura atómica: solo si hace más de 3 s que no se actualiza
      // last_seen. Esto reduce las escrituras de 5/s a ~0.3/s por jugador.
      const needHeartbeat = !myLastSeen || now - myLastSeen > 3000;
      if (needHeartbeat || (otherStale && !room.left_at) || (!otherStale && room.left_at)) {
        const setOps: any = {};
        if (needHeartbeat) setOps[isHost ? 'state.host_last_seen' : 'state.guest_last_seen'] = now;
        const updateOps: any = { $set: setOps };
        if (otherStale && !room.left_at) {
          updateOps.$set.left_at = now;
        } else if (!otherStale && room.left_at) {
          updateOps.$unset = { left_at: '' };
        }
        if (Object.keys(setOps).length > 0 || updateOps.$unset) {
          await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id }, updateOps);
        }
      }

      // FILTRAR MENSAJES POR LADO: solo se devuelven los mensajes del OTRO
      // jugador. Sin esto, el host recibía sus propios mensajes (welcome,
      // bfavatar…) y el avatarPatch seteaba bfOppAvatar con el avatar del
      // propio host → los avatares del host salían mal en la batalla.
      const allMsgs = (state.msgs || []).filter((m: any) => m.seq > Number(body.msg_since || 0));
      const otherMsgs = allMsgs.filter((m: any) => m.side === otherSide).slice(-50);

      return Response.json({
        ok: true,
        snap: (state.snap_seq || 0) > Number(body.snap_since || 0) ? state.snap : null,
        snap_seq: state.snap_seq || 0,
        msgs: otherMsgs,
        msg_seq: state.msg_seq || 0,
        guest_joined: !!state.guest_nick,
        other_left: !!(otherLeft || otherStale),
      });
    }

    // ---- SNAP: el host envía el estado completo ----
    // Escritura atómica: solo snap y snap_seq. No toca msgs ni last_seen del invitado.
    if (action === 'snap') {
      if (String(body.side || '') !== 'p') return Response.json({ error: 'Host only' }, { status: 403 });
      const newSeq = (state.snap_seq || 0) + 1;
      await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id }, {
        $set: {
          'state.snap': body.snap,
          'state.snap_seq': newSeq,
          'state.host_last_seen': now,
        },
      });
      return Response.json({ ok: true, snap_seq: newSeq });
    }

    // ---- SEND: cualquier jugador envía un mensaje ----
    // Escritura atómica: $push + $inc. No pisa snaps ni el state del otro lado.
    if (action === 'send') {
      const side = String(body.side || 'p');
      // Usar Date.now() como seq: único y monótono incluso con sends
      // concurrentes (antes state.msg_seq+1 producía seqs duplicados
      // cuando dos sends leían el mismo state.msg_seq stale).
      const newSeq = Date.now();
      await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id }, {
        $push: {
          'state.msgs': {
            $each: [{ seq: newSeq, side, data: body.data }],
            $slice: -40,
          },
        },
        $set: {
          'state.msg_seq': newSeq,
          [side === 'p' ? 'state.host_last_seen' : 'state.guest_last_seen']: now,
        },
      });
      return Response.json({ ok: true, msg_seq: newSeq });
    }

    // ---- RESUME: un jugador reanuda una partida en curso ----
    if (action === 'resume') {
      if (state.password && String(body.password || '') !== state.password) {
        return Response.json({ error: 'Wrong password' }, { status: 403 });
      }
      const side = String(body.side || 'g');
      const setOps: any = { left_at: null };
      if (side === 'p') {
        setOps['state.host_last_seen'] = now;
        setOps['state.host_left_at'] = null;
      } else {
        setOps['state.guest_last_seen'] = now;
        setOps['state.guest_left_at'] = null;
        if (!state.guest_nick) setOps['state.guest_nick'] = String(body.nick || '').slice(0, 28);
      }
      await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id }, {
        $set: setOps,
      });
      return Response.json({
        ok: true,
        snap: state.snap,
        snap_seq: state.snap_seq || 0,
        msgs: (state.msgs || []).slice(-50),
        msg_seq: state.msg_seq || 0,
        role: side === 'p' ? 'host' : 'client',
        side,
      });
    }

    // ---- LEAVE: un jugador abandona ----
    if (action === 'leave') {
      const side = String(body.side || 'p');
      const setOps: any = { left_at: now };
      setOps[side === 'p' ? 'state.host_left_at' : 'state.guest_left_at'] = now;
      await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id }, { $set: setOps });
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}