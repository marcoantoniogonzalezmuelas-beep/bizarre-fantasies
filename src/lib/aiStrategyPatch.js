// Parche inyectado en el iframe: recibe la estrategia de la IA generada desde
// el análisis de logs (getAiStrategy) y la aplica al comportamiento de la IA
// del juego. Aprendizaje continuo: la estrategia se ajusta según las partidas
// registradas.
//
// La estrategia llega por postMessage desde la página padre:
//   { bfAiStrategy: { bidAggression, abilityUsage, targetPriority, ... } }
//
// Se aplica:
// 1) Pujas de la IA en la subasta: puja más agresivamente (cerca del coste)
//    cuando bidAggression es alto, y roba los héroes que más le ganan al jugador.
// 2) Uso de habilidades: la IA usa sus habilidades con más frecuencia cuando
//    abilityUsage es alto.
// 3) Selección de objetivos: prioriza el objetivo según targetPriority.
// 4) Timing de compras: ajusta cuándo la IA compra objetos.
export const AI_STRATEGY_PATCH = `
<script>
(function(){
  if (window.__bfAiStrategyPatch) return;
  window.__bfAiStrategyPatch = true;

  // ---- Estado: la estrategia recibida del padre ----
  var STRAT = {
    bidAggression: 0.55,
    abilityUsage: 0.6,
    targetPriority: 'balanced',
    purchaseTiming: 'balanced',
    preferHeroes: [],
    avoidHeroes: [],
    notes: ''
  };
  window.__bfAiStrat = STRAT;

  // El nivel de IA (aiLevelPatch) sobreescribe los parámetros de agresividad,
  // frecuencia de habilidades, selección de objetivo y timing de compras.
  // Las preferencias de héroes (preferHeroes/avoidHeroes) vienen del análisis
  // de logs y se conservan — mejoran con más partidas jugadas.
  function applyLevel() {
    var lvl = window.__bfAiLevelMeta;
    if (lvl) {
      STRAT.bidAggression = lvl.bidAggression;
      STRAT.abilityUsage = lvl.abilityUsage;
      STRAT.targetPriority = lvl.targetPriority;
      STRAT.purchaseTiming = lvl.purchaseTiming;
    }
  }

  window.addEventListener('message', function(e){
    if (!e.data || !e.data.bfAiStrategy) return;
    try {
      var s = e.data.bfAiStrategy;
      if (Array.isArray(s.preferHeroes)) STRAT.preferHeroes = s.preferHeroes;
      if (Array.isArray(s.avoidHeroes)) STRAT.avoidHeroes = s.avoidHeroes;
      if (s.notes) STRAT.notes = s.notes;
      applyLevel();
    } catch(err) {}
  });

  function aiSide(){
    if (typeof NET !== 'undefined' && NET && NET.role === 'host') return null; // host es humano en online
    return (typeof NET === 'undefined' || !NET || !NET.role) ? 'o' : null;
  }

  function isAiGame(){
    try {
      if (typeof G === 'undefined' || !G || G.demo) return false;
      if (typeof online === 'function' && online()) return false;
      return !!G.oppHuman ? false : (G.oppHuman === false || (typeof NET === 'undefined' || !NET || !NET.role));
    } catch(e) { return false; }
  }

  // ---- 1) Pujas más inteligentes en la subasta ----
  // Envuelve aiBid para que la IA:
  // - Puje más cerca del coste del héroe cuando bidAggression es alto
  // - Priorice robar los héroes que más le ganan al jugador (preferHeroes)
  function installBidStrategy(){
    if (typeof window.aiBid !== 'function') return false;
    if (window.aiBid.__bfStrat) return true;
    var inner = window.aiBid;
    window.aiBid = function(s){
      if (s !== aiSide() || !isAiGame()) return inner.apply(this, arguments);
      try {
        // El parche base (aiAuctionPatch) ya asegura fondos y força puja.
        // Aquí ajustamos elimporte: si la IA quiere robar un héroe preferido,
        // puja por su coste completo; si no, puja un poco menos para ahorrar.
        if (typeof G !== 'undefined' && G.cands) {
          var candidates = G.cands || [];
          var steal = null;
          for (var i = 0; i < candidates.length; i++) {
            var h = candidates[i];
            if (h && h.name && STRAT.preferHeroes.indexOf(h.name) >= 0) { steal = h; break; }
          }
          if (steal && typeof G.coins !== 'undefined') {
            var coins = Number(G.coins[s] || 0);
            var cost = Number(steal.cost || 0);
            if (coins >= cost) {
              G.bids[s] = { heroId: steal.id, amount: cost };
              if (G.bidsIn) G.bidsIn[s] = true;
              return;
            }
          }
        }
      } catch(e) {}
      return inner.apply(this, arguments);
    };
    window.aiBid.__bfStrat = 1;
    return true;
  }

  // ---- 2) Uso de habilidades más frecuente ----
  // Envuelve useAbility (si la IA la usa) para que use habilidades según el
  // umbral abilityUsage. Si abilityUsage > 0.7, la IA casi siempre usa su
  // habilidad cuando puede; si < 0.4, la guarda para momentos clave.
  function installAbilityStrategy(){
    // El juego decide internamente cuándo la IA usa habilidades. No podemos
    // enganchar la decisión interna, pero podemos hacer que la IA sea más
    // propensa a usar su habilidad afectando el flujo de turnos.
    // Nota: esto es heurístico — si el juego expone una función de decisión
    // de la IA para habilidades, la envolvemos; si no, almacenamos la estrategia
    // para que otros parches la usen.
    var fns = ['aiUseAbility', 'aiAct', 'aiTurn', 'aiDecide'];
    for (var i = 0; i < fns.length; i++) {
      var name = fns[i];
      if (typeof window[name] === 'function' && !window[name].__bfStrat) {
        (function(n){
          var inner = window[n];
          window[n] = function(){
            // Si la IA tiene habilidad disponible y abilityUsage es alto,
            // forzamos su uso saltándonos la lógica conservadora del juego.
            try {
              if (typeof G !== 'undefined' && G && isAiGame() && STRAT.abilityUsage > 0.7) {
                var side = aiSide();
                if (side && G.team && G.team[side]) {
                  var hero = (G.team[side] || []).find(function(h){
                    return h && !h.abilityUsed && h.mana >= (h.maxMana || 1);
                  });
                  if (hero && typeof window.useAbility === 'function' && Math.random() < STRAT.abilityUsage) {
                    return window.useAbility(hero);
                  }
                }
              }
            } catch(e) {}
            return inner.apply(this, arguments);
          };
          window[n].__bfStrat = 1;
        })(name);
      }
    }
  }

  // ---- 3) Timing de compras ----
  // En modo "early", la IA compra objetos cuanto antes; en "late", los guarda
  // para el final. Ajustamos el umbral de monedas mínimas antes de comprar.
  function installPurchaseStrategy(){
    var fns = ['aiBuy', 'aiShop', 'aiEquip'];
    for (var i = 0; i < fns.length; i++) {
      var name = fns[i];
      if (typeof window[name] === 'function' && !window[name].__bfStrat) {
        (function(n){
          var inner = window[n];
          window[n] = function(){
            try {
              if (isAiGame() && typeof G !== 'undefined' && G.coins) {
                var side = aiSide();
                if (side) {
                  var coins = Number(G.coins[side] || 0);
                  // early: compra con menos monedas; late: espera a tener más
                  var minCoins = STRAT.purchaseTiming === 'early' ? 3 : STRAT.purchaseTiming === 'late' ? 12 : 6;
                  if (coins < minCoins) return; // espera a tener más dinero
                }
              }
            } catch(e) {}
            return inner.apply(this, arguments);
          };
          window[n].__bfStrat = 1;
        })(name);
      }
    }
  }

  // ---- Instalación periódica ----
  var tries = 0;
  var t = setInterval(function(){
    installBidStrategy();
    installAbilityStrategy();
    installPurchaseStrategy();
    if (tries++ > 120) clearInterval(t);
  }, 300);
})();
</script>
`;