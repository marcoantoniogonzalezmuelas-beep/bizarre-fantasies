import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import HeroCardFace from '@/components/cards/HeroCardFace';
import PinchZoomBox from '@/components/cards/PinchZoomBox';

// Vista ampliada de la carta completa. Se monta con un portal en <body> para
// que en móvil/tablet NO herede el zoom de "modo escritorio" ni el pellizco
// del Oráculo (ahí es donde la carta se descentraba y desaparecía). Así queda
// siempre centrada en pantalla, con el botón de cerrar visible.
export default function HeroCardZoomModal({ hero, elite, onClose }) {
  if (!hero || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center bg-cover bg-center px-3 pt-20 pb-4"
      style={{ backgroundImage: 'linear-gradient(rgba(6,4,12,.82), rgba(6,4,12,.94))' }}
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
      <div onClick={(e) => e.stopPropagation()}>
        <PinchZoomBox
          className="relative"
          style={{ aspectRatio: '7 / 10', height: 'min(78vh, 620px)', maxWidth: '94vw' }}
        >
          <HeroCardFace hero={hero} elite={elite} />
        </PinchZoomBox>
      </div>
    </div>,
    document.body
  );
}