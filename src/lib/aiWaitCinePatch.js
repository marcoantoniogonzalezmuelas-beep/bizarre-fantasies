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

  // Margen de calma: la cinemática de GOLPE MORTAL se crea unos instantes
  // después de que el efecto visual del disparo/golpe termine. Sin este margen,
  // la IA se colaba justo en ese hueco y su animación se solapaba con el golpe
  // mortal. Se exige que no haya nada en pantalla durante 700 ms seguidos.
  var QUIET_MS=900;

  function install(){
    if(typeof window.aiTurn!=='function'||window.aiTurn.__bfWaitCine)return false;
    var orig=window.aiTurn;
    window.aiTurn=function(h,side){
      var self=this,t0=Date.now(),quietFrom=0;
      (function tick(){
        if(window.B&&window.B.over)return;
        if(busy())quietFrom=0;
        else if(!quietFrom)quietFrom=Date.now();
        if((busy()||Date.now()-quietFrom<QUIET_MS)&&Date.now()-t0<9000){
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