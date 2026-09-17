// Parche inyectado en el iframe: RELAY POR SERVIDOR (sustituye a WebRTC/P2P/TURN).
//
// ESTRATEGIA: no reemplaza clientJoin/hostCreate, los ENVUELVE. Llama a la
// función original del juego (que registra conn.on('data',...) y demás
// handlers internos) y luego inyecta la conexión virtual por relay. Así el
// motor registra sus propios manejadores de mensajes y todo funciona.
//
// FakePeer sustituye a PeerJS. Cuando el juego hace new Peer() obtiene un
// FakePeer. peer.on('open',...) se dispara tras un setTimeout. peer.connect()
// devuelve una conexión virtual. peer.on('connection', onHostConn) se
// dispara cuando el invitado se une por relay.
export const SERVER_RELAY_PATCH = `
<script>
(function(){
  if (window.__bfServerRelay) return;
  window.__bfServerRelay = true;

  // ---- Bridge de relay: petición-respuesta con la página padre ----
  var pending = {}, seq = 0;
  function relayRequest(action, data) {
    return new Promise(function(resolve, reject) {
      var requestId = 'relay-' + (++seq);
      pending[requestId] = { resolve: resolve, reject: reject };
      window.parent.postMessage({ bfRelay: { requestId: requestId, payload: Object.assign({ action: action }, data || {}) } }, '*');
      setTimeout(function() {
        if (!pending[requestId]) return;
        delete pending[requestId];
        reject(new Error('timeout'));
      }, 10000);
    });
  }
  window.addEventListener('message', function(event) {
    var result = event.data && event.data.bfRelayResult;
    if (!result || !pending[result.requestId]) return;
    var task = pending[result.requestId];
    delete pending[result.requestId];
    if (result.error) task.reject(new Error(result.error));
    else task.resolve(result.data || {});
  });
  window.bfRelayRequest = relayRequest;

  // ---- Estado de relay (propio, no depende de NET que puede ser closure-local) ----
  var relayCode = '';
  var relaySide = 'p'; // 'p' host, 'g' guest
  var relayConn = null; // conexión virtual activa
  // Referencias a las funciones originales del juego (para reanudación)
  var origClientJoin = null;
  var origHostCreate = null;

  // ---- Fake Peer: evita que el motor cargue PeerJS o cree conexiones WebRTC ----
  var lastFakePeer = null;
  var lastHostCode = '';
  var lastVirtualConn = null;

  function FakePeer(id, opts) {
    this.open = true;
    this.disconnected = false;
    this.destroyed = false;
    this._cbs = { open: [], error: [], connection: [], disconnected: [] };
    lastFakePeer = this;
    // El host crea Peer('bizfan-CODE', ...): extraer el código de sala.
    if (typeof id === 'string' && id.indexOf('bizfan-') === 0) {
      lastHostCode = id.substring(7);
    }
  }
  FakePeer.prototype.on = function(ev, cb) { if (this._cbs[ev]) this._cbs[ev].push(cb); };
  FakePeer.prototype.destroy = function() { this.destroyed = true; this.open = false; };
  FakePeer.prototype.reconnect = function() { this.disconnected = false; this.open = true; };
  FakePeer.prototype._fireConnection = function(conn) { this._cbs.connection.forEach(function(cb) { try { cb(conn); } catch(e) {} }); };
  FakePeer.prototype._fireOpen = function() { this._cbs.open.forEach(function(cb) { try { cb(); } catch(e) {} }); };
  // El cliente llama peer.connect('bizfan-CODE', ...): devolver conexión virtual.
  FakePeer.prototype.connect = function(peerId, opts) {
    var code = peerId;
    if (typeof peerId === 'string' && peerId.indexOf('bizfan-') === 0) {
      code = peerId.substring(7);
    }
    var conn = createVirtualConn('g', code);
    lastVirtualConn = conn;
    return conn;
  };
  // Reemplazar Peer inmediatamente: el motor no debe intentar cargar PeerJS
  window.Peer = FakePeer;

  // ---- Conexión virtual: simula una DataConnection de PeerJS ----
  function createVirtualConn(side, code) {
    var cbs = { data: [], open: [], close: [], error: [] };
    var conn = {
      open: false,
      _side: side,
      _code: code,
      _bfEverReceivedData: false,
      _bfOpenedAt: 0,
      _bfLastSeen: 0,
      peerConnection: null,
      send: function(msg) {
        if (!msg || !code) return;
        // Los snaps (estado completo) van por 'snap'; el resto por 'send'
        if (msg.t === 'snap' || msg.t === 'bfFullSync') {
          relayRequest('snap', { code: code, side: side, snap: msg }).catch(function(){});
        } else {
          relayRequest('send', { code: code, side: side, data: msg }).catch(function(){});
        }
      },
      on: function(ev, cb) { if (cbs[ev]) cbs[ev].push(cb); },
      close: function() { conn.open = false; cbs.close.forEach(function(cb) { try { cb(); } catch(e) {} }); },
      _dispatch: function(msg) {
        conn._bfEverReceivedData = true;
        conn._bfLastSeen = Date.now();
        cbs.data.forEach(function(cb) { try { cb(msg); } catch(e) {} });
      },
      _open: function() {
        conn.open = true;
        conn._bfOpenedAt = Date.now();
        cbs.open.forEach(function(cb) { try { cb(); } catch(e) {} });
      }
    };
    return conn;
  }

  // ---- Estado de polling ----
  var pollTimer = null;
  var lastSnapSeq = 0;
  var lastMsgSeq = 0;
  var guestJoinedFired = false;
  var otherLeftShown = false;

  function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(function() {
      if (!relayCode || !relaySide) return;
      if (typeof G !== 'undefined' && G._gameOver) { stopPolling(); return; }
      relayRequest('poll', {
        code: relayCode,
        side: relaySide,
        snap_since: lastSnapSeq,
        msg_since: lastMsgSeq
      }).then(function(res) {
        if (!res || !res.ok) return;
        // Snap nuevo → dispatch a la conexión virtual
        if (res.snap && res.snap_seq > lastSnapSeq) {
          lastSnapSeq = res.snap_seq;
          if (relayConn) relayConn._dispatch(res.snap);
        }
        // Mensajes nuevos → dispatch
        if (res.msgs && res.msgs.length) {
          res.msgs.forEach(function(m) { if (relayConn) relayConn._dispatch(m.data); });
          lastMsgSeq = res.msg_seq;
        }
        // Host: detectar que el invitado se ha unido. Disparar
        // peer.on('connection', onHostConn) para que el juego registre
        // conn.on('data',...) y demás handlers.
        if (relaySide === 'p' && res.guest_joined && !guestJoinedFired) {
          guestJoinedFired = true;
          if (lastFakePeer && !relayConn) {
            var hconn = createVirtualConn('p', relayCode);
            relayConn = hconn;
            // Dispara onHostConn(conn) → el juego registra conn.on('data',...)
            lastFakePeer._fireConnection(hconn);
            // Dispara conn.on('open',...) → el juego envía el snap inicial
            hconn._open();
          }
        }
        // El otro jugador se ha desconectado
        if (res.other_left && !otherLeftShown) {
          otherLeftShown = true;
          if (typeof notif === 'function') notif('Tu rival se ha desconectado. La partida sigue en curso.');
        }
        // El otro jugador ha vuelto
        if (!res.other_left && otherLeftShown) {
          otherLeftShown = false;
          if (typeof notif === 'function') notif('✔ Tu rival ha vuelto. ¡La partida continúa!');
        }
      }).catch(function(){});
    }, 350);
  }

  // ---- ENVOLVER clientJoin: llamar al original (registra handlers) + relay ----
  function installClientJoin() {
    if (typeof window.clientJoin !== 'function' || window.clientJoin.__bfRelay) return false;
    origClientJoin = window.clientJoin;
    window.clientJoin = function(code, pass, name) {
      var joinCode = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      var joinPass = String(pass || '').trim();
      var joinName = name || 'Jugador 2';

      // Llamar al original: crea FakePeer, registra peer.on('open',...),
      // peer.connect() devuelve conexión virtual, registra conn.on('data',...)
      origClientJoin.apply(this, arguments);

      // Tras un breve retardo, disparar peer.on('open') para que el juego
      // llame peer.connect() y registre los handlers de la conexión.
      setTimeout(function() {
        if (lastFakePeer) lastFakePeer._fireOpen();
        // peer.connect() ya devolvió lastVirtualConn. Ahora hacer el join
        // por relay y abrir la conexión.
        setTimeout(function() {
          var conn = lastVirtualConn;
          if (!conn) return;
          var avUrl = '';
          try { if (window.bfMyAvatar && window.bfMyAvatar.url) avUrl = window.bfMyAvatar.url; } catch(e) {}

          relayRequest('join', {
            code: joinCode, password: joinPass,
            nick: joinName, avatar: avUrl
          }).then(function(res) {
            if (!res || res.error || !res.ok) {
              if (typeof lobbyError === 'function') lobbyError(res && res.error || 'No se pudo unir a la sala.');
              return;
            }
            // Abrir la conexión virtual → dispara conn.on('open',...) del juego
            // (el juego envía hello al host ahí).
            conn._open();
            // Aplicar snap inicial si ya existe
            if (res.snap) {
              conn._dispatch(res.snap);
            }
            relayCode = joinCode;
            relaySide = 'g';
            relayConn = conn;
            lastSnapSeq = res.snap_seq || 0;
            lastMsgSeq = res.msg_seq || 0;
            guestJoinedFired = true;
            otherLeftShown = false;
            startPolling();
          }).catch(function() {
            if (typeof lobbyError === 'function') lobbyError('No se pudo unir a la sala.');
          });
        }, 100);
      }, 50);
    };
    window.clientJoin.__bfRelay = 1;
    return true;
  }

  // ---- ENVOLVER hostCreate: llamar al original (registra handlers) + relay ----
  function installHostCreate() {
    if (typeof window.hostCreate !== 'function' || window.hostCreate.__bfRelay) return false;
    origHostCreate = window.hostCreate;
    window.hostCreate = function(name, pass, roomName) {
      // Llamar al original: crea FakePeer con 'bizfan-CODE', registra
      // peer.on('open',...) (que llama a dirRegister) y
      // peer.on('connection', onHostConn) (que registra conn.on('data',...)).
      origHostCreate.apply(this, arguments);

      // Tras un breve retardo, disparar peer.on('open') para que el juego
      // llame a dirRegister (que centralLobbyPatch envuelve para registrar
      // la sala en el backend).
      setTimeout(function() {
        if (lastFakePeer) lastFakePeer._fireOpen();
        // Iniciar el polling para detectar cuando el invitado se une.
        setTimeout(function() {
          var hostCode = lastHostCode;
          if (!hostCode) return;
          relayCode = hostCode;
          relaySide = 'p';
          relayConn = null;
          guestJoinedFired = false;
          lastSnapSeq = 0;
          lastMsgSeq = 0;
          otherLeftShown = false;
          startPolling();
        }, 200);
      }, 50);
    };
    window.hostCreate.__bfRelay = 1;
    return true;
  }

  // ---- Reanudar partida: el host (side 'p') o el invitado (side 'g') pueden
  // reanudar. Se detecta cuál es cada uno comparando su nick con resume_nicks.
  window.bfRelayResumeGame = function(code, password, nick, nicks) {
    var isHost = nicks && nicks[0] && String(nicks[0]).toLowerCase() === String(nick || '').toLowerCase();
    var side = isHost ? 'p' : 'g';
    var cleanCode = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (typeof renderLobby === 'function') renderLobby(isHost ? 'hostwait' : 'clientwait');
    if (typeof lobbyStatus === 'function') lobbyStatus('Reanudando partida…');

    var avUrl = '';
    try { if (window.bfMyAvatar && window.bfMyAvatar.url) avUrl = window.bfMyAvatar.url; } catch(e) {}

    relayRequest('resume', { code: cleanCode, side: side, password: String(password || '').trim(), nick: nick, avatar: avUrl }).then(function(res) {
      if (!res || res.error || !res.ok) {
        if (typeof lobbyError === 'function') lobbyError(res && res.error || 'No se pudo reanudar la partida.');
        return;
      }
      // Crear FakePeer y conexión virtual, registrar handlers del juego
      // llamando a la función original correspondiente.
      if (isHost) {
        // Host: llamar hostCreate original para que registre onHostConn.
        // El código ya existe (no hace falta makeCode), pero el original
        // generará uno nuevo. Lo sobreescribimos después con relayCode.
        if (typeof origHostCreate === 'function') {
          origHostCreate.call(this, nick, password, 'Reanudar');
        }
        setTimeout(function() {
          if (lastFakePeer) lastFakePeer._fireOpen();
          relayCode = cleanCode;
          relaySide = 'p';
          relayConn = null;
          guestJoinedFired = true; // ya tiene estado, no esperar invitado
          lastSnapSeq = res.snap_seq || 0;
          lastMsgSeq = res.msg_seq || 0;
          otherLeftShown = false;
          // Crear conexión virtual y disparar onHostConn
          var hconn = createVirtualConn('p', cleanCode);
          relayConn = hconn;
          if (lastFakePeer) lastFakePeer._fireConnection(hconn);
          hconn._open();
          if (res.snap) hconn._dispatch(res.snap);
          startPolling();
          if (typeof leaveLobbyForGame === 'function') leaveLobbyForGame();
        }, 100);
      } else {
        // Invitado: llamar clientJoin original para que registre handlers.
        if (typeof origClientJoin === 'function') {
          origClientJoin.call(this, cleanCode, password, nick);
        }
        setTimeout(function() {
          if (lastFakePeer) lastFakePeer._fireOpen();
          setTimeout(function() {
            var conn = lastVirtualConn;
            if (!conn) return;
            conn._open();
            if (res.snap) conn._dispatch(res.snap);
            relayCode = cleanCode;
            relaySide = 'g';
            relayConn = conn;
            lastSnapSeq = res.snap_seq || 0;
            lastMsgSeq = res.msg_seq || 0;
            guestJoinedFired = true;
            otherLeftShown = false;
            startPolling();
            if (typeof leaveLobbyForGame === 'function') leaveLobbyForGame();
          }, 100);
        }, 50);
      }
    }).catch(function() {
      if (typeof lobbyError === 'function') lobbyError('No se pudo reanudar la partida.');
    });
  };

  // ---- Intercept netDropped: en relay no hay conexión P2P que perder ----
  function installNetDropped() {
    if (typeof window.netDropped !== 'function' || window.netDropped.__bfRelay) return false;
    var orig = window.netDropped;
    window.netDropped = function() {
      // En modo relay, la "caída de red" se detecta por polling (other_left).
      // No llamamos al netDropped nativo (mostraría el modal de P2P roto).
      return;
    };
    window.netDropped.__bfRelay = 1;
    return true;
  }

  // ---- Botón "Salir": envía bye al rival y libera la sala ----
  function hookQuitButton() {
    if (window.__bfRelayQuitHooked) return;
    var btn = document.getElementById('homeBtn');
    if (!btn) return;
    window.__bfRelayQuitHooked = true;
    function showQuitConfirm(e) {
      if (typeof G === 'undefined' || !G.online || G._gameOver) return;
      if (!relayCode) return;
      if (e) { e.preventDefault(); e.stopPropagation(); }
      var qc = document.getElementById('bf-quit-confirm');
      if (!qc) {
        qc = document.createElement('div');
        qc.id = 'bf-quit-confirm';
        qc.style.cssText = 'position:fixed;z-index:100600;top:60px;right:10px;max-width:min(300px,92vw);padding:16px 18px;border-radius:14px;background:linear-gradient(180deg,#1b1430,#120d22);border:2px solid rgba(255,210,74,.55);box-shadow:0 12px 40px rgba(0,0,0,.6);font-family:Rubik,sans-serif;text-align:center';
        qc.innerHTML = '<div style="font-family:Cinzel,serif;font-weight:900;font-size:16px;color:#ffe49a;margin-bottom:6px">Salir de la partida</div><div style="font-size:13px;color:#cfc6dd;line-height:1.4;margin-bottom:14px">Tu rival será notificado y la partida terminará.</div><div style="display:flex;gap:10px;justify-content:center"><button class="bf-qc-yes" style="padding:10px 18px;border-radius:10px;border:1px solid rgba(255,240,180,.8);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600;font-family:Cinzel,serif;font-weight:900;font-size:14px;cursor:pointer">Sí, salir</button><button class="bf-qc-no" style="padding:10px 18px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#efe9dc;font-family:Cinzel,serif;font-weight:900;font-size:14px;cursor:pointer">Cancelar</button></div>';
        document.body.appendChild(qc);
        qc.querySelector('.bf-qc-yes').onclick = function() {
          try { if (relayConn) relayConn.send({ t: 'bye' }); } catch(e) {}
          relayRequest('leave', { code: relayCode, side: relaySide }).catch(function(){});
          if (window.bfLobbyRequest && relayCode) window.bfLobbyRequest('unregister', { code: relayCode }).catch(function(){});
          qc.style.display = 'none';
          setTimeout(function() { try { location.reload(); } catch(e) {} }, 200);
        };
        qc.querySelector('.bf-qc-no').onclick = function() { qc.style.display = 'none'; };
      }
      qc.style.display = 'block';
    }
    btn.addEventListener('touchstart', showQuitConfirm, { capture: true, passive: false });
    btn.addEventListener('pointerdown', function(e) { if (e.pointerType !== 'touch') showQuitConfirm(e); }, true);
    btn.addEventListener('click', function(e) { showQuitConfirm(e); }, true);
  }
  setInterval(function() { if (typeof G !== 'undefined' && G.online) hookQuitButton(); }, 1000);

  // ---- Limpieza al terminar la partida ----
  setInterval(function() {
    try {
      if (typeof G === 'undefined') return;
      if (G._gameOver && relayCode && !window.__bfRelayReleased) {
        window.__bfRelayReleased = true;
        relayRequest('leave', { code: relayCode, side: relaySide }).catch(function(){});
        if (window.bfLobbyRequest) window.bfLobbyRequest('unregister', { code: relayCode }).catch(function(){});
        stopPolling();
      }
    } catch(e) {}
  }, 2000);

  // ---- Instalar hooks ----
  var tries = 0;
  var installIv = setInterval(function() {
    var a = installHostCreate();
    var b = installClientJoin();
    var c = installNetDropped();
    if ((a && b && c) || tries++ > 200) clearInterval(installIv);
  }, 100);
  installHostCreate();
  installClientJoin();
  installNetDropped();

  // Vigilante permanente: si el motor carga PeerJS del CDN y sobrescribe
  // window.Peer, se vuelve a poner el FakePeer. Sin esto, el motor crearía
  // una conexión WebRTC real (que no funciona en el modelo de relay).
  setInterval(function() { if (window.Peer !== FakePeer) window.Peer = FakePeer; }, 200);
})();
</script>
`;