import React from 'react';
import { Check, Star } from 'lucide-react';
import { isEpic } from '@/components/missions/missionRules';
export default function MissionHero({ card, selected, disabled, onSelect }) {
  return <article className={`mission-hero ${selected ? 'is-selected' : ''}`}>
    <div className="mission-portrait">{card.art_url && <img src={card.art_url} alt={card.name} />}<span className="mission-cost">{card.cost} monedas</span>{isEpic(card) && <span className="mission-epic"><Star size={13} /> Épica</span>}</div>
    <div className="p-4 space-y-2"><h3 className="font-heading text-lg">{card.name}</h3><p className="text-xs opacity-75">{card.clan} · {card.type}</p>
      <p className="text-xs">CC {card.cc} · AD {card.ad} · HE {card.he} · Vida {card.hp}</p>
      <details className="text-xs leading-relaxed"><summary className="cursor-pointer">Ver habilidades</summary><p className="mt-2"><strong>{card.ability_name}</strong> · {card.ability_text}</p><p className="mt-2"><strong>Élite: {card.elite_ability_name}</strong> · {card.elite_ability_text}</p></details>
      {onSelect && <button className="mission-button w-full" disabled={disabled} aria-pressed={selected} onClick={onSelect}>{selected ? <><Check size={16} /> Quitar del ejército</> : 'Elegir héroe'}</button>}
    </div>
  </article>;
}