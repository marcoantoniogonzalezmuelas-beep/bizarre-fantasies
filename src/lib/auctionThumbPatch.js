// Parche inyectado en el iframe: en la subasta, las miniaturas de los héroes
// reclutados mostraban el arte recortado (background cover). Se muestra la
// imagen completa (contain) en un marco algo mayor.
export const AUCTION_THUMB_PATCH = `
<script>
(function(){
  if(window.__bfAcqThumbFit)return;
  window.__bfAcqThumbFit=true;
  var s=document.createElement('style');
  s.textContent='.hero-acquired{min-height:92px!important;padding-left:92px!important}'+
    '.bf-acq-thumb{width:80px!important;background-size:contain!important;background-position:center center!important;background-color:#0a0710!important}';
  document.head.appendChild(s);
})();
</script>
`;