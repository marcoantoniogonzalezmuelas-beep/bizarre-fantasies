// Marcador histórico entre nicks (entidad HeadToHead) + relleno de las
// victorias contra la IA (entidad PlayerAiProgress).
//
// Las victorias contra cada nivel de IA se llevaban contando desde antes de que
// existiera el marcador general, así que en HeadToHead faltaban: el jugador veía
// 0 victorias suyas frente a la IA aunque llevara varias. Aquí se fusionan las
// dos fuentes (se queda siempre el valor más alto) antes de enviar el marcador
// al juego.
import { base44 } from '@/api/base44Client';

export const AI_NICKS = {
  novice: 'IA Novata',
  berserker: 'IA Bersérker',
  strategist: 'IA Estratega',
  nemesis: 'IA Némesis',
};

export function pairKeyOf(a, b) {
  return [String(a || '').toLowerCase(), String(b || '').toLowerCase()].sort().join('||');
}

function bump(map, pairKey, nick, wins) {
  if (!pairKey || !nick || !wins) return;
  const pair = (map[pairKey] = map[pairKey] || {});
  const key = String(nick).toLowerCase();
  pair[key] = Math.max(pair[key] || 0, wins);
}

export async function loadScoreDb() {
  const map = {};

  const rows = await base44.entities.HeadToHead.list('-updated_date', 1000).catch(() => []);
  (rows || []).forEach(r => bump(map, r.pair_key, r.nick, r.wins || 0));

  // Victorias contra la IA acumuladas por nick y nivel.
  const progress = await base44.entities.PlayerAiProgress.list('-updated_date', 1000).catch(() => []);
  (progress || []).forEach(p => {
    const aiNick = AI_NICKS[p.level_id];
    if (!aiNick || !p.nick) return;
    bump(map, pairKeyOf(p.nick, aiNick), p.nick, p.wins || 0);
  });

  return map;
}