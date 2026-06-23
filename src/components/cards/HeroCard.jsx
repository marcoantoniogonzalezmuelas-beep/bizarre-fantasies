import React, { useState } from 'react';
import { CLAN_COLORS, CLAN_SYMBOLS } from '@/lib/cardData';

const TYPE_ICON = { CC: '⚔', AD: '🏹', HE: '✦' };

export default function HeroCard({ hero, onClick }) {
  const [flipped, setFlipped] = useState(false);
  const color = CLAN_COLORS[hero.clan] || '#caa14a';
  const symbol = CLAN_SYMBOLS[hero.clan] || '◆';

  const Face = ({ elite }) => {
    const cc = elite ? hero.eCc : hero.cc;
    const ad = elite ? hero.eAd : hero.ad;
    const he = elite ? hero.eHe : hero.he;
    const hp = elite ? hero.eHp : hero.hp;
    const abilityName = elite ? hero.eAbility : hero.ability;
    const abilityTxt = elite ? hero.eTxt : hero.abilityTxt;
    const artUrl = elite ? (hero.eliteArt || hero.art) : hero.art;

    return (
      <div className={`absolute inset-0 rounded-[18px] overflow-hidden border-2 bg-[#09070d] ${elite ? 'shadow-[0_0_30px_rgba(192,91,255,0.36)]' : 'shadow-[0_10px_28px_rgba(0,0,0,0.65)]'}`} style={{ borderColor: elite ? '#ffb43a' : color }}>
        {artUrl && <img src={artUrl} alt={hero.name} className="absolute inset-0 w-full h-full object-cover saturate-110 contrast-105" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />
        <div className="absolute inset-[7px] rounded-[14px] border border-[#ffd24a55] shadow-[inset_0_0_18px_rgba(0,0,0,0.72)]" />

        <div className="absolute top-2 left-2 z-10 w-11 h-11 rounded-full flex items-center justify-center font-black text-[#4a2e03] text-lg shadow-lg" style={{ background: 'radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614)', border: '2px solid #6f4809' }}>{hero.cost}</div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-[#fff7dc] font-heading text-2xl font-black shadow-lg" style={{ background: 'radial-gradient(circle at 35% 25%,rgba(255,255,255,.42),rgba(255,210,74,.18) 38%,rgba(0,0,0,.72) 72%)', border: `2px solid ${color}`, textShadow: `0 2px 4px #000,0 0 10px ${color}` }}>{symbol}</div>
        <div className="absolute top-2.5 right-2 z-10 w-11 h-12 rounded-full bg-black/70 border border-[#ffd24a88] text-[#ead49a] flex flex-col items-center justify-center text-xl shadow-lg">
          <span>{TYPE_ICON[hero.type] || '★'}</span><span className="text-[7px] font-black leading-none">{hero.type}</span>
        </div>

        <div className="absolute left-3 right-3 bottom-[158px] z-10 grid grid-cols-3 gap-1 rounded-xl bg-black/45 border border-[#ffd24a2e] px-2 py-1.5 pr-12 backdrop-blur-sm">
          <div className="text-center font-black leading-none text-[#ff4b45]"><span className="block text-[9px] tracking-widest">CC</span><b className="text-lg">{cc}</b></div>
          <div className="text-center font-black leading-none text-[#54e876]"><span className="block text-[9px] tracking-widest">AD</span><b className="text-lg">{ad}</b></div>
          <div className="text-center font-black leading-none text-[#b06cff]"><span className="block text-[9px] tracking-widest">HE</span><b className="text-lg">{he}</b></div>
        </div>
        <div className="absolute right-2 bottom-[164px] z-20 w-14 h-12 flex items-center justify-center">
          <span className="absolute text-[50px] text-red-600 drop-shadow-lg">❤</span><span className="relative font-black text-white text-lg" style={{ textShadow: '0 2px 3px #000' }}>{hp}</span>
        </div>

        <div className="absolute left-4 right-4 bottom-[108px] z-10 text-center rounded-xl bg-black/55 border border-[#ffd24a2e] px-2 py-1 backdrop-blur-sm">
          <div className="font-heading font-black text-[17px] leading-none uppercase text-[#fff5dc]" style={{ textShadow: '0 2px 5px #000,0 0 12px #000' }}>{hero.name}{elite ? ' ★' : ''}</div>
          <div className="mt-1 inline-block max-w-full rounded-full bg-[#08050caa] border border-[#ffd24a38] px-2 py-0.5 font-heading text-[10px] font-extrabold italic text-[#fff0bd]">{hero.title}{elite ? ' · ÉLITE' : ''}</div>
        </div>

        <div className="absolute left-3 right-3 bottom-3 z-10 grid grid-cols-[40px_1fr] gap-2 items-center min-h-[96px] rounded-xl bg-black/55 border border-[#ffd24a55] px-2 py-2 pb-5 backdrop-blur-sm">
          <div className={`w-10 h-10 rounded-full border-2 ${elite ? 'border-[#e0b2ff]' : 'border-[#ffe079]'}`} style={{ background: elite ? 'radial-gradient(circle at 38% 28%,#f4dbff,#c16aff 36%,#4c0b86 66%,#090012)' : 'radial-gradient(circle at 38% 28%,#fff2a7,#ff7a22 32%,#8c1108 62%,#170101)' }} />
          <div>
            <div className={`font-heading text-[11px] font-black uppercase leading-tight ${elite ? 'text-[#d9a2ff]' : 'text-[#ffe07b]'}`}>{abilityName}</div>
            <div className="mt-1 text-[10.5px] font-bold leading-tight text-[#fff7ea]" style={{ textShadow: '0 2px 3px #000' }}>{abilityTxt}</div>
          </div>
        </div>
        <div className="absolute left-14 bottom-3 z-20 text-[7px] font-black text-[#ffe7a8] bg-black/65 border border-[#ffd24a55] rounded-full px-1.5 py-0.5">Base Set · Nº {String(hero.num).padStart(3, '0')}</div>
        <div className="absolute right-2 bottom-3 z-20 font-heading font-black text-[#ffd24a] text-sm bg-[#160b00] border border-[#d39b22] rounded-md px-1.5 py-0.5">BF</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full h-[420px] cursor-pointer" onClick={() => onClick?.(hero)}>
        {/* Single face whose content swaps (no 3D flip → no mirror) */}
        <div key={flipped ? 'elite' : 'normal'} className="absolute inset-0 animate-in fade-in duration-300">
          <Face elite={flipped} />
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }} className="text-xs font-bold text-[#e8def6] bg-[#241a33] border border-[#3c3158] rounded-lg py-1.5 hover:border-[#b8902a] hover:text-[#ffcf57] transition-colors">
        ⟳ {flipped ? 'Normal' : 'Élite'}
      </button>
    </div>
  );
}