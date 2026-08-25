// RESCATE DEL FIN DE PARTIDA.
//
// Síntoma que arregla: al morir el último héroe rival (contra la IA o en
// multijugador) la partida se queda congelada en el tablero y nunca aparece la
// pantalla final.
//
// Dos causas reales, las dos cubiertas aquí:
//  1) El motor ya dio la partida por terminada (B.over + G._result) y programó
//     la pantalla final con un setTimeout, pero esa llamada se perdió (error en
//     una cinemática, repintado fallido…). La red de seguridad anterior se
//     rendía justo en este caso, porque solo actuaba con B.over === false.
//  2) De un bando solo quedan criaturas invocadas (patitos, grulla…): el motor
//     las cuenta como vivas y no declara la victoria, pero ninguna tiene turno,
//     así que la partida no avanza nunca.
//
// No cambia ninguna regla: solo muestra el resultado que ya estaba decidido.
export const END_GAME_RESCUE_PATCH = `
<script>
(function(){
  if(window.__bfEndRescue) return;
  window.__bfEndRescue = true;

  function inBattle(){
    var s = document.getElementById('s-battle');
    return !!(s && s.classList.contains('active'));
  }
  function resultShown(){
    var r = document.getElementById('s-result');
    return !!(r && r.classList.contains('active'));
  }
  function mySide(){
    try{ if(typeof NET !== 'undefined' && NET && NET.role) return NET.mySide || (NET.role === 'client' ? 'o' : 'p'); }catch(e){}
    return 'p';
  }
  // Héroes REALES vivos (las criaturas invocadas no sostienen la partida).
  function realAlive(side){
    try{
      return (G.team[side] || []).filter(function(h){ return h && h.alive && !h._token && !h._bfDuck; }).length;
    }catch(e){ return 1; }
  }
  function clearOverlays(){
    ['bf-abil-anim','bf-spec-cine','bf-kill-ov','bf-target-pick'].forEach(function(id){
      var el = document.getElementById(id);
      if(el && el.parentNode) el.parentNode.removeChild(el);
    });
  }
  function forceResult(pWin){
    clearOverlays();
    var youWin = (pWin === (mySide() === 'p'));
    try{
      if(typeof G !== 'undefined' && G) { G._result = { pWin: pWin }; G._gameOver = true; }
      if(typeof B !== 'undefined' && B) B.over = true;
    }catch(e){}
    try{
      if(typeof window.showResult === 'function') window.showResult(youWin);
      else if(typeof window.show === 'function') window.show('s-result');
    }catch(e){
      try{ if(typeof window.show === 'function') window.show('s-result'); }catch(e2){}
    }
  }

  var overSince = 0, extinctSince = 0;

  setInterval(function(){
    try{
      if(typeof G === 'undefined' || !G || G.demo) return;
      if(!inBattle() || resultShown()){ overSince = 0; extinctSince = 0; return; }

      // 1) El motor ya decidió el resultado pero la pantalla final no llegó.
      var over = false;
      try{ over = !!(typeof B !== 'undefined' && B && B.over); }catch(e){}
      if(over && G._result && typeof G._result.pWin === 'boolean'){
        if(!overSince) overSince = Date.now();
        else if(Date.now() - overSince > 3000){
          overSince = 0;
          forceResult(!!G._result.pWin);
        }
        return;
      }
      overSince = 0;

      // 2) Un bando se ha quedado sin héroes reales y la partida sigue abierta.
      if(!G.team || !G.team.p || !G.team.o) { extinctSince = 0; return; }
      var pA = realAlive('p'), oA = realAlive('o');
      if(pA > 0 && oA > 0){ extinctSince = 0; return; }
      if(!extinctSince){ extinctSince = Date.now(); return; }
      if(Date.now() - extinctSince < 4000) return;
      extinctSince = 0;
      // En multijugador solo el anfitrión declara el final; el cliente lo recibe.
      try{ if(typeof NET !== 'undefined' && NET && NET.role === 'client') return; }catch(e){}
      if(typeof window.checkWin === 'function' && window.checkWin()) return;
      forceResult(oA === 0);
    }catch(e){}
  }, 1000);
})();
</script>
`;