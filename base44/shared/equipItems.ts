// Construye un objeto de equipo del motor (arma, armadura, hechizo u objeto) a partir de una carta de la base de
// datos. LA BASE DE DATOS ES LA ÚNICA FUENTE: el servidor inyecta esta función en el juego y rellena con ella las
// tablas MELEE / RANGED / ARMORS / SPELLS / OBJECTS, en vez de usar las que traía escritas el motor.
// Se escribe sin anotaciones de tipos porque se inyecta como texto en el HTML del juego (toString()).
export const EQUIP_CATEGORIES = ['melee_weapon', 'ranged_weapon', 'armor', 'spell', 'object', 'bonus'];

export function buildEquipItem(c) {
  if (!c || !c.card_id || !c.name) return null;
  var e = (c.effect && typeof c.effect === 'object') ? c.effect : {};
  var n = function (v) { var x = Number(v); return isNaN(x) ? 0 : x; };
  // Las exportaciones/hojas de cálculo anteponen un apóstrofo a los textos que empiezan por + - = @ ("'+veloc"):
  // el motor compara con "+veloc" y la Daga Veloz perdería su bonus de velocidad. Se quita ese apóstrofo.
  var clean = function (v) { return String(v == null ? '' : v).replace(/^'(?=[+\-=@])/, ''); };
  var it = { id: c.card_id, name: clean(c.name), cost: n(c.cost), tag: clean(c.tag), txt: clean(c.txt), num: n(c.num) };
  var cat = c.cat;
  if (cat === 'melee_weapon') {
    it.cc = n(c.cc);
  } else if (cat === 'ranged_weapon') {
    it.power = n(c.power);
    it.hits = n(e.hits) || (it.tag === '2disparos' ? 2 : 1);
  } else if (cat === 'armor') {
    it.hp = n(c.hp); it.redM = n(e.redM); it.redA = n(e.redA); it.redH = n(e.redH); it.regen = n(e.regen); it.element = e.element || null;
  } else if (cat === 'spell') {
    if (!e.kind) return null;
    it.element = e.element || c.tag || ''; it.kind = e.kind; it.base = n(e.base); it.mana = n(c.mana); it.desc = it.txt;
    if (c.foil) it.foil = true;
  } else if (cat === 'object') {
    if (!e.kind) return null;
    it.kind = e.kind; it.val = n(e.val); it.desc = it.txt;
  } else if (cat === 'bonus') {
    if (!e.type) return null;
    it.type = e.type; it.effect = n(e.effect);
  } else {
    return null;
  }
  // El resto de parámetros de la ficha (p. ej. drain, element, type) pasan tal cual al objeto del motor.
  Object.keys(e).forEach(function (k) { if (k !== 'v' && it[k] === undefined) it[k] = e[k]; });
  return it;
}
