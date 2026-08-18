import React from 'react';
import { X } from 'lucide-react';
import useVisualViewportBox from '@/hooks/useVisualViewportBox';

export default function ImageZoomModal({ src, alt, onClose }) {
  const vvBox = useVisualViewportBox();
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,4,12,0.92)', backdropFilter: 'blur(6px)', ...vvBox }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center bg-black/60 border border-[#ffd24a66] text-[#ffe49a] hover:bg-black/80 transition-colors"
        aria-label="Cerrar"
      >
        <X size={22} />
      </button>
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full max-h-full rounded-2xl border-2 border-[#caa14a] shadow-[0_0_50px_rgba(0,0,0,0.8)] object-contain"
        style={{ maxHeight: '92%', maxWidth: '92%' }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}