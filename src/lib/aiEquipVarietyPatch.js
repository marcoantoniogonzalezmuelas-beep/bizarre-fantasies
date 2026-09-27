// Parche inyectado en el iframe: EQUIPAMIENTO DE LA IA variado y adaptado al
// ejército. Sustituye a aiEquip (que siempre compraba lo mismo: el arma más
// cara, la mejor armadura y la misma lista fija de objetos) por una elección
// ponderada que depende de los tres héroes (CC/AD/HE, vida, maná), incluye las
// cartas nuevas (Drenaje, Rearmar, El Anillo, El Ladrón Enmascarado,
// Reanimación Arcana) y penaliza lo que la IA equipó en la partida anterior.
// Se instala al cargar (antes que aiStrategyPatch, que lo envuelve después).
export const AI_EQUIP_VARIETY_PATCH = `
<script>
(function(){
  if(window.__bfAiEquipVariety) return;
  window.__bfAiEquipVariety = true;
  var HIST_KEY = 'bfAiEquipHist';

  function loadHist(){ try{ return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); }catch(e){ return []; } }
  function saveHist(ids){ try{ localStorage.setItem(HIST_KEY, JSON.stringify(ids.slice(0, 30))); }catch(e){} }
  function pickW(list){
    var total = list.reduce(function(s, x){ return s + x.w; }, 0);
    if(total <= 0) return null;
    var r = Math.random() * total;
    for(var i = 0; i < list.length; i++){ r -= list[i].w; if(r <= 0) return list[i].it; }
    return list[list.length - 1].it;
  }
  function clone(o){ return (typeof deep === 'function') ? deep(o) : JSON.parse(JSON.stringify(o)); }

  function aiEquipVaried(side){
    var team = (G.team[side] || []).filter(Boolean);
    var budget = Number(G.equipCoins[side] || 0);
    var hist = loadHist();
    var pen = function(id){ return hist.indexOf(id) >= 0 ? 0.45 : 1; };
    var chosen = [];
    G.spellbook[side] = G.spellbook[side] || [];
    G.items[side] = G.items[side] || [];
    var manaBase = (typeof MANA_BASE !== 'undefined') ? MANA_BASE : { HE: 1 };
    var mages = team.filter(function(h){ return h.type === 'HE'; });
    var casters = team.filter(function(h){ return (manaBase[h.type] || 0) > 0; });
    var weaponUsers = team.filter(function(h){ return h.type !== 'HE'; }).length;
    var fragile = team.some(function(h){ return h.type === 'HE' || Number(h.hp || 0) < 26; });
    // Reserva para objetos/hechizos: más grande si hay magos.
    var reserve = Math.round(budget * (mages.length ? 0.5 : 0.38));

    // 1) Armas: entre las 3 mejores asequibles, al azar ponderado por coste.
    function gear(arr, key, h){
      var aff = arr.filter(function(w){ return w.cost <= budget - reserve; }).sort(function(a, b){ return b.cost - a.cost; }).slice(0, 3);
      var it = pickW(aff.map(function(w){ return { it: w, w: (w.cost + 2) * pen(w.id) }; }));
      if(it){ budget -= it.cost; h[key] = clone(it); chosen.push(it.id); }
    }
    team.slice().sort(function(a, b){ return (b.cost || 0) - (a.cost || 0); }).forEach(function(h){
      if(h.type === 'AD') gear(RANGED, 'rwep', h);
      else if(h.type === 'CC') gear(MELEE, 'mwep', h);
      else if(Math.random() < 0.5) gear(RANGED.filter(function(w){ return w.cost <= 8; }), 'rwep', h);
    });

    // 2) Armadura: al tanque (más vida, preferiblemente CC) y, a veces, al más frágil.
    function armor(h){
      var aff = ARMORS.filter(function(a){ return a.cost <= budget - reserve; }).sort(function(a, b){ return (b.hp + b.redM + b.redH) - (a.hp + a.redM + a.redH); }).slice(0, 3);
      var it = pickW(aff.map(function(a){ return { it: a, w: (a.hp + 4) * pen(a.id) }; }));
      if(it){ budget -= it.cost; h.armor = clone(it); chosen.push(it.id); }
    }
    var byHp = team.slice().sort(function(a, b){ return (b.hp + (b.type === 'CC' ? 8 : 0)) - (a.hp + (a.type === 'CC' ? 8 : 0)); });
    if(byHp[0]) armor(byHp[0]);
    var weak = byHp[byHp.length - 1];
    if(weak && weak !== byHp[0] && Math.random() < 0.45) armor(weak);

    // 3) Hechizos (solo con magos): variados, sin repetir.
    if(mages.length){
      var nSp = Math.min(4, 1 + mages.length + (Math.random() < 0.5 ? 1 : 0));
      var spPool = SPELLS.slice();
      for(var s = 0; s < nSp; s++){
        var cand = spPool.filter(function(x){ return x.cost <= budget && G.spellbook[side].indexOf(x.id) < 0; }).map(function(x){
          var k = x.kind, w = 1;
          if(/^dmg/.test(k)) w = 2.6; else if(/^heal/.test(k)) w = 2; else if(k === 'bf_steal') w = 2.2; else if(k === 'bf_recover') w = 1.8;
          return { it: x, w: w * pen(x.id) };
        });
        var sp = pickW(cand);
        if(!sp) break;
        budget -= sp.cost; G.spellbook[side].push(sp.id); chosen.push(sp.id);
      }
    }

    // 4) Objetos: ponderados según el ejército, sin repetir, hasta 4.
    var W = {
      revive: 3, reviveAll: team.length >= 3 ? 1.2 : 0, heal: 2, healBig: 1.6, shield: fragile ? 2.2 : 1.3,
      bomb: 1.6, cleanse: 0.8, mana: casters.length ? 2 : 0, manaBig: casters.length ? 1.4 : 0,
      bf_drain: 2.3, bf_ring: fragile ? 2.6 : 1.7, bf_rearm: weaponUsers >= 2 ? 1.9 : 0.7
    };
    for(var o = 0; o < 5; o++){
      var have = G.items[side].map(function(x){ return x.id; });
      var oc = OBJECTS.filter(function(x){ return x && x.cost <= budget && have.indexOf(x.id) < 0; }).map(function(x){ return { it: x, w: (W[x.kind] != null ? W[x.kind] : 1) * pen(x.id) }; });
      var ob = pickW(oc);
      if(!ob) break;
      budget -= ob.cost; G.items[side].push(clone(ob)); chosen.push(ob.id);
    }
    G.equipCoins[side] = budget;
    saveHist(chosen);
  }

  // El motor se define después de los parches: se instala en cuanto exista,
  // con un intervalo corto para quedar por debajo del envoltorio de estrategia.
  var iv = setInterval(function(){
    if(typeof aiEquip !== 'function') return;
    clearInterval(iv);
    window.aiEquip = aiEquipVaried;
  }, 10);
})();
</script>
`;