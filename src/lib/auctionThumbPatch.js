// Parche inyectado en el iframe:
// 1) Miniaturas de héroes reclutados en la subasta: marco compacto y arte
//    encuadrado al centro para que no se corte la figura.
// 2) Tienda de equipamiento: oculta el número de carta y el logo BF de las
//    cartas (se solapaban y no aportan nada ahí).
export const AUCTION_THUMB_PATCH = `
<script>
(function(){
  if(window.__bfAcqThumbFit)return;
  window.__bfAcqThumbFit=true;
  var s=document.createElement('style');
  s.textContent='.hero-acquired{min-height:76px!important;padding-left:74px!important}'+
    '.bf-acq-thumb{width:62px!important;background-size:cover!important;background-position:center center!important}'+
    '.shop-card .bf-shop-num,.shop-card .bf-logo,.shop-card .shop-bf{display:none!important}';
  document.head.appendChild(s);
})();
</script>
`;