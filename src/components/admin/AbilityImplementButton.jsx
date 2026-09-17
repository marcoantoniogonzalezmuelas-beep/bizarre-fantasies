import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { buildAbilityPrompt, validateAbilitySpec } from '@/lib/abilityImplementationCatalog';

// Convierte una habilidad escrita en el editor en una ficha que ejecuta el
// motor real. Las mecánicas imposibles se conservan como revisión manual.

export default function AbilityImplementButton({ cardId, elite, abilityName, abilityText }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function run() {
    if (!cardId || !abilityText) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('implementAbility', {
        prompt: buildAbilityPrompt(abilityName, abilityText),
      });
      const data = res?.data || {};
      const v = validateAbilitySpec(data);
      const status = v.status;
      const effect_type = v.ok ? (data?.effect_type || 'unsupported') : 'unsupported';
      let note = data?.note || '';
      if (!v.ok && v.reason) note = (note ? note + ' — ' : '') + 'No automatizable: ' + v.reason + '.';
      const payload = { card_id: cardId, elite: !!elite, ability_name: abilityName || '', ability_text: abilityText, status, effect_type, params: v.ok ? (data?.params || {}) : {}, note };
      const existing = await base44.entities.AbilityImpl.filter({ card_id: cardId, elite: !!elite }, '-created_date', 1);
      if (existing?.length) await base44.entities.AbilityImpl.update(existing[0].id, payload);
      else await base44.entities.AbilityImpl.create(payload);
      setResult(payload);
    } catch (err) {
      console.error(err);
      setResult({ status: 'manual', note: 'No se pudo analizar la habilidad: ' + (err?.message || 'error desconocido') });
    } finally {
      setBusy(false);
    }
  }

  const accent = elite ? '#c05bff' : '#66ffaa';
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={run}
        disabled={busy || !cardId || !abilityText}
        className={elite
          ? 'rounded-xl border border-[#c05bff66] bg-[#1a0d2e] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#e2b0ff] disabled:opacity-40'
          : 'rounded-xl border border-[#66ffaa44] bg-[#0d2e1a] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#9dffc4] disabled:opacity-40'}
      >
        {busy ? 'Implementando…' : elite ? '⚙️ Implementar habilidad élite en el juego' : '⚙️ Implementar habilidad en el juego'}
      </button>
      {result && (
        <div className="rounded-lg border px-2.5 py-1.5 text-[10px] leading-relaxed" style={{ borderColor: result.status === 'implemented' ? accent + '55' : '#ff8a5c55', color: result.status === 'implemented' ? '#cfe9dd' : '#ffc9ab' }}>
          <span className="font-black">{result.status === 'implemented' ? '✅ Implementada en el juego' : '⚠️ No automatizable'}</span>
          {result.effect_type && result.status === 'implemented' ? <span className="opacity-70"> · {result.effect_type}</span> : null}
          {result.note ? <div className="mt-0.5 opacity-90">{result.note}</div> : null}
        </div>
      )}
    </div>
  );
}