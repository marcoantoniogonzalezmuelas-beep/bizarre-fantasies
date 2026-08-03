import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Dron que sobrevuela la escena emitiendo focos de color que barren e iluminan
// a los dos héroes. El dron vuela en un arco horizontal, bobeando, y desde él
// descienden dos conos de luz (uno por héroe, ~22% y ~78%) que pulsan y cambian
// de color, como cámaras/focos de un concierto sobrevolando a los protagonistas.
export default function DroneLights() {
  const colors = useMemo(
    () => ['#ff5a3c', '#3cd0ff', '#ffd24a', '#b08bff', '#5aff8a', '#ff7adf'],
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Conos de luz sobre cada héroe (fijos, pulsan color) */}
      {[22, 78].map((cx, k) => (
        <div key={k} className="absolute top-0 pointer-events-none" style={{ left: `${cx}%`, transform: 'translateX(-50%)' }}>
          {/* Cono de luz que baja del dron al héroe */}
          <motion.div
            className="pointer-events-none"
            style={{
              width: 260, height: '72vh',
              background: `radial-gradient(ellipse 42% 78% at 50% 8%, currentColor 0%, transparent 74%)`,
              filter: 'blur(7px)', mixBlendMode: 'screen',
            }}
            animate={{ color: colors, opacity: [0.35, 0.7, 0.5, 0.7, 0.35] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: k * 1.2 }}
          />
          {/* Pool de luz sobre el héroe */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{ bottom: '6vh', width: 220, height: 160, filter: 'blur(8px)', mixBlendMode: 'screen' }}
            animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}cc, ${c}33 55%, transparent 75%)`), opacity: [0.5, 0.9, 0.6, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: k * 1.2 }}
          />
        </div>
      ))}

      {/* Dron volando en arco, bobing */}
      <motion.div
        className="absolute top-[7%] left-0"
        animate={{ x: ['10vw', '78vw', '46vw', '14vw', '10vw'], y: [0, -14, 10, -8, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Drone />
        {/* Halo del dron */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ width: 90, height: 90, filter: 'blur(10px)', mixBlendMode: 'screen' }}
          animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}88, transparent 70%)`) }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Neblina sutil de escenario */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/3 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(120,90,160,.4), transparent 70%)' }} />
    </div>
  );
}

function Drone() {
  return (
    <div className="relative" style={{ width: 64, height: 28 }}>
      {/* Cuerpo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md"
        style={{ width: 22, height: 12, background: 'linear-gradient(#3a3a44,#15151c)', border: '1px solid rgba(255,255,255,.4)', boxShadow: '0 0 8px rgba(0,0,0,.6)' }} />
      {/* Luz frontal parpadeante */}
      <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: 5, height: 5 }}
        animate={{ background: ['#ff3b3b', '#ff7a7a', '#ff3b3b'], boxShadow: ['0 0 6px #ff3b3b', '0 0 14px #ff5a5a', '0 0 6px #ff3b3b'] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Brazos + rotores */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], i) => (
        <div key={i} className="absolute" style={{ left: '50%', top: '50%', transform: `translate(${dx * 24 - 6}px, ${dy * 12 - 6}px)` }}>
          <div className="absolute rounded-full" style={{ width: 12, height: 12, border: '1.5px solid rgba(255,255,255,.5)', background: 'rgba(0,0,0,.35)' }} />
          <motion.div className="absolute rounded-full"
            style={{ width: 16, height: 2.4, background: 'rgba(255,255,255,.55)', left: -2, top: 4.8 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.12 + i * 0.02, repeat: Infinity, ease: 'linear' }} />
        </div>
      ))}
    </div>
  );
}