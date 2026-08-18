import React from 'react';
import { abilityAuditFor } from '@/lib/abilityEngineMap';

const STYLES = {
  ok: { border: '#66ffaa55', bg: '#0d2e1a99', color: '#8fffc4', icon: '✔' },
  faithful: { border: '#66ffaa55', bg: '#0d2e1a99', color: '#8fffc4', icon: '✔' },
  generic: { border: '#ffd24a55', bg: '#2e240d99', color: '#ffe49a', icon: '⚠' },
  pending: { border: '#ff9d5c66', bg: '#2e1a0d99', color: '#ffb07a', icon: '⏳' },
  none: { border: '#ff6b6b66', bg: '#2e0d0d99', color: '#ff9f9f', icon: '✖' },
};

// Aviso de auditoría en la ficha de la carta: indica si la habilidad está
// realmente implementada en el motor, si usa una mecánica genérica o si el
// efecto todavía hay que programar.
export default function AbilityAuditBadge({ number, category }) {
  if (!['hero', 'bizarro'].includes(category)) return null;
  const audit = abilityAuditFor(number);
  if (!audit) return null;
  const s = STYLES[audit.level] || STYLES.none;
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ border: `1px solid ${s.border}`, background: s.bg }}>
      <div className="text-xs font-black" style={{ color: s.color }}>{s.icon} {audit.label}</div>
      <div className="mt-1 text-[11px] text-[#cfc6dd]">{audit.detail}</div>
      {audit.level !== 'ok' && (
        <div className="mt-1 text-[11px] text-[#cfc6dd]">
          ¿Quieres un efecto nuevo? Escríbelo en el texto de la habilidad y pídeme en el chat que lo programe en el motor.
        </div>
      )}
    </div>
  );
}