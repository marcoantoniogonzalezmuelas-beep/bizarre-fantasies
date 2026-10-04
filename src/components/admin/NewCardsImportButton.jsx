import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { NEW_CARDS_SEED } from '@/lib/newCardsSeed';
import { saveEquipEffect } from '@/lib/equipmentStore';

// Da de alta las cartas nuevas de equipo: crea la carta si no existe (por card_id) y guarda sus parámetros del motor.
// Si la carta ya existe, solo actualiza los parámetros (no toca nombre, texto, coste ni arte).
export default function NewCardsImportButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  async function run() {
    setBusy(true); setMsg('');
    let created = 0, kept = 0, failed = 0;
    for (const item of NEW_CARDS_SEED) {
      try {
        const found = await base44.entities.Card.filter({ card_id: item.card.card_id }, 'number', 1);
        let card = found && found[0];
        if (!card) { card = await base44.entities.Card.create(item.card); created++; } else kept++;
        await saveEquipEffect({ ...item.card, ...card }, item.effect, base44);
      } catch (e) { console.error(e); failed++; }
    }
    setMsg(`Cartas nuevas: ${created} creadas, ${kept} ya existían (parámetros actualizados)${failed ? `, ${failed} con error` : ''}. Genera su arte desde el editor.`);
    setBusy(false);
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={busy}
        className="rounded-xl border border-[#c06bff66] px-4 py-2 text-sm font-black text-[#e2b0ff] hover:bg-[#c06bff] hover:text-[#1a0a2a] disabled:opacity-50">
        {busy ? 'Creando…' : `✨ Crear cartas nuevas (${NEW_CARDS_SEED.length})`}
      </button>
      {msg ? <span className="max-w-xs text-[11px] text-[#e2b0ff]">{msg}</span> : null}
    </div>
  );
}
