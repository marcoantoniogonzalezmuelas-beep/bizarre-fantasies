// Authoritative game data for Bizarre Fantasies — ported 1:1 from the original
// game so the native engine uses identical numbers (stats, abilities, equipment).
// Battle-specific fields (akind, weapon, armor reductions, ranged hits, CLAN_PROFILE)
// are included here so combat behaves exactly like the original.

export const MANA_BASE = { HE: 28, AD: 12, CC: 6 };
export const ELEM_COUNTER = { agua: 'fuego', rayo: 'agua', hielo: 'rayo', fuego: 'hielo' };

export const CLAN_PROFILE = {
  "Guerreros": { eliteHpPct: 0.30, mMelee: 2, mRanged: 0, mSpell: -4, mVel: 0, manaBonus: -2, regenBonus: 0, resPhys: 2, resMagic: 0 },
  "Druidas": { eliteHpPct: 0.38, mMelee: 0, mRanged: 1, mSpell: 1, mVel: 0, manaBonus: 12, regenBonus: 0, resPhys: 1, resMagic: 1 },
  "No-muertos": { eliteHpPct: 0.60, mMelee: 1, mRanged: 0, mSpell: 2, mVel: -1, manaBonus: 7, regenBonus: 0, resPhys: 1, resMagic: 1 },
  "Vaqueros": { eliteHpPct: 0.30, mMelee: 0, mRanged: 2, mSpell: -3, mVel: 2, manaBonus: -2, regenBonus: 0, resPhys: 0, resMagic: 0 },
  "Elfos": { eliteHpPct: 0.32, mMelee: 0, mRanged: 2, mSpell: 1, mVel: 2, manaBonus: 7, regenBonus: 0, resPhys: 0, resMagic: 1 },
  "Magos": { eliteHpPct: 0.30, mMelee: -4, mRanged: 0, mSpell: 3, mVel: 0, manaBonus: 16, regenBonus: 0, resPhys: 0, resMagic: 2 },
  "Épicas": { eliteHpPct: 0.45, mMelee: 1, mRanged: 1, mSpell: 1, mVel: 1, manaBonus: 9, regenBonus: 0, resPhys: 1, resMagic: 1 },
  "Cotidianos": { eliteHpPct: 0.32, mMelee: 0, mRanged: 1, mSpell: 0, mVel: 1, manaBonus: 7, regenBonus: 0, resPhys: 1, resMagic: 0 },
};

// Per-hero battle extras: ability kind + base (unarmed) weapon name.
const HERO_BATTLE = {
  kru: ['aoe-cc', 'Mandoble Bárbaro'], bos: ['debuff-all', 'Mandoble Bárbaro'], nar: ['smash-equip', 'Mandoble Bárbaro'],
  hil: ['self-buff', 'Mandoble Bárbaro'], tor: ['shield-ally', 'Mandoble Bárbaro'], vor: ['execute', 'Mandoble Bárbaro'],
  bra: ['debuff', 'Garrote de Roble'], gna: ['self-heal', 'Garrote de Roble'], vra: ['pierce-cc', 'Guadaña Ósea'],
  mor: ['lifesteal-cc', 'Guadaña Ósea'], buc: ['crush-cc', 'Cuchillo de Caza'], com: ['evade', 'Cuchillo de Caza'],
  kre: ['unblock-cc', 'Filo Mítico'], hev: ['aoe-cc', 'Guitarra Flying-V'], pij: ['debuff', 'Palo de Golf de Oro'],
  pat: ['pierce-ad', 'Daga Élfica'], syl: ['aoe-ad', 'Daga Élfica'], ael: ['mark', 'Daga Élfica'],
  zar: ['double-ad', 'Daga Élfica'], ere: ['self-buff', 'Daga Élfica'], alf: ['double-ad', 'Cuchillo de Caza'],
  dix: ['pierce-ad', 'Cuchillo de Caza'], ska: ['debuff-all', 'Guadaña Ósea'], syx: ['self-buff', 'Filo Mítico'],
  gor: ['aoe-ad', 'Filo Mítico'], fut: ['big-ad', 'Balón Cañón'], gam: ['big-ad', 'Mando de Combate'],
  ret: ['big-he', 'Daga Ritual'], mal: ['aoe-he', 'Daga Ritual'], ser: ['big-he', 'Daga Ritual'],
  bat: ['shield-ally', 'Daga Ritual'], nix: ['drain', 'Daga Ritual'], vex: ['silence', 'Daga Ritual'],
  chi: ['heal-all', 'Garrote de Roble'], sol: ['revive', 'Garrote de Roble'], man: ['heal-all', 'Garrote de Roble'],
  pac: ['big-he', 'Guadaña Ósea'], hex: ['skip-turn', 'Guadaña Ósea'], rev: ['debuff', 'Cuchillo de Caza'],
  doc: ['heal-ally', 'Cuchillo de Caza'], zer: ['aoe-he', 'Filo Mítico'], xer: ['big-he', 'Filo Mítico'],
  aje: ['skip-turn', 'Torre de Mármol'], rol: ['big-he', 'Dado de 20 Caras'], pol: ['debuff-all', 'Maletín de Sobornos'],
};

// Base hero stats (display fields live in cardData.js HEROES; we re-export merged here).
import { HEROES as BASE_HEROES, SPELLS as BASE_SPELLS, CLAN_COLORS } from '@/lib/cardData';

export const HEROES = BASE_HEROES.map((h) => {
  const [akind, weapon] = HERO_BATTLE[h.id] || ['big-he', 'Puños'];
  return { ...h, clanColor: CLAN_COLORS[h.clan], akind, weapon };
});

export const SPELLS = BASE_SPELLS;

export const MELEE_WEAPONS = [
  { id: 'mw_sword', num: 59, name: 'Espada de Acero', cc: 6, cost: 7, tag: '', txt: '+6 al daño cuerpo a cuerpo. +6 CC.' },
  { id: 'mw_mace', num: 60, name: 'Maza Pesada', cc: 7, cost: 8, tag: '', txt: '+7 al daño cuerpo a cuerpo. +7 CC.' },
  { id: 'mw_axe', num: 61, name: 'Hacha de Guerra', cc: 8, cost: 9, tag: '', txt: '+8 al daño cuerpo a cuerpo. +8 CC.' },
  { id: 'mw_dagger', num: 62, name: 'Daga Veloz', cc: 5, cost: 7, tag: '+veloc', txt: '+5 al daño cuerpo a cuerpo. +5 CC y +3 velocidad.' },
  { id: 'mw_plasma', num: 63, name: 'Espada Plasmática', cc: 10, cost: 12, tag: 'mágico', txt: '+10 al daño cuerpo a cuerpo. +10 CC. Mágica.' },
  { id: 'mw_thunder', num: 64, name: 'Martillo del Trueno', cc: 9, cost: 12, tag: 'mágico', txt: '+9 al daño cuerpo a cuerpo. +9 CC. Golpes mágicos imparables.' },
];

export const RANGED_WEAPONS = [
  { id: 'rw_sling', num: 65, name: 'Tirachinas', power: 6, hits: 1, cost: 4, tag: '', txt: 'Arma a distancia básica. Daño = 6 × (AD/18).' },
  { id: 'rw_cross', num: 66, name: 'Ballesta', power: 10, hits: 1, cost: 7, tag: '', txt: 'Potencia 10. Daño = 10 × (AD/18).' },
  { id: 'rw_pistol', num: 67, name: 'Pistola', power: 12, hits: 1, cost: 8, tag: '', txt: 'Potencia 12. Daño = 12 × (AD/18).' },
  { id: 'rw_smg', num: 68, name: 'Metralleta', power: 7, hits: 2, cost: 9, tag: '2disparos', txt: 'Potencia 7 · 2 disparos. Dispara 2 veces.' },
  { id: 'rw_cannon', num: 69, name: 'Cañón Medieval', power: 16, hits: 1, cost: 11, tag: 'lento', txt: 'Potencia 16. Daño = 16 × (AD/18). Pesado (-2 velocidad).' },
  { id: 'rw_plasma', num: 70, name: 'Cañón de Plasma', power: 20, hits: 1, cost: 14, tag: 'top', txt: 'Potencia 20. Daño = 20 × (AD/18). La cima del arsenal a distancia.' },
  { id: 'rw_elfbow', num: 71, name: 'Arco Élfico', power: 11, hits: 1, cost: 9, tag: 'perfora', txt: 'Mágico: ignora media armadura. Daño = 11 × (AD/18).' },
  { id: 'rw_photon', num: 72, name: 'Rifle de Fotones', power: 15, hits: 1, cost: 12, tag: 'mágico', txt: 'Mágico: ignora toda la armadura. Daño = 15 × (AD/18).' },
];

export const ARMORS = [
  { id: 'ar_leather', num: 73, name: 'Armadura de Cuero', hp: 8, redM: 2, redA: 2, redH: 0, regen: 0, element: null, cost: 7, tag: '', txt: '+8 HP. -2 al daño cuerpo a cuerpo y a distancia.' },
  { id: 'ar_mail', num: 74, name: 'Cota de Malla', hp: 12, redM: 4, redA: 4, redH: 1, regen: 0, element: null, cost: 9, tag: '', txt: '+12 HP. -4 c/c y a distancia, -1 hechizos.' },
  { id: 'ar_plate', num: 75, name: 'Armadura de Placas', hp: 16, redM: 6, redA: 5, redH: 2, regen: 0, element: null, cost: 12, tag: '', txt: '+16 HP. -6 c/c, -5 a distancia, -2 hechizos.' },
  { id: 'ar_arcane', num: 76, name: 'Manto Arcano', hp: 10, redM: 1, redA: 1, redH: 6, regen: 0, element: null, cost: 10, tag: 'mágico', txt: '+10 HP. -6 al daño de hechizos. Mágico.' },
  { id: 'ar_aegis', num: 77, name: 'Égida de Cristal', hp: 12, redM: 3, redA: 4, redH: 4, regen: 0, element: null, cost: 12, tag: 'mágico', txt: '+12 HP. -3 c/c, -4 a distancia y -4 hechizos. Mágica.' },
  { id: 'ar_exo', num: 78, name: 'Exoarmadura', hp: 14, redM: 3, redA: 3, redH: 3, regen: 2, element: null, cost: 13, tag: 'mágico', txt: '+14 HP. -3 a todo y +2 HP por turno. Mágica.' },
  { id: 'ar_water', num: 79, name: 'Armadura de Agua', hp: 12, redM: 3, redA: 3, redH: 1, regen: 0, element: 'agua', cost: 12, tag: 'elemental', txt: '+12 HP. NIEGA el daño de hechizos de FUEGO. -3 al daño físico.' },
  { id: 'ar_thunder', num: 80, name: 'Armadura de Rayo', hp: 12, redM: 3, redA: 3, redH: 1, regen: 0, element: 'rayo', cost: 12, tag: 'elemental', txt: '+12 HP. NIEGA el daño de hechizos de AGUA. -3 al daño físico.' },
  { id: 'ar_ice', num: 81, name: 'Armadura de Hielo', hp: 12, redM: 3, redA: 3, redH: 1, regen: 0, element: 'hielo', cost: 12, tag: 'elemental', txt: '+12 HP. NIEGA el daño de hechizos de RAYO. -3 al daño físico.' },
  { id: 'ar_fire', num: 82, name: 'Armadura de Fuego', hp: 12, redM: 3, redA: 3, redH: 1, regen: 0, element: 'fuego', cost: 12, tag: 'elemental', txt: '+12 HP. NIEGA el daño de hechizos de HIELO. -3 al daño físico.' },
];

export const OBJECTS = [
  { id: 'ob_pot', num: 83, name: 'Poción de Vida', tag: 'curación', cost: 6, txt: 'Cura 18 HP a un aliado.' },
  { id: 'ob_potbig', num: 84, name: 'Poción Mayor', tag: 'curación', cost: 10, txt: 'Cura 30 HP a un aliado.' },
  { id: 'ob_mana', num: 85, name: 'Cristal de Maná', tag: 'maná', cost: 8, txt: 'Restaura 20 de maná a un aliado.' },
  { id: 'ob_manabig', num: 86, name: 'Orbe de Maná', tag: 'maná', cost: 13, txt: 'Restaura 40 de maná a un aliado.' },
  { id: 'ob_shield', num: 87, name: 'Escudo de Energía', tag: 'protección', cost: 7, txt: 'Escudo de 12 que absorbe daño en un aliado.' },
  { id: 'ob_cleanse', num: 88, name: 'Despertar', tag: 'protección', cost: 5, txt: 'Quita sueño/parálisis/maldición a un aliado.' },
  { id: 'ob_bomb', num: 89, name: 'Bomba de Plasma', tag: 'daño', cost: 8, txt: '14 de daño directo a un rival (no escala).' },
  { id: 'ob_revive', num: 90, name: 'Pluma Fénix', tag: 'revivir', cost: 16, txt: 'Revive a UN héroe caído con el 50% de su vida.' },
  { id: 'ob_phoenix', num: 91, name: 'Ave Fénix', tag: 'supremo', cost: 26, txt: 'Revive a TODOS tus héroes caídos. La carta cumbre.' },
];

export const BONUSES = [
  { id: 'ban', num: 92, name: 'Gran Banquero', type: 'BON', effect: 25, txt: '+25 monedas para esta subasta.' },
  { id: 'cor', num: 93, name: 'Corredor de Bolsa', type: 'BON', effect: 20, txt: '+20 monedas esta subasta.' },
  { id: 'mer', num: 94, name: 'Mercader Zeta', type: 'BON', effect: 15, txt: '+15 monedas esta subasta.' },
  { id: 'nau', num: 95, name: 'Nauta Financiero', type: 'BON', effect: 18, txt: '+18 monedas esta subasta.' },
  { id: 'pre', num: 96, name: 'La Prestamista', type: 'BON', effect: 22, txt: '+22 monedas ahora, -8 la próxima ronda.' },
  { id: 'for', num: 97, name: 'Patrón de Forja', type: 'EQP', effect: 20, txt: '+20 monedas para la fase de EQUIPAMIENTO.' },
  { id: 'arm', num: 98, name: 'Armero Real', type: 'EQP', effect: 15, txt: '+15 monedas para la fase de EQUIPAMIENTO.' },
  { id: 'pir', num: 99, name: 'El Pirata', type: 'RES', effect: 20, txt: 'El rival pierde 20 monedas esta ronda.' },
  { id: 'cor2', num: 100, name: 'La Corsaria', type: 'RES', effect: 25, txt: 'El rival pierde 25 monedas esta ronda.' },
  { id: 'hac', num: 101, name: 'Hacker Nexus', type: 'RES', effect: 15, txt: 'El rival pierde 15 monedas esta ronda.' },
  { id: 'ban2', num: 102, name: 'Bandolero Seco', type: 'RES', effect: 12, txt: 'El rival pierde 12 monedas esta ronda.' },
  { id: 'gli', num: 103, name: 'Glitch', type: 'RES', effect: 10, txt: 'El rival pierde 10 monedas esta ronda.' },
];

export { CLAN_COLORS };