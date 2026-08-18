import React from 'react';
import { X } from 'lucide-react';
import HeroCardFace from '@/components/cards/HeroCardFace';

// Full-screen modal that shows the whole hero card (art + stats + ability)
// enlarged, not just the artwork.
export default function HeroCardZoomModal({ hero, elite, onClose }) {
  if (!hero) return null;

  return (
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center p-5 bg-cover bg-center backdrop-blur-sm"
      style={{ backgroundImage: 'linear-gradient(rgba(6,4,12,.72), rgba(6,4,12,.88)), url("https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/9b034fe3c_generated_image.png")' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[100010] h-12 px-4 rounded-full flex items-center gap-2 justify-center bg-black/90 border-2 border-[#ffd24a] text-[#ffe49a] hover:bg-black hover:text-white active:scale-95 transition-all shadow-[0_0_24px_rgba(255,210,74,.65)] font-black text-sm"
        aria-label="Cerrar zoom y volver al Oráculo"
      >
        <X size={22} />
        Cerrar
      </button>
      <div
        className="relative w-full max-w-[420px]"
        style={{ aspectRatio: '7 / 10', maxHeight: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <HeroCardFace hero={hero} elite={elite} />
      </div>
    </div>
  );
}