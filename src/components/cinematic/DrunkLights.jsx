import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Luces de borrachera: pools de luz suaves que se tambalean (sway) con leve
// desfase y visión doble, más burbujas translúcidas que flotan. Ambiente de
// taberna tras unas cervezas de más. Pensado para la diapositiva del brindis.
export default function DrunkLights() {
  const pools = useMemo(() => {
    const hues = ['#ffcf7a', '#ffd27a', '#9ad8ff', '#c8ff8a', '#ffb0e0', '#ffe08a'];
    return Array.from({ length: 6 }, (_, i) => ({
      left: 10 + i * 15.5,
      hue: hues[i % hues.length],
      size: 160 + (i % 3) * 60,
      dur: 4.5 + (i % 3) * 1.3,
      delay: i * 0.6,
      sway: (i % 2 ? 1 : -1) * (10 + (i % 3) * 5),
      rot: (i % 2 ? 1 : -1) * (3 + (i % 2) * 2),
    }));
  }, []);

  const bubbles = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({
      left: 8 + i * 10.3 + (i % 3) * 4,
      size: 10 + (i % 4) * 8,
      dur: 7 + (i % 4) * 1.8,
      delay: i * 0.9,
      drift: (i % 2 ? 1 : -1) * (16 + (i % 3) * 10),
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Tambaleo general suave (visión doble/desfase) */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ filter: 'blur(2px)' }}
        animate={{ x: [-4, 4, -3, 3, -4], y: [0, -2, 1, -1, 0], rotate: [-0.6, 0.6, -0.4, 0.4, -0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Pools de luz que se tambalean */}
        {pools.map((p, k) => (
          <motion.div key={k} className="absolute top-[2%] -translate-x-1/2 rounded-full"
            style={{ left: `${p.left}%`, width: p.size, height: p.size * 1.5,
              background: `radial-gradient(ellipse 50% 60% at 50% 20%, ${p.hue}77 0%, ${p.hue}2a 45%, transparent 75%)`,
              filter: 'blur(7px)', mixBlendMode: 'screen' }}
            animate={{ x: [-p.sway/2, p.sway/2, -p.sway/2], rotate: [-p.rot, p.rot, -p.rot], opacity: [0.45, 0.8, 0.5, 0.7, 0.45] }}
            transition={{ duration: p.dur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: p.delay }}
          />
        ))}
      </motion.div>

      {/* Burbujas translúcidas que flotan hacia arriba (tono cervecero) */}
      {bubbles.map((b, k) => (
        <motion.div key={'b'+k} className="absolute bottom-[-6%] rounded-full pointer-events-none"
          style={{ left: `${b.left}%`, width: b.size, height: b.size,
            background: 'radial-gradient(circle at 38% 32%, rgba(255,240,200,.5), rgba(255,210,120,.12) 60%, transparent 72%)',
            border: '1px solid rgba(255,230,170,.18)', mixBlendMode: 'screen' }}
          animate={{ y: ['0vh', '-46vh'], x: [-b.drift/3, b.drift/3, -b.drift/3], opacity: [0, 0.7, 0.5, 0] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        />
      ))}

      {/* Neblina cálida de taberna */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/3 opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(180,120,60,.4), transparent 72%)' }} />
    </div>
  );
}