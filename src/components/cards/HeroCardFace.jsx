import React from 'react';
import { CLAN_COLORS, CLAN_SYMBOLS } from '@/lib/cardData';

const TYPE_ICON = { CC: '⚔', AD: '🏹', HE: '✦' };

// AI-generated ability emblems by hero type (CC melee, AD ranged, HE magic).
export const ABILITY_ICON = {
  CC: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/705b92520_generated_image.png',
  AD: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4ed918861_generated_image.png',
  HE: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/78ce43e5c_generated_image.png',
};

// A single hero card face (normal or elite). Self-contained so it can be
// rendered both at grid size and enlarged inside the zoom modal.
export default function HeroCardFace({ hero, elite }) {
  const color = CLAN_COLORS[hero.clan] || '#caa14a';
  const symbol = CLAN_SYMBOLS[hero.clan] || '◆';

  const cc = elite ? hero.eCc : hero.cc;
  const ad = elite ? hero.eAd : hero.ad;
  const he = elite ? hero.eHe : hero.he;
  const hp = elite ? hero.eHp : hero.hp;
  const abilityName = elite ? hero.eAbility : hero.ability;
  const abilityTxt = elite ? hero.eTxt : hero.abilityTxt;
  const artUrl = elite ? (hero.eliteArt || hero.art) : hero.art;

  const isEpic = hero.clan === 'Épicas';
  const isFoiled = hero.foiled || isEpic;

  return (
    <div className={`absolute inset-0 rounded-[18px] overflow-hidden border-2 bg-[#09070d] ${isFoiled ? 'card-foiled' : ''} ${elite ? 'shadow-[0_0_30px_rgba(192,91,255,0.36)]' : 'shadow-[0_10px_28px_rgba(0,0,0,0.65)]'}`} style={{ borderColor: isFoiled ? '#ffb43a' : (elite ? '#ffb43a' : color), boxShadow: isFoiled ? '0 0 20px rgba(255, 210, 74, 0.4), inset 0 0 20px rgba(255, 210, 74, 0.2)' : '' }}>
      {artUrl && <img src={artUrl} alt={hero.name} className="absolute inset-0 w-full h-full object-cover saturate-110 contrast-105" style={{ transform: 'scale(1.12)', zIndex: 1 }} />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" style={{ zIndex: 2 }} />
      <div className="absolute inset-[7px] rounded-[14px] border border-[#ffd24a55] shadow-[inset_0_0_18px_rgba(0,0,0,0.72)]" style={{ zIndex: 2 }} />

      <div className="absolute top-2 left-2 z-10 w-11 h-11 rounded-full flex items-center justify-center font-black text-[#4a2e03] text-lg shadow-lg" style={{ background: 'radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614)', border: '2px solid #6f4809' }}>{hero.cost}</div>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-[#fff7dc] font-heading text-2xl font-black shadow-lg" style={{ background: 'radial-gradient(circle at 35% 25%,rgba(255,255,255,.42),rgba(255,210,74,.18) 38%,rgba(0,0,0,.72) 72%)', border: `2px solid ${color}`, textShadow: `0 2px 4px #000,0 0 10px ${color}` }}>{symbol}</div>
      <div className="absolute top-2.5 right-2 z-10 w-11 h-12 rounded-full bg-black/70 border border-[#ffd24a88] text-[#ead49a] flex flex-col items-center justify-center text-xl shadow-lg">
        <span>{TYPE_ICON[hero.type] || '★'}</span><span className="text-[7px] font-black leading-none">{hero.type}</span>
      </div>

      {/* Bottom info: stacked from the bottom up so nothing overlaps regardless of text length */}
      <div className="absolute left-3 right-3 bottom-3 z-10 flex flex-col gap-1.5">
        {/* Stats (HP heart sits at top-right of this row) */}
        <div className="relative grid grid-cols-3 gap-1 rounded-xl bg-black/55 border border-[#ffd24a2e] px-2 py-1 pr-12 backdrop-blur-sm">
          <div className="absolute right-1 -top-7 w-14 h-12 flex items-center justify-center pointer-events-none">
            <span className="absolute text-[50px] text-red-600 drop-shadow-lg">❤</span><span className="relative font-black text-white text-lg" style={{ textShadow: '0 2px 3px #000' }}>{hp}</span>
          </div>
          <div className="text-center font-black leading-none text-[#ff4b45]"><span className="block text-[9px] tracking-widest">CC</span><b className="text-base sm:text-lg">{cc}</b></div>
          <div className="text-center font-black leading-none text-[#54e876]"><span className="block text-[9px] tracking-widest">AD</span><b className="text-base sm:text-lg">{ad}</b></div>
          <div className="text-center font-black leading-none text-[#b06cff]"><span className="block text-[9px] tracking-widest">HE</span><b className="text-base sm:text-lg">{he}</b></div>
        </div>

        {/* Name + title */}
        <div className="text-center rounded-xl bg-black/60 border border-[#ffd24a2e] px-2 py-1 backdrop-blur-sm">
          <div className="font-heading font-black text-[15px] sm:text-[17px] leading-tight uppercase text-[#fff5dc] break-words" style={{ textShadow: '0 2px 5px #000,0 0 12px #000' }}>{hero.name}{elite ? ' ★' : ''}</div>
          <div className="mt-1 inline-block max-w-full rounded-full bg-[#08050caa] border border-[#ffd24a38] px-2 py-0.5 font-heading text-[9px] sm:text-[10px] font-extrabold italic leading-tight text-[#fff0bd]">{hero.title}{elite ? ' · ÉLITE' : ''}</div>
        </div>

        {/* Ability */}
        <div className="grid grid-cols-[34px_1fr] sm:grid-cols-[40px_1fr] gap-2 items-start rounded-xl bg-black/60 border border-[#ffd24a55] px-2 py-2 pb-6 backdrop-blur-sm">
          <div className={`mt-0.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 shrink-0 ${elite ? 'border-[#e0b2ff] shadow-[0_0_10px_rgba(192,106,255,.55)]' : 'border-[#ffe079] shadow-[0_0_10px_rgba(255,170,40,.5)]'}`} style={{ background: 'radial-gradient(circle at 40% 30%,#1a0a00,#0a0500)' }}>
            <img src={ABILITY_ICON[hero.type] || ABILITY_ICON.HE} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className={`font-heading text-[10px] sm:text-[11px] font-black uppercase leading-tight break-words ${elite ? 'text-[#d9a2ff]' : 'text-[#ffe07b]'}`}>{abilityName}</div>
            <div className="mt-1 text-[9px] sm:text-[10.5px] font-bold leading-snug text-[#fff7ea] break-words" style={{ textShadow: '0 2px 3px #000' }}>{abilityTxt}</div>
          </div>
        </div>
      </div>
      <div className="absolute left-14 bottom-3 z-20 text-[7px] font-black text-[#ffe7a8] bg-black/65 border border-[#ffd24a55] rounded-full px-1.5 py-0.5">Base Set · Nº {String(hero.num).padStart(3, '0')}</div>
      <div className="absolute right-2 bottom-3 z-20 w-8 h-8 rounded-full overflow-hidden border-2 border-[#ffd24a99] shadow-[0_0_10px_rgba(255,210,74,.5)]" style={{ background: 'radial-gradient(circle at 40% 30%,#1a0a00,#0a0500)' }}>
        <img src="https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/80e2c6fb5_generated_image.png" alt="BF" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}