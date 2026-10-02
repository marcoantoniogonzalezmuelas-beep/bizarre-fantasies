// FICHAS DE HABILIDAD de la base de datos (entidad AbilityImpl): cada habilidad de cada héroe y bizarro, descrita con los
// pasos que ejecuta el motor (abilityImplPatch). El juego lee estas fichas y no necesita código por héroe. Se importan
// desde Administración > "Importar fichas de habilidad" (crea o actualiza por card_id + elite; no toca las demás).
// El texto manda: si el motor antiguo hacía algo que la carta no dice, la ficha sigue a la carta (ver cada "note").
// Las de tipo dedicated_* (pasivas, invocaciones, dados) están registradas aquí pero su comportamiento sigue en el motor.
export const ABILITY_SEED = [
 {
  "card_id": "kru",
  "elite": false,
  "ability_name": "Torbellino",
  "ability_text": "Golpea a TODOS los rivales en cuerpo a cuerpo.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "cc",
     "stat_mult": 0.8,
     "dtype": "melee"
    }
   ]
  },
  "note": "Torbellino: 0,8 x CC a todos. Élite +5 (sin parálisis: el texto no la menciona)."
 },
 {
  "card_id": "kru",
  "elite": true,
  "ability_name": "Torbellino Supremo",
  "ability_text": "Golpea a todos +5 de daño, sin penalización.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "cc",
     "stat_mult": 0.8,
     "dtype": "melee",
     "bonus": 5
    }
   ]
  },
  "note": "Torbellino: 0,8 x CC a todos. Élite +5 (sin parálisis: el texto no la menciona)."
 },
 {
  "card_id": "bos",
  "elite": false,
  "ability_name": "Intimidación",
  "ability_text": "Todos los rivales -3 a sus stats durante 1 turno.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "debuff",
     "target": "all_enemies",
     "mods": {
      "cc": 3,
      "ad": 3,
      "he": 3
     },
     "turns": 1
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: debuff→all_enemies."
 },
 {
  "card_id": "bos",
  "elite": true,
  "ability_name": "Terror Absoluto",
  "ability_text": "Todos los rivales -5 a sus stats durante 2 turnos.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "debuff",
     "target": "all_enemies",
     "mods": {
      "cc": 5,
      "ad": 5,
      "he": 5
     },
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: debuff→all_enemies."
 },
 {
  "card_id": "nar",
  "elite": false,
  "ability_name": "El Soltaito",
  "ability_text": "Gran golpe de futbolín que además destruye el arma/armadura del objetivo.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "destroy_equipment",
     "target": "enemy"
    },
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "cc",
     "stat_mult": 1.0,
     "dtype": "melee"
    }
   ]
  },
  "note": "Destruye arma, armadura y escudo antes de golpear (1 x CC). Élite: paraliza 2 turnos a los 3 rivales."
 },
 {
  "card_id": "nar",
  "elite": true,
  "ability_name": "Narbonizar",
  "ability_text": "Paraliza 2 turnos a los 3 héroes del rival.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "paralyze",
     "target": "all_enemies",
     "turns": 2
    }
   ]
  },
  "note": "Destruye arma, armadura y escudo antes de golpear (1 x CC). Élite: paraliza 2 turnos a los 3 rivales."
 },
 {
  "card_id": "achucm",
  "elite": false,
  "ability_name": "Furia Ciega",
  "ability_text": "Entra en furia: +6 CC y +4 velocidad este combate.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "buff",
     "target": "self",
     "mods": {
      "cc": 6,
      "vel": 4
     },
     "turns": 99
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: buff→self."
 },
 {
  "card_id": "achucm",
  "elite": true,
  "ability_name": "Berserker Supremo",
  "ability_text": "'+9 CC, +6 velocidad y robo de vida en CC.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "buff",
     "target": "self",
     "mods": {
      "cc": 9,
      "vel": 6
     },
     "turns": 99
    },
    {
     "action": "lifesteal",
     "target": "self"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: buff→self, lifesteal→self."
 },
 {
  "card_id": "tor",
  "elite": false,
  "ability_name": "Muro",
  "ability_text": "Otorga un escudo de 14 a un aliado.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "shield",
     "target": "ally",
     "amount": 14
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: shield→ally."
 },
 {
  "card_id": "tor",
  "elite": true,
  "ability_name": "Bastión Eterno",
  "ability_text": "Escudo de 22 a un aliado y +3 CC propio.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "shield",
     "target": "ally",
     "amount": 22
    },
    {
     "action": "buff",
     "target": "self",
     "mods": {
      "cc": 3
     },
     "turns": 99
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: shield→ally, buff→self."
 },
 {
  "card_id": "Undertaker",
  "elite": false,
  "ability_name": "Decapitación",
  "ability_text": "Ejecuta al instante a un rival por debajo de 8 HP.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "execute",
     "target": "enemy",
     "threshold": 8,
     "else_mult": 0.6,
     "scale_stat": "cc"
    }
   ]
  },
  "note": "Normal: ejecuta si le quedan 8 HP o menos (si no, golpe 0,6 x CC). Élite: ejecuta a TODOS los rivales con 14 HP o menos."
 },
 {
  "card_id": "Undertaker",
  "elite": true,
  "ability_name": "Ejecución Masiva",
  "ability_text": "Ejecuta rivales por debajo de 14 HP.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "execute",
     "target": "all_enemies",
     "threshold": 14
    }
   ]
  },
  "note": "Normal: ejecuta si le quedan 8 HP o menos (si no, golpe 0,6 x CC). Élite: ejecuta a TODOS los rivales con 14 HP o menos."
 },
 {
  "card_id": "boski",
  "elite": false,
  "ability_name": "Raíces Ancestrales",
  "ability_text": "Cura toda la vida a un héroe aliado que elija.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "heal_full",
     "target": "ally"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: heal_full→ally."
 },
 {
  "card_id": "boski",
  "elite": true,
  "ability_name": "Árbol Eterno",
  "ability_text": "Cura toda la vida a todo su ejército, incluido él.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "heal_full",
     "target": "all_allies"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: heal_full→all_allies."
 },
 {
  "card_id": "painkil",
  "elite": false,
  "ability_name": "Atravesar",
  "ability_text": "Golpe CC que IGNORA armadura y escudos.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "cc",
     "stat_mult": 1.0,
     "dtype": "melee",
     "ignore_shield": true,
     "ignore_armor": true
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "painkil",
  "elite": true,
  "ability_name": "Forma Espectral",
  "ability_text": "Golpe que ignora todo y reduce HP máx del rival.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "cc",
     "stat_mult": 1.0,
     "dtype": "melee",
     "bonus": 5,
     "ignore_shield": true,
     "ignore_armor": true
    },
    {
     "action": "reduce_max_hp",
     "target": "enemy",
     "amount": 5
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, reduce_max_hp→enemy."
 },
 {
  "card_id": "mor",
  "elite": false,
  "ability_name": "Absorción Oscura",
  "ability_text": "Golpe que roba vida (cura la mitad del daño).",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "cc",
     "stat_mult": 1.0,
     "dtype": "melee",
     "lifesteal": 0.5
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "mor",
  "elite": true,
  "ability_name": "Festín de Almas",
  "ability_text": "Golpe que roba toda la vida infligida y +3 CC.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "cc",
     "stat_mult": 1.0,
     "dtype": "melee",
     "lifesteal": 1
    },
    {
     "action": "buff",
     "target": "self",
     "mods": {
      "cc": 3
     },
     "turns": 99
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, buff→self."
 },
 {
  "card_id": "vap",
  "elite": false,
  "ability_name": "Aplastamiento",
  "ability_text": "Ataque cuerpo a cuerpo (usa su CC): hace DOBLE daño si al rival le queda menos del 40% de su vida.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "cc",
     "stat_mult": 1.0,
     "dtype": "melee",
     "double_below": 0.4
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "vap",
  "elite": true,
  "ability_name": "Exterminio",
  "ability_text": "Ataque cuerpo a cuerpo (usa su CC): hace DOBLE daño si al rival le queda menos del 60% de su vida.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "cc",
     "stat_mult": 1.0,
     "dtype": "melee",
     "double_below": 0.6
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "hannai",
  "elite": false,
  "ability_name": "Sigilo Cuántico",
  "ability_text": "Se vuelve evasiva: esquiva el próximo ataque recibido.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "evade",
     "target": "self",
     "amount": 1
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: evade→self."
 },
 {
  "card_id": "hannai",
  "elite": true,
  "ability_name": "Sombra Cuántica",
  "ability_text": "Esquiva 2 ataques y +5 al siguiente golpe.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "evade",
     "target": "self",
     "amount": 2
    },
    {
     "action": "buff",
     "target": "self",
     "mods": {
      "cc": 5,
      "ad": 5
     },
     "turns": 1
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: evade→self, buff→self."
 },
 {
  "card_id": "kre",
  "elite": false,
  "ability_name": "Devastación",
  "ability_text": "Golpe CC imposible de bloquear o reducir.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "cc",
     "stat_mult": 1.0,
     "dtype": "melee",
     "ignore_shield": true
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "kre",
  "elite": true,
  "ability_name": "Aniquilación",
  "ability_text": "Golpe imbloqueable que daña a dos objetivos.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "cc",
     "stat_mult": 1.0,
     "dtype": "melee",
     "ignore_shield": true
    },
    {
     "action": "damage",
     "target": "other_enemy",
     "scale_stat": "cc",
     "stat_mult": 0.7,
     "dtype": "melee",
     "ignore_shield": true
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, damage→other_enemy."
 },
 {
  "card_id": "hev",
  "elite": false,
  "ability_name": "Headbang",
  "ability_text": "Onda sónica: golpe CC a todos los rivales.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "cc",
     "stat_mult": 0.8,
     "dtype": "melee"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→all_enemies."
 },
 {
  "card_id": "hev",
  "elite": true,
  "ability_name": "Wall of Death",
  "ability_text": "Golpe a todos +5 y aturde 1 turno.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "cc",
     "stat_mult": 0.8,
     "dtype": "melee",
     "bonus": 5
    },
    {
     "action": "paralyze",
     "target": "all_enemies",
     "turns": 1
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→all_enemies, paralyze→all_enemies."
 },
 {
  "card_id": "pij",
  "elite": false,
  "ability_name": "Postureo",
  "ability_text": "Humilla al rival: -4 a todos sus stats 2 turnos.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "debuff",
     "target": "enemy",
     "mods": {
      "cc": 4,
      "ad": 4,
      "he": 4
     },
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: debuff→enemy."
 },
 {
  "card_id": "pij",
  "elite": true,
  "ability_name": "Élite Total",
  "ability_text": "'-6 a todos los rivales y +3 CC propio.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "debuff",
     "target": "all_enemies",
     "mods": {
      "cc": 6,
      "ad": 6,
      "he": 6
     },
     "turns": 2
    },
    {
     "action": "buff",
     "target": "self",
     "mods": {
      "cc": 3
     },
     "turns": 99
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: debuff→all_enemies, buff→self."
 },
 {
  "card_id": "pat",
  "elite": false,
  "ability_name": "Flecha Guiada",
  "ability_text": "Disparo que ignora media defensa del objetivo.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 1.2,
     "dtype": "ranged",
     "pierce": 0.5
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "pat",
  "elite": true,
  "ability_name": "Flecha Infalible",
  "ability_text": "Disparo que ignora toda la defensa y atraviesa.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 1.2,
     "dtype": "ranged",
     "bonus": 5,
     "pierce": 1
    },
    {
     "action": "damage",
     "target": "other_enemy",
     "scale_stat": "ad",
     "stat_mult": 0.7,
     "dtype": "ranged",
     "pierce": 1
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, damage→other_enemy."
 },
 {
  "card_id": "tsuru",
  "elite": false,
  "ability_name": "Lluvia de Flechas",
  "ability_text": "Disparo a TODOS los rivales.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "ad",
     "stat_mult": 0.8,
     "dtype": "ranged"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→all_enemies."
 },
 {
  "card_id": "tsuru",
  "elite": true,
  "ability_name": "Tormenta de Flechas",
  "ability_text": "Disparo a todos +daño y -2 AD a cada uno.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "ad",
     "stat_mult": 0.8,
     "dtype": "ranged",
     "bonus": 4,
     "pierce": 0.5
    },
    {
     "action": "debuff",
     "target": "all_enemies",
     "mods": {
      "ad": 2
     },
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→all_enemies, debuff→all_enemies."
 },
 {
  "card_id": "elder",
  "elite": false,
  "ability_name": "Marca del Cazador",
  "ability_text": "Marca a un rival: recibe +5 de daño de cualquier fuente.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "mark",
     "target": "enemy",
     "amount": 5,
     "turns": 3
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: mark→enemy."
 },
 {
  "card_id": "elder",
  "elite": true,
  "ability_name": "Marca Permanente",
  "ability_text": "Marca persistente con +8 de daño extra.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "mark",
     "target": "enemy",
     "amount": 8,
     "turns": 99
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: mark→enemy."
 },
 {
  "card_id": "zar",
  "elite": false,
  "ability_name": "Disparo Silencioso",
  "ability_text": "Dispara de inmediato, no puede ser bloqueado.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 1.2,
     "dtype": "ranged",
     "ignore_shield": true
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "zar",
  "elite": true,
  "ability_name": "Modo Guerrera Definitiva",
  "ability_text": "Su pelo se eriza y brilla con un aura dorada: dispara dos veces con una fuerza descomunal digna de leyenda (aunque solo le dura el combate).",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 0.9,
     "dtype": "ranged",
     "bonus": 3,
     "ignore_shield": true,
     "hits": [
      0,
      0
     ]
    },
    {
     "action": "buff",
     "target": "self",
     "mods": {
      "ad": 6
     },
     "turns": 99
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, buff→self."
 },
 {
  "card_id": "alf",
  "elite": false,
  "ability_name": "Doble Disparo",
  "ability_text": "Dispara DOS veces (2º a -3 de potencia).",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 0.9,
     "dtype": "ranged",
     "hits": [
      0,
      -3
     ]
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "alf",
  "elite": true,
  "ability_name": "Disparo Perfecto",
  "ability_text": "Ambos disparos a plena potencia.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 0.9,
     "dtype": "ranged",
     "bonus": 3,
     "pierce": 0.5,
     "hits": [
      0,
      0
     ]
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "dix",
  "elite": false,
  "ability_name": "Punto Débil",
  "ability_text": "Disparo que ignora la armadura defensiva del objetivo.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 1.2,
     "dtype": "ranged",
     "pierce": 1,
     "ignore_armor": true
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "dix",
  "elite": true,
  "ability_name": "Punto Vital",
  "ability_text": "Disparo que ignora equipo y pega al 50% de vida.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "dtype": "ranged",
     "hp_pct": 0.5,
     "pierce": 1,
     "ignore_shield": true,
     "ignore_armor": true
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "ska",
  "elite": false,
  "ability_name": "Grito del Vacío",
  "ability_text": "Todos los rivales -4 a todos sus stats 1 turno.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "debuff",
     "target": "all_enemies",
     "mods": {
      "cc": 4,
      "ad": 4,
      "he": 4
     },
     "turns": 1
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: debuff→all_enemies."
 },
 {
  "card_id": "ska",
  "elite": true,
  "ability_name": "Alarido Eterno",
  "ability_text": "Todos los rivales -6 a todos sus stats durante 2 turnos.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "debuff",
     "target": "all_enemies",
     "mods": {
      "cc": 6,
      "ad": 6,
      "he": 6
     },
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: debuff→all_enemies."
 },
 {
  "card_id": "syx",
  "elite": false,
  "ability_name": "Mutación",
  "ability_text": "Copia y mejora: +4 a todos sus stats este combate.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "buff",
     "target": "self",
     "mods": {
      "cc": 4,
      "ad": 4,
      "he": 4,
      "vel": 4
     },
     "turns": 99
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: buff→self."
 },
 {
  "card_id": "syx",
  "elite": true,
  "ability_name": "Evolución Suprema",
  "ability_text": "'+6 a todos sus stats y cura 10.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "buff",
     "target": "self",
     "mods": {
      "cc": 6,
      "ad": 6,
      "he": 6,
      "vel": 6
     },
     "turns": 99
    },
    {
     "action": "heal",
     "target": "self",
     "amount": 10
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: buff→self, heal→self."
 },
 {
  "card_id": "gor",
  "elite": false,
  "ability_name": "Onda de Impacto",
  "ability_text": "Disparo a todos los rivales.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "ad",
     "stat_mult": 0.8,
     "dtype": "ranged"
    }
   ]
  },
  "note": "Élite: solo daño aumentado (el texto no menciona debuff)."
 },
 {
  "card_id": "gor",
  "elite": true,
  "ability_name": "Devastación Orbital",
  "ability_text": "Disparo a todos con daño aumentado.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "ad",
     "stat_mult": 0.8,
     "dtype": "ranged",
     "bonus": 4,
     "pierce": 0.5
    }
   ]
  },
  "note": "Élite: solo daño aumentado (el texto no menciona debuff)."
 },
 {
  "card_id": "fut",
  "elite": false,
  "ability_name": "Tiro Libre",
  "ability_text": "Disparo cargado: gran daño a un objetivo.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 1.4,
     "dtype": "ranged",
     "pierce": 0.4
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "fut",
  "elite": true,
  "ability_name": "Chilena Estelar",
  "ability_text": "Disparo demoledor que ignora defensa.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 1.4,
     "dtype": "ranged",
     "bonus": 6,
     "pierce": 1
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "gam",
  "elite": false,
  "ability_name": "Headshot",
  "ability_text": "Disparo crítico de precisión letal.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 1.4,
     "dtype": "ranged",
     "pierce": 0.4
    }
   ]
  },
  "note": "Élite: ignora armadura y escudo (el texto dice \"ignora todo el equipo\")."
 },
 {
  "card_id": "gam",
  "elite": true,
  "ability_name": "Aimbot",
  "ability_text": "Disparo crítico que ignora todo el equipo.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "ad",
     "stat_mult": 1.4,
     "dtype": "ranged",
     "bonus": 6,
     "pierce": 1,
     "ignore_armor": true,
     "ignore_shield": true
    }
   ]
  },
  "note": "Élite: ignora armadura y escudo (el texto dice \"ignora todo el equipo\")."
 },
 {
  "card_id": "mal",
  "elite": false,
  "ability_name": "Tormenta Mágica",
  "ability_text": "Daño mágico a TODOS los rivales.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "he",
     "stat_mult": 0.9,
     "dtype": "spell",
     "element": "rayo"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→all_enemies."
 },
 {
  "card_id": "mal",
  "elite": true,
  "ability_name": "Apocalipsis",
  "ability_text": "Daño mágico masivo a todos y silencio 1 turno.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "he",
     "stat_mult": 0.9,
     "dtype": "spell",
     "bonus": 5,
     "element": "rayo"
    },
    {
     "action": "silence",
     "target": "all_enemies",
     "turns": 1
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→all_enemies, silence→all_enemies."
 },
 {
  "card_id": "ser",
  "elite": false,
  "ability_name": "Inversión",
  "ability_text": "Golpe mágico que además intercambia CC y HE del rival.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "he",
     "stat_mult": 1.5,
     "dtype": "spell",
     "element": "arcano"
    },
    {
     "action": "swap_stats",
     "target": "enemy"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, swap_stats→enemy."
 },
 {
  "card_id": "ser",
  "elite": true,
  "ability_name": "Inversión Total",
  "ability_text": "Golpe mágico e invierte stats de dos rivales.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "he",
     "stat_mult": 1.5,
     "dtype": "spell",
     "bonus": 6,
     "element": "arcano"
    },
    {
     "action": "swap_stats",
     "target": "enemy"
    },
    {
     "action": "damage",
     "target": "other_enemy",
     "scale_stat": "he",
     "stat_mult": 1.5,
     "dtype": "spell",
     "bonus": 6,
     "element": "arcano"
    },
    {
     "action": "swap_stats",
     "target": "other_enemy"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, swap_stats→enemy, damage→other_enemy, swap_stats→other_enemy."
 },
 {
  "card_id": "bat",
  "elite": false,
  "ability_name": "Espíritu Guardián",
  "ability_text": "Escudo de 14 a un aliado.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "shield",
     "target": "ally",
     "amount": 14
    }
   ]
  },
  "note": "Élite: el escudo se regenera a la mitad al final de cada turno: 22, 11, 6, 3, 2, 1, 0 (bandera _bfShieldRegen del motor)."
 },
 {
  "card_id": "bat",
  "elite": true,
  "ability_name": "Escudo Ancestral",
  "ability_text": "Escudo de 22 que se regenera cada turno a la mitad del valor anterior (22-11-6-3-2-1-0).",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "shield",
     "target": "ally",
     "amount": 22
    },
    {
     "action": "shield_regen",
     "target": "ally",
     "amount": 22
    }
   ]
  },
  "note": "Élite: el escudo se regenera a la mitad al final de cada turno: 22, 11, 6, 3, 2, 1, 0 (bandera _bfShieldRegen del motor)."
 },
 {
  "card_id": "nix",
  "elite": false,
  "ability_name": "Drenaje Vital",
  "ability_text": "Roba HP a un rival y cura a un aliado.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "he",
     "stat_mult": 1.1,
     "dtype": "spell",
     "element": "arcano",
     "lifesteal": 1,
     "heal_to": "weakest_ally"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "nix",
  "elite": true,
  "ability_name": "Drenaje Masivo",
  "ability_text": "Roba más HP y lo reparte entre aliados.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "he",
     "stat_mult": 1.25,
     "dtype": "spell",
     "bonus": 6,
     "element": "arcano",
     "lifesteal": 1,
     "split_allies": 0.5
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy."
 },
 {
  "card_id": "vex",
  "elite": false,
  "ability_name": "Interferencia",
  "ability_text": "Anula la habilidad especial de un rival y hace daño.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "silence",
     "target": "enemy",
     "turns": 99
    },
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "he",
     "stat_mult": 1.1,
     "dtype": "spell",
     "element": "arcano"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: silence→enemy, damage→enemy."
 },
 {
  "card_id": "vex",
  "elite": true,
  "ability_name": "Silencio Total",
  "ability_text": "Anula habilidad y golpe mágico fuerte.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "silence",
     "target": "enemy",
     "turns": 99
    },
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "he",
     "stat_mult": 1.6,
     "dtype": "spell",
     "element": "arcano"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: silence→enemy, damage→enemy."
 },
 {
  "card_id": "chi",
  "elite": false,
  "ability_name": "Balada Curativa",
  "ability_text": "Cura a TODOS los aliados.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "heal",
     "target": "all_allies",
     "amount": 9
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: heal→all_allies."
 },
 {
  "card_id": "chi",
  "elite": true,
  "ability_name": "Sinfonía Cósmica",
  "ability_text": "Cura a todos +2 a sus stats.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "heal",
     "target": "all_allies",
     "amount": 12
    },
    {
     "action": "buff",
     "target": "all_allies",
     "mods": {
      "cc": 2,
      "ad": 2,
      "he": 2
     },
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: heal→all_allies, buff→all_allies."
 },
 {
  "card_id": "sol",
  "elite": false,
  "ability_name": "Renacimiento",
  "ability_text": "REVIVE a un aliado caído con HP parcial.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "revive",
     "target": "dead_ally",
     "hp_pct": 0.5
    }
   ]
  },
  "note": "Revive a un aliado caído que se elige; si no hay caídos, el motor cura 15 al más herido."
 },
 {
  "card_id": "sol",
  "elite": true,
  "ability_name": "Resurrección",
  "ability_text": "Revive a un aliado a plena vida.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "revive",
     "target": "dead_ally",
     "hp_pct": 1
    }
   ]
  },
  "note": "Revive a un aliado caído que se elige; si no hay caídos, el motor cura 15 al más herido."
 },
 {
  "card_id": "man",
  "elite": false,
  "ability_name": "Reequilibrio",
  "ability_text": "Cura a todos los aliados igualando su vida.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "heal_equalize",
     "target": "all_allies"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: heal_equalize→all_allies."
 },
 {
  "card_id": "man",
  "elite": true,
  "ability_name": "Balance Perfecto",
  "ability_text": "Cura a todos al máximo del grupo.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "heal_full",
     "target": "all_allies"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: heal_full→all_allies."
 },
 {
  "card_id": "pac",
  "elite": false,
  "ability_name": "Maldición Eterna",
  "ability_text": "Golpe mágico que maldice (-stats) al objetivo.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "he",
     "stat_mult": 1.5,
     "dtype": "spell",
     "element": "arcano"
    },
    {
     "action": "debuff",
     "target": "enemy",
     "mods": {
      "cc": 4,
      "ad": 4,
      "he": 4
     },
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, debuff→enemy."
 },
 {
  "card_id": "pac",
  "elite": true,
  "ability_name": "Inmortalidad Oscura",
  "ability_text": "Golpe mágico y maldición permanente.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "he",
     "stat_mult": 1.5,
     "dtype": "spell",
     "bonus": 6,
     "element": "arcano"
    },
    {
     "action": "debuff",
     "target": "enemy",
     "mods": {
      "cc": 6,
      "ad": 6,
      "he": 6
     },
     "turns": 99
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, debuff→enemy."
 },
 {
  "card_id": "rev",
  "elite": false,
  "ability_name": "Maldición Estelar",
  "ability_text": "Golpe mágico y -3 a todos los stats del objetivo.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "he",
     "stat_mult": 0.6,
     "dtype": "spell",
     "element": "arcano"
    },
    {
     "action": "debuff",
     "target": "enemy",
     "mods": {
      "cc": 3,
      "ad": 3,
      "he": 3
     },
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, debuff→enemy."
 },
 {
  "card_id": "rev",
  "elite": true,
  "ability_name": "Condena Eterna",
  "ability_text": "Maldición permanente y daño mágico.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "enemy",
     "scale_stat": "he",
     "stat_mult": 0.6,
     "dtype": "spell",
     "element": "arcano"
    },
    {
     "action": "debuff",
     "target": "enemy",
     "mods": {
      "cc": 8,
      "ad": 8,
      "he": 8
     },
     "turns": 99
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: damage→enemy, debuff→enemy."
 },
 {
  "card_id": "doc",
  "elite": false,
  "ability_name": "Inyección",
  "ability_text": "Cura 18 HP a un aliado.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "heal",
     "target": "ally",
     "amount": 18
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: heal→ally."
 },
 {
  "card_id": "doc",
  "elite": true,
  "ability_name": "Cirugía Élite",
  "ability_text": "Cura 28 HP y +3 CC al aliado.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "heal",
     "target": "ally",
     "amount": 28
    },
    {
     "action": "buff",
     "target": "ally",
     "mods": {
      "cc": 3
     },
     "turns": 99
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: heal→ally, buff→ally."
 },
 {
  "card_id": "zer",
  "elite": false,
  "ability_name": "Juicio Divino",
  "ability_text": "Daño mágico a TODOS los rivales.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "he",
     "stat_mult": 0.9,
     "dtype": "spell",
     "element": "rayo"
    }
   ]
  },
  "note": "Élite: solo daño aumentado (el texto no menciona silencio)."
 },
 {
  "card_id": "zer",
  "elite": true,
  "ability_name": "Divinidad",
  "ability_text": "Daño mágico devastador a todos.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "damage",
     "target": "all_enemies",
     "scale_stat": "he",
     "stat_mult": 0.9,
     "dtype": "spell",
     "bonus": 5,
     "element": "rayo"
    }
   ]
  },
  "note": "Élite: solo daño aumentado (el texto no menciona silencio)."
 },
 {
  "card_id": "aje",
  "elite": false,
  "ability_name": "Jaque Mate",
  "ability_text": "Anticipa al rival: pierde su próximo turno.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "skip_turn",
     "target": "enemy",
     "turns": 1
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: skip_turn→enemy."
 },
 {
  "card_id": "aje",
  "elite": true,
  "ability_name": "Mate Pastor",
  "ability_text": "El rival pierde 2 turnos.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "skip_turn",
     "target": "enemy",
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: skip_turn→enemy."
 },
 {
  "card_id": "pol",
  "elite": false,
  "ability_name": "Promesa Vacía",
  "ability_text": "Engaña a todos los rivales: -4 a todos sus stats.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "debuff",
     "target": "all_enemies",
     "mods": {
      "cc": 4,
      "ad": 4,
      "he": 4
     },
     "turns": 1
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: debuff→all_enemies."
 },
 {
  "card_id": "pol",
  "elite": true,
  "ability_name": "Pacto de Sombras",
  "ability_text": "'-6 a todos los rivales y se cura 10.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "debuff",
     "target": "all_enemies",
     "mods": {
      "cc": 6,
      "ad": 6,
      "he": 6
     },
     "turns": 2
    },
    {
     "action": "heal",
     "target": "self",
     "amount": 10
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: debuff→all_enemies, heal→self."
 },
 {
  "card_id": "tk_buf",
  "elite": false,
  "ability_name": "Petardeo",
  "ability_text": "Hace \"brum brum\" muy fuerte. No pasa nada en absoluto.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "noop",
     "target": "self"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: noop→self."
 },
 {
  "card_id": "tk_buf",
  "elite": true,
  "ability_name": "Gases Tóxicos",
  "ability_text": "Todos los rivales se marean y sufren -4 a sus stats por el olor.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "debuff_all_stats",
     "target": "all_enemies",
     "amount": 4,
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: debuff_all_stats→all_enemies."
 },
 {
  "card_id": "tk_lav",
  "elite": false,
  "ability_name": "Centrifugado",
  "ability_text": "Pone un programa de 90 minutos. Tarda un rato y no hace nada.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "noop",
     "target": "self"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: noop→self."
 },
 {
  "card_id": "tk_lav",
  "elite": true,
  "ability_name": "Programa Delicado",
  "ability_text": "Lava el cerebro del rival: aturdimiento total por 2 turnos.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "paralyze",
     "target": "enemy",
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: paralyze→enemy."
 },
 {
  "card_id": "tk_ban",
  "elite": false,
  "ability_name": "Paella Imposible",
  "ability_text": "Sirve una paella imposible a un rival y lo deja Confuso durante 2 turnos.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "confuse",
     "target": "enemy",
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: confuse→enemy."
 },
 {
  "card_id": "tk_ban",
  "elite": true,
  "ability_name": "Paella del Caos",
  "ability_text": "Deja Confuso a un rival durante 3 turnos.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "confuse",
     "target": "enemy",
     "turns": 3
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: confuse→enemy."
 },
 {
  "card_id": "tk_caj",
  "elite": false,
  "ability_name": "Guardar un Zapato",
  "ability_text": "Guarda un zapato dentro. Nadie sabe para qué.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "noop",
     "target": "self"
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: noop→self."
 },
 {
  "card_id": "tk_caj",
  "elite": true,
  "ability_name": "Zapatillazo",
  "ability_text": "Lanza un zapato viejo radiactivo. Ignora defensa y humilla al rival.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "true_damage",
     "target": "enemy",
     "stat_mult": 1
    },
    {
     "action": "debuff_all_stats",
     "target": "enemy",
     "amount": 2,
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: true_damage→enemy, debuff_all_stats→enemy."
 },
 {
  "card_id": "tk_pez",
  "elite": false,
  "ability_name": "Licor de Tres Ojos",
  "ability_text": "Emborracha a un rival durante 2 turnos: -3 a sus atributos y 3 de daño.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "drunk",
     "target": "enemy",
     "amount": 3,
     "turns": 2
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: drunk→enemy."
 },
 {
  "card_id": "tk_pez",
  "elite": true,
  "ability_name": "Licor Abisal",
  "ability_text": "Emborracha a un rival durante 3 turnos: -3 a sus atributos y 3 de daño.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "drunk",
     "target": "enemy",
     "amount": 3,
     "turns": 3
    }
   ]
  },
  "note": "Fiel al texto de la carta. Pasos: drunk→enemy."
 },
 {
  "card_id": "Faseve",
  "elite": false,
  "ability_name": "Compresor Roto",
  "ability_text": "Desactiva la habilidad del rival o Fase Elite del rival que elijas.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "roll",
     "target": "enemy",
     "sides": 2,
     "label": "Compresor Roto",
     "note": "1 sin habilidad · 2 sin fase élite",
     "outcomes": {
      "1": [
       {
        "action": "disable_ability",
        "target": "enemy"
       }
      ],
      "2": [
       {
        "action": "disable_elite",
        "target": "enemy"
       }
      ]
     }
    }
   ]
  },
  "note": "Normal: dado de 2 caras sobre el rival elegido. 1 = anula su habilidad; 2 = nunca tendrá fase élite (al caer, muere)."
 },
 {
  "card_id": "juni",
  "elite": false,
  "ability_name": "Refracción Arcana",
  "ability_text": "Cuando recibe daño, refracta la mitad de ese daño como daño mágico al rival que la ha herido.",
  "status": "implemented",
  "effect_type": "dedicated_reflect_damage",
  "params": {},
  "note": "Pasiva: al recibir daño, refracta la mitad como daño mágico al atacante. Programada en el motor (parche de Juniana)."
 },
 {
  "card_id": "juni",
  "elite": true,
  "ability_name": "Supernova Espejada",
  "ability_text": "Cuando recibe daño, refracta la mitad de ese daño como daño mágico a cada uno de los rivales vivos.",
  "status": "implemented",
  "effect_type": "dedicated_reflect_damage",
  "params": {},
  "note": "Pasiva: refracta la mitad del daño recibido a cada rival vivo. Programada en el motor."
 },
 {
  "card_id": "dojpur",
  "elite": false,
  "ability_name": "Pequeña amenaza",
  "ability_text": "La próxima vez que reciba daño lanza un dado de dos caras, si sale 1, mata directamente a un héroe del rival (en la fase que esté) y si sale 2 no hace nada.",
  "status": "implemented",
  "effect_type": "dedicated_doji_threat",
  "params": {},
  "note": "Pasiva con dado de dos caras: al recibir daño, con un 1 mata a un héroe rival. Programada en el motor."
 },
 {
  "card_id": "dojpur",
  "elite": true,
  "ability_name": "Gran Amenaza",
  "ability_text": "Al morir resucita a un héroe aliado que esté muerto, le cura toda la vida y le rearma la armadura y el arma que llevaba en el momento de su muerte.",
  "status": "implemented",
  "effect_type": "dedicated_doji_resurrect",
  "params": {},
  "note": "Pasiva: al morir resucita a un aliado caído con vida y equipo. Programada en el motor."
 },
 {
  "card_id": "killerducks",
  "elite": false,
  "ability_name": "Cuac-osmia",
  "ability_text": "Invoca 1 token de Patito de Goma con 1 de vida que bloquea ataques enemigos durante 1 turno.",
  "status": "implemented",
  "effect_type": "dedicated_duck_summon",
  "params": {},
  "note": "Invoca 1 Patito de Goma (1 de vida). Programada en el motor."
 },
 {
  "card_id": "killerducks",
  "elite": true,
  "ability_name": "Estampida de Patos",
  "ability_text": "Invoca 2 tokens de Patito de Goma con 2 de vida; si un enemigo ataca a un patito, recibe 3 de daño directo.",
  "status": "implemented",
  "effect_type": "dedicated_duck_summon",
  "params": {},
  "note": "Invoca 2 Patitos de Goma (2 de vida) que devuelven 3 de daño. Programada en el motor."
 },
 {
  "card_id": "daidoji_esva",
  "elite": false,
  "ability_name": "Filo Espectral",
  "ability_text": "Para el resto de la batalla, cuando esta unidad ataca, inflige 5 puntos de daño adicional por cada otro guerrero vivo en tu campo.",
  "status": "implemented",
  "effect_type": "dedicated_daidoji_aura",
  "params": {},
  "note": "Pasiva: +5 de daño por cada otro guerrero vivo. Programada en el motor."
 },
 {
  "card_id": "daidoji_esva",
  "elite": true,
  "ability_name": "Dios de la Grulla",
  "ability_text": "Invoca a una Grulla",
  "status": "implemented",
  "effect_type": "dedicated_crane_summon",
  "params": {},
  "note": "Invoca a una Grulla. Programada en el motor."
 },
 {
  "card_id": "tk_grulla",
  "elite": false,
  "ability_name": "Círculo de Protección",
  "ability_text": "Mientras la Grulla siga viva, cura 5 puntos de vida por turno a todos los aliados.",
  "status": "implemented",
  "effect_type": "dedicated_crane_heal_aura",
  "params": {},
  "note": "Aura: cura 5 por turno a todos los aliados mientras viva. Programada en el motor."
 },
 {
  "card_id": "tk_grulla",
  "elite": true,
  "ability_name": "Círculo Divino",
  "ability_text": "Mientras la Grulla siga viva, cura 7 puntos de vida por turno a todos los aliados.",
  "status": "implemented",
  "effect_type": "dedicated_crane_heal_aura",
  "params": {},
  "note": "Aura: cura 7 por turno a todos los aliados mientras viva. Programada en el motor."
 },
 {
  "card_id": "chuchinjo_tokatus",
  "elite": false,
  "ability_name": "Llamada del Unicornio",
  "ability_text": "Pierde 15 puntos de vida e invoca un Unicornio Kamikaze (caballería) .",
  "status": "implemented",
  "effect_type": "dedicated_epic_summon",
  "params": {},
  "note": "Pierde 15 de vida e invoca un Unicornio Kamikaze. Programada en el motor."
 },
 {
  "card_id": "chuchinjo_tokatus",
  "elite": true,
  "ability_name": "Llamada del Pegaso",
  "ability_text": "Pierde 20 puntos de vida e invoca un Pegaso (caballería) .",
  "status": "implemented",
  "effect_type": "dedicated_epic_summon",
  "params": {},
  "note": "Pierde 20 de vida e invoca un Pegaso. Programada en el motor."
 },
 {
  "card_id": "tk_unicornio",
  "elite": false,
  "ability_name": "Kamikaze",
  "ability_text": "Se inmola: inflige 20 de daño a un rival atravesando su armadura y se sacrifica.",
  "status": "implemented",
  "effect_type": "dedicated_kamikaze",
  "params": {},
  "note": "Se inmola: 20 de daño atravesando armadura. Programada en el motor."
 },
 {
  "card_id": "tk_unicornio",
  "elite": true,
  "ability_name": "Kamikaze",
  "ability_text": "Se inmola: inflige 20 de daño a un rival atravesando su armadura y se sacrifica.",
  "status": "implemented",
  "effect_type": "dedicated_kamikaze",
  "params": {},
  "note": "Se inmola: 20 de daño atravesando armadura. Programada en el motor."
 },
 {
  "card_id": "tk_pegaso",
  "elite": false,
  "ability_name": "Tormenta de Rayos",
  "ability_text": "Pasa a ser el más rápido de todos los héroes y lanza un rayo de 5 de daño, que atraviesa armaduras, a todos los héroes rivales.",
  "status": "implemented",
  "effect_type": "dedicated_pegasus",
  "params": {},
  "note": "El más rápido y rayo de 5 que atraviesa armaduras a todos. Programada en el motor."
 },
 {
  "card_id": "tk_pegaso",
  "elite": true,
  "ability_name": "Tormenta de Rayos",
  "ability_text": "Pasa a ser el más rápido de todos los héroes y lanza un rayo de 10 de daño, que atraviesa armaduras, a todos los héroes rivales, curándose 5.",
  "status": "implemented",
  "effect_type": "dedicated_pegasus",
  "params": {},
  "note": "El más rápido y rayo de 10 a todos, curándose 5. Programada en el motor."
 },
 {
  "card_id": "tk_patito_goma",
  "elite": true,
  "ability_name": "Doble Metralleta Láser",
  "ability_text": "El patito de goma despliega dos metralletas láser y desata una ráfaga demoledora sobre todos los rivales.",
  "status": "implemented",
  "effect_type": "dedicated_duck_burst",
  "params": {},
  "note": "Ráfaga de metralletas láser sobre todos los rivales. Programada en el motor."
 },
 {
  "card_id": "rol",
  "elite": false,
  "ability_name": "Tirada Crítica",
  "ability_text": "Lanza un conjuro aleatorio de gran potencia.",
  "status": "implemented",
  "effect_type": "dedicated_random_spell",
  "params": {},
  "note": "Conjuro aleatorio de gran potencia (dado). Programada en el motor."
 },
 {
  "card_id": "rol",
  "elite": true,
  "ability_name": "Dado Cargado",
  "ability_text": "Conjuro aleatorio crítico garantizado.",
  "status": "implemented",
  "effect_type": "dedicated_random_spell",
  "params": {},
  "note": "Conjuro aleatorio crítico garantizado (dado). Programada en el motor."
 },
 {
  "card_id": "caoffe",
  "elite": false,
  "ability_name": "Colapso Mental",
  "ability_text": "Golpe mágico brutal a un objetivo. Y le sirve un cortado.",
  "status": "implemented",
  "effect_type": "dedicated_coffetath",
  "params": {},
  "note": "Colapso mental (1,8 x HE) y un cortado. Lleva efectos visuales propios; programada en el motor."
 },
 {
  "card_id": "caoffe",
  "elite": true,
  "ability_name": "Vacío Mental",
  "ability_text": "Golpe mágico que bloquea la mano rival. Y le sirve un café con leche,",
  "status": "implemented",
  "effect_type": "dedicated_coffetath",
  "params": {},
  "note": "Golpe mágico (1,5 x HE + 6) que bloquea la mano del rival 2 turnos, con su café con leche. Programada en el motor."
 },
 {
  "card_id": "Faseve",
  "elite": true,
  "ability_name": "Monedero Roto",
  "ability_text": "Reduce los stats de un rival a -15 de forma azarosa ",
  "status": "implemented",
  "effect_type": "dedicated_faseve_elite",
  "params": {},
  "note": "Reduce los stats de un rival en 15. Programada en el motor."
 },
 {
  "card_id": "motoma",
  "elite": true,
  "ability_name": "Tormento Dragonil",
  "ability_text": "Con la ayuda de un Dragón del lego que ilumina el campo de batalla. Quita el arma a un héroe enemigo aleatorio de los que queden vivos y desaparece.",
  "status": "implemented",
  "effect_type": "custom_steps",
  "params": {
   "steps": [
    {
     "action": "fx",
     "target": "self",
     "element": "luz"
    },
    {
     "action": "disarm",
     "target": "random_enemy"
    }
   ]
  },
  "note": "Dragón de lego de 3 cabezas: ILUMINA el campo de batalla con luz blanca-amarilla (1s) y quita TODAS las armas (cuerpo a cuerpo y a distancia) a UN héroe rival vivo ELEGIDO AL AZAR, enviándolas a su pila de descartes."
 },
 {
  "card_id": "tk_patito_goma",
  "elite": false,
  "ability_name": "Picotazo",
  "ability_text": "Un pequeño ataque a distancia. Al recibir un golpe, bloquea el daño para sus aliados.",
  "status": "implemented",
  "effect_type": "dedicated_duck_block",
  "params": {
   "damage": 2,
   "damage_type": "ranged",
   "passive_flag": "_bfDuckBlock",
   "passive_label": "Picotazo",
   "block_allies": true
  },
  "note": "Implementado en duckAbilityPatch.js: hace 2 de daño a distancia al objetivo elegido y marca _bfDuckBlock=true para activar el bloqueo pasivo (el motor desvía los golpes al patito mientras viva). El marcador pasivo 'Picotazo' se muestra en el retrato y en el panel de acciones."
 }
];
