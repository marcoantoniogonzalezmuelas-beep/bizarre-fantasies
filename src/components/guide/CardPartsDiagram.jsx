import React, { useState } from 'react';
import HeroCardFace from '@/components/cards/HeroCardFace';
import AnnotatedCard from '@/components/guide/AnnotatedCard';
import { getLang } from '@/lib/i18n';

const EN = getLang() === 'en';
const T = (es, en) => (EN ? en : es);

// Diagrama "Partes de un héroe": cada marcador se mide del DOM real. Incluye
// un conmutador para ver la versión Normal o Élite del mismo héroe.
const PARTS = [
  { k: 'art', i: '🎨', n: T('Arte', 'Art'), d: T('Ilustración única de la carta.', 'The card’s unique illustration.'), c: '#c9a227' },
  { k: 'name', i: '📛', n: T('Nombre · Título', 'Name · Title'), d: T('El héroe y su epíteto o apellido.', 'The hero and their epithet or surname.'), c: '#fff5dc' },
  { k: 'cost', i: '🪙', n: T('Coste de oro', 'Gold cost'), d: T('Monedas que cuesta comprarla (orbe dorado arriba a la izquierda).', 'Coins it costs to buy (gold orb, top left).'), c: '#FFD24A' },
  { k: 'clan', i: '🛡', n: T('Raza · Clan', 'Race · Clan'), d: T('Cada raza tiene su color y símbolo (Guerreros, Druidas, No-muertos…).', 'Each race has its color and symbol (Warriors, Druids, Undead…).'), c: '#b8902a' },
  { k: 'cc', i: '⚔️', n: 'CC', d: T('Cuerpo a Cuerpo: daño del golpe melé.', 'Melee: damage of the melee strike.'), c: '#ff4b45' },
  { k: 'ad', i: '🏹', n: 'AD', d: T('A Distancia: el daño del disparo es potencia × AD.', 'Ranged: shot damage is weapon power × AD.'), c: '#54e876' },
  { k: 'he', i: '🔮', n: 'HE', d: T('Magia: potencia del hechizo (gasta maná).', 'Magic: spell power (spends mana).'), c: '#b06cff' },
  { k: 'hp', i: '❤️', n: T('HP · Vida', 'HP · Health'), d: T('Puntos de Vida (corazón rojo a la derecha de los stats). Al llegar a 0 cae.', 'Health points (red heart, right of the stats). At 0 it falls.'), c: '#ff5a4d' },
  { k: 'mana', i: '🔵', n: T('Maná', 'Mana'), d: T('Reserva para lanzar hechizos y usar objetos (orbe azul). No se regenera sola.', 'Reserve to cast spells and use items (blue orb). It doesn’t regenerate.'), note: T('El maná no se muestra en los héroes: aparece en hechizos y objetos como orbe azul 🔵 arriba a la derecha.', 'Mana isn’t shown on heroes: it appears on spells and items as a blue orb 🔵 at the top right.'), c: '#6ec6ff' },
  { k: 'ability', i: '✦', n: T('Habilidad', 'Ability'), d: T('Poder especial propio del héroe (franja dorada abajo).', 'The hero’s signature power (golden strip at the bottom).'), c: '#ffe07b' },
  { k: 'elite', i: '⭐', n: T('Forma Élite', 'Elite Form'), d: T('Al caer por primera vez, renace con stats mejoradas.', 'When it falls for the first time, it is reborn with improved stats.'), note: T('La Forma Élite se ve al VOLTEAR la carta (botón ⟳ Élite). Renace con stats mejoradas al caer la primera vez.', 'The Elite Form is seen by FLIPPING the card (⟳ Elite button). It is reborn with improved stats the first time it falls.'), c: '#c06bff' },
  { k: 'num', i: '#', n: T('Nº de colección', 'Collection №'), d: T('Base Set · Nº 001.', 'Base Set · № 001.'), c: '#ffe7a8' },
];

export default function CardPartsDiagram({ hero }) {
  const [elite, setElite] = useState(false);
  if (!hero) return null;
  const toggle = (
    <button
      onClick={() => setElite(e => !e)}
      className="mb-3 px-4 py-1.5 rounded-lg text-xs font-black border transition-colors"
      style={{
        background: elite ? 'linear-gradient(135deg,#3a1e5a,#1a0d2a)' : 'linear-gradient(135deg,#2a1d05,#120e07)',
        borderColor: elite ? '#c06bff' : '#FFD24A',
        color: elite ? '#e2b0ff' : '#ffe9a8',
        boxShadow: elite ? '0 0 12px rgba(192,107,255,.45)' : '0 0 12px rgba(255,210,74,.45)',
      }}
    >
      {elite ? T('⭐ Viendo forma Élite', '⭐ Elite form') : T('Ver forma Élite', 'View Elite form')}
    </button>
  );
  return (
    <AnnotatedCard parts={PARTS} width={230} height={420} aboveCard={toggle} hint={T('Pasa el ratón o toca cada marcador de la carta para ver qué es.', 'Hover or tap each marker on the card to see what it is.')}>
      <HeroCardFace hero={hero} elite={elite} />
    </AnnotatedCard>
  );
}