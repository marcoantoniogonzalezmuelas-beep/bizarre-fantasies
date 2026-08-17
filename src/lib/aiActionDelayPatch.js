// Parche inyectado en el iframe: añade un retraso de ~1.8s entre acciones
// consecutivas de la IA para que las animaciones no se solapen. Cuando la IA
// juega varias veces seguidas (varios héroes con turnos consecutivos por
// velocidad, o varias acciones dentro del mismo turno — habilidad, hechizo,
// ataque), espera a que la animación anterior termine antes de empezar la
// siguiente. Sin esto, la IA ejecuta sus acciones tan rápido que las
// cinemáticas y FX se pisan y el jugador no sabe qué está pasando.
export const AI_ACTION_DELAY_PATCH = `
<script>
(function(){
  if(window.__bfAiActionDelay)return;
  window.__bfAiActionDelay=true;

  var AI_DELAY=1800; // 1.8 segundos entre acciones de la IA
  var lastAiTime=0;

  function shouldDelay(){
    var elapsed=Date.now()-lastAiTime;
    if(elapsed<AI_DELAY) return AI_DELAY-elapsed;
    return 0;
  }

  // Envuelve una función de la IA: si la acción anterior fue hace menos de
  // AI_DELAY ms, espera la diferencia antes de ejecutar. Así las animaciones
  // de la acción anterior (cinemática 3D, FX de hechizo, banner de habilidad)
  // terminan antes de que empiece la siguiente.
  function wrap(name){
    if(typeof window[name]!=='function'||window[name].__bfAiDelay)return false;
    var inner=window[name];
    window[name]=function(){
      var wait=shouldDelay();
      var args=arguments;
      var self=this;
      if(wait>0){
        setTimeout(function(){
          lastAiTime=Date.now();
          try{inner.apply(self,args);}catch(e){}
        },wait);
        return;
      }
      lastAiTime=Date.now();
      return inner.apply(self,args);
    };
    window[name].__bfAiDelay=1;
    return true;
  }

  // Funciones de acción de la IA: cubren turno completo (aiAct/doAiTurn),
  // decisión (aiDecide/aiChooseAction), combate (aiCombat), uso de habilidad
  // (aiUseAbility), hechizos (castSpell_AI), objetos (useItem_AI) y ataque
  // (attack_AI/aiAttack). Se envuelven todas para que cualquier acción
  // consecutiva de la IA respete el retraso.
  var tries=0;
  var iv=setInterval(function(){
    ['aiAct','aiTurn','doAiTurn','aiCombat','aiChooseAction','aiDecide','aiUseAbility','castSpell_AI','useItem_AI','attack_AI','aiAttack'].forEach(wrap);
    if(tries++>120)clearInterval(iv);
  },300);
})();
</script>
`;