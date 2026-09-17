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

      // INVITADO: preservar el estado de la subasta que vino del snap del host.
      // Si llamamos al startAuctionPhase original, generaría héroes distintos.
      var saved = {};
      try {
        saved.cands = G.cands ? G.cands.slice() : null;
        saved.epicCands = G.epicCands ? { p: (G.epicCands.p||[]).slice(), o: (G.epicCands.o||[]).slice() } : null;
        saved.curType = G.curType;
        saved.pools = G.pools;
        saved.aIndex = G.aIndex;
        saved.subRound = G.subRound;
        saved.phaseNeeds = G.phaseNeeds ? { p: G.phaseNeeds.p, o: G.phaseNeeds.o } : null;
        saved.bidsIn = G.bidsIn;
      } catch(e) {}

      var res = orig.apply(this, arguments);

      // Restaurar el estado del snap del host
      try {
        if (saved.cands) G.cands = saved.cands;
        if (saved.epicCands) G.epicCands = saved.epicCands;
        if (saved.curType !== undefined) G.curType = saved.curType;
        if (saved.pools) G.pools = saved.pools;
        if (saved.aIndex !== undefined) G.aIndex = saved.aIndex;
        if (saved.subRound !== undefined) G.subRound = saved.subRound;
        if (saved.phaseNeeds) G.phaseNeeds = saved.phaseNeeds;
        if (saved.bidsIn) G.bidsIn = saved.bidsIn;
        // Re-renderizar con los candidatos correctos del snap
        if (typeof renderRecruit === 'function') renderRecruit('p');
      } catch(e) {}
      return res;
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