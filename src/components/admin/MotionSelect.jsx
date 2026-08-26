import React from 'react';
import { MOTION_LABELS, MOTION_OPTIONS } from '@/lib/abilityAnimMotions';

// Selector de MOVIMIENTO de la cinemática 3D: en vez de un desplegable, se
// muestran TODOS los movimientos disponibles en una lista con scroll, para que
// el admin los vea de un vistazo y no se le escape ninguno nuevo.
export default function MotionSelect({ label, value, accent = '#3c9eff', onChange }) {
  const current = value || 'auto';
  return (
    <div className="block">
      <span className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider" style={{ color: accent }}>
        <span>{label}</span>
        <span className="opacity-60">{MOTION_OPTIONS.length} movimientos</span>
      </span>
      <div
        className="max-h-[190px] space-y-1 overflow-y-auto rounded-lg border bg-black/45 p-1.5"
        style={{ borderColor: accent + '55' }}
      >
        {MOTION_OPTIONS.map((id) => {
          const active = current === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="block w-full rounded-md px-2 py-1.5 text-left text-[11px] font-semibold transition-colors"
              style={{
                background: active ? accent + '33' : 'transparent',
                border: `1px solid ${active ? accent : 'transparent'}`,
                color: active ? '#fff' : '#fff5dc',
              }}
            >
              {MOTION_LABELS[id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}