// Quita TODO el movimiento/parpadeo del retrato de los héroes y de la escena de
// batalla en PC: ni balanceo idle, ni transiciones, ni animaciones de brillo o
// escala al repintar el tablero. Los números de daño, marcadores y efectos
// (capas .bf-fx / overlays) siguen animándose con normalidad.
export const NO_HERO_MOTION_PATCH = `
<script>
(function(){
  if(window.__bfNoHeroMotion)return;
  window.__bfNoHeroMotion=true;

  // Capas de EFECTO que sí se animan (sangre de agonía, escarcha/cadenas y demás
  // decoraciones de estado, ráfagas, números de daño). El retrato y la escena
  // quedan totalmente quietos.
  var KEEP='.bf-fx,.bf-dmg,.bf-heal,.bf-num,.bf-coffee-fx,.bf-ability-burst,.bf-cine,.bf-3d,.bf-fx-root,.bf-decor-layer,.bf-decor,.bf-blood-veil,.bf-blood-drop,.bf-epic-foil,.bf-loss-pop';
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
    '}'+
    // El HÉROE EN TURNO movía el retrato: el juego le pone .active-turn con
    // animación (bfHeroActive), más el balanceo idle (bfHeroIdle), el aro y el
    // aura pulsantes y el rótulo balanceándose. Esas reglas ganaban por
    // especificidad, así que aquí se anulan con selectores más específicos:
    // el retrato queda TOTALMENTE quieto durante toda la partida.
    'html body .bhero.bhero.bhero,'+
    'html body .bhero.bhero.bhero.active-turn,'+
    'html body .bhero.bhero.bhero.elite-mode,'+
    'html body .bhero.bhero.bhero.bf-epic-gold,'+
    'html body .bhero.bhero.bhero.targetable,'+
    'html body .bhero.bhero.bhero:hover,'+
    'html body .bhero.bhero .bhero-aura,'+
    'html body .bhero.bhero .bf-active-ring,'+
    'html body .bhero.bhero.active-turn .bf-active-ring,'+
    'html body .bhero.bhero.active-turn .bf-active-tag{'+
      'animation:none!important;-webkit-animation:none!important;transition:none!important;transform:none!important;'+
    '}'+
    // Estado MALDITO: las runas que suben y el pulso violeta daban sensación de
    // movimiento en el retrato. Se quedan visibles pero completamente quietas.
    'html body .bhero.bhero .bf-curse-fx,'+
    'html body .bhero.bhero .bf-curse-fx *,'+
    'html body .bhero.bhero .bf-curse-rune{'+
      'animation:none!important;-webkit-animation:none!important;transition:none!important;'+
    '}'+
    'html body .bhero.bhero .bf-curse-fx::before,'+
    'html body .bhero.bhero .bf-curse-rune::before{animation:none!important}'+
    // Las runas nacen fuera del retrato (bottom:-10%) y solo se ven al subir:
    // sin animación hay que colocarlas dentro para que sigan visibles.
    'html body .bhero.bhero .bf-curse-rune{bottom:34%!important;opacity:.9!important}'+
    'html body .bhero.bhero .bf-curse-rune.r2{bottom:52%!important}'+
    'html body .bhero.bhero .bf-curse-rune.r3{bottom:20%!important}'+
    // Rótulo "★ SU TURNO": TOTALMENTE estático (sin pulso, sin balanceo, sin
    // escala), un poco más ancho para que se lea mejor, y con brillo dorado fijo.
    'html body .bhero.bhero.active-turn .bf-active-tag,'+
    'html body .bhero.bhero.active-turn .bf-active-tag::before,'+
    'html body .bhero.bhero.active-turn .bf-active-tag::after{'+
      'animation:none!important;-webkit-animation:none!important;'+
      'transition:none!important;transform:none!important;'+
      'opacity:1!important;'+
      'min-width:78px!important;padding:3px 14px!important;'+
      // Se baja al borde INFERIOR del recuadro (centrado) para que no se
      // solape con las chapas de arma y armadura. Sin transform (anulado
      // arriba), el centrado se hace con margin negativo.
      // Se coloca POR DEBAJO del recuadro (fuera de la carta), igual que antes
      // estaba por encima: así no puede solaparse con las chapas de arma y
      // armadura ni con los rótulos de estado. Sin transform (anulado arriba),
      // el centrado se hace con margen negativo.
      'top:auto!important;bottom:-13px!important;left:50%!important;margin-left:-53px!important;z-index:20!important;'+
      'box-shadow:0 0 10px rgba(255,210,74,.85),0 0 22px rgba(255,180,40,.55)!important;'+
      'text-shadow:0 0 8px rgba(255,225,140,.95),0 1px 2px #000!important;'+
    '}'+
    // El rótulo sobresale por debajo del recuadro: la carta no debe recortarlo.
    'html body .bhero.bhero.active-turn{overflow:visible!important}';

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