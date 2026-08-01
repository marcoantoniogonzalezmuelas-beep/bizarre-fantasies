import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroCardFace from '@/components/cards/HeroCardFace';

// Diagrama "Partes de una carta": un héroe de ejemplo a la izquierda con un
// pin señalizado sobre cada marcador (coste de oro, HP, CC, AD, HE…), y la
// lista anotada a la derecha. Al pasar el ratón (o tocar) un elemento de la
// lista o un pin, se resalta la zona correspondiente en la carta y aparece su
// etiqueta. Sirve de entrada visual a toda la guía.
//
// Las posiciones (top/left/w/h en %) están calibradas sobre el layout de
// HeroCardFace (carta de 230×420). Maná y Forma Élite no aparecen en la cara
// del héroe: al activarlos se muestra una nota explicativa en su lugar.
const PARTS = [
  { k: 'arte', i: '🎨', n: 'Arte', d: 'Ilustración única de la carta.', top: 16, left: 12, w: 76, h: 42, c: '#c9a227' },
  { k: 'nombre', i: '📛', n: 'Nombre · Título', d: 'El héroe y su epíteto o apellido.', top: 70, left: 5, w: 90, h: 10, c: '#fff5dc' },
  { k: 'cost', i: '🪙', n: 'Coste de oro', d: 'Monedas que cuesta comprarla (orbe dorado arriba a la izquierda).', top: 1.5, left: 3, w: 22, h: 13, c: '#FFD24A' },
  { k: 'raza', i: '🛡', n: 'Raza · Clan', d: 'Cada raza tiene su color y símbolo (Guerreros, Druidas, No-muertos…).', top: 88, left: 4, w: 14, h: 8, c: '#b8902a' },
  { k: 'cc', i: '⚔️', n: 'CC', d: 'Cuerpo a Cuerpo: daño del golpe melé.', top: 58, left: 4, w: 29, h: 13, c: '#ff4b45' },
  { k: 'ad', i: '🏹', n: 'AD', d: 'A Distancia: el daño del disparo es potencia × AD.', top: 58, left: 36, w: 27, h: 13, c: '#54e876' },
  { k: 'he', i: '🔮', n: 'HE', d: 'Magia: potencia del hechizo (gasta maná).', top: 58, left: 65, w: 29, h: 13, c: '#b06cff' },
  { k: 'hp', i: '❤️', n: 'HP · Vida', d: 'Puntos de Vida (corazón rojo a la derecha de los stats). Al llegar a 0 cae.', top: 49, left: 60, w: 32, h: 14, c: '#ff5a4d' },
  { k: 'mana', i: '🔵', n: 'Maná', d: 'Reserva para lanzar hechizos y usar objetos (orbe azul). No se regenera sola.', note: 'El maná no se muestra en los héroes: aparece en hechizos y objetos como orbe azul 🔵 arriba a la derecha.', c: '#6ec6ff' },
  { k: 'habi', i: '✦', n: 'Habilidad', d: 'Poder especial propio del héroe (franja dorada abajo).', top: 79, left: 4, w: 92, h: 17, c: '#ffe07b' },
  { k: 'elite', i: '⭐', n: 'Forma Élite', d: 'Al caer por primera vez, renace con stats mejoradas.', note: 'La Forma Élite se ve al VOLTEAR la carta (botón ⟳ Élite). Renace con stats mejoradas al caer la primera vez.', c: '#c06bff' },
  { k: 'num', i: '#', n: 'Nº de colección', d: 'Base Set · Nº 001.', top: 92, left: 14, w: 44, h: 6, c: '#ffe7a8' },
];

export default function CardPartsDiagram({ hero }) {
  const [active, setActive] = useState(null);
  if (!hero) return null;

  const activePart = PARTS.find(p => p.k === active);

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      {/* Tarjeta con pins señalizados */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: 230, height: 420 }}>
          <HeroCardFace hero={hero} elite={false} />

          {PARTS.filter(p => p.top != null).map(p => {
            const cx = p.left + p.w / 2;
            const cy = p.top + p.h / 2;
            const isActive = active === p.k;
            const labelAbove = cy >= 22;
            return (
              <div key={p.k}>
                {/* Zona resaltada */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.18 }}
                    className="absolute rounded-xl pointer-events-none z-30"
                    style={{
                      top: `${p.top}%`, left: `${p.left}%`, width: `${p.w}%`, height: `${p.h}%`,
                      border: `2.5px solid ${p.c}`,
                      boxShadow: `0 0 18px 3px ${p.c}aa, inset 0 0 14px ${p.c}55`,
                      background: `${p.c}14`,
                    }}
                  />
                )}
                {/* Pin */}
                <button
                  type="button"
                  onMouseEnter={() => setActive(p.k)}
                  onMouseLeave={() => setActive(a => (a === p.k ? null : a))}
                  onClick={() => setActive(a => (a === p.k ? null : p.k))}
                  aria-label={p.n}
                  className="absolute z-30 rounded-full flex items-center justify-center text-[11px]"
                  style={{
                    top: `calc(${cy}% - 12px)`, left: `calc(${cx}% - 12px)`,
                    width: 24, height: 24, background: p.c, color: '#140a00',
                    border: '2px solid #08050f', boxShadow: `0 0 10px ${p.c}dd`,
                    transform: isActive ? 'scale(1.22)' : 'scale(1)',
                    transition: 'transform .15s ease', lineHeight: 1,
                  }}
                >
                  {p.i}
                </button>
                {/* Etiqueta flotante */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute z-40 -translate-x-1/2 rounded-full px-2.5 py-1 text-[11px] font-black text-center"
                      style={{
                        top: labelAbove ? `calc(${cy}% - 40px)` : `calc(${cy}% + 16px)`,
                        left: `${cx}%`,
                        background: p.c, color: '#140a00', textShadow: 'none',
                        boxShadow: '0 6px 16px rgba(0,0,0,.65)', maxWidth: 210, whiteSpace: 'nowrap',
                      }}
                    >
                      {p.n}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Nota para marcadores que no están en la cara del héroe (maná, élite) */}
          <AnimatePresence>
            {activePart && activePart.note && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.16 }}
                className="absolute z-40 left-1/2 -translate-x-1/2 w-[226px] rounded-xl px-3 py-2 text-[11px] font-bold text-center text-[#efe9dc]"
                style={{ bottom: -8, transform: 'translate(-50%, 100%)', background: '#0b0712ee', border: `1.5px solid ${activePart.c}99` }}
              >
                {activePart.note}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-3 text-center text-[11px] text-[#a89fbb]">
          Pasa el ratón o toca cada marcador para ver qué es.
        </p>
      </div>

      {/* Lista anotada */}
      <div className="grid sm:grid-cols-2 gap-2.5">
        {PARTS.map(p => {
          const isActive = active === p.k;
          return (
            <div
              key={p.k}
              onMouseEnter={() => setActive(p.k)}
              onMouseLeave={() => setActive(a => (a === p.k ? null : a))}
              onClick={() => setActive(a => (a === p.k ? null : p.k))}
              className="flex items-start gap-2.5 rounded-xl bg-black/40 border px-3 py-2.5 cursor-pointer transition-colors"
              style={{ borderColor: isActive ? p.c : '#3c315866', boxShadow: isActive ? `0 0 14px ${p.c}55` : 'none' }}
            >
              <span
                className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-[14px]"
                style={{ background: `${p.c}22`, border: `1.5px solid ${p.c}`, color: p.c, transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform .15s' }}
              >
                {p.i}
              </span>
              <div>
                <div className="font-heading font-bold text-[13px] text-[#ffe9a8] leading-tight">{p.n}</div>
                <div className="text-[12px] text-[#d8d0e4] leading-snug">{p.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}