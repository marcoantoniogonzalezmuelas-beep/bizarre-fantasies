// Subasta: la rejilla de héroes candidatos mantiene DOS héroes por fila, igual
// que en PC. En móvil el CSS original del juego la colapsaba a una sola carta
// por fila, así que la pantalla quedaba distinta a la de escritorio.
export const AUCTION_GRID_PATCH = `
<style id="bf-auction-grid">
#s-recruit .cards-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
</style>
`;