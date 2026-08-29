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

  // ORDEN de una muerte: 1) termina la animación de la acción (habilidad,
  // hechizo, objeto…), 2) se ve el número de daño sobre el retrato, 3) recién
  // entonces arranca la cinemática de golpe mortal. Antes el golpe mortal se
  // lanzaba a los 60 ms y se comía la animación que había provocado la muerte.
  var CINE_SEL='#bf-abil-anim,#bf-spec-cine';
  function whenActionEnds(cb){
    var start=Date.now();
    (function tick(){
      // Espera a que no quede ninguna cinemática de acción en pantalla NI EN
      // COLA (con techo de 6 s por seguridad) y deja 700 ms para leer el daño.
      var busy=(typeof window.__bfCinematicBusy==='function'&&window.__bfCinematicBusy())||document.querySelector(CINE_SEL);
      if(busy&&Date.now()-start<6000)return setTimeout(tick,150);
      setTimeout(cb,700);
    })();
  }

  function installDeath(){
    if(typeof window.flushFx!=='function')return false;
    if(window.flushFx.__bfFinalKill)return true;
    var original=window.flushFx;
    window.flushFx=function(events){
      var hasDeath=false;
      (events||[]).forEach(function(ev){
        if(!ev||ev.k!=='death')return;
        hasDeath=true;
        whenActionEnds(function(){
          var card=document.getElementById('b_'+ev.side+'_'+ev.id);
          if(card){
            if(typeof window.bfKillCinematic==='function')window.bfKillCinematic(card);
            card.classList.add('bf-truedead');
          }
          // El turno no avanza hasta que termine la cinemática de muerte.
          window.__bfDeathDelayUntil=Date.now()+3700;
        });
      });
      // Si hubo una muerte, el siguiente endTurn espera a que termine la
      // cinemática de muerte (2.7s, ralentizada para ver bien quién mata a
      // quién) para no solaparse con la siguiente acción.
      if(hasDeath) window.__bfDeathDelayUntil=Date.now()+4500;
      return original.apply(this,arguments);
    };
    window.flushFx.__bfFinalKill=1;
    return true;
  }

  function installDeathDelay(){
    if(typeof window.endTurn!=='function'||window.endTurn.__bfDeathDelay)return false;
    var orig=window.endTurn;
    window.endTurn=function(){
      // IMPORTANTE: el fin de turno NUNCA se aplaza en bucle esperando a las
      // cinemáticas — un endTurn aplazado se disparaba más tarde y "forzaba"
      // el turno del jugador. La barra de turnos (por velocidad) manda: solo
      // se respeta la breve espera tras una muerte, y una única vez.
      var until=window.__bfDeathDelayUntil||0,now=Date.now();
      if(until>now){
        var args=arguments,self=this;
        window.__bfDeathDelayUntil=0;
        return setTimeout(function(){orig.apply(self,args);},until-now);
      }
      return orig.apply(this,arguments);
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