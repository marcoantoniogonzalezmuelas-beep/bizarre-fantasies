import { useEffect } from 'react';

// Pellizco con dos dedos dentro del overlay de misiones (la portada bloquea el
// zoom nativo). Usa CSS zoom sobre el contenido para que el scroll siga
// funcionando con un dedo a cualquier nivel de ampliación (x1–x3).
export default function useMissionPinch(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let z = Number(el.style.zoom) || 1, start = null;
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onStart = e => { if (e.touches.length === 2) start = { d: dist(e.touches), z }; };
    const onMove = e => {
      if (!start || e.touches.length !== 2) return;
      e.preventDefault();
      z = Math.max(1, Math.min(3, start.z * dist(e.touches) / start.d));
      el.style.zoom = String(z);
    };
    const onEnd = e => { if (e.touches.length < 2) start = null; if (z < 1.05) { z = 1; el.style.zoom = ''; } };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd); };
  });
}