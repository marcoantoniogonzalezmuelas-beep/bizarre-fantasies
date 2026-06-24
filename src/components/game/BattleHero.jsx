import React from 'react';
import { Droplet } from 'lucide-react';
import { heroArt } from '@/lib/game/engine';
import { battleStatusBadges } from '@/lib/game/combat';

const STATUS_ICON = { shield: '🛡️', ward: '🔮', sleep: '😴', para: '⚡', skip: '🚫', mark: '🎯', evade: '💨', silence: '🔇', buff: '▲', debuff: '▼', def: 'DEF' };

// Carta de héroe en combate. Clicable cuando es objetivo válido de la acción pendiente.
export default function BattleHero({ hero, side, active, targetable, onClick }) {
  const pct = Math.max(0, Math.round(hero.hp / hero.maxHp * 100));
  const hpCol = pct > 50 ? '#3fd463' : pct > 25 ? '#FFD700' : '#e0483b';
  const mpct = hero.maxMana > 0 ? Math.round(hero.mana / hero.maxMana * 100) : 0;
  const badges = battleStatusBadges(hero);
  const dead = !hero.alive;

  let statusCls = '';
  if (hero.alive) { if (hero.sleep > 0) statusCls = 'ring-[#8aaaff]'; else if (hero.para > 0) statusCls = 'ring-[#ffe14a]'; else if (hero.evade > 0) statusCls = 'ring-[#9bffd0]'; }

  return (
    <button
      onClick={targetable ? onClick : undefined}
      disabled={!targetable}
      className={`relative w-full text-left rounded-xl overflow-hidden border-2 transition pl-[88px] min-h-[96px]
        ${active ? 'border-[#FFD24A] shadow-[0_0_24px_rgba(255,210,74,.5)]' : 'border-[#3c3158]'}
        ${targetable ? 'cursor-pointer ring-2 ring-[#ff6b6b] animate-pulse' : statusCls ? 'ring-2 ' + statusCls : ''}
        ${dead ? 'grayscale opacity-50' : ''} ${hero.eliteMode ? 'border-[#ffb000]' : ''}`}
      style={{ background: '#0d0a14' }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[92px] bg-cover" style={{ backgroundImage: `url("${heroArt(hero, hero.eliteMode)}")`, backgroundPosition: 'center 14%', transform: hero.eliteMode ? 'scaleX(-1)' : 'none' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(0,0,0,0),rgba(13,10,20,.95))' }} />
      </div>

      {active && <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 text-[9px] font-black text-[#2a1d05] bg-[#FFD24A] rounded-full px-2 py-0.5">★ SU TURNO</div>}
      {hero.eliteMode && <div className="absolute top-1 right-1 z-20 text-[8px] font-black text-[#2a1d05] bg-[#ffb000] rounded px-1.5 py-0.5">ÉLITE</div>}

      <div className="relative z-10 p-2">
        <div className="flex items-center justify-between gap-1">
          <span className="font-heading font-black text-white text-[13px] leading-none truncate">{hero.name}</span>
          <span className="text-[10px] font-black shrink-0" style={{ color: hpCol }}>{Math.max(0, hero.hp)}/{hero.maxHp}</span>
        </div>

        <div className="h-1.5 rounded-full bg-black/50 mt-1 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: hpCol }} />
        </div>
        {hero.maxMana > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Droplet size={9} className="text-[#5aa9ff]" />
            <div className="flex-1 h-1 rounded-full bg-black/50 overflow-hidden"><div className="h-full bg-[#5aa9ff]" style={{ width: mpct + '%' }} /></div>
            <span className="text-[8px] text-[#7fc0ff]">{hero.mana}</span>
          </div>
        )}

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-1">
            {badges.map((b, i) => (
              <span key={i} className="text-[8px] font-black text-white bg-black/60 border border-white/20 rounded px-1 py-0.5">{STATUS_ICON[b.t]}{b.v !== '' && b.v}</span>
            ))}
          </div>
        )}
        {dead && <div className="absolute inset-0 flex items-center justify-center text-2xl">💀</div>}
      </div>
    </button>
  );
}