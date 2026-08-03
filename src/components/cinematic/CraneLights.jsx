import React from 'react';
import { motion } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

const CRANE_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/7b3f364a7_generated_image.png';

// Luces del dron, pero con una grulla japonesa (tancho) volando en su lugar:
// la grulla recorre la escena en arco lento dejando estelas de luz dorada
// mientras dos focos la siguen y proyectan pools en el suelo. Ambiente de
// épica japonesa / RPG clásico de los 90.
export default function CraneLights() {
  const colors = ['#ffd24a', '#ffe27a', '#ff9a6a', '#ffb347', '#fff5cc'];
  const cut = useCutoutSrc(CRANE_IMG);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Conos de luz que siguen a la grulla */}
      {[
        { x: 24, color: colors[0], delay: 0 },
        { x: 62, color: colors[2], delay: 0.8 },
      ].map((c, k) => (
        <motion.div key={k}
          className="absolute top-0 -translate-x-1/2"
          style={{ left: `${c.x}%`, width: 150, height: '78%', transformOrigin: '50% 0%' }}
          animate={{ x: [0, 180, -100, 50, 0], opacity: [0.4, 0.8, 0.5, 0.75, 0.4] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{ width: 5, height: '78%', background: `linear-gradient(to bottom, ${c.color}, transparent)`, filter: 'blur(3px)' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 150, height: 150, background: `radial-gradient(ellipse 50% 70% at 50% 22%, ${c.color}55 0%, ${c.color}22 42%, transparent 72%)`, filter: 'blur(7px)', mixBlendMode: 'screen' }} />
        </motion.div>
      ))}

      {/* Pools en el suelo */}
      <div className="absolute -bottom-6 left-0 right-0 h-1/4 flex justify-around opacity-65">
        {colors.slice(0, 4).map((c, i) => (
          <motion.div key={i} className="rounded-full"
            style={{ width: 130, height: 46, background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${c}55, transparent 70%)`, filter: 'blur(8px)', mixBlendMode: 'screen' }}
            animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.8 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Grulla volando en arco lento con halo dorado */}
      <motion.div
        className="absolute top-[9%] left-0"
        animate={{ x: ['12vw', '72vw', '42vw', '18vw', '12vw'], y: [0, -18, 14, -10, 0], rotate: [-4, 3, -2, 4, -4] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      >
        {cut && (
          <motion.img
            src={cut} alt="" draggable={false}
            className="relative select-none pointer-events-none"
            style={{ width: 120, height: 'auto', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.7)) drop-shadow(0 0 14px rgba(255,210,74,.4))' }}
            animate={{ scale: [1, 1.05, 0.97, 1.03, 1], opacity: [0.92, 1, 0.9, 1, 0.92] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {/* Estela de plumas doradas */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.span key={i}
            className="absolute rounded-full pointer-events-none"
            style={{ width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, background: colors[i % colors.length], boxShadow: `0 0 7px ${colors[i % colors.length]}`, left: -(6 + i * 9), top: 6 + (i % 2 ? -5 : 5) }}
            animate={{ opacity: [0, 1, 0], y: [0, 12, 24], x: [0, -3, 7] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.22 }}
          />
        ))}
        {/* Halo de color */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ width: 120, height: 120, filter: 'blur(14px)', mixBlendMode: 'screen' }}
          animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}aa, transparent 70%)`) }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Neblina cálida de fondo */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/3 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(255,180,80,.4), transparent 72%)' }} />
    </div>
  );
}