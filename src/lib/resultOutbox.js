// COLA PERSISTENTE de resultados pendientes de guardar (ranking, misiones).
// Si ni la función de servidor ni la escritura directa pueden guardar un resultado (sin red, función
// no disponible, permisos...), se guarda aquí, en el dispositivo, y se reintenta más tarde: antes se
// perdía en silencio. Los reintentos usan espera exponencial y tienen caducidad.
export const OUTBOX_KEY = 'bfResultOutbox';
const MAX_ITEMS = 60, MAX_AGE_MS = 7 * 24 * 3600 * 1000, MAX_TRIES = 40;

export function createOutbox(storage, now = () => Date.now()) {
  const read = () => { try { const v = JSON.parse(storage.getItem(OUTBOX_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const write = (list) => { try { storage.setItem(OUTBOX_KEY, JSON.stringify(list.slice(-MAX_ITEMS))); } catch (e) { /* sin espacio: se pierde lo más antiguo */ } };
  return {
    size: () => read().length,
    list: read,
    add(item) {
      const list = read();
      const key = item.key || '';
      if (key && list.some((x) => x.key === key)) return false;     // el mismo resultado no se encola dos veces
      list.push({ ...item, at: now(), tries: 0, nextAt: now() });
      write(list); return true;
    },
    // send(item) -> 'ok' | 'reject' | 'retry'. Se procesa en orden; lo que ya no tiene remedio se descarta.
    async flush(send) {
      const t = now(); let sent = 0, kept = 0;
      const next = [];
      for (const it of read()) {
        if (t - it.at > MAX_AGE_MS || it.tries >= MAX_TRIES) continue;
        if (it.nextAt > t) { next.push(it); kept++; continue; }
        let st = 'retry';
        try { st = await send(it); } catch (e) { st = 'retry'; }
        if (st === 'ok') { sent++; continue; }
        if (st === 'reject') continue;
        it.tries += 1; it.nextAt = t + Math.min(3600000, 30000 * 2 ** Math.min(it.tries, 7));
        next.push(it); kept++;
      }
      write(next);
      return { sent, kept };
    },
  };
}
