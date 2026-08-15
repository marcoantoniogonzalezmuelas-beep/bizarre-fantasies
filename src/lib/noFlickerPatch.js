// Parche SOLO móvil/tablet contra el parpadeo del zoom de pellizco.
//
// El body lleva un translate3d(0,0,0) PERMANENTE. Así la capa GPU del body
// existe siempre y no se crea ni se destruye al empezar/terminar el pellizco
// (esa promoción/degradación de capa era el destello al pellizcar).
//
// Esto es seguro para la batalla porque los FX viven en #bf-fx-layer (capa
// aislada) y los retratos de héroes tienen su propia capa GPU pequeña: el
// body no se repinta durante las animaciones de combate, solo se mueve como
// un bloque cuando el usuario hace zoom.
export const NO_FLICKER_PATCH = `
<style id="bf-no-flicker">
body {
  transform-origin: 0 0;
  transform: translate3d(0,0,0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
`;