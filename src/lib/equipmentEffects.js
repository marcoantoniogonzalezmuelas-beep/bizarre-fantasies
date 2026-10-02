// Catálogo de PARÁMETROS DEL MOTOR para las cartas de equipo (Card.effect). Lo usan el editor (formulario y
// validación) y las pruebas. Los "tipos" (kind) son las mecánicas que el motor sabe ejecutar: una carta nueva
// elige uno y pone sus números, sin escribir código. Las marcadas como "dedicadas" tienen programación propia.
export const ELEMENTS = ['fuego', 'agua', 'hielo', 'rayo'];   // elementos de armadura
export const SPELL_ELEMENTS = ['fuego', 'hielo', 'rayo', 'agua', 'curacion', 'proteccion', 'arcano', 'estado'];
export const SPELL_KINDS = {
  dmg1: 'Daño a un rival', dmgAll: 'Daño a todos los rivales', dmg1slow: 'Daño a un rival y lo ralentiza', dmg2: 'Daño a 2 rivales',
  heal1: 'Cura a un aliado', healAll: 'Cura a todos los aliados', shield: 'Escudo a un aliado', ward: 'Barrera contra hechizos (2 turnos)',
  sleep: 'Duerme a un rival', para: 'Paraliza a un rival', debuff: 'Resta stats a un rival', buff: 'Suma stats a un aliado',
  transform: 'DEDICADA: Transformer', bf_recover: 'DEDICADA: recuperar carta del descarte', bf_steal: 'DEDICADA: robar carta al rival',
};
export const OBJECT_KINDS = {
  heal: 'Cura (valor fijo)', healBig: 'Cura grande (valor fijo)', mana: 'Restaura maná', manaBig: 'Restaura mucho maná', shield: 'Escudo (valor fijo)',
  cleanse: 'Quita estados negativos', bomb: 'Daño directo a un rival', revive: 'Revive a un héroe (% de vida)', reviveAll: 'Revive a todos los caídos',
  bf_rearm: 'DEDICADO: rearmar desde el descarte', bf_drain: 'DEDICADO: robar vida', bf_ring: 'DEDICADO: invisibilidad',
};
export const ARMOR_FIELDS = ['redM', 'redA', 'redH', 'regen'];

export const EQUIPMENT_EFFECT_CATEGORIES = ['ranged_weapon', 'armor', 'spell', 'object'];
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
// Devuelve { ok, errors[] }. Los números nunca pueden faltar ni ser negativos (salvo que se indique).
export function validateEffect(category, effect) {
  const errors = [];
  const e = effect && typeof effect === 'object' ? effect : null;
  // Las categorías sin parámetros del motor (arma cuerpo a cuerpo, bonus, héroes...) nunca los exigen.
  if (!EQUIPMENT_EFFECT_CATEGORIES.includes(category)) return { ok: true, errors };
  if (!e) return { ok: false, errors: ['Faltan los parámetros del motor (effect).'] };
  if (category === 'ranged_weapon') {
    if (e.hits !== undefined && !(isNum(e.hits) && e.hits >= 1 && e.hits <= 5)) errors.push('hits debe ser un número de 1 a 5.');
  } else if (category === 'armor') {
    ARMOR_FIELDS.forEach((f) => { if (!isNum(e[f]) || e[f] < 0) errors.push(`${f} debe ser un número igual o mayor que 0.`); });
    if (e.element != null && !ELEMENTS.includes(e.element)) errors.push('element debe ser fuego, agua, hielo, rayo o vacío.');
  } else if (category === 'spell') {
    if (!SPELL_KINDS[e.kind]) errors.push('kind desconocido para un hechizo: ' + e.kind);
    if (!isNum(e.base) || e.base < 0) errors.push('base debe ser un número igual o mayor que 0.');
  } else if (category === 'object') {
    if (!OBJECT_KINDS[e.kind]) errors.push('kind desconocido para un objeto: ' + e.kind);
    if (!isNum(e.val) || e.val < 0) errors.push('val debe ser un número igual o mayor que 0.');
  } else {
    return { ok: true, errors };
  }
  return { ok: errors.length === 0, errors };
}

export function defaultEffect(category) {
  switch (category) {
    case 'ranged_weapon': return { v: 1, hits: 1 };
    case 'armor': return { v: 1, redM: 0, redA: 0, redH: 0, regen: 0, element: null };
    case 'spell': return { v: 1, kind: 'dmg1', base: 10, element: 'fuego' };
    case 'object': return { v: 1, kind: 'heal', val: 10 };
    default: return { v: 1 };
  }
}
