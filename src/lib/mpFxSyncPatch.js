// Parche inyectado en el iframe: sincroniza los eventos de animación de
// batalla (flushFx) del anfitrión al cliente en partidas multiplayer.
//
// El anfitrión procesa flushFx (ataques, hechizos, efectos nativos como
// muerte/élite/curación/transformación) y lo envía al cliente por la conexión
// de datos (PeerJS). El cliente lo recibe y lo reprocesa con su propio
// flushFx para que ambos jugadores vean TODAS las animaciones.
//
// Las animaciones de habilidades (abilityFxPatch / epicAbilityFxPatch) ya
// funcionan en ambos lados porque usan un escaneo de estado (abilityUsed en
// G.team, que viaja en el snapshot online). Este parche cubre el resto:
// ataques, hechizos, objetos nativos y cualquier pushFx del juego.
export const MP_FX_SYNC_PATCH = `
<script>
(function(){
  if (window.__bfMpFxSync) return;
  window.__bfMpFxSync = true;

  // Cola de eventos fx pendientes de enviar al cliente (host).
  var pendingFx = [];
  var sendTimer = null;

  // Los eventos fx del motor llevan referencias a objetos de héroe (con
  // referencias circulares al estado del juego). PeerJS no puede serializarlos:
  // el envío lanzaba una excepción y el invitado NO veía ninguna animación.
  // Aquí se copia solo lo que necesita el renderizador: valores planos.
  function clean(ev) {
    if (!ev || typeof ev !== 'object') return null;
    var out = {};
    Object.keys(ev).forEach(function(k) {
      var v = ev[k];
      var t = typeof v;
      if (v === null || t === 'string' || t === 'number' || t === 'boolean') { out[k] = v; return; }
      // Referencias a héroes/cartas: se reducen a su identificador y nombre.
      if (t === 'object' && (v.id || v.name)) {
        out[k] = { id: v.id, name: v.name, num: v.num, elite: !!v.eliteMode };
      }
    });
    return out;
  }

  // DEDUPLICACIÓN DE EVENTOS: el juego puede llamar flushFx varias veces con los
  // mismos eventos (si la lista interna de FX no se vacía). Sin esto, el mismo
  // FX se enviaba al invitado una y otra vez → se renderizaba en bucle sobre
  // el retrato del héroe → la partida se saturaba y bloqueaba.
  var recentSigs = {};
  function evSig(ev) {
    if (!ev) return '';
    return (ev.k || ev.type || '') + '|' + (ev.fromId || ev.from || '') + '|' +
           (ev.toId || ev.to || '') + '|' + (ev.dmg || ev.val || ev.d || '');
  }
  function sendPendingFx() {
    if (typeof NET === 'undefined' || NET.role !== 'host' || !NET.conn || !NET.conn.open) {
      pendingFx = [];
      return;
    }
    if (!pendingFx.length) return;
    var now = Date.now();
    var batch = [];
    for (var i = 0; i < pendingFx.length; i++) {
      var s = evSig(pendingFx[i]);
      if (s && recentSigs[s] && now - recentSigs[s] < 3000) continue;
      if (s) recentSigs[s] = now;
      batch.push(clean(pendingFx[i]));
    }
    pendingFx = [];
    batch = batch.filter(Boolean);
    if (!batch.length) return;
    // Cap: máximo 10 eventos por lote. Una ráfaga de 30+ eventos congela al
    // invitado; con 10 + el drenaje de 80ms del cliente es suficiente.
    if (batch.length > 10) batch = batch.slice(0, 10);
    try { NET.conn.send({ t: 'bfFxSync', evs: batch }); } catch(e) {}
    // Limpia firmas viejas
    for (var k in recentSigs) { if (now - recentSigs[k] > 5000) delete recentSigs[k]; }
  }

  // Hook flushFx en el HOST: captura los eventos de la lista antes de que
  // el juego los procese y los envie al cliente por PeerJS (batch 30ms).
  // Los eventos ya tienen fromSide/fromId porque pushFx los enriqueció.
  // Bandera GLOBAL de instalación: comprobar window.flushFx.__bfMpFxSync fallaba
  // cuando otro parche envolvía flushFx después (la bandera queda en la capa
  // interna), así que este intervalo la reenvolvía sin parar y cada evento se
  // renderizaba y ENVIABA al invitado tantas veces como capas hubiera.
  function hookFlush() {
    if (typeof window.flushFx !== 'function' || window.__bfMpFxSyncDone) return;
    window.__bfMpFxSyncDone = 1;
    var orig = window.flushFx;
    window.flushFx = function(list) {
      try {
        if (list && list.length && typeof NET !== 'undefined' && NET.role === 'host') {
          for (var i = 0; i < list.length; i++) pendingFx.push(list[i]);
          if (!sendTimer) {
            sendTimer = setTimeout(function() { sendTimer = null; sendPendingFx(); }, 0);
          }
        }
      } catch(e) {}
      return orig.apply(this, arguments);
    };
    window.flushFx.__bfMpFxSync = 1;
  }
  hookFlush();
  var fxTries = 0;
  var fxIv = setInterval(function() {
    hookFlush();
    if (window.__bfMpFxSyncDone || fxTries++ > 150) clearInterval(fxIv);
  }, 300);

  // CLIENTE: escucha los mensajes bfFxSync en la conexión de datos y
  // reprocesa los eventos con el flushFx local (que tiene los hooks de
  // attackFx, spellFx, patchCombatFx, etc. para renderar las animaciones).
  var lastConn = null;
  function bindClient() {
    if (typeof NET === 'undefined' || NET.role !== 'client' || !NET.conn || NET.conn === lastConn) return;
    lastConn = NET.conn;
    try {
      var fxQueue = [];
      var fxDraining = false;
      function drainFx() {
        if (fxDraining || !fxQueue.length) return;
        fxDraining = true;
        var batch = fxQueue.splice(0, Math.min(fxQueue.length, 6));
        try { if (typeof window.flushFx === 'function') window.flushFx(batch); } catch(e) {}
        fxDraining = false;
        if (fxQueue.length) setTimeout(drainFx, 60);
      }
      NET.conn.on('data', function(m) {
        if (!m) return;
        if (m.t === 'bfFxSync' && m.evs && m.evs.length) {
          // Encola los eventos y los procesa en lotes pequeños con una
          // pequeña pausa entre lotes. Sin esto, una ráfaga de 20+ eventos
          // (ataque multi-objetivo, hechizo de área…) llega de golpe al
          // invitado por el relay y congela el navegador varios segundos.
          for (var i = 0; i < m.evs.length; i++) fxQueue.push(m.evs[i]);
          drainFx();
        }
      });
    } catch(e) {}
  }
  setInterval(bindClient, 300);
})();
</script>
`;