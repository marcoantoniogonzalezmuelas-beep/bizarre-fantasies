import { base44 } from '@/api/base44Client';

// Puente de credenciales TURN: el juego (dentro del iframe) pide credenciales
// frescas del servidor TURN antes de crear/unirse a una sala y cada vez que
// necesita renovarlas. Sin este puente la petición caducaba y la partida se
// quedaba solo con STUN, así que en redes móviles (NAT restrictivo) la
// conexión se caía a los pocos segundos.
export function bindTurnBridge(iframeRef) {
  const onMessage = (event) => {
    const req = event.data && event.data.bfTurnRequest;
    if (!req || !req.requestId) return;
    const reply = (payload) => {
      try { iframeRef.current?.contentWindow?.postMessage({ bfTurnResult: { requestId: req.requestId, ...payload } }, '*'); } catch (e) {}
    };
    base44.functions.invoke('getTurnCredentials', {})
      .then((res) => {
        const iceServers = Array.isArray(res.data?.iceServers) ? res.data.iceServers : [];
        if (iceServers.length) reply({ iceServers });
        else reply({ error: 'no_ice_servers' });
      })
      .catch(() => reply({ error: 'turn_unavailable' }));
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}