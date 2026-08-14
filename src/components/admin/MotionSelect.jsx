import React from 'react';
import { MOTION_LABELS, MOTION_OPTIONS } from '@/lib/abilityAnimMotions';

// Selector de MOVIMIENTO de la cinemática 3D: el admin elige explícitamente
// cómo se mueve la criatura por la pantalla (volar, girar, cabezazos, recorrer
// la pantalla, tornado, teletransporte…). Con "Automático" se sigue eligiendo
// por palabras clave de la descripción, como hasta ahora.
export default function MotionSelect({ label, value, accent = '#3c9eff', onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-black uppercase tracking-wider" style={{ color: accent }}>
        {label}
      </span>
      <select
        value={value || 'auto'}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border bg-black/45 px-2 py-1.5 text-[11px] text-[#fff5dc] outline-none"
        style={{ borderColor: accent + '55' }}
      >
        {MOTION_OPTIONS.map((id) => (
          <option key={id} value={id}>{MOTION_LABELS[id]}</option>
        ))}
      </select>
    </label>
  );
}