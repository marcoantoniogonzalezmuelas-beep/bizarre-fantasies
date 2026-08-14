import React, { useState } from 'react';

const CLANS = ['', 'Guerreros', 'Druidas', 'No-muertos', 'Vaqueros', 'Elfos', 'Magos', 'Épicas', 'Cotidianos'];
const cls = 'rounded-lg border border-[#ffd24a33] bg-black/45 px-2 py-1.5 text-xs text-[#fff5dc] outline-none focus:border-[#ffd24a]';

// Filtro por grupos para la elección directa: permite marcar/quitar de golpe
// todos los héroes de una raza, un rol o un rango de coste.
export default function AuctionDirectFilters({ heroes, onApply }) {
  const [f, setF] = useState({ clan: '', type: '', cost_min: '', cost_max: '' });
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const matched = heroes.filter(h => {
    if (f.clan && (h.clan || '') !== f.clan) return false;
    if (f.type && (h.type || '') !== f.type) return false;
    const c = Number(h.cost || 0);
    if (f.cost_min !== '' && c < Number(f.cost_min)) return false;
    if (f.cost_max !== '' && c > Number(f.cost_max)) return false;
    return true;
  });
  const ids = matched.map(h => h.card_id);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#66ffaa33] bg-[#0d2e1a]/50 p-3">
      <span className="text-[11px] font-black uppercase tracking-wider text-[#9dffcf]">Seleccionar por grupo</span>
      <select className={cls} value={f.clan} onChange={e => set('clan', e.target.value)}>
        {CLANS.map(c => <option key={c} value={c}>{c || 'Cualquier raza'}</option>)}
      </select>
      <select className={cls} value={f.type} onChange={e => set('type', e.target.value)}>
        <option value="">Rol: todos</option><option value="CC">CC</option><option value="AD">AD</option><option value="HE">HE</option>
      </select>
      <input className={`${cls} w-24`} type="number" placeholder="Coste mín" value={f.cost_min} onChange={e => set('cost_min', e.target.value)} />
      <input className={`${cls} w-24`} type="number" placeholder="Coste máx" value={f.cost_max} onChange={e => set('cost_max', e.target.value)} />
      <span className="text-[11px] font-black text-[#9dffcf]">{matched.length} héroes coinciden</span>
      <button onClick={() => onApply(ids, true)} disabled={!ids.length} className="rounded-lg bg-[#66ffaa] px-3 py-1.5 text-[11px] font-black text-[#0a1f0e] disabled:opacity-40">Marcar grupo</button>
      <button onClick={() => onApply(ids, false)} disabled={!ids.length} className="rounded-lg border border-[#ff9d9d66] px-3 py-1.5 text-[11px] font-black text-[#ff9d9d] disabled:opacity-40">Quitar grupo</button>
    </div>
  );
}