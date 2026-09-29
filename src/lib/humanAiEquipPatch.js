// Parche inyectado en el iframe: el botón "Equipar con IA" del jugador usa el
// MISMO criterio que la IA rival (aiEquip: variado, adaptado al ejército y que
// mejora con lo que la IA aprende), en lugar del planificador fijo que siempre
// elegía lo mismo. Solo rellena huecos: nunca sustituye equipo ya comprado.
export const HUMAN_AI_EQUIP_PATCH = `
<script>
(function(){
  if(window.__bfHumanAiEquip) return;
  window.__bfHumanAiEquip = true;
  var last = 0;
  function isClient(){ return typeof NET !== 'undefined' && NET.role === 'client'; }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function mySide(){ return isClient() ? NET.mySide : ((typeof G !== 'undefined' && G && G.eqSide) || 'p'); }

  function run(side){
    var team = (G.team[side] || []).filter(Boolean);
    G.spellbook[side] = G.spellbook[side] || [];
    G.items[side] = G.items[side] || [];
    var before = {
      coins: Number(G.equipCoins[side] || 0),
      spells: G.spellbook[side].slice(),
      items: G.items[side].slice(),
      gear: team.map(function(h){ return { h: h, m: h.mwep, r: h.rwep, a: h.armor }; })
    };
    // 1) La IA elige sobre el estado real (muta G)…
    window.aiEquip(side);
    // 2) …se lee lo elegido y se restaura el estado para confirmarlo por la vía normal.
    var plan = { gear: [], spells: [], items: [] };
    var refund = 0;
    before.gear.forEach(function(g){
      var h = g.h;
      [['mwep','m','melee'],['rwep','r','ranged'],['armor','a','armor']].forEach(function(s){
        var now = h[s[0]], old = g[s[1]];
        if(now === old) return;
        if(old){ // ya tenía equipo: no se sustituye, se devuelve el coste
          refund += Number(now && now.cost || 0); h[s[0]] = old; return;
        }
        if(now){ plan.gear.push({ hero: h, slot: s[0], kind: s[2], it: now }); h[s[0]] = old; }
      });
    });
    G.spellbook[side].forEach(function(id){ if(before.spells.indexOf(id) < 0) plan.spells.push(id); });
    G.items[side].forEach(function(o, i){ if(i >= before.items.length) plan.items.push(o); });
    G.spellbook[side] = before.spells; G.items[side] = before.items;
    G.equipCoins[side] = before.coins;
    // 3) Se aplica: cliente = intents al anfitrión; anfitrión/local = directo.
    var n = 0, spent = {}, sp2 = before.spells.slice(), it2 = before.items.slice();
    function coins(){ return Number(G.equipCoins[side] || 0); }
    function payGear(h, slot, kind, it){
      var cost = Number(it.cost || 0);
      if(coins() < cost) return false;
      if(isClient()){
        // El parche de equipo del cliente (mpEquipPatch) ya aplica Y COBRA la compra:
        // cobrar aquí también duplicaba el gasto. Se comprueba el cambio real de monedas.
        var c0 = coins();
        sendIntent('doAssign', { heroId: h.id, assign: { kind: kind, id: it.id, cost: it.cost, name: it.name } });
        if(coins() >= c0 && cost > 0) return false;
      } else { G.equipCoins[side] = coins() - cost; h[slot] = it; }
      spent[h.id + slot] = 1;
      n++; return true;
    }
    function paySpell(sp){
      var cost = Number(sp.cost || 0);
      if(sp2.indexOf(sp.id) >= 0 || coins() < cost) return false;
      if(isClient()){
        var c0 = coins();
        sendIntent('buySpell', { id: sp.id });
        if(coins() >= c0 && cost > 0) return false;
      } else { G.equipCoins[side] = coins() - cost; G.spellbook[side].push(sp.id); }
      sp2.push(sp.id);
      n++; return true;
    }
    function payObj(o){
      var cost = Number(o.cost || 0);
      if(coins() < cost) return false;
      if(isClient()){
        var c0 = coins();
        sendIntent('buyObject', { id: o.id });
        if(coins() >= c0 && cost > 0) return false;
      } else { G.equipCoins[side] = coins() - cost; G.items[side].push(o); }
      it2.push(o);
      n++; return true;
    }
    plan.gear.forEach(function(p){ payGear(p.hero, p.slot, p.kind, p.it); });
    plan.spells.forEach(function(id){
      var sp = (typeof SPELLS !== 'undefined' ? SPELLS : []).filter(function(x){ return x.id === id; })[0];
      if(sp) paySpell(sp);
    });
    plan.items.forEach(payObj);
    // 4) Sobrante: se gasta en huecos libres, hechizos y objetos que aún no se tengan.
    function hasGear(h, slot, old){ return !!(old || spent[h.id + slot]); }
    for(var guard = 0; guard < 40 && coins() > 0; guard++){
      var did = false;
      before.gear.forEach(function(g){
        var h = g.h, list, slot, kind;
        if(!hasGear(h, 'armor', g.a)){ list = ARMORS; slot = 'armor'; kind = 'armor'; }
        else if(!hasGear(h, 'mwep', g.m) && !hasGear(h, 'rwep', g.r)){ if(h.type === 'AD'){ list = RANGED; slot = 'rwep'; kind = 'ranged'; } else { list = MELEE; slot = 'mwep'; kind = 'melee'; } }
        else return;
        var best = list.filter(function(x){ return Number(x.cost) > 0 && Number(x.cost) <= coins(); }).sort(function(a, b){ return b.cost - a.cost; })[0];
        if(best && payGear(h, slot, kind, clone(best))) did = true;
      });
      var spc = (typeof SPELLS !== 'undefined' ? SPELLS : []).filter(function(x){ return sp2.indexOf(x.id) < 0 && Number(x.cost) > 0 && Number(x.cost) <= coins(); }).sort(function(a, b){ return b.cost - a.cost; })[0];
      if(spc && team.some(function(h){ return h.type === 'HE'; }) && paySpell(spc)) did = true;
      var obc = (typeof OBJECTS !== 'undefined' ? OBJECTS : []).filter(function(x){
        return x && Number(x.cost) > 0 && Number(x.cost) <= coins() && it2.filter(function(y){ return y.id === x.id; }).length < (x.kind === 'bf_ring' ? 1 : 2);
      }).sort(function(a, b){ return b.cost - a.cost; })[0];
      if(obc && payObj(clone(obc))) did = true;
      if(!did) break;
    }
    return n;
  }

  function handle(e){
    var t = e.target && e.target.closest && e.target.closest('#bf-autoequip-btn');
    if(!t || typeof window.aiEquip !== 'function' || typeof G === 'undefined' || !G) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if(Date.now() - last < 700) return;
    last = Date.now();
    try{
      var side = mySide();
      var n = run(side);
      if(typeof window.renderEquip === 'function') try{ window.renderEquip(side); }catch(er){}
      if(window.notif) notif(n > 0 ? '\\u26a1 La IA equip\\u00f3 a tu equipo (' + n + ' adquisiciones).' : 'No quedan monedas o huecos para equipar autom\\u00e1ticamente.');
      if(typeof bfGuideReact === 'function') try{ bfGuideReact('cheer', '\\u00a1OPTIMIZADO!'); }catch(er){}
    }catch(err){ if(window.notif) notif('No se pudo auto-equipar: ' + (err && err.message || err)); }
  }
  document.addEventListener('click', handle, true);
  document.addEventListener('touchend', handle, true);
})();
</script>
`;