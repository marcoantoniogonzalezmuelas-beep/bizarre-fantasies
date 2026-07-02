// Parche inyectado en el iframe: evita héroes repetidos en la subasta.
// drawRaceSlate saca un héroe por raza del pool completo (G.pools[curType]),
// pero NO filtra los ya adjudicados. En pujas contestadas se re-puja (subRound++)
// con un nuevo slate del mismo pool → puede volver a salir un héroe ya ganado
// y adjudicarse al rival → dos copias del mismo héroe (imposible).
// Fix: excluir de drawRaceSlate cualquier héroe cuyo id ya esté en G.team.p u o.
export const AUCTION_NODUP_PATCH = `
<script>
(function(){
  if (window.__bfNoDupPatch) return;
  window.__bfNoDupPatch = true;

  function install(){
    if (typeof window.drawRaceSlate !== 'function') return false;
    if (typeof G === 'undefined' || !G) return false;
    if (window.drawRaceSlate.__bfNoDup) return true;
    var orig = window.drawRaceSlate;
    window.drawRaceSlate = function(pool){
      try {
        var taken = {};
        if (G.team) {
          (G.team.p || []).forEach(function(h){ if (h && h.id) taken[h.id] = true; });
          (G.team.o || []).forEach(function(h){ if (h && h.id) taken[h.id] = true; });
        }
        var filtered = (pool || []).filter(function(h){ return h && h.id && !taken[h.id]; });
        if (filtered.length) return orig.call(this, filtered);
      } catch(e) {}
      return orig.apply(this, arguments);
    };
    window.drawRaceSlate.__bfNoDup = 1;
    return true;
  }

  var iv = setInterval(function(){ if (install()) clearInterval(iv); }, 300);
  install();
})();
</script>
`;