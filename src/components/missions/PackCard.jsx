import React, { useState } from 'react';
import HeroCardFace from '@/components/cards/HeroCardFace';
import { HERO_ART, HERO_ELITE_ART } from '@/lib/artUrls';
import { isEpic } from '@/components/missions/missionRules';

export default function PackCard({ card, selected, disabled, onSelect, forceElite, hideActions }) {
  const [eliteState, setElite] = useState(false);
  const elite = forceElite || eliteState;
  const n = Number(card.number || 0) - 1;
  const hero = {
    ...card, num: card.number, art: card.art_url || HERO_ART[n],
    eliteArt: card.elite_art_url || HERO_ELITE_ART[n] || card.art_url,
    eCc: card.elite_cc, eAd: card.elite_ad, eHe: card.elite_he, eHp: card.elite_hp,
    ability: card.ability_name, abilityTxt: card.ability_text,
    eAbility: card.elite_ability_name, eTxt: card.elite_ability_text,
  };
  const epic = isEpic(card);
  return <div className={`pack-card ${selected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}>
    <div className="pack-card-face" aria-label={`${card.name}, ${elite ? 'élite' : 'normal'}`}>
      <HeroCardFace hero={hero} elite={elite} />
      {selected && <div className="pack-card-chosen">✓ ELEGIDO</div>}
      {epic && <div className="pack-card-epic">★ ÉPICO</div>}
    </div>
    {!hideActions && <div className="pack-card-actions">
      <button className="mission-button" onClick={() => setElite(v => !v)}>{elite ? 'Ver normal' : 'Ver élite'}</button>
      {onSelect && <button className="mission-button primary" disabled={disabled} aria-pressed={selected} onClick={onSelect}>{selected ? 'Quitar' : 'Elegir héroe'}</button>}
    </div>}
  </div>;
}