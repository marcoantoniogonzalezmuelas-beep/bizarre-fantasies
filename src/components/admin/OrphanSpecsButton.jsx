import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { findOrphanSpecs } from '@/lib/equipmentStore';

// Busca las fichas de AbilityImpl cuyo card_id ya no existe en Card (restos de cartas borradas o renombradas) y,
// con confirmación, las elimina.
export default function OrphanSpecsButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function run() {
    setBusy(true); setMsg('');
    try {
      const [specs, cards] = await Promise.all([base44.entities.AbilityImpl.list('-created_date', 2000), base44.entities.Card.list('number', 2000)]);
      const orphans = findOrphanSpecs(specs, cards);
      if (!orphans.length) { setMsg('No hay fichas huérfanas.'); setBusy(false); return; }
      const names = [...new Set(orphans.map((s) => s.card_id))].join(', ');
      if (!window.confirm(`Hay ${orphans.length} ficha(s) de habilidad sin carta (${names}). ¿Eliminarlas?`)) { setMsg('Cancelado.'); setBusy(false); return; }
      for (const s of orphans) await base44.entities.AbilityImpl.delete(s.id);
      setMsg(`${orphans.length} ficha(s) huérfana(s) eliminada(s).`);
    } catch (e) { console.error(e); setMsg('Error: ' + (e?.message || e)); }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={busy}
        className="rounded-xl border border-[#ffb36666] px-4 py-2 text-sm font-black text-[#ffd0a0] hover:bg-[#ffb366] hover:text-[#2a1600] disabled:opacity-50">
        {busy ? 'Revisando…' : '🧹 Limpiar fichas huérfanas'}
      </button>
      {msg ? <span className="max-w-xs text-[11px] text-[#ffd0a0]">{msg}</span> : null}
    </div>
  );
}
