import React from 'react';
import { X } from 'lucide-react';
import EquipCard from '@/components/cards/EquipCard';

// Full-screen zoom for an equipment-style card (spell/melee/ranged/armor/object/bonus/token).
// Reuses the EquipCard layout, enlarged and centered.
export default function EquipCardZoomModal({ item, type, onClose }) {
  if (!item) return null;
  return (
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,4,12,0.92)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-14 h-14 rounded-full flex items-center justify-center bg-black/70 border border-[#ffd24a88] text-[#ffe49a] hover:bg-black/90 active:scale-95 transition-all shadow-lg"
        aria-label="Cerrar"
      >
        <X size={28} />
      </button>
      <div
        className="relative w-full max-w-[420px]"
        style={{ aspectRatio: '7 / 10', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <EquipCard item={item} type={type} zoomable={false} fill />
      </div>
    </div>
  );
}