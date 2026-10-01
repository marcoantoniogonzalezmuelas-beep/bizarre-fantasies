// PANTALLA ENCENDIDA durante una partida online.
// En iPhone (y en muchos Android) la pantalla se bloquea tras unos segundos sin tocarla; mientras esperas el
// turno del rival no tocas nada, así que el sistema suspende la página, se corta la conexión y la partida se
// "desconecta". El Wake Lock API pide al sistema que no apague la pantalla. Se renueva solo al volver a la
// página (el sistema lo libera al ocultarla) y se suelta al acabar la sala. Si el navegador no lo soporta
// (iOS < 16.4) no hace nada.
export function createWakeLock(nav = typeof navigator !== 'undefined' ? navigator : {}, doc = typeof document !== 'undefined' ? document : null) {
  let sentinel = null, wanted = false, pending = false;
  const supported = () => !!(nav && nav.wakeLock && typeof nav.wakeLock.request === 'function');
  async function acquire() {
    if (!wanted || sentinel || pending || !supported()) return false;
    if (doc && doc.visibilityState && doc.visibilityState !== 'visible') return false;
    pending = true;
    try {
      const s = await nav.wakeLock.request('screen');
      if (!wanted) { try { await s.release(); } catch (e) { /* ya liberado */ } return false; }
      sentinel = s;
      if (s && typeof s.addEventListener === 'function') s.addEventListener('release', () => { if (sentinel === s) sentinel = null; });
      return true;
    } catch (e) { return false; } finally { pending = false; }
  }
  if (doc && typeof doc.addEventListener === 'function') doc.addEventListener('visibilitychange', () => { if (doc.visibilityState === 'visible') acquire(); });
  return {
    keep() { wanted = true; return acquire(); },
    release() { wanted = false; const s = sentinel; sentinel = null; try { s && s.release(); } catch (e) { /* noop */ } },
    isHeld: () => !!sentinel,
    supported,
  };
}
export const screenWakeLock = createWakeLock();
