import React, { useState } from 'react';

const TARGETS = [
  ['art_url', 'Imagen normal'],
  ['elite_art_url', 'Imagen élite'],
  ['battle_art_url', 'Escena de batalla'],
  ['elite_battle_art_url', 'Escena de batalla élite'],
];

// Modo RETOQUE: parte de la imagen actual de la carta y pide a la IA que la
// mantenga idéntica cambiando SOLO los elementos que el admin indique
// (p. ej. "añádele un pañuelo pirata en la cabeza").
export default function ImageRetouchSection({ form, onGenerate, generating }) {
  const [target, setTarget] = useState('art_url');
  const [instructions, setInstructions] = useState('');
  const available = TARGETS.filter(([k]) => form[k]);
  if (!available.length) return null;
  const activeTarget = form[target] ? target : available[0][0];
  const busy = generating === '__retouch_' + activeTarget;

  return (
    <div className="mt-4 rounded-2xl border border-[#ffb84a44] bg-[#2e1a0d]/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-black uppercase tracking-wider text-[#ffcf8a]">🖌 Retocar imagen actual</span>
        <span className="text-[11px] text-[#b08a5a]">Mantiene la foto tal cual y SOLO cambia lo que pidas</span>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-24 shrink-0 aspect-[7/10] overflow-hidden rounded-xl border border-[#ffb84a44] bg-black/45">
          <img src={form[activeTarget]} alt="Actual" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <select
            value={activeTarget}
            onChange={(e) => setTarget(e.target.value)}
            className="rounded-xl border border-[#ffb84a44] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffb84a]"
          >
            {available.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder='Qué cambiar (y nada más). Ej: "añádele un pañuelo en la cabeza con el símbolo pirata"'
            className="min-h-[64px] rounded-xl border border-[#ffb84a44] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffb84a]"
          />
          <button
            type="button"
            onClick={() => onGenerate(activeTarget, instructions)}
            disabled={!!generating || !instructions.trim()}
            className="self-start rounded-xl bg-gradient-to-b from-[#ffb84a] to-[#c8741f] px-5 py-2 text-xs font-black text-[#3a2600] shadow-lg disabled:opacity-50"
          >
            {busy ? 'Retocando…' : '🖌 Retocar (mantener el resto igual)'}
          </button>
          <p className="text-[10px] text-[#b08a5a]">La IA recibe la foto actual como referencia obligatoria: mismo personaje, pose, colores y fondo; solo aplica el cambio indicado y lo mantiene dentro del marco de la carta.</p>
        </div>
      </div>
    </div>
  );
}