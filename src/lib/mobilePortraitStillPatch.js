// Móvil/tablet: el retrato de los héroes en batalla queda TOTALMENTE quieto
// (sin sacudidas, zoom, balanceo ni desplazamientos de ningún parche). Se carga
// el último para ganar a cualquier otra regla.
export const MOBILE_PORTRAIT_STILL_PATCH = `
<style>
html body .bhero, html body .bhero.bhero,
html body .bhero > .bhero-art, html body .bhero .bf-battle-art,
html body .bhero .bf-bscene-portrait, html body .bhero .bf-bscene-bg, html body .bhero > img{
  animation:none!important;-webkit-animation:none!important;transition:none!important;
  transform:none!important;translate:none!important;rotate:none!important;scale:none!important;
}
</style>
`;