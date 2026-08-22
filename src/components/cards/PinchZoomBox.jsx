import React, { useRef, useState } from 'react';

// Caja con pellizco propio: en móvil el zoom se aplica SOLO a su contenido
// (la carta ampliada), no a la página del fondo. Un doble toque restablece.
export default function PinchZoomBox({ children, className = '', style }) {
  const [z, setZ] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const st = useRef(null);

  const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      st.current = { d: dist(e.touches), z, mode: 'pinch' };
    } else if (e.touches.length === 1 && z > 1) {
      st.current = { x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y, mode: 'pan' };
    }
  };

  const onTouchMove = (e) => {
    const s = st.current;
    if (!s) return;
    if (s.mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault();
      setZ(Math.max(1, Math.min(4, s.z * (dist(e.touches) / s.d))));
    } else if (s.mode === 'pan' && e.touches.length === 1) {
      e.preventDefault();
      setPos({ x: e.touches[0].clientX - s.x, y: e.touches[0].clientY - s.y });
    }
  };

  const onTouchEnd = () => {
    st.current = null;
    if (z <= 1.02) { setZ(1); setPos({ x: 0, y: 0 }); }
  };

  return (
    <div
      className={className}
      style={{
        ...style,
        touchAction: 'none',
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${z})`,
        transformOrigin: 'center center',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onDoubleClick={() => { setZ(1); setPos({ x: 0, y: 0 }); }}
    >
      {children}
    </div>
  );
}