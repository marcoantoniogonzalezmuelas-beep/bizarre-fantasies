// Parche SOLO móvil/tablet contra el parpadeo del zoom de pellizco.
//
// La causa real: la capa GPU del body se crea al empezar el gesto y se destruye
// al soltar (transform/will-change entran y salen). Cada promoción/degradación
// de capa provoca un destello. La solución es que el body sea SIEMPRE la misma
// capa compuesta y estable: translate3d permanente y backface-visibility fija.
// Nada se pausa ni se desactiva durante el gesto (eso forzaba un recálculo de
// estilos completo al entrar y salir del pellizco, y parpadeaba aún más).
// REVISIÓN (tablet): mantener el translate3d SIEMPRE convertía el body en una
// capa GPU enorme también durante la batalla a x1, y en tablet cada animación
// repintaba esa textura completa (parpadeo). Ahora la capa solo existe mientras
// hay zoom o gesto (lo gestiona mobilePinchZoomPatch con la clase bf-zooming);
// a x1 el body vuelve al camino rápido, sin capa propia.
export const NO_FLICKER_PATCH = `
<style id="bf-no-flicker">
body {
  transform-origin: 0 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
body.bf-zooming { transform: translate3d(0,0,0); }
</style>
`;