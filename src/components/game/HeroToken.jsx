import React from 'react';
import { CLAN_COLORS, CLAN_SYMBOLS } from '@/lib/cardData';

export default function HeroToken({ hero, compact = false, selected = false, onClick }) {
  if (!hero) return null;
  const color = CLAN_COLORS[hero.clan] || '#777';
  const hp = hero.hpNow ?? hero.hp;
  const maxHp = hero.maxHp ?? hero.hp;

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl overflow-hidden border transition-all ${selected ? 'scale-[1.02] shadow-[0_0_24px_rgba(255,210,74,.35)]' : 'hover:-translate-y-1'}`}
      style={{ borderColor: selected ? '#FFD24A' : color, background: 'linear-gradient(180deg,#241b39,#120e1c)' }}
    >
      <div className="relative aspect-[3/4] overflow-hidden" style={{ background: `linear-gradient(150deg, ${color}66, #111)` }}>
        {hero.art ? <img src={hero.art} alt={hero.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl">{CLAN_SYMBOLS[hero.clan] || '⚔️'}</div>}
        <div className="absolute top-1 left-1 rounded-full bg-[#FFD24A] text-[#3b2700] text-xs font-black px-2 py-1">{hero.cost}</div>
        <div className="absolute top-1 right-1 rounded-full text-xs font-black px-2 py-1 text-white" style={{ background: color }}>{hero.type}</div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
          <div className="font-heading font-bold text-white text-sm leading-tight">{hero.name}</div>
          <div className="text-[10px] text-[#ffe8a6]">{hero.title}</div>
        </div>
      </div>
      {!compact && (
        <div className="p-2">
          <div className="grid grid-cols-4 gap-1 text-center text-xs font-black">
            <span className="text-[#ff7a7a]">CC {hero.cc}</span><span className="text-[#5fe08a]">AD {hero.ad}</span><span className="text-[#8aa0ff]">HE {hero.he}</span><span className="text-[#ffd24a]">HP {hp}</span>
          </div>
          <div className="mt-2 h-2 rounded bg-black/40 overflow-hidden"><div className="h-full bg-[#e0483b]" style={{ width: `${Math.max(0, Math.min(100, hp / maxHp * 100))}%` }} /></div>
          <p className="mt-2 text-[11px] leading-snug text-[#d8d0e8]"><b className="text-[#ffcf57]">{hero.ability}</b> · {hero.abilityTxt}</p>
        </div>
      )}
    </button>
  );
}