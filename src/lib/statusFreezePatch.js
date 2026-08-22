// Héroe con un estado activo (congelado, paralizado, dormido, maldito…): el
// marcador y el aura se ven igual que ahora, pero el retrato se queda
// COMPLETAMENTE QUIETO: se anulan animaciones, transiciones y transformaciones
// del recuadro y de su arte (las decoraciones mantienen su centrado).
const STATUS_CLASSES = [
  's-frozen', 's-paralyzed', 's-sleeping', 's-cursed', 's-blessed', 's-tank',
  'bf-state-confused', 'bf-state-drunk', 'bf-state-dizzy',
];

const sel = (suffix) => STATUS_CLASSES.map((c) => '.bhero.' + c + suffix).join(',');

export const STATUS_FREEZE_PATCH = `
<script>
(function(){
  if(window.__bfStatusFreeze)return;
  window.__bfStatusFreeze=true;
  var css=''
    + '${sel('')},${sel(' *')}{animation:none!important;transition:none!important;animation-play-state:paused!important}'
    + '${sel('')}{transform:translateZ(0)!important}'
    + '${sel(' .bf-battle-art')},${sel(' .bf-bscene-portrait')},${sel(' .bhero-art')},${sel(' img')}{transform:none!important}'
    + '${sel(' .bf-decor')}{transform:translate(-50%,-50%)!important}';
  var st=document.createElement('style');
  st.textContent=css;
  document.head.appendChild(st);

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
            if(t&&t.closest&&t.closest('.bf-ability-burst,.bf-fx,.bf-dmg,.bf-heal,.bf-absorb-pop'))return;
            a.cancel();
          });
        }
        card.querySelectorAll('[style*="transform"]').forEach(function(el){
          if(el.closest('.bf-decor-layer,.bf-ability-burst,.bf-fx'))return;
          if(el.style.transform&&el.style.transform!=='none')el.style.transform='none';
        });
      }catch(e){}
    });
  },350);
})();
</script>
`;