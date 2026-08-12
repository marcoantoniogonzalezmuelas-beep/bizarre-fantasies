// Parche solo para MÓVIL/TABLET, inyectado en el HTML del juego (iframe):
// zoom de pellizco (pinch) propio, porque el zoom estándar del navegador no
// llega al contenido del iframe (el juego captura los gestos táctiles).
// - Pellizcar con 2 dedos: acercar/alejar (x1 a x4), centrado en el pellizco.
// - Mover los 2 dedos: desplazarse por la pantalla mientras hay zoom.
// - Al soltar cerca de x1, se reencuadra automáticamente a pantalla completa.
// - Al aparecer la pantalla "Preparar Partida" (s-setup) o el panel de
//   resolución de puja (.pr-box en s-recruit), reencuadra a x1 y lleva el
//   scroll al borde superior para que se vea sin tener que desplazarse.
// Un dedo sigue funcionando normal para jugar (botones, arrastres, etc.).
export const MOBILE_PINCH_PATCH = `
<script>
(function(){
  if (window.__bfPinchZoom) return;
  window.__bfPinchZoom = true;

  var z = 1, tx = 0, ty = 0;   // escala y desplazamiento actuales
  var pinch = null;            // estado del gesto en curso
  var lastZ = 1, lastTx = 0, lastTy = 0;  // evita postMessage redundantes
  var rafId = null;
  var wcTimer = null;          // retardo para quitar will-change sin flicker

  function apply(){
    var b = document.body;
    b.style.transformOrigin = '0 0';
    // translate3d mantiente el transform en el compositor GPU de forma estable
    // durante el gesto; cuando volvemos a x1 sin desplazamiento, quitamos el
    // transform para que el body deje de ser una capa compuesta (así los
    // re-renders del juego solo repintan el área cambiada, no todo el body).
    b.style.transform = (z === 1 && !tx && !ty) ? '' : 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + z + ')';
    // Avisa al padre del zoom para que el cartel de actualidad (que vive fuera
    // del iframe) se amplíe igual que el juego al pellizcar en móvil/tablet.
    if (z !== lastZ || tx !== lastTx || ty !== lastTy) {
      lastZ = z; lastTx = tx; lastTy = ty;
      try { window.parent.postMessage({ bfPinch: { z: z, tx: tx, ty: ty } }, '*'); } catch (e) {}
    }
  }
  function scheduleApply(){
    if (rafId) return;
    rafId = requestAnimationFrame(function(){ rafId = null; apply(); });
  }
  function applyNow(){
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    apply();
  }

  function clampT(){
    var W = window.innerWidth, H = window.innerHeight;
    tx = Math.min(0, Math.max(W - W * z, tx));
    ty = Math.min(0, Math.max(H - H * z, ty));
  }

  function dist(t){ var dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY; return Math.hypot(dx, dy); }
  function mid(t){ return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 }; }

  // will-change SOLO durante el gesto/animación: si lo dejamos siempre, el
  // body entero se convierte en una capa de composición GPU y cualquier cambio
  // de contenido (re-render del juego, parches) fuerza un repintado completo
  // de la capa → parpadeo en móvil/tablet. Se activa al empezar el pellizco y
  // se quita un poco DESPUÉS de terminar la animación de reencuadre, para que
  // la capa no se desmonte a mitad de la transición (eso también parpadeaba).
  function enableWC(){
    if (wcTimer) { clearTimeout(wcTimer); wcTimer = null; }
    document.body.style.willChange = 'transform';
    // bf-pinching pausa todas las animaciones/transiciones mientras el body
    // está escalado: es lo que provocaba el parpadeo al pellizcar (ver
    // noFlickerPatch.js).
    try { document.documentElement.classList.add('bf-pinching'); } catch (e) {}
  }
  function disableWC(delay){
    if (wcTimer) clearTimeout(wcTimer);
    wcTimer = setTimeout(function(){
      wcTimer = null;
      document.body.style.willChange = '';
      try { document.documentElement.classList.remove('bf-pinching'); } catch (e) {}
    }, delay || 380);
  }

  function onStart(e){
    if (e.touches.length !== 2) return;
    e.preventDefault();
    e.stopPropagation();
    document.body.style.transition = 'none';
    enableWC();
    pinch = { d0: dist(e.touches), c0: mid(e.touches), z0: z, tx0: tx, ty0: ty };
  }

  function onMove(e){
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    e.stopPropagation();
    var d = dist(e.touches), c = mid(e.touches);
    var nz = Math.min(4, Math.max(1, pinch.z0 * (d / pinch.d0)));
    var px = (pinch.c0.x - pinch.tx0) / pinch.z0;
    var py = (pinch.c0.y - pinch.ty0) / pinch.z0;
    z = nz;
    tx = c.x - px * nz;
    ty = c.y - py * nz;
    clampT();
    scheduleApply();
  }

  function onEnd(e){
    if (!pinch) return;
    if (e.touches.length < 2) {
      pinch = null;
      var b = document.body;
      b.style.transition = 'transform .26s cubic-bezier(.2,.8,.3,1)';
      if (z < 1.05) { z = 1; tx = 0; ty = 0; applyNow(); }
      // will-change se quita tras la transición (con margen) para evitar el
      // parpadeo de desmontar la capa a mitad de la animación.
      disableWC(360);
    }
  }

  // Reencuadre a x1 (sin desplazamiento). usado al abrir modales y al saltar a
  // las pantallas que deben verse desde arriba (setup / resolución de puja).
  function resetZoom(){
    if (z === 1 && !tx && !ty) return;
    var b = document.body;
    b.style.transition = 'transform .22s ease';
    enableWC();
    z = 1; tx = 0; ty = 0; applyNow();
    disableWC(360);
  }

  // Lleva el contenido al borde superior: reencuadra a x1 y pone el scroll a 0
  // (dentro del iframe y en la ventana padre). Así las pantallas largas
  // (Preparar Partida, resolución de puja) se ven desde arriba sin scroll.
  function topReset(){
    resetZoom();
    try { window.scrollTo(0, 0); } catch (e) {}
    try { window.parent.scrollTo(0, 0); } catch (e) {}
  }
  window.__bfPinchReset = resetZoom;
  window.__bfTopReset = topReset;

  // Reencuadra al abrir cualquier modal (.mo): con el body transformado, los
  // position:fixed se posicionan respecto al body escalado y quedan fuera.
  function isModalNode(n){ return n && n.nodeType === 1 && (n.classList.contains('mo') || (n.querySelector && n.querySelector('.mo'))); }

  new MutationObserver(function(muts){
    for (var i = 0; i < muts.length; i++) {
      var added = muts[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        if (isModalNode(added[j])) { resetZoom(); return; }
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  // Auto-scroll al borde superior al entrar en "Preparar Partida" (s-setup) o
  // al aparecer el panel de resolución de puja (.pr-box) en la subasta.
  // Solo en móvil/tablet: en PC el contenido cabe sin scroll.
  var lastScreen = '';
  function activeScreenId(){
    var a = document.querySelector('.screen.active');
    return a ? (a.id || '') : '';
  }
  function checkScreenTop(){
    var sid = activeScreenId();
    if (sid !== lastScreen) {
      lastScreen = sid;
      if (sid === 's-setup') topReset();
    }
    // Resolución de puja: el panel .pr-box aparece dentro de s-recruit cuando
    // se resuelve la ronda. Lo detectamos aunque la pantalla activa no cambie.
    if (sid === 's-recruit') {
      var pr = document.querySelector('#s-recruit .pr-box');
      if (pr && !pr.dataset.bfTopDone) {
        pr.dataset.bfTopDone = '1';
        topReset();
      }
      // Si vuelve a haber ronda de puja (sin .pr-box), limpiamos el flag para
      // que la próxima resolución vuelva a subir arriba.
      if (!pr) {
        var cands = document.querySelectorAll('#s-recruit [data-bf-top-done]');
        for (var k = 0; k < cands.length; k++) cands[k].removeAttribute('data-bf-top-done');
      }
    }
  }
  setInterval(checkScreenTop, 350);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', checkScreenTop);
  else checkScreenTop();

  // capture:true + passive:false para adelantarnos a los handlers del juego
  // y poder hacer preventDefault del gesto de 2 dedos.
  document.addEventListener('touchstart', onStart, { capture: true, passive: false });
  document.addEventListener('touchmove', onMove, { capture: true, passive: false });
  document.addEventListener('touchend', onEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', onEnd, { capture: true, passive: false });
})();
</script>
`;