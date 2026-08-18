import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

// Botón "Implementar habilidad en el juego": la IA traduce el texto de la
// habilidad a una de las mecánicas que el motor del juego sabe ejecutar y la
// guarda (entidad AbilityImpl). Si la habilidad no encaja en ninguna, se marca
// como manual y se indica por qué no es posible automatizarla.
const EFFECTS = `
- attack_bonus_per_ally: al atacar inflige daño extra por cada aliado vivo. params: { bonus:number, clan?:string }
- heal_allies_per_turn: mientras el héroe viva, cura X de vida a todo su equipo al inicio de cada ronda. params: { amount:number }
- heal_allies_now: al usar la habilidad cura X de vida a todo su equipo. params: { amount:number }
- damage_enemy: al usar la habilidad inflige X de daño directo a un rival, o a todos si all=true. params: { amount:number, all?:boolean }
- buff_self: al usar la habilidad sube un stat propio (cc, ad o he). params: { stat:'cc'|'ad'|'he', amount:number }
- shield_self: al usar la habilidad se otorga un escudo de X puntos. params: { amount:number }
- custom_steps: MECÁNICA NUEVA a medida. Úsalo cuando la habilidad no encaje en las anteriores. params: { steps: [ { action, target, amount?, stat?, turns? } ] }
    · action: 'damage' | 'heal' | 'shield' | 'buff' | 'debuff' | 'paralyze' | 'mana'
    · target: 'self' | 'ally' | 'all_allies' | 'enemy' | 'all_enemies' | 'weakest_enemy' | 'strongest_enemy'
    · stat (solo buff/debuff): 'cc' | 'ad' | 'he'  ·  turns (solo paralyze): número de turnos
    Puedes combinar varios pasos para reproducir el texto exacto de la carta.
- unsupported: la habilidad NO se puede reproducir ni combinando pasos de custom_steps (por ejemplo requiere cambiar las reglas del juego, la mano de cartas o el orden de turnos).
`;

export default function AbilityImplementButton({ cardId, elite, abilityName, abilityText }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function run() {
    if (!cardId || !abilityText) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Eres el motor de reglas del juego de cartas Bizarre Fantasies. Traduce esta habilidad al efecto del catálogo que la reproduzca con mayor fidelidad.

Habilidad: "${abilityName || ''}"
Texto: "${abilityText}"

Catálogo de efectos soportados por el motor:${EFFECTS}

Devuelve effect_type, params (solo las claves del efecto elegido) y note: una explicación breve en español de lo implementado. Prioriza los efectos concretos; si ninguno reproduce el texto, construye la mecánica nueva con custom_steps respetando los números exactos de la carta. Reserva unsupported solo para lo que ni custom_steps puede hacer, y en note explica por qué.`,
        response_json_schema: {
          type: 'object',
          properties: {
            effect_type: { type: 'string' },
            params: { type: 'object' },
            note: { type: 'string' },
          },
        },
      });
      const effect_type = res?.effect_type || 'unsupported';
      const status = effect_type === 'unsupported' ? 'manual' : 'implemented';
      const payload = { card_id: cardId, elite: !!elite, ability_name: abilityName || '', ability_text: abilityText, status, effect_type, params: res?.params || {}, note: res?.note || '' };
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