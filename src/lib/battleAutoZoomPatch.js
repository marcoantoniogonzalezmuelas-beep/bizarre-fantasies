// Zoom automático al entrar en batalla en MÓVIL VERTICAL: el campo se ve más
// grande sin necesidad de girar el dispositivo.
//
// Se aplica DESDE DENTRO del iframe (le pide el nivel de zoom al sistema de
// pellizco del propio juego con window.postMessage, sin rebotar nada al padre)
// y con un RETARDO de ~1,4 s tras entrar en batalla. Así no compite con el
// montaje de la pantalla de batalla (el momento más pesado para la GPU del
// móvil), que era lo que colgaba el navegador cuando el zoom se forzaba desde
// fuera en el instante exacto de entrar.
//
// Respeta SIEMPRE el pellizco manual del jugador: si este acercó/alejó la vista,
// no se toca su encuadre. Al salir de batalla o girar a horizontal, vuelve a x1.
export const BATTLE_AUTO_ZOOM_PATCH = `
<script>
(function(){
  if(window.__bfBattleAutoZoom) return;
  window.__bfBattleAutoZoom = true;

  var UA = navigator.userAgent || '';
  var isTablet = /iPad/i.test(UA) || (/Macintosh|Mac OS/i.test(UA) && navigator.maxTouchPoints > 1) || (/Android/i.test(UA) && !/Mobile/i.test(UA));
  var isPhone = /Android|iPhone|iPod|Mobile/i.test(UA) && !isTablet;
  if(!isPhone) return;

  var ZOOM_PORTRAIT = 1.35;
  var DELAY = 1400;
  var timer = null;
  var lastApplied = 1;

  function isPortrait(){ return window.innerHeight > window.innerWidth; }
  function inBattle(){
    var a = document.querySelector('.screen.active');
    return !!(a && a.id === 's-battle');
  }
  function userZoomed(){
    try { if(typeof window.__bfPinchZ === 'function') return window.__bfPinchZ() > 1.02; } catch(e){}
    return false;
  }
  function pinchBusy(){
    try { if(typeof window.__bfPinchBusy === 'function') return window.__bfPinchBusy(); } catch(e){}
    return false;
  }
  function applyZoom(z){
    if(z === lastApplied) return;
    lastApplied = z;
    // Se lo pedimos al sistema de pellizco del propio iframe (sin pasar por el padre).
    window.postMessage({ bfSetZoom: { z: z } }, '*');
  }

  function check(){
    if(inBattle() && isPortrait()){
      if(timer) return;
      timer = setTimeout(function(){
        timer = null;
        if(!inBattle() || !isPortrait()) return;
        if(userZoomed() || pinchBusy()) return; // respeta al jugador
        applyZoom(ZOOM_PORTRAIT);
      }, DELAY);
    } else {
      if(timer){ clearTimeout(timer); timer = null; }
      if(!userZoomed() && !pinchBusy()) applyZoom(1);
    }
  }

  setInterval(check, 500);
  window.addEventListener('orientationchange', function(){ setTimeout(check, 300); });
  window.addEventListener('resize', check);
})();
</script>
`;