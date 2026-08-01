import React from 'react';

// Glosario visual de stats: qué significa cada atributo del juego.
const STATS = [
  { k: 'CC', n: 'Cuerpo a Cuerpo', d: 'Daño del golpe melé (héroe + arma C/C).', c: '#e0653f' },
  { k: 'AD', n: 'A Distancia', d: 'Daño del disparo = potencia del arma × AD.', c: '#3fb56a' },
  { k: 'HE', n: 'Magia', d: 'Potencia del hechizo (gasta maná).', c: '#8b6bff' },
  { k: 'HP', n: 'Puntos de Vida', d: 'La vida del héroe (barra verde). Llega a 0 → cae.', c: '#7ce287' },
  { k: '🔵', n: 'Maná', d: 'Reserva para hechizos y objetos. No se regenera: recúpéralo con Cristal u Orbe de Maná.', c: '#6ec6ff' },
  { k: '🪙', n: 'Coste de oro', d: 'Monedas que cuesta en subasta / equipamiento.', c: '#FFD24A' },
  { k: 'Pow', n: 'Potencia', d: 'Multiplicador de daño del arma a distancia.', c: '#caa12f' },
  { k: '⚡', n: 'Velocidad', d: 'Desempata turnos iguales: va antes quien tenga más.', c: '#ffe14a' },
  { k: '⭐', n: 'Forma Élite', d: 'Al caer por primera vez renace con stats mejoradas; si vuelve a caer, muere (salvo Pluma/Ave Fénix).', c: '#c06bff' },
];

export default function StatGlossary() {
  return (
    <section className="rounded-2xl border border-[#b8902a]/40 bg-gradient-to-b from-[#1a1230]/80 to-[#0b0813]/90 p-5 md:p-6">
      <h3 className="font-heading font-black text-xl md:text-2xl text-[#FFD24A] mb-4 tracking-wide">Glosario de stats</h3>
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