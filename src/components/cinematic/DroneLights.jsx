import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

const DRONE_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/3e9b60175_generated_image.png';

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
      <DroneFlyer colors={colors} />

      {/* Neblina sutil de escenario */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/3 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(120,90,160,.4), transparent 70%)' }} />
    </div>
  );
}

function DroneFlyer({ colors }) {
  const cut = useCutoutSrc(DRONE_IMG);
  return (
    <motion.div
      className="absolute top-[7%] left-0"
      animate={{ left: ['10%', '78%', '46%', '14%', '10%'], y: [0, -14, 10, -8, 0], rotate: [-6, 6, -3, 4, -6] }}
      transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
    >
      {cut && (
        <motion.img
          src={cut} alt="" draggable={false}
          className="relative select-none pointer-events-none"
          style={{ width: 92, height: 'auto', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.7))' }}
          animate={{ scale: [1, 1.06, 0.97, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {/* Halo de color que envuelve al dron */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: 110, height: 110, filter: 'blur(12px)', mixBlendMode: 'screen' }}
        animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}88, transparent 70%)`) }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}