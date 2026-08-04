// CSS crítico inyectado en el <head> del juego.
//
// Problema que resuelve: el HTML del juego pesa ~566 KB y varias reglas
// imprescindibles de la portada viven en bloques <style> situados MUY al final
// del documento (a partir de los 430 KB). El navegador pinta la página en
// cuanto ha leído la cabecera, así que durante los primeros instantes se ve la
// portada SIN esas reglas: la fila de emojis (⚔🏹🔮) aparece visible y las
// imágenes de los botones "Aprende a jugar / Cómo se juega / Razas" se dibujan
// a su tamaño natural (cientos de píxeles), ocupando media pantalla.
//
// Estas mismas reglas, colocadas en el <head>, se aplican desde el PRIMER
// pintado, así que esa pantalla intermedia deja de existir. Son copia de las
// reglas finales del propio juego (no cambian el diseño final), solo llegan
// antes. Se mantienen los !important para que ninguna regla anterior las gane.
export const CRITICAL_HEAD_CSS = `
<style id="bf-critical-head">
/* La fila de emojis se oculta en el diseño final: ocúltala ya de entrada. */
.title-emoji{display:none!important}
/* Los iconos de los botones de portada son círculos recortados; sin esto las
   imágenes se pintan a tamaño natural y desmontan la portada. */
.tc-img{width:72px!important;height:72px!important;border-radius:50%!important;overflow:hidden!important;flex-shrink:0!important;display:flex!important;align-items:center!important;justify-content:center!important}
.tc-img img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}
.title-links{margin-top:26px!important;display:flex!important;gap:16px!important;justify-content:center!important;flex-wrap:wrap!important}
.title-links .btn.sm{width:142px!important;min-height:128px!important;display:inline-flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:10px!important;padding:18px 12px 15px!important}
@media (max-width:1024px){
  .tc-img{width:56px!important;height:56px!important}
  .title-links{gap:11px!important}
  .title-links .btn.sm{width:104px!important;min-height:108px!important;font-size:12px!important;padding:14px 8px 12px!important}
}
/* Cualquier imagen del juego queda acotada al ancho disponible mientras el
   resto del CSS termina de cargar: evita imágenes gigantes momentáneas. */
img{max-width:100%!important}
</style>
`;