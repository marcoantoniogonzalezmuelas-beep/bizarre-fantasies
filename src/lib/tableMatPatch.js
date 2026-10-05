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

  // TAPETE LIGERO (el mismo de la mano del equipamiento): azul violeta claro con dibujitos discretos.
  var DOODLES='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220" font-size="26" opacity=".14"><text x="14" y="40">\u{1F3B2}</text><text x="120" y="58">\u{1F345}</text><text x="62" y="118">\u{1F986}</text><text x="160" y="140">\u{1FA99}</text><text x="20" y="190">\u2728</text><text x="110" y="200">\u{1F9E6}</text></svg>');
  var LIGHT_MAT='url("'+DOODLES+'") repeat, radial-gradient(circle at 18% 12%,rgba(255,255,255,.14),transparent 45%), linear-gradient(160deg,#3f3266 0%,#2f4a6b 100%)';
  var css = '' +
  // Mano del jugador en batalla: el panel completo (mismo recuadro que la
  // mano del rival, .hand-under-action), no solo el contenedor de los chips.
  '#s-battle .hand-under-action, #s-battle .hand-zone, #s-battle .hand, #s-battle .bf-hand-zone {' +
    'background: ' + LIGHT_MAT + ' !important;' +
    'border-radius:10px; border:1.5px solid rgba(255,210,74,.3);' +
    'box-shadow:inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4); padding:5px;' +
  '}' +
  // Mano del rival en batalla.
  '#s-battle .hand-rival {' +
    'background: ' + LIGHT_MAT + ' !important;' +
    'border-radius:10px; border:1.5px solid rgba(192,107,255,.3);' +
    'box-shadow:inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4); padding:5px;' +
  '}' +
  // Mazo de descartes: el tapete cubre todo el recuadro incluyendo el mazo.
  '#s-battle .bf-discard-pile {' +
    'background: ' + LIGHT_MAT + ' !important;' +
    'border-radius:10px; border:1.5px solid rgba(255,140,50,.3);' +
    'box-shadow:inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4); padding:5px;' +
  '}' +
  // Fase de equipamiento: SOLO el recuadro de cartas en mano (objetos y
  // hechizos, .eq-hand-box). Nada más de la fase de equipamiento lleva el tapete.
  '#s-equip .eq-hand-box, #s-equip .hand-zone, #s-equip .hand, #s-equip .bf-hand-zone, #modalRoot .hand-zone {' +
    'background: ' + LIGHT_MAT + ' !important;' +
    'border-radius:10px; border:1.5px solid rgba(255,210,74,.3);' +
    'box-shadow:inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4); padding:5px;' +
  '}' +
  // Etiquetas "Mano · Hechizos (× para devolver)" y "Mano · Objetos": el gris
  // original no se lee sobre el tapete; se pasan a dorado con sombra.
  '#s-equip .hand-lbl, #s-battle .hand-lbl {' +
    'color:#ffd98a !important; font-weight:800 !important; text-shadow:0 1px 3px #000, 0 0 8px rgba(0,0,0,.9) !important; letter-spacing:.3px;' +
  '}' +
  // Cada carta de la mano del jugador: el tapete como fondo base del recuadro.
  '.chip.bf-chip-card {' +
    'background: url("' + MAT + '") center/cover, #07050b !important;' +
    'border:1.5px solid rgba(255,210,74,.55) !important;' +
  '}' +
  // Cartas de hechizo/objeto que no se pueden jugar por falta de maná: el
  // juego las oscurece con opacity/filter. Aquí las pasamos a GRIS puro (solo
  // escala de grises, sin tocar la opacidad) para indicar que no se pueden
  // jugar, manteniéndolas totalmente visibles.
  '.chip.bf-chip-card[style*="opacity"], .chip-spell[style*="opacity"], .chip-object[style*="opacity"] {' +
    'filter:grayscale(1) !important;' +
  '}' +
  '.chip.bf-chip-card[style*="brightness"], .chip-spell[style*="brightness"], .chip-object[style*="brightness"] {' +
    'filter:grayscale(1) !important;' +
  '}' +
  '';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // JS: marca en gris las cartas de hechizo/objeto que el juego ha oscurecido
  // por falta de maná. El juego les pone opacity baja o filter brightness bajo
  // inline. Aquí solo les aplicamos escala de grises (sin tocar la opacidad)
  // para indicar que no se pueden jugar.
  function brightenCantPlay() {
    document.querySelectorAll('#s-battle .chip-spell, #s-battle .chip-object, #s-battle .chip.bf-chip-card').forEach(function(chip){
      var op = parseFloat(chip.style.opacity || '1');
      var f = chip.style.filter || '';
      // Si el juego la ha oscurecido mucho (opacity < 0.5 o brightness < 0.5)
      if(op < 0.5) chip.style.setProperty('filter', 'grayscale(1)', 'important');
      if(/brightness\\((0?\\.?[0-4])/.test(f)) chip.style.setProperty('filter', 'grayscale(1)', 'important');
    });
  }

  // JS de respaldo: encuentra los contenedores padre de las cartas y les pone
  // el tapete si el CSS por selector no los alcanzó.
  function applyToContainers() {
    // Mano del jugador: el PANEL COMPLETO (.hand-under-action), igual que la
    // mano del rival. Antes se pintaba solo el contenedor interior de los
    // chips y el tapete no llenaba todo el recuadro.
    document.querySelectorAll('#s-battle .hand-under-action:not(.hand-rival)').forEach(function(h){
      if(h.dataset.bfMat) return;
      h.dataset.bfMat = '1';
      h.style.background = LIGHT_MAT;
      h.style.borderRadius = '10px';
      h.style.border = '1.5px solid rgba(255,210,74,.3)';
      h.style.boxShadow = 'inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4)';
      h.style.padding = '5px';
    });
    // Mano del rival.
    document.querySelectorAll('#s-battle .hand-rival').forEach(function(h){
      if(h.dataset.bfMat) return;
      h.dataset.bfMat = '1';
      h.style.background = LIGHT_MAT;
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
    document.querySelectorAll('#s-equip .eq-hand-box, #s-equip .hand-zone, #s-equip .hand, #s-equip .bf-hand-zone, #modalRoot .hand-zone').forEach(function(h){
      if(h.dataset.bfMat) return;
      h.dataset.bfMat = '1';
      h.style.background = LIGHT_MAT;
      h.style.borderRadius = '10px';
      h.style.border = '1.5px solid rgba(255,210,74,.3)';
      h.style.boxShadow = 'inset 0 0 22px rgba(0,0,0,.55), 0 2px 12px rgba(0,0,0,.4)';
      h.style.padding = '5px';
    });
    brightenCantPlay();
  }

  // Precarga del tapete: al entrar en batalla ya está en caché, así que las
  // zonas de mano se pintan de golpe con su fondo (antes entraba después).
  var _pre = new Image(); _pre.src = MAT;

  // Igual que los retratos de los héroes: se engancha al bucle de render del
  // juego (renderBattle / renderHand) para aplicar el tapete en el MISMO frame
  // en que se dibujan las manos. Así no se ve el repintado inicial.
  // Instalación ÚNICA de cada gancho (antes se reinstalaba mientras su marca no estuviera arriba del todo y se
  // turnaba con otros parches: cientos de capas apiladas, "too much recursion" y turnos atascados).
  var ONCE={};
  function hookRender(name){
    if(ONCE[name]) return true;
    if(typeof window[name] !== 'function') return false;
    ONCE[name] = 1;
    var orig = window[name];
    window[name] = function(){
      var r = orig.apply(this, arguments);
      try{ applyToContainers(); }catch(e){}
      return r;
    };
    window[name].__bfMat = 1;
    return true;
  }
  function hookAll(){ var a = hookRender('renderBattle'), b = hookRender('renderHand'); return a && b; }
  var tries = 0, hk = setInterval(function(){ if(hookAll() || tries++ > 150) clearInterval(hk); }, 120);
  hookAll();

  applyToContainers();
  setInterval(applyToContainers, 600);
})();
</script>
`;