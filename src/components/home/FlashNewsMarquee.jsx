import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Radio, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getLang } from '@/lib/i18n';

// Cartel digital de "Actualidad": panel LED compacto tipo indicador de
// autopista/andén. Más ancho y con tipografía mayor; se ancla JUSTO DEBAJO del
// icono "Contacta con los Bizarros" del juego (no al fondo) y es arrastrable
// (la posición se guarda en sessionStorage). Las noticias las gestiona el
// admin desde la entidad FlashNews.
export default function FlashNewsMarquee({ mobScale = 1, isMobile = false, pinchZ = 1, pinchTx = 0, pinchTy = 0 }) {
  const [items, setItems] = useState([]);
  const [pos, setPos] = useState(null);
  const [closed, setClosed] = useState(() => { try { return sessionStorage.getItem('bfSignClosed') === '1'; } catch (e) { return false; } });
  const [enabled, setEnabled] = useState(true);
  const signRef = useRef(null);
  const drag = useRef(null);
  // Zoom de pellizco del juego (móvil/tablet): el cartel se amplía igual que el
  // contenido del iframe. pos se calcula sin zoom (z=1) y aquí se compone.
  const pz = pinchZ || 1;
  const pzRef = useRef(pz); pzRef.current = pz;

  // El juego se renderiza a 1200px de ancho dentro del iframe y se escala por
  // mobScale en móvil/tablet para la responsividad. El cartel vive fuera del
  // iframe, así que le aplicamos el MISMO scale para que se vea a la misma
  // escala que el resto de la pantalla (no a tamaño real del viewport).
  const scale = mobScale || 1;
  const MOB_W = 760; // ancho del cartel en coordenadas 1200 (escala igual que el juego)

  useEffect(() => {
    // Limpia posiciones guardadas por versiones anteriores. V6: en móvil/tablet
    // el cartel se ancla bajo los iconos del menú (no bajo "Contacta").
    try { if (!sessionStorage.getItem('bfSignPosV6')) { sessionStorage.removeItem('bfSignPos'); sessionStorage.removeItem('bfSignPosV5'); sessionStorage.removeItem('bfSignPosV4'); sessionStorage.removeItem('bfSignPosV3'); sessionStorage.removeItem('bfSignPosV2'); } sessionStorage.setItem('bfSignPosV6', '1'); } catch (e) {}
    base44.entities.FlashNews.filter({ active: true }, 'order', 100)
      .then((list) => setItems(list || []))
      .catch(() => setItems([]));
  }, []);

  // El admin puede desactivar el cartel entero desde el backoffice (HomeText
  // key 'flashnews_enabled' = '0'). Si está apagado, no se muestra en la home.
  useEffect(() => {
    base44.entities.HomeText.filter({ key: 'flashnews_enabled' }, 'key', 5)
      .then((list) => { if (list && list.length && list[0].value === '0') setEnabled(false); })
      .catch(() => {});
  }, []);

  function closeSign(e) {
    e.preventDefault(); e.stopPropagation();
    setClosed(true);
    try { sessionStorage.setItem('bfSignClosed', '1'); } catch (e) {}
  }

  // Oculta el cartel cuando hay un modal abierto en el juego (reglas, razas,
  // info de héroe…): no debe impedir la lectura del contenido del modal.
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    const check = () => {
      const iframe = document.querySelector('iframe');
      if (!iframe || !iframe.contentDocument) { setModalOpen(false); return; }
      const root = iframe.contentDocument.getElementById('modalRoot');
      if (!root) { setModalOpen(false); return; }
      setModalOpen(root.children.length > 0);
    };
    const iv = setInterval(check, 400);
    return () => clearInterval(iv);
  }, []);

  // Calcula la posición: debajo del icono "Contacta" del juego (dentro del
  // iframe), salvo que el usuario la haya arrastrado antes (sessionStorage).
  const computePos = useCallback(() => {
    if (!signRef.current) return;
    // Mientras hay zoom de pellizco, no recolocamos: la posición base (sin
    // zoom) ya está guardada y el transform del pellizco la amplía igual que
    // al juego. Recolocar aquí leería el ancla ya ampliada y descolocaría.
    if (pzRef.current !== 1) return;
    // El cartel se escala por `scale` (igual que el iframe del juego en móvil).
    // offsetWidth/Height son el tamaño CSS (sin escalar); el tamaño visual es
    // ese × scale. Posicionamos en coordenadas de viewport (visuales).
    const visualW = signRef.current.offsetWidth * scale;
    const visualH = signRef.current.offsetHeight * scale;
    if (!isMobile) {
      try {
        const stored = JSON.parse(sessionStorage.getItem('bfSignPos') || 'null');
        if (stored) {
          const maxX = Math.max(0, window.innerWidth - visualW - 4);
          const maxY = Math.max(0, window.innerHeight - visualH - 4);
          setPos({ left: Math.max(4, Math.min(maxX, stored.left)), top: Math.max(4, Math.min(maxY, stored.top)) });
          return;
        }
      } catch (e) {}
    }
    // Posición por defecto: debajo de los iconos del menú (Aprende/Reglas/
    // Razas/Top Ranking) del juego en coordenadas de pantalla. En móvil/tablet
    // el bloque "Contacta" queda en otro sitio, así que anclamos al menú
    // (igual que se ve en escritorio, donde el menú y el cartel quedan juntos).
    // En escritorio se sigue el bloque "Contacta" (que ahí sí está bien).
    const maxTop = Math.max(0, window.innerHeight - visualH - 4);
    let anchorBottom = 0;
    const iframe = document.querySelector('iframe');
    if (iframe) {
      const doc = iframe.contentDocument;
      const ir = iframe.getBoundingClientRect();
      const contentH = (doc.documentElement && doc.documentElement.clientHeight) || ir.height || 1;
      const iframeScale = ir.height / contentH;
      // Ancla bajo los iconos del menú (Aprende/Reglas/Razas/Top Ranking) en
      // todos los dispositivos: el cartel va ENTRE el menú y el botón de
      // contacto, que se empuja hacia abajo con margin-top (CONTACT_REPOSITION).
      const sel = '#s-title .title-links';
      const anchor = doc && doc.querySelector(sel);
      if (anchor) {
        anchorBottom = ir.top + anchor.getBoundingClientRect().bottom * iframeScale;
      }
    }
    const desired = anchorBottom > 0 ? anchorBottom + 4 : maxTop;
    const top = Math.max(4, Math.min(maxTop, desired));
    if (isMobile) {
      // En móvil/tablet el cartel se ancla por su centro CSS: left = (viewport - MOB_W)/2
      // para que, al escalar con el pellizco desde 'top center', crezca simétrico
      // sin desplazarse lateralmente (igual que el icono del Oráculo).
      setPos({ left: Math.round((window.innerWidth - MOB_W) / 2), top: Math.round(top) });
    } else {
      const maxX = Math.max(0, window.innerWidth - visualW - 4);
      setPos({ left: Math.max(4, Math.min(maxX, Math.round((window.innerWidth - visualW) / 2))), top: Math.round(top) });
    }
  }, [scale, isMobile]);

  // Recoloca al montar/cambiar noticias y al rotar; repite unas veces hasta
  // que el icono "Contacta" del juego aparezca (carga asíncrona del iframe).
  // En móvil/tablet: calcula la posición UNA vez y la congela (cartel fijo).
  useEffect(() => {
    computePos();
    if (isMobile) {
      let n = 0;
      const poll = setInterval(() => { computePos(); if (++n > 3) clearInterval(poll); }, 600);
      return () => clearInterval(poll);
    }
    const onResize = () => computePos();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(computePos, 300));
    let n = 0;
    const poll = setInterval(() => { computePos(); if (++n > 14) clearInterval(poll); }, 800);
    return () => { window.removeEventListener('resize', onResize); clearInterval(poll); };
  }, [computePos, items, isMobile]);

  // Arrastrar (mouse + tactil) — solo en escritorio. En móvil/tablet el
  // cartel es FIJO: no se arrastra, solo adapta su tamaño con el pellizco.
  useEffect(() => {
    if (isMobile) return;
    function point(e) { return e.touches && e.touches[0] ? e.touches[0] : e; }
    function onMove(e) {
      if (!drag.current || !signRef.current) return;
      const p = point(e);
      const w = signRef.current.offsetWidth * scale, h = signRef.current.offsetHeight * scale;
      const maxX = Math.max(0, window.innerWidth - w - 4);
      const maxY = Math.max(0, window.innerHeight - h - 4);
      setPos({ left: Math.max(4, Math.min(maxX, p.clientX - drag.current.sx)), top: Math.max(4, Math.min(maxY, p.clientY - drag.current.sy)) });
      e.preventDefault();
    }
    function onUp() {
      if (!drag.current) return;
      drag.current = null;
      if (pos) { try { sessionStorage.setItem('bfSignPos', JSON.stringify(pos)); } catch (e) {} }
      signRef.current && (signRef.current.style.transition = '');
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    };
  }, [pos, scale]);

  function startDrag(e) {
    if (e.target && e.target.closest && e.target.closest('a')) return;
    const p = e.touches && e.touches[0] ? e.touches[0] : e;
    drag.current = { sx: p.clientX - (pos ? pos.left : 0), sy: p.clientY - (pos ? pos.top : 0) };
    if (signRef.current) signRef.current.style.transition = 'none';
    e.preventDefault();
    e.stopPropagation();
  }

  if (!items.length || closed || !enabled || modalOpen) return null;
  const isEn = getLang() === 'en';
  const label = isEn ? 'NEWS' : 'ACTUALIDAD';
  const joined = items.map((i) => (isEn ? (i.text_en || i.text) : i.text)).join('      ◆      ');

  // El cartel se escala por `scale` (igual que el juego en móvil) con origen
  // arriba-izquierda: su esquina superior izquierda queda en (left, top) y el
  // contenido crece desde ahí, igual que el iframe del juego.
  // Transform base (sin zoom de pellizco): escala igual que el iframe del juego.
  // Con pellizco (pz>1): translada y escala igual que el body del juego, de
  // modo que el cartel crece desde su ancla a la vez que el contenido del iframe.
  // Móvil/tablet: el cartel es FIJO — solo escala su tamaño con el pellizco
  // (sin translación, la posición top-left no se mueve). Escritorio: arrastre
  // + zoom con translación como antes.
  const baseTransform = `scale(${scale})`;
  const mobileTransform = `scale(${scale * pz})`;
  const zoomedTransform = pos
    ? `translate(${(pinchTx || 0) * scale + (pz - 1) * pos.left}px, ${(pinchTy || 0) * scale + (pz - 1) * pos.top}px) scale(${pz * scale})`
    : baseTransform;
  const baseStyle = {
    ...(isMobile ? {} : { touchAction: 'none', cursor: 'grab' }),
    transform: isMobile ? mobileTransform : (pz !== 1 ? zoomedTransform : baseTransform),
    transformOrigin: isMobile ? 'top center' : 'top left',
    ...(scale < 1 ? { width: MOB_W, maxWidth: 'none' } : {}),
  };
  const style = pos ? { ...baseStyle, left: pos.left, top: pos.top, right: 'auto', bottom: 'auto' } : baseStyle;

  return (
    <div
      ref={signRef}
      onPointerDown={isMobile ? undefined : startDrag}
      style={style}
      className="bf-led-sign pointer-events-auto fixed z-40 w-[86vw] max-w-[560px] overflow-hidden rounded-2xl border border-[#ffd24a]/55 bg-[#0a0700] px-3 py-1 shadow-[0_8px_28px_rgba(0,0,0,.7),0_0_20px_rgba(255,210,74,.28)] lg:max-w-[760px] lg:px-4 lg:py-2.5"
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#ffd24a] to-transparent opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-[#9a6b00] to-transparent opacity-70" />
      <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />
      <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />
      <span className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />
      <span className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />

      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onClick={closeSign}
        aria-label={isEn ? 'Close' : 'Cerrar'}
        className="absolute top-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#ffd24a]/80 bg-[#1a1300] text-[#ffd24a] shadow-[0_2px_10px_rgba(0,0,0,.8)] transition-colors hover:bg-[#ffd24a] hover:text-[#3a2600]"
      >
        <X className="h-3.5 w-3.5" strokeWidth={3} />
      </button>

      <div className="relative flex items-center gap-2 lg:gap-3">
        <div
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#ffd24a]/45 bg-[#1a1300] px-2 py-0.5 lg:px-2.5 lg:py-1.5"
          style={{ animation: 'bfMarqueeBadgePulse 2.2s ease-in-out infinite' }}
        >
          <Radio className="h-3.5 w-3.5 text-[#ffd24a] lg:h-4 lg:w-4" />
          <span className="font-heading text-[11px] font-black tracking-[0.22em] text-[#ffd24a] lg:text-[13px]">{label}</span>
        </div>
        <div className="bf-led-screen relative min-w-0 flex-1 overflow-hidden rounded-md">
          <div className="bf-marquee-track whitespace-nowrap">
            <span className="bf-led-text">{joined}</span>
            <span className="bf-led-sep"> ◆ </span>
            <span className="bf-led-text">{joined}</span>
            <span className="bf-led-sep"> ◆ </span>
          </div>
        </div>
      </div>
    </div>
  );
}