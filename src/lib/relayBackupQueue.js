import { base44 } from '@/api/base44Client';
// Durable recovery copies stay FIFO, but never block the live socket lane.
export default function relayBackupQueue() {
  let queue = [], busy = false, stopped = false, timer, failures = 0;
  async function flush() {
    if (busy || stopped || !queue.length) return;
    busy = true;
    try {
      const { data } = await base44.functions.invoke('gameRelay', queue[0]);
      if (!data?.ok) throw new Error(data?.error || 'Backup not acknowledged');
      queue.shift(); failures = 0;
    } catch (error) {
      if (error.response?.status === 404) { queue.shift(); failures = 0; }
      else failures++;
    } finally {
      busy = false;
      if (!stopped && queue.length) timer = setTimeout(() => { timer = null; flush(); }, failures ? Math.min(8000, 500 * 2 ** failures) : 0);
    }
  }
  return { push(payload) { queue.push(payload); if (!timer && !busy) flush(); }, close() { stopped = true; clearTimeout(timer); queue = []; } };
}