import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Pellizco (pinch) propio para TODAS las páginas de la app (Oráculo, Reglas,
// Razas, Ranking, guía de cartas…), idéntico al que ya funciona dentro del
// juego: 2 dedos acercan/alejan (x1–x4) y desplazan; al soltar cerca de x1 se
// reencuadra. Con un dedo, el scroll nativo sigue funcionando igual.
//
// La portada ("/") queda fuera: allí el juego vive en un iframe que ya tiene su
// propio pellizco, y transformar la página encima duplicaría el zoom.
export default function PagePinchZoom() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === '/') return;
    const root = document.getElementById('root');
    if (!root) return;

    let z = 1, tx = 0, ty = 0, pinch = null, raf = null;
    const html = document.documentElement;

    const apply = () => {
      root.style.transformOrigin = '0 0';
      root.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${z})`;
    };
    // Capa GPU PERMANENTE (igual que dentro del juego): si la capa se crea al
    // empezar el pellizco y se destruye al soltar, el navegador re-rasteriza
    // toda la pantalla y eso es lo que provoca el parpadeo en tablet.
    root.style.backfaceVisibility = 'hidden';
    root.style.willChange = 'transform';
    apply();
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; apply(); });
    };
    const clamp = () => {
      const marginX = window.innerWidth * z - window.innerWidth;
      const marginY = window.innerHeight * z - window.innerHeight;
      tx = marginX <= 0 ? 0 : Math.min(0, Math.max(-marginX, tx));
      ty = marginY <= 0 ? 0 : Math.min(0, Math.max(-marginY, ty));
    };
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const mid = (t) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
    const start = (t) => { pinch = { d0: dist(t), c0: mid(t), z0: z, tx0: tx, ty0: ty, a: t[0].identifier, b: t[1].identifier }; };
    const samePair = (t) => pinch && t[0].identifier === pinch.a && t[1].identifier === pinch.b;

    const onStart = (e) => {
      if (e.touches.length < 2) return;
      e.preventDefault();
      root.style.transition = 'none';
      // Congela animaciones/transiciones mientras se pellizca: es lo que
      // provoca el parpadeo (cada fotograma repinta la capa escalada).
      html.classList.add('bf-pinching');
      start(e.touches);
    };
    const onMove = (e) => {
      if (!pinch || e.touches.length < 2) return;
      e.preventDefault();
      if (!samePair(e.touches)) { start(e.touches); return; }
      const d = dist(e.touches), c = mid(e.touches);
      if (!pinch.d0) return;
      const nz = Math.min(4, Math.max(1, pinch.z0 * (d / pinch.d0)));
      const px = (pinch.c0.x - pinch.tx0) / pinch.z0;
      const py = (pinch.c0.y - pinch.ty0) / pinch.z0;
      z = nz; tx = c.x - px * nz; ty = c.y - py * nz;
      clamp();
      schedule();
    };
    const onEnd = (e) => {
      if (!pinch) return;
      if (e.touches.length >= 2) { start(e.touches); return; }
      pinch = null;
      root.style.transition = 'transform .26s cubic-bezier(.2,.8,.3,1)';
      if (z < 1.05) { z = 1; tx = 0; ty = 0; }
      clamp();
      apply();
      setTimeout(() => html.classList.remove('bf-pinching'), 300);
    };

    document.addEventListener('touchstart', onStart, { capture: true, passive: false });
    document.addEventListener('touchmove', onMove, { capture: true, passive: false });
    document.addEventListener('touchend', onEnd, { capture: true, passive: false });
    document.addEventListener('touchcancel', onEnd, { capture: true, passive: false });

    return () => {
      document.removeEventListener('touchstart', onStart, { capture: true });
      document.removeEventListener('touchmove', onMove, { capture: true });
      document.removeEventListener('touchend', onEnd, { capture: true });
      document.removeEventListener('touchcancel', onEnd, { capture: true });
      html.classList.remove('bf-pinching');
      root.style.transform = '';
      root.style.transition = '';
      root.style.willChange = '';
      root.style.backfaceVisibility = '';
    };
  }, [pathname]);

  return null;
}