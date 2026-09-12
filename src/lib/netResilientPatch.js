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

  // Relay de respaldo embebido en el propio juego: si el puente de credenciales
  // falla (servidor TURN caído, cuota agotada, red que bloquea la petición), el
  // navegador SIGUE teniendo un relay TCP/443 + TLS/443 que probar. Sin relay,
  // en operadores con CGNAT (Vodafone, Orange, datos móviles) la partida no
  // arranca nunca: la conexión directa es imposible.
  var FALLBACK_ICE = [
    { urls:'turn:openrelay.metered.ca:443', username:'openrelayproject', credential:'openrelayproject' },
    { urls:'turn:openrelay.metered.ca:443?transport=tcp', username:'openrelayproject', credential:'openrelayproject' },
    { urls:'turns:openrelay.metered.ca:443', username:'openrelayproject', credential:'openrelayproject' },
    { urls:'turn:openrelay.metered.ca:80', username:'openrelayproject', credential:'openrelayproject' }
  ];

  // Redes que ya demostraron necesitar relay: se recuerda ENTRE PARTIDAS y
  // sesiones. Antes solo se detectaba durante la partida en curso y a la
  // segunda caída, así que el primer intento en Vodafone/Orange fallaba
  // siempre y el jugador no llegaba ni a empezar.
  try { if (localStorage.getItem('bfForceRelay') === '1') window.__bfForceRelay = 1; } catch (e) {}
  window.__bfMarkForceRelay = function(){
    window.__bfForceRelay = 1;
    try { localStorage.setItem('bfForceRelay', '1'); } catch (e) {}
  };

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

  // Expuesto para otros parches (reconexión): renueva credenciales TURN.
  window.__bfFreshIce = requestFreshIceServers;

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
      // Fuerza el MISMO servidor de señalización que usa el host
      // (0.peerjs.com:443). El clientJoin nativo del juego podría no
      // especificar servidor y usar un default distinto, lo que impediría
      // que host y cliente se encontraran. Solo se aplica si el llamador
      // no especificó uno explícitamente.
      if (!opts.host) opts.host = '0.peerjs.com';
      if (!opts.port) opts.port = 443;
      if (!opts.path) opts.path = '/';
      if (opts.secure === undefined) opts.secure = true;
      opts.config = opts.config || {};
      // TURN primero (relay). En operadores móviles con CGNAT (Vodafone y
      // similares) los candidatos host/STUN abren la conexión pero la tiran al
      // segundo: el NAT simétrico rompe el mapeo en cuanto cambia el puerto.
      // Forzar relay enruta TODO el tráfico por el servidor TURN, que es estable
      // a través de cualquier NAT. Los STUN se conservan como respaldo.
      var turn = [], stun = [];
      METERED_ICE_SERVERS.concat(FALLBACK_ICE).concat((opts.config.iceServers || []).slice()).forEach(function(s){
        if (!s || !s.urls) return;
        var u = Array.isArray(s.urls) ? s.urls.join(' ') : String(s.urls);
        if (/turn/i.test(u)) turn.push(s); else stun.push(s);
      });
      ['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302','stun:stun3.l.google.com:19302','stun:stun4.l.google.com:19302','stun:global.stun.twilio.com:3478','stun:stun.sipgate.net:3478','stun:stun.ekiga.net:3478'].forEach(function(u){
        var has = stun.some(function(s){ return s && (s.urls === u || (Array.isArray(s.urls) && s.urls.indexOf(u) !== -1)); });
        if (!has) stun.push({ urls: u });
      });
      // Orden de preferencia del relay: TLS/443 TCP primero (atraviesa
      // cortafuegos y CGNAT de operadores móviles como Vodafone), luego 443,
      // luego TCP/80 y por último UDP.
      function rank(s){
        var u = Array.isArray(s.urls) ? s.urls.join(' ') : String(s.urls || '');
        if (/^turns:/i.test(u)) return 0;
        if (/:443/.test(u) && /transport=tcp/i.test(u)) return 1;
        if (/:443/.test(u)) return 2;
        if (/transport=tcp/i.test(u)) return 3;
        return 4;
      }
      turn.sort(function(a, b){ return rank(a) - rank(b); });
      opts.config.iceServers = turn.concat(stun);
      // Política ICE 'all' por defecto: ICE prueba directo Y relay a la vez y
      // elige el par que funcione, así el TURN solo consume tráfico cuando la
      // red lo necesita de verdad. Antes se forzaba 'relay' SIEMPRE: TODO el
      // tráfico de TODAS las partidas pasaba por el TURN gratuito de Metered
      // (cuota mensual limitada) y, al agotarse la cuota a mitad de mes, las
      // conexiones caían para todos. Para el caso CGNAT (la conexión directa
      // "abre" y se cae al segundo), watchIce detecta esas caídas tempranas y
      // activa __bfForceRelay: a partir de ahí la sesión usa solo relay.
      if (turn.length) opts.config.iceTransportPolicy = window.__bfForceRelay ? 'relay' : 'all';
      opts.config.iceCandidatePoolSize = 4;
      opts.config.sdpSemantics = 'unified-plan';
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
      NET.role = 'host'; NET.mySide = 'p'; NET.pass = String(pass || '').trim(); NET.names_self = name || 'Jugador 1';
      NET.roomName = (roomName && roomName.trim()) || randomRoomName();
      NET.code = makeCode();
      var attempt = 0;
      var retryTimer = null;
      // La política ICE la decide __bfForceRelay (relay pegajoso si la red de
      // este jugador ya demostró que la conexión directa no aguanta). No se
      // resetea al crear sala: si la red necesitaba relay, lo sigue necesitando.

      renderLobby('hostwait');
      lobbyStatus('Preparando conexión segura…');

      function startAttempt(){
        if (NET.role !== 'host' || (NET.conn && NET.conn.open)) return;
        if (typeof dirUnregister === 'function' && typeof LOBBY !== 'undefined' && LOBBY._reg) dirUnregister();
        if (NET.peer) { try { NET.peer.destroy(); } catch (e) {} }
        if (attempt > 0) NET.code = makeCode();
        // Si el primer intento de abrir la sala falló, esta red tampoco va a
        // aguantar la conexión directa con el invitado: se pasa a relay.
        if (attempt > 0 && window.__bfMarkForceRelay) window.__bfMarkForceRelay();
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

  // Al unirse: credenciales TURN frescas + VIGILANTE DE INTENTO. El anfitrión
  // ya tenía reintentos y watchdog, pero al UNIRSE solo se llamaba una vez a
  // clientJoin: si la negociación se quedaba colgada (lo normal en operadores
  // con CGNAT como Vodafone u Orange, donde el primer intento directo no llega
  // a abrir el canal), el jugador se quedaba en «Conectando…» para siempre y no
  // llegaba a empezar la partida. Ahora cada intento tiene 9s; si no abre, se
  // fuerza relay (TURN) y se reintenta, hasta 4 veces.
  function installFreshRoomCredentials(){
    if (typeof window.clientJoin === 'function' && !window.clientJoin.__bfFreshTurn) {
      var originalClientJoin = window.clientJoin;
      window.clientJoin = function(code, pass, name){
        var self = this;
        var joined = false;
        var attempt = 0;
        var watchdog = null;

        // Establece NET.role='client' INMEDIATAMENTE, antes de pedir las
        // credenciales TURN (que son asíncronas). Sin esto, el intervalo
        // openWatch (500ms) comprobaba abandoned() antes de que el
        // clientJoin nativo tuviera tiempo de fijar NET.role, lo cancelaba
        // todo y el invitado se quedaba en "Conectando…" sin reintentos.
        try { if (typeof NET !== 'undefined' && !NET.role) NET.role = 'client'; } catch (e) {}

        try{
          var jc=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
          if(typeof NET!=='undefined'&&jc){NET._bfJoin={code:jc,pass:String(pass||'').trim(),name:name||''};NET.code=jc;NET.pass=String(pass||'').trim();}
        }catch(e){}

        function connected(){
          // Solo se considera "conectado" si la conexión está abierta Y hemos
          // recibido datos. Entre ISPs distintos (Jazztel↔Vodafone) la conexión
          // abre (signaling) pero el CGNAT bloquea los datos: sin esta
          // verificación, el juego arranca y se cae a los pocos segundos.
          try { return !!(typeof NET !== 'undefined' && NET.conn && NET.conn.open && NET.conn.__bfEverReceivedData); } catch (e) { return false; }
        }
        // El jugador canceló o volvió al lobby: no seguimos reintentando.
        // Solo se considera abandonado si NET.role es explícitamente 'host'
        // (el jugador volvió atrás y creó una sala). Si NET.role es
        // undefined/null/'client', seguimos esperando (puede que el
        // clientJoin nativo aún no lo haya fijado).
        function abandoned(){
          try {
            if (typeof NET === 'undefined') return true;
            return NET.role === 'host';
          } catch (e) { return true; }
        }

        function tryJoin(){
          if (joined || connected()) return;
          attempt += 1;
          // Del segundo intento en adelante TODO va por relay: si el directo no
          // abrió, esta red no lo permite.
          if (attempt > 1 && window.__bfMarkForceRelay) window.__bfMarkForceRelay();
          if (attempt > 1) {
            // Cierra la conexión anterior antes de reintentar: entre ISPs
            // distintos la conexión "abre" pero no pasa nada, y si no la
            // cerramos el reintento no puede crear una nueva.
            try { if (NET.conn) NET.conn.close(); } catch (e) {}
            try { if (NET.peer) NET.peer.destroy(); } catch (e) {}
            NET.conn = null; NET.peer = null;
            if (typeof lobbyStatus === 'function') lobbyStatus('Conexión directa bloqueada entre operadores. Reintentando por servidor seguro (' + (attempt - 1) + ')…');
          }

          requestFreshIceServers().catch(function(){}).then(function(){
            if (joined || connected() || abandoned()) return;
            return ensurePeerJs();
          }).then(function(){
            if (joined || connected() || abandoned()) return;
            originalClientJoin.call(self, code, pass, name);
            clearTimeout(watchdog);
            // El primer intento (directo) tiene 6 s: si no abre o no fluyen
            // datos, se reintenta con relay. Los reintentos (relay) necesitan
            // más tiempo: la negociación TURN es más lenta.
            var watchdogMs = attempt === 1 ? 6000 : 12000;
            watchdog = setTimeout(function(){
              if (joined || connected() || abandoned()) { joined = connected(); return; }
              if (attempt >= 4) {
                if (typeof lobbyError === 'function') lobbyError('No se ha podido conectar con la sala. Tu red puede estar bloqueando las partidas online: prueba con otra red (Wi-Fi en vez de datos, o al contrario) y vuelve a intentarlo.');
                return;
              }
              tryJoin();
            }, watchdogMs);
          }).catch(function(){
            if (joined || connected() || abandoned()) return;
            if (attempt >= 4) {
              if (typeof lobbyError === 'function') lobbyError('No se pudo cargar la conexión online. Inténtalo de nuevo.');
              return;
            }
            clearTimeout(watchdog);
            watchdog = setTimeout(tryJoin, 800 * attempt);
          });
        }

        // En cuanto el canal con el rival abre Y los datos fluyen, se cancela
        // el vigilante. Si la conexión abre pero no llegan datos (cross-ISP con
        // CGNAT), el vigilante sigue activo y el watchdog reintenta con relay.
        var openWatch = setInterval(function(){
          if (typeof NET !== 'undefined' && NET.conn) bindHeartbeat(NET.conn);
          if (connected()) { joined = true; clearTimeout(watchdog); clearInterval(openWatch); }
          else if (abandoned()) { clearTimeout(watchdog); clearInterval(openWatch); }
        }, 500);
        setTimeout(function(){ clearInterval(openWatch); }, 60000);

        tryJoin();
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
  // Además del latido, verifica que los DATOS realmente fluyen. Entre ISPs
  // distintos (Jazztel ↔ Vodafone) el signaling de PeerJS abre la conexión
  // (iceConnectionState='connected') pero el CGNAT bloquea el tráfico de datos
  // entre las dos redes: la conexión aparece "abierta" pero ningún paquete
  // llega al otro lado. Sin esta verificación, el juego arranca y a los pocos
  // segundos se cae sin que el jugador entienda por qué.
  function bindHeartbeat(c){
    if (!c || c.__bfHb === 1) return;
    c.__bfHb = 1;
    c.__bfLastSeen = Date.now();
    c.__bfEverReceivedData = false;
    c.__bfOpenedAt = Date.now();
    try {
      c.on('data', function(m){
        c.__bfLastSeen = Date.now();
        c.__bfEverReceivedData = true;
        if (m && m.t === 'bfPing') { try { c.send({ t: 'bfPong' }); } catch (e) {} }
      });
    } catch (e) {}
  }
  setInterval(function(){
    if (typeof NET === 'undefined' || !NET.conn) return;
    var c = NET.conn;
    bindHeartbeat(c);
    watchIce(c);
    if (c.open) {
      // Verificación de flujo de datos: si la conexión lleva abierta más de 8 s
      // y NO hemos recibido NINGÚN dato, el canal está roto (cross-ISP con
      // CGNAT: el signaling abre pero los datos no pasan). Se fuerza relay y
      // se cierra para que el reintento use solo TURN.
      if (!c.__bfEverReceivedData && c.__bfOpenedAt && Date.now() - c.__bfOpenedAt > 8000) {
        if (window.__bfMarkForceRelay) window.__bfMarkForceRelay();
        try { c.close(); } catch (e) {}
        return;
      }
      // Si recibíamos datos pero llevamos 12 s sin NINGÚN paquete (ni siquiera
      // el pong del latido), la ruta de red se rompió silenciosamente. Se
      // fuerza relay y se cierra para reconectar por TURN.
      if (c.__bfEverReceivedData && c.__bfLastSeen && Date.now() - c.__bfLastSeen > 12000) {
        if (window.__bfMarkForceRelay) window.__bfMarkForceRelay();
        try { c.close(); } catch (e) {}
        return;
      }
      try { c.send({ t: 'bfPing' }); } catch (e) {}
    }
  }, 4000);

  // ---- (3) Vigilancia del transporte ICE ----
  // Si la ruta de red se rompe (cambio de celda, NAT que expira, Wi-Fi↔datos),
  // se pide un reinicio de ICE en caliente: recupera la conexión sin cortar la
  // partida. Solo si ICE falla del todo se cierra para que actúe la reconexión.
  function watchIce(c){
    var pc = c && c.peerConnection;
    if (!pc || pc.__bfIceWatch) return;
    pc.__bfIceWatch = 1;
    var connectedAt = 0;
    // Caída temprana = la conexión directa "abrió" pero murió en <12s (patrón
    // típico del cross-ISP con CGNAT: Jazztel↔Vodafone, móvil↔fija…). El
    // signaling abre la conexión pero el CGNAT bloquea el tráfico entre las
    // dos redes a los pocos segundos. Se fuerza relay cuanto antes.
    function noteEarlyDrop(){
      if (!connectedAt || Date.now() - connectedAt > 12000) return;
      window.__bfEarlyDrops = (window.__bfEarlyDrops || 0) + 1;
      // Una sola caída temprana ya basta: es la firma inequívoca del CGNAT.
      // Esperar a la segunda dejaba al jugador con la partida cortada.
      if (window.__bfMarkForceRelay) window.__bfMarkForceRelay();
    }
    pc.addEventListener('iceconnectionstatechange', function(){
      var st = pc.iceConnectionState;
      if (st === 'connected' || st === 'completed') {
        if (!connectedAt) connectedAt = Date.now();
      } else if (st === 'disconnected') {
        setTimeout(function(){
          if (pc.iceConnectionState !== 'disconnected') return;
          try { if (pc.restartIce) pc.restartIce(); } catch (e) {}
        }, 2000);
      } else if (st === 'failed') {
        noteEarlyDrop();
        try { if (pc.restartIce) pc.restartIce(); } catch (e) {}
        setTimeout(function(){
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') return;
          try { c.close(); } catch (e) {}
        }, 4000);
      }
    });
  }
})();
</script>
`;
};