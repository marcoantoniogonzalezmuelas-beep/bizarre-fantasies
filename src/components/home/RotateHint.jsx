import React, { useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { t } from '@/lib/i18n';

// Aviso (solo móvil, solo en vertical) para girar la pantalla en las fases que
// necesitan ancho: equipamiento y batalla. Se puede cerrar y no vuelve a salir
// mientras dure la sesión.
export default function RotateHint({ onClose }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[60] w-[88vw] max-w-[340px] flex items-center gap-3 rounded-2xl px-3 py-2.5 border border-[#FFD24A]/70 bg-[#150d24]/95 shadow-[0_8px_28px_rgba(0,0,0,.7)] backdrop-blur-sm">
      <RotateCcw className="w-7 h-7 text-[#FFD24A] shrink-0 animate-pulse" />
      <div className="min-w-0 flex-1">
        <div className="font-heading font-black text-[12px] text-[#ffe49a] leading-tight">
          {t('Gira la pantalla')}
        </div>
        <div className="text-[10px] text-[#c9bfe0] leading-snug mt-0.5">
          {t('En horizontal se ve todo el tablero mucho más grande.')}
        </div>
      </div>
      <button
        type="button"
        onClick={() => { setGone(true); onClose?.(); }}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-[#FFD24A]/50 text-[#ffe49a]"
        aria-label={t('Cerrar')}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}