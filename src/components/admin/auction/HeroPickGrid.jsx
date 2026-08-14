import React from 'react';

const ROLES = [['CC', '🗡️ Cuerpo a cuerpo'], ['AD', '🏹 A distancia'], ['HE', '🔮 Magia']];

export default function HeroPickGrid({ heroes, selected, onToggle, onBulk }) {
  return (
    <div className="grid gap-4">
      {ROLES.map(([role, label]) => {
        const list = heroes.filter(h => (h.type || '') === role);
        const ids = list.map(h => h.card_id);
        const allOn = ids.length > 0 && ids.every(id => selected.includes(id));
        return (
          <div key={role}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">{label} · {list.filter(h => selected.includes(h.card_id)).length}/{list.length}</span>
              <button onClick={() => onBulk(ids, !allOn)} className="rounded-lg border border-[#ffd24a44] px-2.5 py-1 text-[10px] font-black text-[#ffe49a]">
                {allOn ? 'Quitar todos' : 'Marcar todos'}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {list.map(h => {
                const on = selected.includes(h.card_id);
                return (
                  <button key={h.card_id} onClick={() => onToggle(h.card_id)} className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 text-left ${on ? 'border-[#ffd24a] bg-[#ffd24a1f]' : 'border-[#ffffff1a] bg-black/35'}`}>
                    {h.art_url ? <img src={h.art_url} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <div className="h-9 w-9 rounded-lg bg-[#ffffff12]" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-black text-[#fff5dc]">{h.name}</span>
                      <span className="block truncate text-[10px] text-[#cfc6dd]">{h.clan || '—'} · {h.cost ?? '—'} oro</span>
                    </span>
                    <span className={`text-sm font-black ${on ? 'text-[#ffd24a]' : 'text-[#5c5470]'}`}>{on ? '✓' : '+'}</span>
                  </button>
                );
              })}
              {!list.length && <div className="text-xs text-[#cfc6dd]">Sin héroes de este rol.</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}