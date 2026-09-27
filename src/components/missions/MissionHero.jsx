import React from 'react';
import PackCard from '@/components/missions/PackCard';

// Todas las misiones muestran los héroes con la misma carta real de subasta.
export default function MissionHero({ card, selected, disabled, onSelect }) {
  return <PackCard card={card} selected={selected} disabled={disabled} onSelect={onSelect} />;
}