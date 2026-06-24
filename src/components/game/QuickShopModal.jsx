import React from 'react';
import { X } from 'lucide-react';
import { MELEE_WEAPONS, RANGED_WEAPONS, ARMORS } from '@/lib/game/engine';
import { equipArt } from '@/lib/game/equipArt';

// Modal para comprar+equipar un arma o armadura a un héroe concreto.
export default function QuickShopModal({ hero, slot, coins, onPick, onClose }) {
  const rows = slot === 'armor'
    ? ARMORS.map((x) => ({ kind: 'armor', item: x }))
    : [...MELEE_WEAPONS.map((x) => ({ kind: 'melee', item: x })), ...RANGED_WEAPONS.map((x) => ({ kind: 'ranged', item: x }))];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[86vh] overflow-y-auto no-scrollbar rounded-2xl border-2 border-[#FFD24A66] bg-[#120d22] p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <div className="font-heading font-black text-[#FFD24A] text-lg">Comprar para {hero.name}</div>
          <button onClick={onClose} className="text-[#a89fbb] hover:text-white"><X size={20} /></button>
        </div>
        <div className="text-xs text-[#a89fbb] mb-3">Elige {slot === 'armor' ? 'una armadura' : 'un arma'}. Dispones de <b className="text-[#FFD24A]">{coins}</b> monedas.</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {rows.map(({ kind, item }) => {
            const art = equipArt(item.id);
            const aff = item.cost <= coins;
            return (
              <button
                key={item.id}
                onClick={() => aff && onPick(kind, item.id)}
                disabled={!aff}
                className={`relative text-left rounded-xl overflow-hidden border bg-[#07050b] ${aff ? 'border-[#FFD24A55] hover:border-[#FFD24A] cursor-pointer' : 'border-[#3c3158] opacity-45 cursor-not-allowed'}`}
                style={{ minHeight: 138, paddingTop: 104 }}
              >
                {art && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${art}")` }} />}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,.1) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,.78) 66%,rgba(0,0,0,.95) 100%)' }} />
                <div className="absolute top-1.5 left-1.5 z-10 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-[#4a2e03]" style={{ background: 'radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614)', border: '2px solid #6f4809' }}>{item.cost}</div>
                <div className="relative z-10 p-2">
                  <div className="font-heading font-black text-[#fff5dc] text-[12px] leading-tight">{item.name}</div>
                  <div className="text-[9px] text-[#d9d0e8] leading-snug mt-0.5 line-clamp-2">{item.txt}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}