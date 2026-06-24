import React from 'react';
import { Heart, Swords, Crosshair, Sparkles, Gauge, Droplet, X, ShoppingBag } from 'lucide-react';
import { heroArt } from '@/lib/game/engine';
import { eqStat, eqHpVal, eqManaVal, eqVelVal, primKey } from '@/lib/game/engine';
import { equipArt } from '@/lib/game/equipArt';
import { CLAN_COLORS } from '@/lib/cardData';

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="flex flex-col items-center">
    <Icon size={13} style={{ color }} />
    <span className="text-[8px] text-[#a89fbb] mt-0.5">{label}</span>
    <span className="text-sm font-black" style={{ color }}>{value}</span>
  </div>
);

// Slot lleno con thumbnail, o vacío con botón de comprar.
function Slot({ label, item, onClear, onBuy }) {
  if (item) {
    const art = equipArt(item.id);
    return (
      <div className="relative flex items-center gap-2 rounded-lg bg-[#1a1430] border border-[#FFD24A40] pl-1 pr-2 py-1">
        <div className="w-9 h-9 rounded bg-cover bg-center border border-[#FFD24A55] shrink-0" style={{ backgroundImage: `url("${art}")` }} />
        <div className="min-w-0 flex-1">
          <div className="text-[8px] text-[#a89fbb] uppercase tracking-wide">{label}</div>
          <div className="text-[11px] font-black text-white truncate">{item.name}</div>
        </div>
        <button onClick={onClear} className="shrink-0 text-[#a89fbb] hover:text-[#ff7a7a]"><X size={14} /></button>
      </div>
    );
  }
  return (
    <button onClick={onBuy} className="flex items-center justify-between gap-2 rounded-lg bg-[#0e0a16] border border-dashed border-[#3c3158] hover:border-[#FFD24A66] px-2 py-2 text-left">
      <span className="text-[11px] text-[#564b6e]">{label}: vacío</span>
      <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#ffe49a] bg-[#FFD24A1f] border border-[#FFD24A55] rounded-full px-2 py-0.5"><ShoppingBag size={10} /> Comprar</span>
    </button>
  );
}

export default function EquipHeroCard({ hero, onClear, onBuyWeapon, onBuyArmor }) {
  const col = CLAN_COLORS[hero.clan] || '#caa14a';
  const weapon = hero.mwep || hero.rwep;
  const pk = primKey(hero.type);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 bg-[#0d0a14]" style={{ borderColor: col + '88', minHeight: 184 }}>
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-cover" style={{ backgroundImage: `url("${heroArt(hero, false)}")`, backgroundPosition: 'center 16%', filter: 'saturate(1.12) contrast(1.08)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(13,10,20,.3) 58%,rgba(13,10,20,.95) 100%)' }} />
      </div>

      <div className="relative pl-[136px] p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-heading font-black text-white text-base leading-none">{hero.name}</div>
            <div className="text-[10px] font-bold" style={{ color: col }}>{hero.clan} · {hero.type}</div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 mt-2.5 bg-black/30 border border-[#3c3158] rounded-lg py-1.5">
          <Stat icon={Swords} label="CC" value={eqStat(hero, 'cc')} color={pk === 'cc' ? '#ff4b45' : '#ff8888'} />
          <Stat icon={Crosshair} label="AD" value={eqStat(hero, 'ad')} color={pk === 'ad' ? '#54e876' : '#88cc88'} />
          <Stat icon={Sparkles} label="HE" value={eqStat(hero, 'he')} color={pk === 'he' ? '#b06cff' : '#b89cdd'} />
          <Stat icon={Heart} label="HP" value={eqHpVal(hero)} color="#e23d3a" />
          <Stat icon={Gauge} label="VEL" value={eqVelVal(hero)} color="#FFD24A" />
        </div>

        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#7fd4ff]">
          <Droplet size={11} /> Maná {eqManaVal(hero)}
        </div>

        <div className="grid gap-1.5 mt-2">
          <Slot label="Arma" item={weapon} onClear={() => onClear(weapon === hero.mwep ? 'mwep' : 'rwep')} onBuy={onBuyWeapon} />
          <Slot label="Armadura" item={hero.armor} onClear={() => onClear('armor')} onBuy={onBuyArmor} />
        </div>
      </div>
    </div>
  );
}