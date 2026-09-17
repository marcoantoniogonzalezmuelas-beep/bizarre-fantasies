export const VALID_ACTIONS = ['damage','true_damage','drain','heal','heal_full','shield','cleanse','buff','debuff','debuff_all_stats','paralyze','skip_turn','sleep','silence','confuse','drunk','mark','evade','mana','lifesteal','recover_card','steal_card','disarm','fx'];
export const VALID_TARGETS = ['self','ally','all_allies','enemy','all_enemies','random_enemy','weakest_enemy','strongest_enemy'];

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
      if (!['cleanse','heal_full','lifesteal','recover_card','disarm','fx'].includes(step.action) && !Number.isFinite(Number(step.amount)) && !Number.isFinite(Number(step.stat_mult))) return { ok:false, status:'manual', reason:'un paso necesita una cantidad numérica' };
    }
  }
  return { ok:true, status:'implemented' };
}

export function buildAbilityPrompt(abilityName, abilityText) {
  return `Eres el motor de reglas de Bizarre Fantasies. Traduce la habilidad con fidelidad.\nHabilidad: "${abilityName || ''}"\nTexto: "${abilityText}"\n\nCatálogo ejecutable:${EFFECTS}\n\nDevuelve effect_type, params y una note breve en español. Reglas: usa custom_steps para números, estados o varios efectos; copia todos los números exactos; reproduce todos los efectos; nunca devuelvas pasos vacíos; no inventes invocaciones; si falta una mecánica devuelve unsupported y explica exactamente por qué.`;
}