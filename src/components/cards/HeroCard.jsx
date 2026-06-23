import React, { useState } from 'react';
import { CLAN_COLORS, CLAN_SYMBOLS } from '@/lib/cardData';

export default function HeroCard({ hero, onClick }) {
  const [flipped, setFlipped] = useState(false);
  const color = CLAN_COLORS[hero.clan] || '#666';
  const symbol = CLAN_SYMBOLS[hero.clan] || '🛡️';

  const Face = ({ elite }) => {
    const cc = elite ? hero.eCc : hero.cc;
    const ad = elite ? hero.eAd : hero.ad;
    const he = elite ? hero.eHe : hero.he;
    const hp = elite ? hero.eHp : hero.hp;
    const abilityName = elite ? hero.eAbility : hero.ability;
    const abilityTxt = elite ? hero.eTxt : hero.abilityTxt;
    const artUrl = elite ? (hero.eliteArt || hero.elite_art_url || hero.art || hero.art_url) : (hero.art || hero.art_url);

    return (
      <div
        className={`absolute inset-0 rounded-2xl overflow-hidden border-2 flex flex-col ${elite ? 'shadow-[0_0_30px_rgba(255,180,60,0.4)]' : 'shadow-[0_8px_26px_rgba(0,0,0,0.55)]'}`}
        style={{ borderColor: elite ? '#ffb43a' : color, background: '#0e0b16', backfaceVisibility: 'hidden', transform: elite ? 'rotateY(180deg)' : 'none' }}
      >
        {/* Race band */}
        <div className="flex items-center justify-center gap-1.5 py-1 px-2 text-white font-extrabold text-xs tracking-wide" style={{ background: color, textShadow: '0 1px 2px rgba(0,0,0,.55)' }}>
          <span className="text-base">{symbol}</span>
          <span>{hero.clan}{elite ? ' ÉLITE' : ''}</span>
          <span className="ml-1 text-[10px] opacity-80">{hero.type === 'CC' ? 'CUERPO A CUERPO' : hero.type === 'AD' ? 'A DISTANCIA' : 'HECHICERÍA'}</span>
        </div>

        {/* Cost coin */}
        <div className="absolute top-8 left-2 z-10 w-10 h-10 rounded-full flex items-center justify-center font-black text-[#5a3d06] text-sm shadow-lg" style={{ background: 'radial-gradient(circle at 34% 30%, #ffeaa6, #FFD24A 46%, #a9771f)', border: '2px solid #7c5410' }}>
          {hero.cost}
        </div>

        {/* Art area */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden" style={{ background: elite ? `radial-gradient(circle at 50% 34%, rgba(190,120,255,.30), transparent 60%), linear-gradient(160deg, #3a1e5e, #140a22 72%)` : `radial-gradient(circle at 50% 36%, rgba(255,255,255,.10), transparent 60%), linear-gradient(160deg, ${color}66, #0e0b16 72%)` }}>
          {artUrl ? (
            <img src={artUrl} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" style={{ opacity: elite ? 0.85 : 0.92 }} />
          ) : (
            <span className="text-7xl opacity-80" style={{ filter: elite ? 'drop-shadow(0 0 22px rgba(190,120,255,.85))' : 'drop-shadow(0 6px 14px rgba(0,0,0,.6))' }}>{symbol}</span>
          )}
          {/* Name overlay */}
          <div className="absolute top-2 left-0 right-0 text-center px-12">
            <div className="font-heading font-extrabold text-lg text-white" style={{ textShadow: elite ? '0 0 16px rgba(255,180,60,.85), 0 2px 6px #000' : '0 2px 6px #000, 0 0 14px rgba(0,0,0,.8)', color: elite ? '#ffe9b0' : '#fff' }}>
              {hero.name}{elite ? ' ★' : ''}
            </div>
            <div className="text-[11px] text-[#ffe6a8]" style={{ textShadow: '0 1px 3px #000' }}>{hero.title}</div>
          </div>

          {/* Heart HP */}
          <div className="absolute right-2 bottom-10 z-10 w-14 h-12 flex items-center justify-center">
            <span className="absolute text-[48px] text-red-600" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.7))' }}>❤</span>
            <span className="relative z-10 font-black text-white text-base" style={{ textShadow: '0 1px 2px #000' }}>{hp}</span>
          </div>

          {/* Stats bar */}
          <div className="absolute left-0 right-0 bottom-0 flex" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,.74))' }}>
            <div className="flex-1 text-center py-1"><span className="block text-[9px] tracking-wider text-[#ff7a7a]">CC</span><b className="text-base font-black text-[#ff7a7a]">{cc}</b></div>
            <div className="flex-1 text-center py-1"><span className="block text-[9px] tracking-wider text-[#74e08f]">AD</span><b className="text-base font-black text-[#74e08f]">{ad}</b></div>
            <div className="flex-1 text-center py-1"><span className="block text-[9px] tracking-wider text-[#8ea2ff]">HE</span><b className="text-base font-black text-[#8ea2ff]">{he}</b></div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0a0710] px-2 py-1.5 border-t border-white/5">
          <div className="text-[11px] leading-tight text-[#e8e0f2] min-h-[28px]">
            <b className="text-[#ffcf6b]">[{elite ? 'ÉLITE' : 'HAB'}] {abilityName}</b> · {abilityTxt}
          </div>
          <div className="flex items-center gap-1.5 mt-1 justify-end">
            <span className="font-heading font-extrabold text-xs text-[#FFD24A] border border-[#a9771f] rounded px-1 tracking-wider" style={{ background: 'linear-gradient(180deg, #2a2010, #16100a)' }}>BF</span>
            <span className="text-[8px] text-[#9a8f7a]">Base Set · Nº {String(hero.num).padStart(3, '0')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-[420px] cursor-pointer" style={{ perspective: '1300px' }} onClick={() => onClick?.(hero)}>
        <div className="relative w-full h-full transition-transform duration-700" style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}>
          <Face elite={false} />
          <Face elite={true} />
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }} className="text-xs font-bold text-[#e8def6] bg-[#241a33] border border-[#3c3158] rounded-lg py-1.5 hover:border-[#b8902a] hover:text-[#ffcf57] transition-colors">
        ⟳ {flipped ? 'Normal' : 'Élite'}
      </button>
    </div>
  );
}