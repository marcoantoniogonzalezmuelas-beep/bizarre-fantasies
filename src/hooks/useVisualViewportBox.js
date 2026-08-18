import { useEffect, useState } from 'react';

// Devuelve un estilo que cubre EXACTAMENTE el área que el usuario está viendo.
// Con zoom de pellizco del navegador, un overlay `position:fixed` se coloca
// respecto al viewport de maquetación y queda descentrado o fuera de pantalla.
// Usando visualViewport (posición, tamaño y escala reales) el modal aparece
// siempre centrado en lo que el usuario ve, sin tener que hacer scroll.
export default function useVisualViewportBox() {
  const [box, setBox] = useState(null);

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    const update = () => setBox({ x: vv.offsetLeft, y: vv.offsetTop, w: vv.width, h: vv.height });
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  if (!box) return {};
  return {
    position: 'fixed',
    inset: 'auto',
    left: 0,
    top: 0,
    width: box.w,
    height: box.h,
    transform: `translate(${box.x}px, ${box.y}px)`,
    transformOrigin: '0 0',
  };
}