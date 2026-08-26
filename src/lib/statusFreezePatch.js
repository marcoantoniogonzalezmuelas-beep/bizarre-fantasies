// Héroe con un estado activo (congelado, paralizado, dormido, maldito…): el
// marcador y el aura se ven igual que ahora, pero el retrato se queda
// COMPLETAMENTE QUIETO: se anulan animaciones, transiciones y transformaciones
// del recuadro y de su arte (las decoraciones mantienen su centrado).
const STATUS_CLASSES = [
  's-frozen', 's-paralyzed', 's-sleeping', 's-cursed', 's-blessed', 's-tank',
  'bf-state-confused', 'bf-state-drunk', 'bf-state-dizzy',
];

// Selector de MÁXIMA prioridad: se repiten las clases y se ancla a html body
// para ganar a cualquier regla del juego (incluidas las que usan !important) y
// se cubren también las capas decorativas (::before / ::after), que eran las
// que seguían dando el destello intermitente de luz sobre el retrato.
const sel = (suffix) =>
  STATUS_CLASSES.map((c) => 'html body .bhero.bhero.' + c + '.' + c + suffix).join(',');

// Las capas de efecto (decoraciones de estado, velo de sangre, ráfagas) quedan
// FUERA del congelado: sus animaciones son el efecto visual que se quiere ver.
const FXOK =
  ':not(.bf-ability-burst):not(.bf-ability-burst *):not(.bf-decor-layer):not(.bf-decor-layer *):not(.bf-decor):not(.bf-blood-veil):not(.bf-blood-veil *):not(.bf-blood-drop):not(.bf-epic-foil):not(.bf-epic-foil *)';

const selAll = (suffix) => [sel(suffix), sel(suffix + '::before'), sel(suffix + '::after')].join(',');

export const STATUS_FREEZE_PATCH = `
<script>
(function(){
  if(window.__bfStatusFreeze)return;
  window.__bfStatusFreeze=true;
  var css=''
    + '${selAll('')},${selAll(' *' + FXOK)}{animation:none!important;animation-name:none!important;transition:none!important;animation-play-state:paused!important}'
    + '${sel('')}{transform:translateZ(0)!important}'
    + '${sel(' .bf-battle-art')},${sel(' .bf-bscene-portrait')},${sel(' .bhero-art')},${sel(' img')}{transform:none!important}'
    + '${sel(' .bf-decor')}{transform:translate(-50%,-50%)!important}';
  var st=document.createElement('style');
  st.textContent=css;
  document.head.appendChild(st);
  // El juego inyecta hojas de estilo más tarde: se reubica la nuestra al final
  // para que siempre tenga la última palabra.
  setInterval(function(){ if(st.parentNode!==document.head||document.head.lastChild!==st) document.head.appendChild(st); },2000);

  // Movimiento residual: el CSS no puede parar las animaciones creadas por JS
  // (Web Animations API) ni los transform inline que el juego re-escribe en
  // cada frame. Este vigilante los cancela en los héroes con estado activo,
  // dejándolos completamente quietos. Los efectos (daño, ráfagas) no se tocan.
  var SEL='${STATUS_CLASSES.map((c) => '.bhero.' + c).join(',')}';
  setInterval(function(){
    document.querySelectorAll(SEL).forEach(function(card){
      try{
        if(card.getAnimations){
          card.getAnimations({subtree:true}).forEach(function(a){
            var t=a.effect&&a.effect.target;
            if(t&&t.closest&&t.closest('.bf-ability-burst,.bf-fx,.bf-dmg,.bf-heal,.bf-absorb-pop,.bf-decor-layer,.bf-blood-veil,.bf-epic-foil'))return;
            a.cancel();
          });
        }
        card.querySelectorAll('[style*="transform"]').forEach(function(el){
          if(el.closest('.bf-decor-layer,.bf-ability-burst,.bf-fx,.bf-blood-veil'))return;
          if(el.style.transform&&el.style.transform!=='none')el.style.transform='none';
        });
      }catch(e){}
    });
  },350);
})();
</script>
`;