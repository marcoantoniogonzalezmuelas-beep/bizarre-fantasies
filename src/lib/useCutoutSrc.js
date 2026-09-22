import { useEffect, useState } from 'react';

// Recorta el fondo oscuro de las imágenes de animación (ability_anim) usando un
// canvas: los píxeles muy oscuros se vuelven transparentes y los intermedios se
// difuminan, de modo que SOLO queda la criatura/personaje sobre el fondo negro
// de la pantalla (sin rectángulo gris de fondo ni costura). El resultado se
// cachea por URL para que sólo se procese una vez por imagen.
const cache = new Map();
const pending = new Map();

function process(url, done, flying = false) {
  const key = flying ? `flying:${url}` : url;
  if (cache.has(key)) { done(cache.get(key)); return; }
  if (pending.has(key)) { pending.get(key).push(done); return; }
  pending.set(key, [done]);
  const finish = (out) => {
    cache.set(key, out);
    const listeners = pending.get(key) || [];
    pending.delete(key);
    listeners.forEach(listener => listener(out));
  };
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const W = c.width, H = c.height;
      const d = x.getImageData(0, 0, W, H); const p = d.data;
      // Distancia de color + relleno desde los bordes: recorta el fondo oscuro
      // conectado al marco, sin comerse las ropas oscuras del personaje. Se
      // muestrea el color real del fondo desde los bordes (no solo negro puro).
      let bgR = 0, bgG = 0, bgB = 0, bgN = 0;
      const sPts = [[0,0],[W-1,0],[0,H-1],[W-1,H-1],[W>>1,0],[W>>1,H-1],[0,H>>1],[W-1,H>>1]];
      for (const [sxx, syy] of sPts) {
        for (let dx = -3; dx <= 3; dx++) for (let dy = -3; dy <= 3; dy++) {
          const px = Math.max(0, Math.min(W - 1, sxx + dx)), py = Math.max(0, Math.min(H - 1, syy + dy));
          const oo = (py * W + px) * 4; bgR += p[oo]; bgG += p[oo + 1]; bgB += p[oo + 2]; bgN++;
        }
      }
      bgR /= bgN; bgG /= bgN; bgB /= bgN;
      const TOL = 58, TOL2 = TOL * TOL;
      const seen = new Uint8Array(W * H), q = new Int32Array(W * H);
      let qs = 0, qe = 0;
      const bgDist = (i) => { const o = i * 4; const dr = p[o] - bgR, dg = p[o + 1] - bgG, db = p[o + 2] - bgB; return dr * dr + dg * dg + db * db; };
      const push = (i) => { if (!seen[i] && bgDist(i) < TOL2) { seen[i] = 1; q[qe++] = i; } };
      for (let xx = 0; xx < W; xx++) { push(xx); push((H - 1) * W + xx); }
      for (let yy = 0; yy < H; yy++) { push(yy * W); push(yy * W + W - 1); }
      while (qs < qe) {
        const i0 = q[qs++], cx = i0 % W, cy = (i0 - cx) / W;
        p[i0 * 4 + 3] = 0;
        if (cx > 0) push(i0 - 1);
        if (cx < W - 1) push(i0 + 1);
        if (cy > 0) push(i0 - W);
        if (cy < H - 1) push(i0 + W);
      }
      // Los accesorios que vuelan suelen traer un fondo oscuro aislado dentro
      // del marco: el relleno desde los bordes no lo alcanza. Atenuamos esos
      // píxeles también, sin alterar el recorte de los héroes de fondo.
      if (flying) {
        for (let o = 0; o < p.length; o += 4) {
          const brightness = Math.max(p[o], p[o + 1], p[o + 2]);
          p[o + 3] = Math.round(p[o + 3] * Math.min(1, Math.max(0, (brightness - 50) / 90)));
        }
      }
      // Un recorte vacío no debe sustituir a la figura original.
      if (!p.some((value, index) => index % 4 === 3 && value > 8)) { finish(url); return; }
      x.putImageData(d, 0, 0);
      const out = c.toDataURL('image/png');
      const decoded = new Image();
      decoded.onload = () => finish(out);
      decoded.onerror = () => finish(url);
      decoded.src = out;
    } catch (e) { finish(url); }
  };
  img.onerror = () => finish(url);
  img.src = url;
}

// Variante que recorta fondos CLAROS (blanco/gris claro) en lugar de oscuros.
// Útil para imágenes generadas que salen con fondo blanco en lugar de negro.
const cacheLight = new Map();
function processLight(url, done) {
  if (cacheLight.has(url)) { done(cacheLight.get(url)); return; }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height); const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const mn = Math.min(p[i], p[i + 1], p[i + 2]);
        if (mn > 232) p[i + 3] = 0;
      }
      x.putImageData(d, 0, 0);
      const out = c.toDataURL('image/png');
      cacheLight.set(url, out); done(out);
    } catch (e) { cacheLight.set(url, url); done(url); }
  };
  img.onerror = () => { cacheLight.set(url, url); done(url); };
  img.src = url;
}

export function useLightCutoutSrc(url) {
  const [src, setSrc] = useState(() => cacheLight.get(url) || null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    processLight(url, (out) => { if (!cancelled) setSrc(out); });
    return () => { cancelled = true; };
  }, [url]);
  return src;
}

export function preloadCutout(url) {
  if (!url || cache.has(url)) return;
  process(url, () => {});
}

export function useCutoutSrc(url, flying = false) {
  const key = flying ? `flying:${url}` : url;
  const [result, setResult] = useState(() => ({ key, src: cache.get(key) || (flying ? null : url) }));
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    process(url, (out) => { if (!cancelled) setResult({ key, src: out }); }, flying);
    return () => { cancelled = true; };
  }, [url, flying, key]);
  // Los héroes conservan su carga inmediata. Los accesorios voladores esperan
  // al recorte para que nunca se muestre su fondo cuadrado original.
  return url ? (result.key === key ? result.src : cache.get(key) || (flying ? null : url)) : null;
}