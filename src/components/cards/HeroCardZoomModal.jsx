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
        className="fixed top-4 right-4 z-[100002] h-12 px-4 rounded-full flex items-center gap-2 justify-center bg-black/85 border-2 border-[#ffd24a] text-[#ffe49a] hover:bg-black hover:text-white active:scale-95 transition-all shadow-[0_0_22px_rgba(255,210,74,.45)] font-black text-sm"
        aria-label="Cerrar zoom y volver al Oráculo"
      >
        <X size={22} />
        Cerrar
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