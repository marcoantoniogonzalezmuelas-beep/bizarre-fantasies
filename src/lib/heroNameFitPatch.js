// Nombre del héroe en batalla DEBAJO de la barra de stats, en su propia fila.
//
// Antes el nombre y la barra de stats (.vel-tag) compartían una sola fila; la
// barra acaparaba el ancho y el nombre se quedaba en puntos suspensivos.
// Ahora la cabecera se apila en vertical: la barra de stats arriba y el nombre
// justo debajo, ocupando todo el ancho de la carta → siempre legible.
export const HERO_NAME_FIT_PATCH = `
<style>
/* Cabecera apilada: barra de stats arriba, nombre debajo (fila propia). */
.bhero .bhero-top{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:3px!important;contain:layout style}
/* Barra de stats: ocupa su fila completa arriba. */
.bhero .vel-tag{flex:0 0 auto!important;white-space:nowrap!important;display:inline-flex!important;align-items:center}
/* Nombre: fila propia debajo de la barra, ancho completo. Una sola línea
   (altura fija) y solo recorta con puntos si es extremadamente largo. */
.bhero .bhero-name{flex:0 0 auto!important;width:100%!important;min-width:0!important;text-align:left!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:14px!important;line-height:18px!important;font-weight:800!important;text-shadow:0 1px 2px #000,0 0 6px rgba(0,0,0,.7)!important}
</style>
`;