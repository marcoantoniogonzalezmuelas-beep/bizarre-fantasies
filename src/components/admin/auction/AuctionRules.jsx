import React from 'react';

const CLANS = ['', 'Guerreros', 'Druidas', 'No-muertos', 'Vaqueros', 'Elfos', 'Magos', 'Épicas', 'Cotidianos'];
const inputCls = 'w-full rounded-lg border border-[#ffd24a33] bg-black/45 px-2 py-1.5 text-xs text-[#fff5dc] outline-none focus:border-[#ffd24a]';

export default function AuctionRules({ rules, onChange, matchCount }) {
  const set = (i, field, value) => onChange(rules.map((r, k) => k === i ? { ...r, [field]: value } : r));
  const total = rules.reduce((s, r) => s + (Number(r.percent) || 0), 0);

  return (
    <div className="grid gap-3">
      <div className="text-xs text-[#cfc6dd]">Cada grupo filtra héroes (raza, rol y rango de coste) y su porcentaje marca la probabilidad de que salgan en la subasta. Los héroes que no entren en ningún grupo no aparecerán.</div>
      {rules.map((r, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-[#ffd24a26] bg-black/30 p-3 md:grid-cols-[1.2fr_1fr_.7fr_.7fr_.7fr_.7fr_auto]">
          <input className={inputCls} placeholder="Nombre del grupo" value={r.label || ''} onChange={e => set(i, 'label', e.target.value)} />
          <select className={inputCls} value={r.clan || ''} onChange={e => set(i, 'clan', e.target.value)}>
            {CLANS.map(c => <option key={c} value={c}>{c || 'Cualquier raza'}</option>)}
          </select>
          <select className={inputCls} value={r.type || ''} onChange={e => set(i, 'type', e.target.value)}>
            <option value="">Rol: todos</option><option value="CC">CC</option><option value="AD">AD</option><option value="HE">HE</option>
          </select>
          <input className={inputCls} type="number" placeholder="Coste mín" value={r.cost_min ?? ''} onChange={e => set(i, 'cost_min', e.target.value)} />
          <input className={inputCls} type="number" placeholder="Coste máx" value={r.cost_max ?? ''} onChange={e => set(i, 'cost_max', e.target.value)} />
          <input className={inputCls} type="number" placeholder="%" value={r.percent ?? ''} onChange={e => set(i, 'percent', e.target.value)} />
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-[10px] font-black text-[#9dffcf]">{matchCount(r)} héroes</span>
            <button onClick={() => onChange(rules.filter((_, k) => k !== i))} className="rounded-lg border border-[#cc3333] px-2 py-1 text-[10px] font-black text-[#ff9d9d]">✕</button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => onChange([...rules, { label: '', clan: '', type: '', cost_min: '', cost_max: '', percent: 50 }])} className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-xs font-black text-[#ffe49a]">+ Añadir grupo</button>
        <span className={`text-xs font-black ${total === 100 ? 'text-[#9dffcf]' : 'text-[#ffb07a]'}`}>Suma de porcentajes: {total}%{total !== 100 ? ' (se reparte proporcionalmente)' : ''}</span>
      </div>
    </div>
  );
}