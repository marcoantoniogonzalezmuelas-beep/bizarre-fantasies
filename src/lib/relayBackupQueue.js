import { base44 } from '@/api/base44Client';
// Copias de recuperación duraderas: siguen en orden FIFO pero NO bloquean el
// canal en vivo. Se agrupan varias jugadas en una sola llamada al servidor para
// no saturar el backend entre turnos.
export default function relayBackupQueue() {
  let queue = [], busy = false, stopped = false, timer, failures = 0;
  const merge = items => {
    if (items.length === 1) return items[0];
    return { ...items[0], batch_id: items[0].batch_id + '_m' + items.length, messages: items.flatMap(i => i.messages) };
  };
  async function flush() {
    if (busy || stopped || !queue.length) return;
    busy = true;
    const items = [];
    let count = 0;
    for (const item of queue) {
      if (items.length && (item.code !== items[0].code || item.side !== items[0].side || count + item.messages.length > 50)) break;
      items.push(item); count += item.messages.length;
    }
    try {
      const { data } = await base44.functions.invoke('gameRelay', merge(items));
      if (!data?.ok) throw new Error(data?.error || 'Backup not acknowledged');
      queue.splice(0, items.length); failures = 0;
    } catch (error) {
      if (error.response?.status === 404) { queue.splice(0, items.length); failures = 0; }
      else failures++;
    } finally {
      busy = false;
      if (!stopped && queue.length) timer = setTimeout(() => { timer = null; flush(); }, failures ? Math.min(8000, 500 * 2 ** failures) : 250);
    }
  }
  return { push(payload) { queue.push(payload); if (!timer && !busy) timer = setTimeout(() => { timer = null; flush(); }, 250); }, close() { stopped = true; clearTimeout(timer); queue = []; } };
}