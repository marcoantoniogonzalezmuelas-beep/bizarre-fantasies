// Parche inyectado en el iframe: en la BATALLA, las cartas de la mano del
// rival se muestran boca abajo con un reverso diseñado a partir del icono de
// Punkito. Se oculta todo el contenido de la carta (arte, nombre, coste,
// botones) y se bloquea la interacción para no revelar información.
const CARD_BACK_URL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/47cb4e9b0_generated_image.png';

export const RIVAL_HAND_BACK_PATCH = `
<script>
(function(){
  if (window.__bfRivalHandBack) return;
  window.__bfRivalHandBack = true;

  var st = document.createElement('style');
  st.textContent = [
    // La mano del rival en batalla (clase hand-rival, añadida por el parche que
    // recoloca las manos): cada carta muestra solo el reverso de Punkito.
    '#s-battle .hand-rival .chip.bf-chip-card > *{display:none!important}',
    '#s-battle .hand-rival .chip.bf-chip-card{background-image:url("${CARD_BACK_URL}")!important;background-size:cover!important;background-position:center!important;background-color:#120a1e!important;border:1.5px solid rgba(192,107,255,.65)!important;box-shadow:0 4px 12px rgba(0,0,0,.6),0 0 10px rgba(160,80,255,.28)!important;pointer-events:none!important;cursor:default!important}',
    '#s-battle .hand-rival .chip.bf-chip-card:hover{transform:none!important}'
  ].join('');
  document.head.appendChild(st);
})();
</script>
`;