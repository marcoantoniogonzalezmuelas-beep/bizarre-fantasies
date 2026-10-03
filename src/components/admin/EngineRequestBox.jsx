import React, { useState } from 'react';

// Prompt para la IA de desarrollo cuando una habilidad NO se puede implementar con el catálogo del motor: se copia
// y se envía a la IA para que adapte el juego (nueva primitiva genérica + ficha de la habilidad).
export default function EngineRequestBox({ label, prompt }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (e) { setCopied(false); }
  }
  return (
    <div className="mt-3 rounded-xl border border-[#ffb36677] bg-[#2a1600] p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-black text-[#ffd0a0]">⚠️ {label}: no se puede jugar todavía. Envía este prompt a la IA para adaptar el motor:</span>
        <button type="button" onClick={copy} className="shrink-0 rounded-lg border border-[#ffb366] px-3 py-1 text-xs font-black text-[#ffd0a0] hover:bg-[#ffb366] hover:text-[#2a1600]">{copied ? '✓ Copiado' : 'Copiar prompt'}</button>
      </div>
      <textarea readOnly value={prompt} rows={8} className="w-full rounded-lg border border-[#5a3a14] bg-[#140b02] p-2 font-mono text-[11px] text-[#ffe0bd]" onFocus={(e) => e.target.select()} />
    </div>
  );
}
