import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Portal en <body>: en móvil/tablet la vista ampliada no hereda el zoom de
// "modo escritorio" ni el pellizco, así que la imagen queda centrada y el
// botón de cerrar siempre visible.
export default function ImageZoomModal({ src, alt, onClose }) {
  if (!src || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center px-3 pt-20 pb-4"
      style={{ background: 'rgba(6,4,12,0.94)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[100010] h-12 px-4 rounded-full flex items-center gap-2 justify-center bg-black/90 border-2 border-[#ffd24a] text-[#ffe49a] hover:bg-black hover:text-white active:scale-95 transition-all shadow-[0_0_24px_rgba(255,210,74,.65)] font-black text-sm"
        aria-label="Cerrar"
      >
        <X size={22} />
        Cerrar
      </button>
      <img
        src={src}
        alt={alt || ''}
        className="rounded-2xl border-2 border-[#caa14a] shadow-[0_0_50px_rgba(0,0,0,0.8)] object-contain"
        style={{ maxHeight: 'min(78vh, 620px)', maxWidth: '94vw' }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
}