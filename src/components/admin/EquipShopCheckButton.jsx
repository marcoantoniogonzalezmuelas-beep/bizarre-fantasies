import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { checkEquipShop, CAT_LABEL } from '@/lib/equipShopCheck';

// Backoffice: comprueba qué cartas de equipo saldrán en la tienda del juego y cuáles no (y por qué).
export default function EquipShopCheckButton() {
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  async function run() {
    setBusy(true); setRes(null);
    try {
      const cards = await base44.entities.Card.list('number', 1000);
      let impls = [];
      try { impls = await base44.entities.AbilityImpl.filter({ effect_type: 'equipment' }, 'card_id', 1000); } catch (e) { impls = []; }
      setRes(checkEquipShop(cards, impls));
    } catch (e) { setRes({ error: String(e && e.message || e) }); }
    setBusy(false);
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={busy}
        className="rounded-xl border border-[#7ec97e66] px-4 py-2 text-sm font-black text-[#9fe39f] hover:bg-[#7ec97e] hover:text-[#0d1a0d] disabled:opacity-50">
        {busy ? 'Comprobando…' : '🔎 Comprobar tienda de equipo'}
      </button>
      {res && res.error ? <span className="text-[11px] text-red-300">No se pudo comprobar: {res.error}</span> : null}
      {res && !res.error ? (
        <div className="max-w-md text-[11px] text-[#d8d0e4]">
          <div className="font-bold text-[#9fe39f]">{res.ok.length} cartas saldrán en la tienda.</div>
          {res.missing.length ? (
            <div className="mt-1 text-[#ffb3a8]">
              <div className="font-bold">{res.missing.length} NO saldrán:</div>
              {res.missing.map((m) => <div key={m.card_id}>• Nº {m.number} {m.name} ({CAT_LABEL[m.category] || m.category}): {m.why}.</div>)}
            </div>
          ) : <div className="text-[#9fe39f]">Todas las cartas de equipo están listas.</div>}
        </div>
      ) : null}
    </div>
  );
}
