import { base44 } from '@/api/base44Client';
import { createGameHtmlStore, idbBackend } from '@/lib/gameHtmlCache';

// Carga del HTML del juego: caché local + descarga adelantada + revalidación en segundo plano.
//   load(1): copia local (instantánea) y se refresca en segundo plano para la próxima visita;
//            si no hay copia, usa la descarga adelantada o pide el HTML.
//   load(n>1): es un reintento tras un fallo: se descarta la copia local (por si estuviera dañada).
//   warm():  main.jsx lo llama al arrancar: si NO hay copia, empieza ya la descarga, en paralelo con la
//            comprobación de autenticación (antes Home no pedía el HTML hasta que esa terminaba).
export function createGameHtmlLoader({ invoke, store, version, getStamp = async () => '', stampTimeoutMs = 3000, now = () => Date.now(), preloadMaxAgeMs = 60000 }) {
  let preload = null;
  // Marca de la base de datos de cartas (con límite de tiempo: si no se puede leer, se sigue sin ella).
  const readStamp = () => Promise.race([Promise.resolve().then(getStamp).catch(() => ''), new Promise((r) => setTimeout(() => r(''), stampTimeoutMs))]);
  const fetchNet = async (attempt) => {
    // La marca se lee ANTES (no a la vez) de pedir el HTML: así, si alguien edita una carta entre medias, el
    // HTML es igual o más nuevo que la marca y solo se pierde la caché; nunca al revés (copia vieja con marca nueva).
    const stamp = await readStamp();
    const res = await invoke('gameHtml', { version, t: now(), r: Math.random().toString(36).slice(2), attempt });
    const html = typeof res.data === 'string' ? res.data : String(res.data);
    if (!html || html.length < 1000) throw new Error('empty');
    const h = res.headers || {};
    return { html, serverVersion: String(h['x-bf-patch-version'] || ''), stamp };
  };
  const startPreload = () => {
    if (!preload) { preload = { at: now(), promise: fetchNet(1) }; preload.promise.catch(() => {}); }
    return preload.promise;
  };
  return {
    warm() { return store.get(version).then((c) => { if (!c) startPreload(); }).catch(() => {}); },
    async load(attempt = 1) {
      if (attempt === 1) {
        let cached = await store.get(version);
        // Una carta nueva o editada en el editor invalida la copia local: el juego siempre refleja la base de datos.
        if (cached && cached.stamp) { const now0 = await readStamp(); if (now0 && now0 !== cached.stamp) cached = null; }
        if (cached) {
          const net = preload ? preload.promise : fetchNet(1);
          preload = null;
          const refresh = net.then((r) => store.set(version, r.html, r.serverVersion, r.stamp)).catch(() => {});
          return { html: cached.html, source: 'cache', refresh };
        }
        if (preload && now() - preload.at < preloadMaxAgeMs) {
          const p = preload; preload = null;
          try { const r = await p.promise; store.set(version, r.html, r.serverVersion, r.stamp); return { html: r.html, source: 'preload' }; } catch (e) { /* cae a la red */ }
        }
      } else {
        preload = null; await store.clear();
      }
      const r = await fetchNet(attempt);
      store.set(version, r.html, r.serverVersion, r.stamp);
      return { html: r.html, source: 'network' };
    },
  };
}

// Versión del cliente: cámbiala SIEMPRE que cambie el HTML del servidor o los parches que lo esperan
// (invalida las copias guardadas). Debe coincidir con GAME_PATCH_VERSION de base44/functions/gameHtml.
export const GAME_HTML_VERSION = 'bf-2026-10-08-catchup-v262';

export const gameHtmlLoader = createGameHtmlLoader({
  invoke: (name, payload) => base44.functions.invoke(name, payload),
  getStamp: async () => {
    const l = await base44.entities.Card.list('-updated_date', 1); const c = l && l[0];
    let a = null; try { const la = await base44.entities.AbilityImpl.list('-updated_date', 1); a = la && la[0]; } catch (e) { /* sin fichas */ }
    return (c ? String(c.updated_date || '') + '|' + String(c.id || '') : '') + '#' + (a ? String(a.updated_date || '') + '|' + String(a.id || '') : '');
  },
  store: createGameHtmlStore(idbBackend()),
  version: GAME_HTML_VERSION,
});
