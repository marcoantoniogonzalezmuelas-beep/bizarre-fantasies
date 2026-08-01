import React from 'react';
import HeroCardFace from '@/components/cards/HeroCardFace';
import AnnotatedCard from '@/components/guide/AnnotatedCard';

// Diagrama "Partes de un héroe": cada marcador se mide del DOM real.
const PARTS = [
  { k: 'art', i: '🎨', n: 'Arte', d: 'Ilustración única de la carta.', c: '#c9a227' },
  { k: 'name', i: '📛', n: 'Nombre · Título', d: 'El héroe y su epíteto o apellido.', c: '#fff5dc' },
  { k: 'cost', i: '🪙', n: 'Coste de oro', d: 'Monedas que cuesta comprarla (orbe dorado arriba a la izquierda).', c: '#FFD24A' },
  { k: 'clan', i: '🛡', n: 'Raza · Clan', d: 'Cada raza tiene su color y símbolo (Guerreros, Druidas, No-muertos…).', c: '#b8902a' },
  { k: 'cc', i: '⚔️', n: 'CC', d: 'Cuerpo a Cuerpo: daño del golpe melé.', c: '#ff4b45' },
  { k: 'ad', i: '🏹', n: 'AD', d: 'A Distancia: el daño del disparo es potencia × AD.', c: '#54e876' },
  { k: 'he', i: '🔮', n: 'HE', d: 'Magia: potencia del hechizo (gasta maná).', c: '#b06cff' },
  { k: 'hp', i: '❤️', n: 'HP · Vida', d: 'Puntos de Vida (corazón rojo a la derecha de los stats). Al llegar a 0 cae.', c: '#ff5a4d' },
  { k: 'mana', i: '🔵', n: 'Maná', d: 'Reserva para lanzar hechizos y usar objetos (orbe azul). No se regenera sola.', note: 'El maná no se muestra en los héroes: aparece en hechizos y objetos como orbe azul 🔵 arriba a la derecha.', c: '#6ec6ff' },
  { k: 'ability', i: '✦', n: 'Habilidad', d: 'Poder especial propio del héroe (franja dorada abajo).', c: '#ffe07b' },
  { k: 'elite', i: '⭐', n: 'Forma Élite', d: 'Al caer por primera vez, renace con stats mejoradas.', note: 'La Forma Élite se ve al VOLTEAR la carta (botón ⟳ Élite). Renace con stats mejoradas al caer la primera vez.', c: '#c06bff' },
  { k: 'num', i: '#', n: 'Nº de colección', d: 'Base Set · Nº 001.', c: '#ffe7a8' },
];

export default function CardPartsDiagram({ hero }) {
  if (!hero) return null;
  return (
    <AnnotatedCard parts={PARTS} width={230} height={420} hint="Pasa el ratón o toca cada marcador de la carta para ver qué es.">
      <HeroCardFace hero={hero} elite={false} />
    </AnnotatedCard>
  );
}