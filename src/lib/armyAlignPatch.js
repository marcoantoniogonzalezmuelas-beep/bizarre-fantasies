// Batalla: alinea los dos paneles de ejército (jugador y rival) a la MISMA
// altura. El rival salía un poco más alto que el jugador. Se fuerza al
// contenedor .b-grid a alinear ambos .army-panel desde el borde superior y se
// normalizan sus márgenes verticales para que ninguno "flote" por encima.
export const ARMY_ALIGN_PATCH = `
<style>
.b-grid{align-items:flex-start!important}
.b-grid>.army-panel,
.b-grid>.side-panel{margin-top:0!important}
/* El rótulo del ejército (nombre del jugador/IA) ocupan a veces 2 líneas en un
   lado y 1 en el otro, lo que empuja los héroes del lado más largo hacia abajo.
   Se fija a una sola línea con altura constante para que ambos ejércitos
   arranquen a la misma altura. */
.b-grid .army-name{
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  min-height:22px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
}
</style>
`;