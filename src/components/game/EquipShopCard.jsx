import React from 'react';
import { Coins, Plus } from 'lucide-react';
import { equipArt } from '@/lib/game/equipArt';

// Carta de tienda con ilustración a sangre (hechizo / arma / armadura / objeto).
export default function EquipShopCard({ item, kind, affordable, onBuy }) {
  const art = equipArt(item.id);
  const stat = item.cc != null ? `+${item.cc} CC`
    : item.power != null ? `Potencia ${item.power}${item.hits > 1 ? ` ×${item.hits}` : ''}`
    : (kind === 'armor' && item.hp != null) ? `+${item.hp} HP` : '';

  return (
    <button
      onClick={() => affordable && onBuy(item.id)}
      disabled={!affordable}
      className={`relative text-left rounded-xl overflow-hidden border bg-[#07050b] transition ${affordable ? 'border-[#FFD24A66] hover:border-[#FFD24A] cursor-pointer' : 'border-[#3c3158] opacity-45 cursor-not-allowed'}`}
      style={{ minHeight: 158 }}
    >
      {art && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${art}")`, filter: 'saturate(1.12) contrast(1.1)' }} />}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,0) 32%,rgba(0,0,0,.82) 72%,rgba(0,0,0,.96) 100%)' }} />

      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/60 border border-[#FFD24A55] px-2 py-0.5">
        <Coins size={11} className="text-[#FFD24A]" /><span className="text-[11px] font-black text-[#FFD24A]">{item.cost}</span>
      </div>
      <div className="absolute top-2 right-2 z-10 text-[8px] font-black text-[#ffe7a8] bg-black/60 border border-[#FFD24A33] rounded-full px-2 py-0.5">Nº {String(item.num || 0).padStart(3, '0')}</div>

      <div className="relative z-10 flex flex-col justify-end h-full p-2.5 pt-28">
        <div className="font-heading font-black text-[#fff5dc] text-sm leading-tight" style={{ textShadow: '0 2px 6px #000' }}>{item.name}</div>
        {stat && <div className="text-[10px] font-bold text-[#FFD24A] mt-0.5">{stat}{item.element ? ` · ${String(item.element).toUpperCase()}` : ''}</div>}
        <div className="text-[10px] text-[#d9d0e8] leading-snug mt-1 line-clamp-2">{item.txt}</div>
        {affordable && (
          <div className="mt-1.5 inline-flex items-center gap-1 self-start rounded-full bg-[#FFD24A1f] border border-[#FFD24A66] px-2.5 py-1 text-[10px] font-black text-[#ffe49a]">
            <Plus size={11} /> Comprar
          </div>
        )}
      </div>
    </button>
  );
}