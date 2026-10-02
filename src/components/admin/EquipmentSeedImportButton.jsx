import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { EQUIPMENT_SEED } from '@/lib/equipmentSeed';
import { saveEquipEffect } from '@/lib/equipmentStore';

// Guarda los parámetros del motor de las 52 cartas de equipo (armas, armaduras, hechizos y objetos) en AbilityImpl
// (effect_type "equipment"): crea o actualiza la ficha de cada carta por card_id. No toca las cartas ni las demás
// fichas. Después el juego construye sus tablas de equipo únicamente desde la base de datos.
export default function EquipmentSeedImportButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function run() {
    setBusy(true); setMsg('');
    let created = 0, updated = 0, failed = 0; const missing = [];
    for (const item of EQUIPMENT_SEED) {
      try {
        const found = await base44.entities.Card.filter({ card_id: item.card_id }, 'number', 1);
        if (!found?.length) { missing.push(item.card_id); continue; }
        const r = await saveEquipEffect(found[0], item.effect, base44);
        if (r === 'created') created++; else updated++;
      } catch (e) { console.error(e); failed++; }
    }
    setMsg(`Parámetros de equipo: ${created} nuevos, ${updated} actualizados${missing.length ? `, ${missing.length} cartas no encontradas (${missing.slice(0, 6).join(', ')})` : ''}${failed ? `, ${failed} con error` : ''}.`);
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={busy}
        className="rounded-xl border border-[#66ffaa66] px-4 py-2 text-sm font-black text-[#9dffcf] hover:bg-[#66ffaa] hover:text-[#0a1f0e] disabled:opacity-50">
        {busy ? 'Importando…' : `🛡️ Importar parámetros de equipo (${EQUIPMENT_SEED.length})`}
      </button>
      {msg ? <span className="max-w-xs text-[11px] text-[#9dffcf]">{msg}</span> : null}
    </div>
  );
}
