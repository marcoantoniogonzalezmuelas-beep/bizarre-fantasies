import { useEffect } from 'react';

// En móvil/tablet, trata la página como un escritorio de PC: la renderiza a
// ancho de escritorio (para que activen los grids/columnas `lg`/`xl`) y añade
// zoom de pellizco (pinch) sobre el body, igual que el resto del juego (que
// vive en el iframe y usa el mismo sistema). Al abrir un modal/overlay fijo
// se reencuadra a x1 para que el modal se vea correctamente (con el body
// transformado, los position:fixed se descuadran).
//
// - Pellizcar con 2 dedos: acercar/alejar (desde "ajuste a pantalla" hasta x4).
// - Mover los 2 dedos: desplazarse por la página mientras hay zoom.
// - Al soltar cerca del ajuste mínimo, se reencuadra sola a pantalla completa.
// - Un dedo sigue funcionando normal (scroll nativo, botones, etc.).
export function useDesktopZoom(minWidth = 1024) {
  useEffect(() => {
    if (window.matchMedia('(min-width: 1025px)').matches) return;
    if (window.__bfPagePinch) return;
    window.__bfPagePinch = true;

    const html = document.documentElement;
    html.style.minWidth = minWidth + 'px';
    html.classList.add('bf-dz');

    // Ajuste inicial: toda la página de escritorio cabe en pantalla.
    const zMin = Math.min(1, window.innerWidth / minWidth);
    const zMax = 4;
    let z = zMin, tx = 0, ty = 0, pinch = null;

    function apply() {
      const b = document.body;
      b.style.transformOrigin = '0 0';
      b.style.transform = (z === 1 && !tx && !ty) ? '' : `translate(${tx}px,${ty}px) scale(${z})`;
      try { window.parent.postMessage({ bfPinch: { z, tx, ty } }, '*'); } catch (e) {}
    }
    function clampT() {
      const W = window.innerWidth, H = window.innerHeight;
      tx = Math.min(0, Math.max(W - W * z, tx));
      ty = Math.min(0, Math.max(H - H * z, ty));
    }
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const mid = (t) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });

    function onStart(e) {
      if (e.touches.length !== 2) return;
      e.preventDefault(); e.stopPropagation();
      document.body.style.transition = 'none';
      pinch = { d0: dist(e.touches), c0: mid(e.touches), z0: z, tx0: tx, ty0: ty };
    }
    function onMove(e) {
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault(); e.stopPropagation();
      const d = dist(e.touches), c = mid(e.touches);
      z = Math.min(zMax, Math.max(zMin, pinch.z0 * (d / pinch.d0)));
      const px = (pinch.c0.x - pinch.tx0) / pinch.z0;
      const py = (pinch.c0.y - pinch.ty0) / pinch.z0;
      tx = c.x - px * z; ty = c.y - py * z;
      clampT(); apply();
    }
    function onEnd(e) {
      if (!pinch) return;
      if (e.touches.length < 2) {
        pinch = null;
        const b = document.body;
        b.style.transition = 'transform .26s cubic-bezier(.2,.8,.3,1)';
        if (z < zMin + 0.02) { z = zMin; tx = 0; ty = 0; apply(); }
        setTimeout(() => { b.style.transition = ''; }, 300);
      }
    }
    function resetZoom() {
      if (z === 1 && !tx && !ty) return;
      const b = document.body;
      b.style.transition = 'transform .22s ease';
      z = 1; tx = 0; ty = 0; apply();
      setTimeout(() => { b.style.transition = ''; }, 260);
    }
    window.__bfPagePinchReset = resetZoom;

    // Reencuadrar a x1 cuando aparezca un overlay/modal fijo (igual que el
    // juego hace con los `.mo`): con el body transformado, los position:fixed
    // se posicionan respecto al body escalado y quedan fuera de pantalla.
    const isOverlay = (n) => {
      if (!n || n.nodeType !== 1) return false;
      if (n.classList && n.classList.contains('bf-zoom-modal')) return true;
      if (n.querySelector && n.querySelector('.bf-zoom-modal')) return true;
      try { const st = getComputedStyle(n); return st.position === 'fixed' && parseInt(st.zIndex || '0', 10) >= 1000; } catch (e) { return false; }
    };
    const mo = new MutationObserver((muts) => {
      for (let i = 0; i < muts.length; i++) {
        const added = muts[i].addedNodes;
        for (let j = 0; j < added.length; j++) {
          if (isOverlay(added[j])) { resetZoom(); return; }
        }
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener('touchstart', onStart, { capture: true, passive: false });
    document.addEventListener('touchmove', onMove, { capture: true, passive: false });
    document.addEventListener('touchend', onEnd, { capture: true, passive: false });
    document.addEventListener('touchcancel', onEnd, { capture: true, passive: false });

    const onResize = () => {
      if (window.matchMedia('(min-width: 1025px)').matches) { z = 1; tx = 0; ty = 0; apply(); }
    };
    window.addEventListener('resize', onResize);

    apply();

    return () => {
      window.__bfPagePinch = false;
      try { delete window.__bfPagePinchReset; } catch (e) { window.__bfPagePinchReset = undefined; }
      html.style.minWidth = '';
      html.classList.remove('bf-dz');
      const b = document.body;
      b.style.transform = ''; b.style.transformOrigin = ''; b.style.transition = '';
      mo.disconnect();
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
      window.removeEventListener('resize', onResize);
    };
  }, [minWidth]);
}