import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCutoutSrc } from '@/lib/useCutoutSrc';

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
    const cut = useCutoutSrc(src);
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
        {cut && (
          <motion.img
            src={cut} alt="" draggable={false}
            className="h-full w-auto max-w-none object-contain select-none"
            style={{ filter: 'drop-shadow(0 12px 26px rgba(0,0,0,.75))' }}
            animate={{ y: [0, -9, 0], rotate: fromLeft ? [-1.3, 1.3, -1.3] : [1.3, -1.3, 1.3] }}
            transition={{ duration: 3.2 + idx * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
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

      {/* VS recortado (sólo letras, fondo negro) centrado: V arriba y S abajo
          con el texto del slide entre ambas, sin solaparse. Estilo pincel
          degradado amarillo→naranja→rojo→negro con contorno blanco. */}
      {[
        { ch: 'V', rot: -8, y0: '-120%', cls: 'top-[10%]' },
        { ch: 'S', rot: 6, y0: '120%', cls: 'bottom-[10%]' },
      ].map((it, k) => (
        <motion.div
          key={it.ch}
          className={'absolute left-1/2 z-10 ' + it.cls}
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: it.y0, scale: 0.3, rotate: it.rot * 3 }}
          animate={{ opacity: 1, y: 0, scale: [0.3, 1.18, 1], rotate: [it.rot * 3, it.rot * 0.4, it.rot] }}
          transition={{ duration: 0.9, delay: 0.5 + k * 0.12, ease: 'easeOut' }}
        >
          <motion.div
            className="relative"
            animate={{ rotate: [it.rot, it.rot * 1.3, it.rot], y: [0, k === 0 ? -6 : 6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span
              className="block font-heading select-none"
              style={{
                fontStyle: 'italic',
                fontWeight: 900,
                fontSize: 'clamp(96px, 19vw, 230px)',
                lineHeight: 0.82,
                background: 'linear-gradient(180deg, #ffe23a 0%, #ffae00 18%, #ff5a00 38%, #e60b0b 58%, #8b0000 80%, #1a0000 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                WebkitTextStroke: 'clamp(2px, 0.55vw, 5px) #ffffff',
                filter: 'drop-shadow(6px 6px 3px rgba(130,130,130,.95)) drop-shadow(0 0 2px #000)',
                textShadow: '0 0 14px rgba(255,90,0,.35)',
              }}
            >
              {it.ch}
            </span>
            {/* goteo de tinta bajo cada letra */}
            <span
              className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
              style={{
                width: 'clamp(6px, 0.9vw, 9px)',
                height: 'clamp(10px, 1.6vw, 18px)',
                background: 'linear-gradient(180deg, #e60b0b, #1a0000)',
                [k === 0 ? 'bottom' : 'top']: '-2px',
                filter: 'drop-shadow(0 2px 1px rgba(80,80,80,.8))',
              }}
            />
          </motion.div>
        </motion.div>
      ))}

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