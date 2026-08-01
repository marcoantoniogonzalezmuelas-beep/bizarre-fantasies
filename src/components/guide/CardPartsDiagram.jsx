import React from 'react';
import HeroCard from '@/components/cards/HeroCard';

// Diagrama "Partes de una carta": un héroe de ejemplo a la izquierda y la
// lista anotada de todas sus partes a la derecha. Sirve de entrada visual a
// toda la guía.
const PARTS = [
  { i: '🎨', n: 'Arte', d: 'Ilustración única de la carta.' },
  { i: '📛', n: 'Nombre · Título', d: 'El héroe y su epíteto o apellido.' },
  { i: '🪙', n: 'Coste de oro', d: 'Monedas que cuesta comprarla (orbe dorado arriba a la izquierda).' },
  { i: '🛡', n: 'Raza · Clan', d: 'Cada raza tiene su color y símbolo (Guerreros, Druidas, No-muertos…).' },
  { i: '⚔️', n: 'CC', d: 'Cuerpo a Cuerpo: daño del golpe melé.' },
  { i: '🏹', n: 'AD', d: 'A Distancia: el daño del disparo es potencia × AD.' },
  { i: '🔮', n: 'HE', d: 'Magia: potencia del hechizo (gasta maná).' },
  { i: '❤️', n: 'HP', d: 'Puntos de Vida (barra verde). Al llegar a 0 cae.' },
  { i: '🔵', n: 'Maná', d: 'Reserva para lanzar hechizos y usar objetos (orbe azul). No se regenera sola.' },
  { i: '✦', n: 'Habilidad', d: 'Poder especial propio del héroe (franja dorada).' },
  { i: '⭐', n: 'Forma Élite', d: 'Al caer por primera vez, renace con stats mejoradas.' },
  { i: '#', n: 'Nº de colección', d: 'Base Set · Nº 001.' },
];

export default function CardPartsDiagram({ hero }) {
  if (!hero) return null;
  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="flex justify-center">
        <div className="w-[230px]"><HeroCard hero={hero} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {PARTS.map((p) => (
          <div key={p.n} className="flex items-start gap-2.5 rounded-xl bg-black/40 border border-[#3c3158]/70 px-3 py-2.5">
            <span className="flex-none w-8 h-8 rounded-full flex items-center justify-center bg-[#1a1330] border border-[#b8902a]/60 text-[15px]">{p.i}</span>
            <div>
              <div className="font-heading font-bold text-[13px] text-[#ffe9a8] leading-tight">{p.n}</div>
              <div className="text-[12px] text-[#d8d0e4] leading-snug">{p.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}