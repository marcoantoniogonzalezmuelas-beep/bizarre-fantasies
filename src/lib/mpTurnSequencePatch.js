// SECUENCIA DE TURNO IDÉNTICA PARA LOS DOS JUGADORES (y contra la IA):
// acción → cinemática 3D → efecto visual → golpe mortal (si hay muerte) →
// y solo cuando todo ha terminado, pasa el turno al héroe que le toque.
//
// El juego avanza los turnos con bfStepWhenCalm, que solo miraba si había una
// cinemática en pantalla. Aquí se amplía la espera a la capa de efectos
// visuales (números de daño/curación, absorciones, avisos de turno), igual que
// hace la IA, y se exige un margen de calma para que el golpe mortal —que se
// crea justo después del efecto— no se solape con el turno siguiente.
export const MP_TURN_SEQUENCE_PATCH = `
<script>
(function(){
  if(window.__bfMpTurnSeq) return;
  window.__bfMpTurnSeq = true;

  function fxBusy(){
    var l = document.getElementById('bf-fx-layer');
    if(l && l.children.length){
      // Solo cuenta como "ocupado" si hay nodos RECENTES (menos de 6s).
      // Los nodos colgados (setTimeout de borrado que no ejecutó el navegador
      // congelado por una ráfaga de FX del relay) NO deben bloquear el turno
      // para siempre: fxRootPatch los limpia a los 8s, pero aquí damos margen
      // de 6s para que el turno avance antes de esperar a la limpieza.
      var now=Date.now();
      for(var i=0;i<l.children.length;i++){
        var n=l.children[i];
        if(n.nodeType!==1)continue;
        var t=Number(n.dataset&&n.dataset.bfT||0)||Number(n.dataset&&n.dataset.bfSeen||0);
        if(!t||now-t<6000)return true;
      }
    }
    return !!document.querySelector('.bf-dmg-num,.bf-heal-num,.bf-absorb-pop,.bf-skip-pop');
  }
  function cineBusy(){
    return (typeof window.__bfCinematicBusy==='function' && window.__bfCinematicBusy())
        || !!document.getElementById('bf-abil-anim')
        || !!document.getElementById('bf-spec-cine')
        || !!document.getElementById('bf-kill-ov')
        || document.body.classList.contains('bf-cine-active');
  }
  function killPending(){ return typeof window.__bfKillCinePending === 'function' && window.__bfKillCinePending(); }
  function indicatorsBusy(){return typeof window.__bfIndicatorsBusy==='function'&&window.__bfIndicatorsBusy();}
  function busy(){ return cineBusy() || fxBusy() || killPending() || indicatorsBusy(); }

  window.bfStepWhenCalm = function(next){
    var min = 120, max = 4000, quiet = 120, step = 50, started = Date.now(), quietFrom = 0, watchdogAt = 0;
    function tick(){
      var now = Date.now(), elapsed = now - started, occupied = busy();
      if(occupied) quietFrom = 0;
      else if(!quietFrom) quietFrom = now;
      var calm = !occupied && quietFrom && (now - quietFrom >= quiet);
      // Stale particles may time out; queued deaths and readable captions may not.
      if((elapsed >= min && calm) || (elapsed >= max && !cineBusy() && !indicatorsBusy() && !killPending())){ try{ next(); }catch(e){} return; }
      // Mientras se espera, se re-arma el vigilante del juego para que no
      // considere el turno atascado durante la animación.
      if(now - watchdogAt >= 1000){
        watchdogAt = now;
        try{ if(typeof window.armWatchdog === 'function'){ if(typeof window.clearWatchdog === 'function') window.clearWatchdog(); window.armWatchdog(); } }catch(e){}
      }
      setTimeout(tick, step);
    }
    setTimeout(tick, step);
  };
})();
</script>
`;