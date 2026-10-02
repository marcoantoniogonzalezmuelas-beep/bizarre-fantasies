import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ABILITY_SEED } from '@/lib/abilitySeed';

// Importa las fichas de habilidad del repositorio (src/lib/abilitySeed.js) a la entidad AbilityImpl:
// crea la ficha si no existe y la actualiza si ya existe (por card_id + elite). No toca las demás fichas.
export default function AbilitySeedImportButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function run() {
    setBusy(true); setMsg('');
    let created = 0, updated = 0, failed = 0;
    for (const spec of ABILITY_SEED) {
      try {
        const existing = await base44.entities.AbilityImpl.filter({ card_id: spec.card_id, elite: !!spec.elite }, '-created_date', 1);
        if (existing?.length) { await base44.entities.AbilityImpl.update(existing[0].id, spec); updated++; }
        else { await base44.entities.AbilityImpl.create(spec); created++; }
      } catch (e) { console.error(e); failed++; }
    }
    setMsg(`Fichas importadas: ${created} nuevas, ${updated} actualizadas${failed ? `, ${failed} con error` : ''}.`);
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={busy}
        className="rounded-xl border border-[#66ffaa66] px-4 py-2 text-sm font-black text-[#9dffcf] hover:bg-[#66ffaa] hover:text-[#0a1f0e] disabled:opacity-50">
        {busy ? 'Importando…' : `⚙️ Importar fichas de habilidad (${ABILITY_SEED.length})`}
      </button>
      {msg ? <span className="text-[11px] text-[#9dffcf]">{msg}</span> : null}
    </div>
  );
}
