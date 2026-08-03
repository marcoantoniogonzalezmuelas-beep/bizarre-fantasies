import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Luces de comicidad: focos de colores alegres (circus/varieté) que rebotan
// y parpadean con ritmo rápido, más estrellas y confeti flotando. Ambiente
// juguetón y divertido. Pensado para la diapositiva inicial de bienvenida.
export default function ComedyLights() {
  const spots = useMemo(() => {
    const hues = ['#ffd24a', '#ff7adf', '#7ad6ff', '#9dff8a', '#ff9a6a', '#ffe27a', '#b08bff'];
    return Array.from({ length: 7 }, (_, i) => ({
      left: 8 + i * 12.6,
      hue: hues[i % hues.length],
      size: 110 + (i % 3) * 40,
      dur: 1.8 + (i % 3) * 0.5,
      delay: i * 0.18,
      bounce: 12 + (i % 3) * 8,
    }));
  }, []);

  const stars = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({
      left: 6 + i * 11.8 + (i % 3) * 5,
      top: 14 + (i % 4) * 18,
      size: 8 + (i % 3) * 6,
      dur: 2.4 + (i % 3) * 0.6,
      delay: i * 0.4,
      hue: ['#ffd24a', '#ff7adf', '#7ad6ff', '#9dff8a'][i % 4],
    })),
    []
  );

  const confetti = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({
      left: 3 + i * 5.4,
      size: 8 + (i % 4) * 5,
      dur: 5 + (i % 4) * 1.2,
      delay: (i % 5) * 0.8,
      drift: (i % 2 ? 1 : -1) * (18 + (i % 3) * 14),
      hue: ['#ffd24a', '#ff7adf', '#7ad6ff', '#9dff8a', '#ff9a6a', '#ffe27a', '#b08bff'][i % 7],
      rot: (i % 2 ? 1 : -1) * (80 + (i % 3) * 40),
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Focos circulares alegres que rebotan y parpadean */}
      {spots.map((s, k) => (
        <motion.div key={k} className="absolute top-[4%] -translate-x-1/2 rounded-full"
          style={{ left: `${s.left}%`, width: s.size, height: s.size * 1.5,
            background: `radial-gradient(ellipse 50% 60% at 50% 18%, ${s.hue}88 0%, ${s.hue}33 45%, transparent 75%)`,
            filter: 'blur(5px)', mixBlendMode: 'screen' }}
          animate={{ y: [0, -s.bounce, 0], opacity: [0.5, 0.95, 0.5, 0.85, 0.5] }}
          transition={{ duration: s.dur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: s.delay }}
        />
      ))}

      {/* Estrellas que palpitan */}
      {stars.map((s, k) => (
        <motion.div key={'s'+k} className="absolute pointer-events-none"
          style={{ left: `${s.left}%`, top: `${s.top}%`, color: s.hue, filter: `drop-shadow(0 0 6px ${s.hue})` }}
          animate={{ scale: [0.6, 1.2, 0.6], rotate: [0, 90, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.6 6.5L21 9.3l-5 4.3L17.5 21 12 17l-5.5 4L9 13.6 4 9.3l6.4-.8z" />
          </svg>
        </motion.div>
      ))}

      {/* Confeti que cae flotando */}
      {confetti.map((c, k) => (
        <motion.div key={'c'+k} className="absolute top-[-6%] rounded-[2px] pointer-events-none"
          style={{ left: `${c.left}%`, width: c.size, height: c.size * 1.8,
            background: c.hue, boxShadow: `0 0 10px ${c.hue}cc` }}
          animate={{ y: ['0vh', '88vh'], x: [-c.drift/2, c.drift/2, -c.drift/2, c.drift/2], rotate: [c.rot, -c.rot, c.rot, -c.rot], opacity: [0, 1, 1, 0.8, 0] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: 'easeIn', delay: c.delay }}
        />
      ))}

      {/* Neblina cálida de fondo */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/3 opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(255,200,120,.4), transparent 72%)' }} />
    </div>
  );
}