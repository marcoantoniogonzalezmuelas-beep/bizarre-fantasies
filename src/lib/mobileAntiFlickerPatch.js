// Parche SOLO móvil/tablet: elimina de raíz las propiedades que provocan
// parpadeos de pantalla en los FX del juego (golpes mortales, tormenta ígnea,
// bolas de fuego, maremoto…). En estos dispositivos el iframe va escalado con
// transform, y las capas FX que usan mix-blend-mode, backdrop-filter, filter
// animado (blur/brightness/drop-shadow) o will-change fuerzan re-composiciones
// GPU que hacen parpadear toda la pantalla. Este CSS con !important gana
// incluso a los valores de los @keyframes (las animaciones CSS no pueden
// sobreescribir declaraciones !important), así que neutraliza los filtros
// animados de TODOS los parches FX (clases con prefijo bf-) sin tocarlos.
// Los efectos siguen viéndose (opacidad, transform, box-shadow y text-shadow
// no se tocan): solo se pierden los brillos por filtro, que son los que
// parpadean.
export const MOBILE_ANTIFLICKER_PATCH = `
<style id="bf-antiflicker">
*,*::before,*::after{will-change:auto!important}
/* Excluye .bhero: los héroes caídos (bf-truedead) necesitan su filter
   grayscale, y los retratos de batalla no son capas FX temporales. */
[class^="bf-"]:not(.bhero),[class*=" bf-"]:not(.bhero),
[class^="bf-"]:not(.bhero)::before,[class*=" bf-"]:not(.bhero)::before,
[class^="bf-"]:not(.bhero)::after,[class*=" bf-"]:not(.bhero)::after{
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  backface-visibility:hidden!important;
  -webkit-backface-visibility:hidden!important;
}
/* El "cuadrado blanco" de los impactos se corrige en whiteFlashFixPatch.js
   (se aplica en todo el juego, móvil y escritorio). */
</style>
<script>
(function(){
  if(window.__bfAntiFlicker)return;window.__bfAntiFlicker=true;
  // Mantiene el estilo anti-parpadeo como ÚLTIMO del <head>: otros parches
  // añaden sus <style> en tiempo de ejecución y, a igual especificidad e
  // !important, gana el que va después. Así este siempre prevalece.
  setInterval(function(){
    var s=document.getElementById('bf-antiflicker');
    if(s&&document.head.lastElementChild!==s)document.head.appendChild(s);
  },800);
  // Los brillos por filtro (glow, drop-shadow) se conservan: sin ellos los
  // hechizos (rayo en cadena, tormenta ígnea, maremoto…) se veían apagados o
  // directamente invisibles en móvil.
})();
</script>
`;