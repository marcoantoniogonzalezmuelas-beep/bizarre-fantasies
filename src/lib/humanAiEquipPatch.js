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
    var n = 0;
    plan.gear.forEach(function(p){
      var cost = Number(p.it.cost || 0);
      if(G.equipCoins[side] < cost) return;
      G.equipCoins[side] -= cost;
      if(isClient()){
        if(typeof sendIntent === 'function') sendIntent('doAssign', { heroId: p.hero.id, assign: { kind: p.kind, id: p.it.id, cost: p.it.cost, name: p.it.name } });
      } else p.hero[p.slot] = p.it;
      n++;
    });
    plan.spells.forEach(function(id){
      var sp = (typeof SPELLS !== 'undefined' ? SPELLS : []).filter(function(x){ return x.id === id; })[0];
      var cost = Number(sp && sp.cost || 0);
      if(!sp || G.equipCoins[side] < cost) return;
      G.equipCoins[side] -= cost;
      if(isClient()){ if(typeof sendIntent === 'function') sendIntent('buySpell', { id: id }); }
      else G.spellbook[side].push(id);
      n++;
    });
    plan.items.forEach(function(o){
      var cost = Number(o.cost || 0);
      if(G.equipCoins[side] < cost) return;
      G.equipCoins[side] -= cost;
      if(isClient()){ if(typeof sendIntent === 'function') sendIntent('buyObject', { id: o.id }); }
      else G.items[side].push(o);
      n++;
    });
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