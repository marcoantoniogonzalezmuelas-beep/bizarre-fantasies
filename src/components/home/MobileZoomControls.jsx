import React from 'react';
import { Plus, Minus, Maximize2 } from 'lucide-react';

// Controles de zoom para móvil/tablet: el juego se renderiza a 1200 px y se
// escala para caber en la pantalla. Estos botones amplían/reducen ese escalado
// y el contenedor permite desplazarse para ver toda la mesa.
export default function MobileZoomControls({ zoom, onZoom, onReset }) {
  const Btn = ({ onClick, label, children }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#ffd24a]/80 bg-[#1a1300]/95 text-[#ffd24a] shadow-[0_3px_12px_rgba(0,0,0,.7)] active:scale-90"
    >
      {children}
    </button>
  );

  return (
    <div className="absolute left-2 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2">
      <Btn onClick={() => onZoom(0.25)} label="Ampliar"><Plus className="h-5 w-5" strokeWidth={3} /></Btn>
      <div className="rounded-full border border-[#ffd24a]/50 bg-[#1a1300]/90 px-1 py-0.5 text-center font-heading text-[10px] font-black text-[#ffd24a]">
        {Math.round(zoom * 100)}%
      </div>
      <Btn onClick={() => onZoom(-0.25)} label="Reducir"><Minus className="h-5 w-5" strokeWidth={3} /></Btn>
      <Btn onClick={onReset} label="Ajustar a pantalla"><Maximize2 className="h-4 w-4" strokeWidth={3} /></Btn>
    </div>
  );
}