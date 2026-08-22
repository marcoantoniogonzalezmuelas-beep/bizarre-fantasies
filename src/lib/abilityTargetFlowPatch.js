// Orden correcto de las habilidades que piden objetivo ("tarjetear"):
//   1) se activa la habilidad → cinemática 3D,
//   2) al terminar la cinemática → diálogo de elegir objetivo,
//   3) al elegir → efecto visual del impacto.
//
// Arregla dos fallos: (a) se podía volver a pulsar la habilidad mientras la
// cinemática estaba en pantalla, y el juego pedía objetivo dos veces;
// (b) el selector de objetivo aparecía debajo de la cinemática, así que el
// jugador tarjeteaba a ciegas y el efecto se solapaba con la animación.
export const ABILITY_TARGET_FLOW_PATCH = `
<script>
(function(){
  if(window.__bfAbilTargetFlow)return;
  window.__bfAbilTargetFlow=true;

  function cineOn(){
    try{ return !!document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov'); }catch(e){ return false; }
  }

  // 1) El selector de objetivo espera a que termine la cinemática 3D.
  function wrapPend(){
    if(typeof window.pendTarget!=='function'||window.pendTarget.__bfFlow)return false;
    var orig=window.pendTarget;
    var w=function(){
      var self=this,args=arguments;
      if(!cineOn())return orig.apply(self,args);
      var waited=0,iv=setInterval(function(){
        waited+=200;
        if(!cineOn()||waited>9000){ clearInterval(iv); orig.apply(self,args); }
      },200);
    };
    w.__bfFlow=true;
    window.pendTarget=w;
    return true;
  }

  // 2) Una sola activación por acción: mientras la habilidad está resolviéndose
  //    (cinemática + selección de objetivo) se ignoran nuevas pulsaciones.
  function wrapAbility(){
    if(typeof window.useAbility!=='function'||window.useAbility.__bfFlow)return false;
    var orig=window.useAbility;
    var w=function(side,h,done){
      var now=Date.now();
      if(window.__bfAbilBusy&&now-window.__bfAbilBusy<14000)return;
      window.__bfAbilBusy=now;
      var release=function(){ window.__bfAbilBusy=0; };
      var wrapped=function(){
        release();
        if(typeof done==='function')return done.apply(this,arguments);
        if(typeof finishAct==='function')finishAct();
      };
      setTimeout(release,14000);
      return orig.call(this,side,h,wrapped);
    };
    w.__bfFlow=true;
    window.useAbility=w;
    return true;
  }

  var n=0,iv=setInterval(function(){
    var a=wrapPend(),b=wrapAbility();
    if((window.pendTarget&&window.pendTarget.__bfFlow&&window.useAbility&&window.useAbility.__bfFlow)||n++>200)clearInterval(iv);
  },200);
})();
</script>
`;