// Suscripción fiable a los cambios de tamaño de pantalla en móvil y tablet.
//
// En iOS (y en algunos Android) el evento `orientationchange` se dispara ANTES de que
// window.innerWidth/innerHeight y documentElement.clientWidth/Height tengan los valores
// de la nueva orientación. Calcular la escala en ese instante la deja mal (o decide
// "vertical" cuando ya es horizontal) hasta que llega otro `resize`, que no siempre
// llega. Por eso, tras girar, se vuelve a medir a los 150 ms y a los 450 ms.
// No se usa visualViewport a propósito: también se dispara al hacer pellizco (zoom),
// y recalcular la escala en pleno gesto rompería el zoom del jugador.
export function onViewportChange(callback) {
  let t1 = 0, t2 = 0;
  const onResize = () => callback();
  const onOrientation = () => {
    callback();
    clearTimeout(t1); clearTimeout(t2);
    t1 = setTimeout(callback, 150);
    t2 = setTimeout(callback, 450);
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onOrientation);
  return () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onOrientation);
    clearTimeout(t1); clearTimeout(t2);
  };
}
