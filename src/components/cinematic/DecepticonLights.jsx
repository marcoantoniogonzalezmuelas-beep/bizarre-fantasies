import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

const DECEPTICON_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/888548f76_generated_image.png';

// Robot Decepticon (transformable volador) que sobrevuela la escena del
// Transformer contra el Tanque emitiendo focos de color que barren e
// iluminan a los dos combatientes. Vuela en arco horizontal bobeando y
// desde él descienden dos conos de luz (~22% y ~78%) que pulsan y cambian
// de color, como cámaras/focos de un combate mecánico sobrevolando a los
// protagonistas. Reemplaza al dron genérico por un mecha Decepticon.
export default function DecepticonLights() {
  const colors = useMemo(
    () => ['#ff3c6a', '#3cd0ff', '#9d5bff', '#ffd24a', '#5affc8', '#ff7adf'],
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Conos de luz sobre cada combatiente (fijos, pulsan color) */}
      {[22, 78].map((cx, k) => (
        <div key={k} className="absolute top-0 pointer-events-none" style={{ left: `${cx}%`, transform: 'translateX(-50%)' }}>
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
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{ bottom: '6vh', width: 220, height: 160, filter: 'blur(8px)', mixBlendMode: 'screen' }}
            animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}cc, ${c}33 55%, transparent 75%)`), opacity: [0.5, 0.9, 0.6, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: k * 1.2 }}
          />
        </div>
      ))}

      {/* Estela de propulsores/jets detrás del mecha */}
      <DecepticonJetTrail colors={colors} />

      {/* Neblina tecnológica de escenario */}
      <div className="absolute -bottom-10 left-0 right-0 h-1/3 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(120,90,200,.4), transparent 70%)' }} />
    </div>
  );
}

function DecepticonJetTrail({ colors }) {
  const cut = useCutoutSrc(DECEPTICON_IMG);
  return (
    <motion.div
      className="absolute top-[6%] left-0"
      animate={{ x: ['12vw', '74vw', '40vw', '16vw', '12vw'], y: [0, -18, 12, -10, 0], rotate: [-8, 8, -4, 5, -8] }}
      transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Estela de propulsores magenta/cian */}
      <motion.div
        className="absolute left-[-30px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: 70, height: 16, filter: 'blur(6px)', mixBlendMode: 'screen' }}
        animate={{ background: ['#ff3c6a', '#3cd0ff', '#9d5bff', '#5affc8'].map((c) => `linear-gradient(to left, ${c}, transparent)`), opacity: [0.6, 0.9, 0.5, 0.9, 0.6] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      />
      {cut && (
        <motion.img
          src={cut} alt="" draggable={false}
          className="relative select-none pointer-events-none"
          style={{ width: 130, height: 'auto', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,.75))' }}
          animate={{ scale: [1, 1.05, 0.98, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {/* Halo de color que envuelve al mecha */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: 130, height: 130, filter: 'blur(14px)', mixBlendMode: 'screen' }}
        animate={{ background: colors.map((c) => `radial-gradient(circle, ${c}88, transparent 70%)`) }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}