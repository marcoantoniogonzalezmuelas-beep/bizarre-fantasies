// Parche SOLO móvil/tablet contra el parpadeo del zoom de pellizco.
//
// La causa real: la capa GPU del body se crea al empezar el gesto y se destruye
// al soltar (transform/will-change entran y salen). Cada promoción/degradación
// de capa provoca un destello. La solución es que el body sea SIEMPRE la misma
// capa compuesta y estable: translate3d permanente y backface-visibility fija.
// Nada se pausa ni se desactiva durante el gesto (eso forzaba un recálculo de
// estilos completo al entrar y salir del pellizco, y parpadeaba aún más).
export const NO_FLICKER_PATCH = `
<style id="bf-no-flicker">
body {
  transform: translate3d(0,0,0);
  transform-origin: 0 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
`;