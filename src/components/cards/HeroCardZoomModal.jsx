import React from 'react';
import { X } from 'lucide-react';
import HeroCardFace from '@/components/cards/HeroCardFace';

// Full-screen modal that shows the whole hero card (art + stats + ability)
// enlarged, not just the artwork.
export default function HeroCardZoomModal({ hero, elite, onClose }) {
  if (!hero) return null;

  return (
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center p-5 bg-[#06040c]/95 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center bg-black/60 border border-[#ffd24a88] text-[#ffe49a] hover:bg-black/85"
        aria-label="Cerrar"
      >
        <X size={20} />
      </button>
      <div
        className="relative w-full max-w-[420px]"
        style={{ aspectRatio: '7 / 10', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <HeroCardFace hero={hero} elite={elite} />
      </div>
    </div>
  );
}