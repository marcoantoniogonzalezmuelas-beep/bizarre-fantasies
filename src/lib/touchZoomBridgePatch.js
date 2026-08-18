// Puente de gestos táctiles (solo móvil/tablet).
//
// El juego vive dentro de un iframe y sus manejadores táctiles se comen el
// gesto de dos dedos, así que el pellizco nativo del navegador nunca llega a
// funcionar sobre la mesa. Este parche detecta el gesto DENTRO del iframe (en
// fase de captura, antes que el juego) y envía a la página padre la distancia
// y el centro de los dos dedos. La página aplica el zoom y el desplazamiento.
//
// Un solo dedo no se toca: los botones y arrastres del juego siguen igual.
export const TOUCH_ZOOM_BRIDGE_PATCH = `
<script>
(function(){
  if(window.__bfTouchZoomBridge) return;
  window.__bfTouchZoomBridge = true;

  function dist(t){ return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
  function mid(t){ return { x:(t[0].clientX + t[1].clientX)/2, y:(t[0].clientY + t[1].clientY)/2 }; }
  function send(p){ try{ parent.postMessage({ bfPinch:p }, '*'); }catch(e){} }

  function two(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    var m = mid(e.touches);
    return { d: dist(e.touches), cx: m.x, cy: m.y };
  }

  function onStart(e){
    if(!e.touches || e.touches.length < 2) return;
    var g = two(e); g.phase = 'start'; send(g);
  }
  function onMove(e){
    if(!e.touches || e.touches.length < 2) return;
    var g = two(e); g.phase = 'move'; send(g);
  }
  function onEnd(e){
    if(e.touches && e.touches.length >= 2) return;
    send({ phase:'end' });
  }

  window.addEventListener('touchstart', onStart, { capture:true, passive:false });
  window.addEventListener('touchmove', onMove, { capture:true, passive:false });
  window.addEventListener('touchend', onEnd, { capture:true, passive:false });
  window.addEventListener('touchcancel', onEnd, { capture:true, passive:false });
})();
</script>
`;