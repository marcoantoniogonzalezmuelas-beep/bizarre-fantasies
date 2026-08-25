// CONGELADO TOTAL de los héroes en batalla (última palabra: se inyecta al final
// de todos los parches).
//
// Nada dentro del recuadro del héroe (.bhero) se mueve ni parpadea durante toda
// la partida: ni retrato, ni escena, ni aura, ni rótulos, ni decoraciones de
// estado (escarcha, cadenas, velas, chispas, Zzz…). Todo se ve, pero quieto y
// con luz constante — sin intermitencias.
//
// Los efectos de combate (números de daño, ráfagas, cinemáticas) viven en la
// capa de FX fuera del recuadro (#bf-fx-layer), así que siguen animándose.
export const HERO_FULL_FREEZE_PATCH = `
<script>
(function(){
  if(window.__bfHeroFullFreeze) return;
  window.__bfHeroFullFreeze = true;

  var HOST = 'html body .bhero.bhero';
  var css = ''
    // Cero animaciones y cero transiciones en TODO el recuadro del héroe.
    + HOST + ',' + HOST + '::before,' + HOST + '::after,'
    + HOST + ' *,' + HOST + ' *::before,' + HOST + ' *::after{'
    +   'animation:none!important;-webkit-animation:none!important;'
    +   'animation-name:none!important;animation-play-state:paused!important;'
    +   'transition:none!important;will-change:auto!important;'
    + '}'
    // Nada de desplazamientos ni escalados: el recuadro, el arte y los rótulos
    // se quedan exactamente en su sitio y con su tamaño.
    + HOST + '{transform:translateZ(0)!important}'
    + HOST + ' .bf-battle-art,' + HOST + ' .bf-bscene-portrait,' + HOST + ' .bhero-art,'
    + HOST + ' img,' + HOST + ' .bf-pat,' + HOST + ' .bf-active-ring,'
    + HOST + ' .bf-active-tag,' + HOST + ' .bhero-aura,' + HOST + ' .bf-agonize-badge{transform:none!important}'
    // Las decoraciones de estado siguen centradas donde toca (sin animación).
    + HOST + ' .bf-decor{transform:translate(-50%,-50%)!important}'
    // Luz CONSTANTE: opacidad fija en las capas que antes latían.
    + HOST + ' .bf-decor,' + HOST + ' .bf-pat{opacity:.9!important}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  // El juego (y otros parches) inyectan hojas después: la mantenemos siempre la
  // última del <head> para que gane por orden.
  setInterval(function(){ if(document.head.lastChild !== st) document.head.appendChild(st); }, 1200);

  // El CSS no puede parar lo que hace el JavaScript del juego: aquí se cancelan
  // las animaciones creadas por código y se limpian los transform/opacity que
  // reescribe en cada repintado.
  setInterval(function(){
    document.querySelectorAll('.bhero').forEach(function(card){
      try{
        if(card.getAnimations){
          card.getAnimations({ subtree: true }).forEach(function(a){ try{ a.cancel(); }catch(e){} });
        }
        card.querySelectorAll('[style*="transform"],[style*="animation"]').forEach(function(el){
          if(el.classList.contains('bf-decor')) return;
          if(el.style.transform && el.style.transform !== 'none') el.style.transform = 'none';
          if(el.style.animation) el.style.animation = 'none';
        });
      }catch(e){}
    });
  }, 400);
})();
</script>
`;