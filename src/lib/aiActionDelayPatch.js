// Parche inyectado en el iframe: añade un retraso de ~1.8s entre acciones
// consecutivas para que las animaciones no se solapen. Cubre DOS casos:
//  1) IA juega varias veces seguidas (varios héroes con turnos consecutivos,
//     o varias acciones en el mismo turno — habilidad, hechizo, ataque).
//  2) El humano lanza una animación (hechizo, objeto, habilidad) y justo
//     después le toca a la IA: la IA espera a que termine la animación del
//     humano antes de empezar la suya.
//
// Registra el momento de CUALQUIER animación (humano o IA) y, cuando la IA
// va a ejecutar una acción, espera si la animación anterior aún no ha
// terminado.
export const AI_ACTION_DELAY_PATCH = `
<script>
(function(){
  if(window.__bfAiActionDelay)return;
  window.__bfAiActionDelay=true;

  var AI_DELAY=1800; // 1.8s entre acciones para que no se solapen animaciones
  var lastAnimTime=0; // última vez que se lanzó una animación (humano o IA)

  function shouldDelay(){
    var elapsed=Date.now()-lastAnimTime;
    if(elapsed<AI_DELAY) return AI_DELAY-elapsed;
    return 0;
  }

  function aiSide(){
    if(typeof NET!=='undefined'&&NET&&NET.role==='host')return null;
    return (typeof NET==='undefined'||!NET||!NET.role)?'o':null;
  }

  // Envuelve acciones de la IA: retrasa si una animación reciente (del humano
  // o de la propia IA) aún no ha terminado, luego registra el momento.
  function wrapAi(name){
    if(typeof window[name]!=='function'||window[name].__bfAiDelay)return false;
    var inner=window[name];
    window[name]=function(){
      var wait=shouldDelay();
      var args=arguments;
      var self=this;
      if(wait>0){
        setTimeout(function(){
          lastAnimTime=Date.now();
          try{inner.apply(self,args);}catch(e){}
        },wait);
        return;
      }
      lastAnimTime=Date.now();
      return inner.apply(self,args);
    };
    window[name].__bfAiDelay=1;
    return true;
  }

  // Envuelve acciones del HUMANO: solo registra el momento para que la IA
  // espere tras ellas. No retrasa la acción del humano.
  function wrapHuman(name){
    if(typeof window[name]!=='function'||window[name].__bfAnimRec)return false;
    var inner=window[name];
    window[name]=function(){
      lastAnimTime=Date.now();
      return inner.apply(this,arguments);
    };
    window[name].__bfAnimRec=1;
    return true;
  }

  // useAbility es compartido por humano e IA: registra para ambos y retrasa
  // solo cuando el lado que lo llama es la IA.
  function wrapUseAbility(){
    if(typeof window.useAbility!=='function'||window.useAbility.__bfAiDelayUa)return false;
    var inner=window.useAbility;
    window.useAbility=function(side,h){
      var isAi = side === aiSide();
      if(isAi){
        var wait=shouldDelay();
        var args=arguments;
        var self=this;
        if(wait>0){
          setTimeout(function(){
            lastAnimTime=Date.now();
            try{inner.apply(self,args);}catch(e){}
          },wait);
          return;
        }
      }
      lastAnimTime=Date.now();
      return inner.apply(this,arguments);
    };
    window.useAbility.__bfAiDelayUa=1;
    return true;
  }

  var tries=0;
  var iv=setInterval(function(){
    // Acciones de la IA: retrasan y registran
    ['aiAct','aiTurn','doAiTurn','aiCombat','aiChooseAction','aiDecide','aiUseAbility','castSpell_AI','useItem_AI','attack_AI','aiAttack'].forEach(wrapAi);
    // Acciones del humano: solo registran (para que la IA espere tras ellas)
    ['castSpell','useItem','attack','doAttack'].forEach(wrapHuman);
    // useAbility: compartido, retrasa si es IA
    wrapUseAbility();
    if(tries++>120)clearInterval(iv);
  },300);
})();
</script>
`;