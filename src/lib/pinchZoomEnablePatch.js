// Parche SOLO móvil/tablet: garantiza que el pellizco nativo del navegador
// funcione dentro del iframe del juego.
//
// El HTML del juego no tiene meta viewport y sus manejadores táctiles pueden
// llamar a preventDefault() sobre touchmove, lo que anula el pellizco del
// navegador.
//
// Se divide en dos partes:
//   · HEAD: meta viewport + CSS touch-action. Va en el <head> del documento
//     (el navegador SOLO respeta el meta viewport si está en el <head>;
//     inyectarlo al final del <body> no sirve).
//   · BODY: JS que envuelve addEventListener para que los touchmove con
//     preventDefault no bloqueen los gestos de dos dedos.

export const PINCH_ZOOM_HEAD_PATCH = `
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
<style id="bf-pinch-zoom">
*, *::before, *::after { touch-action: manipulation !important; }
</style>
`;

export const PINCH_ZOOM_BODY_PATCH = `
<script>
(function(){
  if(window.__bfPinchZoom) return;
  window.__bfPinchZoom = true;

  // Los gestos de dos dedos (pellizco) no deben ser anulados por el juego.
  // Si un listener de touchmove llama a preventDefault cuando hay 2+ dedos,
  // el navegador no puede hacer zoom. Se envuelve addEventListener para
  // neutralizar preventDefault en touchmove cuando hay 2+ puntos de contacto.
  if(typeof EventTarget !== 'undefined'){
    var origAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, opts){
      if(type === 'touchmove' && typeof listener === 'function'){
        var wrapped = function(e){
          if(e.touches && e.touches.length >= 2){
            e.preventDefault = function(){};
          }
          return listener.call(this, e);
        };
        return origAdd.call(this, type, wrapped, opts);
      }
      return origAdd.call(this, type, listener, opts);
    };
  }

  // Intercepta los touchmove ya registrados antes de este parche (capture phase).
  document.addEventListener('touchmove', function(e){
    if(e.touches && e.touches.length >= 2){
      e.stopImmediatePropagation();
    }
  }, { capture: true, passive: true });
})();
</script>
`;