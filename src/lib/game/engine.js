// Bizarre Fantasies — motor de juego nativo (lógica pura, sin UI).
// Replica EXACTA de la subasta del juego original (v5).
import { HEROES, SPELLS, MELEE_WEAPONS, RANGED_WEAPONS, ARMORS, OBJECTS, BONUSES, CLAN_PROFILE, MANA_BASE, ELEM_COUNTER } from '@/lib/game/gameData';
import { HERO_ART, HERO_ELITE_ART } from '@/lib/artUrls';

// ----- Constantes idénticas al original -----
export const EQUIP_BASE = 45;
export const START_COINS = 100;
export const SELL_RATE = 0.6;
export { SPELLS, MELEE_WEAPONS, RANGED_WEAPONS, ARMORS, OBJECTS, ELEM_COUNTER };

export const prof = (h) => CLAN_PROFILE[h.clan] || { eliteHpPct: 0.3, mMelee: 0, mRanged: 0, mSpell: 0, mVel: 0, manaBonus: 0, regenBonus: 0, resPhys: 0, resMagic: 0 };

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rnd(arr.length)];
const other = (s) => (s === 'p' ? 'o' : 'p');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const byId = (list, id) => (list || []).find((x) => x && x.id === id);
const deep = (o) => JSON.parse(JSON.stringify(o));

export const heroArt = (hero, elite) => {
  const i = Number(hero.num || 0) - 1;
  if (elite) return HERO_ELITE_ART[i] || HERO_ART[i];
  return HERO_ART[i];
};

const AUCTION_TYPES = ['CC', 'AD', 'HE'];
export const currentAuctionType = (game) => AUCTION_TYPES[game.auction.aIndex];
export const auctionTypeLabel = (t) => (t === 'CC' ? 'Cuerpo a Cuerpo' : t === 'AD' ? 'Ataque a Distancia' : 'Magia');
export const typeIcon = (t) => (t === 'CC' ? '⚔️' : t === 'AD' ? '🏹' : '🔮');

const primKey = (t) => (t === 'CC' ? 'cc' : t === 'AD' ? 'ad' : 'he');
const heroScore = (h) => h[primKey(h.type)] * 2 + Math.round(h.hp / 4) + Math.round(h.cost / 2);

// ---------- CREACIÓN DE PARTIDA ----------
export function createGame() {
  const g = {
    phase: 'auction', // auction -> equip -> battle -> result
    names: { p: 'Tú', o: 'IA Némesis' },
    coins: { p: START_COINS, o: START_COINS },
    equipReserve: { p: 0, o: 0 },
    equipCoins: { p: 0, o: 0 },
    pendDebt: { p: 0, o: 0 },
    team: { p: [], o: [] },
    auction: {
      pools: {
        CC: shuffle(HEROES.filter((h) => h.type === 'CC')),
        AD: shuffle(HEROES.filter((h) => h.type === 'AD')),
        HE: shuffle(HEROES.filter((h) => h.type === 'HE')),
      },
      aIndex: 0,
      subRound: 0,
      curType: 'CC',
      cands: [],
      bonus: { p: null, o: null },
      bids: { p: null, o: null },
      bidsIn: { p: false, o: false },
      phaseNeeds: { p: true, o: true },
      phaseResult: null,
    },
    winner: null,
  };
  startAuctionPhase(g);
  return g;
}

// ---------- SUBASTA (réplica exacta) ----------
function startAuctionPhase(g) {
  const a = g.auction;
  a.phaseResult = null;
  a.curType = AUCTION_TYPES[a.aIndex];
  a.phaseNeeds = { p: true, o: true };
  a.subRound = 0;
  // Un bonificador por jugador, por fase
  a.bonus = { p: pick(BONUSES), o: pick(BONUSES) };
  applyBonus(g, 'p', a.bonus.p);
  applyBonus(g, 'o', a.bonus.o);
  beginBidRound(g);
}

function applyBonus(g, side, b) {
  if (!b) return;
  if (g.pendDebt[side]) { g.coins[side] = Math.max(0, g.coins[side] - g.pendDebt[side]); g.pendDebt[side] = 0; }
  if (b.type === 'BON') { g.coins[side] += b.effect; if (b.id === 'pre') g.pendDebt[side] = 8; }
  else if (b.type === 'EQP') { g.equipReserve[side] += b.effect; }
  else if (b.type === 'RES') { g.coins[other(side)] = Math.max(0, g.coins[other(side)] - b.effect); }
}

// Un héroe de cada raza disponible en el pool de la fase actual, barajado.
function drawRaceSlate(pool) {
  const by = {};
  for (const h of pool) { (by[h.clan] = by[h.clan] || []).push(h); }
  const out = [];
  for (const c of Object.keys(by)) out.push(pick(by[c]));
  return shuffle(out);
}

function beginBidRound(g) {
  const a = g.auction;
  a.cands = drawRaceSlate(a.pools[a.curType]);
  a.bids = { p: null, o: null };
  a.bidsIn = { p: false, o: false };
}

// El jugador puja (o pasa). Tras su decisión, la IA decide y se resuelve la ronda.
export function playerDecision(g, decision) {
  const a = g.auction;
  if (!a.phaseNeeds.p) {
    a.bids.p = { pass: true };
  } else if (decision && decision.heroId) {
    const amt = clamp(parseInt(decision.amount, 10) || 0, 0, g.coins.p);
    a.bids.p = { heroId: decision.heroId, amount: amt };
  } else {
    a.bids.p = { pass: true };
  }
  a.bidsIn.p = true;
  // IA decide
  aiDecision(g, 'o');
  resolveBidRound(g);
}

function aiDecision(g, side) {
  const a = g.auction;
  if (a.phaseNeeds[side]) aiBid(g, side);
  else { a.bids[side] = { pass: true }; a.bidsIn[side] = true; }
}

function aiBid(g, side) {
  const a = g.auction;
  const budget = g.coins[side];
  const opp = other(side);
  const ranked = a.cands.map((h) => ({ h, v: heroScore(h) })).sort((x, y) => y.v - x.v);
  let target = ranked.find((r) => Math.round(r.v * 0.35) <= budget) || ranked[ranked.length - 1];
  let bid = clamp(Math.round(target.v * 0.35) + rnd(8), 0, budget);
  if (a.bids[opp] && !a.bids[opp].pass && a.bids[opp].heroId === target.h.id) {
    const need = a.bids[opp].amount + 1;
    if (need <= budget && Math.random() < 0.7) bid = Math.min(budget, Math.max(bid, need + rnd(5)));
  }
  a.bids[side] = { heroId: target.h.id, amount: bid };
  a.bidsIn[side] = true;
}

function phaseHeroOf(g, side) {
  const t = g.team[side];
  return t && t.length ? t[t.length - 1] : null;
}
const nameOf = (h) => (h ? h.name : '—');

function makeInstance(t) {
  const h = deep(t);
  h.mwep = null; h.rwep = null; h.armor = null;
  return h;
}

function award(g, side, heroId, amount) {
  const a = g.auction;
  const tmpl = byId(a.cands, heroId) || byId(HEROES, heroId);
  g.coins[side] = Math.max(0, g.coins[side] - amount);
  const inst = makeInstance(tmpl);
  inst.boughtFor = amount;
  g.team[side].push(inst);
  for (const t of AUCTION_TYPES) a.pools[t] = a.pools[t].filter((x) => x.id !== heroId);
}

function resolveBidRound(g) {
  const a = g.auction;
  const bp = a.bids.p, bo = a.bids.o;
  const pBid = bp && !bp.pass, oBid = bo && !bo.pass;
  let contested = false, winner = null, contestId = null;

  if (pBid && oBid && bp.heroId === bo.heroId) {
    contested = true; contestId = bp.heroId;
    winner = bp.amount >= bo.amount ? 'p' : 'o';
    award(g, winner, contestId, winner === 'p' ? bp.amount : bo.amount);
    a.phaseNeeds[winner] = false; a.phaseNeeds[other(winner)] = true;
  } else {
    if (pBid) { award(g, 'p', bp.heroId, bp.amount); a.phaseNeeds.p = false; }
    if (oBid) { award(g, 'o', bo.heroId, bo.amount); a.phaseNeeds.o = false; }
  }

  a.phaseResult = {
    phase: a.aIndex, sub: a.subRound, contested, winner,
    contestName: contested ? (byId(a.cands, contestId) || {}).name || '—' : '',
    pPass: !pBid, oPass: !oBid,
    bpName: pBid ? (byId(a.cands, bp.heroId) || {}).name || '—' : '',
    boName: oBid ? (byId(a.cands, bo.heroId) || {}).name || '—' : '',
    bpAmt: pBid ? bp.amount : 0, boAmt: oBid ? bo.amount : 0,
    gotP: a.phaseNeeds.p ? null : nameOf(phaseHeroOf(g, 'p')),
    gotO: a.phaseNeeds.o ? null : nameOf(phaseHeroOf(g, 'o')),
    needMore: a.phaseNeeds.p || a.phaseNeeds.o,
  };
}

// Avanza tras ver el resultado: nueva terna/re-puja, siguiente fase, o fin de subasta.
// Devuelve true si la subasta terminó (pasa a equipamiento).
export function advancePhase(g) {
  const a = g.auction;
  const needMore = a.phaseNeeds.p || a.phaseNeeds.o;
  a.phaseResult = null;
  if (needMore) {
    a.subRound++;
    beginBidRound(g);
    return false;
  }
  a.aIndex++;
  if (a.aIndex < 3) {
    startAuctionPhase(g);
    return false;
  }
  finishAuction(g);
  return true;
}

function finishAuction(g) {
  const eqPool = BONUSES.filter((b) => b.type === 'EQP');
  for (const s of ['p', 'o']) {
    const eb = pick(eqPool);
    g.equipReserve[s] += eb.effect;
    g.equipBonus = g.equipBonus || {};
    g.equipBonus[s] = eb;
    g.equipCoins[s] = g.coins[s] + EQUIP_BASE + g.equipReserve[s];
  }
  g.spellbook = { p: [], o: [] };
  g.items = { p: [], o: [] };
  g.eqShop = 'spell';
  g.assign = null;
  g.phase = 'equip';
}

// ===================== EQUIPAMIENTO (réplica exacta) =====================
export const SHOP_TABS = [['spell', 'Hechizos'], ['melee', 'Armas C/C'], ['ranged', 'Armas Distancia'], ['armor', 'Armaduras'], ['object', 'Objetos']];

export function eqStat(h, k) {
  const pr = prof(h);
  let v = h[k] || 0;
  if (k === 'cc') { v += pr.mMelee || 0; if (h.mwep) v += h.mwep.cc; }
  if (k === 'ad') v += pr.mRanged || 0;
  if (k === 'he') v += pr.mSpell || 0;
  return Math.max(0, v);
}
export const eqHpVal = (h) => (h.hp || 0) + (h.armor ? h.armor.hp : 0);
export const eqManaVal = (h) => { const pr = prof(h); return Math.max(0, (MANA_BASE[h.type] || 0) + (pr.manaBonus || 0)); };
export function eqVelVal(h) {
  const pr = prof(h);
  let v = eqStat(h, primKey(h.type)) + (pr.mVel || 0);
  if (h.mwep && h.mwep.tag === '+veloc') v += 3;
  if (h.rwep && h.rwep.tag === 'lento') v -= 2;
  return Math.max(1, v);
}

const eqList = (kind) => (kind === 'melee' ? MELEE_WEAPONS : kind === 'ranged' ? RANGED_WEAPONS : ARMORS);
export const canAssign = (h, a) => { if (!a) return false; if (a.kind === 'armor') return !h.armor; return !h.mwep && !h.rwep; };

export function buySpell(g, side, id) {
  const s = byId(SPELLS, id);
  if (!s || g.equipCoins[side] < s.cost) return false;
  g.equipCoins[side] -= s.cost; g.spellbook[side].push(id);
  return true;
}
export function buyObject(g, side, id) {
  const o = byId(OBJECTS, id);
  if (!o || g.equipCoins[side] < o.cost) return false;
  g.equipCoins[side] -= o.cost; g.items[side].push(deep(o));
  return true;
}
export function removeSpell(g, side, i) {
  const id = g.spellbook[side][i]; if (id == null) return;
  const s = byId(SPELLS, id); g.equipCoins[side] += s.cost; g.spellbook[side].splice(i, 1);
}
export function removeItem(g, side, i) {
  const o = g.items[side][i]; if (!o) return;
  g.equipCoins[side] += o.cost; g.items[side].splice(i, 1);
}
// Asigna un arma/armadura a un héroe (compra + equipa).
export function assignEquip(g, side, heroId, kind, id) {
  const h = byId(g.team[side], heroId);
  const src = eqList(kind);
  const item = byId(src, id);
  if (!h || !item) return false;
  const a = { kind, id, cost: item.cost, name: item.name };
  if (!canAssign(h, a)) return false;
  if (g.equipCoins[side] < a.cost) return false;
  g.equipCoins[side] -= a.cost;
  if (kind === 'armor') h.armor = deep(item);
  else if (kind === 'melee') h.mwep = deep(item);
  else h.rwep = deep(item);
  return true;
}
export function unequip(g, side, heroId, slot) {
  const h = byId(g.team[side], heroId);
  if (!h || !h[slot]) return;
  g.equipCoins[side] += h[slot].cost; h[slot] = null;
}

export function aiEquip(g, side) {
  let budget = g.equipCoins[side];
  const buyW = (h, arr, kindKey) => {
    const aff = arr.filter((w) => w.cost <= budget).sort((a, b) => b.cost - a.cost);
    if (aff.length) { const w = aff[0]; budget -= w.cost; h[kindKey] = deep(w); }
  };
  for (const h of g.team[side]) {
    if (h.type === 'AD') buyW(h, RANGED_WEAPONS, 'rwep');
    else if (h.type === 'CC') buyW(h, MELEE_WEAPONS, 'mwep');
    else { const cheap = RANGED_WEAPONS.filter((w) => w.cost <= budget).sort((a, b) => a.cost - b.cost); if (cheap.length) { budget -= cheap[0].cost; h.rwep = deep(cheap[0]); } }
  }
  const tank = [...g.team[side]].sort((a, b) => b.hp - a.hp)[0];
  const arm = ARMORS.filter((a) => a.cost <= budget).sort((a, b) => (b.hp + b.redM + b.redH) - (a.hp + a.redM + a.redH))[0];
  if (tank && arm) { budget -= arm.cost; tank.armor = deep(arm); }
  const mage = g.team[side].find((h) => h.type === 'HE');
  if (mage) { for (const s of shuffle(SPELLS)) { if (s.cost <= budget) { budget -= s.cost; g.spellbook[side].push(s.id); } if (g.spellbook[side].length >= 4) break; } }
  const shop = mage ? ['ob_mana', 'ob_pot', 'ob_revive', 'ob_shield', 'ob_bomb'] : ['ob_pot', 'ob_revive', 'ob_shield', 'ob_bomb'];
  for (const oid of shop) { const o = byId(OBJECTS, oid); if (o && o.cost <= budget) { budget -= o.cost; g.items[side].push(deep(o)); } }
  g.equipCoins[side] = budget;
}

// El jugador confirma su equipo: la IA equipa al rival y se pasa a batalla.
export function finishEquip(g) {
  aiEquip(g, 'o');
  g.phase = 'battle';
}

export { heroScore, primKey, byId, deep, pick, other, clamp };