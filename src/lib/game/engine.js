// Bizarre Fantasies — motor de juego nativo (lógica pura, sin UI).
// Toda la lógica del juego vive aquí para que la UI solo dibuje estado.
import { HEROES, SPELLS, MELEE_WEAPONS, RANGED_WEAPONS, ARMORS, OBJECTS, BONUSES, RACES } from '@/lib/cardData';
import { HERO_ART, HERO_ELITE_ART } from '@/lib/artUrls';

const rng = (n) => Math.floor(Math.random() * n);
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Atajo: perfil de raza por nombre
const raceProfile = (clan) => RACES.find((r) => r.name === clan) || RACES[0];

// Modificadores numéricos por raza (parseados de la columna stats de cardData)
const RACE_MODS = {
  'Guerreros': { cc: 2, ad: 0, he: -4, vel: 0, mana: -2, resPhys: 2, resMag: 0, elite: 0.30 },
  'Druidas': { cc: 0, ad: 1, he: 1, vel: 0, mana: 12, resPhys: 1, resMag: 1, elite: 0.38 },
  'No-muertos': { cc: 1, ad: 0, he: 2, vel: -1, mana: 7, resPhys: 1, resMag: 1, elite: 0.60 },
  'Vaqueros': { cc: 0, ad: 2, he: -3, vel: 2, mana: -2, resPhys: 0, resMag: 0, elite: 0.30 },
  'Elfos': { cc: 0, ad: 2, he: 1, vel: 2, mana: 7, resPhys: 0, resMag: 1, elite: 0.32 },
  'Magos': { cc: -4, ad: 0, he: 3, vel: 0, mana: 16, resPhys: 0, resMag: 2, elite: 0.30 },
  'Épicas': { cc: 1, ad: 1, he: 1, vel: 1, mana: 9, resPhys: 1, resMag: 1, elite: 0.45 },
  'Cotidianos': { cc: 0, ad: 1, he: 0, vel: 1, mana: 7, resPhys: 1, resMag: 0, elite: 0.32 },
};

export const heroArt = (hero, elite) => {
  const i = Number(hero.num || 0) - 1;
  if (elite) return HERO_ELITE_ART[i] || HERO_ART[i];
  return HERO_ART[i];
};

// Crea una instancia de héroe lista para combate (copia con HP actual, maná, etc.)
export const makeBattleHero = (hero, side) => {
  const mods = RACE_MODS[hero.clan] || RACE_MODS['Cotidianos'];
  const baseMana = 30 + (mods.mana || 0);
  return {
    uid: side + '_' + hero.id,
    side,
    ref: hero,
    id: hero.id,
    name: hero.name,
    clan: hero.clan,
    type: hero.type,
    cc: hero.cc, ad: hero.ad, he: hero.he,
    maxHp: hero.hp, hp: hero.hp,
    eCc: hero.eCc, eAd: hero.eAd, eHe: hero.eHe, eHp: hero.eHp,
    mana: Math.max(20, baseMana), maxMana: Math.max(20, baseMana),
    mwep: null, rwep: null, armor: null,
    elite: false, dead: false, hasRevived: false,
    status: null, // 'sleeping' | 'paralyzed' | 'cursed' | null
    statusTurns: 0,
    shield: 0,
    eliteHpPct: mods.elite,
  };
};

// ---------- CREACIÓN DE PARTIDA ----------
export function createGame() {
  return {
    phase: 'auction', // auction -> equip -> battle -> result
    auction: createAuctionState(),
    coins: { p: 0, o: 0 },         // monedas ganadas (se llevan a equipamiento)
    team: { p: [], o: [] },        // héroes reclutados
    equip: null,
    battle: null,
    winner: null,
    log: [],
  };
}

// ---------- SUBASTA ----------
// 3 fases (CC, AD, HE). En cada fase se hacen rondas de puja sellada con 6 candidatos.
const AUCTION_TYPES = ['CC', 'AD', 'HE'];

function buildPools() {
  const pools = {};
  AUCTION_TYPES.forEach((t) => {
    pools[t] = shuffle(HEROES.filter((h) => h.type === t && h.clan !== 'Épicas'));
  });
  return pools;
}

function createAuctionState() {
  const pools = buildPools();
  const st = {
    pools,
    typeIndex: 0,        // qué fase (0..2)
    round: 0,            // ronda dentro de la fase
    cands: [],           // 6 candidatos actuales
    bonus: null,         // bonificador de la ronda
    playerCoinsBase: 60, // monedas base por fase
    bidsDone: false,
    lastResult: null,    // { winnerSide, hero, amount } | { passed:true }
  };
  startAuctionType(st, 0);
  return st;
}

function startAuctionType(st, typeIndex) {
  st.typeIndex = typeIndex;
  st.round = 0;
  st.pool = st.pools[AUCTION_TYPES[typeIndex]].slice();
}

// Saca 6 candidatos del pool de la fase actual y un bonificador
export function dealAuctionRound(game) {
  const st = game.auction;
  const cands = st.pool.splice(0, 6);
  st.cands = cands;
  st.bonus = BONUSES[rng(BONUSES.length)];
  st.bidsDone = false;
  st.lastResult = null;
  // Monedas disponibles esta ronda = base + bonificador
  applyBonusCoins(game);
  return st.cands;
}

function applyBonusCoins(game) {
  const st = game.auction;
  const b = st.bonus;
  let pCoins = st.playerCoinsBase;
  let oCoins = st.playerCoinsBase;
  if (b) {
    const m = (b.txt.match(/\+(\d+) monedas/) || [])[1];
    const minus = (b.txt.match(/-(\d+) monedas|pierde (\d+)/) || []);
    const plus = m ? Number(m) : 0;
    if (b.type === 'BON') { pCoins += plus; oCoins += plus; }
    if (b.type === 'RES') {
      const lose = Number(minus[1] || minus[2] || 0);
      oCoins = Math.max(0, oCoins - lose);
    }
  }
  st.roundCoins = { p: pCoins, o: oCoins };
}

export const currentAuctionType = (game) => AUCTION_TYPES[game.auction.typeIndex];
export const auctionTypeLabel = (t) => (t === 'CC' ? 'Cuerpo a cuerpo' : t === 'AD' ? 'A distancia' : 'Hechicería');

// El jugador puja por un héroe con cierta cantidad. La IA puja a ciegas.
export function resolveAuctionBids(game, playerBid) {
  const st = game.auction;
  const aiBid = computeAiBid(game);
  let result;

  const valid = playerBid && playerBid.heroId
    ? { side: 'p', heroId: playerBid.heroId, amount: clampBid(game, 'p', playerBid.heroId, playerBid.amount) }
    : null;

  if (valid && aiBid && valid.heroId === aiBid.heroId) {
    // Mismo héroe: gana la puja más alta (empate -> jugador)
    if (valid.amount >= aiBid.amount) result = award(game, 'p', valid);
    else result = award(game, 'o', aiBid);
  } else {
    if (valid) award(game, 'p', valid);
    if (aiBid) award(game, 'o', aiBid);
    result = { multi: true, player: valid, ai: aiBid };
  }

  st.lastResult = result;
  st.bidsDone = true;
  return result;
}

function clampBid(game, side, heroId, amount) {
  const st = game.auction;
  const coins = st.roundCoins[side];
  const hero = st.cands.find((h) => h.id === heroId);
  if (!hero) return 0;
  return Math.min(coins, Math.max(Number(amount || 0), hero.cost));
}

function award(game, side, bid) {
  const st = game.auction;
  const hero = st.cands.find((h) => h.id === bid.heroId);
  if (!hero) return { passed: true, side };
  if (game.team[side].length >= 3) return { full: true, side };
  if (game.team[side].some((h) => h.id === hero.id)) return { dup: true, side };
  game.team[side].push(hero);
  // Sobrante de monedas se acumula para equipamiento
  game.coins[side] += Math.max(0, st.roundCoins[side] - bid.amount);
  return { side, hero, amount: bid.amount };
}

function computeAiBid(game) {
  const st = game.auction;
  if (game.team.o.length >= 3) return null;
  const owned = new Set(game.team.o.map((h) => h.id));
  const options = st.cands.filter((h) => !owned.has(h.id) && h.cost <= st.roundCoins.o);
  if (!options.length) return null;
  // La IA elige el de mayor "valor" (suma de stats) que pueda permitirse
  const scored = options.map((h) => ({ h, v: h.cc + h.ad + h.he + h.hp / 2 }));
  scored.sort((a, b) => b.v - a.v);
  const pick = scored[0].h;
  const max = st.roundCoins.o;
  const amount = Math.min(max, pick.cost + rng(Math.max(1, Math.floor((max - pick.cost) * 0.5))));
  return { side: 'o', heroId: pick.id, amount };
}

// ¿Sigue habiendo subasta? Avanza fase/ronda. Devuelve true si la subasta terminó.
export function advanceAuction(game) {
  const st = game.auction;
  const playerFull = game.team.p.length >= 3;
  const aiFull = game.team.o.length >= 3;
  if (playerFull && aiFull) return true;

  // ¿Quedan candidatos en esta fase?
  if (st.pool.length < 1) {
    if (st.typeIndex >= AUCTION_TYPES.length - 1) {
      // Sin más fases: completa equipos con relleno si hace falta
      fillTeams(game);
      return true;
    }
    startAuctionType(st, st.typeIndex + 1);
  }
  st.round += 1;
  return false;
}

// Rellena cualquier equipo incompleto con héroes aleatorios disponibles
function fillTeams(game) {
  const used = new Set([...game.team.p, ...game.team.o].map((h) => h.id));
  const pool = shuffle(HEROES.filter((h) => !used.has(h.id) && h.clan !== 'Épicas'));
  ['p', 'o'].forEach((side) => {
    while (game.team[side].length < 3 && pool.length) {
      const h = pool.shift();
      used.add(h.id);
      game.team[side].push(h);
    }
  });
}

export { RACE_MODS, raceProfile, shuffle };