import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Diapositiva de Expansiones temáticas, en dos fases:
//  · Fase 1: los Patitos de Goma (animación normal y élite) entran desde los
//    bordes, chocan en el centro y se desvanecen.
//  · Fase 2: aparecen otros dos héroes desde los bordes y flotan suavemente.
// A pantalla completa, sin marco, sobre fondo NEGRO PURO que se funde con la
// animación (sin halos ni degradados ni costura entre mitades).
export default function ExpansionSlide({ ducks = [null, null], others = [null, null], accent = '#b13bff', switchAt = 5200 }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setPhase(1), switchAt);
    return () => clearTimeout(id);
  }, [switchAt]);

  const embers = useMemo(
    () => Array.from({ length: 12 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 2.4 + Math.random() * 2.6,
      size: 2 + Math.random() * 3,
    })),
    []
  );

  const dur = switchAt / 1000;

  const duckMotion = (side) => {
    const s = side === 'r' ? -1 : 1;
    return {
      initial: { opacity: 0, x: 312 * s + 'px', scale: 0.9 },
      animate: {
        opacity: [0, 1, 1, 0],
        x: [312 * s, 36 * s, 0, -48 * s].map((v) => v + 'px'),
        scale: [0.9, 1.08, 1, 0.92],
        rotate: s > 0 ? [-2, 2, -1, -3] : [2, -2, 1, 3],
      },
      transition: {
        opacity: { duration: dur, times: [0, 0.18, 0.7, 1], ease: 'easeInOut' },
        x: { duration: dur, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' },
        scale: { duration: dur, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' },
        rotate: { duration: dur, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' },
      },
    };
  };

  const IMG = 'h-full w-auto max-w-none object-contain select-none';

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {phase === 0 ? (
          <div key="ducks" className="absolute inset-0 flex flex-row">
            <div
              className="relative h-full w-1/2 flex items-center justify-start overflow-hidden"
              style={{ maskImage: 'linear-gradient(to right, #000 52%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, #000 52%, transparent 100%)' }}
            >
              <motion.img
                src={ducks[0]} alt="" draggable={false}
                className={IMG} style={{ mixBlendMode: 'screen', maskImage: 'linear-gradient(to top, transparent, #000 14%)', WebkitMaskImage: 'linear-gradient(to top, transparent, #000 14%)' }}
                initial={duckMotion('l').initial} animate={duckMotion('l').animate} transition={duckMotion('l').transition}
              />
            </div>
            <div
              className="relative h-full w-1/2 flex items-center justify-end overflow-hidden"
              style={{ maskImage: 'linear-gradient(to left, #000 52%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, #000 52%, transparent 100%)' }}
            >
              <motion.img
                src={ducks[1]} alt="" draggable={false}
                className={IMG} style={{ mixBlendMode: 'screen', maskImage: 'linear-gradient(to top, transparent, #000 14%)', WebkitMaskImage: 'linear-gradient(to top, transparent, #000 14%)' }}
                initial={duckMotion('r').initial} animate={duckMotion('r').animate} transition={duckMotion('r').transition}
              />
            </div>
          </div>
        ) : (
          <div key="others" className="absolute inset-0 flex flex-row">
            <div
              className="relative h-full w-1/2 flex items-center justify-start overflow-hidden"
              style={{ maskImage: 'linear-gradient(to right, #000 52%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, #000 52%, transparent 100%)' }}
            >
              <motion.div
                className="h-full flex items-center justify-center"
                animate={{ y: [0, -9, 0], rotate: [-1.3, 1.3, -1.3] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.img
                  src={others[0]} alt="" draggable={false}
                  className={IMG} style={{ mixBlendMode: 'screen', maskImage: 'linear-gradient(to top, transparent, #000 14%)', WebkitMaskImage: 'linear-gradient(to top, transparent, #000 14%)' }}
                  initial={{ opacity: 0, x: '312px', scale: 0.55 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ opacity: { duration: 0.7 }, x: { duration: 0.9, ease: 'easeOut' }, scale: { duration: 0.9, ease: 'easeOut' } }}
                />
              </motion.div>
            </div>
            <div
              className="relative h-full w-1/2 flex items-center justify-end overflow-hidden"
              style={{ maskImage: 'linear-gradient(to left, #000 52%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, #000 52%, transparent 100%)' }}
            >
              <motion.div
                className="h-full flex items-center justify-center"
                animate={{ y: [0, -9, 0], rotate: [1.3, -1.3, 1.3] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.img
                  src={others[1]} alt="" draggable={false}
                  className={IMG} style={{ mixBlendMode: 'screen', maskImage: 'linear-gradient(to top, transparent, #000 14%)', WebkitMaskImage: 'linear-gradient(to top, transparent, #000 14%)' }}
                  initial={{ opacity: 0, x: '-312px', scale: 0.55 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ opacity: { duration: 0.7, delay: 0.1 }, x: { duration: 0.9, delay: 0.1, ease: 'easeOut' }, scale: { duration: 0.9, delay: 0.1, ease: 'easeOut' } }}
                />
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* brasas ascendentes ambientales */}
      {embers.map((e, k) => (
        <motion.span
          key={k} className="absolute bottom-0 rounded-full pointer-events-none"
          style={{ left: `${e.left}%`, width: e.size, height: e.size, background: accent, boxShadow: `0 0 8px ${accent}` }}
          animate={{ y: [0, -280], opacity: [0, 0.8, 0] }}
          transition={{ duration: e.dur, repeat: Infinity, delay: e.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}