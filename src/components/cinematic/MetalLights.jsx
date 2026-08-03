import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Luces de concierto metal: haces de focos giratorios (rojo/azul/violeta/verde)
// que barren el escenario desde lo alto + estroboscopia rápida + neblina de
// escenario. Pensado para la diapositiva de El Heavy (headbang).
export default function MetalLights() {
  const beams = useMemo(() => {
    const hues = ['#ff2d2d', '#2d7bff', '#b03bff', '#3bff8a', '#ff8a2d'];
    return Array.from({ length: 5 }, (_, i) => ({
      left: 8 + i * 21,
      hue: hues[i % hues.length],
      width: 26 + (i % 3) * 8,
      dur: 4 + (i % 3) * 1.4,
      delay: i * 0.5,
      rot: [28 - i * 6, -34 + i * 5, 18 - i * 4, -22 + i * 6],
    }));
  }, []);

  const strobes = useMemo(
    () => Array.from({ length: 3 }, (_, i) => ({ delay: i * 0.37, dur: 0.55 + i * 0.1, hue: ['#ffffff', '#ff2d2d', '#2d7bff'][i] })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Neblina de escenario (humo bajo) */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/2 opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(120,90,160,.5), transparent 65%)' }} />

      {/* Haces de focos giratorios */}
      {beams.map((b, k) => (
        <div key={k} className="absolute top-[-6%] h-[130%] pointer-events-none"
          style={{ left: `${b.left}%`, width: `${b.width}vw` }}>
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 origin-top"
            style={{
              width: '180%', height: '100%',
              background: `linear-gradient(to bottom, ${b.hue}cc 0%, ${b.hue}55 18%, ${b.hue}12 42%, transparent 72%)`,
              filter: 'blur(1.4px)',
              mixBlendMode: 'screen',
            }}
            animate={{ rotate: b.rot, opacity: [0.5, 0.9, 0.4, 0.8] }}
            transition={{ duration: b.dur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: b.delay }}
          />
        </div>
      ))}

      {/* Barrido de luz que cruza el escenario */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(80deg, transparent 38%, rgba(255,255,255,.10) 49%, transparent 60%)', mixBlendMode: 'screen' }}
        animate={{ x: ['-30%', '130%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Estroboscopia rápida (flashes de color) */}
      {strobes.map((s, k) => (
        <motion.div key={k} className="absolute inset-0 pointer-events-none"
          style={{ background: s.hue, mixBlendMode: 'screen' }}
          animate={{ opacity: [0, 0, 0.18, 0, 0] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'linear' }}
        />
      ))}

      {/* Pulso de calor en el centro del escenario */}
      <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,60,60,.22), transparent 65%)', filter: 'blur(20px)' }}
        animate={{ scale: [0.8, 1.15, 0.8], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}