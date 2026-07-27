// Parche inyectado en el iframe:
// 1) Miniaturas de héroes reclutados en la subasta: se respeta el ajuste
//    automático del juego (zoom según los márgenes reales del arte) y se
//    ancla el encuadre a la parte alta de la imagen, donde está la cara.
// 2) Tienda de equipamiento: oculta el número de carta y el logo BF de las
//    cartas (se solapaban y no aportan nada ahí).
export const AUCTION_THUMB_PATCH = `
<script>
(function(){
  if(window.__bfAcqThumbFit)return;
  window.__bfAcqThumbFit=true;
  var s=document.createElement('style');
  s.textContent='.bf-acq-thumb,.bf-acq-thumb::before{background-position:center 10%!important}'+
    '.shop-card .bf-shop-num,.shop-card .bf-logo,.shop-card .shop-bf{display:none!important}';
  document.head.appendChild(s);
})();
</script>
`;