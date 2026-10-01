import { base44 } from '@/api/base44Client';
import { createOutbox } from '@/lib/resultOutbox';
import { saveResult, sendResult } from '@/lib/resultSaver';

// Guardado de resultados (ranking y misiones) con cola persistente. Ver resultSaver / resultOutbox.
const memory = { getItem: () => null, setItem() {} };
const outbox = createOutbox(typeof localStorage !== 'undefined' ? localStorage : memory);

// Cada fallo deja rastro en los diagnósticos de red (como mucho uno por minuto y tipo), para poder ver
// POR QUÉ no se guarda algo (antes se descartaba sin avisar).
const lastReport = {};
function notify(info) {
  try {
    const k = `${info.stage}|${info.status}|${info.code}`;
    if (Date.now() - (lastReport[k] || 0) < 60000) return;
    lastReport[k] = Date.now();
    base44.entities.ConnectionError.create({
      error_type: 'server_error', action: 'record',
      error_message: `[record_failed] ${JSON.stringify(info)}`.slice(0, 500),
    }).catch(() => {});
  } catch (e) { /* los diagnósticos nunca deben romper el guardado */ }
}

// Reserva: escritura directa (solo funciona mientras la entidad admita escritura anónima).
async function direct(r) {
  await base44.entities.MatchResult.create(r);
  if (r.winner_avatar && !r.winner_is_ai) base44.entities.PlayerAvatar.create({ nick: r.winner_nick, avatar_url: r.winner_avatar }).catch(() => {});
  if (r.loser_avatar && !r.loser_is_ai) base44.entities.PlayerAvatar.create({ nick: r.loser_nick, avatar_url: r.loser_avatar }).catch(() => {});
}

const keyOf = (r) => r.run_id || [r.mode, r.winner_nick, r.loser_nick, Math.floor(Date.now() / 60000)].join('|');

export function saveMatchResult(result, hooks = {}) {
  return saveResult({ kind: 'match', result, key: keyOf(result) }, outbox, { direct, notify, ...hooks });
}
export function flushResultOutbox() {
  return outbox.flush((item) => sendResult(item, { direct, notify }));
}
export const pendingResultCount = () => outbox.size();
