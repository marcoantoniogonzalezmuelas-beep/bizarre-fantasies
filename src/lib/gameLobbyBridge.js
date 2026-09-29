import { base44 } from '@/api/base44Client';
import { setRelayToken } from '@/lib/relayTokens';

export function bindGameLobbyBridge(iframeRef) {
  const onMessage = async (event) => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow || event.source !== frameWindow) return;

    if (!event.data?.bfLobby) return;
    const { requestId, payload } = event.data.bfLobby;
    try {
      const response = await base44.functions.invoke('gameLobby', payload || {});
      // El anfitrión registra la sala con su token secreto: lo reutiliza el relay.
      if (payload && ['register', 'register_playing'].includes(payload.action) && response.data?.ok !== false) {
        setRelayToken(payload.code, 'p', payload.token);
      }
      frameWindow.postMessage({ bfLobbyResult: { requestId, data: response.data } }, '*');
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || 'Lobby unavailable';
      frameWindow.postMessage({ bfLobbyResult: { requestId, error: errMsg } }, '*');
    }
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}