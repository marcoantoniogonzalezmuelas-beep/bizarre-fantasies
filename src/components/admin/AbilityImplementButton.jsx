import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

// Botón "Implementar habilidad en el juego": la IA traduce el texto de la
// habilidad a una de las mecánicas que el motor del juego sabe ejecutar y la
// guarda (entidad AbilityImpl). Si la habilidad no encaja en ninguna, se marca
// como manual y se indica por qué no es posible automatizarla.
//
// IMPORTANTE: la ficha guardada la ejecuta el motor REAL del juego (parche
// abilityImplPatch, inyectado en el iframe de batalla). Si la IA no puede
// descomponer la habilidad en pasos válidos del catálogo, NO se guarda como
// implementada (haría nada en el juego): se marca 'manual' y se explica.
const VALID_ACTIONS = ['damage','true_damage','drain','heal','heal_full','shield','cleanse','buff','debuff','debuff_all_stats','paralyze','skip_turn','sleep','silence','confuse','drunk','mark','evade','mana','lifesteal','recover_card','steal_card'];
const VALID_TARGETS = ['self','ally','all_allies','enemy','all_enemies','weakest_enemy','strongest_enemy'];

const EFFECTS = `
- attack_bonus_per_ally: al atacar inflige daño extra por cada aliado vivo. params: { bonus:number, clan?:string }
- heal_allies_per_turn: mientras el héroe viva, cura X de vida a todo su equipo al inicio de cada ronda. params: { amount:number }
- heal_allies_now: al usar la habilidad cura X de vida a todo su equipo. params: { amount:number }
- damage_enemy: al usar la habilidad inflige X de daño directo a un rival, o a todos si all=true. params: { amount:number, all?:boolean, targets?:number, min?:number, max?:number, stat?:'cc'|'ad'|'he' }
- buff_self: al usar la habilidad sube un stat propio (cc, ad o he). params: { stat:'cc'|'ad'|'he', amount:number, turns?:number }
- shield_self: al usar la habilidad se otorga un escudo de X puntos. params: { amount:number }
- custom_steps: MECÁNICA A MEDIDA (la opción PREFERIDA en casi todos los casos, porque respeta el texto al pie de la letra).
    params: { steps: [ { action, target, amount?, stat_mult?, stat?, turns?, pierce? } ] }
    · action (todas están programadas y funcionan en la batalla):
        'damage' (golpe con el tipo del héroe: CC melee, AD disparo, HE hechizo)
        'true_damage' (daño que ignora escudo y armadura)
        'drain' (daño y el héroe se cura esa misma cantidad — habilidad de drenaje)
        'heal' | 'heal_full' | 'shield' | 'cleanse' (quita todos los estados negativos)
        'buff' | 'debuff' (un stat concreto) | 'debuff_all_stats' (-X a CC, AD, HE y velocidad)
        'paralyze' | 'skip_turn' | 'sleep' | 'silence'
        'confuse' (estado CONFUSO: 50% de fallar cada acción)
        'drunk' (estado BORRACHO: -3 a sus atributos, daño y 35% de fallar cada acción)
        'mark' (el objetivo recibirá +amount de daño) | 'evade' (esquiva los próximos amount ataques)
        'mana' (suma/resta maná) | 'lifesteal' (roba vida en cada golpe cuerpo a cuerpo el resto del combate)
        'recover_card' (roba una carta de la pila de descartes/usados y la devuelve a la mano)
        'steal_card' (roba amount cartas al azar de la MANO del rival y las pasa a tu mano)
    · target: 'self' | 'ally' | 'all_allies' | 'enemy' | 'all_enemies' | 'weakest_enemy' | 'strongest_enemy'
      (con 'enemy' o 'ally' el jugador elige el objetivo en la batalla)
    · amount: número EXACTO del texto de la carta. Si el texto habla de "el doble de su ataque" o similar, usa stat_mult (1.5 = 1,5 veces su stat principal) en vez de amount.
    · turns: turnos que dura el estado o la penalización (los del texto; por defecto 2).
    · pierce: true si el texto dice que ignora la defensa/armadura.
    NOTA: con estos pasos puedes reproducir CUALQUIER efecto de hechizo u objeto del juego (daño, curación, escudo, estados, recuperar del descarte, robar cartas al rival) como habilidad de un héroe nuevo.
    Combina varios pasos para reproducir el texto COMPLETO (p.ej. "hace 6 de daño y lo emborracha 2 turnos" = paso damage + paso drunk).
- unsupported: RESERVADO. Devuélvelo SI Y SOLO SI la habilidad exige mecánicas que NO están en la lista de actions de custom_steps (p.ej. lanzar un dado, resucitar al morir, efectos que dependen de una condición externa, cambiar el orden de turnos o la subasta). Explica el motivo en note.
`;

// Valida la respuesta de la IA. Si elige custom_steps, params.steps DEBE ser
// un array no vacío con acciones y targets válidos. Si no, la habilidad no es
// automatizable con el catálogo y se marca 'manual' (no 'implemented').
function validateSpec(res) {
  const et = (res && res.effect_type) || 'unsupported';
  if (et === 'unsupported') return { ok: false, status: 'manual' };
  if (!['attack_bonus_per_ally','heal_allies_per_turn','heal_allies_now','damage_enemy','buff_self','shield_self','custom_steps'].includes(et)) {
    return { ok: false, status: 'manual', reason: 'effect_type desconocido' };
  }
  if (et === 'custom_steps') {
    const steps = res?.params?.steps;
    if (!Array.isArray(steps) || steps.length === 0) return { ok: false, status: 'manual', reason: 'la IA no pudo descomponer la habilidad en pasos del catálogo' };
    for (const s of steps) {
      if (!s || !s.action || VALID_ACTIONS.indexOf(s.action) < 0) return { ok: false, status: 'manual', reason: 'un paso usa una acción no soportada' };
      if (s.target && VALID_TARGETS.indexOf(s.target) < 0) return { ok: false, status: 'manual', reason: 'un paso usa un objetivo no soportado' };
    }
  }
  return { ok: true, status: 'implemented' };
}

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

Devuelve effect_type, params (solo las claves del efecto elegido) y note: una explicación breve en español de lo implementado.

REGLAS OBLIGATORIAS:
1. Usa custom_steps siempre que el texto tenga números concretos, estados (borracho, confuso, dormido, paralizado, marcado, silenciado), drenaje de vida, robo de cartas del descarte o varios efectos a la vez. Los efectos concretos de arriba solo para textos que encajen literalmente en ellos.
2. Copia los NÚMEROS EXACTOS del texto (daño, curación, escudo, penalización, turnos). Nunca los inventes ni los redondees.
3. Reproduce TODOS los efectos del texto, cada uno como un paso. Si el texto afecta a todos los rivales usa 'all_enemies'; si es a uno, 'enemy'.
4. Si eliges custom_steps, params.steps DEBE ser un array NO VACÍO con pasos válidos del catálogo. NUNCA devuelvas custom_steps con steps vacío o sin pasos.
5. Si la habilidad exige mecánicas que NO están en la lista de actions (lanzar un dado, resucitar al morir, efectos condicionales a un evento externo, cambiar el orden de turnos o la subasta), devuelve effect_type='unsupported' y explica el motivo en note. Es mejor 'unsupported' honesto que un custom_steps vacío que no haría nada en el juego.`,
        response_json_schema: {
          type: 'object',
          properties: {
            effect_type: { type: 'string' },
            params: { type: 'object' },
            note: { type: 'string' },
          },
        },
      });
      const v = validateSpec(res);
      const status = v.status;
      const effect_type = v.ok ? (res?.effect_type || 'unsupported') : 'unsupported';
      let note = res?.note || '';
      if (!v.ok && v.reason) note = (note ? note + ' — ' : '') + 'No automatizable: ' + v.reason + '.';
      const payload = { card_id: cardId, elite: !!elite, ability_name: abilityName || '', ability_text: abilityText, status, effect_type, params: v.ok ? (res?.params || {}) : {}, note };
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