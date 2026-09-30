import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { onViewportChange } from '@/lib/viewportEvents';

// Escala un "escenario" de ancho/alto fijos (desktop) para que QUEPE ENTERO en
// el viewport (contain), con letterboxing y centrado. El usuario puede pellizcar
// para ampliar (1×–4×) y arrastrar para desplazarlo. Así una escena pensada
// para escritorio se ve completa en cualquier orientación de móvil/tablet
// (aunque sea pequeña) y el usuario la amplía con el zoom del dispositivo.
//
// A diferencia de useDesktopZoom (que escala el <body>), este hook escala un
// elemento concreto (el overlay de la cinemática) sin afectar al resto.
export default function useStageZoom(stageWidth = 1200, stageHeight) {
  const ref = useRef(null);
  // Altura del escenario = proporción de escritorio (16:9) salvo que se indique.
  const sh = stageHeight != null ? stageHeight : Math.round(stageWidth * 9 / 16);

  const [fit, setFit] = useState(() => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.innerWidth / stageWidth, window.innerHeight / sh);
  });

  // Zoom de usuario (1× = ajustado, hasta 4×) y desplazamiento (px, pre-scale).
  const zoom = useRef(1);
  const pan = useRef({ x: 0, y: 0 });
  const gesture = useRef(null);

  const computeFit = () => Math.min(window.innerWidth / stageWidth, window.innerHeight / sh);

  // Centra el escenario escalado en el viewport y le suma el pan del usuario.
  const apply = () => {
    const el = ref.current;
    if (!el) return;
    const s = fit * zoom.current;
    const ox = (window.innerWidth - stageWidth * s) / 2;
    const oy = (window.innerHeight - sh * s) / 2;
    el.style.transform = `translate(${ox + pan.current.x}px, ${oy + pan.current.y}px) scale(${s})`;
    el.style.transformOrigin = '0 0';
  };

  const clampPan = () => {
    const s = fit * zoom.current;
    const dispW = stageWidth * s;
    const dispH = sh * s;
    const maxX = Math.max(0, (dispW - window.innerWidth) / 2);
    const maxY = Math.max(0, (dispH - window.innerHeight) / 2);
    pan.current.x = Math.max(-maxX, Math.min(maxX, pan.current.x));
    pan.current.y = Math.max(-maxY, Math.min(maxY, pan.current.y));
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = stageWidth + 'px';
    el.style.height = sh + 'px';
    el.style.touchAction = 'none';
    apply();

    const onResize = () => {
      const nf = computeFit();
      setFit(nf);
      pan.current = { x: 0, y: 0 };
      zoom.current = 1;
      apply();
    };
    const offViewport = onViewportChange(onResize);

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

    // Listeners en window: el pellizco funciona en toda la pantalla (también
    // en las bandas de letterbox), no sólo dentro del escenario.
    window.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    return () => {
      offViewport();
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [fit]);

  return ref;
}