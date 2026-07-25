// Parche inyectado en el iframe: evita héroes repetidos en la subasta.
// drawRaceSlate saca un héroe por raza del pool completo (G.pools[curType]),
// pero NO filtra los ya adjudicados. En pujas contestadas se re-puja (subRound++)
// con un nuevo slate del mismo pool → puede volver a salir un héroe ya ganado
// y adjudicarse al rival → dos copias del mismo héroe (imposible).
// Fix: excluir de drawRaceSlate cualquier héroe cuyo id ya esté en G.team.p u o.
// Además, red de seguridad definitiva en award(): si una puja llega con un héroe
// ya adjudicado (pujas obsoletas, IA, demo IA vs IA), se sustituye por otro héroe
// libre del mismo rol antes de adjudicarlo — así NUNCA hay dos copias en juego.
export const AUCTION_NODUP_PATCH = `
<script>
(function(){
  if (window.__bfNoDupPatch) return;
  window.__bfNoDupPatch = true;

  function takenIds(){
    var taken = {};
    try {
      if (typeof G !== 'undefined' && G && G.team) {
        (G.team.p || []).forEach(function(h){ if (h && h.id) taken[h.id] = true; });
        (G.team.o || []).forEach(function(h){ if (h && h.id) taken[h.id] = true; });
      }
    } catch(e) {}
    return taken;
  }

  function install(){
    if (typeof window.drawRaceSlate !== 'function') return false;
    if (typeof G === 'undefined' || !G) return false;
    if (window.drawRaceSlate.__bfNoDup) return true;
    var orig = window.drawRaceSlate;
    window.drawRaceSlate = function(pool){
      try {
        var taken = takenIds();
        var filtered = (pool || []).filter(function(h){ return h && h.id && !taken[h.id]; });
        if (filtered.length) return orig.call(this, filtered);
      } catch(e) {}
      return orig.apply(this, arguments);
    };
    window.drawRaceSlate.__bfNoDup = 1;
    return true;
  }

  // award(side, heroId, amount): si el héroe ya está en cualquier equipo,
  // se adjudica en su lugar otro héroe libre del mismo rol (coste parecido).
  function installAward(){
    if (typeof window.award !== 'function') return false;
    if (typeof G === 'undefined' || !G) return false;
    if (window.award.__bfNoDup) return true;
    var orig = window.award;
    window.award = function(side, heroId, amount){
      // La elección del sustituto se calcula aparte: si algo falla aquí, se
      // sigue con la puja original (nunca se adjudica dos veces).
      var subId = null;
      try {
        var taken = takenIds();
        if (heroId && taken[heroId]) {
          var all = typeof HEROES !== 'undefined' ? HEROES : [];
          var dup = null;
          for (var i = 0; i < all.length; i++) { if (all[i] && all[i].id === heroId) { dup = all[i]; break; } }
          var type = dup && dup.type;
          var free = all.filter(function(h){
            return h && h.id && !taken[h.id] && h.clan !== 'Bizarros' && String(h.id).indexOf('tk_') !== 0 && (!type || h.type === type);
          });
          if (free.length) {
            var cost = dup ? Number(dup.cost || 0) : 0;
            free.sort(function(a, b){ return Math.abs(Number(a.cost||0) - cost) - Math.abs(Number(b.cost||0) - cost); });
            var sub = free[Math.floor(Math.random() * Math.min(3, free.length))];
            subId = sub.id;
            try { if (typeof pushLog === 'function' && dup) pushLog('li', '⚖️ ' + (dup.name || 'Ese héroe') + ' ya fue reclutado: ' + ((G.names && G.names[side]) || side) + ' recluta a ' + sub.name + ' en su lugar.'); } catch(e) {}
          }
        }
      } catch(e) { subId = null; }
      if (subId) return orig.call(this, side, subId, amount);
      return orig.apply(this, arguments);
    };
    window.award.__bfNoDup = 1;
    return true;
  }

  var iv = setInterval(function(){ if (install() && installAward()) clearInterval(iv); }, 300);
  install();
  installAward();
})();
</script>
`;