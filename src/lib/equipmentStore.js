// Los PARÁMETROS DEL MOTOR de las cartas de equipo viven en la entidad AbilityImpl (effect_type "equipment",
// params = los parámetros), una ficha por carta y keyed por card_id. Se guardan ahí y no en un campo nuevo de Card
// porque AbilityImpl ya acepta cualquier effect_type/params sin cambiar el esquema de la base de datos.
// El servidor lee estas fichas y construye con ellas las tablas del juego (armas, armaduras, hechizos, objetos).
export const EQUIPMENT_EFFECT_TYPE = 'equipment';

export function equipmentRecord(card, effect) {
  return {
    card_id: card.card_id, elite: false, ability_name: String(card.name || card.card_id),
    ability_text: String(card.description || card.ability_text || ''), status: 'implemented',
    effect_type: EQUIPMENT_EFFECT_TYPE, params: effect,
    note: 'Parámetros del motor de la carta de equipo: el juego construye sus tablas desde aquí.',
  };
}

export async function loadEquipEffect(cardId, base44) {
  if (!cardId) return null;
  const list = (await base44.entities.AbilityImpl.filter({ card_id: cardId }, '-created_date', 10)) || [];
  const rec = list.find((s) => s.effect_type === EQUIPMENT_EFFECT_TYPE);
  return rec && rec.params && Object.keys(rec.params).length ? rec.params : null;
}

// Crea o actualiza la ficha de equipo de una carta. Devuelve 'created' | 'updated'.
export async function saveEquipEffect(card, effect, base44) {
  const list = (await base44.entities.AbilityImpl.filter({ card_id: card.card_id }, '-created_date', 10)) || [];
  const rec = list.find((s) => s.effect_type === EQUIPMENT_EFFECT_TYPE);
  const payload = equipmentRecord(card, effect);
  if (rec) { await base44.entities.AbilityImpl.update(rec.id, payload); return 'updated'; }
  await base44.entities.AbilityImpl.create(payload);
  return 'created';
}

// Fichas de AbilityImpl cuyo card_id ya no corresponde a ninguna carta (restos de cartas borradas o renombradas).
export function findOrphanSpecs(specs, cards) {
  const ids = new Set((cards || []).map((c) => c.card_id));
  return (specs || []).filter((s) => !ids.has(s.card_id));
}
