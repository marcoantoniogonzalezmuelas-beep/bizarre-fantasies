import { recordGame, isRejection } from '@/lib/gameRecordClient';

// GUARDADO DE UN RESULTADO en tres capas, sin pérdidas silenciosas:
//   1) función de servidor gameRecord (valida, deduplica, guarda avatar y progreso de IA);
//   2) si falla por cualquier motivo que no sea un rechazo explícito: escritura directa (reserva);
//   3) si también falla: se devuelve 'retry' y quien llama lo deja en la cola persistente.
// Devuelve 'ok' | 'reject' | 'retry'. `notify` recibe cada fallo para dejar rastro en diagnósticos.
export async function sendResult(item, deps = {}) {
  const { record = recordGame, reject = isRejection, direct, notify = () => {}, onServer = () => {}, onDirect = () => {} } = deps;
  const result = item.result;
  try {
    const res = await record(item.kind || 'match', { result });
    onServer(res, result);
    return 'ok';
  } catch (err) {
    notify({ stage: 'server', status: err && err.status, code: err && err.code, message: err && err.message, mode: result && result.mode });
    if (reject(err)) return 'reject';
  }
  try {
    if (!direct) return 'retry';
    await direct(result);
    onDirect(result);
    return 'ok';
  } catch (err) {
    notify({ stage: 'direct', status: err && err.status, code: err && err.code, message: err && err.message, mode: result && result.mode });
    return 'retry';
  }
}

// Guarda y, si no hay manera de momento, deja el resultado en la cola persistente.
export async function saveResult(item, outbox, deps) {
  const st = await sendResult(item, deps);
  if (st === 'retry') outbox.add(item);
  return st;
}

// Resultado de una misión (en solitario o multijugador) en el formato de MatchResult.
// En solitario el rival es la propia misión (se marca como IA y no entra en la clasificación de jugadores).
export function missionResult(run, won) {
  const me = String(run.nick || '').slice(0, 28), mp = !!run.modality;
  const rival = mp ? String(run.oppNick || 'Rival').slice(0, 28) : 'IA Misión';
  return {
    mode: mp ? 'mission_mp' : 'mission', mission: run.mission, mission_level: Number(run.level) || 0, run_id: run.run_id,
    winner_nick: won ? me : rival, loser_nick: won ? rival : me,
    winner_is_ai: !mp && !won, loser_is_ai: !mp && !!won,
    ai_level: mp ? '' : String(run.ai || ''), winner_avatar: '', loser_avatar: '', winner_heroes: [], loser_heroes: [],
  };
}
