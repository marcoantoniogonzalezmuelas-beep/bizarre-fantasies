import { base44 } from '@/api/base44Client';

export default function relayRealtimeChannel(code, side, post, token = '') {
  const key = `bfRelayConnection:${code}:${side}`;
  let connectionId = sessionStorage.getItem(key);
  if (!connectionId) { connectionId = crypto.randomUUID(); sessionStorage.setItem(key, connectionId); }
  const room = base44.actors.GameRelayRoom(code).connect({ id: connectionId });
  // Todo lo que llega al iframe lleva el código de la SALA de la que viene: la página padre sigue
  // conectada a una sala vieja tras acabar la partida y sus mensajes se colaban en la siguiente.
  const emit = (message) => post({ ...message, bfRelayCode: code });
  const pending = new Map();
  let lastSeen = 0, closed = false, ready = false;
  const subscription = room.subscribe(message => {
    if (closed || !message || typeof message !== 'object') return;
    lastSeen = Date.now();
    if (message.type === 'connected') { ready = false; room.send({ type: 'hello', side, token }); }
    if (message.type === 'ready') {
      ready = true;
      emit({ bfRelayRealtimeStatus: message.peers?.includes(side === 'p' ? 'g' : 'p') ? 'ready' : 'waiting' });
      for (const peer of message.peers || []) if (peer !== side) emit({ bfRelayPresence: { side: peer, connected: true } });
    }
    if (message.type === 'presence' && message.side !== side) {
      emit({ bfRelayPresence: message });
      emit({ bfRelayRealtimeStatus: message.connected ? 'ready' : 'waiting' });
    }
    if (message.type === 'batch_ack') {
      const request = pending.get(message.batch_id);
      if (request) { clearTimeout(request.timer); pending.delete(message.batch_id); request.resolve({ ok: true, batch_id: message.batch_id }); }
    }
    if (message.type === 'deliveries' && message.side !== side) emit({ bfRelayPush: { deliveries: message.deliveries || [] } });
  });
  room.send({ type: 'hello', side, token });
  const heartbeat = setInterval(() => {
    if (Date.now() - lastSeen > 2500) emit({ bfRelayRealtimeStatus: 'waiting' });
    room.send({ type: 'sync' });
  }, 1000);
  return {
    send(payload) {
      // A known unavailable socket must not add 900ms before every HTTP fallback.
      if (closed || !ready || Date.now() - lastSeen > 2500) return Promise.resolve(null);
      return new Promise(resolve => {
        const timer = setTimeout(() => { ready = false; pending.delete(payload.batch_id); emit({ bfRelayRealtimeStatus: 'waiting' }); resolve(null); }, 900);
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