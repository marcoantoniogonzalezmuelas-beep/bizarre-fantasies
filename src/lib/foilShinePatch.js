// Cartas FOIL (épicas): un único brillo que recorre la carta, igual que en el
// Oráculo. Se retira la capa de tinte multicolor (el "arcoíris" en modo
// soft-light) que el juego pintaba encima de las cartas y de los retratos de
// batalla y que se veía como un efecto raro. Queda solo el destello diagonal
// que barre la carta (.cf-foiled::after / .bf-foil-shine).
export const FOIL_SHINE_PATCH = `
<style>
/* Capa de tinte multicolor: fuera (cartas de héroe, tienda y retratos de batalla) */
html body .bf-hero-card .bf-foil,
html body .bf-foil-layer,
html body .bhero .bf-epic-foil{display:none!important}
html body .bf-foil-card::before{display:none!important}
/* El brillo que recorre la carta se mantiene y es el único efecto foil */
html body .bf-hero-card.cf-foiled::after,
html body .bf-foil-shine{opacity:.55!important}
</style>
`;