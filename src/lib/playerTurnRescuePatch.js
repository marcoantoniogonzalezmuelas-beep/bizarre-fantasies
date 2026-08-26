// RESCATE DEL TURNO DEL JUGADOR.
//
// Síntoma: le toca a tu héroe (lleva su insignia "SU TURNO") pero el panel de
// acciones se queda en gris y no se puede pulsar nada. Ocurre cuando una
// petición de objetivo de una acción anterior (habilidad, hechizo) se quedó
// abierta en el motor: el juego sigue creyendo que estás eligiendo un objetivo
// que ya no existe en pantalla, así que bloquea los botones.
//
// Este guardián NO fuerza turnos ni cambia reglas: si en el turno del jugador
// hay una petición de objetivo abierta durante más de 8 segundos, sin ninguna
// cinemática ni ventana en pantalla y sin el modo "elegir objetivo" activo, la
// cancela y repinta el tablero para que el panel vuelva a estar operativo.
export const PLAYER_TURN_RESCUE_PATCH = `
<script>
(function(){
  if(window.__bfPlayerTurnRescue) return;
  window.__bfPlayerTurnRescue = true;

  var STUCK_MS = 8000;
  var since = 0;

  function overlays(){
    if(document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov')) return true;
    var mr = document.getElementById('modalRoot');
    if(mr && mr.children.length) return true;
    if(document.body.classList.contains('bf-cine-active')) return true;
    return false;
  }

  function pickingUi(){
    // El juego marca el modo "elegir objetivo" en el documento y muestra su
    // cartel: si está visible, el jugador SÍ tiene que elegir; no se toca.
    if(document.querySelector('.picking-target')) return true;
    if(document.querySelector('#targetPrompt,.target-prompt,.pick-banner')) return true;
    return false;
  }

  setInterval(function(){
    try{
      var scr = document.getElementById('s-battle');
      if(!scr || !scr.classList.contains('active')) { since = 0; return; }
      if(typeof B === 'undefined' || !B || B.over || !B.current) { since = 0; return; }
      if(typeof humanCtl !== 'function' || !humanCtl(B.current.side)) { since = 0; return; }
      if(!B.pending || overlays() || pickingUi()) { since = 0; return; }

      if(!since) { since = Date.now(); return; }
      if(Date.now() - since < STUCK_MS) return;
      since = 0;

      B.pending = null;
      try{ document.querySelectorAll('.picking-target').forEach(function(el){ el.classList.remove('picking-target'); }); }catch(e){}
      try{ if(typeof pushLog === 'function') pushLog('li', '\\u{1F6E1}\\uFE0F Hab\\u00eda una elecci\\u00f3n de objetivo colgada: se cancela y puedes volver a actuar.'); }catch(e){}
      try{ if(typeof renderBattle === 'function') renderBattle(); }catch(e){}
    }catch(e){}
  }, 1000);
})();
</script>
`;