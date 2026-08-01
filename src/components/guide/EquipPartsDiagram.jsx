import React from 'react';
import EquipCard from '@/components/cards/EquipCard';
import AnnotatedCard from '@/components/guide/AnnotatedCard';

// Diagrama "Partes de una carta de equipamiento" (hechizos, armas, armaduras,
// objetos). Cada marcador se mide del DOM real. El maná solo aparece en los
// hechizos; en armas/armaduras/objetos no hay orbe azul y se muestra una nota.
const PARTS = [
  { k: 'art', i: '🎨', n: 'Arte', d: 'Ilustración de la carta a sangre completa.', c: '#c9a227' },
  { k: 'name', i: '📛', n: 'Nombre', d: 'Nombre del hechizo, arma, armadura u objeto.', c: '#fff5dc' },
  { k: 'cost', i: '🪙', n: 'Coste de oro', d: 'Monedas que cuesta (orbe dorado arriba a la izquierda).', c: '#FFD24A' },
  { k: 'mana', i: '🔵', n: 'Maná', d: 'Solo hechizos: maná que cuesta lanzarlo (orbe azul arriba a la derecha).', note: 'Solo los hechizos tienen maná. Armas, armaduras y objetos no llevan este orbe.', c: '#6ec6ff' },
  { k: 'tag', i: '🏷', n: 'Elemento · Tipo', d: 'Fuego, hielo, rayo… en hechizos; tipo en armas y armaduras.', c: '#8b6bff' },
  { k: 'stat', i: '🔢', n: 'Stat', d: 'Bonus que aplica: +CC, potencia, +HP… (no en hechizos).', c: '#e0653f' },
  { k: 'desc', i: '✦', n: 'Habilidad · Texto', d: 'Qué hace la carta al jugarla.', c: '#ffe07b' },
  { k: 'logo', i: '🟡', n: 'Marca', d: 'Sello de Bizarre Fantasies.', c: '#FFD24A' },
  { k: 'num', i: '#', n: 'Nº de colección', d: 'Base Set · Nº 046.', c: '#ffe7a8' },
];

export default function EquipPartsDiagram({ item, type }) {
  if (!item) return null;
  return (
    <AnnotatedCard parts={PARTS} width={210} height={320} hint="Pasa el ratón o toca cada marcador de la carta para ver qué es.">
      <div style={{ width: 210 }}><EquipCard item={item} type={type} /></div>
    </AnnotatedCard>
  );
}