import { useEffect } from 'react';

// Enlace directo a la versión en inglés: /en fija el idioma y entra al juego.
// Ideal para publicar la app en webs americanas/inglesas.
export default function EnglishEntry() {
  useEffect(() => {
    try { localStorage.setItem('bfLang', 'en'); } catch { /* noop */ }
    window.location.replace('/');
  }, []);
  return null;
}