import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Cartel digital de "Actualidad" que aparece fijo en la parte superior de la
// home. Carga las noticias activas desde la entidad FlashNews (gestionables
// desde el backoffice) y las reproduce en un marquesina continua de izquierda
// a derecha, con letras doradas y brillo para que se lean bien sobre el juego.
export default function FlashNewsMarquee() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    base44.entities.FlashNews.filter({ active: true }, 'order', 100)
      .then((list) => setItems(list || []))
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;
  const joined = items.map((i) => i.text).join('      ◆      ');
  const SEP = <span className="mx-6 text-[#c06bff]">◆</span>;

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-40 select-none">
      <div className="flex h-10 items-stretch border-b border-[#ffd24a]/40 bg-gradient-to-b from-[#1c1130] to-[#0f0a1a] shadow-[0_2px_14px_rgba(0,0,0,.65)]">
        {/* Badge ACTUALIDAD */}
        <div
          className="flex shrink-0 items-center gap-2 border-r border-[#ffd24a]/50 bg-gradient-to-b from-[#3a2600] to-[#211604] px-3"
          style={{ animation: 'bfMarqueeBadgePulse 2.2s ease-in-out infinite' }}
        >
          <Megaphone className="h-4 w-4 text-[#ffd24a]" />
          <span className="font-heading text-[12px] font-black tracking-[0.18em] text-[#ffd24a]">ACTUALIDAD</span>
        </div>
        {/* Marquesina scroll izquierda → derecha */}
        <div className="relative flex-1 overflow-hidden">
          <div className="bf-marquee-track absolute left-0 top-1/2 -translate-y-1/2">
            <span className="bf-marquee-text">{joined}</span>
            {SEP}
            <span className="bf-marquee-text">{joined}</span>
            {SEP}
          </div>
        </div>
      </div>
    </div>
  );
}