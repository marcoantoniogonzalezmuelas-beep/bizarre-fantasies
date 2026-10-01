// Caché local del HTML del juego (IndexedDB), para que las visitas repetidas arranquen al instante.
//
// Cada visita descargaba ~566 KB que el servidor reconstruye (HTML base de un CDN + 1.000 cartas de
// la BD) y que no se podían cachear (la petición llevaba un valor aleatorio y el servidor responde
// "no-store"). Aquí se guarda la última copia:
//   - la CLAVE es la versión del cliente (EXPECTED_PATCH_VERSION): un cliente nuevo nunca arranca con
//     HTML viejo (los parches asumen el HTML de su misma versión);
//   - caduca a las 6 h, para que las ediciones de cartas lleguen siempre en la siguiente visita;
//   - se revalida en segundo plano en cada visita (ver gameHtmlLoader), así la copia nunca queda vieja
//     más de una visita.
export const GAME_HTML_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const KEY = 'game';

export function createGameHtmlStore(backend, now = () => Date.now()) {
  return {
    async get(version) {
      try {
        const e = backend ? await backend.get(KEY) : null;
        if (!e || e.version !== version || typeof e.html !== 'string' || e.html.length < 1000) return null;
        if (now() - (e.savedAt || 0) > GAME_HTML_MAX_AGE_MS) return null;
        return e;
      } catch (err) { return null; }
    },
    async set(version, html, serverVersion = '') {
      try { if (backend && typeof html === 'string' && html.length >= 1000) await backend.put(KEY, { version, html, serverVersion, savedAt: now() }); } catch (err) { /* sin caché: no pasa nada */ }
    },
    async clear() { try { if (backend) await backend.del(KEY); } catch (err) { /* idem */ } },
  };
}

// Soporte real: IndexedDB. Si no existe o falla (modo privado, cuota...), no hay caché y todo sigue igual.
export function idbBackend(idb) {
  const factory = idb || (typeof indexedDB !== 'undefined' ? indexedDB : null);
  if (!factory) return null;
  let dbPromise = null;
  const open = () => dbPromise || (dbPromise = new Promise((resolve, reject) => {
    const req = factory.open('bf-game-cache', 1);
    req.onupgradeneeded = () => { try { req.result.createObjectStore('html'); } catch (e) { /* ya existe */ } };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('blocked'));
  }));
  const run = (mode, fn) => open().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction('html', mode); const r = fn(tx.objectStore('html'));
    tx.oncomplete = () => resolve(r && r.result !== undefined ? r.result : undefined);
    tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  }));
  return {
    get: (k) => run('readonly', (s) => s.get(k)),
    put: (k, v) => run('readwrite', (s) => s.put(v, k)),
    del: (k) => run('readwrite', (s) => s.delete(k)),
  };
}
