import { base44 } from '@/api/base44Client';

// CATÁLOGO DE CARTAS para el juego (arte por nombre, textos, animaciones, arte de batalla).
// Antes cada consulta era única, con tope de 300 cartas y los errores se tragaban: si fallaba una vez (algo
// normal en móvil) las cartas se quedaban con el nombre y sin imagen durante TODA la partida, y las cartas
// con número > 300 no tenían nunca arte. Ahora:
//   - hasta 6 intentos con espera creciente;
//   - sin tope de 300 (como el servidor, que pide 1000);
//   - copia local de la última carga buena como reserva si la red falla del todo;
//   - un fallo no queda memorizado: la siguiente petición vuelve a intentarlo.
const KEY = 'bfCardCatalogV1';
export const CATALOG_LIMIT = 1000;
const BACKOFF = [400, 1000, 2500, 5000, 8000];

export function createCatalogLoader({ fetchCards, storage, wait = (ms) => new Promise((r) => setTimeout(r, ms)), now = () => Date.now() }) {
  let inFlight = null, cache = null;
  const readStored = () => { try { const v = JSON.parse(storage.getItem(KEY) || 'null'); return v && Array.isArray(v.cards) && v.cards.length ? v.cards : null; } catch (e) { return null; } };
  const writeStored = (cards) => { try { storage.setItem(KEY, JSON.stringify({ at: now(), cards })); } catch (e) { /* sin espacio: no pasa nada */ } };
  async function run() {
    let lastErr = null;
    for (let i = 0; i <= BACKOFF.length; i++) {
      try {
        const cards = await fetchCards();
        if (Array.isArray(cards) && cards.length) { cache = cards; writeStored(cards); return cards; }
        lastErr = new Error('empty');
      } catch (e) { lastErr = e; }
      if (i < BACKOFF.length) await wait(BACKOFF[i]);
    }
    const stale = readStored();
    if (stale) { cache = stale; return stale; }
    throw lastErr || new Error('catalog_unavailable');
  }
  return {
    load() {
      if (cache) return Promise.resolve(cache);
      if (!inFlight) inFlight = run().finally(() => { inFlight = null; });
      return inFlight;
    },
    peek: () => cache,
  };
}

const memory = { getItem: () => null, setItem() {} };
const loader = createCatalogLoader({
  fetchCards: () => base44.entities.Card.list('number', CATALOG_LIMIT),
  storage: typeof localStorage !== 'undefined' ? localStorage : memory,
});
export const loadCardCatalog = () => loader.load();
