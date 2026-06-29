import React from 'react';
import { X } from 'lucide-react';
import EquipCard from '@/components/cards/EquipCard';

// Full-screen zoom for an equipment-style card (spell/melee/ranged/armor/object/bonus/token).
// Reuses the EquipCard layout, enlarged and centered.
export default function EquipCardZoomModal({ item, type, onClose }) {
  if (!item) return null;
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,4,12,0.92)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center bg-black/60 border border-[#ffd24a66] text-[#ffe49a] hover:bg-black/80 transition-colors"
        aria-label="Cerrar"
      >
        <X size={22} />
      </button>
      <div className="w-[min(360px,90vw)]" onClick={(e) => e.stopPropagation()}>
        <EquipCard item={item} type={type} zoomable={false} />
      </div>
    </div>
  );
}