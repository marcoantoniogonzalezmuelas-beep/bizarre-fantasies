// Parche SOLO móvil/tablet: permite el pellizco nativo del navegador dentro
// del iframe del juego.
//
// Versión simplificada: el HTML del juego trae su propio meta viewport que
// bloquea el zoom (maximum-scale=1.0, user-scalable=no). Antes intentábamos
// además "interceptar" con JavaScript los touchmove del propio juego
// (sobrescribiendo Event.prototype.preventDefault, addEventListener, etc.)
// para que no pudieran cancelar el pellizco. Ese truco quedó descartado: es
// muy frágil y podía romper el gesto por completo si alguna sobrescritura
// fallaba. Ahora solo se corrige lo mínimo necesario:
//   · Un meta viewport permisivo (user-scalable=yes, sin maximum-scale=1).
//   · touch-action: auto (el valor que de verdad deja el pellizco nativo al
//     navegador) en html/body, reforzado por si el juego lo cambia luego.

export const PINCH_ZOOM_HEAD_PATCH = `
<meta name="viewport" content="width=1200, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
<style id="bf-pinch-zoom">
html, body { touch-action: auto !important; }
</style>
`;

export const PINCH_ZOOM_BODY_PATCH = `
<script>
(function(){
  if(window.__bfPinchZoom) return;
  window.__bfPinchZoom = true;

  // Elimina cualquier meta viewport que bloquee el zoom (el que trae el
  // juego, o cualquiera que el propio juego re-añada después).
  function killViewportMetas(){
    document.querySelectorAll('meta[name="viewport"]').forEach(function(m){
      var c = m.getAttribute('content') || '';
      if(/maximum-scale=1(\\.0)?\\b|user-scalable=no/i.test(c)){
        m.parentNode && m.parentNode.removeChild(m);
      }
    });
  }
  killViewportMetas();
  try {
    new MutationObserver(killViewportMetas).observe(document.documentElement, { childList: true, subtree: true });
  } catch(e) {}

  // Por si el juego fuerza touch-action por JS en algún momento posterior.
  setInterval(function(){
    try {
      document.documentElement.style.setProperty('touch-action', 'auto', 'important');
      document.body.style.setProperty('touch-action', 'auto', 'important');
    } catch(e) {}
  }, 1000);
})();
</script>
`;