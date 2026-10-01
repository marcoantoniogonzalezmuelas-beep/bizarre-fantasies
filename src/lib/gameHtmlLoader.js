import { base44 } from '@/api/base44Client';
import { createGameHtmlStore, idbBackend } from '@/lib/gameHtmlCache';

// Carga del HTML del juego: caché local + descarga adelantada + revalidación en segundo plano.
//   load(1): copia local (instantánea) y se refresca en segundo plano para la próxima visita;
//            si no hay copia, usa la descarga adelantada o pide el HTML.
//   load(n>1): es un reintento tras un fallo: se descarta la copia local (por si estuviera dañada).
//   warm():  main.jsx lo llama al arrancar: si NO hay copia, empieza ya la descarga, en paralelo con la
//            comprobación de autenticación (antes Home no pedía el HTML hasta que esa terminaba).
export function createGameHtmlLoader({ invoke, store, version, now = () => Date.now(), preloadMaxAgeMs = 60000 }) {
  let preload = null;
  const fetchNet = async (attempt) => {
    const res = await invoke('gameHtml', { version, t: now(), r: Math.random().toString(36).slice(2), attempt });
    const html = typeof res.data === 'string' ? res.data : String(res.data);
    if (!html || html.length < 1000) throw new Error('empty');
    const h = res.headers || {};
    return { html, serverVersion: String(h['x-bf-patch-version'] || '') };
  };
  const startPreload = () => {
    if (!preload) { preload = { at: now(), promise: fetchNet(1) }; preload.promise.catch(() => {}); }
    return preload.promise;
  };
  return {
    warm() { return store.get(version).then((c) => { if (!c) startPreload(); }).catch(() => {}); },
    async load(attempt = 1) {
      if (attempt === 1) {
        const cached = await store.get(version);
        if (cached) {
          const net = preload ? preload.promise : fetchNet(1);
          preload = null;
          const refresh = net.then((r) => store.set(version, r.html, r.serverVersion)).catch(() => {});
          return { html: cached.html, source: 'cache', refresh };
        }
        if (preload && now() - preload.at < preloadMaxAgeMs) {
          const p = preload; preload = null;
          try { const r = await p.promise; store.set(version, r.html, r.serverVersion); return { html: r.html, source: 'preload' }; } catch (e) { /* cae a la red */ }
        }
      } else {
        preload = null; await store.clear();
      }
      const r = await fetchNet(attempt);
      store.set(version, r.html, r.serverVersion);
      return { html: r.html, source: 'network' };
    },
  };
}

// Versión del cliente: cámbiala SIEMPRE que cambie el HTML del servidor o los parches que lo esperan
// (invalida las copias guardadas). Debe coincidir con GAME_PATCH_VERSION de base44/functions/gameHtml.
export const GAME_HTML_VERSION = 'bf-2026-10-02-resume-final-v230';

export const gameHtmlLoader = createGameHtmlLoader({
  invoke: (name, payload) => base44.functions.invoke(name, payload),
  store: createGameHtmlStore(idbBackend()),
  version: GAME_HTML_VERSION,
});
