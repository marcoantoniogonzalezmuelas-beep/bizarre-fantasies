import { base44 } from '@/api/base44Client';

export default function relayRealtimeChannel(code, side, post) {
  const key = `bfRelayConnection:${code}:${side}`;
  let connectionId = sessionStorage.getItem(key);
  if (!connectionId) { connectionId = crypto.randomUUID(); sessionStorage.setItem(key, connectionId); }
  const room = base44.actors.GameRelayRoom(code).connect({ id: connectionId });
  const pending = new Map();
  let lastSeen = 0, closed = false;
  const subscription = room.subscribe(message => {
    if (closed || !message || typeof message !== 'object') return;
    lastSeen = Date.now();
    if (message.type === 'connected') room.send({ type: 'hello', side });
    if (message.type === 'ready') {
      post({ bfRelayRealtimeStatus: message.peers?.includes(side === 'p' ? 'g' : 'p') ? 'ready' : 'waiting' });
      for (const peer of message.peers || []) if (peer !== side) post({ bfRelayPresence: { side: peer, connected: true } });
    }
    if (message.type === 'presence' && message.side !== side) {
      post({ bfRelayPresence: message });
      post({ bfRelayRealtimeStatus: message.connected ? 'ready' : 'waiting' });
    }
    if (message.type === 'batch_ack') {
      const request = pending.get(message.batch_id);
      if (request) { clearTimeout(request.timer); pending.delete(message.batch_id); request.resolve({ ok: true, batch_id: message.batch_id }); }
    }
    if (message.type === 'deliveries' && message.side !== side) post({ bfRelayPush: { deliveries: message.deliveries || [] } });
  });
  room.send({ type: 'hello', side });
  const heartbeat = setInterval(() => {
    if (Date.now() - lastSeen > 7000) post({ bfRelayRealtimeStatus: 'waiting' });
    room.send({ type: 'sync' });
  }, 3000);
  return {
    send(payload) {
      return new Promise(resolve => {
        const timer = setTimeout(() => { pending.delete(payload.batch_id); post({ bfRelayRealtimeStatus: 'waiting' }); resolve(null); }, 900);
        pending.set(payload.batch_id, { resolve, timer });
        room.send({ type: 'send_batch', batch_id: payload.batch_id, messages: payload.messages });
      });
    },
    acknowledge(ids) { if (!closed && ids.length) room.send({ type: 'ack_deliveries', ids }); },
    close() {
      closed = true; clearInterval(heartbeat); subscription.unsubscribe(); room.close();
      for (const request of pending.values()) { clearTimeout(request.timer); request.resolve(null); }
      pending.clear();
    },
  };
}