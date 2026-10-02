import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { EQUIPMENT_SEED } from '@/lib/equipmentSeed';

// Guarda en cada carta de equipo (armas, armaduras, hechizos y objetos) los parámetros del motor que estaban
// escritos en el código (Card.effect). Actualiza SOLO el campo effect, por card_id; no toca ningún otro campo.
// Después el juego construye sus tablas de equipo únicamente desde la base de datos.
export default function EquipmentSeedImportButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function run() {
    setBusy(true); setMsg('');
    let updated = 0, missing = [], failed = 0;
    for (const item of EQUIPMENT_SEED) {
      try {
        const found = await base44.entities.Card.filter({ card_id: item.card_id }, 'number', 1);
        if (!found?.length) { missing.push(item.card_id); continue; }
        await base44.entities.Card.update(found[0].id, { effect: item.effect });
        updated++;
      } catch (e) { console.error(e); failed++; }
    }
    setMsg(`Parámetros de equipo importados: ${updated} actualizadas${missing.length ? `, ${missing.length} cartas no encontradas (${missing.slice(0, 6).join(', ')})` : ''}${failed ? `, ${failed} con error` : ''}.`);
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
