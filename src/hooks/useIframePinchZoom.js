import { useEffect, useRef, useState } from 'react';

// Recibe los gestos de dos dedos que el juego reenvía desde dentro del iframe
// (ver touchZoomBridgePatch) y devuelve el zoom y el desplazamiento a aplicar
// sobre la capa que contiene el juego.
//
//   · Pellizcar: acercar/alejar (de x1 a x4), anclado al punto entre los dedos.
//   · Mover los dos dedos: desplazarse por la mesa (scroll).
//   · Al cerrar el pellizco por debajo de x1 vuelve al encuadre completo.
export function useIframePinchZoom({ contentW, contentH, baseScale = 1, enabled = true }) {
  const [view, setView] = useState({ z: 1, x: 0, y: 0 });
  const stateRef = useRef({ z: 1, x: 0, y: 0 });
  const gestureRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const clamp = (v) => {
      const W = document.documentElement.clientWidth;
      const H = document.documentElement.clientHeight;
      const w = contentW * baseScale * v.z;
      const h = contentH * baseScale * v.z;
      return {
        z: v.z,
        x: w <= W ? 0 : Math.min(0, Math.max(W - w, v.x)),
        y: h <= H ? 0 : Math.min(0, Math.max(H - h, v.y)),
      };
    };

    const onMessage = (e) => {
      const p = e.data && e.data.bfPinch;
      if (!p) return;

      if (p.phase === 'start') {
        gestureRef.current = { d0: p.d || 1, c0: { x: p.cx, y: p.cy }, ...stateRef.current };
        return;
      }
      if (p.phase === 'end') {
        gestureRef.current = null;
        if (stateRef.current.z <= 1.02) {
          stateRef.current = { z: 1, x: 0, y: 0 };
          setView(stateRef.current);
        }
        return;
      }
      const g = gestureRef.current;
      if (!g || !p.d) return;

      // El punto del contenido bajo el centro de los dedos se mantiene fijo, y
      // el desplazamiento del centro arrastra la mesa.
      const z = Math.min(4, Math.max(1, g.z * (p.d / g.d0)));
      const s = baseScale;
      const next = clamp({
        z,
        x: g.x + g.c0.x * s * (g.z - z) + (p.cx - g.c0.x) * s * z,
        y: g.y + g.c0.y * s * (g.z - z) + (p.cy - g.c0.y) * s * z,
      });
      stateRef.current = next;
      setView(next);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [enabled, contentW, contentH, baseScale]);

  return view;
}