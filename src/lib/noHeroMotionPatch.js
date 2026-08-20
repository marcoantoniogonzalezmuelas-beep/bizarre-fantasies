// Quita el MOVIMIENTO del retrato de los héroes en batalla (el balanceo/idle que
// hacía que un héroe congelado o paralizado siguiera moviéndose). Los marcadores
// de estado, números de daño y efectos (que viven en capas .bf-fx / overlays)
// siguen animándose con normalidad.
export const NO_HERO_MOTION_PATCH = `
<script>
(function(){
  if(window.__bfNoHeroMotion)return;
  window.__bfNoHeroMotion=true;
  var css=[
    '.bhero,.bhero>.bhero-art,.bhero .bf-battle-art,.bhero .bf-bscene-portrait,.bhero>img{',
      'animation:none!important;transition:none!important;transform:translateZ(0)!important;',
    '}',
    '.bhero:hover,.bhero.active,.bhero.turn{transform:translateZ(0)!important}'
  ].join('');
  var st=document.createElement('style');
  st.textContent=css;
  document.head.appendChild(st);
})();
</script>
`;