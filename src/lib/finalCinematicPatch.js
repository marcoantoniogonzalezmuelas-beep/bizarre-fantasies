// Último parche visual: dispara los remates y la cinemática final desde los
// eventos reales, después de que el resto de parches hayan envuelto el juego.
// Usa un retry más largo (300 intentos = 60s) porque el juego puede tardar en
// definir showResult/flushFx, y también engancha checkWin como respaldo.
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

  // Respaldo: checkWin suele llamar a showResult, pero si el juego lo redefine
  // después de que enganchamos showResult, este respaldo asegura que la
  // cinemática se dispare igualmente al detectar el fin de partida.
  function installCheckWin(){
    if(typeof window.checkWin!=='function')return false;
    if(window.checkWin.__bfFinalCine)return true;
    var original=window.checkWin;
    window.checkWin=function(){
      var r=original.apply(this,arguments);
      // Si la partida terminó (B.over), lanza la cinemática tras un breve retardo.
      setTimeout(function(){
        try{
          if(typeof B!=='undefined'&&B.over&&typeof window.bfEndCinematic==='function'){
            // Determina si el jugador ganó: en modo IA/local, el jugador es 'p'.
            // Si todos los héroes de 'o' están muertos, el jugador ganó.
            var pAlive=(typeof G!=='undefined'&&G.team&&G.team.p)?G.team.p.filter(function(h){return h&&h.alive;}).length:0;
            var oAlive=(typeof G!=='undefined'&&G.team&&G.team.o)?G.team.o.filter(function(h){return h&&h.alive;}).length:0;
            var youWin=oAlive===0&&pAlive>0;
            window.bfEndCinematic(youWin);
          }
        }catch(e){}
      },200);
      return r;
    };
    window.checkWin.__bfFinalCine=1;
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
    var a=installResult(), b=installCheckWin(), c=installDeath();
    if((a&&c)||attempts>300)clearInterval(timer);
  },200);
  installResult(); installCheckWin(); installDeath();
})();
</script>
`;