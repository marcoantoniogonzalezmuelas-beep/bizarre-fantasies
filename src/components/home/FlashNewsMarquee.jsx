import React, { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getLang } from '@/lib/i18n';

// Cartel digital de "Actualidad": un panel LED compacto flotante tipo
// indicador de autopista / andén de metro. Se ancla abajo-centro, justo bajo
// el icono de "Contacta con los Bizarros", sin ocupar toda la pantalla. Las
// noticias las gestiona el admin desde la entidad FlashNews.
export default function FlashNewsMarquee() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    base44.entities.FlashNews.filter({ active: true }, 'order', 100)
      .then((list) => setItems(list || []))
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;
  const isEn = getLang() === 'en';
  const label = isEn ? 'NEWS' : 'ACTUALIDAD';
  const joined = items.map((i) => (isEn ? (i.text_en || i.text) : i.text)).join('      ◆      ');

  return (
    <div className="pointer-events-none fixed bottom-1 left-1/2 z-40 w-full max-w-[620px] -translate-x-1/2 select-none px-2">
      <div className="bf-led-sign relative overflow-hidden rounded-2xl border border-[#ffd24a]/55 bg-[#0a0700] px-3 py-1.5 shadow-[0_6px_24px_rgba(0,0,0,.7),0_0_18px_rgba(255,210,74,.25)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#ffd24a] to-transparent opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-[#9a6b00] to-transparent opacity-70" />
        <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />
        <span className="absolute bottom-1.5 left-1.5 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />
        <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#ffd24a]/40" />

        <div className="relative flex items-center gap-2.5">
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#ffd24a]/40 bg-[#1a1300] px-2 py-1"
            style={{ animation: 'bfMarqueeBadgePulse 2.2s ease-in-out infinite' }}
          >
            <Radio className="h-3.5 w-3.5 text-[#ffd24a]" />
            <span className="font-heading text-[10px] font-black tracking-[0.22em] text-[#ffd24a]">{label}</span>
          </div>
          <div className="bf-led-screen relative flex-1 overflow-hidden rounded-md py-0.5">
            <div className="bf-marquee-track absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap">
              <span className="bf-led-text">{joined}</span>
              <span className="bf-led-sep"> ◆ </span>
              <span className="bf-led-text">{joined}</span>
              <span className="bf-led-sep"> ◆ </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}