import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { createMissionPackDeal } from '../../shared/missionPackDeal.ts';
import { MISSION_ROOM_TTL, missionRoomExpiresAt, missionRoomSummary, missionParticipant, hashMissionPassword } from '../../shared/missionRooms.ts';

// Sala de misión multijugador: coordina la creación de sala, el intercambio
// de equipos entre los dos jugadores y la confirmación de "listos" antes de
// arrancar la partida. Usa la entidad GameRoom con asServiceRole (bypass RLS).

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genCode() {
  let c = '';
  for (let i = 0; i < 6; i++) c += CHARS[Math.floor(Math.random() * CHARS.length)];
  return c;
}
function genPass() {
  let p = '';
  for (let i = 0; i < 8; i++) p += CHARS[Math.floor(Math.random() * CHARS.length)];
  return p;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = String(body.action || '');

    if (action === 'mp_list') {
      const candidates = await base44.asServiceRole.entities.GameRoom.filter({ 'state.mp_mission': 'mp' }, '-created_date', 100);
      return Response.json({ ok: true, rooms: candidates.filter(r => !r.state?.guest_nick && !r.state?.game_code && missionRoomExpiresAt(r) > Date.now()).map(missionRoomSummary) });
    }

    if (action === 'mp_create') {
      const nick = String(body.nick || '').slice(0, 28).trim();
      const mission = String(body.mission || 'club');
      const modality = String(body.modality || 'pack');
      const isPrivate = body.is_private === true;
      const roomPassword = String(body.room_password || '');
      if (!nick || !['club', 'l5r'].includes(mission) || !['pack', 'budget'].includes(modality)) return Response.json({ error: 'Datos de sala incorrectos.' }, { status: 400 });
      if (isPrivate && (roomPassword.length < 4 || roomPassword.length > 64)) return Response.json({ error: 'La contraseña debe tener entre 4 y 64 caracteres.' }, { status: 400 });

      // Genera código único
      let code = '';
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = genCode();
        const existing = await base44.asServiceRole.entities.GameRoom.filter({ room_code: candidate }, '-updated_date', 1);
        if (!existing.length) { code = candidate; break; }
      }
      if (!code) return Response.json({ error: 'No se pudo crear un código único.' }, { status: 500 });

      let packDeal = null;
      if (modality === 'pack') {
        try { packDeal = await createMissionPackDeal(base44, mission); }
        catch (error) { return Response.json({ error: error.message }, { status: 400 }); }
      }
      const pass = genPass();
      const salt = isPrivate ? crypto.randomUUID() : '';
      const token = crypto.randomUUID();
      const room = await base44.asServiceRole.entities.GameRoom.create({
        room_code: code,
        status: 'playing',
        host_name: nick,
        left_at: null,
        state: {
          mp_mission: 'mp',
          mission,
          modality,
          pack_deal: packDeal,
          host_nick: nick,
          host_team: null,
          host_ready: false,
          guest_nick: null,
          guest_team: null,
          guest_ready: false,
          owner_token: token,
          password: pass,
          is_private: isPrivate,
          room_password_salt: salt,
          room_password_hash: isPrivate ? await hashMissionPassword(roomPassword, salt) : '',
          created_at: Date.now(),
          expires_at: Date.now() + MISSION_ROOM_TTL,
        },
      });
      return Response.json({ ok: true, code, password: pass, token, room_id: room.id });
    }

    if (action === 'mp_join') {
      const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      const nick = String(body.nick || '').slice(0, 28).trim();
      if (!code || !nick) return Response.json({ error: 'Code and nick required' }, { status: 400 });

      const matches = await base44.asServiceRole.entities.GameRoom.filter({ room_code: code }, '-updated_date', 1);
      const room = matches[0];
      if (!room || room.state?.mp_mission !== 'mp' || missionRoomExpiresAt(room) <= Date.now() || room.state.game_code) return Response.json({ error: 'La sala ya no está disponible.' }, { status: 404 });
      if (room.state.guest_nick) return Response.json({ error: 'La sala está completa.' }, { status: 409 });
      if (room.state.host_nick.toLowerCase() === nick.toLowerCase()) return Response.json({ error: 'El anfitrión ya está en esta sala.' }, { status: 409 });
      if (room.state.is_private) {
        const input = String(body.room_password || '');
        if (!input || await hashMissionPassword(input, room.state.room_password_salt) !== room.state.room_password_hash) return Response.json({ error: 'Contraseña incorrecta.' }, { status: 403 });
      }
      const token = crypto.randomUUID();
      await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id, 'state.guest_nick': null, 'state.game_code': null, 'state.expires_at': room.state.expires_at }, {
        $set: { status: 'playing', guest_name: nick, 'state.guest_nick': nick, 'state.guest_token': token, 'state.expires_at': Date.now() + MISSION_ROOM_TTL },
      });
      const joined = await base44.asServiceRole.entities.GameRoom.get(room.id);
      if (joined.state.guest_token !== token || joined.state.guest_nick !== nick) return Response.json({ error: 'Room is full' }, { status: 409 });
      return Response.json({
        ok: true,
        mission: room.state.mission,
        modality: room.state.modality,
        host_nick: room.state.host_nick,
        password: room.state.password,
        token,
      });
    }

    if (action === 'mp_open_packs') {
      const code = String(body.code || '').toUpperCase();
      const [room] = await base44.asServiceRole.entities.GameRoom.filter({ room_code: code }, '-updated_date', 1);
      if (!room || room.state?.mp_mission !== 'mp' || missionRoomExpiresAt(room) <= Date.now()) return Response.json({ error: 'La sala ha caducado.' }, { status: 404 });
      const seat = missionParticipant(room, body.token);
      if (!seat) return Response.json({ error: 'No tienes acceso a esta sala.' }, { status: 403 });
      if (room.state.modality !== 'pack') return Response.json({ error: 'Esta sala no usa sobres.' }, { status: 400 });
      if (!room.state.pack_deal) return Response.json({ error: 'Esta sala es anterior al nuevo reparto. Crea una nueva para jugar sin repetidos.' }, { status: 409 });
      return Response.json({ ok: true, packs: room.state.pack_deal[seat] });
    }

    if (action === 'mp_set_team') {
      const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      const nick = String(body.nick || '').slice(0, 28).trim();
      const role = String(body.role || 'host'); // 'host' or 'guest'
      const team = Array.isArray(body.team) ? body.team.map(h => String(h || '')) : [];
      if (!code || !nick || team.length !== 3 || new Set(team).size !== 3 || team.some(h => !h || h === 'undefined')) return Response.json({ error: 'Invalid data' }, { status: 400 });

      const matches = await base44.asServiceRole.entities.GameRoom.filter({ room_code: code }, '-updated_date', 1);
      const room = matches[0];
      if (!room || room.state?.mp_mission !== 'mp' || missionRoomExpiresAt(room) <= Date.now()) return Response.json({ error: 'La sala ha caducado.' }, { status: 404 });

      const isHost = role === 'host' && room.state.host_nick === nick && body.token === room.state.owner_token;
      const isGuest = role === 'guest' && room.state.guest_nick === nick && body.token === room.state.guest_token;
      if (!isHost && !isGuest) return Response.json({ error: 'Not your room' }, { status: 403 });
      if (room.state.game_code) return Response.json({ error: 'La partida ya ha empezado.' }, { status: 409 });
      if (room.state.modality === 'pack') {
        const own = room.state.pack_deal?.[role]?.flat() || [];
        const other = room.state.pack_deal?.[isHost ? 'guest' : 'host']?.flat() || [];
        if (team.some(id => !own.includes(id) || other.includes(id))) return Response.json({ error: 'Elige tres héroes distintos de tus propios sobres.' }, { status: 400 });
        if (room.state[role + '_ready'] && team.some(id => !room.state[role + '_team'].includes(id))) return Response.json({ error: 'Tu ejército ya está confirmado.' }, { status: 409 });
      }

      const updates = {};
      if (isHost) {
        updates['state.host_team'] = team;
        updates['state.host_ready'] = true;
      } else {
        updates['state.guest_team'] = team;
        updates['state.guest_ready'] = true;
      }
      updates['state.expires_at'] = Date.now() + MISSION_ROOM_TTL;
      await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id }, { $set: updates });
      return Response.json({ ok: true });
    }

    if (action === 'mp_hosted') {
      const code = String(body.code || '').toUpperCase();
      const matches = await base44.asServiceRole.entities.GameRoom.filter({ room_code: code }, '-created_date', 1);
      const room = matches[0];
      if (!room || room.state?.mp_mission !== 'mp' || missionRoomExpiresAt(room) <= Date.now() || !body.token || room.state.owner_token !== body.token) return Response.json({ error: 'La sala ya no está disponible.' }, { status: 403 });
      if (!room.state.host_ready || !room.state.guest_ready) return Response.json({ error: 'Ambos ejércitos deben estar listos.' }, { status: 409 });
      if (room.state.modality === 'pack' && room.state.host_team.some(id => room.state.guest_team.includes(id))) return Response.json({ error: 'Los ejércitos no pueden compartir héroes. Crea una nueva sala.' }, { status: 409 });
      const gameCode = String(body.game_code || '');
      if (!/^[A-Z0-9]{3,6}$/.test(gameCode) || !body.run_id) return Response.json({ error: 'Invalid game' }, { status: 400 });
      const games = await base44.asServiceRole.entities.GameRoom.filter({ room_code: gameCode }, '-created_date', 1);
      if (!games[0] || games[0].state?.password !== room.state.password) return Response.json({ error: 'La partida todavía no está disponible.' }, { status: 409 });
      await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id }, { $set: { 'state.game_code': gameCode, 'state.run_id': String(body.run_id) } });
      return Response.json({ ok: true });
    }

    if (action === 'mp_poll') {
      const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      if (!code) return Response.json({ error: 'Code required' }, { status: 400 });

      const matches = await base44.asServiceRole.entities.GameRoom.filter({ room_code: code }, '-updated_date', 1);
      const room = matches[0];
      if (!room || room.state?.mp_mission !== 'mp' || missionRoomExpiresAt(room) <= Date.now()) return Response.json({ error: 'La sala ha caducado o se ha cerrado.' }, { status: 404 });
      if (!missionParticipant(room, body.token)) return Response.json({ error: 'No tienes acceso a esta sala.' }, { status: 403 });
      if (room.state.guest_nick && !room.state.game_code && Date.now() - Number(room.state.last_heartbeat || 0) > 30000) {
        await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id, 'state.expires_at': room.state.expires_at }, { $set: { 'state.expires_at': Date.now() + MISSION_ROOM_TTL, 'state.last_heartbeat': Date.now() } });
      }

      return Response.json({
        ok: true,
        mission: room.state.mission,
        modality: room.state.modality,
        host_nick: room.state.host_nick,
        host_team: room.state.host_team,
        host_ready: !!room.state.host_ready,
        guest_nick: room.state.guest_nick,
        guest_team: room.state.guest_team,
        guest_ready: !!room.state.guest_ready,
        game_code: room.state.game_code || null,
        run_id: room.state.run_id || null,
      });
    }

    if (action === 'mp_leave') {
      const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      const matches = await base44.asServiceRole.entities.GameRoom.filter({ room_code: code }, '-updated_date', 1);
      const room = matches[0];
      if (!room || room.state?.mp_mission !== 'mp') return Response.json({ ok: true });
      const participant = missionParticipant(room, body.token);
      if (!participant) return Response.json({ error: 'No tienes acceso a esta sala.' }, { status: 403 });
      if (room.state.game_code) return Response.json({ ok: true });
      if (participant === 'host') await base44.asServiceRole.entities.GameRoom.delete(room.id);
      else await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id, 'state.guest_token': body.token }, { $set: { guest_name: null, 'state.guest_nick': null, 'state.guest_token': null, 'state.guest_team': null, 'state.guest_ready': false, 'state.expires_at': Date.now() + MISSION_ROOM_TTL } });
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}