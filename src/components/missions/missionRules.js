export const MISSIONS = [{ id: 'club', name: 'Club', description: 'Los héroes del Club se reúnen para su gran desafío.' }, { id: 'l5r', name: 'L5R', description: 'Honor, estrategia y leyendas en cinco pruebas.' }];
export const LEVELS = [
  { id: 1, name: 'Iniciación', budget: 100, wins: 1, ai: 'novice', epics: 0, rivalBonus: 0, description: 'Compra tres héroes sin épicas. Rival de valor similar.' },
  { id: 2, name: 'El sobre sorpresa', pack: true, wins: 1, ai: 'novice', epics: 1, rivalBonus: 0, description: 'Tres héroes al azar. Rival de valor similar y el mismo número de épicas.' },
  { id: 3, name: 'Desafío', budget: 75, wins: 2, ai: 'strategist', epics: 0, rivalBonus: 10, description: 'Compra sin épicas. Rival de mayor valor, con hasta una épica.' },
  { id: 4, name: 'Maestría', budget: 50, wins: 3, ai: 'nemesis', epics: 0, rivalBonus: 15, description: 'Presupuesto ajustado, rival exigente y tres victorias acumuladas.' },
  { id: 5, name: 'El sello épico', pack: true, wins: 3, ai: 'nemesis', epics: 1, exactEpics: 1, rivalBonus: 15, description: 'Un sobre con una épica garantizada. Rival con una épica y mayor valor.' },
];
export const isEpic = card => String(card.clan || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === 'epicas';
export const valueOf = team => team.reduce((sum, card) => sum + Number(card.cost), 0);
export const epicCount = team => team.filter(isEpic).length;
export function missionPool(cards, mission) { return cards.filter(c => c.category === 'hero' && String(c.tag || '').toLowerCase().split(/[^a-z0-9]+/).includes(mission) && Number.isFinite(Number(c.cost)) && Number(c.cost) >= 0); }
export function triples(pool) {
  const result = [];
  for (let a = 0; a < pool.length; a++) for (let b = a + 1; b < pool.length; b++) for (let c = b + 1; c < pool.length; c++) result.push([pool[a], pool[b], pool[c]]);
  return result;
}
export function availableTeams(pool, level) { return triples(pool).filter(team => epicCount(team) <= level.epics && (level.exactEpics == null || epicCount(team) === level.exactEpics)); }
export function heroBudget(pool, level) {
  if (level.pack) return null;
  const teams = availableTeams(pool, level);
  return teams.length ? Math.max(level.budget, Math.min(...teams.map(valueOf))) : level.budget;
}
export function drawPack(pool, level) {
  const teams = availableTeams(pool, level);
  if (!teams.length) throw new Error('No hay tres héroes disponibles para las reglas de este nivel.');
  return teams[Math.floor(Math.random() * teams.length)];
}
export function chooseRival(pool, team, level) {
  const target = valueOf(team) + level.rivalBonus;
  const playerIds = new Set(team.map(card => card.card_id || card.id || card.number));
  const candidates = triples(pool).filter(t => t.every(card => !playerIds.has(card.card_id || card.id || card.number)) && epicCount(t) <= (level.id === 1 ? 0 : 1) && (!level.pack || epicCount(t) === epicCount(team)));
  if (!candidates.length) throw new Error('No se puede formar un rival con estas reglas.');
  const distances = candidates.map(t => Math.abs(valueOf(t) - target));
  const nearest = Math.min(...distances);
  const tied = candidates.filter((_, i) => distances[i] === nearest);
  return tied[Math.floor(Math.random() * tied.length)];
}
export const winsFor = (rows, mission, level) => new Set(rows.filter(r => r.mission === mission && r.level === level).map(r => r.run_id)).size;
export const unlocked = (rows, mission, level) => level.id === 1 || winsFor(rows, mission, level.id - 1) >= LEVELS[level.id - 2].wins;