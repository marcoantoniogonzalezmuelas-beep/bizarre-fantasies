// Quita TODO el movimiento/parpadeo del retrato de los héroes y de la escena de
// batalla en PC: ni balanceo idle, ni transiciones, ni animaciones de brillo o
// escala al repintar el tablero. Los números de daño, marcadores y efectos
// (capas .bf-fx / overlays) siguen animándose con normalidad.
export const NO_HERO_MOTION_PATCH = `
<script>
(function(){
  if(window.__bfNoHeroMotion)return;
  window.__bfNoHeroMotion=true;

  var KEEP='.bf-fx,.bf-dmg,.bf-heal,.bf-num,.bf-coffee-fx,.bf-ability-burst,.bf-cine,.bf-3d,.bf-fx-root';
  var HOST='.bhero,[id^="b_p_"],[id^="b_o_"]';
  var css=
    HOST+',\\n'+
    HOST+' *:not('+KEEP+'):not('+KEEP+' *),\\n'+
    HOST+'::before,'+HOST+'::after,\\n'+
    HOST+' *:not('+KEEP+'):not('+KEEP+' *)::before,\\n'+
    HOST+' *:not('+KEEP+'):not('+KEEP+' *)::after{'+
      'animation:none!important;-webkit-animation:none!important;transition:none!important;will-change:auto!important;'+
    '}'+
    HOST+':hover,'+HOST+'.active,'+HOST+'.turn{transform:none!important}'+
    // Escena de batalla / retrato: capa estable, sin repintados por filtro animado.
    '.bhero>.bhero-art,.bhero .bf-battle-art,.bhero .bf-bscene-portrait,.bhero .bf-bscene-bg,.bhero>img{'+
      'animation:none!important;transition:none!important;transform:translateZ(0)!important;backface-visibility:hidden!important;'+
    '}';

  var st=document.createElement('style');
  st.textContent=css;
  document.head.appendChild(st);
  // El juego inyecta estilos durante la batalla: mantenemos esta hoja siempre
  // al final del <head> para que gane en especificidad de orden.
  setInterval(function(){ if(document.head.lastChild!==st) document.head.appendChild(st); },1500);

  // Cancela cualquier animación ya en marcha sobre el retrato o la escena
  // (Web Animations API), sin tocar las capas de efectos de combate.
  setInterval(function(){
    document.querySelectorAll(HOST).forEach(function(host){
      var nodes=[host].concat(Array.prototype.slice.call(host.querySelectorAll('*')));
      nodes.forEach(function(n){
        if(n.closest&&n.closest(KEEP))return;
        if(n.getAnimations) n.getAnimations().forEach(function(a){ try{ a.cancel(); }catch(e){} });
      });
    });
  },700);
})();
</script>
`;