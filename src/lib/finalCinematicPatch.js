// Último parche visual: dispara los remates y la cinemática final desde los
// eventos reales, después de que el resto de parches hayan envuelto el juego.
export const FINAL_CINEMATIC_PATCH = `
<script>
(function(){
  if(window.__bfFinalCinematicPatch)return;
  window.__bfFinalCinematicPatch=true;

  function installResult(){
    if(typeof window.showResult!=='function')return false;
    if(window.showResult.__bfFinalCine)return true;
    var original=window.showResult;
    window.showResult=function(youWin){
      var result=original.apply(this,arguments);
      setTimeout(function(){
        if(typeof window.bfEndCinematic==='function')window.bfEndCinematic(!!youWin);
      },120);
      return result;
    };
    window.showResult.__bfFinalCine=1;
    return true;
  }

  function installDeath(){
    if(typeof window.flushFx!=='function')return false;
    if(window.flushFx.__bfFinalKill)return true;
    var original=window.flushFx;
    window.flushFx=function(events){
      var result=original.apply(this,arguments);
      (events||[]).forEach(function(ev){
        if(!ev||ev.k!=='death')return;
        setTimeout(function(){
          var card=document.getElementById('b_'+ev.side+'_'+ev.id);
          if(card&&typeof window.bfKillCinematic==='function')window.bfKillCinematic(card);
        },60);
      });
      return result;
    };
    window.flushFx.__bfFinalKill=1;
    return true;
  }

  var attempts=0, timer=setInterval(function(){
    attempts++;
    var resultReady=installResult(), deathReady=installDeath();
    if((resultReady&&deathReady)||attempts>80)clearInterval(timer);
  },150);
  installResult(); installDeath();
})();
</script>
`;