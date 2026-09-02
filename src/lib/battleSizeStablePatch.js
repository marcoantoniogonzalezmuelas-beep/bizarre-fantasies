// Tamaño ESTABLE del retrato + escena de batalla durante toda la partida.
//
// Problema: el retrato/escena (.bf-battle-art) se estiraba con top/bottom
// negativos, así que crecía o se encogía cada vez que el recuadro del héroe
// cambiaba de alto (al añadirse equipo, estados, marcadores…). Aquí se le da
// una ALTURA FIJA: el arte mide siempre lo mismo, pase lo que pase.
//
// Además, en móvil el pellizco dejaba ver por un instante el tapete marrón
// bajo el recuadro mientras el navegador redibujaba la imagen (los "cuadros
// marrones"): el fondo del recuadro pasa a ser opaco y durante el gesto se
// quita el filtro de color del arte (es lo que forzaba el redibujado).
export const BATTLE_SIZE_STABLE_PATCH = `
<script>
(function(){
  if(window.__bfBattleSizeStable) return;
  window.__bfBattleSizeStable = true;

  var css = [
    // Arte de batalla con alto FIJO: no depende del alto del recuadro.
    'html body .bhero .bf-battle-art{top:-18px!important;bottom:auto!important;height:276px!important;width:216px!important}',
    // Recuadro del héroe: alto estable y fondo OPACO (sin transparencias que
    // dejen ver el tapete al repintar).
    'html body .bhero{min-height:240px!important;background:linear-gradient(180deg,#170f28,#0a0612)!important}',
    // Durante el pellizco: sin filtros de color sobre el arte (evita el
    // repintado que provocaba los cuadros marrones) y sin sombras animadas.
    'html.bf-pinching .bhero .bf-battle-art{filter:none!important}',
    'html.bf-pinching .bhero{box-shadow:0 6px 16px rgba(0,0,0,.5)!important}'
  ].join('');

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  // El orden de cascada lo garantiza el coordinador de styleOrderPatch (antes
  // esta hoja se re-añadía al final del head en bucle, en guerra con otros
  // parches: recálculos de estilo constantes = parpadeo en tablet).
  if(window.__bfStyleOrder) window.__bfStyleOrder(st, 30);
})();
</script>
`;
