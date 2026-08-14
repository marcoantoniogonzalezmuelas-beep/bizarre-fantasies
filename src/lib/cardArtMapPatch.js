// Mapa de arte de carta (art_url / elite_art_url) por card_id para TODAS las
// cartas de héroe, bizarro y tokens (p. ej. la Grulla invocada por Daidoji).
// Lo usa la franja de vencedores/caídos del final de partida para mostrar el
// retrato de cualquier unidad, incluidas las que no salen en subasta y por eso
// no están en el mapa de avatares.
export const CARD_ART_MAP_PATCH = `
<script>
(function(){
  if(window.__bfCardArtMapPatch) return;
  window.__bfCardArtMapPatch = true;
  window.__bfCardArtMap = window.__bfCardArtMap || {};
  window.addEventListener('message', function(e){
    if(e.data && e.data.bfCardArt) window.__bfCardArtMap = e.data.bfCardArt;
  });
})();
</script>
`;