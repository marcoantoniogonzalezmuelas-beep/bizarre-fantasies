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
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div className="absolute inset-0 flex items-center justify-center gap-10 px-10">
        {/* Bando izquierdo */}
        <div className="flex flex-col items-center justify-center gap-3 h-full">
          {left.map((src, k) => <Hero key={'l' + k} src={src} side="l" idx={k} />)}
        </div>

        {/* Bando derecho */}
        <div className="flex flex-col items-center justify-center gap-3 h-full">
          {right.map((src, k) => <Hero key={'r' + k} src={src} side="r" idx={k} />)}
        </div>
      </div>

      {/* Emblema VS estilo Street Fighter, arriba-centro para no tapar el texto */}
      <motion.div
        className="absolute top-[7%] left-1/2 z-10"
        style={{ x: '-50%' }}
        initial={{ opacity: 0, scale: 0.2, rotate: -40 }}
        animate={{ opacity: 1, scale: [0.2, 1.35, 1], rotate: [-40, 8, 0] }}
        transition={{ duration: 0.9, delay: 0.55, ease: 'easeOut' }}
      >
        <motion.div
          className="relative"
          animate={{ rotate: [0, -1.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* estrella/burst detrás */}
          <div
            className="absolute -inset-8 rounded-full blur-[2px]"
            style={{ background: `radial-gradient(circle, ${accent}55, transparent 68%)` }}
          />
          {/* placas inclinadas rojo/amarillo partido en diagonal */}
          <div
            className="relative skew-x-[-14deg] border-y-2 border-[#ffe9a8] overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #d61313 49%, #ffd24a 51%)',
              boxShadow: '0 10px 30px rgba(0,0,0,.7), 0 0 18px rgba(255,210,74,.4)',
              clipPath: 'polygon(6% 0, 100% 0, 94% 100%, 0 100%)',
            }}
          >
            <div className="px-9 py-1.5 skew-x-[14deg] flex items-center justify-center">
              <span
                className="font-heading font-black italic text-white text-5xl leading-none tracking-tight"
                style={{ textShadow: '0 0 8px #000, 3px 3px 0 #000, -2px -2px 0 #b30303' }}
              >
                VS
              </span>
            </div>
          </div>
          {/* destellos laterales */}
          <motion.div
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-16 w-2 bg-[#ffe9a8] rounded-full origin-center"
            style={{ boxShadow: '0 0 10px #ffe9a8' }}
            animate={{ scaleY: [0.6, 1.1, 0.6], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -left-3 top-1/2 -translate-y-1/2 h-16 w-2 bg-[#ff8a85] rounded-full origin-center"
            style={{ boxShadow: '0 0 10px #ff8a85' }}
            animate={{ scaleY: [0.6, 1.1, 0.6], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </motion.div>
      </motion.div>

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