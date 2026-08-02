import { useEffect, useState } from 'react';

// Recorta el fondo oscuro de las imágenes de animación (ability_anim) usando un
// canvas: los píxeles muy oscuros se vuelven transparentes y los intermedios se
// difuminan, de modo que SOLO queda la criatura/personaje sobre el fondo negro
// de la pantalla (sin rectángulo gris de fondo ni costura). El resultado se
// cachea por URL para que sólo se procese una vez por imagen.
const cache = new Map();

function process(url, done) {
  if (cache.has(url)) { done(cache.get(url)); return; }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height); const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const m = Math.max(p[i], p[i + 1], p[i + 2]);
        if (m < 44) p[i + 3] = 0;
        else if (m < 115) p[i + 3] = Math.round(p[i + 3] * (m - 44) / 71);
      }
      x.putImageData(d, 0, 0);
      const out = c.toDataURL('image/png');
      cache.set(url, out); done(out);
    } catch (e) { cache.set(url, url); done(url); }
  };
  img.onerror = () => { cache.set(url, url); done(url); };
  img.src = url;
}

export function preloadCutout(url) {
  if (!url || cache.has(url)) return;
  process(url, () => {});
}

export function useCutoutSrc(url) {
  const [src, setSrc] = useState(() => cache.get(url) || null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    process(url, (out) => { if (!cancelled) setSrc(out); });
    return () => { cancelled = true; };
  }, [url]);
  return src;
}