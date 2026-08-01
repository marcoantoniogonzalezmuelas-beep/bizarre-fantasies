import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Escena de choque bizarro entre dos cinemáticas reales del juego:
// dos cartas (ave fénix, patito de goma, transformer, liche…) se enfrentan
// en un campo oscuro con brasas, choque central de energía y flotación.
export default function BattleClash({ left, right, accent = '#ff7a18' }) {
  const embers = useMemo(
    () => Array.from({ length: 18 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 2.5 + Math.random() * 2.5,
      size: 2 + Math.random() * 4,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* atmósfera */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 62%, ${accent}22, #050308 68%)` }} />

      {/* combatiente izquierdo (espejado para mirar al centro) */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-2 md:pr-6"
        initial={{ x: '-18%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <motion.div
          className="relative w-[82%] max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden"
          style={{ boxShadow: `0 0 70px ${accent}55, 0 24px 50px #000`, border: `2px solid ${accent}` }}
          animate={{ y: [0, -12, 0], rotate: [0, -1.5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src={left} alt="" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 55%, #050308cc)' }} />
        </motion.div>
      </motion.div>

      {/* combatiente derecho */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-start pl-2 md:pl-6"
        initial={{ x: '18%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <motion.div
          className="relative w-[82%] max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden"
          style={{ boxShadow: `0 0 70px ${accent}55, 0 24px 50px #000`, border: `2px solid ${accent}` }}
          animate={{ y: [0, 12, 0], rotate: [0, 1.5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <img src={right} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(270deg, transparent 55%, #050308cc)' }} />
        </motion.div>
      </motion.div>

      {/* choque central */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-[72%] rounded-full"
        style={{ background: `linear-gradient(transparent, ${accent}, transparent)`, boxShadow: `0 0 30px ${accent}` }}
        animate={{ opacity: [0.4, 1, 0.4], scaleX: [1, 2.4, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full"
        style={{ background: `radial-gradient(${accent}, transparent 70%)` }}
        animate={{ scale: [0.8, 1.6, 0.8], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* brasas ascendentes */}
      {embers.map((e, k) => (
        <motion.span
          key={k}
          className="absolute bottom-0 rounded-full"
          style={{ left: `${e.left}%`, width: e.size, height: e.size, background: accent, boxShadow: `0 0 8px ${accent}` }}
          animate={{ y: [0, -320], opacity: [0, 1, 0] }}
          transition={{ duration: e.dur, repeat: Infinity, delay: e.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}