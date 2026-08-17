// Parche inyectado en el iframe: añade una imagen de fondo tipo "tapete de
// mesa" (table mat) a las zonas donde se muestran las cartas en el juego:
// - Mano del jugador en batalla (contenedor de .chip.bf-chip-card)
// - Mano del rival en batalla (.hand-rival)
// - Fase de equipamiento (contenedor de .eq-hero)
// Así las cartas parecen estar sobre un tapete de mesa de juego, como un TCG
// real. La imagen del tapete se generó por IA basada en el estilo del juego.

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
  // Fase de equipamiento: el contenedor de los héroes.
  '#s-equip .eq-list, #s-equip .eq-heroes, #s-equip .bf-eq-list {' +
    'background: url("' + MAT + '") center/cover, rgba(8,5,14,.65) !important;' +
    'border-radius:12px; border:1.5px solid rgba(255,210,74,.25);' +
    'box-shadow:inset 0 0 26px rgba(0,0,0,.55); padding:8px;' +
  '}' +
  // Cada carta de la mano del jugador: el tapete como fondo base del recuadro,
  // visible en el borde y la zona de texto. El arte va encima (z-index mayor).
  '.chip.bf-chip-card {' +
    'background: url("' + MAT + '") center/cover, #07050b !important;' +
    'border:1.5px solid rgba(255,210,74,.55) !important;' +
  '}' +
  // Cada héroe de la fase de equipamiento: el tapete como fondo del recuadro.
  '.eq-hero.bf-eq-hero-with-art {' +
    'background: url("' + MAT + '") center/cover, #120d1d !important;' +
  '}' +
  '';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // JS de respaldo: encuentra los contenedores padre de las cartas y les pone
  // el tapete si el CSS por selector no los alcanzó (los nombres de clase
  // pueden variar según la pantalla del juego).
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
    // Fase de equipamiento: contenedor de los héroes.
    var equip = document.getElementById('s-equip');
    if(equip && equip.classList.contains('active')) {
      equip.querySelectorAll('.eq-hero.bf-eq-hero-with-art').forEach(function(hero){
        var parent = hero.parentElement;
        if(!parent || parent.dataset.bfMat) return;
        parent.dataset.bfMat = '1';
        parent.style.background = 'url("' + MAT + '") center/cover, rgba(8,5,14,.65)';
        parent.style.borderRadius = '12px';
        parent.style.border = '1.5px solid rgba(255,210,74,.25)';
        parent.style.boxShadow = 'inset 0 0 26px rgba(0,0,0,.55)';
        parent.style.padding = '8px';
      });
    }
  }

  applyToContainers();
  setInterval(applyToContainers, 600);
})();
</script>
`;