// Añade las cartas NUEVAS de hechizos/objetos/equipo (creadas en el admin,
// fuera del base set) a los arrays del juego (SPELLS/OBJECTS/MELEE/RANGED/
// ARMORS) para que la IA las vea al equipar (bfAutoEquip) y pueda usarlas en
// batalla.
//
// syncDbEquipment (en entry.ts) solo actualiza las cartas del base set: las
// nuevas con números fuera del rango base se ignoraban (idx < 0 → return).
// Este parche se ejecuta tras syncDbEquipment y AÑADE esas cartas nuevas a
// los arrays, generando un id (card_id de la BD), un kind inferido del
// texto/stats y los campos que el motor del juego necesita para comprarlas
// y lanzarlas.
export const SYNC_NEW_EQUIP_PATCH = `
<script>
(function(){
  if (window.__bfSyncNewEquip) return;
  window.__bfSyncNewEquip = true;

  function infKind(db, sp) {
    var t = (db.txt || '').toLowerCase();
    if (sp) {
      if (/reviv|resucit|phoenix|f[eé]nix/.test(t)) return 'revive';
      if (/dormir|sue[ñn]o/.test(t)) return 'sleep';
      if (/paraliz/.test(t)) return 'paralyze';
      if (/escudo|barrera|protecc/.test(t)) return 'shield';
      if (/limpiar|liberar/.test(t)) return 'cleanse';
      if (/maldici/.test(t)) return 'curse';
      if (/bendici|bless/.test(t)) return 'bless';
      if (Number(db.heal || 0) > 0) return 'heal';
      if (Number(db.power || 0) > 0) return 'damage';
      if (db.element === 'curacion') return 'heal';
      if (db.element === 'proteccion') return 'shield';
      return 'damage';
    }
    if (Number(db.mana || 0) > 0) return 'mana';
    if (Number(db.heal || 0) > 0) return 'heal';
    return 'heal';
  }

  function syncNew() {
    if (typeof DB_EQUIP === 'undefined' || !DB_EQUIP) return;
    if (typeof SPELLS === 'undefined' || typeof OBJECTS === 'undefined') return;
    var CAT = { melee_weapon:'MELEE', ranged_weapon:'RANGED', armor:'ARMORS', spell:'SPELLS', object:'OBJECTS' };
    DB_EQUIP.forEach(function(db) {
      var arrName = CAT[db.cat]; if (!arrName) return;
      var list = window[arrName]; if (!list) return;
      // Ya está en el array (por id o por número): no duplicar.
      if (list.some(function(x) { return x && (x.id === db.card_id || (x.num != null && x.num === db.num)); })) return;
      if (!db.card_id || !db.name) return;
      var isSp = db.cat === 'spell';
      var ni = { id: db.card_id, name: db.name, cost: Number(db.cost || 0), txt: db.txt || '', desc: db.txt || '', num: db.num, base: 0, kind: infKind(db, isSp) };
      if (isSp) {
        ni.element = db.element || 'arcano';
        ni.mana = Number(db.mana || 0) || (typeof SPELL_MANA !== 'undefined' && SPELL_MANA[db.name] != null ? SPELL_MANA[db.name] : 5);
        if (Number(db.power || 0) > 0) ni.power = Number(db.power);
        if (Number(db.heal || 0) > 0) ni.heal = Number(db.heal);
      } else if (db.cat === 'object') {
        if (Number(db.heal || 0) > 0) ni.heal = Number(db.heal);
        if (Number(db.mana || 0) > 0) ni.mana = Number(db.mana);
      } else if (db.cat === 'melee_weapon') {
        if (Number(db.cc || 0) > 0) ni.cc = Number(db.cc);
      } else if (db.cat === 'ranged_weapon') {
        if (Number(db.power || 0) > 0) ni.power = Number(db.power);
      } else if (db.cat === 'armor') {
        if (Number(db.hp || 0) > 0) ni.hp = Number(db.hp);
      }
      list.push(ni);
    });
  }

  var tries = 0;
  var iv = setInterval(function() {
    syncNew();
    if (tries++ > 40) clearInterval(iv);
  }, 250);
})();
</script>
`;