// Parche inyectado en el iframe:
// 1) Miniaturas de héroes reclutados en la subasta: la imagen se redimensiona
//    para caber ENTERA en el marco (sin recortes), con una copia difuminada
//    de fondo rellenando los huecos.
// 2) Tienda de equipamiento: oculta el número de carta y el logo BF de las
//    cartas (se solapaban y no aportan nada ahí).
export const AUCTION_THUMB_PATCH = `
<script>
(function(){
  if(window.__bfAcqThumbFit)return;
  window.__bfAcqThumbFit=true;
  var s=document.createElement('style');
  s.textContent='.bf-acq-thumb{background-size:contain!important;background-position:center center!important}'+
    '.bf-acq-thumb::before{filter:blur(7px) brightness(.5);}'+
    '.shop-card .bf-shop-num,.shop-card .bf-logo,.shop-card .shop-bf{display:none!important}';
  document.head.appendChild(s);
})();
</script>
`;