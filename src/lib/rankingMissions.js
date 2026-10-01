import { nickKey } from '@/lib/nickCanon';

// RANKING DE MISIONES (sección aparte del ranking general).
// Cada partida de misión se guarda como MatchResult con mode 'mission' (en solitario) o 'mission_mp'
// (multijugador). Las victorias en solitario anteriores a esta sección solo existen en MissionVictory:
// se suman aquí SIN duplicar las que ya estén como partida (misma run_id y mismo jugador).
export const MISSION_MODES = ['mission', 'mission_mp'];
export const isMissionRow = (r) => !!r && MISSION_MODES.includes(r.mode);

// rows: MatchResult de misión; victories: MissionVictory; display: nick -> grafía a mostrar
export function buildMissionRanking(rows, victories, display) {
  const wins = { all: {}, solo: {}, mp: {} }, losses = { all: {}, solo: {}, mp: {} };
  const seen = new Set();
  const bump = (map, name) => { map[name] = (map[name] || 0) + 1; };
  const count = (kind, runId, nick, isMp, targetAll, targetSolo, targetMp) => {
    const key = `${kind}|${runId || ''}|${nickKey(nick)}`;
    if (runId && seen.has(key)) return;
    if (runId) seen.add(key);
    bump(targetAll, nick); bump(isMp ? targetMp : targetSolo, nick);
  };
  (rows || []).forEach((r) => {
    if (!isMissionRow(r)) return;
    const mp = r.mode === 'mission_mp';
    if (!r.winner_is_ai && r.winner_nick) count('W', r.run_id, display(r.winner_nick), mp, wins.all, wins.solo, wins.mp);
    if (!r.loser_is_ai && r.loser_nick) count('L', r.run_id, display(r.loser_nick), mp, losses.all, losses.solo, losses.mp);
  });
  (victories || []).forEach((v) => {
    if (!v || !v.nick) return;
    count('W', v.run_id, display(v.nick), false, wins.all, wins.solo, wins.mp);
  });
  return { wins, losses };
}
