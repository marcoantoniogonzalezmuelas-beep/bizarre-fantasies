import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';
import { t } from '@/lib/i18n';

const MONTH_NAMES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Aviso épico en la cabecera del Ranking: el #1 del mes ganará el derecho de
// crear una carta nueva para el mes siguiente. Estilo fantasía oscura dorado.
export default function RankingPrizeBanner() {
  const { curMonth, nextMonth } = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    return { curMonth: MONTH_NAMES_ES[m], nextMonth: MONTH_NAMES_ES[(m + 1) % 12] };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #1a1208 0%, #0e0a16 45%, #1a0f2a 100%)',
        border: '1.5px solid rgba(255, 210, 74, 0.55)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 28px rgba(255,210,74,0.22), inset 0 0 0 1px rgba(255,236,170,0.08)',
      }}
    >
      {/* Brillo superior animado */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{ background: 'linear-gradient(180deg, rgba(255,210,74,0.18), transparent)' }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Líneas decorativas */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd24a] to-transparent opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#9a6b00] to-transparent opacity-60" />

      <div className="relative flex flex-col items-center gap-3 px-5 py-5 sm:flex-row sm:items-center sm:gap-5 sm:px-7">
        {/* Corona dorada con halo pulsante */}
        <div className="relative shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,210,74,0.45), transparent 70%)' }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20"
            style={{
              background: 'linear-gradient(160deg, #ffe49a, #FFD24A 55%, #c89a2e)',
              border: '2px solid #ffe9a8',
              boxShadow: '0 6px 22px rgba(255,180,40,0.55)',
            }}
          >
            <Crown className="h-8 w-8 text-[#3a2600] sm:h-10 sm:w-10" strokeWidth={2.2} fill="#3a2600" />
          </div>
        </div>

        {/* Texto */}
        <div className="flex-1 text-center sm:text-left">
          <div className="mb-1 flex items-center justify-center gap-1.5 sm:justify-start">
            <Sparkles className="h-3.5 w-3.5 text-[#ffd24a]" />
            <span className="font-heading text-[11px] font-black uppercase tracking-[0.32em] text-[#ffd24a] sm:text-xs">
              {t('Premio de temporada')}
            </span>
            <Sparkles className="h-3.5 w-3.5 text-[#ffd24a]" />
          </div>
          <h2 className="font-heading text-lg font-black leading-tight text-[#fff5dc] sm:text-2xl" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
            {t('El campeón de')} <span className="text-[#FFD24A]">{curMonth}</span> {t('creará la próxima carta')}
          </h2>
          <p className="mt-1 text-sm leading-snug text-[#cfc6dd] sm:text-base">
            {t('El primer clasificado del ranking mensual diseñará una carta nueva que se añadirá al juego en')} <span className="font-bold text-[#ffe49a]">{nextMonth}</span>.
          </p>
        </div>
      </div>
    </motion.div>
  );
}