import React from 'react';

const OPTS = [['', 'Por defecto'], ['CC', '🗡️ Cuerpo a cuerpo'], ['AD', '🏹 A distancia'], ['HE', '🔮 Hechizos / magia']];

// Rol que se subasta en cada una de las tres fases de reclutamiento.
export default function AuctionPhaseTypes({ value, onChange }) {
  const phases = value || ['', '', ''];
  return (
    <div className="grid gap-2 rounded-xl border border-[#7ab8ff33] bg-[#0d1a2e]/50 p-3">
      <div className="text-[11px] font-black uppercase tracking-wider text-[#a8d0ff]">Rol de cada fase de subasta</div>
      <div className="text-[11px] text-[#cfc6dd]">Por defecto la fase 1 es cuerpo a cuerpo, la 2 a distancia y la 3 magia. Aquí puedes cambiarlo (por ejemplo, las tres de magia, o 1 cuerpo a cuerpo y 2 a distancia).</div>
      <div className="grid gap-2 md:grid-cols-3">
        {[0, 1, 2].map(i => (
          <label key={i} className="block">
            <span className="mb-1 block text-[11px] font-black text-[#a8d0ff]">Fase {i + 1}</span>
            <select value={phases[i] || ''} onChange={e => { const next = [...phases]; next[i] = e.target.value; onChange(next); }} className="w-full rounded-lg border border-[#7ab8ff44] bg-black/45 px-2 py-1.5 text-xs text-[#fff5dc] outline-none focus:border-[#7ab8ff]">
              {OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}