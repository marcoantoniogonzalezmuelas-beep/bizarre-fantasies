import React, { useState } from 'react';
import HeroCardFace from '@/components/cards/HeroCardFace';
import HeroCardZoomModal from '@/components/cards/HeroCardZoomModal';

export default function HeroCard({ hero, onClick }) {
  const [flipped, setFlipped] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full h-[420px] cursor-pointer" style={{ perspective: '1300px' }} onClick={() => onClick?.(hero)}>
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
      <div className="flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); setZoomOpen(true); }} className="flex-1 text-xs font-black text-[#ffe49a] bg-black/80 border border-[#ffd24a] rounded-lg py-1.5 hover:bg-black/95 hover:text-[#fff5dc] transition-colors">
          Ampliar
        </button>
        <button onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }} className="flex-1 text-xs font-bold text-[#e8def6] bg-[#241a33] border border-[#3c3158] rounded-lg py-1.5 hover:border-[#b8902a] hover:text-[#ffcf57] transition-colors">
          ⟳ {flipped ? 'Normal' : 'Élite'}
        </button>
      </div>
      {zoomOpen && <HeroCardZoomModal hero={hero} elite={flipped} onClose={() => setZoomOpen(false)} />}
    </div>
  );
}