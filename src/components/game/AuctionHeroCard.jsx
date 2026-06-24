import React from 'react';
import { CLAN_COLORS, CLAN_SYMBOLS } from '@/lib/cardData';
import { heroArt } from '@/lib/game/engine';

const TYPE_ICON = { CC: '⚔', AD: '🏹', HE: '✦' };

// Carta compacta de un candidato en la subasta, seleccionable.
export default function AuctionHeroCard({ hero, selected, onSelect, disabled }) {
  const color = CLAN_COLORS[hero.clan] || '#caa14a';
  const art = heroArt(hero, false);

  return (
    <button
      onClick={() => !disabled && onSelect(hero)}
      className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all ${selected ? 'scale-[1.03] ring-2 ring-[#FFD24A]' : 'hover:scale-[1.02]'} ${disabled ? 'opacity-50' : ''}`}
      style={{ borderColor: selected ? '#FFD24A' : color, aspectRatio: '3/4.3', background: '#09070d' }}
    >
      {art && <img src={art} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />

      <div className="absolute top-2 left-2 w-9 h-9 rounded-full flex items-center justify-center font-black text-[#4a2e03] text-sm" style={{ background: 'radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614)', border: '2px solid #6f4809' }}>{hero.cost}</div>
      <div className="absolute top-2 right-2 w-8 h-9 rounded-full bg-black/70 border border-[#ffd24a88] text-[#ead49a] flex flex-col items-center justify-center text-base">
        <span>{TYPE_ICON[hero.type] || '★'}</span>
      </div>

      <div className="absolute left-0 right-0 bottom-0 p-2.5">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-sm" style={{ color }}>{CLAN_SYMBOLS[hero.clan]}</span>
          <span className="text-[10px] text-[#cbbfe0] font-semibold">{hero.clan}</span>
        </div>
        <div className="font-heading font-black text-[15px] leading-none text-white" style={{ textShadow: '0 2px 6px #000' }}>{hero.name}</div>
        <div className="flex gap-2 mt-1.5 text-[11px] font-black">
          <span className="text-[#ff6b66]">{hero.cc}</span>
          <span className="text-[#6bff9a]">{hero.ad}</span>
          <span className="text-[#b889ff]">{hero.he}</span>
          <span className="text-[#ffd24a] ml-auto">❤{hero.hp}</span>
        </div>
      </div>

      {selected && <div className="absolute inset-0 ring-4 ring-inset ring-[#FFD24A]/40 rounded-2xl pointer-events-none" />}
    </button>
  );
}