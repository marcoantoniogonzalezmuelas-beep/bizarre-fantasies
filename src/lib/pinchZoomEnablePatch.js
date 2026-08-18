// Parche SOLO móvil/tablet: garantiza que el pellizco nativo del navegador
// funcione dentro del iframe del juego.
//
// El HTML del juego tiene su propio meta viewport que bloquea el zoom
// (maximum-scale=1.0, user-scalable=no) y sus manejadores táctiles pueden
// llamar a preventDefault() sobre touchmove, lo que anula el pellizco.
//
// Se divide en dos partes:
//   · HEAD: meta viewport + CSS touch-action. Va en el <head> del documento
//     (el navegador SOLO respeta el meta viewport si está en el <head>).
//   · BODY: JS que envuelve addEventListener y ontouchmove para que los
//     touchmove con preventDefault no bloqueen los gestos de dos dedos, y
//     un MutationObserver que elimina cualquier meta viewport que el juego
//     re-añada dinámicamente.

export const PINCH_ZOOM_HEAD_PATCH = `
<meta name="viewport" content="width=1200, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
<style id="bf-pinch-zoom">
html, body { touch-action: pan-x pan-y pinch-zoom !important; }
*, *::before, *::after { touch-action: pan-x pan-y pinch-zoom !important; }
</style>
`;

export const PINCH_ZOOM_BODY_PATCH = `
<script>
(function(){
  if(window.__bfPinchZoom) return;
  window.__bfPinchZoom = true;

  // Los controles originales del juego se registran antes que este parche y
  // pueden cancelar un gesto de dos dedos. Se preservan sus toques de juego,
  // pero nunca se permite cancelar el pellizco ni los gestos nativos de Safari.
  try {
    var nativePreventDefault = Event.prototype.preventDefault;
    Event.prototype.preventDefault = function(){
      // Chrome/Android cancela TODO el gesto (incluido el pellizco) si se
      // bloquea el primer 'touchstart', aunque solo haya un dedo. Por eso los
      // touchstart nunca se bloquean; el arrastre del juego usa touchmove.
      if (this.type === 'touchstart' || this.type === 'pointerdown') return;
      if ((this.touches && this.touches.length >= 2) || this.type === 'gesturestart' || this.type === 'gesturechange') return;
      return nativePreventDefault.call(this);
    };
  } catch(e) {}

  // La captura de puntero de los arrastres del juego también impide el
  // pellizco: se ignora en cuanto hay más de un dedo en pantalla.
  try {
    var nativeCapture = Element.prototype.setPointerCapture;
    Element.prototype.setPointerCapture = function(id){
      if (window.__bfTouchCount > 1) return;
      return nativeCapture.call(this, id);
    };
    document.addEventListener('touchstart', function(e){ window.__bfTouchCount = e.touches.length; }, { capture: true, passive: true });
    document.addEventListener('touchend', function(e){ window.__bfTouchCount = e.touches.length; }, { capture: true, passive: true });
  } catch(e) {}

  // --- 1. Elimina cualquier meta viewport que el juego añada después ---
  function killViewportMetas(){
    var metas = document.querySelectorAll('meta[name="viewport"]');
    metas.forEach(function(m){
      var c = m.getAttribute('content') || '';
      // Solo elimina los que bloquean el zoom
      if(/maximum-scale=1\.0|user-scalable=no/i.test(c)){
        m.parentNode && m.parentNode.removeChild(m);
      }
    });
  }
  killViewportMetas();
  // Observa cambios en el <head> por si el juego re-añade el meta
  try {
    var headObs = new MutationObserver(function(muts){
      muts.forEach(function(m){
        m.addedNodes.forEach(function(n){
          if(n.nodeName && n.nodeName.toLowerCase() === 'meta' && n.getAttribute && n.getAttribute('name') === 'viewport'){
            var c = n.getAttribute('content') || '';
            if(/maximum-scale=1\.0|user-scalable=no/i.test(c)){
              n.parentNode && n.parentNode.removeChild(n);
            }
          }
        });
      });
    });
    headObs.observe(document.documentElement, { childList: true, subtree: true });
  } catch(e) {}

  // --- 2. Neutraliza preventDefault en touchmove con 2+ dedos ---
  // Envuelve addEventListener para que los touchmove que el juego registre
  // no puedan llamar a preventDefault cuando hay 2+ puntos de contacto.
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

  // Override ontouchmove property (por si el juego usa asignación directa)
  try {
    var origDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'ontouchmove') ||
                   Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'ontouchmove');
    if(origDesc && origDesc.set){
      Object.defineProperty(document, 'ontouchmove', {
        get: function(){ return origDesc.get.call(this); },
        set: function(fn){
          if(typeof fn === 'function'){
            var wrapped = function(e){
              if(e.touches && e.touches.length >= 2){ e.preventDefault = function(){}; }
              return fn.call(this, e);
            };
            origDesc.set.call(this, wrapped);
          } else {
            origDesc.set.call(this, fn);
          }
        },
        configurable: true
      });
    }
  } catch(e) {}

  // Intercepta los touchmove ya registrados antes de este parche (capture phase).
  // stopImmediatePropagation evita que los listeners del juego (bubble phase)
  // se ejecuten y llamen a preventDefault.
  ['touchstart','touchmove'].forEach(function(type){
    document.addEventListener(type, function(e){
      if(e.touches && e.touches.length >= 2){
        e.stopImmediatePropagation();
      }
    }, { capture: true, passive: true });
  });

  // --- 3. Fuerza touch-action: manipulation periódicamente ---
  // El juego puede cambiar touch-action vía JavaScript (inline styles). Este
  // intervalo re-aplica manipulation en el body y elementos clave.
  setInterval(function(){
    try {
      document.documentElement.style.setProperty('touch-action', 'pan-x pan-y pinch-zoom', 'important');
      document.body.style.setProperty('touch-action', 'pan-x pan-y pinch-zoom', 'important');
    } catch(e) {}
  }, 1000);
})();
</script>
`;