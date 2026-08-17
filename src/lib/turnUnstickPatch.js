// Parche inyectado en el iframe: GUARDIÁN DE TURNO. Trabaja en silencio, sin
// botones ni esperas: garantiza que ninguna capa visual pueda dejar el turno
// bloqueado ni el panel de acciones "en gris".
//
// Tres garantías:
// 1) Toda cinemática tiene fecha de caducidad propia (5,6 s desde que aparece).
//    Si por cualquier motivo su temporizador interno no la retira (cola de
//    cinemáticas, pestaña en segundo plano, error dentro de la animación), el
//    guardián la borra. Antes esa capa oscura tapaba el panel y el jugador se
//    quedaba sin poder pulsar nada.
// 2) Las cinemáticas nunca capturan pulsaciones (pointer-events:none) y la
//    clase bf-cine-active se limpia en cuanto no queda ninguna en pantalla,
//    para que el repintado del tablero deje de estar congelado.
// 3) Tras limpiar, se repinta la batalla de inmediato y se suelta cualquier
//    objetivo pendiente huérfano, así el menú de acciones vuelve al momento.
export const TURN_UNSTICK_PATCH = `
<script>
(function(){
  if(window.__bfTurnUnstick)return;
  window.__bfTurnUnstick=true;

  var CINE_SEL='#bf-abil-anim,#bf-spec-cine,#bf-kill-ov';
  var MAX_LIFE=5600;   // vida máxima de una cinemática en pantalla

  function guard(){
    var now=Date.now(), cleaned=false;
    document.querySelectorAll(CINE_SEL).forEach(function(el){
      if(!el.dataset.bfBorn)el.dataset.bfBorn=String(now);
      el.style.pointerEvents='none';
      if(now-Number(el.dataset.bfBorn)>MAX_LIFE){
        if(el.parentNode)el.parentNode.removeChild(el);
        cleaned=true;
      }
    });
    if(!document.querySelector(CINE_SEL)){
      if(document.body.classList.contains('bf-cine-active')){
        document.body.classList.remove('bf-cine-active');
        cleaned=true;
      }
      // Objetivo pendiente sin carta ni cinemática en pantalla y sin selector
      // visible: es un pendiente huérfano, se suelta para devolver el menú.
      try{
        if(typeof B!=='undefined'&&B&&B.pending&&!document.querySelector('.bf-reveal')&&!document.querySelector('.pickable,.bf-pick,.targetable')){
          B.pending=null;
          cleaned=true;
        }
      }catch(e){}
    }
    if(cleaned){ try{ if(typeof renderBattle==='function')renderBattle(); }catch(e){} }
  }

  setInterval(function(){
    var scr=document.getElementById('s-battle');
    if(scr&&scr.classList.contains('active'))guard();
  },250);
})();
</script>
`;