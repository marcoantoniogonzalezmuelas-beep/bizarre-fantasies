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
})();
</script>
`;