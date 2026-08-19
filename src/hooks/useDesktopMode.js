import { useEffect, useState } from 'react';

const UA = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
const IS_TABLET = /iPad/i.test(UA) || (/Macintosh|Mac OS/i.test(UA) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1) || (/Android/i.test(UA) && !/Mobile/i.test(UA));
const IS_MOBILE = IS_TABLET || /Android|iPhone|iPod|Mobile/i.test(UA) || (typeof window !== 'undefined' && Math.min(window.screen.width || 9999, window.screen.height || 9999) <= 1024);

// Modo escritorio en móvil/tablet: la página se maqueta a un ancho fijo de PC
// (1280px) y se encoge con CSS `zoom` para que quepa entera en la pantalla,
// igual que hace el juego. Devuelve el factor de escala (1 en escritorio).
export default function useDesktopMode(designWidth = 1280) {
  const [scale, setScale] = useState(() => {
    if (!IS_MOBILE) return 1;
    return Math.min(1, (document.documentElement.clientWidth || 360) / designWidth);
  });

  useEffect(() => {
    if (!IS_MOBILE) return;
    const calc = () => setScale(Math.min(1, (document.documentElement.clientWidth || 360) / designWidth));
    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('orientationchange', calc);
    return () => { window.removeEventListener('resize', calc); window.removeEventListener('orientationchange', calc); };
  }, [designWidth]);

  return IS_MOBILE ? scale : 1;
}