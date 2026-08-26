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
  var OK = ':not(.bf-decor-layer):not(.bf-decor-layer *):not(.bf-decor):not(.bf-blood-veil):not(.bf-blood-veil *):not(.bf-blood-drop):not(.bf-ability-burst):not(.bf-ability-burst *):not(.bf-epic-foil)';
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
    + HOST + '{transform:translateZ(0)!important}'
    + HOST + ' .bf-battle-art,' + HOST + ' .bf-bscene-portrait,' + HOST + ' .bhero-art,'
    + HOST + ' img,' + HOST + ' .bf-active-ring,'
    + HOST + ' .bf-active-tag,' + HOST + ' .bhero-aura,' + HOST + ' .bf-agonize-badge{transform:none!important}'
    // Posición base de las partículas (sus keyframes animan desde aquí).
    + HOST + ' .bf-decor{transform:translate(-50%,-50%)}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  // El juego (y otros parches) inyectan hojas después: la mantenemos siempre la
  // última del <head> para que gane por orden.
  setInterval(function(){ if(document.head.lastChild !== st) document.head.appendChild(st); }, 1200);

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