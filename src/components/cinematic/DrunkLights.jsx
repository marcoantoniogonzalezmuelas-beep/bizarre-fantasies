import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

const BEER_JUG_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/038191cb4_generated_image.png';

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

  // Burbujas chispeantes: pequeñas, rápidas y brillantes, como las de la cerveza
  // espumando al brindis. Llevan un destelle blanco (sparkle) que parpadea.
  const sparkles = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      left: 4 + i * 6.1 + (i % 3) * 3,
      size: 6 + (i % 4) * 5,
      dur: 3.2 + (i % 4) * 0.9,
      delay: (i % 5) * 0.6,
      drift: (i % 2 ? 1 : -1) * (10 + (i % 3) * 8),
      hue: ['#fff2c0', '#ffe49a', '#fff8e0', '#ffd870'][i % 4],
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

      {/* Burbujas chispeantes (espuma del brindis) */}
      {sparkles.map((s, k) => (
        <motion.div key={'s'+k} className="absolute bottom-[-4%] rounded-full pointer-events-none"
          style={{ left: `${s.left}%`, width: s.size, height: s.size,
            background: `radial-gradient(circle at 38% 32%, #ffffff 0%, ${s.hue} 45%, ${s.hue}33 72%, transparent 80%)`,
            boxShadow: `0 0 10px ${s.hue}, 0 0 18px ${s.hue}88`, mixBlendMode: 'screen' }}
          animate={{ y: ['0vh', '-52vh'], x: [-s.drift/2, s.drift/2, -s.drift/3, s.drift/2], opacity: [0, 1, 0.9, 0], scale: [0.7, 1.15, 1, 0.6] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: 'easeOut', delay: s.delay }}
        />
      ))}

      {/* Jarra de cerveza volando que genera las luces del brindis */}
      <BeerJugFlyer />

      {/* Neblina cálida de taberna */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/3 opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(180,120,60,.4), transparent 72%)' }} />
    </div>
  );
}

function BeerJugFlyer() {
  const cut = useCutoutSrc(BEER_JUG_IMG, true);
  const jetColors = ['#ffcf7a', '#ffd27a', '#9ad8ff', '#ffe08a', '#9ad8ff', '#ffe08a', '#ffd27a'];
  const jets = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    dx: (i - 3) * 18, hue: jetColors[i % jetColors.length],
    dur: 1.8 + (i % 3) * 0.5, delay: i * 0.2, w: 60 + (i % 3) * 30,
  })), []);
  return (
    <motion.div className="absolute top-[8%] left-0 z-[2]"
      animate={{ left: ['12%', '66%', '34%', '58%', '20%', '48%', '12%'], y: [0, -90, 60, -30, 80, -50, 0], rotate: [-8, 10, -4, 7, -6, 5, -8] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}>
      {/* Chorros de luz dorada que caen desde la jarra */}
      {jets.map((j, k) => (
        <motion.div key={k} className="absolute left-1/2 top-[65%] -translate-x-1/2 rounded-full pointer-events-none"
          style={{ width: j.w, height: '62vh', marginLeft: j.dx,
            background: `linear-gradient(to bottom, ${j.hue}cc 0%, ${j.hue}55 35%, transparent 78%)`,
            filter: 'blur(8px)', mixBlendMode: 'screen', transformOrigin: '50% 0%' }}
          animate={{ opacity: [0.2, 0.9, 0.4, 0.85, 0.2], scaleY: [0.7, 1.1, 0.85, 1, 0.7] }}
          transition={{ duration: j.dur, repeat: Infinity, ease: 'easeInOut', delay: j.delay }}
        />
      ))}
      {cut && (
        <motion.img src={cut} alt="Jarra de cerveza" draggable={false}
          className="relative select-none pointer-events-none"
          style={{ width: 92, height: 'auto', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.7))' }}
          animate={{ scale: [1, 1.05, 0.97, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}