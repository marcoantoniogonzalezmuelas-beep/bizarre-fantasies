import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Choque bizarro entre dos animaciones 3D reales del juego (ability_anim).
// Se muestran COMPLETOS (object-contain, altura a pantalla) anclados a los
// bordes exteriores, sin marco y a pantalla completa. El MOVIMIENTO de cada
// combatiente se elige por la prop `motion` para que cada diapositiva se
// mueva distinta: flote, embestida, caída, subida, diagonal, rotación, zoom.
// Con `swap` los combatientes cambian de lado entre escenas.

const MOTIONS = {
  float:    { entry: 10, x: [0, 3, 0],            y: [0, -10, 0],      scale: [1, 1.04, 1],         rotate: [-1.2, 1.2, -1.2],          mirrorY: false, tx: 4,   ty: 5,   ts: 4,   tr: 3.2 },
  charge:   { entry: 14, x: [0, 16, -5, 2, 0],    y: [0, -12, 3, -8, 0], scale: [1, 1.09, 0.97, 1.03, 1], rotate: [-2.2, 3, -1.2, 1.4, -2.2], mirrorY: false, tx: 2.4, ty: 4.6, ts: 3.6, tr: 3 },
  down:     { entry: 8,  x: [0, 5, 0],            y: [0, 75, 0],       scale: [1, 1.05, 1],         rotate: [-2, 2, -2],                mirrorY: false, tx: 3,   ty: 2.6, ts: 4,   tr: 3 },
  up:       { entry: 8,  x: [0, 5, 0],            y: [0, -75, 0],      scale: [1, 1.05, 1],         rotate: [-2, 2, -2],                mirrorY: false, tx: 3,   ty: 2.8, ts: 4,   tr: 3 },
  diagonal: { entry: 14, x: [0, 15, -4, 0],       y: [0, 48, -12, 0],  scale: [1, 1.07, 0.98, 1],   rotate: [-3, 2, -1, 0],             mirrorY: true,  tx: 2.8, ty: 3.4, ts: 3.6, tr: 3 },
  rotate:   { entry: 8,  x: [0, 3, 0],            y: [0, -8, 0],       scale: [1, 1.06, 1],         rotate: [-16, 16, -16],            mirrorY: false, tx: 3,   ty: 4.5, ts: 3.5, tr: 2.2 },
  zoom:     { entry: 10, x: [0, 8, 0],            y: [0, -10, 0],      scale: [1, 1.14, 0.92, 1],   rotate: [-1.5, 1.5, -1.5],          mirrorY: false, tx: 2.6, ty: 4,   ts: 2,   tr: 3.2 },
  spin:     { entry: 8,  x: [0, 4, 0],            y: [0, -10, 0],       scale: [1, 1.06, 1],         rotate: [0, 360],                   mirrorY: false, tx: 3.2, ty: 4.5, ts: 4,   tr: 3 },
};

function preset(name) {
  // cross: los combatientes se cruzan, desaparecen a mitad de trayecto y
  // reaparecen en el lado OPUESTO (el de la izquierda pasa a la derecha y
  // viceversa). Es un movimiento a una sola vez (x/opacity no loopean).
  if (name === 'cross') {
    const mk = (side) => {
      const s = side === 'r' ? -1 : 1;
      return {
        initial: { opacity: 0, x: (10 * s) + 'vw' },
        animate: {
          opacity: [0, 1, 1, 0, 1, 1],
          x: [(10 * s), 0, 0, (95 * s), (95 * s), (95 * s)].map((v) => v + 'vw'),
          y: [0, -8, 0],
          scale: [1, 1.06, 1],
          rotate: s > 0 ? [-1, 1, -1] : [1, -1, 1],
        },
        transition: {
          opacity: { duration: 3.4, times: [0, 0.12, 0.42, 0.5, 0.6, 1], ease: 'easeInOut' },
          x: { duration: 3.4, times: [0, 0.12, 0.42, 0.5, 0.6, 1], ease: 'easeInOut' },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        },
      };
    };
    return { L: mk('l'), R: mk('r') };
  }
  const p = MOTIONS[name] || MOTIONS.float;
  const mk = (side) => {
    const s = side === 'r' ? -1 : 1;
    const my = p.mirrorY ? -1 : 1;
    return {
      initial: { opacity: 0, x: (p.entry * s) + '%' },
      animate: {
        opacity: 1,
        x: p.x.map((v) => (v * s) + (p.xunit || '%')),
        y: p.y.map((v) => v * my),
        scale: p.scale,
        rotate: p.rotate.map((v) => v * s),
      },
      transition: {
        opacity: { duration: 0.6 },
        x: { duration: p.tx, repeat: Infinity, ease: 'easeInOut' },
        y: { duration: p.ty, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: p.ts, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: p.tr, repeat: Infinity, ease: 'easeInOut' },
      },
    };
  };
  return { L: mk('l'), R: mk('r') };
}

export default function BattleClash({ left, right, accent = '#ff7a18', kind = 'clash', swap = false, motion: motionName = 'float' }) {
  const embers = useMemo(
    () => Array.from({ length: 14 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 2.5 + Math.random() * 2.8,
      size: 2 + Math.random() * 4,
    })),
    []
  );

  // swap: invierte qué combatiente va a cada lado.
  const leftSrc = swap ? right : left;
  const rightSrc = swap ? left : right;
  const M = useMemo(() => preset(motionName), [motionName]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050308]">
      <div className="absolute inset-0 flex flex-col lg:flex-row">
        {/* combatiente izquierdo (móvil: arriba · escritorio: izquierda) */}
        <div className="relative h-1/2 lg:h-full lg:w-1/2 flex items-center justify-center lg:justify-start overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(62% 56% at 50% 50%, ${accent}3a, transparent 72%)` }} />
          <motion.img
            src={leftSrc} alt="" draggable={false}
            className="w-full h-full object-cover select-none lg:h-full lg:w-auto lg:max-w-none lg:object-contain"
            initial={M.L.initial} animate={M.L.animate} transition={M.L.transition}
          />
          <div className="absolute inset-0 pointer-events-none hidden lg:block" style={{ background: 'linear-gradient(90deg, transparent 52%, #050308)' }} />
        </div>
        {/* combatiente derecho (móvil: abajo · escritorio: derecha) */}
        <div className="relative h-1/2 lg:h-full lg:w-1/2 flex items-center justify-center lg:justify-end overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(62% 56% at 50% 50%, ${accent}3a, transparent 72%)` }} />
          <motion.img
            src={rightSrc} alt="" draggable={false}
            className="w-full h-full object-cover select-none lg:h-full lg:w-auto lg:max-w-none lg:object-contain"
            initial={M.R.initial} animate={M.R.animate} transition={M.R.transition}
          />
          <div className="absolute inset-0 pointer-events-none hidden lg:block" style={{ background: 'linear-gradient(270deg, transparent 52%, #050308)' }} />
        </div>
      </div>

      {/* halo de luz central (escritorio): aura del color de la escena tras el choque */}
      <motion.div
        className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{ background: `radial-gradient(38% 62% at 50% 50%, ${accent}33, transparent 72%)` }}
        animate={{ opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* scrim central para legibilidad del texto narrado */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 58% 68% at 50% 52%, #050308e0, transparent 82%)' }} />

      {/* ---- efectos de interacción ---- */}
      {kind === 'shoot' && (
        <>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[3px] rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}, #fff, ${accent}, transparent)`, boxShadow: `0 0 20px ${accent}` }}
            initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.7 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
            style={{ background: `radial-gradient(${accent}, transparent 70%)` }}
            animate={{ scale: [0.4, 1.5, 0.4], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </>
      )}

      {kind === 'sword' && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '78%', height: '6px', borderRadius: 999, background: `linear-gradient(90deg, transparent, #fff, ${accent}, transparent)`, boxShadow: `0 0 26px ${accent}`, rotate: '-18deg' }}
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1.15, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.3 }}
        />
      )}

      {kind === 'clash' && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full"
            style={{ background: `radial-gradient(${accent}, transparent 70%)` }}
            animate={{ scale: [0.6, 1.8, 0.6], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2"
            style={{ borderColor: accent }}
            animate={{ scale: [0.5, 2.3], opacity: [0.8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        </>
      )}

      {kind === 'chill' && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
            style={{ background: `radial-gradient(${accent}66, transparent 70%)` }}
            animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {Array.from({ length: 10 }).map((_, k) => (
            <motion.span
              key={k} className="absolute bottom-[18%] rounded-full"
              style={{ left: `${42 + k * 3.4}%`, width: 7, height: 7, background: accent, boxShadow: `0 0 10px ${accent}` }}
              animate={{ y: [0, -200], opacity: [0, 1, 0] }}
              transition={{ duration: 3 + (k % 3), repeat: Infinity, delay: k * 0.3, ease: 'easeOut' }}
            />
          ))}
        </>
      )}

      {kind === 'fire' && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full"
            style={{ background: `radial-gradient(${accent}, #ffea00 40%, transparent 72%)` }}
            animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {Array.from({ length: 18 }).map((_, k) => (
            <motion.span
              key={k} className="absolute bottom-0 rounded-full pointer-events-none"
              style={{ left: `${30 + (k * 2.4)}%`, width: 4 + (k % 3), height: 4 + (k % 3), background: k % 2 ? accent : '#ffea00', boxShadow: `0 0 10px ${accent}` }}
              animate={{ y: [0, -260], opacity: [0, 1, 0], scale: [1, 0.4] }}
              transition={{ duration: 2.4 + (k % 3), repeat: Infinity, delay: k * 0.18, ease: 'easeOut' }}
            />
          ))}
        </>
      )}

      {/* brasas ascendentes */}
      {embers.map((e, k) => (
        <motion.span
          key={k} className="absolute bottom-0 rounded-full pointer-events-none"
          style={{ left: `${e.left}%`, width: e.size, height: e.size, background: accent, boxShadow: `0 0 8px ${accent}` }}
          animate={{ y: [0, -300], opacity: [0, 0.8, 0] }}
          transition={{ duration: e.dur, repeat: Infinity, delay: e.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}