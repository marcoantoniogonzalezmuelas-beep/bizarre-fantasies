// Norma general de turnos: la IA no juega su acción mientras haya una
// cinemática (habilidad 3D, carta especial o golpe mortal) en pantalla.
// No se fuerza ni se bloquea nada: solo se espera a que la animación
// termine (tope de 8 s por seguridad) y, mientras se espera, se re-arma
// el vigilante del juego para que no dispare el "(turno forzado)" de 4,2 s.
// Entre humanos no hace falta: el jugador ya espera de forma natural.
export const AI_WAIT_CINE_PATCH = `
<script>
(function(){
  if(window.__bfAiWaitCinePatch)return;
  window.__bfAiWaitCinePatch=true;

  var CINE_SEL='#bf-abil-anim,#bf-spec-cine,#bf-kill-ov';

  // Además de las cinemáticas, se espera a que terminen los efectos visuales
  // de la acción anterior (proyectiles, impactos, números de daño/curación,
  // marcadores de absorción): mientras la capa de FX tenga algo en pantalla,
  // la IA no encadena su acción.
  function fxBusy(){
    var l=document.getElementById('bf-fx-layer');
    if(l&&l.children.length)return true;
    return !!document.querySelector('.bf-dmg-num,.bf-heal-num,.bf-absorb-pop,.bf-skip-pop');
  }
  function busy(){ return !!document.querySelector(CINE_SEL)||fxBusy(); }

  function install(){
    if(typeof window.aiTurn!=='function'||window.aiTurn.__bfWaitCine)return false;
    var orig=window.aiTurn;
    window.aiTurn=function(h,side){
      var self=this,t0=Date.now();
      (function tick(){
        if(window.B&&window.B.over)return;
        if(busy()&&Date.now()-t0<8000){
          // Sigue habiendo una animación: la IA espera y se re-arma el
          // vigilante para que no fuerce el turno mientras tanto.
          try{ if(typeof window.armWatchdog==='function'){ if(typeof window.clearWatchdog==='function')window.clearWatchdog(); window.armWatchdog(); } }catch(e){}
          return setTimeout(tick,200);
        }
        try{ orig.call(self,h,side); }catch(e){ try{ window.endTurn(); }catch(e2){} }
      })();
    };
    window.aiTurn.__bfWaitCine=1;
    return true;
  }

  var n=0,timer=setInterval(function(){ if(install()||++n>300)clearInterval(timer); },200);
  install();
})();
</script>
`;