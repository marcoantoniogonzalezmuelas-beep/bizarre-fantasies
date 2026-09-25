// Las habilidades que piden objetivo esperan a confirmar la elección final
// antes de reproducir su cinemática; evita anticipos, cancelaciones y duplicados.
export const ABILITY_TARGET_FLOW_PATCH = `
<script>
(function(){
  if(window.__bfAbilTargetFlow)return;
  window.__bfAbilTargetFlow=true;

  function cineOn(){
    try{ return (typeof window.__bfCinematicBusy==='function' && window.__bfCinematicBusy()) || !!document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov'); }catch(e){ return false; }
  }

  // El primer selector abierto durante la habilidad es suyo; las selecciones
  // adicionales comparten la misma acción hasta que su callback final termina.
  var active=null;
  function wrapPend(){
    if(typeof window.pendTarget!=='function'||window.pendTarget.__bfFlow)return false;
    var orig=window.pendTarget;
    var w=function(){
      var action=active;
      if(action){
        action.targeted=true;
        window.__bfTargetAbilityPending=action;
      }
      var self=this,args=arguments, battle=B, current=B && B.current, round=B && B.round, qi=B && B.qi;
      if(!cineOn())return orig.apply(self,args);
      var iv=setInterval(function(){
        if(B !== battle || !B || B.over || B.current !== current || B.round !== round || B.qi !== qi){ clearInterval(iv); return; }
        if(!cineOn()){ clearInterval(iv); orig.apply(self,args); }
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
      if(typeof NET !== 'undefined' && NET.role === 'client'){ sendIntent('ability',{}); return; }
      if(!h || h.abilityUsed || !B || B.over || B.pending || window.__bfAbilityChoiceWaiting) return;
      var key=side+':'+h.id+':'+B.round+':'+B.qi;
      if(window.__bfAbilBusy && window.__bfAbilBusy.key === key) return;
      var lock={key:key,hero:h,side:side,targeted:false}, completed=false;
      window.__bfAbilBusy=lock;
      var release=function(){
        if(window.__bfTargetAbilityPending===lock)window.__bfTargetAbilityPending=null;
        if(window.__bfAbilBusy===lock)window.__bfAbilBusy=0;
      };
      window.bfReleaseAbility=release;
      var wrapped=function(){
        if(completed)return;
        completed=true;
        var valid=B && !B.over && B.current && B.current.side+':'+B.current.id+':'+B.round+':'+B.qi===key && !B.pending;
        release();
        if(!valid)return;
        if(lock.targeted){
          if(typeof window.__bfPlayAbilityAnim==='function')window.__bfPlayAbilityAnim(side,h);
          if(typeof window.__bfSendTargetAbilityCine==='function')window.__bfSendTargetAbilityCine(side,h);
        }
        if(typeof done==='function')return done.apply(this,arguments);
        if(typeof finishAct==='function')finishAct();
      };
      var previous=active;
      active=lock;
      try{return orig.call(this,side,h,wrapped);}finally{active=previous;}
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