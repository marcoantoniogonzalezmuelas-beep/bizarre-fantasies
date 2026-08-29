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
    // El body lleva SIEMPRE translate3d (ver noFlickerPatch.js): la capa GPU
    // existe siempre y no se crea ni se destruye al pellizcar. Antes se quitaba
    // el transform a x1 y ese montaje/desmontaje de capa era el destello.
    // Los FX viven en #bf-fx-layer (aislada), así que el body no se repinta
    // durante las animaciones de batalla aunque sea una capa GPU permanente.
    // Desplazamiento redondeado a píxeles enteros: los valores fraccionarios
    // hacían que el compositor pintase la pantalla en mosaicos desalineados
    // (la imagen se "descoyuntaba" al mover con zoom) y añadían desenfoque.
    b.style.transform = 'translate3d(' + Math.round(tx) + 'px,' + Math.round(ty) + 'px,0) scale(' + z + ')';
    // Avisa al padre del zoom para que el cartel de actualidad (que vive fuera
    // del iframe) se amplíe igual que el juego al pellizcar en móvil/tablet.
    // Solo al soltar (sin pinch): durante el gesto el padre re-renderizaría
    // sus overlays y ese repintado compite con el compositor → destello.
    if (z !== lastZ || tx !== lastTx || ty !== lastTy) {
      lastZ = z; lastTx = tx; lastTy = ty;
      if (!msgTimer && !pinch && !(z === 1 && !tx && !ty)) {
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

  // Clamp del desplazamiento: permite mover el contenido zoomed dentro del
  // viewport sin que quede hueco negro. Con zoom z>1, el contenido es más
  // grande que la pantalla, así que hay margen de paneo (W*z - W) en cada eje.
  // El margen se reparte entre los dos lados (no todo a la izquierda) para que
  // el usuario pueda moverse a izquierda Y derecha por igual.
  function clampT(){
    var W = window.innerWidth, H = window.innerHeight;
    var marginX = W * z - W; // espacio extra por el zoom (>=0)
    var marginY = H * z - H;
    // Sin zoom (z=1): margen 0, tx y ty deben ser 0.
    // Con zoom: tx puede ir de -marginX a 0, ty de -marginY a 0.
    // Con alejamiento (z<1) el contenido es más estrecho que la pantalla: se
    // centra horizontalmente en vez de dejarlo pegado al borde izquierdo.
    if (marginX < 0) tx = -marginX / 2;
    else if (marginX === 0) tx = 0;
    else tx = Math.min(0, Math.max(-marginX, tx));
    // Alejado (z<1): también se centra en vertical, así el hueco no queda todo
    // abajo en una franja negra.
    if (marginY < 0) ty = -marginY / 2;
    else if (marginY === 0) ty = 0;
    else ty = Math.min(0, Math.max(-marginY, ty));
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

  // Congela animaciones y transiciones mientras se pellizca: repintarlas sobre
  // la capa escalada es lo que provoca el parpadeo (portada, equipamiento y
  // batalla tienen muchas animaciones activas a la vez).
  var pzStyle = document.createElement('style');
  pzStyle.textContent = 'html.bf-pinching *,html.bf-pinching *::before,html.bf-pinching *::after{animation-play-state:paused!important;transition:none!important}';
  (document.head || document.documentElement).appendChild(pzStyle);

  // Al ALEJAR (z<1) el contenido es más pequeño que la pantalla y alrededor se
  // veía el negro del navegador. Se copia el fondo del juego al elemento raíz
  // para que ese margen tenga el mismo fondo y no se vea un hueco negro.
  function syncRootBg(){
    try{
      var cs = getComputedStyle(document.body);
      var col = cs.backgroundColor, img = cs.backgroundImage;
      // Si el body no tiene fondo propio (transparente o sin imagen), se toma
      // el de la PANTALLA ACTIVA del juego (la portada pinta su fondo ahí):
      // antes el margen del zoom-out quedaba negro.
      if (!img || img === 'none') {
        var scr = document.querySelector('.screen.active');
        if (scr) {
          var cs2 = getComputedStyle(scr);
          if (cs2.backgroundImage && cs2.backgroundImage !== 'none') img = cs2.backgroundImage;
          if (col === 'rgba(0, 0, 0, 0)' || col === 'transparent') col = cs2.backgroundColor;
        }
      }
      if (col === 'rgba(0, 0, 0, 0)' || col === 'transparent') col = '#0e0a16';
      var d = document.documentElement.style;
      d.backgroundColor = col;
      d.backgroundImage = (img && img !== 'none') ? img : '';
      d.backgroundSize = 'cover';
      d.backgroundPosition = 'center';
      d.backgroundRepeat = 'no-repeat';
    }catch(e){}
  }
  syncRootBg();
  setInterval(syncRootBg, 1500);

  function onStart(e){
    if (e.touches.length < 2) return;
    e.preventDefault();
    e.stopPropagation();
    document.body.style.transition = 'none';
    document.documentElement.classList.add('bf-pinching');
    try { window.parent.postMessage({ bfPinching: true }, '*'); } catch (err) {}
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
    // Zoom máximo x2,5: por encima de eso la capa escalada del juego (1280px)
    // es tan grande que el navegador móvil no puede repintarla entera y la
    // pantalla se rompe/descuadra al desplazarse.
    // Se permite ALEJAR hasta x0,6 (para ver el tablero entero en horizontal)
    // y acercar hasta x2,5.
    var nz = Math.min(2.5, Math.max(0.6, pinch.z0 * (d / pinch.d0)));
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
    setTimeout(function(){
      document.documentElement.classList.remove('bf-pinching');
      try { window.parent.postMessage({ bfPinching: false }, '*'); } catch (err) {}
    }, 300);
    var b = document.body;
    b.style.transition = 'transform .26s cubic-bezier(.2,.8,.3,1)';
    // Solo se reencuadra a x1 si el usuario se quedó muy cerca de x1; si ha
    // alejado a propósito (z<0,97) se respeta su zoom.
    if (z >= 0.97 && z < 1.05) { z = 1; tx = 0; ty = 0; }
    clampT();
    applyNow();
    flushMsg();
    // Al soltar, se pide al navegador que vuelva a dibujar el contenido al
    // nuevo tamaño (en vez de estirar la imagen anterior): así el juego se ve
    // nítido con el zoom puesto, sin desenfoque.
    setTimeout(function(){
      if (pinch) return;
      var bd = document.body;
      bd.style.transition = 'none';
      bd.style.willChange = 'auto';
      void bd.offsetHeight;
    }, 320);
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
  // Expone el estado completo del zoom para que otros parches (FX, cinemáticas)
  // puedan saber si hay zoom activo y ajustar su comportamiento.
  window.__bfPinchState = function(){ return { z: z, tx: tx, ty: ty }; };

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
  // touchend/touchcancel NO hacen preventDefault: se registran como passive
  // para no bloquear el hilo de composición del navegador al soltar el gesto
  // (una de las causas del parpadeo en tablet).
  document.addEventListener('touchend', onEnd, { capture: true, passive: true });
  document.addEventListener('touchcancel', onEnd, { capture: true, passive: true });
})();
</script>
`;