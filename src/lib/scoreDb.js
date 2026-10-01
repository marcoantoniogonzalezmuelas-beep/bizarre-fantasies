// Marcador histórico entre nicks (entidad HeadToHead) + relleno de las
// victorias contra la IA (entidad PlayerAiProgress).
//
// Las victorias contra cada nivel de IA se llevaban contando desde antes de que
// existiera el marcador general, así que en HeadToHead faltaban: el jugador veía
// 0 victorias suyas frente a la IA aunque llevara varias. Aquí se fusionan las
// dos fuentes (se queda siempre el valor más alto) antes de enviar el marcador
// al juego.
import { base44 } from '@/api/base44Client';
import { AI_LEVEL_NICKS, nickKey, canonPairKey } from '@/lib/nickCanon';

// Antes faltaba el nivel final (IA Bizarra) y el nick de la IA cambiaba con el idioma.
export const AI_NICKS = AI_LEVEL_NICKS;

export function pairKeyOf(a, b) {
  return [nickKey(a), nickKey(b)].sort().join('||');
}

function bump(map, pairKey, nick, wins) {
  if (!pairKey || !nick || !wins) return;
  // Todo se guarda con la clave canónica: filas antiguas con "ai novice||ana" o "Ana" se unen aquí.
  const pair = (map[canonPairKey(pairKey)] = map[canonPairKey(pairKey)] || {});
  const key = nickKey(nick);
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