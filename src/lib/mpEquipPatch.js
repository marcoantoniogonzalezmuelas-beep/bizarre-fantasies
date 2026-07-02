// Parche inyectado en el iframe: equipamiento multijugador LOCAL-FIRST.
// Cada jugador se equipa en local (como si fuera single-player) y solo envía
// todo su estado al host al pulsar "batalla". Arregla:
//  - el cliente no podía equiparse (sus intents no llegaban a aplicarse y los
//    snapshots del host pisaban su estado local), y
//  - el aviso de "faltan armas" le llegaba al anfitrión en vez de al jugador.
// Modelo: el cliente aplica doAssign/buySpell/buyObject/unequip/removeSpell/
// removeItem directamente sobre su propio G (sin intents por acción); al pulsar
// "Listo" envía un único 'eqsync' con todo su lado; el host lo fusiona y arranca
// la batalla cuando los dos están listos.
export const MP_EQUIP_PATCH = `
<script>
(function(){
  if (window.__bfMpEquipPatch) return;
  window.__bfMpEquipPatch = true;

  function applyAssign(side, heroId, a) {
    var h = (typeof byId === 'function') ? byId(G.team[side], heroId) : null;
    if (!a || !h) return false;
    if (typeof canAssign === 'function' && !canAssign(h, a)) return false;
    if (!window.__bfAEAuto) {
      if ((G.equipCoins[side] || 0) < (a.cost || 0)) { if (typeof notif === 'function') notif('Sin monedas'); return false; }
      G.equipCoins[side] = (G.equipCoins[side] || 0) - (a.cost || 0);
    }
    if (a.kind === 'armor') h.armor = (typeof deep === 'function') ? deep(byId(ARMORS, a.id)) : byId(ARMORS, a.id);
    else if (a.kind === 'melee') h.mwep = (typeof deep === 'function') ? deep(byId(MELEE, a.id)) : byId(MELEE, a.id);
    else h.rwep = (typeof deep === 'function') ? deep(byId(RANGED, a.id)) : byId(RANGED, a.id);
    return true;
  }
  function applyBuySpell(side, id) {
    var s = (typeof byId === 'function') ? byId(SPELLS, id) : null; if (!s) return false;
    if (!window.__bfAEAuto) {
      if ((G.equipCoins[side] || 0) < (s.cost || 0)) return false;
      G.equipCoins[side] = (G.equipCoins[side] || 0) - (s.cost || 0);
    }
    if (!G.spellbook[side]) G.spellbook[side] = [];
    G.spellbook[side].push(id); return true;
  }
  function applyBuyObject(side, id) {
    var o = (typeof byId === 'function') ? byId(OBJECTS, id) : null; if (!o) return false;
    if (!window.__bfAEAuto) {
      if ((G.equipCoins[side] || 0) < (o.cost || 0)) return false;
      G.equipCoins[side] = (G.equipCoins[side] || 0) - (o.cost || 0);
    }
    if (!G.items[side]) G.items[side] = [];
    G.items[side].push((typeof deep === 'function') ? deep(o) : o); return true;
  }
  function applyUnequip(side, heroId, slot) {
    var h = (typeof byId === 'function') ? byId(G.team[side], heroId) : null;
    if (!h || !h[slot]) return false;
    G.equipCoins[side] = (G.equipCoins[side] || 0) + (h[slot].cost || 0); h[slot] = null; return true;
  }
  function applyRemoveSpell(side, i) {
    if (!G.spellbook[side]) return false;
    var id = G.spellbook[side][i]; if (id == null) return false;
    var s = (typeof byId === 'function') ? byId(SPELLS, id) : null;
    if (s) G.equipCoins[side] = (G.equipCoins[side] || 0) + (s.cost || 0);
    G.spellbook[side].splice(i, 1); return true;
  }
  function applyRemoveItem(side, i) {
    if (!G.items[side]) return false;
    var o = G.items[side][i]; if (!o) return false;
    G.equipCoins[side] = (G.equipCoins[side] || 0) + (o.cost || 0);
    G.items[side].splice(i, 1); return true;
  }

  function install() {
    if (window.__bfMpEquipPatched) return true;
    if (typeof NET === 'undefined' || !NET || !NET.role) return false;
    if (typeof window.sendIntent !== 'function') return false;
    window.__bfMpEquipPatched = true;

    var origSendIntent = window.sendIntent;
    window.sendIntent = function(op, args) {
      args = args || {};
      if (NET.role === 'client') {
        var me = NET.mySide;
        if (op === 'doAssign') { applyAssign(me, args.heroId, args.assign || G.assign); G.assign = null; window.__bfEquipDirty = true; if (typeof renderEquip === 'function') renderEquip(me); return; }
        if (op === 'buySpell') { applyBuySpell(me, args.id); window.__bfEquipDirty = true; if (typeof renderEquip === 'function') renderEquip(me); return; }
        if (op === 'buyObject') { applyBuyObject(me, args.id); window.__bfEquipDirty = true; if (typeof renderEquip === 'function') renderEquip(me); return; }
        if (op === 'unequip') { applyUnequip(me, args.heroId, args.slot); window.__bfEquipDirty = true; if (typeof renderEquip === 'function') renderEquip(me); return; }
        if (op === 'removeSpell') { applyRemoveSpell(me, args.i); window.__bfEquipDirty = true; if (typeof renderEquip === 'function') renderEquip(me); return; }
        if (op === 'removeItem') { applyRemoveItem(me, args.i); window.__bfEquipDirty = true; if (typeof renderEquip === 'function') renderEquip(me); return; }
        if (op === 'eqdone') {
          origSendIntent('eqsync', { team: G.team[me], spellbook: G.spellbook[me], items: G.items[me], equipCoins: G.equipCoins[me] });
          if (!G.eqReady) G.eqReady = { p: false, o: false };
          G.eqReady[me] = true;
          if (typeof renderEquip === 'function') renderEquip(me);
          return;
        }
      }
      return origSendIntent.apply(this, arguments);
    };

    if (NET.role === 'host' && typeof window.handleIntent === 'function' && !window.handleIntent.__bfEqSync) {
      var origHandle = window.handleIntent;
      window.handleIntent = function(msg) {
        if (msg && msg.t === 'intent' && msg.op === 'eqsync') {
          var me = 'o';
          if (msg.team && msg.team.length) G.team[me] = msg.team;
          if (msg.spellbook) G.spellbook[me] = msg.spellbook;
          if (msg.items) G.items[me] = msg.items;
          if (msg.equipCoins != null) G.equipCoins[me] = msg.equipCoins;
          if (!G.eqReady) G.eqReady = { p: false, o: false };
          G.eqReady[me] = true;
          if (G.eqReady.p && G.eqReady.o && typeof startBattle === 'function') { startBattle(); return; }
          if (typeof netSync === 'function') netSync('s-equip');
          return;
        }
        return origHandle.apply(this, arguments);
      };
      window.handleIntent.__bfEqSync = 1;
    }

    if (NET.role === 'client' && typeof window.applySnapshot === 'function' && !window.applySnapshot.__bfEqGuard) {
      var origApply = window.applySnapshot;
      window.applySnapshot = function(snap) {
        if (snap && snap.screen === 's-equip' && snap.G && window.__bfEquipDirty) {
          var me = NET.mySide;
          snap.G.team = snap.G.team || { p: [], o: [] };
          snap.G.spellbook = snap.G.spellbook || { p: [], o: [] };
          snap.G.items = snap.G.items || { p: [], o: [] };
          snap.G.equipCoins = snap.G.equipCoins || { p: 0, o: 0 };
          snap.G.eqReady = snap.G.eqReady || { p: false, o: false };
          snap.G.team[me] = G.team[me];
          snap.G.spellbook[me] = G.spellbook[me];
          snap.G.items[me] = G.items[me];
          snap.G.equipCoins[me] = G.equipCoins[me];
          snap.G.eqReady[me] = !!G.eqReady[me];
        }
        return origApply.apply(this, arguments);
      };
      window.applySnapshot.__bfEqGuard = 1;
    }
    return true;
  }

  // Wrap bfAutoEquip (definida más tarde por el parche de UI) para que la
  // pre-deducción local del planner (bfAEspend) no se duplique con applyAssign.
  function wrapAutoEquip() {
    if (window.__bfAEWrapDone) return true;
    if (typeof window.bfAutoEquip !== 'function') return false;
    if (window.bfAutoEquip.__bfAEWrap) { window.__bfAEWrapDone = true; return true; }
    var origAE = window.bfAutoEquip;
    var wrappedAE = function(side) { window.__bfAEAuto = true; try { return origAE.apply(this, arguments); } finally { window.__bfAEAuto = false; } };
    wrappedAE.__bfAEWrap = 1;
    window.bfAutoEquip = wrappedAE;
    window.__bfAEWrapDone = true;
    return true;
  }

  var tries = 0;
  var iv = setInterval(function(){ tries++; var a = install(); var b = wrapAutoEquip(); if ((a && b) || tries > 200) clearInterval(iv); }, 300);
  install(); wrapAutoEquip();
})();
</script>
`;