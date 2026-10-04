import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { syncGameData } from '@/lib/gameDataSync';

// Un solo botón para dejar la base de datos al día tras cada actualización. Solo añade lo que falta.
export default function GameDataSyncButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  async function run() {
    setBusy(true); setMsg('');
    try {
      const r = await syncGameData(base44, (s) => setMsg(s));
      const total = r.cardsCreated + r.paramsAdded + r.specsAdded + r.adjusted;
      setMsg(total
        ? `Hecho: ${r.cardsCreated} cartas nuevas, ${r.paramsAdded} parámetros de equipo, ${r.specsAdded} fichas de habilidad, ${r.adjusted} ajustes${r.failed ? ` (${r.failed} con error)` : ''}.`
        : `Todo estaba al día${r.failed ? ` (${r.failed} con error)` : ''}.`);
    } catch (e) { setMsg('Error: ' + (e?.message || e)); }
    setBusy(false);
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={busy}
        className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600] disabled:opacity-50">
        {busy ? 'Actualizando…' : '🔄 Actualizar datos del juego'}
      </button>
      <span className="max-w-xs text-[11px] text-[#cfc6dd]">{msg || 'Púlsalo tras cada actualización. Solo añade lo que falta; no toca lo que hayas cambiado.'}</span>
    </div>
  );
}
