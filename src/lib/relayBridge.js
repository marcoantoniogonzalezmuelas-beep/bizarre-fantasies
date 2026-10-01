import { base44 } from '@/api/base44Client';
import relayRealtimeChannel from '@/lib/relayRealtimeChannel';
import relayBackupQueue from '@/lib/relayBackupQueue';
import { getRelayToken, setRelayToken } from '@/lib/relayTokens';

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
    room = relayRealtimeChannel(cleanCode, side, post, getRelayToken(cleanCode, side));
    return room;
  };

  const onMessage = async (event) => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow || event.source !== frameWindow) return;
    // El iframe acaba de (re)cargarse y no tiene ninguna sala: el canal de la partida anterior no
    // debe seguir empujándole mensajes (antes seguía vivo tras "Terminar").
    if (event.data?.bfRelayIdle) { closeRealtime(); return; }
    if (event.data?.bfRelayAck) { room?.acknowledge(event.data.bfRelayAck); return; }
    if (!event.data?.bfRelay) return;
    const { requestId, payload: rawPayload = {} } = event.data.bfRelay;
    const action = String(rawPayload.action || '');
    const side = String(rawPayload.side || (action === 'join' ? 'g' : ''));
    const stored = getRelayToken(rawPayload.code, side);
    const payload = stored ? { ...rawPayload, token: stored } : rawPayload;
    try {
      if (action === 'sendBatch') {
        let receipt;
        try { receipt = await ensureRealtime(payload.code, side)?.send(payload); }
        catch { closeRealtime(); }
        if (receipt?.ok) {
          backup.push(payload);
          post({ bfRelayResult: { requestId, data: receipt } });
          return;
        }
      }
      const response = await base44.functions.invoke('gameRelay', payload);
      if (response.data?.ok && response.data.token) setRelayToken(payload.code, response.data.side || side, response.data.token);
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