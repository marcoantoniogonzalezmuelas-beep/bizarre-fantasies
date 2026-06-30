import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { SPELL_ART, MELEE_ART, RANGED_ART, ARMOR_ART, OBJECT_ART, BONUS_ART } from '@/lib/artUrls';

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
function isFoiledItem(item) {
  return Boolean(item?.foiled || item?.foil || String(item?.tag || '').toLowerCase().includes('foil'));
}

function FoilOverlay() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none foil-rainbow-layer" style={{ zIndex: 4 }} />
      <div className="absolute inset-0 pointer-events-none foil-sparkle-layer" style={{ zIndex: 5 }} />
      <div className="absolute inset-0 pointer-events-none foil-sweep-layer" style={{ zIndex: 6 }} />
    </>
  );
}

function FullBleedCard({ item, type, borderColor, artUrl, onClick, zoomable = true, fill = false, children }) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const isFoiled = isFoiledItem(item);
  return (
    <>
      <div
        className={`relative rounded-[18px] overflow-hidden cursor-pointer bg-[#07050b] shadow-[0_10px_26px_rgba(0,0,0,.55)] transition-transform hover:-translate-y-1 ${fill ? 'w-full h-full' : 'h-[320px]'}`}
        style={{ border: `2px solid ${isFoiled ? '#ffd24a' : borderColor}88`, boxShadow: isFoiled ? '0 0 24px rgba(255, 210, 74, 0.48), 0 10px 26px rgba(0,0,0,.55), inset 0 0 20px rgba(255, 210, 74, 0.18)' : '' }}
        onClick={() => onClick?.(item)}
      >
        {/* Lupa: ampliar la carta completa */}
        {zoomable && (
          <button
            onClick={(e) => { e.stopPropagation(); setZoomOpen(true); }}
            className="absolute right-[46px] bottom-3 z-[25] w-8 h-8 rounded-full flex items-center justify-center bg-black/70 border border-[#ffd24a88] text-[#ffe49a] hover:bg-black/90 hover:text-[#fff5dc] active:scale-95 transition-all shadow-lg"
            aria-label="Ampliar"
          >
            <Search size={14} />
          </button>
        )}
        {/* Full-bleed art */}
      {artUrl && (
        fill ? (
          /* Zoom mode: simple cover image filling the card, same approach as hero face */
          <img
            src={artUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ filter: 'saturate(1.14) contrast(1.12)', transform: 'scale(1.12)', zIndex: 1 }}
          />
        ) : (
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
                transform: 'scale(1.35)',
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
                transform: 'scale(1.15)',
                zIndex: 1,
              }}
            />
          </>
        )
      )}

      {/* Gradient shade at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/80" style={{ zIndex: 2 }} />
      {isFoiled && <FoilOverlay />}

      {/* Top badges */}
      <div className="absolute left-3 right-3 top-3 flex justify-between items-start" style={{ zIndex: 10 }}>
        {children}
      </div>

      {/* Bottom info panel */}
      <div className={`absolute left-3 right-3 bottom-3 text-center rounded-xl bg-black/75 border px-3 backdrop-blur-sm ${fill ? 'py-5 pb-6' : 'py-3 pb-4'}`} style={{ borderColor: `${borderColor}44`, zIndex: 10 }}>
        <div className={`font-heading font-black leading-tight text-[#fff5d9] ${fill ? 'text-2xl' : 'text-base'}`} style={{ textShadow: '0 2px 6px #000,0 0 12px #000' }}>{item.name}</div>
        <div className={`mt-1.5 font-bold leading-snug text-[#efe9dc] ${fill ? 'text-[14px]' : 'text-[11px]'}`}>{item.txt || item.description}</div>
        <div className={`mt-3 font-black text-[#bdae87] ${fill ? 'text-[10px]' : 'text-[8px]'}`}>Base Set · Nº {String(item.num || item.number || 0).padStart(3, '0')}</div>
      </div>

      <div className={`absolute right-2 bottom-3 z-20 rounded-full overflow-hidden border-2 border-[#ffd24a99] shadow-[0_0_10px_rgba(255,210,74,.5)] ${fill ? 'w-11 h-11' : 'w-8 h-8'}`} style={{ background: 'radial-gradient(circle at 40% 30%,#1a0a00,#0a0500)' }}>
        <img src="https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/80e2c6fb5_generated_image.png" alt="Punkito" className="w-full h-full object-contain" />
      </div>
    </div>
    
    {zoomOpen && (
      <div
        className="fixed inset-0 z-[100001] flex items-center justify-center p-5 bg-cover bg-center backdrop-blur-sm"
        style={{ backgroundImage: 'linear-gradient(rgba(6,4,12,.72), rgba(6,4,12,.88)), url("https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/9b034fe3c_generated_image.png")' }}
        onClick={(e) => { e.stopPropagation(); setZoomOpen(false); }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setZoomOpen(false); }}
          className="fixed top-4 right-4 z-[100010] h-12 px-4 rounded-full flex items-center gap-2 justify-center bg-black/90 border-2 border-[#ffd24a] text-[#ffe49a] hover:bg-black hover:text-white active:scale-95 transition-all shadow-[0_0_24px_rgba(255,210,74,.65)] font-black text-sm"
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
          <EquipCard item={item} type={type} zoomable={false} fill />
        </div>
      </div>
    )}
    </>
  );
}

export default function EquipCard({ item, type, onClick, zoomable = true, fill = false }) {
  const borderColor = TYPE_COLORS[type] || '#3c3158';
  const artUrl = gameArt(item, type);

  if (type === 'bonus') {
    return (
      <FullBleedCard item={item} type={type} borderColor="#d39b22" artUrl={artUrl} onClick={onClick} zoomable={zoomable} fill={fill}>
        <span className={`rounded-full bg-black/70 border border-[#ffd24a66] px-2.5 py-1 font-black text-[#ffe49a] ${fill ? 'text-xs' : 'text-[10px]'}`}>
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

  const statLine = type === 'spell' && item.mana != null
    ? `🔵 ${item.mana} maná`
    : type === 'spell' && item.power != null
    ? `🔵 ${item.power} maná`
    : item.cc != null
    ? `+${item.cc} CC`
    : item.power != null
    ? `Pot. ${item.power}`
    : item.hp != null && type === 'armor'
    ? `+${item.hp} HP`
    : item.mana != null
    ? `🔵 ${item.mana} maná`
    : null;

  return (
    <FullBleedCard item={item} type={type} borderColor={borderColor} artUrl={artUrl} onClick={onClick} zoomable={zoomable} fill={fill}>
      <div className="flex flex-col gap-1.5">
        {/* Cost coin */}
        {item.cost != null && item.cost !== '—' && (
          <div
            className={`rounded-full flex items-center justify-center font-black text-[#5a3d06] shadow-md ${fill ? 'w-11 h-11 text-lg' : 'w-8 h-8 text-xs'}`}
            style={{ background: 'radial-gradient(circle at 34% 30%, #ffeaa6, #FFD24A 46%, #a9771f)', border: '2px solid #7c5410' }}
          >
            {item.cost}
          </div>
        )}
        {/* Tag / element */}
        {tagLabel && (
          <span className={`font-black text-white rounded-full px-2.5 py-0.5 w-fit ${fill ? 'text-xs' : 'text-[10px]'}`} style={{ background: tagBg }}>
            {tagLabel}
          </span>
        )}
        {/* Stat */}
        {statLine && (
          <span className={`font-black text-[#ffe49a] bg-black/60 rounded-full px-2.5 py-0.5 w-fit ${fill ? 'text-xs' : 'text-[10px]'}`}>
            {statLine}
          </span>
        )}
      </div>
    </FullBleedCard>
  );
}