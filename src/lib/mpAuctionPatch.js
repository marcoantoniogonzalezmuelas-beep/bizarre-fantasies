// Parche inyectado: SUBASTA MULTIJUGADOR — el invitado NO genera sus propios
// candidatos de subasta. El host es la autoridad: genera los héroes y los
// envía en el snap. Si el invitado llama a startAuctionPhase, generaría
// héroes distintos a los del host → subasta desincronizada (fase 3 muestra
// los héroes de la fase 2, roles equivocados, etc.).
//
// FIX: en el invitado, startAuctionPhase preserva los candidatos del snap
// (G.cands, G.curType, G.pools, G.aIndex...) y solo renderiza el estado
// actual. No regenera héroes.
export const MP_AUCTION_PATCH = `
<script>
(function(){
  if (window.__bfMpAuctionPatch) return;
  window.__bfMpAuctionPatch = true;

  function install() {
    if (typeof window.startAuctionPhase !== 'function') return false;
    if (window.startAuctionPhase.__bfMpAuction) return true;
    var orig = window.startAuctionPhase;
    window.startAuctionPhase = function() {
      var isClient = (typeof NET !== 'undefined' && NET && NET.role === 'client');
      if (!isClient || typeof G === 'undefined' || !G) return orig.apply(this, arguments);

      // INVITADO: NO llamar al startAuctionPhase original. El original genera
      // héroes nuevos (aleatorios) que NO son los del host. Antes se llamaba y
      // luego se restauraba el snap, pero si el snap nuevo no había llegado
      // aún (polling 500 ms), el invitado veía los héroes de la fase anterior
      // durante ~1 s hasta que el snap correcto llegaba. Ahora el invitado
      // solo renderiza el estado que ya tiene del host (snap más reciente).
      // El snap del host ya trae G.cands, G.curType, G.pools, G.aIndex…
      // correctos. Solo hace falta re-renderizar la pantalla de subasta.
      try {
        if (typeof renderRecruit === 'function') renderRecruit('p');
      } catch(e) {}
    };
    window.startAuctionPhase.__bfMpAuction = 1;
    return true;
  }

  var tries = 0, t = setInterval(function() {
    if (install() || tries++ > 200) clearInterval(t);
  }, 100);
})();
</script>
`;