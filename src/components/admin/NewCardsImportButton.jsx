import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { NEW_CARDS_SEED, CARD_UPDATES } from '@/lib/newCardsSeed';
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
    // Ajustes puntuales de cartas existentes: solo los campos indicados (nunca nombre, texto ni arte).
    let adjusted = 0;
    for (const u of CARD_UPDATES) {
      try {
        const found = await base44.entities.Card.filter({ card_id: u.card_id }, 'number', 1);
        if (found && found[0]) { await base44.entities.Card.update(found[0].id, u.set); adjusted++; }
      } catch (e) { console.error(e); failed++; }
    }
    setMsg(`Cartas nuevas: ${created} creadas, ${kept} ya existían (parámetros actualizados). Ajustes aplicados: ${adjusted}${failed ? `. Con error: ${failed}` : ''}. Genera el arte de las nuevas desde el editor.`);
    setBusy(false);
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={busy}
        className="rounded-xl border border-[#c06bff66] px-4 py-2 text-sm font-black text-[#e2b0ff] hover:bg-[#c06bff] hover:text-[#1a0a2a] disabled:opacity-50">
        {busy ? 'Creando…' : `✨ Crear cartas nuevas (${NEW_CARDS_SEED.length}) y ajustes (${CARD_UPDATES.length})`}
      </button>
      {msg ? <span className="max-w-xs text-[11px] text-[#e2b0ff]">{msg}</span> : null}
    </div>
  );
}
