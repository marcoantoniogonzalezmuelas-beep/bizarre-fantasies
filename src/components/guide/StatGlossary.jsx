import React from 'react';
import { getLang } from '@/lib/i18n';

const EN = getLang() === 'en';
const T = (es, en) => (EN ? en : es);

// Glosario visual de stats: qué significa cada atributo del juego.
const STATS = [
  { k: 'CC', n: T('Cuerpo a Cuerpo', 'Melee'), d: T('Daño del golpe melé (héroe + arma C/C).', 'Damage of the melee strike (hero + melee weapon).'), c: '#e0653f' },
  { k: 'AD', n: T('A Distancia', 'Ranged'), d: T('Daño del disparo = potencia del arma × AD.', 'Shot damage = weapon power × AD.'), c: '#3fb56a' },
  { k: 'HE', n: T('Magia', 'Magic'), d: T('Potencia del hechizo (gasta maná).', 'Spell power (spends mana).'), c: '#8b6bff' },
  { k: 'HP', n: T('Puntos de Vida', 'Health Points'), d: T('La vida del héroe (barra verde). Llega a 0 → cae.', 'The hero’s health (green bar). Reaches 0 → it falls.'), c: '#7ce287' },
  { k: '🔵', n: T('Maná', 'Mana'), d: T('Reserva para hechizos y objetos. No se regenera: recúpéralo con Cristal u Orbe de Maná.', 'Reserve for spells and items. It doesn’t regenerate: recover it with a Mana Crystal or Orb.'), c: '#6ec6ff' },
  { k: '🪙', n: T('Coste de oro', 'Gold cost'), d: T('Monedas que cuesta en subasta / equipamiento.', 'Coins it costs in auction / equipment.'), c: '#FFD24A' },
  { k: 'Pow', n: T('Potencia', 'Power'), d: T('Multiplicador de daño del arma a distancia.', 'Ranged weapon damage multiplier.'), c: '#caa12f' },
  { k: '⚡', n: T('Velocidad', 'Speed'), d: T('Marcador ⚡ + número en cada héroe. Desempata turnos del mismo tipo: va antes el más rápido. Los más veloces (≥21) brillan en oro con el sello RÁPIDO.', 'The ⚡ + number marker on each hero. Breaks same-type turn ties: the faster goes first. The fastest (≥21) glow gold with a RÁPIDO badge.'), c: '#ffe14a' },
  { k: '⭐', n: T('Forma Élite', 'Elite Form'), d: T('Al caer por primera vez renace con stats mejoradas; si vuelve a caer, muere (salvo Pluma/Ave Fénix).', 'On its first fall it is reborn with improved stats; if it falls again, it dies (except Phoenix Feather/Phoenix Bird).'), c: '#c06bff' },
];

export default function StatGlossary() {
  return (
    <section className="rounded-2xl border border-[#b8902a]/40 bg-gradient-to-b from-[#1a1230]/80 to-[#0b0813]/90 p-5 md:p-6">
      <h3 className="font-heading font-black text-xl md:text-2xl text-[#FFD24A] mb-4 tracking-wide">{T('Glosario de stats', 'Stat glossary')}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {STATS.map((s) => (
          <div key={s.k} className="flex items-start gap-3 rounded-xl bg-black/40 border px-3.5 py-3" style={{ borderColor: `${s.c}55` }}>
            <span className="flex-none min-w-[42px] h-9 px-2 rounded-lg flex items-center justify-center font-heading font-black text-sm" style={{ background: `${s.c}22`, color: s.c, border: `1px solid ${s.c}77` }}>{s.k}</span>
            <div>
              <div className="font-bold text-[13px] text-[#ffe9a8] leading-tight">{s.n}</div>
              <div className="text-[12px] text-[#d8d0e4] leading-snug">{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}