// Cartas FOIL (épicas): un único brillo que recorre la carta, exactamente el
// mismo efecto en batalla que en la fase de equipamiento (el destello diagonal
// .bf-foil-shine). Se retira la capa de tinte multicolor (el "arcoíris" en modo
// soft-light) que se veía como un efecto raro.
export const FOIL_SHINE_PATCH = `
<style>
/* Capa de tinte multicolor: fuera (cartas de héroe y tienda) */
html body .bf-hero-card .bf-foil,
html body .bf-foil-layer{display:none!important}
html body .bf-foil-card::before{display:none!important}
/* Batalla: el foil del retrato es EL MISMO brillo que en equipamiento —
   un destello que recorre el recuadro, sin tintes de color. */
html body .bhero .bf-epic-foil{
  background:linear-gradient(110deg,transparent 42%,rgba(255,255,255,.35) 49%,rgba(255,255,255,.5) 50%,rgba(255,255,255,.35) 51%,transparent 58%)!important;
  background-size:250% 250%!important;
  mix-blend-mode:screen!important;
  opacity:.55!important;
  z-index:8!important;
  animation:bfFoilShine 5.5s ease-in-out infinite!important;
}
/* El brillo que recorre la carta se mantiene y es el único efecto foil */
html body .bf-hero-card.cf-foiled::after,
html body .bf-foil-shine{opacity:.55!important}
</style>
`;