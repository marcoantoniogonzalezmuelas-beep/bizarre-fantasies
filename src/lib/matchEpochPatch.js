// "EPOCH" DE PARTIDA: invalida todo lo que la partida anterior dejó pendiente.
//
// Problema (multijugador, sobre todo para el invitado): al volver a jugar o entrar en otra
// partida se ejecutaban cosas de la anterior: un endTurn aplazado, un showResult retenido hasta
// 30 s, una cinemática de golpe mortal encolada, el onSettled de un dado... Cada una era un
// setTimeout/bucle sin saber que ya era otra partida.
//
//   window.__bfMatchEpoch        contador; sube con cada partida nueva
//   window.bfNewMatchEpoch(why)  lo sube, quita overlays residuales y avisa a los parches
//   window.bfOnMatchReset(fn)    un parche registra aquí su limpieza (colas, temporizadores)
//
// Quien aplace algo debe capturar el epoch y comprobarlo al despertar:
//   var ep = window.__bfMatchEpoch|0; setTimeout(function(){ if((window.__bfMatchEpoch|0)!==ep) return; ... });
export const MATCH_EPOCH_PATCH = `
<script>
(function(){
  if(window.bfNewMatchEpoch)return;
  window.__bfMatchEpoch=0;
  var hooks=[];
  var OVERLAYS=['bf-recap','bf-kill-ov','bf-abil-anim','bf-spec-cine','bf-rearm-cine','bf-epic-cine','bf-end-cine','bf-end-heroes','bf-final-blow'];
  window.bfOnMatchReset=function(fn){if(typeof fn==='function')hooks.push(fn);};
  window.bfNewMatchEpoch=function(why){
    window.__bfMatchEpoch=(window.__bfMatchEpoch|0)+1;
    // Cada limpieza va en su propio bloque: que una falle (p. ej. un nodo raro) no debe dejar sin
    // reiniciar las demás.
    try{
      // Datos del golpe mortal y esperas de la partida anterior
      window.__bfFinalBlow=null;window.__bfKillFinalShown=0;window.__bfDeathDelayUntil=0;window.__bfDeathVisHold={};
      window.__bfEndCine=0;window.__bfKillAnim=0;window.__bfEndCineDoneAt=0;window.__bfResultSent=false;window.__bfDiceSeen={};
    }catch(e){}
    try{
      // Marcas "ya sumado/registrado" de la partida anterior: si siguen puestas, la victoria de la
      // siguiente no suma al marcador ni se guarda en el ranking.
      window.__bfLogSent=false;
      if(typeof G!=='undefined'&&G){G.__bfScoredOnce=false;G.__bfScored=false;G.__bfWinCounted=false;}
    }catch(e){}
    try{
      OVERLAYS.forEach(function(id){var n=document.getElementById(id);if(n&&n.parentNode)n.parentNode.removeChild(n);});
    }catch(e){}
    try{
      Array.prototype.forEach.call(document.querySelectorAll('.bf-hdice,.bf-hdice-veil'),function(n){if(n.parentNode)n.parentNode.removeChild(n);});
    }catch(e){}
    for(var i=0;i<hooks.length;i++){try{hooks[i](why||'');}catch(e){}}
    return window.__bfMatchEpoch;
  };
  // Cualquier partida nueva (contra la IA, local, revancha, partida online) pasa por initGame.
  function hookInitGame(){
    if(typeof window.initGame!=='function'||window.initGame.__bfEpoch)return false;
    var orig=window.initGame;
    window.initGame=function(){window.bfNewMatchEpoch('initGame');return orig.apply(this,arguments);};
    window.initGame.__bfEpoch=1;
    return true;
  }
  var tries=0,t=setInterval(function(){if(hookInitGame()||tries++>200)clearInterval(t);},200);
  hookInitGame();
})();
</script>
`;
