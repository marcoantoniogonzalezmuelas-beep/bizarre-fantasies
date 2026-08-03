import React from 'react';
import { motion } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

const PHOENIX_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/caba9677e_generated_image.png'; // Ave Fénix (ability_anim)

// Luces del dron, pero con un ave fénix volando en su lugar: el fénix recorre
// la escena en arco dejando estelas de luz de colores cálidos (fuego) mientras
// dos focos lo siguen y proyectan pools en el suelo.
export default function PhoenixLights() {
  const colors = ['#ff7a18', '#ffd24a', '#ff4a3a', '#ffb347', '#ffe27a'];
  const cut = useCutoutSrc(PHOENIX_IMG);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Conos de luz que siguen al fénix */}
      {[
        { x: 22, color: colors[0], delay: 0 },
        { x: 60, color: colors[1], delay: 0.7 },
      ].map((c, k) => (
        <motion.div key={k}
          className="absolute top-0 -translate-x-1/2"
          style={{ left: `${c.x}%`, width: 320, height: '82%', transformOrigin: '50% 0%' }}
          animate={{ x: [0, 220, -120, 60, 0], opacity: [0.55, 0.95, 0.6, 0.9, 0.55] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{ width: 10, height: '82%', background: `linear-gradient(to bottom, ${c.color}, transparent)`, filter: 'blur(4px)' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 320, height: 320, background: `radial-gradient(ellipse 50% 70% at 50% 22%, ${c.color}66 0%, ${c.color}33 42%, transparent 72%)`, filter: 'blur(10px)', mixBlendMode: 'screen' }} />
        </motion.div>
      ))}

      {/* Pools en el suelo */}
      <div className="absolute -bottom-6 left-0 right-0 h-1/4 flex justify-around opacity-70">
        {colors.slice(0, 4).map((c, i) => (
          <motion.div key={i} className="rounded-full"
            style={{ width: 280, height: 90, background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${c}66, transparent 70%)`, filter: 'blur(10px)', mixBlendMode: 'screen' }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.6 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Ave fénix volando en arco con halo ardiente */}
      <motion.div
        className="absolute top-[8%] left-0"
        animate={{ x: ['12vw', '74vw', '40vw', '18vw', '12vw'], y: [0, -22, 16, -12, 0], rotate: [-8, 6, -4, 5, -8] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        {cut && (
          <motion.img
            src={cut} alt="" draggable={false}
            className="relative select-none pointer-events-none"
            style={{ width: 130, height: 'auto', filter: 'drop-shadow(0 6px 12px rgba(255,80,0,.6)) drop-shadow(0 0 18px rgba(255,160,40,.5))' }}
            animate={{ scale: [1, 1.08, 0.96, 1.05, 1], opacity: [0.92, 1, 0.9, 1, 0.92] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {/* Estela de brasas */}
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.span key={i}
            className="absolute rounded-full pointer-events-none"
            style={{ width: 5 + (i % 3) * 2, height: 5 + (i % 3) * 2, background: colors[i % colors.length], boxShadow: `0 0 8px ${colors[i % colors.length]}`, left: -(6 + i * 8), top: 8 + (i % 2 ? -4 : 4) }}
            animate={{ opacity: [0, 1, 0], y: [0, 14, 28], x: [0, -4, 8] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: i * 0.18 }}
          />
        ))}
        {/* Halo de color */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ width: 130, height: 130, filter: 'blur(14px)', mixBlendMode: 'screen' }}
          animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}aa, transparent 70%)`) }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Neblina cálida de fondo */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/3 opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(255,120,30,.4), transparent 72%)' }} />
    </div>
  );
}