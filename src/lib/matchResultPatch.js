// Parche inyectado en el iframe: al terminar una partida envía el resultado
// (ganador, perdedor y héroes de cada bando) a la página padre, que lo guarda
// en la base de datos para el Top Ranking.
export const MATCH_RESULT_PATCH = `
<script>
(function(){
  if(window.__bfMatchResult)return;
  window.__bfMatchResult=true;

  function heroList(arr){
    // Los tokens invocados (patitos de goma, etc.) no son héroes: no cuentan
    // para victorias, caídas ni renaceres Élite en el ranking.
    return (arr||[]).filter(function(h){return h&&!h._token&&!h._bfDuck;})
      .map(function(h){return {name:h.name||'',died:!h.alive,elite:!!h.eliteUsed};});
  }
  function report(youWin){
    try{
      if(typeof G==='undefined'||G.demo)return;
      if(window.__bfResultSent)return;window.__bfResultSent=true;
      var isOnline=(typeof online==='function')?online():false;
      // Online solo registra el host: evita el resultado duplicado del cliente.
      if(isOnline&&typeof NET!=='undefined'&&NET.role==='client')return;
      var winnerSide=youWin?'p':'o',loserSide=youWin?'o':'p';
      var winner,loser,winnerIsAi=false,loserIsAi=false;
      if(isOnline&&typeof NET!=='undefined'){
        winner=youWin?(NET.names_self||'Jugador'):(NET.names_opp||'Rival');
        loser=youWin?(NET.names_opp||'Rival'):(NET.names_self||'Jugador');
      }else{
        winner=(G.names&&G.names[winnerSide])||'Jugador';
        loser=(G.names&&G.names[loserSide])||'Rival';
        if(!G.oppHuman){if(winnerSide==='o')winnerIsAi=true;else loserIsAi=true;}
      }
      window.parent.postMessage({bfMatchResult:{
        winner_nick:winner,loser_nick:loser,
        mode:isOnline?'online':(G.oppHuman?'local':'ia'),
        winner_is_ai:winnerIsAi,loser_is_ai:loserIsAi,
        winner_heroes:heroList(G.team&&G.team[winnerSide]),
        loser_heroes:heroList(G.team&&G.team[loserSide])
      }},'*');
    }catch(e){}
  }
  function install(){
    if(typeof window.showResult!=='function'||window.showResult.__bfStats)return false;
    var orig=window.showResult;
    window.showResult=function(youWin){report(youWin);return orig.apply(this,arguments);};
    window.showResult.__bfStats=1;
    return true;
  }
  var tries=0,t=setInterval(function(){if(install()||tries++>100)clearInterval(t);},200);
})();
</script>
`;