import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SPELL_ART, MELEE_ART, RANGED_ART, ARMOR_ART, OBJECT_ART, BONUS_ART } from '@/lib/artUrls';
import EquipCardZoomModal from '@/components/cards/EquipCardZoomModal';

const TYPE_COLORS = {
  spell: '#8b6bff', melee: '#e0653f', ranged: '#3fb56a', armor: '#5a8fd6', object: '#d6b13f', bonus: '#d39b22',
};

const ELEMENT_COLORS = {
  fuego: '#d6552a', hielo: '#3aa0c8', rayo: '#caa12f', agua: '#2f7fd6',
  curacion: '#2f9d54', proteccion: '#caa12f', arcano: '#7a5fd0', estado: '#8a5fb0',
};

function gameArt(item, type) {
  const n = Number(item.num || item.number || 0);
  if (item.art || item.art_url) return item.art || item.art_url;
  if (type === 'spell') return SPELL_ART[n - 46];
  if (type === 'melee') return MELEE_ART[n - 59];
  if (type === 'ranged') return RANGED_ART[n - 65];
  if (type === 'armor') return ARMOR_ART[n - 73];
  if (type === 'object') return OBJECT_ART[n - 83];
  if (type === 'bonus') return BONUS_ART[n - 92];
  return undefined;
}

// Shared full-bleed card: art fills the whole card (same as bonus cards), text overlay at bottom.
function FullBleedCard({ item, type, borderColor, artUrl, onClick, zoomable = true, children }) {
  const [zoomOpen, setZoomOpen] = useState(false);
  return (
    <div
      className="relative h-[320px] rounded-[18px] overflow-hidden cursor-pointer bg-[#07050b] shadow-[0_10px_26px_rgba(0,0,0,.55)] transition-transform hover:-translate-y-1"
      style={{ border: `2px solid ${borderColor}88` }}
      onClick={() => onClick?.(item)}
    >
      {/* Lupa: ampliar la carta completa */}
      {zoomable && (
        <button
          onClick={(e) => { e.stopPropagation(); setZoomOpen(true); }}
          className="absolute top-2 right-2 z-[5] w-9 h-9 rounded-full flex items-center justify-center bg-black/65 border border-[#ffd24a88] text-[#ffe49a] hover:bg-black/85 hover:text-[#fff5dc] transition-colors shadow-lg"
          aria-label="Ampliar"
        >
          <Search size={16} />
        </button>
      )}
      {zoomOpen && <EquipCardZoomModal item={item} type={type} onClose={() => setZoomOpen(false)} />}
      {/* Full-bleed art, bleed past edges to hide white borders */}
      {artUrl && (
        <>
          {/* Blurred fill layer */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '-20px',
              backgroundImage: `url("${artUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(18px) saturate(1.3) contrast(1.16)',
              transform: 'scale(1.28)',
              zIndex: 0,
            }}
          />
          {/* Sharp art layer */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '-12px',
              backgroundImage: `url("${artUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'saturate(1.14) contrast(1.12)',
              transform: 'scale(1.08)',
              zIndex: 1,
            }}
          />
        </>
      )}

      {/* Gradient shade at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/80" style={{ zIndex: 2 }} />

      {/* Top badges */}
      <div className="absolute left-3 right-3 top-3 flex justify-between items-start" style={{ zIndex: 3 }}>
        {children}
      </div>

      {/* Bottom info panel */}
      <div className="absolute left-3 right-3 bottom-3 text-center rounded-xl bg-black/75 border px-3 py-3 pb-4 backdrop-blur-sm" style={{ borderColor: `${borderColor}44`, zIndex: 3 }}>
        <div className="font-heading font-black text-base leading-tight text-[#fff5d9]" style={{ textShadow: '0 2px 6px #000,0 0 12px #000' }}>{item.name}</div>
        <div className="mt-1.5 text-[11px] font-bold leading-snug text-[#efe9dc]">{item.txt || item.description}</div>
        <div className="mt-3 text-[8px] font-black text-[#bdae87]">Base Set · Nº {String(item.num || item.number || 0).padStart(3, '0')}</div>
      </div>

      <div className="absolute right-2 bottom-3 z-10 w-8 h-8 rounded-full overflow-hidden border-2 border-[#ffd24a99] shadow-[0_0_10px_rgba(255,210,74,.5)]" style={{ background: 'radial-gradient(circle at 40% 30%,#1a0a00,#0a0500)' }}>
        <img src="https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/80e2c6fb5_generated_image.png" alt="Punkito" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}

export default function EquipCard({ item, type, onClick, zoomable = true }) {
  const borderColor = TYPE_COLORS[type] || '#3c3158';
  const artUrl = gameArt(item, type);

  if (type === 'bonus') {
    return (
      <FullBleedCard item={item} type={type} borderColor="#d39b22" artUrl={artUrl} onClick={onClick} zoomable={zoomable}>
        <span className="rounded-full bg-black/70 border border-[#ffd24a66] px-2 py-1 text-[10px] font-black text-[#ffe49a]">
          {item.type || item.tag || 'BON'}
        </span>
      </FullBleedCard>
    );
  }

  // Spell / melee / ranged / armor / object — same full-bleed layout
  const tagLabel = type === 'spell'
    ? (item.element?.toUpperCase() || item.tag)
    : item.tag;

  const tagBg = type === 'spell' && item.element
    ? ELEMENT_COLORS[item.element] || borderColor
    : borderColor;

  const statLine = item.cc != null
    ? `+${item.cc} CC`
    : item.power != null
    ? `Pot. ${item.power}`
    : item.hp != null && type === 'armor'
    ? `+${item.hp} HP`
    : item.mana != null
    ? `🔵 ${item.mana} maná`
    : null;

  return (
    <FullBleedCard item={item} type={type} borderColor={borderColor} artUrl={artUrl} onClick={onClick} zoomable={zoomable}>
      <div className="flex flex-col gap-1">
        {/* Cost coin */}
        {item.cost != null && item.cost !== '—' && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[#5a3d06] text-xs shadow-md"
            style={{ background: 'radial-gradient(circle at 34% 30%, #ffeaa6, #FFD24A 46%, #a9771f)', border: '2px solid #7c5410' }}
          >
            {item.cost}
          </div>
        )}
        {/* Tag / element */}
        {tagLabel && (
          <span className="text-[10px] font-black text-white rounded-full px-2 py-0.5 w-fit" style={{ background: tagBg }}>
            {tagLabel}
          </span>
        )}
        {/* Stat */}
        {statLine && (
          <span className="text-[10px] font-black text-[#ffe49a] bg-black/60 rounded-full px-2 py-0.5 w-fit">
            {statLine}
          </span>
        )}
      </div>
    </FullBleedCard>
  );
}