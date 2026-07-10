import React from 'react';

const categoryLabel = {
  hero: 'Héroe', spell: 'Hechizo', ranged_weapon: 'Distancia', melee_weapon: 'Cuerpo a cuerpo',
  armor: 'Armadura', object: 'Objeto', bonus: 'Bonus', bizarro: 'Bizarro / Token', race: 'Raza'
};

export default function CardList({ cards, onEdit }) {
  if (!cards.length) return <div className="rounded-2xl border border-[#ffd24a22] bg-black/35 p-8 text-center text-[#cfc6dd]">No hay cartas con ese filtro.</div>;

  return <div className="grid gap-3">{cards.map(card => <button key={card.id} onClick={() => onEdit(card)} className="group grid grid-cols-[56px_1fr_auto] items-center gap-4 rounded-2xl border border-[#ffd24a22] bg-black/35 p-3 text-left transition hover:border-[#ffd24a88] hover:bg-black/50"><div className="h-14 w-14 overflow-hidden rounded-xl border border-[#ffd24a55] bg-[#07050b]">{card.art_url ? <img src={card.art_url} alt={card.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-lg">?</div>}</div><div className="min-w-0"><div className="truncate font-heading text-base font-black text-[#fff5dc]">{card.number ? `${card.number}. ` : ''}{card.name}</div><div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold text-[#cfc6dd]"><span className="rounded-full bg-[#ffd24a22] px-2 py-0.5 text-[#ffe49a]">{categoryLabel[card.category] || card.category}</span>{card.clan && <span>{card.clan}</span>}{card.type && <span>{card.type}</span>}</div></div><div className="rounded-full border border-[#ffd24a44] px-3 py-1 text-xs font-black text-[#ffe49a] group-hover:bg-[#ffd24a] group-hover:text-[#3a2600]">Editar</div></button>)}</div>;
}