import { base44 } from '@/api/base44Client';
import { recordGame, isRejection } from '@/lib/gameRecordClient';
export async function loadVictories(nick) {
  const rows = []; let page;
  do { page = await base44.entities.MissionVictory.filter({ nick: nick.toLowerCase() }, '-created_date', 500, rows.length); rows.push(...page); } while (page.length === 500);
  return rows;
}
export async function saveVictory(run) {
  try {
    // El servidor valida la misión y el nivel y es idempotente por run_id.
    const res = await recordGame('mission_victory', { nick: run.nick, mission: run.mission, level: run.level, run_id: run.run_id });
    if (res && res.victory) return res.victory;
  } catch (err) {
    if (isRejection(err)) throw err;
    // Reserva (función no disponible): escritura directa antigua.
  }
  const existing = await base44.entities.MissionVictory.filter({ run_id: run.run_id }, '-created_date', 1);
  if (existing.length) return existing[0];
  return base44.entities.MissionVictory.create({ nick: run.nick.toLowerCase(), mission: run.mission, level: run.level, run_id: run.run_id });
}