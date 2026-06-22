import React from 'react';

const TYPE_COLORS = {
  spell: '#8b6bff',
  melee: '#e0653f',
  ranged: '#3fb56a',
  armor: '#5a8fd6',
  object: '#d6b13f',
  bonus: '#3a3155',
};

const ELEMENT_COLORS = {
  fuego: '#d6552a', hielo: '#3aa0c8', rayo: '#caa12f', agua: '#2f7fd6',
  curacion: '#2f9d54', proteccion: '#caa12f', arcano: '#7a5fd0', estado: '#8a5fb0',
};

export default function EquipCard({ item, type, onClick }) {
  const borderColor = TYPE_COLORS[type] || '#3c3158';

  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-xl"
      style={{ background: 'linear-gradient(180deg, #2b2244, #221a36)', border: `1.5px solid #3c3158`, borderTop: `3px solid ${borderColor}` }}
      onClick={() => onClick?.(item)}
    >
      {/* Cost coin */}
      <div className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-[#5a3d06] text-xs shadow-md" style={{ background: 'radial-gradient(circle at 34% 30%, #ffeaa6, #FFD24A 46%, #a9771f)', border: '2px solid #7c5410' }}>
        {item.cost}
      </div>

      {/* Mana badge for spells */}
      {item.mana != null && (
        <div className="absolute top-2.5 right-2 bg-[#1b2b58] border border-[#46618c] text-[#bcd2ff] text-[10px] font-extrabold rounded-lg px-1.5 py-0.5">
          🔵 {item.mana}
        </div>
      )}

      <div className="px-3 pt-10 pb-3">
        <div className="font-bold text-sm text-[#efe9dc]">{item.name}</div>

        {/* Tags */}
        {(item.tag || item.element) && (
          <span className="inline-block mt-1 text-[10px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: item.element ? ELEMENT_COLORS[item.element] || '#3a3155' : borderColor }}>
            {item.element?.toUpperCase() || item.tag}
          </span>
        )}

        {/* Stats for weapons */}
        {item.cc != null && <div className="mt-1 text-xs text-[#ff9b9b] font-bold">+{item.cc} CC</div>}
        {item.power != null && <div className="mt-1 text-xs text-[#7eea9e] font-bold">Potencia {item.power}</div>}
        {item.hp != null && type === 'armor' && <div className="mt-1 text-xs text-[#ffdf7a] font-bold">+{item.hp} HP</div>}

        <div className="mt-1.5 text-[11px] text-[#a89fbb] leading-snug">{item.txt}</div>

        <div className="flex items-center gap-1 mt-2 justify-end">
          <span className="font-heading font-extrabold text-[10px] text-[#FFD24A] border border-[#a9771f] rounded px-1" style={{ background: 'linear-gradient(180deg, #2a2010, #16100a)' }}>BF</span>
          <span className="text-[7px] text-[#9a8f7a]">Nº {String(item.num).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  );
}