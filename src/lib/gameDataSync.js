import { ABILITY_SEED } from '@/lib/abilitySeed';
import { EQUIPMENT_SEED } from '@/lib/equipmentSeed';
import { NEW_CARDS_SEED, CARD_UPDATES } from '@/lib/newCardsSeed';
import { saveEquipEffect } from '@/lib/equipmentStore';

// ACTUALIZAR DATOS DEL JUEGO (un solo botón del backoffice, seguro de repetir tras cada actualización).
// Solo AÑADE lo que falta; nunca sobrescribe lo que ya existe (fichas de habilidad o parámetros de equipo que hayas
// cambiado en el editor se respetan):
//   1. Cartas nuevas: se crean si no existen (con sus parámetros del motor).
//   2. Parámetros del motor del equipo: se guardan solo en las cartas que aún no los tienen.
//   3. Fichas de habilidad: se crean solo las que faltan (carta + normal/élite).
//   4. Ajustes puntuales de cartas: solo si la carta conserva el valor antiguo ("from").
export async function syncGameData(base44, onStep = () => {}) {
  const out = { cardsCreated: 0, paramsAdded: 0, specsAdded: 0, adjusted: 0, failed: 0 };
  const cards = await base44.entities.Card.list('number', 2000);
  const byId = new Map((cards || []).map((c) => [c.card_id, c]));
  const impls = await base44.entities.AbilityImpl.list('-created_date', 5000);
  const hasParams = new Set((impls || []).filter((r) => r.effect_type === 'equipment').map((r) => r.card_id));
  const hasSpec = new Set((impls || []).filter((r) => r.effect_type !== 'equipment').map((r) => r.card_id + '|' + (r.elite ? 1 : 0)));

  onStep('Cartas nuevas…');
  for (const item of NEW_CARDS_SEED) {
    try {
      let card = byId.get(item.card.card_id);
      if (!card) { card = await base44.entities.Card.create(item.card); byId.set(card.card_id, card); out.cardsCreated++; }
      if (!hasParams.has(item.card.card_id)) { await saveEquipEffect({ ...item.card, ...card }, item.effect, base44); hasParams.add(item.card.card_id); out.paramsAdded++; }
    } catch (e) { console.error(e); out.failed++; }
  }
  onStep('Parámetros de equipo…');
  for (const item of EQUIPMENT_SEED) {
    const card = byId.get(item.card_id);
    if (!card || hasParams.has(item.card_id)) continue;
    try { await saveEquipEffect(card, item.effect, base44); hasParams.add(item.card_id); out.paramsAdded++; } catch (e) { console.error(e); out.failed++; }
  }
  onStep('Fichas de habilidad…');
  for (const spec of ABILITY_SEED) {
    const k = spec.card_id + '|' + (spec.elite ? 1 : 0);
    if (hasSpec.has(k) || !byId.has(spec.card_id)) continue;
    try { await base44.entities.AbilityImpl.create(spec); hasSpec.add(k); out.specsAdded++; } catch (e) { console.error(e); out.failed++; }
  }
  onStep('Ajustes…');
  for (const u of CARD_UPDATES) {
    const card = byId.get(u.card_id);
    if (!card) continue;
    const stillOld = Object.keys(u.from || {}).every((k) => Number(card[k]) === Number(u.from[k]));
    const already = Object.keys(u.set).every((k) => Number(card[k]) === Number(u.set[k]));
    if (!stillOld || already) continue;
    try { await base44.entities.Card.update(card.id, u.set); out.adjusted++; } catch (e) { console.error(e); out.failed++; }
  }
  return out;
}
