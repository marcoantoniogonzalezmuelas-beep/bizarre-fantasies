// Parche inyectado en el iframe: corrige las etiquetas de lado del tablero
// para el cliente en multiplayer.
//
// PROBLEMA: el CSS `bf-client-flip` (gameHtml) invierte el orden visual de
// las columnas de .r-layout y .b-grid con `order`, pero el CONTENIDO de cada
// columna (la etiqueta "· TÚ" / "· RIVAL" y el nombre del jugador) no se
// intercambia. Así, tras el flip visual:
//   - La columna izquierda (ahora muestra al cliente / side 'o') sigue
//     diciendo "PATRÓN · RIVAL" cuando debería decir "PATRÓN · TÚ".
//   - La columna derecha (ahora muestra al host / side 'p') sigue
//     diciendo "CONGRESITO · TÚ" cuando debería decir "CONGRESITO · RIVAL".
//
// El resultado: el héroe activo del cliente aparece en el lado etiquetado
// como el rival, y el indicador de turno parece estar en el bando equivocado.
//
// SOLUCIÓN: para el cliente, tras cada render, intercambiar el texto "TÚ"
// ↔ "RIVAL" dentro de las cabeceras de las columnas de .r-layout y .b-grid.
// Los nombres (G.names.p / G.names.o) ya viajan con su columna (el CSS
// `order` mueve el nodo entero), así que solo hace falta cambiar el tag.
export const MP_CLIENT_FLIP_LABELS_PATCH = `
<script>
(function(){
  if (window.__bfMpFlipLabels) return;
  window.__bfMpFlipLabels = true;

  function isClient() {
    try { return typeof NET !== 'undefined' && NET && NET.role === 'client'; }
    catch (e) { return false; }
  }

  // Intercambia "TÚ" ↔ "RIVAL" (y variantes en minúsculas) dentro de las
  // cabeceras de las columnas del tablero. Se llama tras cada render y
  // también periódicamente para no perderse re-renders del juego.
  function swapSideTags() {
    if (!isClient()) return;
    if (!document.documentElement.classList.contains('bf-client-flip')) return;

    // .r-layout (subasta) y .b-grid (batalla): cada uno tiene 3 hijos
    // (side 'p', separador, side 'o'). Tras el flip CSS, el hijo 3 (side
    // 'o' = cliente) aparece primero y el hijo 1 (side 'p' = host) aparece
    // último. Hay que poner "TÚ" en el hijo 3 y "RIVAL" en el hijo 1.
    ['r-layout', 'b-grid'].forEach(function(cls) {
      var grids = document.querySelectorAll('.' + cls);
      grids.forEach(function(grid) {
        var kids = grid.children;
        if (!kids || kids.length < 3) return;
        var pCol = kids[0]; // side 'p' (host) — DOM child 1
        var oCol = kids[2]; // side 'o' (cliente) — DOM child 3
        if (!pCol || !oCol) return;
        if (pCol.dataset.bfFlipTag === '1' && oCol.dataset.bfFlipTag === '1') return;
        // Buscar texto "TÚ" o "RIVAL" dentro de cada columna y cambiarlo
        swapTagInNode(pCol, 'TÚ', 'RIVAL');
        swapTagInNode(oCol, 'RIVAL', 'TÚ');
        pCol.dataset.bfFlipTag = '1';
        oCol.dataset.bfFlipTag = '1';
      });
    });
  }

  // Reemplaza ocurrencias de oldTag por newTag dentro de elementos de texto
  // de un nodo (no recursivo en atributos, solo textContent de spans/small).
  function swapTagInNode(root, oldTag, newTag) {
    if (!root) return;
    var nodes = root.querySelectorAll('span, small, div, .side-label, .side-name, .p-name, .o-name');
    var reOld = new RegExp('\\\\b' + oldTag + '\\\\b', 'i');
    nodes.forEach(function(n) {
      var t = n.textContent;
      if (!t) return;
      if (reOld.test(t)) {
        n.textContent = t.replace(reOld, newTag);
      }
    });
  }

  // Ejecutar tras cada render del juego y periódicamente.
  var origRenderBattle = null;
  var origRenderRecruit = null;
  function hookRender() {
    if (typeof window.renderBattle === 'function' && !window.renderBattle.__bfFlip) {
      origRenderBattle = window.renderBattle;
      window.renderBattle = function() {
        var r = origRenderBattle.apply(this, arguments);
        setTimeout(swapSideTags, 30);
        return r;
      };
      window.renderBattle.__bfFlip = 1;
    }
    if (typeof window.renderRecruit === 'function' && !window.renderRecruit.__bfFlip) {
      origRenderRecruit = window.renderRecruit;
      window.renderRecruit = function() {
        var r = origRenderRecruit.apply(this, arguments);
        setTimeout(swapSideTags, 30);
        return r;
      };
      window.renderRecruit.__bfFlip = 1;
    }
  }

  // Polling de respaldo: si el hook no se instala a tiempo, el polling
  // corrige las etiquetas igualmente.
  setInterval(function() {
    if (!isClient()) return;
    swapSideTags();
  }, 500);

  var tries = 0;
  var iv = setInterval(function() {
    hookRender();
    if (tries++ > 200) clearInterval(iv);
  }, 100);
})();
</script>
`;