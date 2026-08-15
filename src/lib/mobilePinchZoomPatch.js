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
  var msgTimer = null;         // throttle del aviso de zoom al padre
  var MSG_MS = 120;            // el padre re-renderiza sus overlays: avisar por
                               // frame durante el gesto provocaba parpadeo

  function apply(){
    var b = document.body;
    b.style.transformOrigin = '0 0';
    // A x1 sin desplazamiento se QUITA el transform: así el body deja de ser
    // una capa GPU gigante y las animaciones de batalla no repintan toda la
    // pantalla (era la causa del parpadeo en tablet). Con zoom o gesto activo
    // se mantiene la capa estable (clase bf-zooming).
    // Con un modal abierto (p. ej. la ventanita de "Salir") se MANTIENE el
    // translate3d aunque estemos a x1: los position:fixed del modal se sitúan
    // respecto al body transformado, que es lo que hace que la ventanita salga
    // justo al lado del botón "Salir" y no pegada al borde del viewport.
    var modalOpen = !!document.querySelector('#modalRoot .mo');
    var idle = (z === 1 && !tx && !ty && !pinch && !modalOpen);
    if (idle) {
      b.classList.remove('bf-zooming');
      b.style.transform = '';
      if (z !== lastZ || tx !== lastTx || ty !== lastTy) {
        lastZ = z; lastTx = tx; lastTy = ty;
        flushMsgNow();
      }
      return;
    }
    b.classList.add('bf-zooming');
    // translate3d mantiente el transform en el compositor GPU de forma estable
    // durante el gesto; cuando volvemos a x1 sin desplazamiento, quitamos el
    // transform para que el body deje de ser una capa compuesta (así los
    // re-renders del juego solo repintan el área cambiada, no todo el body).
    // Se mantiene SIEMPRE un translate3d (aunque sea 0,0 a escala 1): así la
    // capa compuesta del body no se crea ni se destruye al pellizcar, que es lo
    // que provocaba los destellos.
    b.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + z + ')';
    // Avisa al padre del zoom para que el cartel de actualidad (que vive fuera
    // del iframe) se amplíe igual que el juego al pellizcar en móvil/tablet.
    // THROTTLE: el padre (React) re-renderiza sus overlays con cada aviso; si
    // se avisa en cada frame del gesto, esos re-renders compiten con el
    // compositor y la pantalla parpadea. Se avisa como mucho cada 120 ms y
    // siempre una última vez con el valor final.
    if (z !== lastZ || tx !== lastTx || ty !== lastTy) {
      lastZ = z; lastTx = tx; lastTy = ty;
      if (!msgTimer) {
        msgTimer = setTimeout(function(){
          msgTimer = null;
          try { window.parent.postMessage({ bfPinch: { z: lastZ, tx: lastTx, ty: lastTy } }, '*'); } catch (e) {}
        }, MSG_MS);
      }
    }
  }
  function flushMsg(){
    if (msgTimer) { clearTimeout(msgTimer); msgTimer = null; }
    try { window.parent.postMessage({ bfPinch: { z: z, tx: tx, ty: ty } }, '*'); } catch (e) {}
  }
  function flushMsgNow(){ flushMsg(); }
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

  // will-change YA NO se activa/desactiva por gesto: encender y apagarlo creaba
  // y destruía la capa GPU del body en cada pellizco, y ese montaje/desmontaje
  // era justo lo que provocaba los destellos. El body ya es una capa estable
  // (translate3d permanente, ver noFlickerPatch.js), así que no hace falta.
  function enableWC(){}
  function disableWC(){}

  // Rebaselina el gesto con los 2 primeros dedos actuales. Guardar los ids de
  // los dedos permite detectar cuándo cambia la pareja (levantar/volver a
  // apoyar un dedo, o un tercer dedo): sin rebaselinar, la fórmula usaba la
  // referencia del gesto anterior con dedos distintos y la pantalla saltaba
  // y quedaba totalmente descentrada.
  function startPinch(t){
    pinch = { d0: dist(t), c0: mid(t), z0: z, tx0: tx, ty0: ty, id0: t[0].identifier, id1: t[1].identifier };
  }
  function samePair(t){
    return pinch && t[0].identifier === pinch.id0 && t[1].identifier === pinch.id1;
  }

  function onStart(e){
    if (e.touches.length < 2) return;
    e.preventDefault();
    e.stopPropagation();
    document.body.style.transition = 'none';
    enableWC();
    startPinch(e.touches);
  }

  function onMove(e){
    if (!pinch || e.touches.length < 2) return;
    e.preventDefault();
    e.stopPropagation();
    // Si la pareja de dedos cambió (dedo levantado/reapoyado o tercer dedo),
    // rebaselina desde la posición actual en vez de saltar.
    if (!samePair(e.touches)) { startPinch(e.touches); return; }
    var d = dist(e.touches), c = mid(e.touches);
    if (!pinch.d0) return;
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
    if (e.touches.length >= 2) {
      // Quedan 2+ dedos: sigue el gesto con la nueva pareja, sin saltos.
      startPinch(e.touches);
      return;
    }
    pinch = null;
    var b = document.body;
    b.style.transition = 'transform .26s cubic-bezier(.2,.8,.3,1)';
    if (z < 1.05) { z = 1; tx = 0; ty = 0; }
    clampT();
    applyNow();
    flushMsg();
    // will-change se quita tras la transición (con margen) para evitar el
    // parpadeo de desmontar la capa a mitad de la animación.
    disableWC(360);
  }

  // Reencuadre a x1 (sin desplazamiento). usado al abrir modales y al saltar a
  // las pantallas que deben verse desde arriba (setup / resolución de puja).
  function resetZoom(){
    if (z === 1 && !tx && !ty) { applyNow(); return; }
    var b = document.body;
    b.style.transition = 'transform .22s ease';
    enableWC();
    z = 1; tx = 0; ty = 0; applyNow();
    flushMsg();
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

  // API para la batalla (battleFocusZoomPatch): sube la vista al borde SUPERIOR
  // manteniendo EXACTAMENTE el mismo nivel de zoom y el desplazamiento
  // horizontal actual. No acerca ni aleja nada.
  window.__bfPinchTop = function(ms){
    if (pinch) return;
    if (ty === 0) { try { window.scrollTo(0, 0); } catch (e) {} return; }
    ty = 0;
    clampT();
    document.body.style.transition = 'transform ' + ((ms || 380) / 1000) + 's cubic-bezier(.25,.8,.3,1)';
    applyNow();
    flushMsg();
    try { window.scrollTo(0, 0); } catch (e) {}
  };
  window.__bfPinchZ = function(){ return z; };
  window.__bfPinchBusy = function(){ return !!pinch; };

  // Reencuadra al abrir cualquier modal (.mo): con el body transformado, los
  // position:fixed se posicionan respecto al body escalado y quedan fuera.
  function isModalNode(n){ return n && n.nodeType === 1 && (n.classList.contains('mo') || (n.querySelector && n.querySelector('.mo'))); }

  new MutationObserver(function(muts){
    for (var i = 0; i < muts.length; i++) {
      var added = muts[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        if (isModalNode(added[j])) { resetZoom(); return; }
      }
      // Al cerrarse el modal se vuelve a evaluar el estado (así el body deja de
      // ser capa compuesta cuando ya no hace falta).
      if (muts[i].removedNodes && muts[i].removedNodes.length) scheduleApply();
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