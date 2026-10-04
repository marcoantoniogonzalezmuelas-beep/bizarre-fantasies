import { buildEquipItem } from '../../base44/shared/equipItems.ts';

// COMPROBACIÓN DE LA TIENDA DE EQUIPO: con las cartas y los parámetros de la base de datos, dice qué cartas de
// equipo saldrán en la tienda y cuáles no (y por qué). Usa el MISMO constructor que el servidor (buildEquipItem) y
// la misma forma de datos (DB_EQUIP de gameHtml), así que su veredicto es el del juego.
const CATS = ['melee_weapon', 'ranged_weapon', 'armor', 'spell', 'object', 'bonus'];
export const CAT_LABEL = { melee_weapon: 'Armas C/C', ranged_weapon: 'Armas a distancia', armor: 'Armaduras', spell: 'Hechizos', object: 'Objetos', bonus: 'Bonus' };

export function toDbEquip(c, effect) {
  return { num: Number(c.number), cat: c.category, card_id: c.card_id, name: c.name, cost: c.cost, txt: c.ability_text || c.description || '',
    cc: c.cc, ad: c.ad, he: c.he, hp: c.hp, power: c.power, mana: c.mana, element: c.type || '', tag: c.tag || '', foil: c.foil === true, effect: effect || c.effect || null };
}

// cards: filas de Card; impls: filas de AbilityImpl (effect_type 'equipment'). Devuelve { ok:[], missing:[] }.
export function checkEquipShop(cards, impls) {
  const eq = {};
  (impls || []).forEach((r) => { if (r && r.effect_type === 'equipment' && r.card_id && r.params) eq[r.card_id] = r.params; });
  const ok = [], missing = [];
  (cards || []).filter((c) => c && CATS.includes(c.category)).sort((a, b) => Number(a.number) - Number(b.number)).forEach((c) => {
    const db = toDbEquip(c, eq[c.card_id]);
    let item = null;
    try { item = buildEquipItem(db); } catch (e) { item = null; }
    const row = { card_id: c.card_id, name: c.name, number: c.number, category: c.category, hasParams: !!db.effect };
    if (item) ok.push(row);
    else missing.push({ ...row, why: db.effect ? 'sus parámetros del motor están incompletos' : 'no tiene parámetros del motor (ábrela en el editor y guárdala)' });
  });
  return { ok, missing };
}
