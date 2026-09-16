import { base44 } from '@/api/base44Client';

// Puente de relay: el iframe (juego) envía peticiones al servidor Base44
// (gameRelay) a través de este puente. Cada petición tiene un requestId para
// emparejar la respuesta asíncrona con la promesa pendiente.
export function bindRelayBridge(iframeRef) {
  const onMessage = async (event) => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow || event.source !== frameWindow) return;
    if (!event.data?.bfRelay) return;
    const { requestId, payload } = event.data.bfRelay;
    try {
      const response = await base44.functions.invoke('gameRelay', payload || {});
      frameWindow.postMessage({ bfRelayResult: { requestId, data: response.data } }, '*');
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Relay error';
      frameWindow.postMessage({ bfRelayResult: { requestId, error: errMsg } }, '*');
    }
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}