import { base44 } from '@/api/base44Client';

// Canal permanente para acciones inmediatas; gameRelay conserva la cola durable
// y actúa como respaldo después de una reconexión.
export function bindRelayBridge(iframeRef) {
  let room = null;
  let subscription = null;
  let activeCode = '';
  let activeSide = '';

  const closeRealtime = () => {
    subscription?.unsubscribe();
    room?.close();
    subscription = null;
    room = null;
    activeCode = '';
    activeSide = '';
  };

  const ensureRealtime = (code, side) => {
    const cleanCode = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (!cleanCode || !['p', 'g'].includes(side)) return null;
    if (room && activeCode === cleanCode && activeSide === side) return room;
    closeRealtime();
    activeCode = cleanCode;
    activeSide = side;
    const key = `bfRelayConnection:${cleanCode}:${side}`;
    let connectionId = sessionStorage.getItem(key);
    if (!connectionId) {
      connectionId = crypto.randomUUID();
      sessionStorage.setItem(key, connectionId);
    }
    room = base44.actors.GameRelayRoom(cleanCode).connect({ id: connectionId });
    subscription = room.subscribe((message) => {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!frameWindow || !message || typeof message !== 'object') return;
      if (message.type === 'ready') frameWindow.postMessage({ bfRelayRealtimeStatus: 'ready' }, '*');
      if (message.type === 'presence' && message.side !== activeSide) {
        frameWindow.postMessage({ bfRelayPresence: message }, '*');
      }
      if (message.type === 'deliveries' && message.side !== activeSide) {
        frameWindow.postMessage({ bfRelayPush: { deliveries: message.deliveries || [] } }, '*');
      }
    });
    room.send({ type: 'hello', side });
    return room;
  };

  const onMessage = async (event) => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow || event.source !== frameWindow || !event.data?.bfRelay) return;
    const { requestId, payload = {} } = event.data.bfRelay;
    const action = String(payload.action || '');
    const side = String(payload.side || (action === 'join' ? 'g' : ''));
    try {
      if (action === 'sendBatch') {
        ensureRealtime(payload.code, side)?.send({
          type: 'send_batch',
          batch_id: payload.batch_id,
          messages: payload.messages,
        });
      }
      const response = await base44.functions.invoke('gameRelay', payload);
      if (response.data?.ok && ['join', 'resume', 'poll'].includes(action)) {
        ensureRealtime(payload.code, response.data.side || side);
      }
      if (response.data?.ok && action === 'leave') closeRealtime();
      frameWindow.postMessage({ bfRelayResult: { requestId, data: response.data } }, '*');
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Relay error';
      frameWindow.postMessage({ bfRelayResult: { requestId, error: errMsg } }, '*');
    }
  };
  window.addEventListener('message', onMessage);
  return () => {
    window.removeEventListener('message', onMessage);
    closeRealtime();
  };
}