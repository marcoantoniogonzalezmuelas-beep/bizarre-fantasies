import { VALID_ACTIONS, VALID_TARGETS } from './abilityImplementationCatalog.js';

// Cuando el editor NO puede implementar una habilidad con el catálogo del motor, genera este prompt para la IA de
// desarrollo: qué carta y habilidad es, qué debe hacer, por qué no se pudo y qué hay que añadir al motor (de forma
// GENÉRICA, reutilizable por otras cartas) para que se pueda jugar y quede descrita como datos en la base de datos.
export function buildEngineRequestPrompt({ card, elite, abilityName, abilityText, reason }) {
  const c = card || {};
  return [
    'Eres el desarrollador del juego de cartas Bizarre Fantasies (React + Vite + Base44; el motor corre en un iframe y se amplía con parches en src/lib).',
    'Hay que ADAPTAR EL MOTOR para que esta habilidad se pueda jugar, y que quede descrita como DATOS en la base de datos (entidad AbilityImpl, effect_type "custom_steps"), sin código por héroe.',
    '',
    'CARTA: ' + (c.name || '?') + ' (card_id: ' + (c.card_id || '?') + ', ' + (c.category || 'hero') + ') · habilidad ' + (elite ? 'ÉLITE' : 'NORMAL'),
    'NOMBRE: ' + (abilityName || '?'),
    'TEXTO (lo que debe hacer exactamente): ' + (abilityText || '?'),
    'POR QUÉ NO SE PUDO IMPLEMENTAR: ' + (reason || 'el catálogo actual no tiene una mecánica para esto.'),
    '',
    'VOCABULARIO ACTUAL DEL EJECUTOR DE PASOS (src/lib/abilityImplPatch.js):',
    '- acciones: ' + VALID_ACTIONS.join(', '),
    '- objetivos: ' + VALID_TARGETS.join(', '),
    '- opciones de daño: scale_stat + stat_mult, bonus, magic_base, dtype, element, pierce, ignore_shield, ignore_armor, hits, double_below, hp_pct, lifesteal, heal_to, split_allies; buff/debuff con mods; roll {sides, outcomes}.',
    '',
    'QUÉ NECESITO:',
    '1. Añade al ejecutor (src/lib/abilityImplPatch.js: applyStepExt / runSteps) la primitiva GENÉRICA que falte, reutilizable por otras cartas. Nada de código específico de esta carta.',
    '2. Regístrala en base44/shared/abilityCatalog.ts (VALID_ACTIONS / VALID_TARGETS / checkSteps): lo usan el editor y la función del servidor implementAbility. Documéntala en el texto EFFECTS de src/lib/abilityImplementationCatalog.js para que la IA del editor la conozca.',
    '3. Si necesita un momento nuevo del juego (al recibir daño, al morir, al empezar o acabar el turno...), engánchalo una sola vez de forma genérica, activado por una marca que ponga el paso.',
    '4. Añade un test en src/lib/__tests__/ que ejecute la habilidad con el código real del parche y compruebe su efecto.',
    '5. Devuélveme la ficha JSON de AbilityImpl para esta habilidad: {"card_id":"' + (c.card_id || '') + '","elite":' + (elite ? 'true' : 'false') + ',"status":"implemented","effect_type":"custom_steps","params":{"steps":[...]}}.',
    'No cambies el comportamiento de ninguna otra habilidad.',
  ].join('\n');
}
