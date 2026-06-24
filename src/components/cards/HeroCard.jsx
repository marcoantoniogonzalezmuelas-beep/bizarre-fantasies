import React, { useState } from 'react';
import { Search } from 'lucide-react';
import HeroCardFace from '@/components/cards/HeroCardFace';
import HeroCardZoomModal from '@/components/cards/HeroCardZoomModal';

export default function HeroCard({ hero, onClick }) {
  const [flipped, setFlipped] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full h-[420px] cursor-pointer" style={{ perspective: '1300px' }} onClick={() => onClick?.(hero)}>
        {/* Lupa: ampliar la carta completa (cara actualmente visible) */}
        <button
          onClick={(e) => { e.stopPropagation(); setZoomOpen(true); }}
          className="absolute top-1/2 right-2 -translate-y-1/2 z-30 w-9 h-9 rounded-full flex items-center justify-center bg-black/65 border border-[#ffd24a88] text-[#ffe49a] hover:bg-black/85 hover:text-[#fff5dc] transition-colors shadow-lg"
          aria-label="Ampliar"
        >
          <Search size={16} />
        </button>

        <div
          className="absolute inset-0 transition-transform duration-[620ms]"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transitionTimingFunction: 'cubic-bezier(.2,.72,.2,1)' }}
        >
          {/* Front (normal) */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transformStyle: 'preserve-3d', transform: 'rotateY(0deg) translateZ(1px)' }}>
            <HeroCardFace hero={hero} elite={false} />
          </div>
          {/* Back (elite) — counter-rotated so its content isn't mirrored */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transformStyle: 'preserve-3d', transform: 'rotateY(180deg) translateZ(1px)' }}>
            <HeroCardFace hero={hero} elite={true} />
          </div>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }} className="text-xs font-bold text-[#e8def6] bg-[#241a33] border border-[#3c3158] rounded-lg py-1.5 hover:border-[#b8902a] hover:text-[#ffcf57] transition-colors">
        ⟳ {flipped ? 'Normal' : 'Élite'}
      </button>
      {zoomOpen && <HeroCardZoomModal hero={hero} elite={flipped} onClose={() => setZoomOpen(false)} />}
    </div>
  );
}