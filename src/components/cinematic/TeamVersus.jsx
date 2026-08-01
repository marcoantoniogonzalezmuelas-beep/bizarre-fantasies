import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Versus 3 vs 3: seis héroes (tres por bando) en formación enfrentada con
// un emblema "VS" central, entrada desde los laterales y flote suave. Cada
// héroe se muestra completo (object-contain) sobre fondo oscuro, sin marco.
// Los combatientes del bando derecho llegan desde la derecha y los del
// izquierdo desde la izquierda, para reforzar la sensación de enfrentamiento.
export default function TeamVersus({ left = [], right = [], accent = '#ffd24a' }) {
  const embers = useMemo(
    () => Array.from({ length: 16 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 2.4 + Math.random() * 2.6,
      size: 2 + Math.random() * 3,
    })),
    []
  );

  const Hero = ({ src, side, idx }) => {
    const fromLeft = side === 'l';
    return (
      <motion.div
        className="relative h-[31%] w-auto flex items-center justify-center"
        initial={{ opacity: 0, x: fromLeft ? '-70%' : '70%', scale: 0.4 }}
        animate={{ opacity: 1, x: 0, scale: 1.2 }}
        transition={{
          opacity: { duration: 0.6, delay: 0.1 * idx },
          x: { duration: 0.9, delay: 0.1 * idx, ease: 'easeOut' },
          scale: { duration: 8, delay: 0.15 * idx, ease: 'easeOut' },
        }}
      >
        <motion.img
          src={src} alt="" draggable={false}
          className="h-full w-auto max-w-none object-contain select-none"
          style={{ filter: 'drop-shadow(0 12px 26px rgba(0,0,0,.75))' }}
          animate={{ y: [0, -9, 0], rotate: fromLeft ? [-1.3, 1.3, -1.3] : [1.3, -1.3, 1.3] }}
          transition={{ duration: 3.2 + idx * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    );
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050308]">
      {/* resplandor lateral por bando */}
      <div className="absolute inset-y-0 left-0 w-1/2 pointer-events-none" style={{ background: `linear-gradient(90deg, ${accent}22, transparent)` }} />
      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none" style={{ background: `linear-gradient(270deg, ${accent}22, transparent)` }} />

      <div className="absolute inset-0 flex items-center justify-center gap-6 px-8">
        {/* Bando izquierdo */}
        <div className="flex flex-col items-center justify-center gap-3 h-full">
          {left.map((src, k) => <Hero key={'l' + k} src={src} side="l" idx={k} />)}
        </div>

        {/* Emblema VS */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: [0.4, 1.25, 1] }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center font-heading font-black text-[#2a1d05] text-3xl border-2 border-[#ffe9a8]"
            style={{ background: 'radial-gradient(circle at 35% 30%, #fff3c4, #FFD24A 55%, #c98a1f)', boxShadow: `0 0 26px ${accent}, 0 0 52px ${accent}88` }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            VS
          </motion.div>
        </motion.div>

        {/* Bando derecho */}
        <div className="flex flex-col items-center justify-center gap-3 h-full">
          {right.map((src, k) => <Hero key={'r' + k} src={src} side="r" idx={k} />)}
        </div>
      </div>

      {/* brasas ascendentes */}
      {embers.map((e, k) => (
        <motion.span
          key={k} className="absolute bottom-0 rounded-full pointer-events-none"
          style={{ left: `${e.left}%`, width: e.size, height: e.size, background: accent, boxShadow: `0 0 8px ${accent}` }}
          animate={{ y: [0, -260], opacity: [0, 0.8, 0] }}
          transition={{ duration: e.dur, repeat: Infinity, delay: e.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}