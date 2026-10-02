export const VALID_ACTIONS = ['damage','true_damage','drain','heal','heal_full','shield','cleanse','buff','debuff','debuff_all_stats','paralyze','skip_turn','sleep','silence','confuse','drunk','mark','evade','mana','lifesteal','recover_card','steal_card','disarm','fx','execute','destroy_equipment','reduce_max_hp','swap_stats','revive','heal_equalize','shield_regen','block_hand','noop','roll','disable_ability','disable_elite'];
export const VALID_TARGETS = ['self','ally','all_allies','enemy','all_enemies','random_enemy','weakest_enemy','strongest_enemy','other_enemy','dead_ally'];

export const EFFECTS = `
- attack_bonus_per_ally: daño extra por aliado vivo. params: { bonus:number, clan?:string }
- heal_allies_per_turn: cura al equipo al inicio de cada ronda. params: { amount:number }
- heal_allies_now: cura al equipo al activar. params: { amount:number }
- damage_enemy: daño directo a uno o varios rivales. params: { amount?:number, all?:boolean, targets?:number, min?:number, max?:number, stat?:'cc'|'ad'|'he' }
- buff_self: mejora un stat propio. params: { stat:'cc'|'ad'|'he', amount:number, turns?:number }
- shield_self: escudo propio. params: { amount:number }
- custom_steps: opción preferida para efectos concretos o combinados. params: { steps:[{action,target,amount?,stat_mult?,stat?,turns?,pierce?,element?}] }
  action: damage | true_damage | drain | heal | heal_full | shield | cleanse | buff | debuff | debuff_all_stats | paralyze | skip_turn | sleep | silence | confuse | drunk | mark | evade | mana | lifesteal | recover_card | steal_card | disarm | fx
  target: self | ally | all_allies | enemy | all_enemies | random_enemy | weakest_enemy | strongest_enemy
  Los objetivos ally/enemy los elige el jugador; random_enemy elige al azar. fx solo acompaña visualmente y requiere element.
  magic_base N (en cualquier paso de daño, cura, escudo...): cantidad que ESCALA con la Magia del lanzador, como los hechizos del motor (N x HE / 18). Se usa en hechizos.
  Opciones de daño (action damage/drain): scale_stat cc|ad|he + stat_mult, bonus (plano), dtype melee|ranged|spell|true, element, pierce 0..1, ignore_shield, ignore_armor, hits [0,-3] (varios golpes; cada número ajusta el daño de ese golpe), double_below 0.4 (x2 si al rival le queda esa fracción de vida), hp_pct 0.5 (fracción de SU vida actual), lifesteal 0.5 (fracción del daño que cura), heal_to weakest_ally, split_allies 0.5.
  Otras acciones: execute {threshold, else_mult?}, destroy_equipment, reduce_max_hp {amount}, swap_stats (intercambia CC y HE), revive {hp_pct} con target dead_ally, heal_equalize (iguala la vida al aliado más sano), shield_regen {amount} (el escudo se regenera a la mitad cada turno), block_hand {turns} (el héroe no puede jugar cartas de la mano), noop {text}.
  roll {sides, outcomes:{"1":[pasos],"2":[pasos]}, label, note}: tira un dado con su animación y ejecuta los pasos del resultado. disable_ability (anula la habilidad del objetivo), disable_elite (el objetivo nunca tendrá fase élite).
  buff/debuff aceptan mods {cc,ad,he,vel} para varios stats en un solo modificador. Objetivos extra: other_enemy (otro rival distinto del elegido), dead_ally.
- unsupported: solo si la mecánica no existe arriba (dados, resurrección, muerte condicionada, alterar subasta/turnos o crear una invocación nueva sin programación propia).`;

const EFFECT_TYPES = ['attack_bonus_per_ally','heal_allies_per_turn','heal_allies_now','damage_enemy','buff_self','shield_self','custom_steps'];
export function validateAbilitySpec(res) {
  const effectType = res?.effect_type || 'unsupported';
  if (effectType === 'unsupported') return { ok:false, status:'manual' };
  if (!EFFECT_TYPES.includes(effectType)) return { ok:false, status:'manual', reason:'effect_type desconocido' };
  if (effectType === 'custom_steps') {
    const steps = res?.params?.steps;
    if (!Array.isArray(steps) || !steps.length) return { ok:false, status:'manual', reason:'la IA no pudo descomponer la habilidad en pasos' };
    for (const step of steps) {
      if (!VALID_ACTIONS.includes(step?.action)) return { ok:false, status:'manual', reason:'un paso usa una acción no soportada' };
      if (!VALID_TARGETS.includes(step?.target || 'enemy')) return { ok:false, status:'manual', reason:'un paso usa un objetivo no soportado' };
      const noAmount = ['cleanse','heal_full','lifesteal','recover_card','disarm','fx','paralyze','skip_turn','sleep','silence','confuse','execute','destroy_equipment','swap_stats','revive','heal_equalize','noop','roll','disable_ability','disable_elite'].includes(step.action);
      const hasMods = step.mods && typeof step.mods === 'object' && Object.keys(step.mods).length > 0;
      if (step.action === 'roll') {
        // Dado: al menos 2 caras y cada resultado con pasos válidos (se validan igual que los de fuera).
        const outs = step.outcomes && typeof step.outcomes === 'object' ? Object.keys(step.outcomes) : [];
        if (!(Number(step.sides) >= 2) || !outs.length) return { ok:false, status:'manual', reason:'un dado necesita caras (sides) y resultados (outcomes)' };
        for (const k of outs) {
          const sub = validateAbilitySpec({ effect_type: 'custom_steps', params: { steps: step.outcomes[k] } });
          if (!sub.ok) return { ok:false, status:'manual', reason:'resultado ' + k + ' del dado: ' + sub.reason };
        }
        continue;
      }
      if (!noAmount && !hasMods && !Number.isFinite(Number(step.amount)) && !Number.isFinite(Number(step.stat_mult)) && !Number.isFinite(Number(step.hp_pct)) && !Number.isFinite(Number(step.magic_base))) return { ok:false, status:'manual', reason:'un paso necesita una cantidad numérica' };
    }
  }
  return { ok:true, status:'implemented' };
}

export function buildAbilityPrompt(abilityName, abilityText) {
  return `Eres el motor de reglas de Bizarre Fantasies. Traduce la habilidad con fidelidad.\nHabilidad: "${abilityName || ''}"\nTexto: "${abilityText}"\n\nCatálogo ejecutable:${EFFECTS}\n\nDevuelve effect_type, params y una note breve en español. Reglas: usa custom_steps para números, estados o varios efectos; copia todos los números exactos; reproduce todos los efectos; nunca devuelvas pasos vacíos; no inventes invocaciones; si falta una mecánica devuelve unsupported y explica exactamente por qué.`;
}