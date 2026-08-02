// Parche inyectado en el iframe: captura datos detallados de cada partida
// (modo, héroes, clanes, objetos comprados, turnos, duración, ganador) y los
// envía a la página padre como bfGameLog para que se guarden en la entidad
// GameLog y poder analizarlos después (mejorar la dificultad de la IA).
export const GAME_LOG_PATCH = `
<script>
(function(){
  if(window.__bfGameLog)return;
  window.__bfGameLog=true;
  var battleStart=null;
  var itemsBought=[];

  function clanOf(h){try{return h.clan||h.race||'';}catch(e){return '';}}
  function heroList(arr){
    return (arr||[]).filter(function(h){return h&&!h._token&&!h._bfDuck;})
      .map(function(h){return {name:h.name||'',clan:clanOf(h),elite:!!h.eliteUsed,died:!h.alive};});
  }

  function startLog(){battleStart=Date.now();itemsBought=[];}

  function endLog(youWin){
    if(!battleStart)return;
    try{
      if(typeof G==='undefined'||G.demo){battleStart=null;return;}
      if(window.__bfLogSent)return;
      window.__bfLogSent=true;
      var isOnline=(typeof online==='function')?online():false;
      var mode=isOnline?'online':(G.oppHuman?'local':'ia');
      var playerNick='',opponentNick='';
      if(isOnline&&typeof NET!=='undefined'){
        playerNick=NET.names_self||'Jugador';
        opponentNick=NET.names_opp||'Rival';
      }else if(typeof G!=='undefined'&&G.names){
        playerNick=G.names.p||'Jugador';
        opponentNick=G.names.o||'Rival';
      }
      var pH=heroList(G.team&&G.team.p);
      var oH=heroList(G.team&&G.team.o);
      var duration=Math.round((Date.now()-battleStart)/1000);
      var turns=0;try{turns=G.round||G.turn||G.turns||0;}catch(e){}
      var log={
        mode:mode,
        roomCode:(typeof NET!=='undefined'&&NET.code)||'',
        playerNick:playerNick,
        opponentNick:opponentNick,
        playerClan:(pH[0]&&pH[0].clan)||'',
        opponentClan:(oH[0]&&oH[0].clan)||'',
        playerHeroes:pH,
        opponentHeroes:oH,
        turnsPlayed:turns,
        winner:youWin?'player':'opponent',
        playerWon:!!youWin,
        events:[],
        itemsBought:itemsBought.slice(0,60),
        durationSeconds:duration
      };
      window.parent.postMessage({bfGameLog:log},'*');
    }catch(e){}
    battleStart=null;
  }

  function tick(){
    var inBattle=!!(document.getElementById('s-battle')&&document.getElementById('s-battle').classList.contains('active'));
    if(inBattle&&!battleStart)startLog();
    if(!inBattle&&battleStart&&!window.__bfLogSent){battleStart=null;window.__bfLogSent=false;}
  }
  setInterval(tick,1000);

  function install(){
    if(typeof window.showResult!=='function'||window.showResult.__bfLog)return false;
    var orig=window.showResult;
    window.showResult=function(youWin){
      try{endLog(youWin);}catch(e){}
      return orig.apply(this,arguments);
    };
    window.showResult.__bfLog=1;
    return true;
  }
  var tries=0,t=setInterval(function(){if(install()||tries++>100)clearInterval(t);},200);

  // Rastrear compras enganchando funciones de compra del juego
  function wrapBuy(name){
    if(typeof window[name]!=='function'||window[name].__bfBuyLog)return;
    var orig=window[name];
    window[name]=function(){
      try{var item=arguments[0]||arguments[1]||'';if(item)itemsBought.push({name:String(item),side:'p'});}catch(e){}
      return orig.apply(this,arguments);
    };
    window[name].__bfBuyLog=1;
  }
  function hookBuys(){['buySpell','buyItem','buyEq','buyObject','buyWeapon','buyArmor','buyEquipment'].forEach(wrapBuy);}
  var bt=0,bt2=setInterval(function(){hookBuys();if(bt++>100)clearInterval(bt2);},200);
})();
</script>
`;