// SINCRONIZACIÓN DEL FIN DE PARTIDA (multiplayer).
//
// Cuando la partida termina en un cliente, se avisa al otro jugador con un
// mensaje de red propio ('bfEndSync') para que los dos vean su pantalla final.
// Solo actúa con la pantalla de BATALLA activa: nunca durante subastas ni
// equipamiento (ahí no hay resultado que mostrar).
export const END_GAME_SYNC_PATCH = `
<script>
(function(){
  if(window.__bfEndSync) return;
  window.__bfEndSync = true;

  function inBattle(){
    var s = document.getElementById('s-battle');
    return !!(s && s.classList.contains('active'));
  }
  function resultShown(){
    var r = document.getElementById('s-result');
    return !!(r && r.classList.contains('active'));
  }
  function mySide(){
    try{ if(typeof NET!=='undefined'&&NET&&NET.role) return NET.mySide||(NET.role==='client'?'o':'p'); }catch(e){}
    return 'p';
  }

  // Avisa al rival en cuanto este cliente muestra su pantalla final.
  function hookShowResult(){
    if(typeof window.showResult !== 'function' || window.showResult.__bfEndSync) return false;
    var orig = window.showResult;
    window.showResult = function(youWin){
      try{
        if(typeof netSend === 'function' && !window.__bfEndSyncGot){
          // pWin: victoria del anfitrión (lado 'p'), independiente de quién avisa.
          var pWin = (youWin === (mySide() === 'p'));
          netSend({ t: 'bfEndSync', pWin: pWin });
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    window.showResult.__bfEndSync = 1;
    return true;
  }

  // Recibe el aviso del rival y muestra la pantalla final correcta.
  function handle(msg){
    if(!msg || msg.t !== 'bfEndSync') return;
    // Solo actúa en batalla o en la propia pantalla de resultado (para
    // corregir el vídeo si el cliente ya transicionó con un resultado local
    // equivocado). Nunca durante subastas ni equipamiento.
    if(!inBattle() && !resultShown()) return;
    // SAFETY: no procesar bfEndSync si ambos bandos siguen teniendo héroes
    // vivos. Previene finales falsos por mensajes bfEndSync erróneos o
    // duplicados (p. ej. cuando team.o no tiene el flag 'alive' puesto aún).
    if(inBattle() && typeof G !== 'undefined' && G && G.team && G.team.p && G.team.o){
      var pA = (G.team.p || []).filter(function(h){ return h && h.alive !== false && !h._bfDuck; }).length;
      var oA = (G.team.o || []).filter(function(h){ return h && h.alive !== false && !h._bfDuck; }).length;
      if(pA > 0 && oA > 0) return;
    }
    window.__bfEndSyncGot = true;
    try{
      if(typeof G !== 'undefined' && G) G._result = { pWin: !!msg.pWin };
      ['bf-abil-anim','bf-kill-ov','bf-spec-cine','bf-target-pick'].forEach(function(id){
        var el = document.getElementById(id);
        if(el && el.parentNode) el.parentNode.removeChild(el);
      });
      // Si la pantalla de resultado YA está activa, no la relanzamos: solo
      // actualizamos G._result (arriba) y reseteamos el guardián de la
      // cinemática para que bfEndCinematic relea el resultado correcto en
      // su próximo ciclo de 400ms y muestre el vídeo adecuado (victoria
      // o derrota) aunque ya hubiera proyectado el equivocado.
      if(resultShown()){
        window.__bfEndCine = 0;
        var oldCine = document.getElementById('bf-end-cine');
        if(oldCine && oldCine.parentNode) oldCine.parentNode.removeChild(oldCine);
        return;
      }
      var youWin = (!!msg.pWin === (mySide() === 'p'));
      if(typeof showResult === 'function') showResult(youWin);
      else if(typeof show === 'function') show('s-result');
    }catch(e){}
    setTimeout(function(){ window.__bfEndSyncGot = false; }, 4000);
  }

  // Escucha los datos de red del juego sin romper su propio manejador.
  function hookNetRecv(){
    if(typeof window.netOnData !== 'function' || window.netOnData.__bfEndSync) return false;
    var orig = window.netOnData;
    window.netOnData = function(msg){
      try{ handle(msg); }catch(e){}
      return orig.apply(this, arguments);
    };
    window.netOnData.__bfEndSync = 1;
    return true;
  }

  var tries = 0, t = setInterval(function(){
    var a = hookShowResult(), b = hookNetRecv();
    if((window.showResult && window.showResult.__bfEndSync && window.netOnData && window.netOnData.__bfEndSync) || tries++ > 200) clearInterval(t);
  }, 200);
})();
</script>
`;