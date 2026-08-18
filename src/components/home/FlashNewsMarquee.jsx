import React, { useEffect, useRef, useState } from 'react';
import { Radio, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getLang } from '@/lib/i18n';

// Cartel digital de "Actualidad": FIJO en su posición (debajo del título del
// juego), igual que en escritorio. No flota ni se mueve con el pellizco: solo
// se amplía/reduce con el zoom nativo del navegador, igual que los botones del
// Oráculo, Reglas y Razas. Las noticias las gestiona el admin (entidad FlashNews).
export default function FlashNewsMarquee({ mobScale = 1 }) {
  const [items, setItems] = useState([]);
  const [closed, setClosed] = useState(() => { try { return sessionStorage.getItem('bfSignClosed') === '1'; } catch (e) { return false; } });
  const [enabled, setEnabled] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [topY, setTopY] = useState(null);
  const mobScaleRef = useRef(mobScale);
  useEffect(() => { mobScaleRef.current = mobScale; }, [mobScale]);

  // Mide la posición del título del juego dentro del iframe para sentar el
  // cartel justo debajo. En móvil/tablet el iframe lleva `zoom: mobScale`, así
  // que las coordenadas internas se multiplican por mobScale para obtener la
  // posición visual real en el viewport.
  useEffect(() => {
    const measure = () => {
      const iframe = document.querySelector('iframe');
      const doc = iframe?.contentDocument;
      const links = doc?.querySelector('.title-links');
      if (!links) return;
      const r = links.getBoundingClientRect();
      setTopY((r.bottom + 14) * mobScaleRef.current);
    };
    measure();
    const iv = setInterval(measure, 500);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', () => setTimeout(measure, 300));
    return () => { clearInterval(iv); window.removeEventListener('resize', measure); };
  }, []);

  useEffect(() => {
    base44.entities.FlashNews.filter({ active: true }, 'order', 100)
      .then((list) => setItems(list || []))
      .catch(() => setItems([]));
  }, []);

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

  // Oculta el cartel cuando hay un modal abierto en el juego.
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

  if (!items.length || closed || !enabled || modalOpen || topY == null) return null;
  const isEn = getLang() === 'en';
  const label = isEn ? 'NEWS' : 'ACTUALIDAD';
  const joined = items.map((i) => (isEn ? (i.text_en || i.text) : i.text)).join('      ◆      ');

  return (
    <div
      style={{ position: 'fixed', left: '50%', top: topY, transform: 'translateX(-50%)' }}
      className="bf-home-flash bf-led-sign pointer-events-auto z-40 w-[86vw] max-w-[560px] overflow-hidden rounded-2xl border border-[#ffd24a]/55 bg-[#0a0700] px-3 py-1 shadow-[0_8px_28px_rgba(0,0,0,.7),0_0_20px_rgba(255,210,74,.28)] lg:max-w-[760px] lg:px-4 lg:py-2.5"
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#ffd24a] to-transparent opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-[#9a6b00] to-transparent opacity-70" />
      <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />
      <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />
      <span className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />
      <span className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />

      <button
        type="button"
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