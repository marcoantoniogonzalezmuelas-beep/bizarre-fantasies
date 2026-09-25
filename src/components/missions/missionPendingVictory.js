const KEY = 'bfPendingMissionVictory';
export function readPendingVictory() {
  try {
    const row = JSON.parse(localStorage.getItem(KEY) || 'null');
    return row && typeof row.nick === 'string' && typeof row.run_id === 'string' && ['club', 'l5r', 'todos'].includes(row.mission) && Number.isInteger(row.level) && row.level >= 1 && row.level <= 5 ? row : null;
  } catch { return null; }
}
export function rememberPendingVictory(run) {
  const row = { nick: run.nick, mission: run.mission, level: run.level, run_id: run.run_id };
  // Local recovery must not prevent the database save in restricted browsers.
  try { localStorage.setItem(KEY, JSON.stringify(row)); } catch { /* The in-memory pending result remains available. */ }
  return row;
}
export function clearPendingVictory(runId) {
  try { if (readPendingVictory()?.run_id === runId) localStorage.removeItem(KEY); } catch { /* An idempotent retry is safe. */ }
}