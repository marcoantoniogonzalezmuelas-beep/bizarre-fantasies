import { useRef, useState, useCallback } from 'react';

// Hook mínimo para arrastrar un elemento flotante con ratón o dedo.
// Devuelve el desplazamiento acumulado (x, y), los handlers que hay que poner
// en la zona arrastrable y `moved` para distinguir un arrastre de un clic.
export default function useDragOffset() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const start = useRef(null);
  const movedRef = useRef(false);

  const onPointerDown = useCallback((e) => {
    if (e.button != null && e.button !== 0) return;
    start.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
    movedRef.current = false;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch (err) {}
  }, [offset.x, offset.y]);

  const onPointerMove = useCallback((e) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.px;
    const dy = e.clientY - start.current.py;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
    setOffset({ x: start.current.ox + dx, y: start.current.oy + dy });
  }, []);

  const onPointerUp = useCallback(() => { start.current = null; }, []);

  return {
    offset,
    didDrag: () => movedRef.current,
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}