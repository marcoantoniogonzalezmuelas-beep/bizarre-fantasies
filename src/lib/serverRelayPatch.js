// Parche inyectado en el iframe: RELAY POR SERVIDOR (sustituye a WebRTC/P2P/TURN).
//
// El motor del juego usa NET.conn (PeerJS DataConnection) con .send(), .on('data'),
// .on('open'), .on('close') y .open. Aquí se reemplaza por una CONEXIÓN VIRTUAL
// que enruta .send() al servidor Base44 (gameRelay) y recibe mensajes por polling.
// El motor no nota la diferencia: sigue usando NET.conn.send(), handleIntent(),
// netSync(), etc. igual que con PeerJS — pero sin WebRTC, sin TURN, sin NAT.
//
// La restauración de partidas es trivial: el estado siempre está en el servidor.
// Si un jugador se desconecta, al volver solo tiene que hacer poll y recibe el
// estado actual. No hay localStorage, ni tokens de reanudación, ni snapshots P2P.
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

  // ---- Fake Peer: evita que el motor cargue PeerJS o cree conexiones WebRTC ----
  function FakePeer() {
    this.open = true;
    this.disconnected = false;
    this.destroyed = false;
    this._cbs = { open: [], error: [], connection: [], disconnected: [] };
  }
  FakePeer.prototype.on = function(ev, cb) { if (this._cbs[ev]) this._cbs[ev].push(cb); };
  FakePeer.prototype.destroy = function() { this.destroyed = true; this.open = false; };
  FakePeer.prototype.reconnect = function() { this.disconnected = false; this.open = true; };
  FakePeer.prototype._fireConnection = function(conn) { this._cbs.connection.forEach(function(cb) { try { cb(conn); } catch(e) {} }); };
  FakePeer.prototype._fireOpen = function() { this._cbs.open.forEach(function(cb) { try { cb(); } catch(e) {} }); };
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
      if (typeof NET === 'undefined' || !NET.code || !NET.mySide) return;
      if (typeof G !== 'undefined' && G._gameOver) { stopPolling(); return; }
      relayRequest('poll', {
        code: NET.code,
        side: NET.mySide,
        snap_since: lastSnapSeq,
        msg_since: lastMsgSeq
      }).then(function(res) {
        if (!res || !res.ok) return;
        // Snap nuevo → dispatch
        if (res.snap && res.snap_seq > lastSnapSeq) {
          lastSnapSeq = res.snap_seq;
          if (NET.conn) NET.conn._dispatch(res.snap);
        }
        // Mensajes nuevos → dispatch
        if (res.msgs && res.msgs.length) {
          res.msgs.forEach(function(m) { if (NET.conn) NET.conn._dispatch(m.data); });
          lastMsgSeq = res.msg_seq;
        }
        // Host: detectar que el invitado se ha unido. gameRelay.join ya
        // puso status='playing' y guest_name en la sala, así que NO hay que
        // llamar a register_playing (destruiría el estado del relay: snap,
        // msgs, guest_nick…).
        if (NET.role === 'host' && res.guest_joined && !guestJoinedFired) {
          guestJoinedFired = true;
          if (!NET.conn) {
            NET.conn = createVirtualConn('p', NET.code);
            if (typeof window.onHostConn === 'function') window.onHostConn(NET.conn);
            NET.conn._open();
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

  // ---- Intercept hostCreate: el host crea la sala y espera al invitado ----
  function installHostCreate() {
    if (typeof window.hostCreate !== 'function' || window.hostCreate.__bfRelay) return false;
    window.hostCreate = function(name, pass, roomName) {
      NET.role = 'host';
      NET.mySide = 'p';
      NET.pass = String(pass || '').trim();
      NET.names_self = name || 'Jugador 1';
      NET.roomName = (roomName && roomName.trim()) || (typeof randomRoomName === 'function' ? randomRoomName() : 'Sala');
      NET.code = (typeof makeCode === 'function' ? makeCode() : ('RL' + Math.random().toString(36).slice(2, 6).toUpperCase()));

      renderLobby('hostwait');
      lobbyStatus('Creando sala…');

      var avUrl = '';
      try { if (window.bfMyAvatar && window.bfMyAvatar.url) avUrl = window.bfMyAvatar.url; } catch(e) {}
      if (!avUrl && window.__bfAvatarMap) avUrl = window.__bfAvatarMap[name] || '';

      if (window.bfLobbyRequest) {
        window.bfLobbyRequest('register', {
          code: NET.code, name: name, hasPass: !!NET.pass,
          pass: NET.pass, avatar: avUrl
        }).then(function() {
          // Setea LOBBY._reg para que canShowList() devuelva true y el host
          // vea la lista de salas (sin esto, el lobby queda en blanco).
          if (typeof LOBBY !== 'undefined') {
            LOBBY._reg = { code: NET.code, name: name, hasPass: !!NET.pass, confirmed: true };
          }
          renderLobby('browse');
          // Refresca la lista INMEDIATAMENTE para que la sala aparezca sin
          // esperar al intervalo de 3 s.
          if (typeof window.refreshList === 'function') window.refreshList();
          NET.peer = new FakePeer();
          guestJoinedFired = false;
          lastSnapSeq = 0;
          lastMsgSeq = 0;
          otherLeftShown = false;
          startPolling();
        }).catch(function() {
          lobbyStatus('No se pudo crear la sala. Inténtalo de nuevo.');
        });
      }
    };
    window.hostCreate.__bfRelay = 1;
    return true;
  }

  // ---- Reanudar partida: el host (side 'p') o el invitado (side 'g') pueden
  // reanudar. Se detecta cuál es cada uno comparando su nick con resume_nicks.
  window.bfRelayResumeGame = function(code, password, nick, nicks) {
    var isHost = nicks && nicks[0] && String(nicks[0]).toLowerCase() === String(nick || '').toLowerCase();
    var side = isHost ? 'p' : 'g';

    NET.role = isHost ? 'host' : 'client';
    NET.mySide = side;
    NET.code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    NET.pass = String(password || '').trim();
    NET.names_self = nick || (isHost ? 'Jugador 1' : 'Jugador 2');

    if (typeof renderLobby === 'function') renderLobby('hostwait');
    if (typeof lobbyStatus === 'function') lobbyStatus('Reanudando partida…');

    var avUrl = '';
    try { if (window.bfMyAvatar && window.bfMyAvatar.url) avUrl = window.bfMyAvatar.url; } catch(e) {}

    relayRequest('resume', { code: NET.code, side: side, password: NET.pass, nick: nick, avatar: avUrl }).then(function(res) {
      if (!res || res.error || !res.ok) {
        if (typeof lobbyError === 'function') lobbyError(res && res.error || 'No se pudo reanudar la partida.');
        return;
      }
      NET.peer = new FakePeer();
      NET.conn = createVirtualConn(side, NET.code);
      NET.conn._open();
      if (res.snap) {
        NET.conn._dispatch(res.snap);
      }
      lastSnapSeq = res.snap_seq || 0;
      lastMsgSeq = res.msg_seq || 0;
      guestJoinedFired = true;
      otherLeftShown = false;
      startPolling();
      if (typeof leaveLobbyForGame === 'function') leaveLobbyForGame();
    }).catch(function() {
      if (typeof lobbyError === 'function') lobbyError('No se pudo reanudar la partida.');
    });
  };

  // ---- Intercept clientJoin: el invitado se une vía relay ----
  // Signatura nativa del juego: clientJoin(code, pass, name).
  function installClientJoin() {
    if (typeof window.clientJoin !== 'function' || window.clientJoin.__bfRelay) return false;
    window.clientJoin = function(code, pass, name) {
      NET.role = 'client';
      NET.mySide = 'g';
      NET.code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      NET.pass = String(pass || '').trim();
      NET.names_self = name || 'Jugador 2';

      renderLobby('hostwait');
      lobbyStatus('Uniéndose a la sala…');

      var avUrl = '';
      try { if (window.bfMyAvatar && window.bfMyAvatar.url) avUrl = window.bfMyAvatar.url; } catch(e) {}

      relayRequest('join', {
        code: NET.code, password: NET.pass,
        nick: name, avatar: avUrl
      }).then(function(res) {
        if (!res || res.error || !res.ok) {
          if (typeof lobbyError === 'function') lobbyError(res && res.error || 'No se pudo unir a la sala.');
          return;
        }
        NET.peer = new FakePeer();
        NET.conn = createVirtualConn('g', NET.code);
        NET.conn._open();
        // Enviar hello al host (via relay)
        NET.conn.send({ t: 'hello', name: name, pass: NET.pass });
        // Aplicar estado inicial si ya hay un snap
        if (res.snap) {
          NET.conn._dispatch(res.snap);
          lastSnapSeq = res.snap_seq;
        }
        lastSnapSeq = res.snap_seq || 0;
        lastMsgSeq = res.msg_seq || 0;
        guestJoinedFired = true;
        otherLeftShown = false;
        startPolling();
        // Salir del lobby y entrar en la partida
        if (typeof leaveLobbyForGame === 'function') leaveLobbyForGame();
      }).catch(function() {
        if (typeof lobbyError === 'function') lobbyError('No se pudo unir a la sala.');
      });
    };
    window.clientJoin.__bfRelay = 1;
    return true;
  }

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
      if (typeof NET === 'undefined' || !NET.role) return;
      if (e) { e.preventDefault(); e.stopPropagation(); }
      var qc = document.getElementById('bf-quit-confirm');
      if (!qc) {
        qc = document.createElement('div');
        qc.id = 'bf-quit-confirm';
        qc.style.cssText = 'position:fixed;z-index:100600;top:60px;right:10px;max-width:min(300px,92vw);padding:16px 18px;border-radius:14px;background:linear-gradient(180deg,#1b1430,#120d22);border:2px solid rgba(255,210,74,.55);box-shadow:0 12px 40px rgba(0,0,0,.6);font-family:Rubik,sans-serif;text-align:center';
        qc.innerHTML = '<div style="font-family:Cinzel,serif;font-weight:900;font-size:16px;color:#ffe49a;margin-bottom:6px">Salir de la partida</div><div style="font-size:13px;color:#cfc6dd;line-height:1.4;margin-bottom:14px">Tu rival será notificado y la partida terminará.</div><div style="display:flex;gap:10px;justify-content:center"><button class="bf-qc-yes" style="padding:10px 18px;border-radius:10px;border:1px solid rgba(255,240,180,.8);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600;font-family:Cinzel,serif;font-weight:900;font-size:14px;cursor:pointer">Sí, salir</button><button class="bf-qc-no" style="padding:10px 18px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#efe9dc;font-family:Cinzel,serif;font-weight:900;font-size:14px;cursor:pointer">Cancelar</button></div>';
        document.body.appendChild(qc);
        qc.querySelector('.bf-qc-yes').onclick = function() {
          try { if (NET.conn) NET.conn.send({ t: 'bye' }); } catch(e) {}
          relayRequest('leave', { code: NET.code, side: NET.mySide }).catch(function(){});
          if (window.bfLobbyRequest && NET.code) window.bfLobbyRequest('unregister', { code: NET.code }).catch(function(){});
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
      if (typeof G === 'undefined' || typeof NET === 'undefined') return;
      if (G._gameOver && NET.code && !window.__bfRelayReleased) {
        window.__bfRelayReleased = true;
        relayRequest('leave', { code: NET.code, side: NET.mySide }).catch(function(){});
        if (window.bfLobbyRequest) window.bfLobbyRequest('unregister', { code: NET.code }).catch(function(){});
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