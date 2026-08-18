// Parpadeo al pellizcar en TABLET: mientras el gesto está activo, el body es
// una capa GPU que se está reescalando frame a frame. En tablet esa capa es
// enorme (la escala del juego es ~0,7-1 frente al ~0,3 del móvil), así que
// cualquier animación CSS que siga corriendo dentro (halos de turno, auras de
// estado, bordes arcoíris, brillos, marquesinas…) obliga a rehacer la textura
// completa en cada frame → destellos muy acusados.
//
// SOLUCIÓN: mientras se pellizca (y durante el reencuadre al soltar) se pausan
// TODAS las animaciones y transiciones CSS del juego, menos el transform del
// propio body (que es el zoom). No cambia ninguna lógica: al soltar, las
// animaciones continúan solas desde donde estaban.
export const PINCH_ANIM_FREEZE_PATCH = `
<script>
(function(){
  if(window.__bfPinchAnimFreeze) return;
  window.__bfPinchAnimFreeze = true;

  var st = document.createElement('style');
  st.textContent = 'html.bf-pinch-still *:not(body),html.bf-pinch-still *:not(body)::before,html.bf-pinch-still *:not(body)::after{'
    + 'animation-play-state:paused!important;transition:none!important}';
  document.head.appendChild(st);

  var until = 0, on = false;
  function set(v){
    if(v === on) return;
    on = v;
    document.documentElement.classList[v ? 'add' : 'remove']('bf-pinch-still');
  }

  document.addEventListener('touchstart', function(e){
    if(e.touches && e.touches.length >= 2){ until = Date.now() + 420; set(true); }
  }, { capture: true, passive: true });

  setInterval(function(){
    var busy = false;
    try{ busy = !!(window.__bfPinchBusy && window.__bfPinchBusy()); }catch(e){}
    if(busy) until = Date.now() + 420;
    set(Date.now() < until);
  }, 100);
})();
</script>
`;