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
import { RELAY_OUTBOX_PATCH } from '@/lib/relayOutboxPatch';

export const SERVER_RELAY_PATCH = RELAY_OUTBOX_PATCH + `
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
      pending[requestId].timer = setTimeout(function() {
        if (!pending[requestId]) return;
        delete pending[requestId];
        reject(new Error('timeout'));
      }, 15000);
    });
  }
  var relayRealtime = false, relayAck = [], deliveredIds = new Set(), earlyDeliveries = [];
  var pendingRelayCode = '';   // sala a la que se está entrando (join / reanudar) y aún sin relayCode
  function receiveDeliveries(deliveries){
    if(!relayConn){earlyDeliveries=earlyDeliveries.concat(deliveries);return;}
    var ack=[];
    deliveries.forEach(function(m){
      if(!m||!m.id)return;
      if(!deliveredIds.has(m.id)){deliveredIds.add(m.id);relayConn._dispatch(m.data);}
      if(relayAck.indexOf(m.id)<0)relayAck.push(m.id);
      ack.push(m.id);
    });
    if(ack.length)window.parent.postMessage({bfRelayAck:ack},'*');
  }
  function drainEarly(){var items=earlyDeliveries;earlyDeliveries=[];receiveDeliveries(items);}
  function openHostConnection(){
    if(relaySide!=='p'||!relayCode||relayConn||!lastFakePeer)return;
    guestJoinedFired=true;relayConn=createVirtualConn('p',relayCode);
    lastFakePeer._fireConnection(relayConn);relayConn._open();drainEarly();
  }
  window.addEventListener('message', function(event) {
    var result = event.data && event.data.bfRelayResult;
    if (result && pending[result.requestId]) {
      var task = pending[result.requestId];
      clearTimeout(task.timer);
      delete pending[result.requestId];
      if (result.error) task.reject(new Error(result.error));
      else task.resolve(result.data || {});
      return;
    }
    if(event.source!==window.parent)return;
    // Mensajes del canal en tiempo real: solo valen los de LA sala de esta partida. Sin esto, los
    // de la sala anterior (la página padre seguía conectada) acababan en la partida nueva.
    var fromCode=event.data&&event.data.bfRelayCode;
    if(fromCode){var mine=relayCode||pendingRelayCode;if(!mine||fromCode!==mine)return;}
    if(event.data&&event.data.bfRelayRealtimeStatus){var wasRealtime=relayRealtime;relayRealtime=event.data.bfRelayRealtimeStatus==='ready';if(wasRealtime&&!relayRealtime)wakePoll();}
    var presence=event.data&&event.data.bfRelayPresence;
    if(presence&&presence.side==='g'&&presence.connected)openHostConnection();
    var pushed=event.data&&event.data.bfRelayPush;
    if(pushed)receiveDeliveries(pushed.deliveries||[]);
  });
  window.bfRelayRequest = relayRequest;
  // Iframe recién cargado = sin sala: la página padre cierra el canal de la partida anterior.
  try { window.parent.postMessage({ bfRelayIdle: true }, '*'); } catch (e) {}

  // ---- Despertar el polling ----
  // El siguiente poll se programa al FINAL de cada ciclo con la cadencia que
  // tocaba entonces (5 s si el canal realtime estaba 'ready'). Si el canal cae
  // o el dispositivo estuvo en segundo plano, ese temporizador dormía hasta 5 s
  // (o congelado) y el turno parecía atascado. wakePoll() lo cancela y consulta
  // ya; poll() ya protege contra peticiones solapadas (inFlight).
  var wakePollFn = null;
  function wakePoll() { if (wakePollFn) wakePollFn(); }

  // ---- Partida activa: para poder reanudarla tras recargar o caerse (resumePromptPatch) ----
  function activeSave(nick) {
    try { if (window.bfActiveMatch && relayCode && relaySide) window.bfActiveMatch.save({ code: relayCode, side: relaySide, nick: nick || '' }); } catch (e) {}
  }
  window.bfRelayInfo = function() { return { code: relayCode, side: relaySide, joined: !!guestJoinedFired }; };
  document.addEventListener('visibilitychange', function() { if (!document.hidden) wakePoll(); });
  window.addEventListener('online', wakePoll);
  window.addEventListener('pageshow', wakePoll);
  window.addEventListener('focus', wakePoll);

  // ---- Reportar errores de conexión a la página padre (para el backoffice) ----
  var lastErrorReport = 0;
  function reportRelayError(errorType, action, message) {
    // Throttle: máximo un error del mismo tipo cada 5 s (evita inundar la BD
    // si el polling falla en cada ciclo de 200 ms).
    var now = Date.now();
    var key = errorType + ':' + action;
    if (window.__bfLastErrorKey === key && now - lastErrorReport < 5000) return;
    window.__bfLastErrorKey = key;
    lastErrorReport = now;
    try {
      window.parent.postMessage({
        bfRelayError: {
          room_code: relayCode || '',
          side: relaySide || '',
          nick: (typeof G !== 'undefined' && G.myNick) ? G.myNick : '',
          error_type: errorType,
          action: action || '',
          error_message: String(message || '').slice(0, 500)
        }
      }, '*');
    } catch(e) {}
  }

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
  FakePeer.prototype.destroy = function() { this.destroyed = true; this.open = false; stopPolling(); if (relayConn) relayConn.close(); };
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
    if(side==='p' && !window.__bfMatchId){window.__bfMatchId=crypto.randomUUID();window.__bfMatchRound=0;}
    var outbox = window.bfCreateRelayOutbox(relayRequest, side, code, reportRelayError);
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
        if(window.__bfMatchId)msg=Object.assign({},msg,{bfMatchId:window.__bfMatchId,bfMatchRound:window.__bfMatchRound||0});
        if (msg.t === 'intent' && /^(bid|pass|sell|bfDebtBid|bfBizarroFill|bfXferEq)$/.test(msg.op) && typeof G !== 'undefined') {
          msg = Object.assign({}, msg, { bfAuctionRound: String(G.aIndex) + ':' + String(G.subRound || 0) });
        }
        outbox.send(msg);
      },
      on: function(ev, cb) { if (cbs[ev]) cbs[ev].push(cb); },
      close: function() { conn.open = false; outbox.close(); if (relayConn === conn) stopPolling(); cbs.close.forEach(function(cb) { try { cb(); } catch(e) {} }); },
      _dispatch: function(msg) {
        if (window.bfCleanIncoming) window.bfCleanIncoming(msg);
        conn._bfEverReceivedData = true;
        conn._bfLastSeen = Date.now();
        if(side==='g'&&msg&&msg.bfMatchId){
          if(msg.t==='bfrematch'){
            if(Number(msg.bfMatchRound||0)<=Number(window.__bfMatchRound||0))return;
            if(typeof window.bfPrepareRematch==='function')window.bfPrepareRematch();
            window.__bfMatchId=msg.bfMatchId;window.__bfMatchRound=msg.bfMatchRound;return;
          }
          if(!window.__bfMatchId){window.__bfMatchId=msg.bfMatchId;window.__bfMatchRound=msg.bfMatchRound||0;}
        }
        if(msg&&msg.bfMatchId&&window.__bfMatchId&&msg.bfMatchId!==window.__bfMatchId){window.__bfMatchDrops=(window.__bfMatchDrops||0)+1;if(window.__bfMatchDrops===3||window.__bfMatchDrops%50===0)reportRelayError('match_id_mismatch','dispatch','drops='+window.__bfMatchDrops+' side='+side+' t='+String(msg.t||''));return;}
        window.__bfMatchDrops=0;
        if (side === 'p' && msg && msg.bfAuctionRound && typeof G !== 'undefined') {
          if (!document.querySelector('#s-recruit.active') || G.phaseResult || msg.bfAuctionRound !== String(G.aIndex) + ':' + String(G.subRound || 0)) {
            if (typeof netSync === 'function') { var active = document.querySelector('.screen.active'); if (active) netSync(active.id); }
            return;
          }
        }
        cbs.data.forEach(function(cb) { try { cb(msg); } catch(e) { reportRelayError('server_error', 'dispatch', e && e.message); } });
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
  var lastPollOk = 0;
  var guestJoinedFired = false;
  var otherLeftShown = false;

  var pollGeneration = 0;
  function stopPolling() { pollGeneration++; clearTimeout(pollTimer); pollTimer = null; wakePollFn = null; }

  function startPolling() {
    stopPolling();
    var generation = pollGeneration, failures = 0;
    var code = relayCode, side = relaySide;
    var inFlight = false;
    function poll() {
      if (generation !== pollGeneration || !code || !side || inFlight) return;
      // Keep the session alive on the result screen: rematches reuse it.
      inFlight = true;
      var pollStartedAt = Date.now();
      var sentAck = relayAck.slice(0, 100), hasMore = false;
      relayRequest('poll', { code: code, side: side, protocol: 2, ack: sentAck }).then(function(res) {
        if (generation !== pollGeneration) return;
        if (!res || !res.ok) throw new Error((res && res.error) || 'Consulta no confirmada');
        lastPollOk = Date.now(); failures = 0; hasMore = !!res.more;
        relayAck = relayAck.filter(function(id){ return sentAck.indexOf(id) < 0; });
        // Register the native host listeners BEFORE consuming the guest hello.
        if(side==='p'&&res.guest_joined&&!guestJoinedFired&&lastFakePeer)openHostConnection();
        receiveDeliveries(res.deliveries||[]);
        try { if (window.bfOnRivalAway) window.bfOnRivalAway(res.other_away_ms || 0, !!res.match_over, res.forfeit_after_ms || 300000); } catch (e) {}
        if (res.other_left && !otherLeftShown) {
          otherLeftShown = true;
          if (typeof notif === 'function') notif('Tu rival se ha desconectado. La partida sigue en curso.');
        } else if (!res.other_left && otherLeftShown) {
          otherLeftShown = false;
          if (typeof notif === 'function') notif('Tu rival ha vuelto. La partida continúa.');
        }
      }).catch(function(err) {
        failures++;
        reportRelayError('poll_failed', 'poll', err && err.message || 'timeout');
        if (err && /Room not found/i.test(err.message)) {
          stopPolling();
          if (typeof notif === 'function') notif('La sala ya no existe. Vuelve al inicio para crear otra partida.');
        }
      }).finally(function() {
        if (generation !== pollGeneration) return;
        inFlight = false;
        // Short active-play waits on BOTH ends, without overlapping requests.
        // Idle lobbies stay inexpensive; errors retain exponential backoff.
        var playing = !!document.querySelector('#s-battle.active,#s-recruit.active,#s-equip.active');
        // Pace request STARTS rather than adding 200ms after every network trip.
        // At most five active polls/second, one in flight, unchanged error backoff.
        // WebSocket is the primary path; polling remains a slow recovery/heartbeat.
        var cadence = relayRealtime ? 5000 : (playing ? 200 : 1000);
        var delay = failures ? Math.min(8000, 1000 * Math.pow(2, failures - 1))
          : hasMore ? 0 : Math.max(0, cadence - (Date.now() - pollStartedAt));
        pollTimer = setTimeout(poll, delay);
      });
    }
    wakePollFn = function() {
      if (generation !== pollGeneration || inFlight) return;
      clearTimeout(pollTimer); pollTimer = null;
      poll();
    };
    poll();
  }

  // ---- ENVOLVER clientJoin: llamar al original (registra handlers) + relay ----
  // Flag persistente: una vez envuelto, NO se vuelve a envolver aunque el
  // centralLobbyPatch cree un wrapper nuevo (sin __bfRelay) encima. Sin esto,
  // el intervalo re-envuelve y sobreescribe origClientJoin (variable de módulo)
  // creando un ciclo: relay_wrapper → lobby_wrapper → relay_wrapper → ... →
  // stack overflow.
  var connectionAttempt = 0;
  function waitForCreatedPeer(previous, attempt, ready) {
    var deadline = Date.now() + 15000;
    function check() {
      if (attempt !== connectionAttempt) return;
      if (lastFakePeer && lastFakePeer !== previous && !lastFakePeer.destroyed) { ready(lastFakePeer); return; }
      if (Date.now() < deadline) setTimeout(check, 100);
    }
    setTimeout(check, 0);
  }
  var relayClientJoinDone = false;
  function installClientJoin() {
    if (relayClientJoinDone) return true;
    if (typeof window.clientJoin !== 'function' || window.clientJoin.__bfRelay) return false;
    relayClientJoinDone = true;
    origClientJoin = window.clientJoin;
    window.clientJoin = function(code, pass, name) {
      var joinCode = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      var joinPass = String(pass || '').trim();
      var joinName = name || 'Jugador 2';
      stopPolling();
      if (relayConn) relayConn.close();
      relayConn = null;
      relayRealtime = false; relayAck = []; deliveredIds = new Set(); earlyDeliveries=[];
      window.__bfMatchId='';window.__bfMatchRound=0;window.__bfRelayReleased=false;
      pendingRelayCode = joinCode; relayCode = '';
      if (window.bfNewMatchEpoch) window.bfNewMatchEpoch('join');

      var previous = lastFakePeer, attempt = ++connectionAttempt;
      origClientJoin.apply(this, arguments);
      waitForCreatedPeer(previous, attempt, function(peer) {
        peer._fireOpen();
        // The original listener synchronously creates and binds the connection.
        (function() {
          var conn = lastVirtualConn;
          if (!conn) return;
          var avUrl = '';
          try { if (window.bfMyAvatar && window.bfMyAvatar.url) avUrl = window.bfMyAvatar.url; } catch(e) {}

          relayRequest('join', {
            code: joinCode, password: joinPass,
            nick: joinName, avatar: avUrl
          }).then(function(res) {
            if (attempt !== connectionAttempt || peer.destroyed) return;
            if (!res || res.error || !res.ok) {
              reportRelayError('join_failed', 'join', (res && res.error) || 'No se pudo unir a la sala');
              if (typeof lobbyError === 'function') lobbyError(res && res.error || 'No se pudo unir a la sala.');
              return;
            }
            // El servidor recuerda el id de la partida en curso: se adopta de ahí, no del primer
            // mensaje que llegue (que podía ser un resto de la sala anterior).
            if (res.match_id) { window.__bfMatchId = res.match_id; window.__bfMatchRound = res.match_round || 0; }
            // Abrir la conexión virtual → dispara conn.on('open',...) del juego
            // (el juego envía hello al host ahí).
            conn._open();
            // Aplicar snap inicial si ya existe
            if (res.snap) {
              conn._dispatch(res.snap);
            }
            relayCode = joinCode;
            relaySide = 'g';
            activeSave(joinName);
            relayConn = conn;
            drainEarly();
            lastSnapSeq = res.snap_seq || 0;
            lastMsgSeq = res.msg_seq || 0;
            guestJoinedFired = true;
            otherLeftShown = false;
            startPolling();
          }).catch(function(err) {
            reportRelayError('join_failed', 'join', err && err.message || 'timeout');
            if (typeof lobbyError === 'function') lobbyError('No se pudo unir a la sala.');
          });
        })();
      });
    };
    window.clientJoin.__bfRelay = 1;
    return true;
  }

  // ---- ENVOLVER hostCreate: llamar al original (registra handlers) + relay ----
  // Flag persistente: una vez envuelto, NO se vuelve a envolver aunque el
  // centralLobbyPatch cree un wrapper nuevo (sin __bfRelay) encima. Sin esto,
  // el intervalo re-envuelve y sobreescribe origHostCreate (variable de módulo)
  // creando un ciclo: relay_wrapper → lobby_wrapper → relay_wrapper → ... →
  // stack overflow.
  var relayHostCreateDone = false;
  function installHostCreate() {
    if (relayHostCreateDone) return true;
    if (typeof window.hostCreate !== 'function' || window.hostCreate.__bfRelay) return false;
    relayHostCreateDone = true;
    origHostCreate = window.hostCreate;
    window.hostCreate = function(name, pass, roomName) {
      stopPolling();
      if (relayConn) relayConn.close();
      relayConn = null;
      relayRealtime = false; relayAck = []; deliveredIds = new Set(); earlyDeliveries=[];
      window.__bfMatchId='';window.__bfMatchRound=0;window.__bfRelayReleased=false;
      pendingRelayCode = ''; relayCode = '';
      if (window.bfNewMatchEpoch) window.bfNewMatchEpoch('host');
      var previous = lastFakePeer, attempt = ++connectionAttempt;
      origHostCreate.apply(this, arguments);

      // Wait for asynchronous nick verification, then confirmed room creation.
      waitForCreatedPeer(previous, attempt, function(peer) {
        peer._fireOpen();
        var hostCode = lastHostCode, registration = window.__bfRoomRegistration;
        if (!registration || registration.code !== hostCode) return;
        registration.promise.then(function(res) {
          if (!res || !res.ok || attempt !== connectionAttempt || peer.destroyed || peer !== lastFakePeer) return;
          relayCode = hostCode; relaySide = 'p'; relayConn = null;
          activeSave(name);
          var mp=window.bfMissionMpConfig;
          if(mp&&mp.role==='host')window.parent.postMessage({bfMissionMpHosted:{game_code:hostCode,run_id:mp.run_id}},'*');
          guestJoinedFired = false; otherLeftShown = false;
          startPolling();
          if (typeof window.renderRoomList === 'function') window.renderRoomList();
          if (typeof window.refreshList === 'function') window.refreshList();
        });
      });
    };
    window.hostCreate.__bfRelay = 1;
    return true;
  }

  // ---- Reanudar partida: el host (side 'p') o el invitado (side 'g') pueden
  // reanudar. Se detecta cuál es cada uno comparando su nick con resume_nicks.
  // sideOverride ('p'|'g'): lado guardado de la partida activa (más fiable que comparar nicks).
  // proof: contraseña para demostrar identidad desde otro dispositivo (sala o nick).
  window.bfRelayResumeGame = function(code, password, nick, nicks, sideOverride, proof) {
    stopPolling();
    if (relayConn) relayConn.close();
    relayConn = null;
    relayRealtime = false; relayAck = []; deliveredIds = new Set();
    var isHost = (sideOverride === 'p' || sideOverride === 'g') ? sideOverride === 'p'
      : !!(nicks && nicks[0] && String(nicks[0]).toLowerCase() === String(nick || '').toLowerCase());
    var side = isHost ? 'p' : 'g';
    var cleanCode = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    pendingRelayCode = cleanCode; relayCode = '';
    if (window.bfNewMatchEpoch) window.bfNewMatchEpoch('resume');

    if (typeof renderLobby === 'function') renderLobby(isHost ? 'hostwait' : 'clientwait');
    if (typeof lobbyStatus === 'function') lobbyStatus('Reanudando partida…');

    var avUrl = '';
    try { if (window.bfMyAvatar && window.bfMyAvatar.url) avUrl = window.bfMyAvatar.url; } catch(e) {}

    relayRequest('resume', { code: cleanCode, side: side, password: String(password || '').trim(), nick: nick, nick_password: String(proof || ''), avatar: avUrl }).then(function(res) {
      if (!res || res.error || !res.ok) {
        reportRelayError('resume_failed', 'resume', (res && res.error) || 'No se pudo reanudar');
        if (typeof lobbyError === 'function') lobbyError(res && res.error || 'No se pudo reanudar la partida.');
        return;
      }
      // Id de la partida en curso (lo guarda el servidor): sin él, el anfitrión que recarga genera
      // uno nuevo y el invitado descarta todos sus mensajes por "partida distinta".
      window.__bfMatchId = res.match_id || ''; window.__bfMatchRound = res.match_round || 0;
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
          activeSave(nick);
          if (lastFakePeer) lastFakePeer._fireConnection(hconn);
          hconn._open();
          if (res.snap) hconn._dispatch(res.snap);
          ensureHostRestored(res.snap);
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
            activeSave(nick);
            relayConn = conn;
            drainEarly();
            lastSnapSeq = res.snap_seq || 0;
            lastMsgSeq = res.msg_seq || 0;
            guestJoinedFired = true;
            otherLeftShown = false;
            startPolling();
            if (typeof leaveLobbyForGame === 'function') leaveLobbyForGame();
          }, 100);
        }, 50);
      }
    }).catch(function(err) {
      var msg = (err && err.message) || '';
      reportRelayError('resume_failed', 'resume', msg || 'timeout');
      var say = function(t) { if (typeof lobbyError === 'function') lobbyError(t); };
      // Sin token (otro dispositivo) o contraseña de sala equivocada: pedir prueba de identidad.
      if (/Unauthorized|Wrong password/i.test(msg)) {
        if (!proof && window.bfAskResumeProof) {
          window.bfAskResumeProof(function(p) { window.bfRelayResumeGame(code, p, nick, nicks, sideOverride, p); });
          return;
        }
        say('Contraseña incorrecta.'); return;
      }
      if (/Too many attempts/i.test(msg)) { say('Demasiados intentos. Espera un momento.'); return; }
      if (/Match over|Room expired|Room not found|not in progress/i.test(msg)) {
        try { if (window.bfActiveMatch) window.bfActiveMatch.clear(); } catch (e) {}
        say('La partida ya terminó o caducó.'); return;
      }
      say('No se pudo reanudar la partida.');
    });
  };

  // Red de seguridad del ANFITRIÓN: él tiene la partida en memoria, así que al reanudar debe
  // reconstruirla desde el último snapshot del servidor. Se le entrega como mensaje (arriba),
  // pero el manejador del anfitrión del motor puede ignorarlo; si tras 1,5 s no se ha pasado a
  // una pantalla de partida, se aplica directamente con applySnapshot (y queda registrado en
  // los diagnósticos para saber si hizo falta).
  var GAME_SCREENS = ['s-recruit', 's-equip', 's-battle', 's-result'];
  function ensureHostRestored(snap) {
    if (!snap) return;
    setTimeout(function() {
      try {
        var a = document.querySelector('.screen.active');
        if (a && GAME_SCREENS.indexOf(a.id) >= 0) return;
        if (typeof window.applySnapshot !== 'function') return;
        var s = (snap && snap.screen) ? snap : (snap.snap || snap.s || snap.d || snap);
        window.applySnapshot(s);
        reportRelayError('host_restore_fallback', 'resume', 'snapshot applied directly');
      } catch (e) { reportRelayError('host_restore_failed', 'resume', e && e.message); }
    }, 1500);
  }

  // ---- Intercept netDropped: en relay no hay conexión P2P que perder ----
  var relayNetDroppedDone = false;
  function installNetDropped() {
    if (relayNetDroppedDone) return true;
    if (typeof window.netDropped !== 'function' || window.netDropped.__bfRelay) return false;
    relayNetDroppedDone = true;
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
          try { if (window.bfActiveMatch) window.bfActiveMatch.clear(); } catch(e) {}
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

  // A result is not a disconnect. Only explicit exit/room cancellation closes
  // the session; heartbeats and delivery must continue for the next auction.

  // ---- Instalar hooks ----
  // Las funciones devuelven true cuando ya están instaladas (envoltura nueva o
  // previa), para que el intervalo termine cuanto antes.
  var tries = 0;
  var installIv = setInterval(function() {
    var a = installHostCreate();
    var b = installClientJoin();
    var c = installNetDropped();
    if ((a && b && c) || tries++ > 200) clearInterval(installIv);
  }, 100);

  // Vigilante permanente: si el motor carga PeerJS del CDN y sobrescribe
  // window.Peer, se vuelve a poner el FakePeer. Sin esto, el motor crearía
  // una conexión WebRTC real (que no funciona en el modelo de relay).
  setInterval(function() { if (window.Peer !== FakePeer) window.Peer = FakePeer; }, 200);
})();
</script>
`;