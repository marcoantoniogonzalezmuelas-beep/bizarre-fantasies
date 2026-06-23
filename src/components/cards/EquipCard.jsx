import React from 'react';
import { SPELL_ART, MELEE_ART, RANGED_ART, ARMOR_ART, OBJECT_ART, BONUS_ART } from '@/lib/artUrls';

const TYPE_COLORS = {
  spell: '#8b6bff', melee: '#e0653f', ranged: '#3fb56a', armor: '#5a8fd6', object: '#d6b13f', bonus: '#d39b22',
};

const ELEMENT_COLORS = {
  fuego: '#d6552a', hielo: '#3aa0c8', rayo: '#caa12f', agua: '#2f7fd6', curacion: '#2f9d54', proteccion: '#caa12f', arcano: '#7a5fd0', estado: '#8a5fb0',
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

export default function EquipCard({ item, type, onClick }) {
  const borderColor = TYPE_COLORS[type] || '#3c3158';
  const artUrl = gameArt(item, type);

  if (type === 'bonus') {
    return (
      <div className="relative h-[360px] rounded-[18px] overflow-hidden cursor-pointer border-2 border-[#d39b22]/80 bg-[#07050b] shadow-[0_10px_26px_rgba(0,0,0,.55)] transition-transform hover:-translate-y-1" onClick={() => onClick?.(item)}>
        {artUrl && <img src={artUrl} alt={item.name} className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] object-cover saturate-110 contrast-105" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/75" />
        <div className="absolute left-3 right-3 top-3 flex justify-between items-start">
          <span className="rounded-full bg-black/70 border border-[#ffd24a66] px-2 py-1 text-[10px] font-black text-[#ffe49a]">{item.type || item.tag || 'BON'}</span>
          <span className="font-heading font-black text-[#ffd24a] text-sm bg-[#160b00] border border-[#d39b22] rounded-md px-1.5 py-0.5">BF</span>
        </div>
        <div className="absolute left-3 right-3 bottom-3 text-center rounded-xl bg-black/70 border border-[#ffd24a44] px-3 py-3 backdrop-blur-sm">
          <div className="font-heading font-black text-lg leading-none text-[#fff5d9]" style={{ textShadow: '0 2px 6px #000,0 0 12px #000' }}>{item.name}</div>
          <div className="mt-2 text-[11px] font-bold leading-snug text-[#efe9dc]">{item.txt || item.description}</div>
          <div className="mt-2 text-[8px] font-black text-[#bdae87]">Base Set · Nº {String(item.num).padStart(3, '0')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[226px] rounded-xl overflow-hidden cursor-pointer border border-[#3c3158] transition-transform hover:-translate-y-1 hover:shadow-xl" style={{ background: 'linear-gradient(180deg,rgba(18,12,25,.78),rgba(9,7,13,.96))', borderTop: `3px solid ${borderColor}` }} onClick={() => onClick?.(item)}>
      {artUrl && <><img src={artUrl} alt={item.name} className="absolute inset-x-0 top-0 h-28 w-full object-cover saturate-110 contrast-105" /><div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent via-black/45 to-[#120d1d]" /></>}
      <div className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center font-black text-[#5a3d06] text-xs shadow-md" style={{ background: 'radial-gradient(circle at 34% 30%, #ffeaa6, #FFD24A 46%, #a9771f)', border: '2px solid #7c5410' }}>{item.cost}</div>
      {item.mana != null && <div className="absolute top-2.5 right-2 z-10 bg-[#1b2b58] border border-[#46618c] text-[#bcd2ff] text-[10px] font-extrabold rounded-lg px-1.5 py-0.5">🔵 {item.mana}</div>}
      <div className={`relative z-10 px-3 ${artUrl ? 'pt-24' : 'pt-10'} pb-3`}>
        <div className="font-bold text-sm text-[#efe9dc]">{item.name}</div>
        {(item.tag || item.element) && <span className="inline-block mt-1 text-[10px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: item.element ? ELEMENT_COLORS[item.element] || '#3a3155' : borderColor }}>{item.element?.toUpperCase() || item.tag}</span>}
        {item.cc != null && <div className="mt-1 text-xs text-[#ff9b9b] font-bold">+{item.cc} CC</div>}
        {item.power != null && <div className="mt-1 text-xs text-[#7eea9e] font-bold">Potencia {item.power}</div>}
        {item.hp != null && type === 'armor' && <div className="mt-1 text-xs text-[#ffdf7a] font-bold">+{item.hp} HP</div>}
        <div className="mt-1.5 text-[11px] text-[#a89fbb] leading-snug">{item.txt}</div>
        <div className="flex items-center gap-1 mt-2 justify-end"><span className="font-heading font-extrabold text-[10px] text-[#FFD24A] border border-[#a9771f] rounded px-1" style={{ background: 'linear-gradient(180deg, #2a2010, #16100a)' }}>BF</span><span className="text-[7px] text-[#9a8f7a]">Nº {String(item.num).padStart(3, '0')}</span></div>
      </div>
    </div>
  );
}