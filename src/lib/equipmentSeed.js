// PARÁMETROS DEL MOTOR de las cartas de equipo (armas, armaduras, hechizos y objetos), listos para guardarse en
// Card.effect. Salen de las tablas que el motor tenía escritas en código: tras importarlos, la base de datos es
// la ÚNICA fuente y el juego construye esas tablas solo desde ella. Se importan desde Administración >
// "Importar parámetros de equipo" (actualiza Card.effect por card_id; no toca ningún otro campo).
export const EQUIPMENT_SEED = [
 {
  "card_id": "mw_sword",
  "category": "melee_weapon",
  "effect": {
   "v": 1
  }
 },
 {
  "card_id": "mw_mace",
  "category": "melee_weapon",
  "effect": {
   "v": 1
  }
 },
 {
  "card_id": "mw_axe",
  "category": "melee_weapon",
  "effect": {
   "v": 1
  }
 },
 {
  "card_id": "mw_dagger",
  "category": "melee_weapon",
  "effect": {
   "v": 1
  }
 },
 {
  "card_id": "mw_plasma",
  "category": "melee_weapon",
  "effect": {
   "v": 1
  }
 },
 {
  "card_id": "mw_thunder",
  "category": "melee_weapon",
  "effect": {
   "v": 1
  }
 },
 {
  "card_id": "rw_sling",
  "category": "ranged_weapon",
  "effect": {
   "v": 1,
   "hits": 1
  }
 },
 {
  "card_id": "rw_cross",
  "category": "ranged_weapon",
  "effect": {
   "v": 1,
   "hits": 1
  }
 },
 {
  "card_id": "rw_pistol",
  "category": "ranged_weapon",
  "effect": {
   "v": 1,
   "hits": 1
  }
 },
 {
  "card_id": "rw_smg",
  "category": "ranged_weapon",
  "effect": {
   "v": 1,
   "hits": 2
  }
 },
 {
  "card_id": "rw_cannon",
  "category": "ranged_weapon",
  "effect": {
   "v": 1,
   "hits": 1
  }
 },
 {
  "card_id": "rw_plasma",
  "category": "ranged_weapon",
  "effect": {
   "v": 1,
   "hits": 1
  }
 },
 {
  "card_id": "rw_elfbow",
  "category": "ranged_weapon",
  "effect": {
   "v": 1,
   "hits": 1
  }
 },
 {
  "card_id": "rw_photon",
  "category": "ranged_weapon",
  "effect": {
   "v": 1,
   "hits": 1
  }
 },
 {
  "card_id": "ar_leather",
  "category": "armor",
  "effect": {
   "v": 1,
   "redM": 2,
   "redA": 2,
   "redH": 0,
   "regen": 0,
   "element": null
  }
 },
 {
  "card_id": "ar_mail",
  "category": "armor",
  "effect": {
   "v": 1,
   "redM": 4,
   "redA": 4,
   "redH": 1,
   "regen": 0,
   "element": null
  }
 },
 {
  "card_id": "ar_plate",
  "category": "armor",
  "effect": {
   "v": 1,
   "redM": 6,
   "redA": 5,
   "redH": 2,
   "regen": 0,
   "element": null
  }
 },
 {
  "card_id": "ar_arcane",
  "category": "armor",
  "effect": {
   "v": 1,
   "redM": 1,
   "redA": 1,
   "redH": 6,
   "regen": 0,
   "element": null
  }
 },
 {
  "card_id": "ar_aegis",
  "category": "armor",
  "effect": {
   "v": 1,
   "redM": 3,
   "redA": 4,
   "redH": 4,
   "regen": 0,
   "element": null
  }
 },
 {
  "card_id": "ar_exo",
  "category": "armor",
  "effect": {
   "v": 1,
   "redM": 3,
   "redA": 3,
   "redH": 3,
   "regen": 2,
   "element": null
  }
 },
 {
  "card_id": "ar_water",
  "category": "armor",
  "effect": {
   "v": 1,
   "redM": 3,
   "redA": 3,
   "redH": 1,
   "regen": 0,
   "element": "agua"
  }
 },
 {
  "card_id": "ar_thunder",
  "category": "armor",
  "effect": {
   "v": 1,
   "redM": 3,
   "redA": 3,
   "redH": 1,
   "regen": 0,
   "element": "rayo"
  }
 },
 {
  "card_id": "ar_ice",
  "category": "armor",
  "effect": {
   "v": 1,
   "redM": 3,
   "redA": 3,
   "redH": 1,
   "regen": 0,
   "element": "hielo"
  }
 },
 {
  "card_id": "ar_fire",
  "category": "armor",
  "effect": {
   "v": 1,
   "redM": 3,
   "redA": 3,
   "redH": 1,
   "regen": 0,
   "element": "fuego"
  }
 },
 {
  "card_id": "sp_fire1",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "dmg1",
   "base": 13,
   "element": "fuego"
  }
 },
 {
  "card_id": "sp_fire2",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "dmgAll",
   "base": 8,
   "element": "fuego"
  }
 },
 {
  "card_id": "sp_ice1",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "dmg1slow",
   "base": 11,
   "element": "hielo"
  }
 },
 {
  "card_id": "sp_ray1",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "dmg2",
   "base": 9,
   "element": "rayo"
  }
 },
 {
  "card_id": "sp_agua1",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "dmgAll",
   "base": 7,
   "element": "agua"
  }
 },
 {
  "card_id": "sp_heal1",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "heal1",
   "base": 14,
   "element": "curacion"
  }
 },
 {
  "card_id": "sp_heal2",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "healAll",
   "base": 9,
   "element": "curacion"
  }
 },
 {
  "card_id": "sp_prot1",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "shield",
   "base": 12,
   "element": "proteccion"
  }
 },
 {
  "card_id": "sp_ward",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "ward",
   "base": 8,
   "element": "arcano"
  }
 },
 {
  "card_id": "sp_sleep",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "sleep",
   "base": 1,
   "element": "estado"
  }
 },
 {
  "card_id": "sp_para",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "para",
   "base": 1,
   "element": "estado"
  }
 },
 {
  "card_id": "sp_curse",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "debuff",
   "base": 4,
   "element": "estado"
  }
 },
 {
  "card_id": "sp_bless",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "buff",
   "base": 4,
   "element": "estado"
  }
 },
 {
  "card_id": "sp_transform",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "transform",
   "base": 1,
   "element": "arcano"
  }
 },
 {
  "card_id": "sp_recover",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "bf_recover",
   "base": 1,
   "element": "arcano"
  }
 },
 {
  "card_id": "sp_steal",
  "category": "spell",
  "effect": {
   "v": 1,
   "kind": "bf_steal",
   "base": 1,
   "element": "arcano"
  }
 },
 {
  "card_id": "ob_pot",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "heal",
   "val": 18
  }
 },
 {
  "card_id": "ob_potbig",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "healBig",
   "val": 30
  }
 },
 {
  "card_id": "ob_mana",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "mana",
   "val": 20
  }
 },
 {
  "card_id": "ob_manabig",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "manaBig",
   "val": 40
  }
 },
 {
  "card_id": "ob_shield",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "shield",
   "val": 12
  }
 },
 {
  "card_id": "ob_cleanse",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "cleanse",
   "val": 0
  }
 },
 {
  "card_id": "ob_bomb",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "bomb",
   "val": 14
  }
 },
 {
  "card_id": "ob_revive",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "revive",
   "val": 50
  }
 },
 {
  "card_id": "ob_phoenix",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "reviveAll",
   "val": 50
  }
 },
 {
  "card_id": "ob_rearm",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "bf_rearm",
   "val": 0,
   "element": "arcano",
   "type": "arcano"
  }
 },
 {
  "card_id": "ob_drain",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "bf_drain",
   "val": 0,
   "drain": 15
  }
 },
 {
  "card_id": "ob_ring",
  "category": "object",
  "effect": {
   "v": 1,
   "kind": "bf_ring",
   "val": 0,
   "element": "arcano",
   "type": "arcano"
  }
 }
];
