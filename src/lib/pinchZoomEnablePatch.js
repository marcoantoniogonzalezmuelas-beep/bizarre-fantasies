// Parche SOLO móvil/tablet: garantiza que el pellizco nativo del navegador
// funcione dentro del iframe del juego.
//
// El HTML del juego no tiene meta viewport y sus manejadores táctiles pueden
// llamar a preventDefault() sobre touchmove, lo que anula el pellizco del
// navegador. Este parche:
//   1. Inserta un meta viewport que permite el zoom del usuario.
//   2. Fija touch-action: manipulation en el body (permite pan + pellizco,
//      desactiva solo el doble toque para zoom).
//   3. Envuelve addEventListener para que los touchmove con preventDefault
//      no bloqueen los gestos de dos dedos.
export const PINCH_ZOOM_ENABLE_PATCH = `
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
<style id="bf-pinch-zoom">
html, body { touch-action: manipulation !important; }
#s-title, #s-setup, #s-lobby, #s-recruit, #s-equip, #s-battle, #s-handoff, #s-result {
  touch-action: manipulation !important;
}
</style>
<script>
(function(){
  if(window.__bfPinchZoom) return;
  window.__bfPinchZoom = true;

  // Los gestos de dos dedos (pellizco) no deben ser anulados por el juego.
  // Si un listener de touchmove llama a preventDefault cuando hay 2+ dedos,
  // el navegador no puede hacer zoom. Se envuelve addEventListener para
  // ignorar preventDefault en touchmove cuando hay 2+ puntos de contacto.
  if(typeof EventTarget !== 'undefined'){
    var origAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, opts){
      if(type === 'touchmove' && typeof listener === 'function'){
        var wrapped = function(e){
          if(e.touches && e.touches.length >= 2){
            // No deja que el juego anule el gesto de pellizco.
            e.preventDefault = function(){};
          }
          return listener.call(this, e);
        };
        return origAdd.call(this, type, wrapped, opts);
      }
      return origAdd.call(this, type, listener, opts);
    };
  }

  // También intercepta los touchmove ya registrados en document/window antes
  // de que este parche se ejecute (el juego puede haberlos añadido antes).
  document.addEventListener('touchmove', function(e){
    if(e.touches && e.touches.length >= 2){
      e.stopImmediatePropagation();
    }
  }, { capture: true, passive: true });
})();
</script>
`;