import React from 'react';
import EquipCard from '@/components/cards/EquipCard';
import AnnotatedCard from '@/components/guide/AnnotatedCard';
import { getLang } from '@/lib/i18n';

const EN = getLang() === 'en';
const T = (es, en) => (EN ? en : es);

// Diagrama "Partes de una carta de equipamiento" (hechizos, armas, armaduras,
// objetos). Cada marcador se mide del DOM real. El maná solo aparece en los
// hechizos; en armas/armaduras/objetos no hay orbe azul y se muestra una nota.
const PARTS = [
  { k: 'art', i: '🎨', n: T('Arte', 'Art'), d: T('Ilustración de la carta a sangre completa.', 'Full-bleed card illustration.'), c: '#c9a227' },
  { k: 'name', i: '📛', n: T('Nombre', 'Name'), d: T('Nombre del hechizo, arma, armadura u objeto.', 'Name of the spell, weapon, armor or item.'), c: '#fff5dc' },
  { k: 'cost', i: '🪙', n: T('Coste de oro', 'Gold cost'), d: T('Monedas que cuesta (orbe dorado arriba a la izquierda).', 'Coins it costs (gold orb, top left).'), c: '#FFD24A' },
  { k: 'mana', i: '🔵', n: T('Maná', 'Mana'), d: T('Solo hechizos: maná que cuesta lanzarlo (orbe azul arriba a la derecha).', 'Spells only: mana it costs to cast (blue orb, top right).'), note: T('Solo los hechizos tienen maná. Armas, armaduras y objetos no llevan este orbe.', 'Only spells have mana. Weapons, armors and items don’t carry this orb.'), c: '#6ec6ff' },
  { k: 'tag', i: '🏷', n: T('Elemento · Tipo', 'Element · Type'), d: T('Fuego, hielo, rayo… en hechizos; tipo en armas y armaduras.', 'Fire, ice, lightning… on spells; type on weapons and armors.'), c: '#8b6bff' },
  { k: 'stat', i: '🔢', n: T('Stat', 'Stat'), d: T('Bonus que aplica: +CC, potencia, +HP… (no en hechizos).', 'Bonus it grants: +CC, power, +HP… (not on spells).'), c: '#e0653f' },
  { k: 'desc', i: '✦', n: T('Habilidad · Texto', 'Ability · Text'), d: T('Qué hace la carta al jugarla.', 'What the card does when played.'), c: '#ffe07b' },
  { k: 'logo', i: '🟡', n: T('Marca', 'Seal'), d: T('Sello de Bizarre Fantasies.', 'Bizarre Fantasies seal.'), c: '#FFD24A' },
  { k: 'num', i: '#', n: T('Nº de colección', 'Collection №'), d: T('Base Set · Nº 046.', 'Base Set · № 046.'), c: '#ffe7a8' },
];

export default function EquipPartsDiagram({ item, type }) {
  if (!item) return null;
  return (
    <AnnotatedCard parts={PARTS} width={210} height={320} hint={T('Pasa el ratón o toca cada marcador de la carta para ver qué es.', 'Hover or tap each marker on the card to see what it is.')}>
      <div style={{ width: 210 }}><EquipCard item={item} type={type} /></div>
    </AnnotatedCard>
  );
}