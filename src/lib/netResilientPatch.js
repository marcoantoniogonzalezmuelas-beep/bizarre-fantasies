// Parche inyectado en el iframe: conectividad multijugador más robusta.
// 1) Envuelve el constructor de Peer (PeerJS) para añadir ping de señalización
//    frecuente, más servidores STUN y reconexión automática al servidor.
// 2) Heartbeat cada 4s sobre la conexión de datos entre jugadores: mantiene
//    vivo el mapeo NAT y evita desconexiones por inactividad.
export const buildNetResilientPatch = (meteredIceServers = []) => {
  const safeIceServers = JSON.stringify(Array.isArray(meteredIceServers) ? meteredIceServers : []);
  return `
<script>
(function(){
  if (window.__bfNetResilient) return;
  window.__bfNetResilient = true;
  var METERED_ICE_SERVERS = ${safeIceServers};
  var turnRequestSeq = 0;
  var turnPending = {};

  window.__bfSetMeteredIceServers = function(servers){
    if (Array.isArray(servers) && servers.length) METERED_ICE_SERVERS = servers;
  };

  function requestFreshIceServers(){
    return new Promise(function(resolve, reject){
      var requestId = 'turn-' + (++turnRequestSeq);
      turnPending[requestId] = { resolve: resolve, reject: reject };
      window.parent.postMessage({ bfTurnRequest: { requestId: requestId } }, '*');
      setTimeout(function(){
        if (!turnPending[requestId]) return;
        delete turnPending[requestId];
        reject(new Error('TURN timeout'));
      }, 6000);
    });
  }

  window.addEventListener('message', function(event){
    var result = event.data && event.data.bfTurnResult;
    if (!result || !turnPending[result.requestId]) return;
    var task = turnPending[result.requestId];
    delete turnPending[result.requestId];
    if (result.error) task.reject(new Error(result.error));
    else {
      window.__bfSetMeteredIceServers(result.iceServers);
      window.__bfTurnRefreshCount = (window.__bfTurnRefreshCount || 0) + 1;
      task.resolve(result.iceServers || []);
    }
  });

  // ---- (1) Peer más resistente ----
  function wrapPeer(){
    var P = window.Peer;
    if (!P || P.__bfWrapped) return;
    function BFPeer(id, opts){
      if (typeof id === 'object' && id !== null) { opts = id; id = undefined; }
      opts = opts || {};
      // Ping frecuente al servidor de señalización para que no cierre el socket.
      if (!opts.pingInterval || opts.pingInterval > 3000) opts.pingInterval = 3000;
      opts.config = opts.config || {};
      var ice = METERED_ICE_SERVERS.concat((opts.config.iceServers || []).slice());
      ['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:global.stun.twilio.com:3478'].forEach(function(u){
        var has = ice.some(function(s){ return s && (s.urls === u || (Array.isArray(s.urls) && s.urls.indexOf(u) !== -1)); });
        if (!has) ice.push({ urls: u });
      });
      opts.config.iceServers = ice;
      var p = (id === undefined) ? new P(opts) : new P(id, opts);
      // Si se pierde la conexión con el servidor de señalización, reconectar
      // automáticamente (las conexiones de datos entre jugadores no se tocan).
      p.on('disconnected', function(){
        if (p.destroyed) return;
        var tries = 0;
        (function retry(){
          if (p.destroyed || !p.disconnected || tries++ > 20) return;
          try { p.reconnect(); } catch (e) {}
          setTimeout(retry, 1500);
        })();
      });
      return p;
    }
    BFPeer.prototype = P.prototype;
    for (var k in P) { try { BFPeer[k] = P[k]; } catch (e) {} }
    BFPeer.__bfWrapped = true;
    window.Peer = BFPeer;
  }
  wrapPeer();
  var pw = setInterval(function(){ if (window.Peer && window.Peer.__bfWrapped) clearInterval(pw); else wrapPeer(); }, 200);

  // Cada intento de crear o unirse solicita credenciales Metered nuevas. Si la
  // renovación falla, se continúa con las últimas credenciales válidas.
  function installFreshRoomCredentials(){
    if (typeof window.hostCreate === 'function' && !window.hostCreate.__bfFreshTurn) {
      var originalHostCreate = window.hostCreate;
      window.hostCreate = function(){
        var self = this, args = arguments;
        requestFreshIceServers().catch(function(){}).then(function(){ originalHostCreate.apply(self, args); });
      };
      window.hostCreate.__bfFreshTurn = 1;
    }
    if (typeof window.clientJoin === 'function' && !window.clientJoin.__bfFreshTurn) {
      var originalClientJoin = window.clientJoin;
      window.clientJoin = function(){
        var self = this, args = arguments;
        requestFreshIceServers().catch(function(){}).then(function(){ originalClientJoin.apply(self, args); });
      };
      window.clientJoin.__bfFreshTurn = 1;
    }
  }
  installFreshRoomCredentials();
  var roomCredentialsTimer = setInterval(function(){
    installFreshRoomCredentials();
    if (window.hostCreate && window.hostCreate.__bfFreshTurn && window.clientJoin && window.clientJoin.__bfFreshTurn) clearInterval(roomCredentialsTimer);
  }, 200);

  // ---- (2) Heartbeat sobre la conexión de datos jugador↔jugador ----
  function bindHeartbeat(c){
    if (!c || c.__bfHb === 1) return;
    c.__bfHb = 1;
    c.__bfLastSeen = Date.now();
    try {
      c.on('data', function(m){
        c.__bfLastSeen = Date.now();
        if (m && m.t === 'bfPing') { try { c.send({ t: 'bfPong' }); } catch (e) {} }
      });
    } catch (e) {}
  }
  setInterval(function(){
    if (typeof NET === 'undefined' || !NET.conn) return;
    var c = NET.conn;
    bindHeartbeat(c);
    if (c.open) { try { c.send({ t: 'bfPing' }); } catch (e) {} }
  }, 4000);
})();
</script>
`;
};