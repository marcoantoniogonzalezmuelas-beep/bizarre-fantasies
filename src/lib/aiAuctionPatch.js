// Parche inyectado: comportamiento de la IA en la subasta (solo partidas vs IA).
// 1) Si a la IA le faltan monedas, transfiere monedas de equipamiento a la
//    subasta (misma mecánica que el humano: cada moneda cuesta 2 de equipamiento).
// 2) La IA NUNCA completa su equipo con Bizarros: siempre recluta 3 héroes reales.
// 3) La IA nunca "pasa" mientras le falte héroe en la fase — eso generaba
//    repujas falsas (rondas donde nadie reclutaba nada).
export const AI_AUCTION_PATCH = `
<script>
(function(){
  if (window.__bfAiAuctionPatch) return;
  window.__bfAiAuctionPatch = true;

  function aiSide(){ return (typeof NET === 'undefined' || !NET || !NET.role) ? 'o' : null; }
  // ¿Le falta a este lado el héroe de la fase actual? Comprobación infalible:
  // en la fase N (0,1,2) el equipo debe acabar con N+1 héroes. Solo puede
  // "conservar y pasar" quien YA tiene el héroe de esta fase (repuja ganada).
  function needsHero(s){
    var teamLen = ((G.team && G.team[s]) || []).length;
    return teamLen < (Number(G.aIndex || 0) + 1);
  }
  function mods(s){ try { return window.bidMods ? window.bidMods(s) : { add: 0, sub: 0 }; } catch(e){ return { add: 0, sub: 0 }; } }
  function pool(s){ return (G.epicCands && G.epicCands[s]) || G.cands || []; }
  function cheapest(s){ var c = null; pool(s).forEach(function(h){ if (h && (!c || Number(h.cost||0) < Number(c.cost||0))) c = h; }); return c; }

  // Transferencia equipamiento → subasta, igual que el humano (máx. 100 por partida).
  function xfer(s, amt){
    if (!G.bfEquipXfer) G.bfEquipXfer = { p: 0, o: 0 };
    var left = 100 - (G.bfEquipXfer[s] || 0);
    var t = Math.max(0, Math.min(Math.ceil(Number(amt || 0)), left));
    if (t <= 0) return 0;
    G.coins[s] = (G.coins[s] || 0) + t;
    G.bfEquipXfer[s] = (G.bfEquipXfer[s] || 0) + t;
    if (typeof pushLog === 'function') pushLog('li', '🏦 ' + ((G.names && G.names[s]) || 'La IA') + ' transfiere ' + t + ' monedas de equipamiento a la subasta.');
    return t;
  }

  // Asegura que la IA puede pagar al menos el héroe más barato de la ronda.
  function ensureFunds(s){
    var ch = cheapest(s); if (!ch) return;
    var m = mods(s), need = Math.max(0, Number(ch.cost || 0) - m.add + m.sub);
    var c = Number((G.coins && G.coins[s]) || 0);
    if (c < need) xfer(s, need - c);
  }

  // Puja forzada: el héroe más barato, por su coste (o todo lo que le quede).
  function forceBid(s){
    var ch = cheapest(s);
    if (!ch) { G.bids[s] = { pass: true }; return; }
    ensureFunds(s);
    var m = mods(s), c = Number((G.coins && G.coins[s]) || 0);
    var max = Math.max(0, c + m.add - m.sub);
    G.bids[s] = { heroId: ch.id, amount: Math.min(Number(ch.cost || 0), max) || Number(ch.cost || 0) };
    if (G.bidsIn) G.bidsIn[s] = true;
  }

  // Quita Bizarros que se hayan colado en el equipo de la IA durante la subasta.
  function stripBizarros(s, fromLen){
    var team = (G.team && G.team[s]) || [];
    var removed = false;
    for (var i = team.length - 1; i >= Math.max(0, fromLen); i--) {
      var h = team[i];
      if (h && String(h._token || h.id || '').indexOf('tk_') === 0) { team.splice(i, 1); removed = true; }
    }
    if (removed && G.phaseNeeds) G.phaseNeeds[s] = true;
    return removed;
  }

  function install(){
    if (typeof window.aiBid !== 'function' || typeof window.resolveBidRound !== 'function') return false;
    if (typeof G === 'undefined' || !G) return false;
    if (window.aiBid.__bfAiFix) return true;

    var innerAiBid = window.aiBid;
    window.aiBid = function(s){
      var ai = aiSide();
      if (s !== ai) return innerAiBid.apply(this, arguments);
      var preLen = ((G.team && G.team[s]) || []).length;
      if (needsHero(s)) ensureFunds(s);
      try { innerAiBid.apply(this, arguments); } catch(e){}
      stripBizarros(s, preLen);
      var b = G.bids && G.bids[s];
      if ((!b || b.pass) && needsHero(s)) {
        // El envoltorio interno pudo marcar phaseNeeds=false sin reclutar: deshacerlo.
        if (G.phaseNeeds) G.phaseNeeds[s] = true;
        forceBid(s);
        if (typeof window.checkBids === 'function') window.checkBids();
      }
    };
    window.aiBid.__bfAiFix = 1;

    var innerResolve = window.resolveBidRound;
    window.resolveBidRound = function(){
      var ai = aiSide();
      if (ai) {
        var b = G.bids && G.bids[ai];
        if ((!b || b.pass) && needsHero(ai)) { if (G.phaseNeeds) G.phaseNeeds[ai] = true; forceBid(ai); b = G.bids[ai]; }
        // Cubre la puja de la IA para que el ajuste interno no la convierta en "pasa".
        if (b && !b.pass) {
          var m = mods(ai), h = pool(ai).concat(typeof HEROES !== 'undefined' ? HEROES : []).find(function(x){ return x && x.id === b.heroId; });
          var need = Math.max(0, Number((h && h.cost) || 0) - m.add + m.sub);
          var c = Number((G.coins && G.coins[ai]) || 0);
          if (c < need) xfer(ai, need - c);
        }
      }
      return innerResolve.apply(this, arguments);
    };
    window.resolveBidRound.__bfAiFix = 1;
    return true;
  }

  var iv = setInterval(function(){ if (install()) clearInterval(iv); }, 300);
  install();
})();
</script>
`;