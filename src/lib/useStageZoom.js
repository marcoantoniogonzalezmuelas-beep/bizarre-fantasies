import { useEffect, useRef, useState } from 'react';

// Zoom de pellizco sobre un "escenario" de ancho fijo (p.ej. 1200px) que se
// escala para caber en el viewport del móvil/tablet. A diferencia de
// useDesktopZoom (que escala el <body>), este hook escala un elemento
// concreto (el overlay de la cinemática) sin afectar al resto de la página.
//
// El escenario se renderiza a su ancho natural de escritorio y se escala con
// CSS transform para que quepa en pantalla; el usuario puede pellizcar para
// ampliar (1×–4×) y arrastrar para desplazarlo, igual que en el juego.
export default function useStageZoom(stageWidth = 1200) {
  const ref = useRef(null);
  const [fit, setFit] = useState(() => {
    if (typeof window === 'undefined') return 1;
    return Math.min(1, window.innerWidth / stageWidth);
  });

  // Zoom de usuario (1× = ajustado, hasta 4×) y desplazamiento en px del
    // escenario (coordenadas locales, pre-scale).
  const zoom = useRef(1);
  const pan = useRef({ x: 0, y: 0 });
  const stageH = useRef(0);
  const gesture = useRef(null);

  const computeFit = () => Math.min(1, window.innerWidth / stageWidth);

  const apply = () => {
    const el = ref.current;
    if (!el) return;
    const s = fit * zoom.current;
    el.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px) scale(${s})`;
    el.style.transformOrigin = '0 0';
  };

  const clampPan = () => {
    const s = fit * zoom.current;
    const visW = window.innerWidth / s;
    const visH = window.innerHeight / s;
    const maxX = Math.max(0, (stageWidth - visW) / 2);
    const maxY = Math.max(0, (stageH.current - visH) / 2);
    pan.current.x = Math.max(-maxX, Math.min(maxX, pan.current.x));
    pan.current.y = Math.max(-maxY, Math.min(maxY, pan.current.y));
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Altura del escenario = pantalla / fit → al escalar rellena toda la altura.
    stageH.current = window.innerHeight / fit;
    el.style.width = stageWidth + 'px';
    el.style.height = stageH.current + 'px';
    el.style.touchAction = 'none';
    apply();

    const onResize = () => {
      setFit(computeFit());
      stageH.current = window.innerHeight / computeFit();
      pan.current = { x: 0, y: 0 };
      zoom.current = 1;
      apply();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const mid = (t) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });

    const onStart = (e) => {
      if (e.touches && e.touches.length === 2) {
        e.preventDefault();
        const ts = Array.from(e.touches);
        gesture.current = { d0: dist(ts), z0: zoom.current, mid0: mid(ts), pan0: { ...pan.current } };
      }
    };
    const onMove = (e) => {
      if (!gesture.current || !e.touches || e.touches.length !== 2) return;
      e.preventDefault();
      const ts = Array.from(e.touches);
      const d = dist(ts);
      let nz = gesture.current.z0 * (d / gesture.current.d0);
      nz = Math.max(1, Math.min(4, nz));
      zoom.current = nz;
      const m = mid(ts);
      const s = fit * zoom.current;
      pan.current.x = gesture.current.pan0.x + (m.x - gesture.current.mid0.x) / s;
      pan.current.y = gesture.current.pan0.y + (m.y - gesture.current.mid0.y) / s;
      clampPan();
      apply();
    };
    const onEnd = (e) => {
      if (!e.touches || e.touches.length < 2) gesture.current = null;
    };

    el.addEventListener('touchstart', onStart, { passive: false });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit]);

  return ref;
}