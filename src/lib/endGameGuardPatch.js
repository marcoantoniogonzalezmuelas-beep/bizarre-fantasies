// GUARDIÁN DE FIN DE PARTIDA (sobre todo en multiplayer).
//
// Síntoma que arregla: la partida acaba, el ganador ve su pantalla final y su
// cinemática, pero el PERDEDOR se queda encallado en el tablero. Pasa cuando la
// llamada a la pantalla final se pierde (mensaje de red que no llega, o una
// cinemática/overlay que sigue en pantalla cuando toca cerrar la batalla).
//
// El guardián vigila en silencio: si la partida ya está decidida (B.over o un
// bando extinto) y a los 3 s la pantalla de resultado no está activa, limpia
// los overlays de cinemática que hayan quedado colgados y fuerza la pantalla
// final con el resultado correcto para este jugador.
export const END_GAME_GUARD_PATCH = `
<script>
(function(){
  if(window.__bfEndGuard) return;
  window.__bfEndGuard = true;

  function resultActive(){
    try{ var s=document.getElementById('s-result'); return !!(s&&s.classList.contains('active')); }catch(e){ return false; }
  }
  function battleActive(){
    try{ var s=document.getElementById('s-battle'); return !!(s&&s.classList.contains('active')); }catch(e){ return false; }
  }
  function alive(side){
    try{ return (G.team[side]||[]).filter(function(h){ return h&&h.alive&&!h._token&&!h._bfDuck; }).length; }catch(e){ return 1; }
  }
  function clearOverlays(){
    ['bf-abil-anim','bf-kill-ov','bf-spec-cine'].forEach(function(id){
      var el=document.getElementById(id);
      if(el&&el.parentNode) el.parentNode.removeChild(el);
    });
  }

  var since = 0;
  setInterval(function(){
    try{
      if(typeof G==='undefined'||!G||G.demo) return;
      if(resultActive()||G._gameOver){ since=0; return; }
      if(!battleActive()||typeof B==='undefined'||!B||!G.team) return;

      var decided = !!B.over || alive('p')===0 || alive('o')===0;
      if(!decided){ since=0; return; }

      if(!since){ since=Date.now(); return; }
      if(Date.now()-since < 3000) return;
      since = 0;

      // Resultado de este jugador: 'p' es siempre el anfitrión.
      var pWin = (G._result && typeof G._result.pWin==='boolean') ? G._result.pWin : (alive('o')===0);
      var mySide='p';
      try{ if(typeof NET!=='undefined'&&NET&&NET.role) mySide = NET.mySide || (NET.role==='client'?'o':'p'); }catch(e){}
      G._result = { pWin: pWin };

      clearOverlays();
      if(typeof showResult==='function') showResult(pWin === (mySide==='p'));
    }catch(e){}
  }, 1000);
})();
</script>
`;