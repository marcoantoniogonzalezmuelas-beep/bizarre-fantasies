import React, { useEffect, useRef, useState } from 'react';
import { Radio, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getLang } from '@/lib/i18n';

// Cartel digital de "Actualidad": SIEMPRE FIJO (centrado abajo), como los
// iconos del menú del juego (Aprende a jugar, Reglas…). No se arrastra: solo
// adapta su tamaño con el zoom de pellizco y con la escala móvil del juego.
// Las noticias las gestiona el admin desde la entidad FlashNews.
export default function FlashNewsMarquee({ mobScale = 1, isMobile = false, pinchZ = 1, inGameSpace = false }) {
  const [items, setItems] = useState([]);
  const [closed, setClosed] = useState(() => { try { return sessionStorage.getItem('bfSignClosed') === '1'; } catch (e) { return false; } });
  const [enabled, setEnabled] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [topY, setTopY] = useState(null); // px (viewport) justo debajo de los iconos
  const signRef = useRef(null);

  const pz = pinchZ || 1;
  const scale = mobScale || 1;
  const MOB_W = 760; // ancho del cartel en coordenadas 1200 (escala igual que el juego)

  // En modo inGameSpace (móvil) el cartel vive dentro de un wrapper que replica
  // el transform del iframe (escala + pellizco). Durante el pellizco el cuerpo
  // del juego se transforma, por lo que getBoundingClientRect devolvería la
  // posición ya transformada; congelamos la base y deja que el wrapper aplique
  // zoom/pan. Solo medimos la posición base cuando NO hay pellizco activo.
  const pzRef = useRef(1);
  useEffect(() => { pzRef.current = pinchZ || 1; }, [pinchZ]);

  useEffect(() => {
    const measure = () => {
      if (inGameSpace && pzRef.current !== 1) return; // congelar base durante pellizco
      const iframe = document.querySelector('iframe');
      const doc = iframe?.contentDocument;
      const links = doc?.querySelector('.title-links');
      if (!links) return;
      const r = links.getBoundingClientRect();
      // r.bottom está en coordenadas internas del iframe (espacio 1200 en
      // móvil, viewport en escritorio). Sumamos 14px de margen en ese mismo
      // espacio. El wrapper del móvil aplica luego la escala/pellizco.
      setTopY(r.bottom + 14);
    };
    measure();
    const iv = setInterval(measure, 500);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', () => setTimeout(measure, 300));
    return () => { clearInterval(iv); window.removeEventListener('resize', measure); };
  }, [scale, inGameSpace]);

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

  // Oculta el cartel cuando hay un modal abierto en el juego (reglas, razas,
  // info de héroe…): no debe impedir la lectura del contenido del modal.
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

  // inGameSpace (móvil): el cartel se posiciona en coordenadas 1200 dentro del
  // wrapper que replica el transform del iframe; por eso NO aplica su propia
  // escala/pellizco (lo hace el wrapper) y usa position:absolute.
  // Escritorio: fijo en viewport, centrado, sin pellizco (pz=1).
  const s = scale * pz;
  const style = inGameSpace
    ? { position: 'absolute', left: 600, top: topY, width: 760, maxWidth: 'none', transform: 'translateX(-50%)', transformOrigin: 'center top' }
    : { position: 'fixed', left: '50%', top: topY, transform: `translateX(-50%) scale(${s})`, transformOrigin: 'center top', ...(scale < 1 ? { width: MOB_W, maxWidth: 'none' } : {}) };

  return (
    <div
      ref={signRef}
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