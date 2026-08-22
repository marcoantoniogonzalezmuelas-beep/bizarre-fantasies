import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { t } from '@/lib/i18n';

// Botón "Salir" para móvil/tablet: vive FUERA del juego, así que se ve a tamaño
// real (el juego va encogido) y es fácil de pulsar. Su confirmación es un
// cuadrito propio, sin fondo oscuro ni desenfoque sobre la pantalla.
export default function MobileExitButton({ onQuit, scale = 1 }) {
  const [ask, setAsk] = useState(false);

  return (
    <div
      className="fixed top-2 right-2 z-[60] flex flex-col items-end gap-2"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top right' }}
    >
      <button
        onClick={() => setAsk(v => !v)}
        className="flex items-center gap-1.5 px-4 py-3 rounded-full font-heading font-black text-[13px] text-[#3a2600] bg-gradient-to-b from-[#ffe27a] via-[#FFD24A] to-[#c8901f] border-2 border-[#8a5f10] shadow-[0_4px_14px_rgba(0,0,0,.55)] active:scale-95"
      >
        <LogOut size={16} /> {t('Salir')}
      </button>

      {ask && (
        <div className="w-[248px] rounded-2xl border-2 border-[#FFD24A] bg-[#160f28] p-3 shadow-[0_10px_28px_rgba(0,0,0,.7)]">
          <div className="font-heading font-black text-[13px] text-[#fff5dc] leading-tight">
            {t('¿Salir de la partida?')}
          </div>
          <div className="mt-1 text-[11px] text-[#cfc6dd] leading-snug">
            {t('Se perderá el progreso de esta partida.')}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setAsk(false)} className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-[#efe9dc] bg-white/10 border border-white/20 active:scale-95">
              {t('Cancelar')}
            </button>
            <button onClick={() => { setAsk(false); onQuit(); }} className="flex-1 py-2.5 rounded-xl text-[12px] font-black text-[#3a2600] bg-gradient-to-b from-[#ffe27a] to-[#c8901f] active:scale-95">
              {t('Salir')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}