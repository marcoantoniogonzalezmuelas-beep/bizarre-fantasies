// VOCABULARIO DEL EJECUTOR DE HABILIDADES (fuente única). Lo usan el editor (src/lib/abilityImplementationCatalog.js)
// y la función del servidor que traduce habilidades con la IA (base44/functions/implementAbility). Antes cada uno
// tenía su propia lista y la del servidor se quedó vieja: la IA no podía usar las primitivas nuevas del motor.
// Al añadir una primitiva al ejecutor (src/lib/abilityImplPatch.js) se registra AQUÍ.
export const VALID_ACTIONS = ['damage','true_damage','drain','heal','heal_full','shield','cleanse','buff','debuff','debuff_all_stats','paralyze','skip_turn','sleep','silence','confuse','drunk','mark','evade','mana','lifesteal','recover_card','steal_card','disarm','fx','execute','destroy_equipment','reduce_max_hp','swap_stats','revive','heal_equalize','shield_regen','block_hand','noop','roll','disable_ability','disable_elite','poison'];
export const VALID_TARGETS = ['self','ally','all_allies','enemy','all_enemies','random_enemy','weakest_enemy','strongest_enemy','other_enemy','dead_ally'];
export const EFFECT_TYPES = ['attack_bonus_per_ally','heal_allies_per_turn','heal_allies_now','damage_enemy','buff_self','shield_self','custom_steps'];
// Acciones que no necesitan una cantidad numérica.
export const NO_AMOUNT_ACTIONS = ['cleanse','heal_full','lifesteal','recover_card','disarm','fx','paralyze','skip_turn','sleep','silence','confuse','execute','destroy_equipment','swap_stats','revive','heal_equalize','noop','roll','disable_ability','disable_elite'];

// Devuelve '' si los pasos son válidos o el motivo por el que no lo son (también dentro de los resultados de un dado).
export function checkSteps(steps) {
  if (!Array.isArray(steps) || !steps.length) return 'no hay pasos';
  for (const step of steps) {
    if (!step || !VALID_ACTIONS.includes(step.action)) return 'un paso usa una acción no soportada' + (step && step.action ? ' (' + step.action + ')' : '');
    if (!VALID_TARGETS.includes(step.target || 'enemy')) return 'un paso usa un objetivo no soportado (' + step.target + ')';
    if (step.action === 'roll') {
      const outs = step.outcomes && typeof step.outcomes === 'object' ? Object.keys(step.outcomes) : [];
      if (!(Number(step.sides) >= 2) || !outs.length) return 'un dado necesita caras (sides) y resultados (outcomes)';
      for (const k of outs) { const r = checkSteps(step.outcomes[k]); if (r) return 'resultado ' + k + ' del dado: ' + r; }
      continue;
    }
    const hasMods = step.mods && typeof step.mods === 'object' && Object.keys(step.mods).length > 0;
    const num = (v: unknown) => v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v));
    if (!NO_AMOUNT_ACTIONS.includes(step.action) && !hasMods && !num(step.amount) && !num(step.stat_mult) && !num(step.hp_pct) && !num(step.magic_base)) return 'un paso necesita una cantidad numérica';
  }
  return '';
}
