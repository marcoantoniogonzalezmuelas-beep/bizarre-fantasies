// GUARDIÁN DE FIN DE PARTIDA (sobre todo en multiplayer).
//
// Síntoma que arregla: la partida acaba, el ganador ve su pantalla final, pero
// el PERDEDOR se queda encallado en el tablero (el aviso de fin no llega por la
// red, o una cinemática/overlay se queda colgada tapando el cambio de pantalla).
//
// El guardián vigila en silencio, sin botones ni avisos: en cuanto un bando se
// queda sin héroes vivos, espera 1,5 s (por si la pantalla final llega sola),
// limpia los overlays colgados y fuerza la pantalla de resultado con el
// resultado CORRECTO para este jugador. Si la pantalla siguiera sin activarse,
// la activa a mano. Así los dos jugadores ven su cinemática y su resultado.
export const END_GAME_GUARD_PATCH = `
<script>
(function(){
  if(window.__bfEndGuard) return;
  window.__bfEndGuard = true;

  function active(id){
    try{ var s=document.getElementById(id); return !!(s&&s.classList.contains('active')); }catch(e){ return false; }
  }
  function alive(side){
    try{ return (G.team[side]||[]).filter(function(h){ return h&&h.alive&&!h._token&&!h._bfDuck; }).length; }catch(e){ return 1; }
  }
  function clearOverlays(){
    ['bf-abil-anim','bf-kill-ov','bf-spec-cine','bf-target-pick'].forEach(function(id){
      var el=document.getElementById(id);
      if(el&&el.parentNode) el.parentNode.removeChild(el);
    });
  }
  function mySide(){
    try{ if(typeof NET!=='undefined'&&NET&&NET.role) return NET.mySide||(NET.role==='client'?'o':'p'); }catch(e){}
    return 'p';
  }

  var since=0, forced=0;

  setInterval(function(){
    try{
      if(typeof G==='undefined'||!G||G.demo||!G.team) return;
      if(active('s-title')){ since=0; forced=0; return; }
      if(active('s-result')){ since=0; return; }

      var pAlive=alive('p'), oAlive=alive('o');
      var decided = (typeof B!=='undefined'&&B&&B.over) || pAlive===0 || oAlive===0;
      if(!decided){ since=0; return; }

      if(!since){ since=Date.now(); return; }
      if(Date.now()-since < 1500) return;

      // Resultado real: 'p' es siempre el anfitrión. Si el motor ya lo calculó
      // se respeta; si no, gana quien conserve héroes vivos.
      var pWin = (G._result && typeof G._result.pWin==='boolean') ? G._result.pWin : (oAlive===0 && pAlive>0);
      G._result = { pWin: pWin };
      var youWin = (pWin === (mySide()==='p'));

      clearOverlays();
      forced++;
      if(forced<=3 && typeof showResult==='function'){ showResult(youWin); return; }

      // Último recurso: la pantalla final existe pero nadie la activó.
      if(typeof show==='function') show('s-result');
      since = 0;
    }catch(e){}
  }, 600);
})();
</script>
`;