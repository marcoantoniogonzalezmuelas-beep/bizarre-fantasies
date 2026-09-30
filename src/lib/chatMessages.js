// Lista de mensajes del chat: reemplaza por id, mantiene el orden cronológico
// y limita el tamaño (antes crecía sin límite durante toda la partida y cada
// mensaje reordenaba la lista entera parseando fechas en cada comparación).
export const CHAT_MAX_MESSAGES = 200;

const ts = (m) => { const v = new Date(m && m.created_date).getTime(); return Number.isFinite(v) ? v : 0; };

export function mergeChatMessage(prev, incoming, cap = CHAT_MAX_MESSAGES) {
  if (!incoming || !incoming.id) return prev;
  const i = prev.findIndex((m) => m.id === incoming.id);
  let next;
  if (i >= 0) { next = prev.slice(); next[i] = incoming; }
  else {
    next = prev.concat(incoming);
    // Normalmente llega en orden: solo se reordena si el nuevo es más antiguo que el último.
    if (prev.length && ts(prev[prev.length - 1]) > ts(incoming)) next.sort((a, b) => ts(a) - ts(b));
  }
  return next.length > cap ? next.slice(next.length - cap) : next;
}
