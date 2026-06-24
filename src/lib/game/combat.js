// Bizarre Fantasies — motor de COMBATE nativo, portado 1:1 del original (v5-4).
// Lógica pura: opera sobre el objeto de juego `g` y emite log/fx por callbacks.
import { HEROES, SPELLS, ELEM_COUNTER, MANA_BASE } from '@/lib/game/gameData';
import { prof, primKey, byId, other, clamp, pick } from '@/lib/game/engine';

const AD_REF = 18, HE_REF = 18;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// kind/base/val que el original lleva embebidos en SPELLS/OBJECTS de batalla.
const SPELL_META = {
  sp_fire1: { kind: 'dmg1', base: 13 }, sp_fire2: { kind: 'dmgAll', base: 8 },
  sp_ice1: { kind: 'dmg1slow', base: 11 }, sp_ray1: { kind: 'dmg2', base: 9 },
  sp_agua1: { kind: 'dmgAll', base: 7 }, sp_heal1: { kind: 'heal1', base: 14 },
  sp_heal2: { kind: 'healAll', base: 9 }, sp_prot1: { kind: 'shield', base: 12 },
  sp_ward: { kind: 'ward', base: 8 }, sp_sleep: { kind: 'sleep', base: 1 },
  sp_para: { kind: 'para', base: 1 }, sp_curse: { kind: 'debuff', base: 4 },
  sp_bless: { kind: 'buff', base: 4 },
};
const OBJ_META = {
  ob_pot: { kind: 'heal', val: 18 }, ob_potbig: { kind: 'healBig', val: 30 },
  ob_mana: { kind: 'mana', val: 20 }, ob_manabig: { kind: 'manaBig', val: 40 },
  ob_shield: { kind: 'shield', val: 12 }, ob_cleanse: { kind: 'cleanse', val: 0 },
  ob_bomb: { kind: 'bomb', val: 14 }, ob_revive: { kind: 'revive', val: 50 },
  ob_phoenix: { kind: 'reviveAll', val: 50 },
};
export const spellMeta = (id) => { const s = byId(SPELLS, id); return { ...s, ...SPELL_META[id] }; };
export const objMeta = (o) => ({ ...o, ...OBJ_META[o.id] });

// ====================== ESTADO DE BATALLA ======================
// Se construye un objeto B mutable. La UI lo lee y dispara acciones.
export function createBattle(g, hooks) {
  const B = {
    g, round: 0, queue: [], qi: 0, over: false, current: null,
    log: [], seq: 0, pending: null, fx: [], winner: null,
    busy: false, // bloquea input mientras corre una animación/turno IA
    hooks: hooks || {},
  };
  for (const side of ['p', 'o']) for (const h of g.team[side]) battlePrep(h);
  pushLog(B, 'lx', '¡Comienza la batalla!');
  return B;
}

function battlePrep(h) {
  const pr = prof(h);
  h.maxHp = h.hp + (h.armor ? h.armor.hp : 0); h.hp = h.maxHp;
  h.alive = true; h.eliteMode = false; h.eliteUsed = false; h.abilityUsed = false;
  h._mods = []; h.shield = 0; h.defending = false;
  h.sleep = 0; h.para = 0; h.skip = 0; h.silence = 0; h.evade = 0; h.mark = null; h.wardVal = 0; h.wardTurns = 0;
  h.maxMana = Math.max(0, (MANA_BASE[h.type] || 0) + (pr.manaBonus || 0)); h.mana = h.maxMana;
  h.velMod = (pr.mVel || 0);
  if (h.mwep && h.mwep.tag === '+veloc') h.velMod += 3;
  if (h.rwep && h.rwep.tag === 'lento') h.velMod -= 2;
}

// ====================== HELPERS ======================
const getHero = (B, side, id) => byId(B.g.team[side], id);
const living = (B, side) => (B.g.team[side] || []).filter((h) => h.alive);
const baseStat = (h, k) => (h.eliteMode ? h['e' + cap(k)] : h[k]);
function stat(h, k) {
  const pr = prof(h); let v = baseStat(h, k);
  for (const m of h._mods) v += (m[k] || 0);
  if (k === 'cc') { v += (pr.mMelee || 0); if (h.mwep) v += h.mwep.cc; }
  if (k === 'ad') v += (pr.mRanged || 0);
  if (k === 'he') v += (pr.mSpell || 0);
  return Math.max(0, v);
}
function velocity(h) { let v = stat(h, primKey(h.type)) + (h.velMod || 0); for (const m of h._mods) v += (m.vel || 0); return Math.max(1, v); }
const typePrio = (t) => (t === 'AD' ? 0 : t === 'HE' ? 1 : 2);
const tSide = (B, h) => ((B.g.team.p || []).indexOf(h) >= 0 ? 'p' : 'o');
const enemySide = (side) => other(side);
export { stat as battleStat, velocity as battleVelocity };

function pushLog(B, cls, txt) { B.log.unshift({ cls, txt }); if (B.log.length > 40) B.log.pop(); if (B.hooks.onLog) B.hooks.onLog(); }
function pushFx(B, fx) { B.fx.push(fx); if (B.hooks.onFx) B.hooks.onFx(fx); }
const render = (B) => { if (B.hooks.onRender) B.hooks.onRender(); };

// ====================== BUCLE DE TURNOS ======================
export function startRounds(B) { setTimeout(() => nextRound(B), 500); }

function nextRound(B) {
  if (B.over) return;
  B.round++;
  const all = [];
  for (const side of ['p', 'o']) for (const h of living(B, side)) all.push({ side, id: h.id });
  all.sort((a, b) => {
    const ha = getHero(B, a.side, a.id), hb = getHero(B, b.side, b.id);
    const pa = typePrio(ha.type), pb = typePrio(hb.type);
    if (pa !== pb) return pa - pb;
    return velocity(hb) - velocity(ha);
  });
  B.queue = all; B.qi = 0; pushLog(B, 'lg', '— Ronda ' + B.round + ' —');
  render(B); setTimeout(() => stepTurn(B), 500);
}

function stepTurn(B) {
  if (B.over) return;
  if (B.qi >= B.queue.length) { setTimeout(() => nextRound(B), 400); return; }
  const slot = B.queue[B.qi], h = getHero(B, slot.side, slot.id);
  if (!h || !h.alive) { B.qi++; return stepTurn(B); }
  B.current = slot;
  if (h.armor && h.armor.regen && h.hp < h.maxHp) h.hp = Math.min(h.maxHp, h.hp + h.armor.regen);
  if (h.sleep > 0) { pushLog(B, 'li', `${h.name} duerme y pierde el turno.`); pushFx(B, { k: 'status', side: slot.side, id: h.id, txt: '😴' }); h.sleep--; render(B); return setTimeout(() => endTurn(B), 900); }
  if (h.para > 0) { pushLog(B, 'li', `${h.name} está paralizado.`); pushFx(B, { k: 'status', side: slot.side, id: h.id, txt: '⚡' }); h.para--; render(B); return setTimeout(() => endTurn(B), 900); }
  if (h.skip > 0) { pushLog(B, 'li', `${h.name} pierde el turno.`); pushFx(B, { k: 'status', side: slot.side, id: h.id, txt: '🚫' }); h.skip--; render(B); return setTimeout(() => endTurn(B), 900); }
  h.defending = false;
  B.busy = !isHuman(slot.side);
  render(B);
  if (isHuman(slot.side)) { /* la UI muestra el menú de acción */ }
  else { setTimeout(() => { try { aiTurn(B, h, slot.side); } catch (e) { pushLog(B, 'ld', '(IA pasa turno)'); endTurn(B); } }, 750); }
}

const isHuman = (side) => side === 'p';

function tickAfter(h) {
  h._mods = h._mods.map((m) => ({ ...m, turns: m.turns - 1 })).filter((m) => m.turns > 0);
  if (h.silence > 0) h.silence--;
  if (h.wardTurns > 0) { h.wardTurns--; if (h.wardTurns <= 0) h.wardVal = 0; }
  if (h.mark) { h.mark.turns--; if (h.mark.turns <= 0) h.mark = null; }
}
function endTurn(B) {
  if (B.over) return;
  const slot = B.current; if (slot) { const h = getHero(B, slot.side, slot.id); if (h) tickAfter(h); }
  B.current = null; B.qi++;
  if (checkWin(B)) return;
  render(B); setTimeout(() => stepTurn(B), 400);
}
function checkWin(B) {
  const pA = living(B, 'p').length, oA = living(B, 'o').length;
  if (pA === 0 || oA === 0) {
    B.over = true; B.busy = false;
    const pWin = oA === 0; B.winner = pWin ? 'p' : 'o';
    B.g.winner = B.winner; B.g.phase = 'result';
    render(B);
    setTimeout(() => { if (B.hooks.onEnd) B.hooks.onEnd(pWin); }, 800);
    return true;
  }
  return false;
}

// ====================== DAÑO / CURA / MUERTE ======================
function dealDamage(B, target, amount, opts) {
  opts = opts || {}; const pr = prof(target);
  if (target.evade > 0 && opts.type !== 'true' && !opts.noEvade) { target.evade--; pushLog(B, 'li', `${target.name} esquiva.`); pushFx(B, { k: 'miss', side: tSide(B, target), id: target.id }); return 0; }
  if (opts.type === 'spell' && opts.element && target.armor && target.armor.element && ELEM_COUNTER[target.armor.element] === opts.element) {
    pushLog(B, 'lg', `La ${target.armor.name} de ${target.name} NIEGA el hechizo de ${opts.element}.`); pushFx(B, { k: 'negate', side: tSide(B, target), id: target.id }); return 0;
  }
  if (target.mark) amount += target.mark.dmg;
  if (opts.type === 'melee') { if (!opts.ignoreArmor) amount -= (target.armor ? target.armor.redM : 0); amount -= (pr.resPhys || 0); }
  else if (opts.type === 'ranged') { let r = target.armor ? target.armor.redA : 0; r = Math.round(r * (1 - (opts.pierce || 0))); amount -= r; amount -= (pr.resPhys || 0); }
  else if (opts.type === 'spell') { amount -= (target.armor ? target.armor.redH : 0); amount -= (pr.resMagic || 0); if (target.wardTurns > 0) amount -= target.wardVal; }
  if (target.defending) amount = Math.round(amount * 0.5);
  amount = Math.max(1, Math.round(amount));
  if (target.shield > 0 && !opts.ignoreShield) { const ab = Math.min(target.shield, amount); target.shield -= ab; amount -= ab; if (target.shield < 0) target.shield = 0; }
  if (amount <= 0) { pushFx(B, { k: 'block', side: tSide(B, target), id: target.id }); return 0; }
  target.hp -= amount; pushFx(B, { k: 'hit', side: tSide(B, target), id: target.id, dmg: amount, dtype: opts.type || 'melee' });
  if (target.hp <= 0) handleDeath(B, target);
  return amount;
}
function heal(B, target, amount) { if (!target.alive) return 0; amount = Math.max(0, Math.round(amount)); const b = target.hp; target.hp = Math.min(target.maxHp, target.hp + amount); const g = target.hp - b; if (g > 0) pushFx(B, { k: 'heal', side: tSide(B, target), id: target.id, amt: g }); return g; }
function handleDeath(B, target) {
  if (!target.eliteUsed) {
    const pr = prof(target);
    target.eliteUsed = true; target.eliteMode = true; target.abilityUsed = false;
    target.maxHp = target.eHp + (target.armor ? target.armor.hp : 0);
    target.hp = Math.max(1, Math.round(target.maxHp * (pr.eliteHpPct || 0.3)));
    target.shield = 0; target.sleep = 0; target.para = 0; target.mana = target.maxMana;
    pushLog(B, 'lx', `¡${target.name} renace ÉLITE (${Math.round((pr.eliteHpPct || 0.3) * 100)}% vida)! → ${target.eAbility}`);
    pushFx(B, { k: 'elite', side: tSide(B, target), id: target.id });
  } else { target.alive = false; target.hp = 0; pushLog(B, 'ld', `${target.name} ha caído.`); pushFx(B, { k: 'death', side: tSide(B, target), id: target.id }); }
}
function reviveHero(B, t, frac) {
  const tmpl = byId(HEROES, t.id); const baseHp = tmpl ? tmpl.hp : t.maxHp;
  t.alive = true; t.eliteMode = false; t.maxHp = baseHp + (t.armor ? t.armor.hp : 0);
  t.hp = Math.max(1, Math.round(t.maxHp * frac)); t.mana = t.maxMana || 0;
  t.shield = 0; t.sleep = 0; t.para = 0; t.skip = 0; t.silence = 0; t.evade = 0; t.mark = null; t._mods = []; t.wardVal = 0; t.wardTurns = 0;
}

// ====================== OBJETIVO PENDIENTE ======================
function pendTarget(B, prompt, validSide, cb, opts) { opts = opts || {}; B.pending = { prompt, validSide, cb, allowDead: !!opts.allowDead }; render(B); }
export function pickTarget(B, side, id) {
  if (!B.pending || B.pending.validSide !== side) return;
  const h = getHero(B, side, id); if (!h) return;
  if (!B.pending.allowDead && !h.alive) return;
  if (B.pending.allowDead && h.alive) return;
  const cb = B.pending.cb; B.pending = null; cb(h);
}
export function cancelPending(B) { B.pending = null; render(B); }

// ====================== ACCIONES DEL JUGADOR ======================
function finishAct(B) { render(B); endTurn(B); }
export function getCurrent(B) { return B.current ? getHero(B, B.current.side, B.current.id) : null; }

export function actMelee(B) {
  const side = B.current.side, h = getHero(B, side, B.current.id);
  pendTarget(B, 'Elige objetivo del golpe cuerpo a cuerpo', enemySide(side), (t) => {
    pushFx(B, { k: 'slash', toSide: tSide(B, t), toId: t.id });
    const d = dealDamage(B, t, stat(h, 'cc'), { type: 'melee' });
    pushLog(B, 'ld', `${h.name} golpea a ${t.name} (-${d}) cuerpo a cuerpo.`); finishAct(B);
  });
}
export function actRanged(B) {
  const side = B.current.side, h = getHero(B, side, B.current.id); if (!h.rwep) return;
  pendTarget(B, 'Elige objetivo del disparo', enemySide(side), (t) => { rangedAttack(B, h, t, side); finishAct(B); });
}
function rangedAttack(B, h, t, side) {
  const w = h.rwep; let pierce = 0; if (w.tag === 'perfora') pierce = 0.5; if (w.tag === 'mágico') pierce = 1;
  const per = Math.round(w.power * stat(h, 'ad') / AD_REF);
  pushFx(B, { k: 'arrow', fromSide: side || tSide(B, h), fromId: h.id, toSide: tSide(B, t), toId: t.id, hits: (w.hits || 1) });
  let total = 0; for (let i = 0; i < (w.hits || 1); i++) { total += dealDamage(B, t, per, { type: 'ranged', pierce }); if (!t.alive) break; }
  pushLog(B, 'ld', `${h.name} dispara (${w.name}) a ${t.name} (-${total}).`);
}
export function actDefend(B) { const h = getHero(B, B.current.side, B.current.id); h.defending = true; pushLog(B, 'li', `${h.name} se defiende.`); finishAct(B); }

export const spellbookOf = (B, side) => (B.g.spellbook[side] || []).map((id) => spellMeta(id));
export const itemsOf = (B, side) => (B.g.items[side] || []).map((o) => objMeta(o));

export function castSpell(B, id) {
  const side = B.current.side, h = getHero(B, side, B.current.id), s = spellMeta(id);
  if (h.mana < s.mana) return false;
  h.mana -= s.mana;
  const mag = stat(h, 'he') / HE_REF, val = Math.max(1, Math.round(s.base * mag)), el = s.element;
  const foes = enemySide(side), allies = side;
  const sh = (t) => pushFx(B, { k: 'spell', toSide: tSide(B, t), toId: t.id, el });
  switch (s.kind) {
    case 'dmg1': pendTarget(B, 'Objetivo del hechizo', foes, (t) => { sh(t); const d = dealDamage(B, t, val, { type: 'spell', element: el }); pushLog(B, 'ld', `${h.name} lanza ${s.name} sobre ${t.name} (-${d}).`); finishAct(B); }); return true;
    case 'dmg1slow': pendTarget(B, 'Objetivo a congelar', foes, (t) => { sh(t); const d = dealDamage(B, t, val, { type: 'spell', element: el }); t._mods.push({ vel: -4, turns: 2 }); pushLog(B, 'ld', `${h.name} congela a ${t.name} (-${d}).`); finishAct(B); }); return true;
    case 'dmg2': { living(B, foes).slice(0, 2).forEach((t) => { sh(t); const d = dealDamage(B, t, val, { type: 'spell', element: el }); pushLog(B, 'ld', `${s.name} → ${t.name} (-${d}).`); }); pushLog(B, 'li', `${h.name} lanza ${s.name}.`); finishAct(B); return true; }
    case 'dmgAll': { living(B, foes).forEach((t) => { sh(t); const d = dealDamage(B, t, val, { type: 'spell', element: el }); pushLog(B, 'ld', `${s.name} → ${t.name} (-${d}).`); }); pushLog(B, 'li', `${h.name} desata ${s.name}.`); finishAct(B); return true; }
    case 'heal1': pendTarget(B, 'Aliado a curar', allies, (t) => { const g = heal(B, t, val); pushLog(B, 'lh', `${h.name} cura a ${t.name} (+${g}).`); finishAct(B); }); return true;
    case 'healAll': { living(B, allies).forEach((t) => { const g = heal(B, t, val); if (g) pushLog(B, 'lh', `${t.name} +${g}.`); }); pushLog(B, 'lh', `${h.name} lanza ${s.name}.`); finishAct(B); return true; }
    case 'shield': pendTarget(B, 'Aliado a proteger', allies, (t) => { t.shield += val; pushFx(B, { k: 'shieldup', toSide: tSide(B, t), toId: t.id }); pushLog(B, 'lg', `${h.name} da escudo de ${val} a ${t.name}.`); finishAct(B); }); return true;
    case 'ward': pendTarget(B, 'Aliado a proteger de hechizos', allies, (t) => { t.wardVal = val; t.wardTurns = 2; pushFx(B, { k: 'wardup', toSide: tSide(B, t), toId: t.id }); pushLog(B, 'lg', `${h.name} protege a ${t.name} del daño mágico (-${val}, 2 turnos).`); finishAct(B); }); return true;
    case 'sleep': pendTarget(B, 'Objetivo a dormir', foes, (t) => { const p = clamp(0.35 + stat(h, 'he') / 40, 0.1, 0.95); if (Math.random() < p) { t.sleep = h.eliteMode ? 2 : 1; pushFx(B, { k: 'status', side: tSide(B, t), id: t.id, txt: '😴' }); pushLog(B, 'li', `${h.name} duerme a ${t.name}.`); } else pushLog(B, 'li', `${h.name} falla el sueño.`); finishAct(B); }); return true;
    case 'para': pendTarget(B, 'Objetivo a paralizar', foes, (t) => { const p = clamp(0.3 + stat(h, 'he') / 40, 0.1, 0.9); if (Math.random() < p) { t.para = 1; pushFx(B, { k: 'status', side: tSide(B, t), id: t.id, txt: '⚡' }); pushLog(B, 'li', `${h.name} paraliza a ${t.name}.`); } else pushLog(B, 'li', `${h.name} falla la parálisis.`); finishAct(B); }); return true;
    case 'debuff': pendTarget(B, 'Objetivo a maldecir', foes, (t) => { const a = Math.max(2, Math.round(val)); t._mods.push({ cc: -a, ad: -a, he: -a, turns: 2 }); pushFx(B, { k: 'status', side: tSide(B, t), id: t.id, txt: '▼' }); pushLog(B, 'li', `${h.name} maldice a ${t.name} (-${a}).`); finishAct(B); }); return true;
    case 'buff': pendTarget(B, 'Aliado a bendecir', allies, (t) => { const a = Math.max(2, Math.round(val)); t._mods.push({ cc: a, ad: a, he: a, turns: 3 }); pushFx(B, { k: 'status', side: tSide(B, t), id: t.id, txt: '▲' }); pushLog(B, 'lg', `${h.name} bendice a ${t.name} (+${a}).`); finishAct(B); }); return true;
  }
  finishAct(B); return true;
}

export function applyItem(B, idx) {
  const side = B.current.side, h = getHero(B, side, B.current.id), raw = B.g.items[side][idx]; if (!raw) return;
  const o = objMeta(raw);
  const allies = side, foes = enemySide(side); const consume = () => { B.g.items[side].splice(idx, 1); };
  switch (o.kind) {
    case 'heal': case 'healBig': pendTarget(B, 'Aliado a curar', allies, (t) => { const g = heal(B, t, o.val); pushLog(B, 'lh', `${o.name}: ${t.name} +${g}.`); consume(); finishAct(B); }); return;
    case 'shield': pendTarget(B, 'Aliado a proteger', allies, (t) => { t.shield += o.val; pushFx(B, { k: 'shieldup', toSide: tSide(B, t), toId: t.id }); pushLog(B, 'lg', `${o.name}: escudo de ${o.val} a ${t.name}.`); consume(); finishAct(B); }); return;
    case 'cleanse': pendTarget(B, 'Aliado a liberar', allies, (t) => { t.sleep = 0; t.para = 0; t.skip = 0; t._mods = t._mods.filter((m) => !(m.cc < 0 || m.ad < 0 || m.he < 0)); pushLog(B, 'lh', `${o.name}: ${t.name} liberado.`); consume(); finishAct(B); }); return;
    case 'bomb': pendTarget(B, 'Objetivo de la bomba', foes, (t) => { pushFx(B, { k: 'spell', toSide: tSide(B, t), toId: t.id, el: 'fuego' }); const d = dealDamage(B, t, o.val, { type: 'true' }); pushLog(B, 'ld', `${o.name}: ${t.name} -${d}.`); consume(); finishAct(B); }); return;
    case 'mana': case 'manaBig': pendTarget(B, 'Aliado para restaurar maná', allies, (t) => { const b = t.mana || 0; t.mana = Math.min(t.maxMana || 0, (t.mana || 0) + o.val); const g = t.mana - b; pushFx(B, { k: 'manaup', side: tSide(B, t), id: t.id, amt: g }); pushLog(B, 'lg', `${o.name}: ${t.name} +${g} maná.`); consume(); finishAct(B); }); return;
    case 'revive': { const dead = B.g.team[allies].filter((x) => !x.alive); if (!dead.length) { pushLog(B, 'li', 'No hay héroes caídos.'); return; } pendTarget(B, 'Aliado CAÍDO a revivir', allies, (t) => { reviveHero(B, t, 0.5); pushFx(B, { k: 'elite', side: tSide(B, t), id: t.id }); pushLog(B, 'lx', `${o.name}: ${t.name} revive.`); consume(); finishAct(B); }, { allowDead: true }); return; }
    case 'reviveAll': { B.g.team[allies].filter((x) => !x.alive).forEach((t) => { reviveHero(B, t, 0.5); pushFx(B, { k: 'elite', side: tSide(B, t), id: t.id }); }); pushLog(B, 'lx', `${o.name}: ¡todos los caídos vuelven!`); consume(); finishAct(B); return; }
  }
  finishAct(B);
}

// ====================== HABILIDADES ======================
const abilityNeedsEnemy = (k) => ['smash-equip', 'execute', 'pierce-cc', 'lifesteal-cc', 'crush-cc', 'unblock-cc', 'pierce-ad', 'big-ad', 'double-ad', 'big-he', 'mark', 'skip-turn', 'silence', 'debuff'].includes(k);
const abilityNeedsAlly = (k) => ['shield-ally', 'heal-ally', 'revive'].includes(k);

export function actAbility(B) { const side = B.current.side, h = getHero(B, side, B.current.id); if (h.abilityUsed) return; runAbility(B, side, h, () => finishAct(B)); }

function runAbility(B, side, h, done) {
  const k = h.akind, el = h.eliteMode; const foes = enemySide(side), allies = side;
  const finish = () => { h.abilityUsed = true; done(); };
  const need = abilityNeedsEnemy(k) ? foes : abilityNeedsAlly(k) ? allies : null;
  const dmg = (t, a, opts) => dealDamage(B, t, a, opts);
  const run = (t) => {
    switch (k) {
      case 'aoe-cc': { const v = Math.round(stat(h, 'cc') * 0.8) + (el ? 5 : 0); living(B, foes).forEach((x) => { pushFx(B, { k: 'slash', toSide: tSide(B, x), toId: x.id }); const d = dmg(x, v, { type: 'melee' }); pushLog(B, 'ld', `${h.name} (Torbellino) → ${x.name} (-${d}).`); }); if (el) living(B, foes).forEach((x) => x.para = Math.max(x.para, 1)); break; }
      case 'aoe-ad': { const v = Math.round(stat(h, 'ad') * 0.8) + (el ? 4 : 0); living(B, foes).forEach((x) => { pushFx(B, { k: 'arrow', fromSide: side, fromId: h.id, toSide: tSide(B, x), toId: x.id, hits: 1 }); const d = dmg(x, v, { type: 'ranged', pierce: el ? 0.5 : 0 }); pushLog(B, 'ld', `${h.name} dispara en área → ${x.name} (-${d}).`); if (el) x._mods.push({ ad: -2, turns: 2 }); }); break; }
      case 'aoe-he': { const v = Math.round(stat(h, 'he') * 0.9) + (el ? 5 : 0); living(B, foes).forEach((x) => { pushFx(B, { k: 'spell', toSide: tSide(B, x), toId: x.id, el: 'rayo' }); const d = dmg(x, v, { type: 'spell', element: 'rayo' }); pushLog(B, 'ld', `${h.name} (magia en área) → ${x.name} (-${d}).`); }); if (el) living(B, foes).forEach((x) => x.silence = Math.max(x.silence, 1)); break; }
      case 'debuff-all': { const a = el ? 6 : 4; living(B, foes).forEach((x) => { x._mods.push({ cc: -a, ad: -a, he: -a, turns: el ? 2 : 1 }); pushFx(B, { k: 'status', side: tSide(B, x), id: x.id, txt: '▼' }); }); pushLog(B, 'li', `${h.name} -${a} a todos los rivales.`); if (el) heal(B, h, 10); break; }
      case 'debuff': { const a = el ? 8 : 6; t._mods.push({ cc: -a, ad: -a, he: -a, turns: el ? 99 : 2 }); const d = dmg(t, Math.round(stat(h, primKey(h.type)) * 0.6), { type: h.type === 'HE' ? 'spell' : h.type === 'AD' ? 'ranged' : 'melee', element: 'agua' }); pushLog(B, 'li', `${h.name} debilita a ${t.name} (-${a}, -${d}).`); break; }
      case 'self-buff': { const a = el ? 9 : 6; h._mods.push({ cc: a, ad: a, he: a, vel: el ? 6 : 4, turns: 99 }); pushFx(B, { k: 'status', side: side, id: h.id, txt: '▲' }); pushLog(B, 'lg', `${h.name} entra en furia (+${a}).`); break; }
      case 'self-heal': { const g = el ? heal(B, h, h.maxHp) : heal(B, h, 12); pushLog(B, 'lh', `${h.name} se cura (+${g})${el ? ' ¡al máximo!' : ''}.`); if (el) living(B, allies).forEach((x) => { if (x !== h) heal(B, x, 4); }); break; }
      case 'shield-ally': { const v = el ? 22 : 14; t.shield += v; pushFx(B, { k: 'shieldup', toSide: tSide(B, t), toId: t.id }); pushLog(B, 'lg', `${h.name} escuda ${v} a ${t.name}.`); if (el) h._mods.push({ cc: 3, turns: 99 }); break; }
      case 'heal-ally': { const g = heal(B, t, el ? 28 : 18); pushLog(B, 'lh', `${h.name} cura a ${t.name} (+${g}).`); if (el) t._mods.push({ cc: 3, turns: 99 }); break; }
      case 'heal-all': { const v = el ? 12 : 9; living(B, allies).forEach((x) => { const g = heal(B, x, v); if (g) pushLog(B, 'lh', `${x.name} +${g}.`); }); if (el) living(B, allies).forEach((x) => x._mods.push({ cc: 2, ad: 2, he: 2, turns: 2 })); pushLog(B, 'lh', `${h.name} cura al grupo.`); break; }
      case 'execute': { const thr = el ? 14 : 8; if (t.hp <= thr) { pushFx(B, { k: 'slash', toSide: tSide(B, t), toId: t.id }); t.hp = 1; dmg(t, 9999, { type: 'true' }); pushLog(B, 'lx', `${h.name} EJECUTA a ${t.name}.`); } else { const d = dmg(t, Math.round(stat(h, 'cc') * 0.6), { type: 'melee' }); pushLog(B, 'ld', `${h.name} no ejecuta (-${d}).`); } break; }
      case 'pierce-cc': { pushFx(B, { k: 'slash', toSide: tSide(B, t), toId: t.id }); const d = dmg(t, stat(h, 'cc') + (el ? 5 : 0), { type: 'melee', ignoreShield: true, ignoreArmor: true }); if (el) t.maxHp = Math.max(1, t.maxHp - 5); pushLog(B, 'ld', `${h.name} atraviesa a ${t.name} (-${d}).`); break; }
      case 'lifesteal-cc': { pushFx(B, { k: 'slash', toSide: tSide(B, t), toId: t.id }); const d = dmg(t, stat(h, 'cc') + (el ? 3 : 0), { type: 'melee' }); const g = heal(B, h, Math.round(d * (el ? 1 : 0.5))); pushLog(B, 'ld', `${h.name} drena a ${t.name} (-${d}, +${g}).`); break; }
      case 'crush-cc': { const thr = el ? 0.6 : 0.4; let d0 = stat(h, 'cc'); if (t.hp / t.maxHp <= thr) d0 *= 2; pushFx(B, { k: 'slash', toSide: tSide(B, t), toId: t.id }); const d = dmg(t, d0, { type: 'melee' }); pushLog(B, 'ld', `${h.name} aplasta a ${t.name} (-${d}).`); break; }
      case 'unblock-cc': { pushFx(B, { k: 'slash', toSide: tSide(B, t), toId: t.id }); const d = dmg(t, stat(h, 'cc'), { type: 'melee', ignoreShield: true }); pushLog(B, 'ld', `${h.name} golpe imbloqueable a ${t.name} (-${d}).`); if (el) { const o2 = living(B, foes).find((x) => x !== t); if (o2) { const d2 = dmg(o2, Math.round(stat(h, 'cc') * 0.7), { type: 'melee', ignoreShield: true }); pushLog(B, 'ld', `…y a ${o2.name} (-${d2}).`); } } break; }
      case 'smash-equip': { t.mwep = null; t.rwep = null; const had = !!t.armor; if (t.armor) { t.maxHp = Math.max(1, t.maxHp - t.armor.hp); t.hp = Math.min(t.hp, t.maxHp); t.armor = null; } t.shield = 0; pushFx(B, { k: 'slash', toSide: tSide(B, t), toId: t.id }); const d = dmg(t, stat(h, 'cc'), { type: 'melee' }); pushLog(B, 'lx', `${h.name} DESTRUYE el equipo de ${t.name}${had ? ' (armadura rota)' : ''} (-${d}).`); break; }
      case 'pierce-ad': { pushFx(B, { k: 'arrow', fromSide: side, fromId: h.id, toSide: tSide(B, t), toId: t.id, hits: 1 }); const d = dmg(t, Math.round(stat(h, 'ad') * 1.2) + (el ? 5 : 0), { type: 'ranged', pierce: 1 }); pushLog(B, 'ld', `${h.name} dispara ignorando armadura (-${d}).`); break; }
      case 'big-ad': { pushFx(B, { k: 'arrow', fromSide: side, fromId: h.id, toSide: tSide(B, t), toId: t.id, hits: 1 }); const d = dmg(t, Math.round(stat(h, 'ad') * 1.4) + (el ? 6 : 0), { type: 'ranged', pierce: el ? 1 : 0.4 }); pushLog(B, 'ld', `${h.name} disparo demoledor a ${t.name} (-${d}).`); break; }
      case 'double-ad': { for (let i = 0; i < 2; i++) { if (!t.alive) break; pushFx(B, { k: 'arrow', fromSide: side, fromId: h.id, toSide: tSide(B, t), toId: t.id, hits: 1 }); const d = dmg(t, Math.round(stat(h, 'ad') * 0.9) + (el ? 3 : 0), { type: 'ranged', pierce: el ? 0.5 : 0 }); pushLog(B, 'ld', `${h.name} dispara a ${t.name} (-${d}).`); } break; }
      case 'big-he': { pushFx(B, { k: 'spell', toSide: tSide(B, t), toId: t.id, el: 'fuego' }); const d = dmg(t, Math.round(stat(h, 'he') * 1.5) + (el ? 6 : 0), { type: 'spell', element: 'fuego', pierce: el ? 1 : 0 }); pushLog(B, 'ld', `${h.name} conjuro brutal a ${t.name} (-${d}).`); if (el) { const o2 = living(B, foes).find((x) => x !== t); if (o2) { const d2 = dmg(o2, Math.round(stat(h, 'he') * 0.9), { type: 'spell', element: 'fuego' }); pushLog(B, 'ld', `…rebota en ${o2.name} (-${d2}).`); } } break; }
      case 'mark': { t.mark = { dmg: el ? 9 : 6, turns: el ? 99 : 3 }; pushFx(B, { k: 'status', side: tSide(B, t), id: t.id, txt: '🎯' }); const d = dmg(t, Math.round(stat(h, 'ad') * 0.6), { type: 'ranged' }); pushLog(B, 'li', `${h.name} marca a ${t.name} (+${el ? 9 : 6} daño).`); break; }
      case 'skip-turn': { t.skip = Math.max(t.skip, el ? 2 : 1); pushFx(B, { k: 'status', side: tSide(B, t), id: t.id, txt: '🚫' }); pushLog(B, 'li', `${h.name} hace perder ${el ? 2 : 1} turno(s) a ${t.name}.`); break; }
      case 'silence': { t.silence = Math.max(t.silence, el ? 2 : 1); pushFx(B, { k: 'status', side: tSide(B, t), id: t.id, txt: '🔇' }); const d = dmg(t, Math.round(stat(h, 'he')), { type: 'spell', element: 'rayo' }); pushLog(B, 'li', `${h.name} silencia a ${t.name} (-${d}).`); break; }
      case 'drain': { pushFx(B, { k: 'spell', toSide: tSide(B, t), toId: t.id, el: 'agua' }); const d = dmg(t, Math.round(stat(h, 'he') * 1.1) + (el ? 4 : 0), { type: 'spell', element: 'agua' }); const ally = living(B, allies).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]; const g = heal(B, ally, d); pushLog(B, 'ld', `${h.name} drena a ${t.name} (-${d}) y cura a ${ally.name} (+${g}).`); break; }
      case 'revive': { reviveHero(B, t, el ? 1 : 0.5); pushFx(B, { k: 'elite', side: tSide(B, t), id: t.id }); pushLog(B, 'lx', `${h.name} revive a ${t.name}.`); break; }
      case 'evade': { h.evade = el ? 2 : 1; if (el) h._mods.push({ cc: 5, ad: 5, turns: 99 }); pushFx(B, { k: 'status', side: side, id: h.id, txt: '💨' }); pushLog(B, 'li', `${h.name} se vuelve evasivo.`); break; }
      default: { const key = primKey(h.type); const ty = h.type === 'HE' ? 'spell' : h.type === 'AD' ? 'ranged' : 'melee'; const d = dmg(t, Math.round(stat(h, key) * 1.3), { type: ty, element: 'fuego' }); pushLog(B, 'ld', `${h.name} usa ${h.ability} (-${d}).`); }
    }
    finish();
  };
  if (need) {
    if (k === 'revive') { const dead = B.g.team[allies].filter((x) => !x.alive); if (dead.length === 0) { const t2 = living(B, allies).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]; const g = heal(B, t2, 15); pushLog(B, 'lh', `${h.name} no halla caídos; cura a ${t2.name} (+${g}).`); finish(); return; } }
    if (isHuman(side)) { if (k === 'revive') pendTarget(B, 'Aliado CAÍDO a revivir', allies, run, { allowDead: true }); else pendTarget(B, 'Objetivo de ' + (el ? h.eAbility : h.ability), need, run); }
    else { let t; if (need === foes) t = living(B, foes).sort((a, b) => a.hp - b.hp)[0]; else if (k === 'revive') t = B.g.team[allies].find((x) => !x.alive); else t = living(B, allies).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]; run(t); }
  } else run(null);
}

// ====================== IA ======================
const canCast = (B, side, h) => (B.g.spellbook[side] || []).length > 0 && h.silence <= 0 && affSpells(B, side, h).length > 0;
const affSpells = (B, side, h) => (B.g.spellbook[side] || []).map((id) => spellMeta(id)).filter((s) => h.mana >= s.mana);

function aiTurn(B, h, side) {
  if (B.over) return;
  const foes = living(B, enemySide(side)), allies = living(B, side);
  if (foes.length === 0) { endTurn(B); return; }
  const hurt = allies.filter((a) => a.hp / a.maxHp < 0.4); const dead = B.g.team[side].filter((a) => !a.alive);
  if (dead.length) { const rIdx = (B.g.items[side] || []).findIndex((o) => { const m = objMeta(o); return m.kind === 'revive' || m.kind === 'reviveAll'; }); if (rIdx >= 0 && Math.random() < 0.8) { applyItemAI(B, side, rIdx); return; } }
  if (hurt.length) {
    const hIdx = (B.g.items[side] || []).findIndex((o) => { const m = objMeta(o); return m.kind === 'heal' || m.kind === 'healBig'; }); if (hIdx >= 0 && Math.random() < 0.7) { applyItemAI(B, side, hIdx, hurt.sort((a, b) => a.hp - b.hp)[0]); return; }
    if (canCast(B, side, h)) { const hs = affSpells(B, side, h).find((s) => s.kind === 'heal1' || s.kind === 'healAll'); if (hs && Math.random() < 0.7) { castSpellAI(B, side, h, hs, hurt.sort((a, b) => a.hp - b.hp)[0]); return; } }
  }
  if (h.type === 'HE' && h.maxMana > 0 && (B.g.spellbook[side] || []).length > 0 && affSpells(B, side, h).length === 0) {
    const mIdx = (B.g.items[side] || []).findIndex((o) => { const m = objMeta(o); return m.kind === 'mana' || m.kind === 'manaBig'; });
    if (mIdx >= 0) { applyItemAI(B, side, mIdx); return; }
  }
  if (!h.abilityUsed && h.silence <= 0 && Math.random() < 0.6) { runAbility(B, side, h, () => endTurn(B)); return; }
  if (h.type === 'HE' && canCast(B, side, h)) { const ds = affSpells(B, side, h).filter((s) => ['dmg1', 'dmg2', 'dmgAll', 'dmg1slow'].includes(s.kind)); if (ds.length) { castSpellAI(B, side, h, pick(ds), foes.sort((a, b) => a.hp - b.hp)[0]); return; } }
  if (h.type === 'AD' && h.rwep) { rangedAttack(B, h, foes.sort((a, b) => a.hp - b.hp)[0], side); endTurn(B); return; }
  if (canCast(B, side, h)) { const any = affSpells(B, side, h).filter((s) => ['dmg1', 'dmg2', 'dmgAll', 'dmg1slow'].includes(s.kind)); if (any.length) { castSpellAI(B, side, h, pick(any), foes.sort((a, b) => a.hp - b.hp)[0]); return; } }
  if (h.rwep) { rangedAttack(B, h, foes.sort((a, b) => a.hp - b.hp)[0], side); endTurn(B); return; }
  const t = foes.sort((a, b) => a.hp - b.hp)[0]; pushFx(B, { k: 'slash', toSide: tSide(B, t), toId: t.id });
  const d = dealDamage(B, t, stat(h, 'cc'), { type: 'melee' }); pushLog(B, 'ld', `${h.name} golpea a ${t.name} (-${d}) cuerpo a cuerpo.`); endTurn(B);
}

function castSpellAI(B, side, h, s, target) {
  if (h.mana < s.mana) { const foes = living(B, enemySide(side)); const t = foes.sort((a, b) => a.hp - b.hp)[0] || target; if (h.rwep) rangedAttack(B, h, t, side); else { pushFx(B, { k: 'slash', toSide: tSide(B, t), toId: t.id }); const d = dealDamage(B, t, stat(h, 'cc'), { type: 'melee' }); pushLog(B, 'ld', `${h.name} golpea (sin maná) a ${t.name} (-${d}).`); } endTurn(B); return; }
  h.mana -= s.mana;
  const mag = stat(h, 'he') / HE_REF, val = Math.max(1, Math.round(s.base * mag)), el = s.element;
  const foes = enemySide(side), allies = side; const sh = (t) => pushFx(B, { k: 'spell', toSide: tSide(B, t), toId: t.id, el });
  switch (s.kind) {
    case 'dmg1': { sh(target); const d = dealDamage(B, target, val, { type: 'spell', element: el }); pushLog(B, 'ld', `${h.name} lanza ${s.name} sobre ${target.name} (-${d}).`); break; }
    case 'dmg1slow': { sh(target); const d = dealDamage(B, target, val, { type: 'spell', element: el }); target._mods.push({ vel: -4, turns: 2 }); pushLog(B, 'ld', `${h.name} congela a ${target.name} (-${d}).`); break; }
    case 'dmg2': { living(B, foes).slice(0, 2).forEach((t) => { sh(t); const d = dealDamage(B, t, val, { type: 'spell', element: el }); pushLog(B, 'ld', `${s.name} → ${t.name} (-${d}).`); }); break; }
    case 'dmgAll': { living(B, foes).forEach((t) => { sh(t); const d = dealDamage(B, t, val, { type: 'spell', element: el }); pushLog(B, 'ld', `${s.name} → ${t.name} (-${d}).`); }); break; }
    case 'heal1': { const g = heal(B, target, val); pushLog(B, 'lh', `${h.name} cura a ${target.name} (+${g}).`); break; }
    case 'healAll': { living(B, allies).forEach((t) => { const g = heal(B, t, val); if (g) pushLog(B, 'lh', `${t.name} +${g}.`); }); break; }
    case 'shield': { target.shield += val; pushFx(B, { k: 'shieldup', toSide: tSide(B, target), toId: target.id }); pushLog(B, 'lg', `${h.name} escuda a ${target.name} (${val}).`); break; }
    default: { const t = living(B, foes).sort((a, b) => a.hp - b.hp)[0]; if (t) { sh(t); const d = dealDamage(B, t, val, { type: 'spell', element: el }); pushLog(B, 'ld', `${s.name} → ${t.name} (-${d}).`); } }
  }
  endTurn(B);
}

function applyItemAI(B, side, idx, target) {
  const raw = B.g.items[side][idx]; if (!raw) { endTurn(B); return; }
  const o = objMeta(raw); const allies = side, foes = enemySide(side); const consume = () => B.g.items[side].splice(idx, 1);
  const pickAlly = () => target || living(B, allies).sort((a, b) => a.hp - b.hp)[0];
  switch (o.kind) {
    case 'heal': case 'healBig': { const t = pickAlly(); const g = heal(B, t, o.val); pushLog(B, 'lh', `${o.name}: ${t.name} +${g}.`); break; }
    case 'shield': { const t = pickAlly(); t.shield += o.val; pushFx(B, { k: 'shieldup', toSide: tSide(B, t), toId: t.id }); pushLog(B, 'lg', `${o.name}: escudo a ${t.name}.`); break; }
    case 'mana': case 'manaBig': { const t = living(B, allies).filter((x) => x.maxMana > 0).sort((a, b) => a.mana - b.mana)[0] || pickAlly(); t.mana = Math.min(t.maxMana, t.mana + o.val); pushFx(B, { k: 'manaup', side: tSide(B, t), id: t.id }); pushLog(B, 'lg', `${o.name}: ${t.name} +maná.`); break; }
    case 'cleanse': { const t = pickAlly(); t.sleep = 0; t.para = 0; t.skip = 0; pushLog(B, 'lh', `${o.name}: ${t.name} liberado.`); break; }
    case 'bomb': { const t = living(B, foes).sort((a, b) => a.hp - b.hp)[0]; if (t) { pushFx(B, { k: 'spell', toSide: tSide(B, t), toId: t.id, el: 'fuego' }); const d = dealDamage(B, t, o.val, { type: 'true' }); pushLog(B, 'ld', `${o.name}: ${t.name} -${d}.`); } break; }
    case 'revive': { const t = B.g.team[allies].find((x) => !x.alive); if (t) { reviveHero(B, t, 0.5); pushFx(B, { k: 'elite', side: tSide(B, t), id: t.id }); pushLog(B, 'lx', `${o.name}: ${t.name} revive.`); } break; }
    case 'reviveAll': { B.g.team[allies].filter((x) => !x.alive).forEach((t) => { reviveHero(B, t, 0.5); pushFx(B, { k: 'elite', side: tSide(B, t), id: t.id }); }); pushLog(B, 'lx', `${o.name}: ¡todos vuelven!`); break; }
  }
  consume(); endTurn(B);
}

// Lecturas para la UI
export const battleLiving = living;
export const battleHero = getHero;
export const battleStatusBadges = (h) => {
  const out = [];
  if (h.shield > 0) out.push({ t: 'shield', v: h.shield });
  if (h.wardTurns > 0) out.push({ t: 'ward', v: h.wardTurns });
  if (h.sleep > 0) out.push({ t: 'sleep', v: h.sleep });
  if (h.para > 0) out.push({ t: 'para', v: h.para });
  if (h.skip > 0) out.push({ t: 'skip', v: h.skip });
  if (h.mark) out.push({ t: 'mark', v: '+' + h.mark.dmg });
  if (h.evade > 0) out.push({ t: 'evade', v: h.evade });
  if (h.silence > 0) out.push({ t: 'silence', v: '' });
  if (h._mods.some((m) => (m.cc > 0 || m.ad > 0 || m.he > 0 || m.vel > 0))) out.push({ t: 'buff', v: '▲' });
  if (h._mods.some((m) => (m.cc < 0 || m.ad < 0 || m.he < 0))) out.push({ t: 'debuff', v: '▼' });
  if (h.defending) out.push({ t: 'def', v: 'DEF' });
  return out;
};