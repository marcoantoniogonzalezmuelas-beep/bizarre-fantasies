import { base44 } from '@/api/base44Client';
import relayRealtimeChannel from '@/lib/relayRealtimeChannel';
import relayBackupQueue from '@/lib/relayBackupQueue';

// Canal permanente para acciones inmediatas; gameRelay conserva la cola durable
// y actúa como respaldo después de una reconexión.
export function bindRelayBridge(iframeRef) {
  let room = null;
  const backup = relayBackupQueue();
  const post = data => iframeRef.current?.contentWindow?.postMessage(data, '*');
  let activeCode = '';
  let activeSide = '';

  const closeRealtime = () => {
    room?.close();
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
    room = relayRealtimeChannel(cleanCode, side, post);
    return room;
  };

  const onMessage = async (event) => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow || event.source !== frameWindow) return;
    if (event.data?.bfRelayAck) { room?.acknowledge(event.data.bfRelayAck); return; }
    if (!event.data?.bfRelay) return;
    const { requestId, payload = {} } = event.data.bfRelay;
    const action = String(payload.action || '');
    const side = String(payload.side || (action === 'join' ? 'g' : ''));
    try {
      if (action === 'sendBatch') {
        const receipt = await ensureRealtime(payload.code, side)?.send(payload);
        if (receipt?.ok) {
          backup.push(payload);
          post({ bfRelayResult: { requestId, data: receipt } });
          return;
        }
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
    closeRealtime(); backup.close();
  };
}