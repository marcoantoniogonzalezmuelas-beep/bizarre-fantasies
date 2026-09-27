import { useEffect } from 'react';

// Pellizco con dos dedos dentro del overlay de misiones (la portada bloquea el
// zoom nativo). Usa CSS zoom sobre el contenido para que el scroll siga
// funcionando con un dedo; el punto entre los dedos queda fijo (no salta arriba).
export default function useMissionPinch(ref) {
  useEffect(() => {
    const el = ref.current;
    const scroller = el?.parentElement;
    if (!el || !scroller) return;
    let z = Number(el.style.zoom) || 1, start = null;
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const mid = t => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
    const onStart = e => { if (e.touches.length === 2) start = { d: dist(e.touches), z }; };
    const onMove = e => {
      if (!start || e.touches.length !== 2) return;
      e.preventDefault();
      const next = Math.max(1, Math.min(3, start.z * dist(e.touches) / start.d));
      const ratio = next / z, m = mid(e.touches);
      const top = scroller.scrollTop, left = scroller.scrollLeft;
      z = next;
      el.style.zoom = String(z);
      scroller.scrollTop = (top + m.y) * ratio - m.y;
      scroller.scrollLeft = (left + m.x) * ratio - m.x;
    };
    const onEnd = e => { if (e.touches.length < 2) start = null; if (z < 1.05) { z = 1; el.style.zoom = ''; } };
    scroller.addEventListener('touchstart', onStart, { passive: true });
    scroller.addEventListener('touchmove', onMove, { passive: false });
    scroller.addEventListener('touchend', onEnd);
    return () => { scroller.removeEventListener('touchstart', onStart); scroller.removeEventListener('touchmove', onMove); scroller.removeEventListener('touchend', onEnd); };
  });
}