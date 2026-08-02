import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Choque bizarro entre dos animaciones 3D reales del juego (ability_anim).
// Se muestran COMPLETOS (object-contain, altura a pantalla) anclados a los
// bordes exteriores, sin marco, sobre fondo NEGRO PURO que se funde con la
// animación (sin halos ni degradados centrales ni costura entre mitades).
// El MOVIMIENTO de cada combatiente se elige por la prop `motion` para que
// cada diapositiva se mueva distinta. Con `swap` cambian de lado entre escenas.

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

export default function BattleClash({ left, right, accent = '#ff7a18', swap = false, motion: motionName = 'float' }) {
  const embers = useMemo(
    () => Array.from({ length: 14 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 2.5 + Math.random() * 2.8,
      size: 2 + Math.random() * 4,
    })),
    []
  );

  const leftSrc = swap ? right : left;
  const rightSrc = swap ? left : right;
  const M = useMemo(() => preset(motionName), [motionName]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div className="absolute inset-0 flex flex-row">
        <div
          className="relative h-full w-1/2 flex items-center justify-start overflow-hidden"
          style={{ maskImage: 'linear-gradient(to right, #000 52%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, #000 52%, transparent 100%)' }}
        >
          <motion.img
            src={leftSrc} alt="" draggable={false}
            className="h-full w-auto max-w-none object-contain select-none"
            initial={M.L.initial} animate={M.L.animate} transition={M.L.transition}
          />
        </div>
        <div
          className="relative h-full w-1/2 flex items-center justify-end overflow-hidden"
          style={{ maskImage: 'linear-gradient(to left, #000 52%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, #000 52%, transparent 100%)' }}
        >
          <motion.img
            src={rightSrc} alt="" draggable={false}
            className="h-full w-auto max-w-none object-contain select-none"
            initial={M.R.initial} animate={M.R.animate} transition={M.R.transition}
          />
        </div>
      </div>

      {/* brasas ascendentes ambientales */}
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