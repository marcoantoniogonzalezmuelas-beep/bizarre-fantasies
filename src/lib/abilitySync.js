import { buildAbilityPrompt, validateAbilitySpec } from '@/lib/abilityImplementationCatalog';
import { buildEngineRequestPrompt } from '@/lib/engineRequestPrompt';

// SINCRONIZACIÓN CARTA -> FICHAS DE HABILIDAD. La base de datos es la única fuente del juego: al guardar un
// héroe o bizarro en el editor, sus dos habilidades (normal y élite) quedan en AbilityImpl, que es lo que
// ejecuta el motor. Sin esto un héroe nuevo solo tenía su carta y su habilidad no existía para el juego.
//   - texto vacío            -> se borra la ficha de esa habilidad;
//   - ficha ya al día        -> no se toca (ni se gasta IA): incluye las fichas dedicadas escritas a mano;
//   - texto nuevo o cambiado -> se traduce a pasos con la IA (implementAbility) y se guarda;
//   - no automatizable       -> se guarda como "manual" con su motivo (el juego usa un golpe genérico).
export const ABILITY_CATEGORIES = ['hero', 'bizarro'];

export async function syncCardAbilities(card, deps) {
  const out = { kept: 0, implemented: 0, manual: 0, removed: 0, protectedSpecs: 0, errors: [], lines: [], requests: [] };
  if (!card || !ABILITY_CATEGORIES.includes(card.category) || !card.card_id) return out;
  let existing = [];
  try { existing = (await deps.list(card.card_id)) || []; } catch (e) { out.errors.push('No se pudieron leer las fichas: ' + (e?.message || e)); return out; }
  const variants = [
    { elite: false, label: 'normal', name: card.ability_name, text: card.ability_text },
    { elite: true, label: 'élite', name: card.elite_ability_name, text: card.elite_ability_text },
  ];
  for (const v of variants) {
    const spec = existing.find((s) => !!s.elite === v.elite);
    const text = String(v.text || '').trim();
    const name = String(v.name || '').trim();
    try {
      if (!text) {
        if (spec) { await deps.remove(spec.id); out.removed++; out.lines.push(`Habilidad ${v.label}: sin texto, ficha eliminada.`); }
        continue;
      }
      const sameText = spec && String(spec.ability_text || '').trim() === text;
      if (sameText && (spec.status === 'implemented' || deps.force !== true)) {
        out.kept++; out.lines.push(`Habilidad ${v.label}: ficha al día (${spec.status === 'implemented' ? spec.effect_type : 'manual'}).`);
        if (spec.status !== 'implemented') {
          const req = (spec.params && spec.params.engine_request) || buildEngineRequestPrompt({ card, elite: v.elite, abilityName: name, abilityText: text, reason: spec.note });
          out.requests.push({ label: 'Habilidad ' + v.label + ' (pendiente): ' + (name || text.slice(0, 40)), prompt: req });
        }
        continue;
      }
      if (spec && String(spec.effect_type || '').startsWith('dedicated_')) {
        out.protectedSpecs++; out.lines.push(`Habilidad ${v.label}: ficha dedicada (${spec.effect_type}); el texto cambió y NO se sobrescribe: revísala.`); continue;
      }
      let data = {};
      try { data = (await deps.implement(buildAbilityPrompt(name, text))) || {}; } catch (e) { data = { effect_type: 'unsupported', note: 'No se pudo analizar la habilidad: ' + (e?.message || 'error') }; out.errors.push(`${v.label}: ${e?.message || e}`); }
      const val = validateAbilitySpec(data);
      let note = data.note || '';
      if (!val.ok && val.reason) note = (note ? note + ' — ' : '') + 'No automatizable: ' + val.reason + '.';
      // No implementable: se guarda el prompt para la IA de desarrollo (para adaptar el motor) y se muestra en el editor.
      const request = val.ok ? '' : buildEngineRequestPrompt({ card, elite: v.elite, abilityName: name, abilityText: text, reason: note });
      const payload = {
        card_id: card.card_id, elite: v.elite, ability_name: name, ability_text: text, status: val.status,
        effect_type: val.ok ? (data.effect_type || 'unsupported') : 'unsupported', params: val.ok ? (data.params || {}) : { engine_request: request }, note,
      };
      if (request) out.requests.push({ label: 'Habilidad ' + v.label + ': ' + (name || text.slice(0, 40)), prompt: request });
      if (spec) await deps.update(spec.id, payload); else await deps.create(payload);
      if (payload.status === 'implemented') { out.implemented++; out.lines.push(`Habilidad ${v.label}: implementada (${payload.effect_type}).`); }
      else { out.manual++; out.lines.push(`Habilidad ${v.label}: NO automatizable${note ? ' — ' + note : ''}. En el juego hará un golpe genérico. Abajo tienes el prompt para que la IA adapte el motor.`); }
    } catch (e) {
      out.errors.push(`${v.label}: ${e?.message || e}`);
      out.lines.push(`Habilidad ${v.label}: error al sincronizar (${e?.message || e}).`);
    }
  }
  return out;
}

// Dependencias reales (base44) para el editor.
export function realAbilityDeps(base44) {
  return {
    list: (cardId) => base44.entities.AbilityImpl.filter({ card_id: cardId }, '-created_date', 10),
    create: (p) => base44.entities.AbilityImpl.create(p),
    update: (id, p) => base44.entities.AbilityImpl.update(id, p),
    remove: (id) => base44.entities.AbilityImpl.delete(id),
    implement: async (prompt) => (await base44.functions.invoke('implementAbility', { prompt }))?.data,
  };
}

// CAMBIO DE card_id: las fichas de habilidad cuelgan del card_id de la carta. Si se cambia el identificador, las
// fichas pasan al nuevo (si no, quedarían huérfanas y la carta se quedaría sin habilidades en el juego).
// Las fichas que ya hubiera con el id nuevo son restos de otra carta borrada: se eliminan para no duplicar.
export async function renameCardAbilities(oldId, newId, deps) {
  const out = { moved: 0, dropped: 0 };
  if (!oldId || !newId || oldId === newId) return out;
  const stale = (await deps.list(newId)) || [];
  for (const s of stale) { await deps.remove(s.id); out.dropped++; }
  const specs = (await deps.list(oldId)) || [];
  for (const s of specs) { await deps.update(s.id, { card_id: newId }); out.moved++; }
  return out;
}

// ¿Ya hay OTRA carta con ese card_id? (el id debe ser único: el juego identifica las cartas por él)
export async function cardIdTaken(cardId, ownId, base44) {
  if (!cardId) return false;
  const found = (await base44.entities.Card.filter({ card_id: cardId }, 'number', 5)) || [];
  return found.some((c) => c.id !== ownId);
}

// Al borrar una carta no deben quedar fichas huérfanas.
export async function removeCardAbilities(cardId, base44) {
  const specs = (await base44.entities.AbilityImpl.filter({ card_id: cardId }, '-created_date', 20)) || [];
  for (const s of specs) await base44.entities.AbilityImpl.delete(s.id);
  return specs.length;
}
