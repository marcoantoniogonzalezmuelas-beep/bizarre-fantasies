import React from 'react';
import { motion } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

const SAMURAI_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d69ffc395_generated_image.png';

// Samurái de la época feudal japonesa que recorre la escena iluminándola con
// su katana tradicional: cada movimiento de la espada emite haces de luz que
// barren el campo de batalla. Ambiente épico / RPG japonés clásico de los 90.
export default function CraneLights() {
  const colors = ['#7cff9a', '#ffd24a', '#9ad9ff', '#ff6a3c', '#fff5cc'];
  const cut = useCutoutSrc(SAMURAI_IMG);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Haces de luz que emite la katana al barrer la escena */}
      {Array.from({ length: 4 }).map((_, k) => (
        <motion.div key={k}
          className="absolute top-[34%] left-0 pointer-events-none"
          style={{ width: '60vw', height: 6, transformOrigin: '0% 50%' }}
          animate={{
            x: ['-10vw', '20vw', '5vw', '30vw', '-10vw'],
            rotate: [-12, 6, -4, 10, -12],
            opacity: [0, 0.9, 0.3, 0.85, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: k * 0.9 }}
        >
          <div
            style={{
              width: '100%', height: '100%',
              background: `linear-gradient(to right, ${colors[k % colors.length]}, ${colors[(k + 2) % colors.length]}55, transparent)`,
              filter: 'blur(4px)', mixBlendMode: 'screen',
              boxShadow: `0 0 14px ${colors[k % colors.length]}`,
            }}
          />
        </motion.div>
      ))}

      {/* Destellos de corte (spark) al final de cada haz */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.span key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${30 + i * 10}%`, top: `${30 + (i % 2) * 8}%`,
            width: 6, height: 6, background: colors[i % colors.length],
            boxShadow: `0 0 10px ${colors[i % colors.length]}`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.8, 0.4] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut', delay: i * 0.4 }}
        />
      ))}

      {/* Pools en el suelo iluminados por la katana */}
      <div className="absolute -bottom-6 left-0 right-0 h-1/4 flex justify-around opacity-65">
        {colors.slice(0, 4).map((c, i) => (
          <motion.div key={i} className="rounded-full"
            style={{ width: 140, height: 48, background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${c}55, transparent 70%)`, filter: 'blur(8px)', mixBlendMode: 'screen' }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.6 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Samurái volando desde abajo con su katana brillante, vuelo irregular */}
      <motion.div
        className="absolute bottom-[6%] left-0"
        animate={{ left: ['14%', '58%', '24%', '48%', '16%', '40%', '14%'], y: [0, -140, 30, -90, 20, -60, 0], rotate: [-6, 9, -3, 12, -5, 6, -6] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        {cut && (
          <motion.img
            src={cut} alt="Samurái" draggable={false}
            className="relative select-none pointer-events-none"
            style={{ width: 150, height: 'auto', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,.7)) drop-shadow(0 0 18px rgba(255,210,74,.5))' }}
            animate={{ scale: [1, 1.05, 0.97, 1.03, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {/* Estela de brasas mágicas del filo */}
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.span key={i}
            className="absolute rounded-full pointer-events-none"
            style={{ width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, background: colors[i % colors.length], boxShadow: `0 0 8px ${colors[i % colors.length]}`, left: -(6 + i * 9), top: 30 + (i % 2 ? -6 : 6) }}
            animate={{ opacity: [0, 1, 0], y: [0, 14, 28], x: [0, -4, 8] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut', delay: i * 0.2 }}
          />
        ))}
        {/* Halo del filo de la katana */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ width: 140, height: 140, filter: 'blur(14px)', mixBlendMode: 'screen' }}
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