import { waitUntil } from 'base44:runtime';
import { seatState, matchIsOver, FORFEIT_MS } from './resumePolicy.ts';

// Reliable per-sender FIFO. Retries keep their batch ID; only acknowledged
// delivery IDs are removed. No timestamps are used as message cursors.
export async function relayProtocol(base44, room, body, now) {
  const side = body.side;
  if (side !== 'p' && side !== 'g') return Response.json({ error: 'Invalid side' }, { status: 400 });
  const state = room.state || {};
  const other = side === 'p' ? 'g' : 'p';
  const queueKey = 'state.relay_queue_' + side;
  if (body.action === 'sendBatch') {
    const batchId = String(body.batch_id || '');
    const messages = body.messages;
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(batchId) || !Array.isArray(messages) || !messages.length || messages.length > 50 || messages.some(m => !m || typeof m !== 'object' || typeof m.t !== 'string')) {
      return Response.json({ error: 'Invalid batch' }, { status: 400 });
    }
    if (side !== 'p' && messages.some(m => m.t === 'snap' || m.t === 'bfFullSync')) return Response.json({ error: 'Host only' }, { status: 403 });
    const seenKey = 'state.relay_seen_' + side;
    const set = { [side === 'p' ? 'state.host_last_seen' : 'state.guest_last_seen']: now };
    // Una revancha empieza otra partida en la misma sala: deja de estar "terminada".
    if (messages.some(m => m.t === 'bfrematch')) set['state.match_started_at'] = now;
    // El anfitrión es quien fija el id de la partida (bfMatchId): se guarda para que quien se
    // una o REANUDE después lo adopte en vez de inventarlo o copiarlo de un mensaje suelto.
    if (side === 'p') {
      const withId = [...messages].reverse().find(m => m && typeof m.bfMatchId === 'string' && m.bfMatchId);
      if (withId) { set['state.match_id'] = String(withId.bfMatchId).slice(0, 64); set['state.match_round'] = Number(withId.bfMatchRound) || 0; }
    }
    const snapshots = messages.filter(m => m.t === 'snap');
    if (snapshots.length) set['state.snap'] = snapshots[snapshots.length - 1];
    const ops = {
      $push: {
        [queueKey]: { $each: messages.map((data, i) => ({ id: batchId + '_' + i, data })) },
        [seenKey]: { $each: [batchId], $slice: -128 }
      },
      $set: set
    };
    if (snapshots.length) ops.$inc = { 'state.snap_seq': snapshots.length };
    await base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id, [seenKey]: { $ne: batchId } }, ops);
    return Response.json({ ok: true, batch_id: batchId });
  }
  const ack = Array.isArray(body.ack) ? body.ack.filter(id => typeof id === 'string').slice(0, 100) : [];
  const incomingKey = 'state.relay_queue_' + other;
  const seenAt = state[side === 'p' ? 'host_last_seen' : 'guest_last_seen'] || 0;
  const ops = {};
  if (ack.length) ops.$pull = { [incomingKey]: { id: { $in: ack } } };
  if (now - seenAt > 8000) ops.$max = { [side === 'p' ? 'state.host_last_seen' : 'state.guest_last_seen']: now };
  // ACK cleanup is idempotent and independent of delivery. Do not make the
  // player wait for a second database round trip before receiving the action.
  // Failed cleanup is safe: unremoved IDs are redelivered and acknowledged again.
  if (Object.keys(ops).length) waitUntil(
    base44.asServiceRole.entities.GameRoom.updateMany({ id: room.id }, ops)
      .catch(() => console.warn('Relay acknowledgement cleanup will retry on redelivery'))
  );
  const acknowledged = new Set(ack);
  const pending = (state['relay_queue_' + other] || []).filter(m => !acknowledged.has(m.id));
  const otherSeen = state[other === 'p' ? 'host_last_seen' : 'guest_last_seen'] || 0;
  const otherSeat = seatState({ state }, other, now);
  return Response.json({ ok: true, deliveries: pending.slice(0, 50), more: pending.length > 50,
    guest_joined: !!state.guest_nick,
    // El servidor informa de cuánto lleva ausente el rival (el cliente ofrece reclamar victoria).
    other_away_ms: otherSeat.absent ? otherSeat.awayMs : 0, match_over: matchIsOver(state), forfeit_after_ms: FORFEIT_MS,
    other_left: !!state[other === 'p' ? 'host_left_at' : 'guest_left_at'] || !!(otherSeen && now - otherSeen > 45000) });
}