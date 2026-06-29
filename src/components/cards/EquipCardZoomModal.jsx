import React from 'react';
import { X } from 'lucide-react';
import EquipCard from '@/components/cards/EquipCard';

// Full-screen zoom for an equipment-style card (spell/melee/ranged/armor/object/bonus).
// Shows the WHOLE card (art + name + description) enlarged and centered,
// exactly like the hero zoom modal.
export default function EquipCardZoomModal({ item, type, onClose }) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center p-5 bg-[#06040c]/95 backdrop-blur-md"
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