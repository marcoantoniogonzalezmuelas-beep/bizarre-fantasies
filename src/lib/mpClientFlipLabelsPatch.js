// Parche inyectado en el iframe: corrige las etiquetas de lado del tablero
// para el cliente en multiplayer.
//
// PROBLEMA: el CSS `bf-client-flip` (gameHtml) invierte el orden visual de
// las columnas de .r-layout y .b-grid con `order`, pero el CONTENIDO de cada
// columna (la etiqueta "· TÚ" / "· RIVAL") no se intercambia.
//
// SOLUCIÓN: para el cliente, periódicamente intercambiar el texto "TÚ"
// ↔ "RIVAL" en las cabeceras de las columnas. No envuelve ninguna función
// del juego (evita interferir con el flujo de conexión del host).
export const MP_CLIENT_FLIP_LABELS_PATCH = `
<script>
(function(){
  if (window.__bfMpFlipLabels) return;
  window.__bfMpFlipLabels = true;

  function isClient() {
    try { return typeof NET !== 'undefined' && NET && NET.role === 'client'; }
    catch (e) { return false; }
  }

  function swapTagInNode(root, oldTag, newTag) {
    if (!root) return;
    try {
      var nodes = root.querySelectorAll('span, small, .side-label, .side-name');
      var reOld = new RegExp(oldTag, 'i');
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var t = n.textContent;
        if (!t) continue;
        if (reOld.test(t)) n.textContent = t.replace(reOld, newTag);
      }
    } catch(e) {}
  }

  function swapSideTags() {
    if (!isClient()) return;
    if (!document.documentElement.classList.contains('bf-client-flip')) return;
    try {
      ['r-layout', 'b-grid'].forEach(function(cls) {
        var grids = document.querySelectorAll('.' + cls);
        for (var gi = 0; gi < grids.length; gi++) {
          var grid = grids[gi];
          var kids = grid.children;
          if (!kids || kids.length < 3) continue;
          var pCol = kids[0];
          var oCol = kids[2];
          if (!pCol || !oCol) continue;
          if (pCol.dataset.bfFlipTag === '1' && oCol.dataset.bfFlipTag === '1') continue;
          swapTagInNode(pCol, 'TÚ', 'RIVAL');
          swapTagInNode(oCol, 'RIVAL', 'TÚ');
          pCol.dataset.bfFlipTag = '1';
          oCol.dataset.bfFlipTag = '1';
        }
      });
    } catch(e) {}
  }

  // Solo polling: no envuelve ninguna función del juego.
  setInterval(swapSideTags, 500);
})();
</script>
`;