// Nombre del héroe en batalla SIEMPRE en una línea de altura fija.
//
// Problema: nombres largos (p. ej. "Fast Everest Panzer") pasaban a dos líneas
// en algunos repintados y en otros no, así que la cabecera cambiaba de alto y
// arrastraba la barra de atributos y las de HP/MP → parecía que la carta se
// "repintaba" sola cada poco tiempo.
//
// Solución: la cabecera reserva una altura fija y el nombre nunca se parte
// (una sola línea, con puntos suspensivos si no cabe y algo más pequeño para
// que los nombres largos entren completos).
export const HERO_NAME_FIT_PATCH = `
<style>
/* El nombre acompaña al tamaño de la barra de atributos (que ahora es más
   ancha): mismo cuerpo de letra, sigue en UNA sola línea de altura fija. */
.bhero .bhero-top{min-height:40px!important;display:flex!important;align-items:center!important;gap:6px!important;contain:layout style}
/* El nombre ocupa todo el espacio libre de la cabecera y se alinea a la
   izquierda: con display:block dentro de un flex se quedaba en 0 de ancho y no
   se veía. min-width:0 permite los puntos suspensivos si el nombre es larguísimo. */
.bhero .bhero-name{flex:1 1 auto!important;min-width:0!important;text-align:left!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:15px!important;line-height:20px!important}
.bhero .vel-tag{white-space:nowrap!important;display:inline-flex!important;align-items:center}
</style>
`;