import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

const DONUT_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/feef33293_generated_image.png';

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

  const d0 = useCutoutSrc(ducks[0]);
  const d1 = useCutoutSrc(ducks[1]);
  const o0 = useCutoutSrc(others[0]);
  const o1 = useCutoutSrc(others[1]);

  const IMG = 'h-full w-auto max-w-none object-contain select-none';
  const IMG_STYLE = { filter: 'drop-shadow(0 14px 26px rgba(0,0,0,.7))' };

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {phase === 0 ? (
          <div key="ducks" className="absolute inset-0 flex flex-row">
            <div
              className="relative h-full w-1/2 flex items-center justify-start overflow-hidden"
              style={{ maskImage: 'linear-gradient(to right, #000 52%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, #000 52%, transparent 100%)' }}
            >
              {d0 && (
                <motion.img
                  src={d0} alt="" draggable={false}
                  className={IMG} style={IMG_STYLE}
                  initial={duckMotion('l').initial} animate={duckMotion('l').animate} transition={duckMotion('l').transition}
                />
              )}
            </div>
            <div
              className="relative h-full w-1/2 flex items-center justify-end overflow-hidden"
              style={{ maskImage: 'linear-gradient(to left, #000 52%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, #000 52%, transparent 100%)' }}
            >
              {d1 && (
                <motion.img
                  src={d1} alt="" draggable={false}
                  className={IMG} style={IMG_STYLE}
                  initial={duckMotion('r').initial} animate={duckMotion('r').animate} transition={duckMotion('r').transition}
                />
              )}
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
                {o0 && (
                  <motion.img
                    src={o0} alt="" draggable={false}
                    className={IMG} style={IMG_STYLE}
                    initial={{ opacity: 0, x: '312px', scale: 0.55 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ opacity: { duration: 0.7 }, x: { duration: 0.9, ease: 'easeOut' }, scale: { duration: 0.9, ease: 'easeOut' } }}
                  />
                )}
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
                {o1 && (
                  <motion.img
                    src={o1} alt="" draggable={false}
                    className={IMG} style={IMG_STYLE}
                    initial={{ opacity: 0, x: '-312px', scale: 0.55 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ opacity: { duration: 0.7, delay: 0.1 }, x: { duration: 0.9, delay: 0.1, ease: 'easeOut' }, scale: { duration: 0.9, delay: 0.1, ease: 'easeOut' } }}
                  />
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Donut de fresa volador con luces */}
      <DonutFlyer accent={accent} />

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

// Donut de fresa volador que recorre la escena en arco dejando estelas de luz
// rosadas y pulsos de brillo, como una mascota dulce y mágica.
function DonutFlyer({ accent }) {
  const cut = useCutoutSrc(DONUT_IMG);
  const colors = useMemo(
    () => ['#ff5a8a', '#ff8fb0', '#ffd24a', '#b13bff', '#ffb3d9'],
    []
  );
  return (
    <motion.div
      className="absolute top-[10%] left-0 pointer-events-none z-[2]"
      animate={{ left: ['14%', '70%', '38%', '20%', '14%'], y: [0, -28, 18, -14, 0], rotate: [-10, 10, -5, 7, -10] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Conos de luz que caen del donut */}
      {[
        { dx: -30, hue: colors[0], delay: 0 },
        { dx: 30, hue: colors[1], delay: 0.6 },
      ].map((c, k) => (
        <motion.div key={k}
          className="absolute left-1/2 top-[60%] -translate-x-1/2 pointer-events-none rounded-full"
          style={{ width: 120, height: '70vh', marginLeft: c.dx,
            background: `linear-gradient(to bottom, ${c.hue}aa 0%, ${c.hue}44 45%, transparent 80%)`,
            filter: 'blur(10px)', mixBlendMode: 'screen' }}
          animate={{ opacity: [0.2, 0.85, 0.3, 0.8, 0.2], scaleY: [0.7, 1.1, 0.85, 1, 0.7] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
        />
      ))}

      {/* Sprinkles de luz que parpadean alrededor del donut */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ width: 5 + (i % 3) * 2, height: 5 + (i % 3) * 2, background: colors[i % colors.length],
            boxShadow: `0 0 8px ${colors[i % colors.length]}`,
            left: 40 + Math.cos(i) * 70, top: 30 + (i % 2 ? -1 : 1) * 40 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4] }}
          transition={{ duration: 0.9 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeOut', delay: i * 0.22 }}
        />
      ))}

      {cut && (
        <motion.img
          src={cut} alt="Donut de fresa" draggable={false}
          className="relative select-none pointer-events-none"
          style={{ width: 120, height: 'auto', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,.7))' }}
          animate={{ scale: [1, 1.08, 0.96, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Halo de color alrededor del donut */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: 140, height: 140, filter: 'blur(14px)', mixBlendMode: 'screen' }}
        animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}aa, transparent 70%)`) }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}