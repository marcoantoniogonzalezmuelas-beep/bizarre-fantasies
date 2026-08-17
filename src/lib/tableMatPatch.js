// Parche inyectado en el iframe: añade una imagen de fondo tipo "tapete de
// mesa" (table mat) a las zonas donde se muestran las cartas en el juego:
// - Mano del jugador en batalla (contenedor de .chip.bf-chip-card)
// - Mano del rival en batalla (.hand-rival)
// - Cartas de la tienda en la fase de equipamiento (.shop-card, .bf-quick-card)
// - Mazo de descartes (contenedor .bf-discard-pile)
// Además, aclarea las cartas de hechizos que no se pueden jugar por falta de
// maná para que el jugador siempre pueda ver qué carta es.

const TABLE_MAT_URL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/da1552d7d_generated_image.png';

export const TABLE_MAT_PATCH = `
<script>
(function(){
  if(window.__bfTableMatPatch) return;
  window.__bfTableMatPatch = true;

  var MAT = '${TABLE_MAT_URL}';

  var css = '' +
  // Mano del jugador en batalla: el contenedor que rodea las cartas.
  '#s-battle .hand-zone, #s-battle .hand, #s-battle .bf-hand-zone {' +
    'background: url("' + MAT + '") center/cover, rgba(8,5,14,.72) !important;' +
    'border-radius:10px; border:1.5px solid rgba(255,210,74,.3);' +
    'box-shadow:inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4); padding:5px;' +
  '}' +
  // Mano del rival en batalla.
  '#s-battle .hand-rival {' +
    'background: url("' + MAT + '") center/cover, rgba(8,5,14,.72) !important;' +
    'border-radius:10px; border:1.5px solid rgba(192,107,255,.3);' +
    'box-shadow:inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4); padding:5px;' +
  '}' +
  // Mazo de descartes: el tapete cubre todo el recuadro incluyendo el mazo.
  '#s-battle .bf-discard-pile {' +
    'background: url("' + MAT + '") center/cover, rgba(8,5,14,.72) !important;' +
    'border-radius:10px; border:1.5px solid rgba(255,140,50,.3);' +
    'box-shadow:inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4); padding:5px;' +
  '}' +
  // Fase de equipamiento: SOLO el recuadro de cartas en mano (objetos y
  // hechizos). Nada más de la fase de equipamiento lleva el tapete.
  '#s-equip .hand-zone, #s-equip .hand, #s-equip .bf-hand-zone, #modalRoot .hand-zone {' +
    'background: url("' + MAT + '") center/cover, rgba(8,5,14,.72) !important;' +
    'border-radius:10px; border:1.5px solid rgba(255,210,74,.3);' +
    'box-shadow:inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4); padding:5px;' +
  '}' +
  // Cada carta de la mano del jugador: el tapete como fondo base del recuadro.
  '.chip.bf-chip-card {' +
    'background: url("' + MAT + '") center/cover, #07050b !important;' +
    'border:1.5px solid rgba(255,210,74,.55) !important;' +
  '}' +
  // Cartas de hechizo/objeto que no se pueden jugar por falta de maná: el
  // juego las oscurece con opacity/filter. Aquí les damos luz mínima para que
  // el jugador siempre pueda ver qué carta es. Se aplica a .chip-spell y
  // .chip-object cuando tienen style inline de opacity baja o filter brightness.
  '.chip.bf-chip-card[style*="opacity"], .chip-spell[style*="opacity"], .chip-object[style*="opacity"] {' +
    'opacity:0.85 !important;' +
  '}' +
  '.chip.bf-chip-card[style*="brightness"], .chip-spell[style*="brightness"], .chip-object[style*="brightness"] {' +
    'filter:brightness(0.8) !important;' +
  '}' +
  '';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // JS: aclarea las cartas de hechizo/objeto que el juego ha oscurecido por
  // falta de maná. El juego les pone opacity baja o filter brightness bajo
  // inline. Aquí las subimos a un mínimo visible.
  function brightenCantPlay() {
    document.querySelectorAll('#s-battle .chip-spell, #s-battle .chip-object, #s-battle .chip.bf-chip-card').forEach(function(chip){
      var op = parseFloat(chip.style.opacity || '1');
      var f = chip.style.filter || '';
      // Si el juego la ha oscurecido mucho (opacity < 0.5 o brightness < 0.5)
      if(op < 0.5) chip.style.setProperty('opacity', '0.82', 'important');
      if(/brightness\\((0?\\.?[0-4])/.test(f)) chip.style.setProperty('filter', 'brightness(0.78)', 'important');
    });
  }

  // JS de respaldo: encuentra los contenedores padre de las cartas y les pone
  // el tapete si el CSS por selector no los alcanzó.
  function applyToContainers() {
    // Mano del jugador: padre de los chips (que no sea mano del rival).
    document.querySelectorAll('#s-battle .chip.bf-chip-card').forEach(function(chip){
      var parent = chip.parentElement;
      if(!parent || parent.dataset.bfMat) return;
      if(parent.closest('.hand-rival')) return;
      parent.dataset.bfMat = '1';
      parent.style.background = 'url("' + MAT + '") center/cover, rgba(8,5,14,.72)';
      parent.style.borderRadius = '10px';
      parent.style.border = '1.5px solid rgba(255,210,74,.3)';
      parent.style.boxShadow = 'inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4)';
      parent.style.padding = '5px';
    });
    // Mano del rival.
    document.querySelectorAll('#s-battle .hand-rival').forEach(function(h){
      if(h.dataset.bfMat) return;
      h.dataset.bfMat = '1';
      h.style.background = 'url("' + MAT + '") center/cover, rgba(8,5,14,.72)';
      h.style.borderRadius = '10px';
      h.style.border = '1.5px solid rgba(192,107,255,.3)';
      h.style.boxShadow = 'inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4)';
      h.style.padding = '5px';
    });
    // Mazo de descartes.
    document.querySelectorAll('#s-battle .bf-discard-pile').forEach(function(d){
      if(d.dataset.bfMat) return;
      d.dataset.bfMat = '1';
      d.style.background = 'url("' + MAT + '") center/cover, rgba(8,5,14,.72)';
      d.style.borderRadius = '10px';
      d.style.border = '1.5px solid rgba(255,140,50,.3)';
      d.style.boxShadow = 'inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4)';
      d.style.padding = '5px';
    });
    // Fase de equipamiento: SOLO el recuadro de cartas en mano.
    document.querySelectorAll('#s-equip .hand-zone, #s-equip .hand, #s-equip .bf-hand-zone, #modalRoot .hand-zone').forEach(function(h){
      if(h.dataset.bfMat) return;
      h.dataset.bfMat = '1';
      h.style.background = 'url("' + MAT + '") center/cover, rgba(8,5,14,.72)';
      h.style.borderRadius = '10px';
      h.style.border = '1.5px solid rgba(255,210,74,.3)';
      h.style.boxShadow = 'inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4)';
      h.style.padding = '5px';
    });
    brightenCantPlay();
  }

  applyToContainers();
  setInterval(applyToContainers, 600);
})();
</script>
`;