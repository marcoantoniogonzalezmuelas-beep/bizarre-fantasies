// CONGELADO TOTAL de los héroes en batalla (última palabra: se inyecta al final
// de todos los parches).
//
// El retrato, la escena, los rótulos y las decoraciones estructurales quedan
// quietos y con luz constante. EXCEPCIONES (efectos "vivos" pedidos por el
// jugador): las partículas de estado (.bf-decor — escarcha, velas, calaveras…),
// la sangre de la agonía (.bf-blood-veil), las ráfagas de habilidad
// (.bf-ability-burst) y el brillo foil que recorre la carta (.bf-epic-foil).
export const HERO_FULL_FREEZE_PATCH = `
<script>
(function(){
  if(window.__bfHeroFullFreeze) return;
  window.__bfHeroFullFreeze = true;

  var HOST = 'html body .bhero.bhero';
  // Capas de efecto que SÍ se animan.
  var OK = ':not(.bf-decor-layer):not(.bf-decor-layer *):not(.bf-decor):not(.bf-blood-veil):not(.bf-blood-veil *):not(.bf-blood-drop):not(.bf-ability-burst):not(.bf-ability-burst *):not(.bf-epic-foil):not(.bf-epic-foil *)';
  // Transform con el que se "clava" el recuadro. En MÓVIL/TABLET no puede ser
  // translateZ(0): eso promueve cada retrato a su propia capa GPU y, con 8
  // retratos grandes (en tablet son texturas enormes), se agota la memoria de
  // la GPU, que empieza a expulsar capas y a re-rasterizarlas — el parpadeo de
  // tablet que mobileAntiFlickerPatch documenta y evita a propósito con
  // .bhero{isolation:isolate}. Esta hoja va después en la cascada, así que lo
  // reactivaba. transform:none congela igual el recuadro (que ya es
  // position:relative por battlePortraitPatch, así que el arte absoluto sigue
  // anclado) y no crea ninguna capa. En PC no hay presión de GPU: se mantiene.
  var HOST_TF = window.__bfAntiFlicker ? 'none' : 'translateZ(0)';
  var css = ''
    // Cero animaciones y cero transiciones en el recuadro del héroe (salvo las
    // capas de efecto permitidas).
    + HOST + ',' + HOST + '::before,' + HOST + '::after,'
    + HOST + ' *' + OK + ',' + HOST + ' *' + OK + '::before,' + HOST + ' *' + OK + '::after{'
    +   'animation:none!important;-webkit-animation:none!important;'
    +   'animation-name:none!important;animation-play-state:paused!important;'
    +   'transition:none!important;will-change:auto!important;'
    + '}'
    // Nada de desplazamientos ni escalados: el recuadro, el arte y los rótulos
    // se quedan exactamente en su sitio y con su tamaño.
    + HOST + '{transform:' + HOST_TF + '!important}'
    + HOST + ' .bf-battle-art,' + HOST + ' .bf-bscene-portrait,' + HOST + ' .bhero-art,'
    + HOST + ' img,' + HOST + ' .bf-active-ring,'
    + HOST + ' .bf-active-tag,' + HOST + ' .bhero-aura,' + HOST + ' .bf-agonize-badge{transform:none!important}'
    // Posición base de las partículas (sus keyframes animan desde aquí).
    + HOST + ' .bf-decor{transform:translate(-50%,-50%)}'
    // El congelado conserva su velo y rótulo, pero no pinta un borde azul
    // encima del marco estático ni mueve el arte con sombras de color.
    + HOST + '.s-frozen{box-shadow:0 6px 16px rgba(0,0,0,.5)!important}'
    + HOST + '.s-frozen .bf-battle-art{filter:saturate(1.05) brightness(.92) contrast(1.05)!important}'
    + HOST + ' .bf-battle-art,' + HOST + ' .bhero-art,' + HOST + ' .bf-bscene-portrait{animation:none!important;transition:none!important}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  // El orden de cascada lo garantiza el coordinador de styleOrderPatch: esta
  // hoja va casi al final (solo el destello foil de batalla queda por detrás,
  // porque es una de las excepciones que SÍ deben animarse). Antes cada parche
  // re-añadía su hoja al final del head en bucle, en guerra con los demás:
  // recálculos de estilo constantes = parpadeo en tablet.
  if(window.__bfStyleOrder) window.__bfStyleOrder(st, 50);

  // El CSS no puede parar lo que hace el JavaScript del juego: aquí se cancelan
  // las animaciones creadas por código y se limpian los transform/opacity que
  // reescribe en cada repintado. Las capas de efecto permitidas no se tocan.
  var SKIP = '.bf-decor-layer,.bf-blood-veil,.bf-ability-burst,.bf-epic-foil';
  setInterval(function(){
    document.querySelectorAll('.bhero').forEach(function(card){
      try{
        if(card.getAnimations){
          card.getAnimations({ subtree: true }).forEach(function(a){
            var t = a.effect && a.effect.target;
            if(t && t.closest && t.closest(SKIP)) return;
            try{ a.cancel(); }catch(e){}
          });
        }
        card.querySelectorAll('[style*="transform"],[style*="animation"]').forEach(function(el){
          if(el.closest && el.closest(SKIP)) return;
          if(el.classList.contains('bf-decor') || el.classList.contains('bf-epic-foil')) return;
          if(el.style.transform && el.style.transform !== 'none') el.style.transform = 'none';
          if(el.style.animation) el.style.animation = 'none';
        });
      }catch(e){}
    });
  }, 400);
})();
</script>
`;