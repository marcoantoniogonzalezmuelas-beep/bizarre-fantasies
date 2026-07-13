import { base44 } from '@/api/base44Client';

export function bindGameLobbyBridge(iframeRef) {
  const onMessage = async (event) => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow || event.source !== frameWindow) return;

    if (event.data?.bfTurnRequest) {
      const { requestId } = event.data.bfTurnRequest;
      try {
        const response = await base44.functions.invoke('getTurnCredentials', {});
        frameWindow.postMessage({ bfTurnResult: { requestId, iceServers: response.data?.iceServers || [] } }, '*');
      } catch (error) {
        frameWindow.postMessage({ bfTurnResult: { requestId, error: error.message || 'TURN unavailable' } }, '*');
      }
      return;
    }

    if (!event.data?.bfLobby) return;
    const { requestId, payload } = event.data.bfLobby;
    try {
      const response = await base44.functions.invoke('gameLobby', payload || {});
      frameWindow.postMessage({ bfLobbyResult: { requestId, data: response.data } }, '*');
    } catch (error) {
      frameWindow.postMessage({ bfLobbyResult: { requestId, error: error.message || 'Lobby unavailable' } }, '*');
    }
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}