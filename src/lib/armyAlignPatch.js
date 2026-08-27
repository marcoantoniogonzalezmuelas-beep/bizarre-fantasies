// Batalla: alinea los dos paneles de ejército (jugador y rival) a la MISMA
// altura. El rival salía un poco más alto que el jugador. Se fuerza al
// contenedor .b-grid a alinear ambos .army-panel desde el borde superior y se
// normalizan sus márgenes verticales para que ninguno "flote" por encima.
export const ARMY_ALIGN_PATCH = `
<style>
.b-grid{align-items:flex-start!important}
.b-grid>.army-panel,
.b-grid>.side-panel{margin-top:0!important}
</style>
`;