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

  function sendPendingFx() {
    if (typeof NET === 'undefined' || NET.role !== 'host' || !NET.conn || !NET.conn.open) {
      pendingFx = [];
      return;
    }
    if (!pendingFx.length) return;
    try { NET.conn.send({ t: 'bfFxSync', evs: pendingFx.map(clean).filter(Boolean) }); } catch(e) {}
    pendingFx = [];
  }

  // Hook flushFx en el HOST: captura los eventos de la lista antes de que
  // el juego los procese y los envie al cliente por PeerJS (batch 30ms).
  // Los eventos ya tienen fromSide/fromId porque pushFx los enriqueció.
  function hookFlush() {
    if (typeof window.flushFx !== 'function' || window.flushFx.__bfMpFxSync) return;
    var orig = window.flushFx;
    window.flushFx = function(list) {
      try {
        if (list && list.length && typeof NET !== 'undefined' && NET.role === 'host') {
          for (var i = 0; i < list.length; i++) pendingFx.push(list[i]);
          if (!sendTimer) {
            sendTimer = setTimeout(function() { sendTimer = null; sendPendingFx(); }, 30);
          }
        }
      } catch(e) {}
      return orig.apply(this, arguments);
    };
    window.flushFx.__bfMpFxSync = 1;
  }
  hookFlush();
  setInterval(function() { if (!window.flushFx || !window.flushFx.__bfMpFxSync) hookFlush(); }, 300);

  // CLIENTE: escucha los mensajes bfFxSync en la conexión de datos y
  // reprocesa los eventos con el flushFx local (que tiene los hooks de
  // attackFx, spellFx, patchCombatFx, etc. para renderar las animaciones).
  var lastConn = null;
  function bindClient() {
    if (typeof NET === 'undefined' || NET.role !== 'client' || !NET.conn || NET.conn === lastConn) return;
    lastConn = NET.conn;
    try {
      NET.conn.on('data', function(m) {
        if (!m) return;
        if (m.t === 'bfFxSync' && m.evs && m.evs.length) {
          try { if (typeof window.flushFx === 'function') window.flushFx(m.evs); } catch(e) {}
        }
      });
    } catch(e) {}
  }
  setInterval(bindClient, 300);
})();
</script>
`;