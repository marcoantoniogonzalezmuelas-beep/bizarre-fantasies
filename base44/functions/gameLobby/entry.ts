import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = String(body.action || 'list');
    const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const token = String(body.token || '').slice(0, 80);
    const cutoff = Date.now() - 90000;

    if (action === 'list') {
      const resumeCutoff = Date.now() - 300000;
      const [waitingRecords, resumingRecords] = await Promise.all([
        base44.asServiceRole.entities.GameRoom.filter({ status: 'waiting' }, '-updated_date', 100),
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
    const isStale = existing && Date.parse(existing.updated_date || existing.created_date || 0) < cutoff;

    if (action === 'register') {
      const data = {
        room_code: code,
        status: 'waiting',
        host_name: String(body.name || code).slice(0, 28),
        state: { room_name: String(body.name || code).slice(0, 28), has_pass: body.hasPass === true, owner_token: token },
      };
      if (existing && !ownsRoom && !isStale) return Response.json({ error: 'Room code already active' }, { status: 409 });
      const room = existing ? await base44.asServiceRole.entities.GameRoom.update(existing.id, data) : await base44.asServiceRole.entities.GameRoom.create(data);
      return Response.json({ ok: true, id: room.id });
    }

    if (action === 'register_resume') {
      const nicks = Array.isArray(body.nicks) ? body.nicks.slice(0, 2).map((n: any) => String(n || '').slice(0, 28)) : [];
      const resumeCutoff = Date.now() - 300000;
      const isStaleResume = existing && Date.parse(existing.updated_date || existing.created_date || 0) < resumeCutoff;
      const resumeData = {
        room_code: code,
        status: 'resuming' as const,
        host_name: nicks[0] || code,
        guest_name: nicks[1] || '',
        state: { room_name: 'Partida en curso', has_pass: body.hasPass === true, owner_token: token, resume_nicks: nicks, resume_token: String(body.resume_token || '').slice(0, 40) },
      };
      if (existing && !ownsRoom && !isStaleResume) return Response.json({ error: 'Room code already active' }, { status: 409 });
      const resumeRoom = existing ? await base44.asServiceRole.entities.GameRoom.update(existing.id, resumeData) : await base44.asServiceRole.entities.GameRoom.create(resumeData);
      return Response.json({ ok: true, id: resumeRoom.id });
    }

    if (!existing || !ownsRoom) return Response.json({ ok: true });
    if (action === 'touch') {
      await base44.asServiceRole.entities.GameRoom.update(existing.id, { status: existing.status === 'resuming' ? 'resuming' : 'waiting' });
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