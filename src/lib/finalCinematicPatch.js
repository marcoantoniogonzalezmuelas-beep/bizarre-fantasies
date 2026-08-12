// Parche visual: dispara la cinemática de muerte (bfKillCinematic) cuando un
// héroe cae en batalla, y retrasa el siguiente turno para que no se solape.
//
// NOTA: La cinemática FINAL de fin de partida (videos de victoria/derrota con
// castillos, caballeros, etc.) la gestiona el propio juego con su función
// local bfEndCinematic() y sus arrays VICTORY_VIDEOS / DEFEAT_VIDEOS. No la
// enganchamos aquí para no interferir ni solapar un overlay encima del video.
export const FINAL_CINEMATIC_PATCH = `
<script>
(function(){
  if(window.__bfFinalCinematicPatch)return;
  window.__bfFinalCinematicPatch=true;

  function installDeath(){
    if(typeof window.flushFx!=='function')return false;
    if(window.flushFx.__bfFinalKill)return true;
    var original=window.flushFx;
    window.flushFx=function(events){
      var hasDeath=false;
      (events||[]).forEach(function(ev){
        if(!ev||ev.k!=='death')return;
        hasDeath=true;
        setTimeout(function(){
          var card=document.getElementById('b_'+ev.side+'_'+ev.id);
          if(card){
            if(typeof window.bfKillCinematic==='function')window.bfKillCinematic(card);
            card.classList.add('bf-truedead');
          }
        },60);
      });
      // Si hubo una muerte, el siguiente endTurn espera a que termine la
      // cinemática de muerte (2.7s, ralentizada para ver bien quién mata a
      // quién) para no solaparse con la siguiente acción.
      if(hasDeath) window.__bfDeathDelayUntil=Date.now()+2700;
      return original.apply(this,arguments);
    };
    window.flushFx.__bfFinalKill=1;
    return true;
  }

  function installDeathDelay(){
    if(typeof window.endTurn!=='function'||window.endTurn.__bfDeathDelay)return false;
    var orig=window.endTurn;
    window.endTurn=function(){
      var args=arguments,self=this;
      var until=window.__bfDeathDelayUntil||0,now=Date.now();
      if(until>now){
        setTimeout(function(){orig.apply(self,args);},until-now);
      }else{
        return orig.apply(self,args);
      }
    };
    window.endTurn.__bfDeathDelay=1;
    return true;
  }

  var attempts=0, timer=setInterval(function(){
    attempts++;
    var c=installDeath(), d=installDeathDelay();
    if((c&&d)||attempts>300)clearInterval(timer);
  },200);
  installDeath(); installDeathDelay();
})();
</script>
`;