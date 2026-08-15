// Recorte de fondo OPACO para las cinemáticas 3D (juego y vista previa del
// editor). Solo se vuelve transparente el fondo oscuro CONECTADO AL BORDE de
// la imagen (relleno desde los bordes) y siempre a alfa 0 o 255: nunca se
// aplica alfa parcial, así el personaje jamás se ve translúcido.
const cache = new Map();

function run(url, done) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      const W = c.width, H = c.height;
      const d = x.getImageData(0, 0, W, H), p = d.data;
      const BG = 30;
      const seen = new Uint8Array(W * H), q = new Int32Array(W * H);
      let qs = 0, qe = 0;
      const lum = (i) => { const o = i * 4; return Math.max(p[o], p[o + 1], p[o + 2]); };
      const push = (i) => { if (!seen[i] && lum(i) < BG) { seen[i] = 1; q[qe++] = i; } };
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
      // Encaja el lienzo a la silueta recortada.
      let minX = W, minY = H, maxX = -1, maxY = -1;
      for (let ay = 0; ay < H; ay++) for (let ax = 0; ax < W; ax++) {
        if (p[(ay * W + ax) * 4 + 3] > 8) {
          if (ax < minX) minX = ax; if (ay < minY) minY = ay;
          if (ax > maxX) maxX = ax; if (ay > maxY) maxY = ay;
        }
      }
      if (maxX < 0) { cache.set(url, url); done(url); return; }
      x.putImageData(d, 0, 0);
      const pad = 3;
      const l = Math.max(0, minX - pad), t = Math.max(0, minY - pad);
      const r = Math.min(W, maxX + pad + 1), b = Math.min(H, maxY + pad + 1);
      const out = document.createElement('canvas');
      out.width = r - l; out.height = b - t;
      out.getContext('2d').drawImage(c, l, t, r - l, b - t, 0, 0, r - l, b - t);
      const res = out.toDataURL('image/png');
      cache.set(url, res); done(res);
    } catch (e) { cache.set(url, url); done(url); }
  };
  img.onerror = () => { cache.set(url, url); done(url); };
  img.src = url;
}

export function cutoutOpaque(url, done) {
  if (!url) return;
  if (cache.has(url)) { done(cache.get(url)); return; }
  run(url, done);
}