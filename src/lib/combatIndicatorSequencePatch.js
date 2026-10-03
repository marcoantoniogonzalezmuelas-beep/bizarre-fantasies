// One visual-only queue. Game state is applied immediately; reading time starts
// only after every mounted/queued action cinematic has finished.
export const COMBAT_INDICATOR_SEQUENCE_PATCH = `
<script>
(function(){
  if(window.__bfQueueIndicator)return;
  var waiting=[],visible=[],quietSince=0,last=Date.now(),wasBlocked=false;
  var CINES='#bf-abil-anim,#bf-spec-cine,#bf-epic-cine,#bf-kill-ov,#bf-end-cine,#bf-final-blow,#bf-rearm-cine,#bf-ai-victory';
  function blocked(){
    return !!(window.__bfTargetAbilityPending || document.querySelector(CINES) ||
      document.body.classList.contains('bf-cine-active') ||
      (typeof window.__bfCinematicBusy==='function'&&window.__bfCinematicBusy()));
  }
  function remove(job){job.nodes.forEach(function(n){if(n.parentNode)n.parentNode.removeChild(n);});}
  // FLUIDEZ: el turno siguiente espera a que se lean los carteles (daño, estados, stats...). Con los tiempos
  // originales (2,2-4,8 s) entre turno y turno pasaban 3-7 s sin nadie jugando. Se leen al 65 % de su tiempo
  // (nunca menos de 1,2 s); siguen pausándose durante las cinemáticas, así que no se pierde ninguno.
  var READ_SCALE=0.65,READ_MIN=1200;
  window.__bfQueueIndicator=function(paint,duration){
    var d=Math.max(READ_MIN,Math.round((Number(duration)||READ_MIN)*READ_SCALE));
    waiting.push({paint:paint,duration:d,ready:Date.now()+300});
  };
  window.__bfIndicatorsBusy=function(){return waiting.length>0||visible.length>0;};
  function tick(){
    var now=Date.now(),dt=now-last;last=now;
    var battle=document.getElementById('s-battle');
    if(!battle||!battle.classList.contains('active')){
      waiting=[];visible.forEach(remove);visible=[];quietSince=0;wasBlocked=false;return;
    }
    var hold=blocked();
    if(hold)quietSince=0;else if(!quietSince)quietSince=now;
    visible=visible.filter(function(job){
      // Pausing also protects a marker if a later network cinematic arrives.
      job.nodes.forEach(function(n){
        n.style.visibility=hold?'hidden':'';
        n.style.animationPlayState=hold?'paused':'running';
      });
      if(!hold&&!wasBlocked)job.remaining-=dt;
      if(job.remaining>0)return true;
      remove(job);return false;
    });
    wasBlocked=hold;
    if(hold||now-quietSince<200)return;
    var ready=waiting.filter(function(j){return j.ready<=now;});
    waiting=waiting.filter(function(j){return j.ready>now;});
    ready.forEach(function(job){
      var nodes=job.paint()||[];
      if(!Array.isArray(nodes))nodes=[nodes];
      nodes.forEach(function(n){n.dataset.bfIndicator='1';});
      if(nodes.length)visible.push({nodes:nodes,remaining:job.duration});
    });
  }
  setInterval(tick,50);
  // Direct children only: catch overlays before the next paint, without
  // observing animated particles or changing any game/turn state.
  var observer=new MutationObserver(tick);
  observer.observe(document.body,{childList:true});
  if(window.__bfFxRoot)observer.observe(window.__bfFxRoot(),{childList:true});
})();
</script>
`;