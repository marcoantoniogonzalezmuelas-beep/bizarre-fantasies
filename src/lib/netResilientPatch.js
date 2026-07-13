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
      // PeerJS interpreta un objeto en el primer argumento como un ID inválido.
      // Para clientes sin ID hay que reservar explícitamente ese argumento.
      var p = (id === undefined) ? new P(undefined, opts) : new P(id, opts);
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

  // Carga PeerJS desde un CDN alternativo si el principal está bloqueado.
  function ensurePeerJs(){
    if (window.Peer) return Promise.resolve();
    var sources = [
      'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js'
    ];
    return new Promise(function(resolve, reject){
      function next(){
        if (window.Peer) { wrapPeer(); resolve(); return; }
        var src = sources.shift();
        if (!src) { reject(new Error('PeerJS unavailable')); return; }
        var script = document.createElement('script');
        script.src = src;
        script.onload = function(){ if (window.Peer) { wrapPeer(); resolve(); } else next(); };
        script.onerror = next;
        document.head.appendChild(script);
      }
      next();
    });
  }

  // Crea la sala contra el servidor oficial de señalización con configuración
  // explícita. Cada intento renueva TURN y tiene un watchdog: también recupera
  // conexiones que quedan bloqueadas sin emitir error.
  function installReliableHostCreate(){
    if (typeof window.hostCreate !== 'function' || window.hostCreate.__bfReliableHost) return;
    window.hostCreate = function(name, pass, roomName){
      NET.role = 'host'; NET.mySide = 'p'; NET.pass = pass || ''; NET.names_self = name || 'Jugador 1';
      NET.roomName = (roomName && roomName.trim()) || randomRoomName();
      NET.code = makeCode();
      var attempt = 0;
      var retryTimer = null;

      renderLobby('hostwait');
      lobbyStatus('Preparando conexión segura…');

      function startAttempt(){
        if (NET.role !== 'host' || (NET.conn && NET.conn.open)) return;
        if (typeof dirUnregister === 'function' && typeof LOBBY !== 'undefined' && LOBBY._reg) dirUnregister();
        if (NET.peer) { try { NET.peer.destroy(); } catch (e) {} }
        if (attempt > 0) NET.code = makeCode();
        renderLobby('hostwait');
        lobbyStatus(attempt ? 'Reconectando la sala (' + attempt + ')…' : 'Creando sala…');

        requestFreshIceServers().catch(function(){}).then(function(){
          if (NET.role !== 'host' || (NET.conn && NET.conn.open)) return;
          return ensurePeerJs();
        }).then(function(){
          if (NET.role !== 'host' || (NET.conn && NET.conn.open)) return;
          var peer = new Peer('bizfan-' + NET.code, {
            debug: 1,
            host: '0.peerjs.com',
            port: 443,
            path: '/',
            secure: true
          });
          NET.peer = peer;
          var finished = false;
          var watchdog = setTimeout(function(){
            if (!finished && NET.peer === peer && !peer.open) retry(peer, 'timeout');
          }, 9000);

          function retry(failedPeer){
            if (finished || NET.peer !== failedPeer || (NET.conn && NET.conn.open)) return;
            finished = true;
            clearTimeout(watchdog);
            try { failedPeer.destroy(); } catch (e) {}
            attempt += 1;
            lobbyStatus('Recuperando conexión de la sala…');
            clearTimeout(retryTimer);
            retryTimer = setTimeout(startAttempt, Math.min(5000, 700 * attempt));
          }

          peer.on('open', function(){
            if (NET.peer !== peer) return;
            clearTimeout(watchdog);
            lobbyStatus('Registrando la sala en el servidor…');
            Promise.resolve(dirRegister(NET.code, NET.roomName, !!NET.pass)).then(function(){
              if (NET.peer !== peer) return;
              finished = true;
              renderLobby('browse');
            }).catch(function(){
              if (NET.peer !== peer) return;
              lobbyStatus('No se pudo registrar la sala. Reintentando…');
              retry(peer);
            });
          });
          peer.on('connection', function(conn){ if (NET.peer === peer) onHostConn(conn); });
          peer.on('error', function(){ retry(peer); });
        }).catch(function(){
          attempt += 1;
          lobbyStatus('Buscando otro servidor de conexión…');
          clearTimeout(retryTimer);
          retryTimer = setTimeout(startAttempt, Math.min(5000, 700 * attempt));
        });
      }
      startAttempt();
    };
    window.hostCreate.__bfReliableHost = 1;
    window.hostCreate.__bfFreshTurn = 1;
  }
  installReliableHostCreate();
  var reliableHostTimer = setInterval(function(){
    installReliableHostCreate();
    if (window.hostCreate && window.hostCreate.__bfReliableHost) clearInterval(reliableHostTimer);
  }, 200);

  // Al unirse también se renuevan las credenciales TURN antes de abrir PeerJS.
  function installFreshRoomCredentials(){
    if (typeof window.clientJoin === 'function' && !window.clientJoin.__bfFreshTurn) {
      var originalClientJoin = window.clientJoin;
      window.clientJoin = function(){
        var self = this, args = arguments;
        requestFreshIceServers().catch(function(){}).then(function(){
          ensurePeerJs().then(function(){ originalClientJoin.apply(self, args); }).catch(function(){
            if (typeof lobbyError === 'function') lobbyError('No se pudo cargar la conexión online. Inténtalo de nuevo.');
          });
        });
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