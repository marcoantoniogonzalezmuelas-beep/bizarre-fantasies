import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Radio, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getLang } from '@/lib/i18n';

// Cartel digital de "Actualidad": panel LED compacto tipo indicador de
// autopista/andén. Más ancho y con tipografía mayor; se ancla JUSTO DEBAJO del
// icono "Contacta con los Bizarros" del juego (no al fondo) y es arrastrable
// (la posición se guarda en sessionStorage). Las noticias las gestiona el
// admin desde la entidad FlashNews.
export default function FlashNewsMarquee() {
  const [items, setItems] = useState([]);
  const [pos, setPos] = useState(null);
  const [closed, setClosed] = useState(() => { try { return sessionStorage.getItem('bfSignClosed') === '1'; } catch (e) { return false; } });
  const [enabled, setEnabled] = useState(true);
  const signRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    // Limpia posiciones guardadas por versiones anteriores del cartel (que lo
    // anclaba al fondo); así recalcula la posición correcta bajo el logo/contacto.
    try { if (!sessionStorage.getItem('bfSignPosV2')) sessionStorage.removeItem('bfSignPos'); sessionStorage.setItem('bfSignPosV2', '1'); } catch (e) {}
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

  // Calcula la posición: debajo del icono "Contacta" del juego (dentro del
  // iframe), salvo que el usuario la haya arrastrado antes (sessionStorage).
  const computePos = useCallback(() => {
    if (!signRef.current) return;
    const w = signRef.current.offsetWidth || 760;
    const h = signRef.current.offsetHeight || 58;
    try {
      const stored = JSON.parse(sessionStorage.getItem('bfSignPos') || 'null');
      if (stored) {
        const maxX = Math.max(0, window.innerWidth - w - 4);
        const maxY = Math.max(0, window.innerHeight - h - 4);
        setPos({ left: Math.max(4, Math.min(maxX, stored.left)), top: Math.max(4, Math.min(maxY, stored.top)) });
        return;
      }
    } catch (e) {}
    let top = window.innerHeight - h - 12;
    const iframe = document.querySelector('iframe');
    if (iframe) {
      const doc = iframe.contentDocument;
      const ir = iframe.getBoundingClientRect();
      const contentH = (doc.documentElement && doc.documentElement.clientHeight) || ir.height || 1;
      const scale = ir.height / contentH;
      // Mismo sitio en móvil, tablet y escritorio: debajo del icono
      // "Contacta con los Bizarros" del juego.
      const anchor = doc && doc.querySelector('#bf-contact .bf-contact-pill');
      if (anchor) {
        top = ir.top + anchor.getBoundingClientRect().bottom * scale + 8;
      }
    }
    const maxX = Math.max(0, window.innerWidth - w - 4);
    setPos({ left: Math.max(4, Math.min(maxX, Math.round((window.innerWidth - w) / 2))), top: Math.max(4, Math.round(top)) });
  }, []);

  // Recoloca al montar/cambiar noticias y al rotar; repite unas veces hasta
  // que el icono "Contacta" del juego aparezca (carga asíncrona del iframe).
  useEffect(() => {
    computePos();
    const onResize = () => computePos();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(computePos, 300));
    let n = 0;
    const poll = setInterval(() => { computePos(); if (++n > 14) clearInterval(poll); }, 800);
    return () => { window.removeEventListener('resize', onResize); clearInterval(poll); };
  }, [computePos, items]);

  // Arrastrar (mouse + tactil)
  useEffect(() => {
    function point(e) { return e.touches && e.touches[0] ? e.touches[0] : e; }
    function onMove(e) {
      if (!drag.current || !signRef.current) return;
      const p = point(e);
      const w = signRef.current.offsetWidth, h = signRef.current.offsetHeight;
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
  }, [pos]);

  function startDrag(e) {
    if (e.target && e.target.closest && e.target.closest('a')) return;
    const p = e.touches && e.touches[0] ? e.touches[0] : e;
    drag.current = { sx: p.clientX - (pos ? pos.left : 0), sy: p.clientY - (pos ? pos.top : 0) };
    if (signRef.current) signRef.current.style.transition = 'none';
    e.preventDefault();
    e.stopPropagation();
  }

  if (!items.length || closed || !enabled) return null;
  const isEn = getLang() === 'en';
  const label = isEn ? 'NEWS' : 'ACTUALIDAD';
  const joined = items.map((i) => (isEn ? (i.text_en || i.text) : i.text)).join('      ◆      ');

  const style = pos ? { left: pos.left, top: pos.top, right: 'auto', bottom: 'auto', transform: 'none' } : undefined;

  return (
    <div
      ref={signRef}
      onPointerDown={startDrag}
      style={{ ...style, touchAction: 'none', cursor: 'grab' }}
      className="bf-led-sign pointer-events-auto absolute z-40 w-[94vw] max-w-[860px] overflow-hidden rounded-2xl border border-[#ffd24a]/55 bg-[#0a0700] px-3 py-1 shadow-[0_8px_28px_rgba(0,0,0,.7),0_0_20px_rgba(255,210,74,.28)] lg:px-4 lg:py-2.5"
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