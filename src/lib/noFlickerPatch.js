// Parche SOLO móvil/tablet: elimina el parpadeo durante el zoom de pellizco y
// en los momentos de mucha animación de la batalla.
//
// Causas del parpadeo y cómo se corrigen:
// 1) Mientras se pellizca, el body está escalado con transform: cada animación
//    CSS en curso (auras, brillos, sombras animadas) obliga al compositor a
//    rehacer la capa escalada en cada frame. Al pellizcar se pausan TODAS las
//    animaciones y transiciones (clase bf-pinching en <html>) y se recuperan al
//    soltar: el gesto va fluido y sin destellos.
// 2) Capas compuestas inestables: se fija backface-visibility en el body para
//    que la capa del zoom no se recree.
export const NO_FLICKER_PATCH = `
<style id="bf-no-flicker">
body { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
/* Durante el pellizco: nada se anima ni transiciona → cero recomposiciones */
html.bf-pinching *, html.bf-pinching *::before, html.bf-pinching *::after {
  animation-play-state: paused !important;
  transition: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
/* El body sí conserva su transición de reencuadre al soltar */
html.bf-pinching body { transition: transform .26s cubic-bezier(.2,.8,.3,1) !important; }
</style>
`;