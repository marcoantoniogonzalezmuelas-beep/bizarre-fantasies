// Parche solo para MÓVIL, inyectado en el HTML del juego (iframe):
// zoom de pellizco (pinch) propio, porque el zoom estándar del navegador no
// llega al contenido del iframe (el juego captura los gestos táctiles).
// - Pellizcar con 2 dedos: acercar/alejar (x1 a x4), centrado en el pellizco.
// - Mover los 2 dedos: desplazarse por la pantalla mientras hay zoom.
// - Al soltar cerca de x1, se reencuadra automáticamente a pantalla completa.
// Un dedo sigue funcionando normal para jugar (botones, arrastres, etc.).
export const MOBILE_PINCH_PATCH = `
<script>
(function(){
  if (window.__bfPinchZoom) return;
  window.__bfPinchZoom = true;

  var z = 1, tx = 0, ty = 0;   // escala y desplazamiento actuales
  var pinch = null;            // estado del gesto en curso

  function apply(){
    var b = document.body;
    b.style.transformOrigin = '0 0';
    b.style.transform = (z === 1 && !tx && !ty) ? '' : 'translate(' + tx + 'px,' + ty + 'px) scale(' + z + ')';
  }

  function clampT(){
    var W = window.innerWidth, H = window.innerHeight;
    tx = Math.min(0, Math.max(W - W * z, tx));
    ty = Math.min(0, Math.max(H - H * z, ty));
  }

  function dist(t){ var dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY; return Math.hypot(dx, dy); }
  function mid(t){ return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 }; }

  function onStart(e){
    if (e.touches.length !== 2) return;
    e.preventDefault();
    e.stopPropagation();
    document.body.style.transition = 'none';
    pinch = { d0: dist(e.touches), c0: mid(e.touches), z0: z, tx0: tx, ty0: ty };
  }

  function onMove(e){
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    e.stopPropagation();
    var d = dist(e.touches), c = mid(e.touches);
    var nz = Math.min(4, Math.max(1, pinch.z0 * (d / pinch.d0)));
    // Mantener bajo los dedos el mismo punto del contenido (zoom + pan a la vez)
    var px = (pinch.c0.x - pinch.tx0) / pinch.z0;
    var py = (pinch.c0.y - pinch.ty0) / pinch.z0;
    z = nz;
    tx = c.x - px * nz;
    ty = c.y - py * nz;
    clampT();
    apply();
  }

  function onEnd(e){
    if (!pinch) return;
    if (e.touches.length < 2) {
      pinch = null;
      var b = document.body;
      b.style.transition = 'transform .26s cubic-bezier(.2,.8,.3,1)';
      if (z < 1.05) { z = 1; tx = 0; ty = 0; apply(); }
      setTimeout(function(){ b.style.transition = ''; }, 300);
    }
  }

  // capture:true + passive:false para adelantarnos a los handlers del juego
  // y poder hacer preventDefault del gesto de 2 dedos.
  document.addEventListener('touchstart', onStart, { capture: true, passive: false });
  document.addEventListener('touchmove', onMove, { capture: true, passive: false });
  document.addEventListener('touchend', onEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', onEnd, { capture: true, passive: false });
})();
</script>
`;