// Mismo tamaño para TODOS los héroes de la batalla (tuyos y del rival) y sin
// cambios de tamaño durante toda la partida.
//
// El tablero repartía el ancho entre las dos columnas de ejército de forma
// desigual (la columna del jugador salía más ancha que la del rival), así que
// sus recuadros se veían más grandes. Aquí se fijan dos columnas idénticas y
// una altura constante para cada recuadro.
export const BATTLE_EQUAL_SIZE_PATCH = `
<script>
(function(){
  if(window.__bfBattleEqualSize) return;
  window.__bfBattleEqualSize = true;

  var css = [
    'html body .b-grid{grid-template-columns:1fr auto 1fr!important;align-items:start!important}',
    'html body .b-grid .army-panel{width:100%!important;min-width:0!important;max-width:none!important;align-self:start!important;padding-top:0!important;margin-top:0!important}',
    // Las dos columnas arrancan EXACTAMENTE a la misma altura: el primer
    // recuadro de cada ejército queda alineado con el del rival.
    'html body .b-grid .army-panel > *:first-child{margin-top:0!important}',
    'html body .b-grid .army-panel .bhero{margin-top:0!important;margin-bottom:10px!important}',
    // Recuadro del héroe: mismo ancho (el de su columna) y ALTO FIJO siempre.
    'html body .bhero{width:100%!important;min-width:0!important;height:240px!important;min-height:240px!important;max-height:240px!important;box-sizing:border-box!important}'
  ].join('');

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  setInterval(function(){ if(document.head.lastChild !== st) document.head.appendChild(st); }, 1500);
})();
</script>
`;