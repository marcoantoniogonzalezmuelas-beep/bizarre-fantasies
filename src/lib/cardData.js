// All 103 cards from Bizarre Fantasies Base Set (sin arte por ahora)
export const CLAN_COLORS = {
  "Guerreros": "#cc3333",
  "Druidas": "#33aa44",
  "No-muertos": "#7a2a8a",
  "Vaqueros": "#C9A227",
  "Elfos": "#33aa66",
  "Magos": "#6644cc",
  "Épicas": "#cc88ff",
  "Cotidianos": "#e0498b"
};

export const CLAN_SYMBOLS = {
  "Guerreros": "⚔️",
  "Druidas": "🌿",
  "No-muertos": "💀",
  "Vaqueros": "🤠",
  "Elfos": "🏹",
  "Magos": "🔮",
  "Épicas": "✨",
  "Cotidianos": "🎮"
};

export const HEROES = [
  { id:"kru", num:1, name:"Krunder", title:"El Indomable", clan:"Guerreros", type:"CC", cost:22, cc:22, ad:6, he:2, hp:44, eCc:28, eAd:9, eHe:4, eHp:58, ability:"Torbellino", abilityTxt:"Golpea a TODOS los rivales en cuerpo a cuerpo.", eAbility:"Torbellino Supremo", eTxt:"Golpea a todos +5 de daño, sin penalización." },
  { id:"bos", num:2, name:"Boss", title:"Señor de la Batalla", clan:"Guerreros", type:"CC", cost:24, cc:24, ad:5, he:1, hp:46, eCc:30, eAd:8, eHe:3, eHp:60, ability:"Intimidación", abilityTxt:"Todos los rivales -3 a sus stats durante 1 turno.", eAbility:"Terror Absoluto", eTxt:"Todos los rivales -5 a sus stats durante 2 turnos." },
  { id:"nar", num:3, name:"Narbon", title:"La Tormenta de Hierro", clan:"Guerreros", type:"CC", cost:19, cc:20, ad:8, he:3, hp:36, eCc:26, eAd:11, eHe:5, eHp:48, ability:"Golpe Brutal", abilityTxt:"Gran golpe que además destruye el arma/armadura del objetivo.", eAbility:"Destrucción Total", eTxt:"Golpe demoledor que destruye equipo y rompe escudos." },
  { id:"hil", num:4, name:"Hildra", title:"La Berserker", clan:"Guerreros", type:"CC", cost:16, cc:21, ad:4, he:2, hp:32, eCc:27, eAd:6, eHe:3, eHp:44, ability:"Furia Ciega", abilityTxt:"Entra en furia: +6 CC y +4 velocidad este combate.", eAbility:"Berserker Suprema", eTxt:"+9 CC, +6 velocidad y robo de vida en CC." },
  { id:"tor", num:5, name:"Torax", title:"Escudo Viviente", clan:"Guerreros", type:"CC", cost:17, cc:16, ad:5, he:2, hp:50, eCc:20, eAd:8, eHe:4, eHp:64, ability:"Muro", abilityTxt:"Otorga un escudo de 14 a un aliado.", eAbility:"Bastión Eterno", eTxt:"Escudo de 22 a un aliado y +3 CC propio." },
  { id:"vor", num:6, name:"Vorn", title:"El Ejecutor", clan:"Guerreros", type:"CC", cost:20, cc:19, ad:7, he:2, hp:34, eCc:24, eAd:10, eHe:4, eHp:46, ability:"Decapitación", abilityTxt:"Ejecuta al instante a un rival por debajo de 8 HP.", eAbility:"Ejecución Masiva", eTxt:"Ejecuta rivales por debajo de 14 HP." },
  { id:"bra", num:7, name:"Bramblok", title:"El Guardabosques", clan:"Druidas", type:"CC", cost:18, cc:18, ad:9, he:4, hp:34, eCc:23, eAd:12, eHe:6, eHp:46, ability:"Enredadera", abilityTxt:"-6 a todos los stats de un rival durante 2 turnos.", eAbility:"Bosque Eterno", eTxt:"-8 stats permanente a un rival." },
  { id:"gna", num:8, name:"Gnarr", title:"El Ent Andante", clan:"Druidas", type:"CC", cost:20, cc:17, ad:5, he:4, hp:48, eCc:22, eAd:8, eHe:6, eHp:62, ability:"Raíces Ancestrales", abilityTxt:"Se cura 12 HP.", eAbility:"Árbol Eterno", eTxt:"Se cura 18 HP y +2 a aliados." },
  { id:"vra", num:9, name:"Vragnar", title:"El Rey Fantasma", clan:"No-muertos", type:"CC", cost:20, cc:20, ad:5, he:3, hp:38, eCc:26, eAd:8, eHe:5, eHp:50, ability:"Atravesar", abilityTxt:"Golpe CC que IGNORA armadura y escudos.", eAbility:"Forma Espectral", eTxt:"Golpe que ignora todo y reduce HP máx del rival." },
  { id:"mor", num:10, name:"Morthex", title:"El Devorador", clan:"No-muertos", type:"CC", cost:18, cc:18, ad:4, he:4, hp:34, eCc:23, eAd:6, eHe:6, eHp:46, ability:"Absorción Oscura", abilityTxt:"Golpe que roba vida (cura la mitad del daño).", eAbility:"Festín de Almas", eTxt:"Golpe que roba toda la vida infligida y +3 CC." },
  { id:"buc", num:11, name:"Buck Ironclad", title:"Mariscal de Acero", clan:"Vaqueros", type:"CC", cost:20, cc:20, ad:6, he:2, hp:38, eCc:26, eAd:9, eHe:4, eHp:50, ability:"Aplastamiento", abilityTxt:"Golpe que hace DOBLE daño si el rival está por debajo del 40% HP.", eAbility:"Exterminio", eTxt:"Doble daño desde el 60% HP del rival." },
  { id:"com", num:12, name:"La Comadreja", title:"Asesina de la Nebulosa", clan:"Vaqueros", type:"CC", cost:13, cc:18, ad:8, he:2, hp:24, eCc:24, eAd:11, eHe:4, eHp:34, ability:"Sigilo Cuántico", abilityTxt:"Se vuelve evasiva: esquiva el próximo ataque recibido.", eAbility:"Sombra Cuántica", eTxt:"Esquiva 2 ataques y +5 al siguiente golpe." },
  { id:"kre", num:13, name:"Krunder Mec.", title:"La Bestia Mecánica", clan:"Épicas", type:"CC", cost:45, cc:24, ad:7, he:3, hp:52, eCc:30, eAd:10, eHe:5, eHp:66, ability:"Devastación", abilityTxt:"Golpe CC imposible de bloquear o reducir.", eAbility:"Aniquilación", eTxt:"Golpe imbloqueable que daña a dos objetivos." },
  { id:"hev", num:14, name:"El Heavy", title:"Dios del Metal", clan:"Cotidianos", type:"CC", cost:18, cc:21, ad:6, he:2, hp:40, eCc:27, eAd:9, eHe:4, eHp:54, ability:"Headbang", abilityTxt:"Onda sónica: golpe CC a todos los rivales.", eAbility:"Wall of Death", eTxt:"Golpe a todos +5 y aturde 1 turno." },
  { id:"pij", num:15, name:"El Pijo", title:"Heredero Universal", clan:"Cotidianos", type:"CC", cost:16, cc:18, ad:7, he:3, hp:36, eCc:24, eAd:10, eHe:5, eHp:48, ability:"Postureo", abilityTxt:"Humilla al rival: -4 a todos sus stats 2 turnos.", eAbility:"Élite Total", eTxt:"-6 a todos los rivales y +3 CC propio." },
  { id:"pat", num:16, name:"Patrón", title:"El Arquetipo", clan:"Elfos", type:"AD", cost:20, cc:5, ad:20, he:6, hp:24, eCc:8, eAd:26, eHe:8, eHp:34, ability:"Flecha Guiada", abilityTxt:"Disparo que ignora media defensa del objetivo.", eAbility:"Flecha Infalible", eTxt:"Disparo que ignora toda la defensa y atraviesa." },
  { id:"syl", num:17, name:"Sylvara", title:"Dama del Bosque", clan:"Elfos", type:"AD", cost:18, cc:4, ad:18, he:7, hp:22, eCc:6, eAd:24, eHe:9, eHp:32, ability:"Lluvia de Flechas", abilityTxt:"Disparo a TODOS los rivales.", eAbility:"Tormenta de Flechas", eTxt:"Disparo a todos +daño y -2 AD a cada uno." },
  { id:"ael", num:18, name:"Aelion", title:"El Explorador", clan:"Elfos", type:"AD", cost:15, cc:5, ad:16, he:7, hp:20, eCc:7, eAd:22, eHe:9, eHp:30, ability:"Marca del Cazador", abilityTxt:"Marca a un rival: recibe +5 de daño de cualquier fuente.", eAbility:"Marca Permanente", eTxt:"Marca persistente con +8 de daño extra." },
  { id:"zar", num:19, name:"Zarmandis", title:"Sombra del Claro", clan:"Elfos", type:"AD", cost:16, cc:6, ad:17, he:5, hp:22, eCc:8, eAd:23, eHe:7, eHp:32, ability:"Disparo Silencioso", abilityTxt:"Dispara de inmediato, no puede ser bloqueado.", eAbility:"Fantasma del Claro", eTxt:"Dispara dos veces en silencio." },
  { id:"ere", num:20, name:"Eredon", title:"El Veterano", clan:"Elfos", type:"AD", cost:18, cc:7, ad:16, he:5, hp:26, eCc:9, eAd:22, eHe:7, eHp:36, ability:"Maestría", abilityTxt:"Sin penalización por atacar fuera de su tipo este combate.", eAbility:"Maestro de Armas", eTxt:"Sin penalización y +3 a todos sus stats." },
  { id:"alf", num:21, name:"Alfredinho", title:"El Pistolero de Orión", clan:"Vaqueros", type:"AD", cost:18, cc:6, ad:17, he:4, hp:28, eCc:8, eAd:23, eHe:6, eHp:38, ability:"Doble Disparo", abilityTxt:"Dispara DOS veces (2º a -3 de potencia).", eAbility:"Disparo Perfecto", eTxt:"Ambos disparos a plena potencia." },
  { id:"dix", num:22, name:"Dixie Plasma", title:"Francotiradora Estelar", clan:"Vaqueros", type:"AD", cost:14, cc:4, ad:19, he:4, hp:22, eCc:6, eAd:25, eHe:6, eHp:32, ability:"Punto Débil", abilityTxt:"Disparo que ignora la armadura defensiva del objetivo.", eAbility:"Punto Vital", eTxt:"Disparo que ignora equipo y pega al 50% de vida." },
  { id:"ska", num:23, name:"Skarla", title:"La Banshee", clan:"No-muertos", type:"AD", cost:16, cc:4, ad:15, he:7, hp:22, eCc:6, eAd:20, eHe:9, eHp:32, ability:"Grito del Vacío", abilityTxt:"Todos los rivales -4 a todos sus stats 1 turno.", eAbility:"Alarido Eterno", eTxt:"Penalización -6 hasta el próximo turno rival." },
  { id:"syx", num:24, name:"Sylvex", title:"La Quimera Digital", clan:"Épicas", type:"AD", cost:43, cc:6, ad:19, he:7, hp:28, eCc:8, eAd:25, eHe:9, eHp:40, ability:"Mutación", abilityTxt:"Copia y mejora: +4 a todos sus stats este combate.", eAbility:"Evolución Suprema", eTxt:"+6 a todos sus stats y cura 10." },
  { id:"gor", num:25, name:"Gorvak", title:"El Leviatán Estelar", clan:"Épicas", type:"AD", cost:44, cc:7, ad:20, he:5, hp:38, eCc:9, eAd:26, eHe:7, eHp:52, ability:"Onda de Impacto", abilityTxt:"Disparo a todos los rivales.", eAbility:"Devastación Orbital", eTxt:"Disparo a todos con daño aumentado." },
  { id:"fut", num:26, name:"El Futbolista", title:"La Estrella", clan:"Cotidianos", type:"AD", cost:18, cc:6, ad:18, he:4, hp:26, eCc:8, eAd:24, eHe:6, eHp:36, ability:"Tiro Libre", abilityTxt:"Disparo cargado: gran daño a un objetivo.", eAbility:"Chilena Estelar", eTxt:"Disparo demoledor que ignora defensa." },
  { id:"gam", num:27, name:"El Gamer", title:"Pro Player", clan:"Cotidianos", type:"AD", cost:16, cc:4, ad:19, he:5, hp:22, eCc:6, eAd:25, eHe:7, eHp:32, ability:"Headshot", abilityTxt:"Disparo crítico de precisión letal.", eAbility:"Aimbot", eTxt:"Disparo crítico que ignora todo el equipo." },
  { id:"ret", num:28, name:"Retropoeta", title:"El Oráculo Digital", clan:"Magos", type:"HE", cost:21, cc:3, ad:5, he:22, hp:20, eCc:5, eAd:7, eHe:28, eHp:28, ability:"Paradoja Arcana", abilityTxt:"Golpe mágico potente a un objetivo.", eAbility:"Bucle Temporal", eTxt:"Golpe mágico que se repite en dos rivales." },
  { id:"mal", num:29, name:"Malachar", title:"Archimago del Vacío", clan:"Magos", type:"HE", cost:23, cc:2, ad:4, he:24, hp:18, eCc:4, eAd:6, eHe:30, eHp:26, ability:"Tormenta Mágica", abilityTxt:"Daño mágico a TODOS los rivales.", eAbility:"Apocalipsis", eTxt:"Daño mágico masivo a todos y silencio 1 turno." },
  { id:"ser", num:30, name:"Serafis", title:"Tejedor de Realidades", clan:"Magos", type:"HE", cost:19, cc:3, ad:5, he:20, hp:19, eCc:5, eAd:7, eHe:26, eHp:27, ability:"Inversión", abilityTxt:"Golpe mágico que además intercambia CC y HE del rival.", eAbility:"Inversión Total", eTxt:"Golpe mágico e invierte stats de dos rivales." },
  { id:"bat", num:31, name:"Batu", title:"El Chamán Estelar", clan:"Magos", type:"HE", cost:17, cc:5, ad:5, he:18, hp:24, eCc:7, eAd:7, eHe:24, eHp:34, ability:"Espíritu Guardián", abilityTxt:"Escudo de 14 a un aliado.", eAbility:"Escudo Ancestral", eTxt:"Escudo de 22 que se regenera." },
  { id:"nix", num:32, name:"Nixara", title:"La Nigromante", clan:"Magos", type:"HE", cost:18, cc:3, ad:5, he:19, hp:17, eCc:5, eAd:7, eHe:25, eHp:25, ability:"Drenaje Vital", abilityTxt:"Roba HP a un rival y cura a un aliado.", eAbility:"Drenaje Masivo", eTxt:"Roba más HP y lo reparte entre aliados." },
  { id:"vex", num:33, name:"Vexal", title:"El Disruptor", clan:"Magos", type:"HE", cost:15, cc:3, ad:6, he:17, hp:18, eCc:5, eAd:8, eHe:23, eHp:26, ability:"Interferencia", abilityTxt:"Anula la habilidad especial de un rival y hace daño.", eAbility:"Silencio Total", eTxt:"Anula habilidad y golpe mágico fuerte." },
  { id:"chi", num:34, name:"Chivo", title:"El Pastor del Cosmos", clan:"Druidas", type:"HE", cost:16, cc:6, ad:6, he:16, hp:28, eCc:8, eAd:8, eHe:22, eHp:38, ability:"Balada Curativa", abilityTxt:"Cura a TODOS los aliados.", eAbility:"Sinfonía Cósmica", eTxt:"Cura a todos +2 a sus stats." },
  { id:"sol", num:35, name:"Solenne", title:"La Sacerdotisa", clan:"Druidas", type:"HE", cost:17, cc:4, ad:5, he:17, hp:26, eCc:6, eAd:7, eHe:23, eHp:36, ability:"Renacimiento", abilityTxt:"REVIVE a un aliado caído con HP parcial.", eAbility:"Resurrección", eTxt:"Revive a un aliado a plena vida." },
  { id:"man", num:36, name:"Mantenimiento", title:"El Equilibrador", clan:"Druidas", type:"HE", cost:14, cc:6, ad:7, he:15, hp:24, eCc:8, eAd:9, eHe:21, eHp:34, ability:"Reequilibrio", abilityTxt:"Cura a todos los aliados igualando su vida.", eAbility:"Balance Perfecto", eTxt:"Cura a todos al máximo del grupo." },
  { id:"pac", num:37, name:"Pacopiton", title:"El Eterno Liche", clan:"No-muertos", type:"HE", cost:22, cc:4, ad:5, he:20, hp:22, eCc:6, eAd:7, eHe:26, eHp:30, ability:"Maldición Eterna", abilityTxt:"Golpe mágico que maldice (-stats) al objetivo.", eAbility:"Inmortalidad Oscura", eTxt:"Golpe mágico y maldición permanente." },
  { id:"hex", num:38, name:"Hexara", title:"La Bruja de Hueso", clan:"No-muertos", type:"HE", cost:17, cc:3, ad:5, he:18, hp:19, eCc:5, eAd:7, eHe:24, eHp:27, ability:"Marioneta", abilityTxt:"Controla a un rival: pierde su próximo turno.", eAbility:"Control Total", eTxt:"El rival pierde 2 turnos." },
  { id:"rev", num:39, name:"Reverendo Hex", title:"Predicador del Vacío", clan:"Vaqueros", type:"HE", cost:16, cc:4, ad:5, he:16, hp:22, eCc:6, eAd:7, eHe:22, eHp:30, ability:"Maldición Estelar", abilityTxt:"Golpe mágico y -3 a todos los stats del objetivo.", eAbility:"Condena Eterna", eTxt:"Maldición permanente y daño mágico." },
  { id:"doc", num:40, name:"Doc Radiante", title:"Cirujano de Combate", clan:"Vaqueros", type:"HE", cost:15, cc:6, ad:6, he:15, hp:26, eCc:8, eAd:8, eHe:21, eHp:36, ability:"Inyección", abilityTxt:"Cura 18 HP a un aliado.", eAbility:"Cirugía Élite", eTxt:"Cura 28 HP y +3 CC al aliado." },
  { id:"zer", num:41, name:"Zarmandis", title:"El Dios Fragmentado", clan:"Épicas", type:"HE", cost:47, cc:5, ad:7, he:22, hp:30, eCc:7, eAd:9, eHe:28, eHp:42, ability:"Juicio Divino", abilityTxt:"Daño mágico a TODOS los rivales.", eAbility:"Divinidad", eTxt:"Daño mágico devastador a todos." },
  { id:"xer", num:42, name:"Xerath", title:"La Singularidad", clan:"Épicas", type:"HE", cost:46, cc:4, ad:6, he:26, hp:24, eCc:6, eAd:8, eHe:32, eHp:34, ability:"Colapso Mental", abilityTxt:"Golpe mágico brutal a un objetivo.", eAbility:"Vacío Mental", eTxt:"Golpe mágico que bloquea la mano rival." },
  { id:"aje", num:43, name:"El Ajedrecista", title:"Gran Maestro", clan:"Cotidianos", type:"HE", cost:17, cc:3, ad:5, he:19, hp:22, eCc:5, eAd:7, eHe:25, eHp:32, ability:"Jaque Mate", abilityTxt:"Anticipa al rival: pierde su próximo turno.", eAbility:"Mate Pastor", eTxt:"El rival pierde 2 turnos." },
  { id:"rol", num:44, name:"El Rolero", title:"Master del Calabozo", clan:"Cotidianos", type:"HE", cost:16, cc:4, ad:5, he:20, hp:22, eCc:6, eAd:7, eHe:26, eHp:30, ability:"Tirada Crítica", abilityTxt:"Lanza un conjuro aleatorio de gran potencia.", eAbility:"Dado Cargado", eTxt:"Conjuro aleatorio crítico garantizado." },
  { id:"pol", num:45, name:"El Político", title:"El Populista", clan:"Cotidianos", type:"HE", cost:18, cc:5, ad:6, he:18, hp:30, eCc:7, eAd:8, eHe:24, eHp:42, ability:"Promesa Vacía", abilityTxt:"Engaña a todos los rivales: -4 a todos sus stats.", eAbility:"Pacto de Sombras", eTxt:"-6 a todos los rivales y se cura 10." },
];

export const SPELLS = [
  { id:"sp_fire1", num:46, name:"Bola de Fuego", element:"fuego", mana:8, cost:10, txt:"Daño de FUEGO a un rival. Escala con tu nivel de Magia." },
  { id:"sp_fire2", num:47, name:"Tormenta Ígnea", element:"fuego", mana:16, cost:16, txt:"Daño de FUEGO a TODOS los rivales. Escala con tu nivel de Magia." },
  { id:"sp_ice1", num:48, name:"Lanza de Hielo", element:"hielo", mana:9, cost:11, txt:"Daño de HIELO a un rival y lo ralentiza. Escala con tu nivel de Magia." },
  { id:"sp_ray1", num:49, name:"Rayo en Cadena", element:"rayo", mana:12, cost:12, txt:"Daño de RAYO a 2 rivales. Escala con tu nivel de Magia." },
  { id:"sp_agua1", num:50, name:"Maremoto", element:"agua", mana:15, cost:14, txt:"Daño de AGUA a TODOS los rivales. Escala con tu nivel de Magia." },
  { id:"sp_heal1", num:51, name:"Curación", element:"curacion", mana:8, cost:9, txt:"Cura HP a un aliado. Escala con tu nivel de Magia." },
  { id:"sp_heal2", num:52, name:"Curación Divina", element:"curacion", mana:15, cost:15, txt:"Cura a TODOS los aliados. Escala con tu nivel de Magia." },
  { id:"sp_prot1", num:53, name:"Escudo de Maná", element:"proteccion", mana:8, cost:9, txt:"Escudo que absorbe daño en un aliado. Escala con tu nivel de Magia." },
  { id:"sp_ward", num:54, name:"Barrera Arcana", element:"arcano", mana:12, cost:11, txt:"Protege a un aliado del daño de hechizos durante 2 turnos." },
  { id:"sp_sleep", num:55, name:"Sueño", element:"estado", mana:10, cost:10, txt:"Duerme a un rival (pierde su turno). Fiabilidad según tu nivel de Magia." },
  { id:"sp_para", num:56, name:"Paralización", element:"estado", mana:11, cost:11, txt:"Paraliza a un rival (pierde su turno). Fiabilidad según tu nivel de Magia." },
  { id:"sp_curse", num:57, name:"Maldición", element:"estado", mana:8, cost:8, txt:"-Stats a un rival. Escala con tu nivel de Magia." },
  { id:"sp_bless", num:58, name:"Bendición", element:"estado", mana:8, cost:8, txt:"+Stats a un aliado. Escala con tu nivel de Magia." },
];

export const MELEE_WEAPONS = [
  { id:"mw_sword", num:59, name:"Espada de Acero", cc:6, cost:7, tag:"", txt:"+6 al daño cuerpo a cuerpo. +6 CC." },
  { id:"mw_mace", num:60, name:"Maza Pesada", cc:7, cost:8, tag:"", txt:"+7 al daño cuerpo a cuerpo. +7 CC." },
  { id:"mw_axe", num:61, name:"Hacha de Guerra", cc:8, cost:9, tag:"", txt:"+8 al daño cuerpo a cuerpo. +8 CC." },
  { id:"mw_dagger", num:62, name:"Daga Veloz", cc:5, cost:7, tag:"+VELOC", txt:"+5 al daño cuerpo a cuerpo. +5 CC y +3 velocidad." },
  { id:"mw_plasma", num:63, name:"Espada Plasmática", cc:10, cost:12, tag:"MÁGICO", txt:"+10 al daño cuerpo a cuerpo. +10 CC. Mágica." },
  { id:"mw_thunder", num:64, name:"Martillo del Trueno", cc:9, cost:12, tag:"MÁGICO", txt:"+9 al daño cuerpo a cuerpo. +9 CC. Golpes mágicos imparables." },
];

export const RANGED_WEAPONS = [
  { id:"rw_sling", num:65, name:"Tirachinas", power:6, cost:4, tag:"", txt:"Arma a distancia básica. Daño = 6 × (AD/18)." },
  { id:"rw_cross", num:66, name:"Ballesta", power:10, cost:7, tag:"", txt:"Potencia 10. Daño = 10 × (AD/18)." },
  { id:"rw_pistol", num:67, name:"Pistola", power:12, cost:8, tag:"", txt:"Potencia 12. Daño = 12 × (AD/18)." },
  { id:"rw_smg", num:68, name:"Metralleta", power:7, cost:9, tag:"2DISPAROS", txt:"Potencia 7 · 2 disparos. Dispara 2 veces." },
  { id:"rw_cannon", num:69, name:"Cañón Medieval", power:16, cost:11, tag:"LENTO", txt:"Potencia 16. Daño = 16 × (AD/18). Pesado (-2 velocidad)." },
  { id:"rw_plasma", num:70, name:"Cañón de Plasma", power:20, cost:14, tag:"TOP", txt:"Potencia 20. Daño = 20 × (AD/18). La cima del arsenal a distancia." },
  { id:"rw_elfbow", num:71, name:"Arco Élfico", power:11, cost:9, tag:"PERFORA", txt:"Mágico: ignora media armadura. Daño = 11 × (AD/18)." },
  { id:"rw_photon", num:72, name:"Rifle de Fotones", power:15, cost:12, tag:"MÁGICO", txt:"Mágico: ignora toda la armadura. Daño = 15 × (AD/18)." },
];

export const ARMORS = [
  { id:"ar_leather", num:73, name:"Armadura de Cuero", hp:8, cost:7, tag:"", txt:"+8 HP. -2 al daño cuerpo a cuerpo y a distancia." },
  { id:"ar_mail", num:74, name:"Cota de Malla", hp:12, cost:9, tag:"", txt:"+12 HP. -4 c/c y a distancia, -1 hechizos." },
  { id:"ar_plate", num:75, name:"Armadura de Placas", hp:16, cost:12, tag:"", txt:"+16 HP. -6 c/c, -5 a distancia, -2 hechizos." },
  { id:"ar_arcane", num:76, name:"Manto Arcano", hp:10, cost:10, tag:"MÁGICO", txt:"+10 HP. -6 al daño de hechizos. Mágico." },
  { id:"ar_aegis", num:77, name:"Égida de Cristal", hp:12, cost:12, tag:"MÁGICO", txt:"+12 HP. -3 c/c, -4 a distancia y -4 hechizos. Mágica." },
  { id:"ar_exo", num:78, name:"Exoarmadura", hp:14, cost:13, tag:"MÁGICO", txt:"+14 HP. -3 a todo y +2 HP por turno. Mágica." },
  { id:"ar_water", num:79, name:"Armadura de Agua", hp:12, cost:12, tag:"ELEMENTAL", txt:"+12 HP. NIEGA el daño de hechizos de FUEGO. -3 al daño físico." },
  { id:"ar_thunder", num:80, name:"Armadura de Rayo", hp:12, cost:12, tag:"ELEMENTAL", txt:"+12 HP. NIEGA el daño de hechizos de AGUA. -3 al daño físico." },
  { id:"ar_ice", num:81, name:"Armadura de Hielo", hp:12, cost:12, tag:"ELEMENTAL", txt:"+12 HP. NIEGA el daño de hechizos de RAYO. -3 al daño físico." },
  { id:"ar_fire", num:82, name:"Armadura de Fuego", hp:12, cost:12, tag:"ELEMENTAL", txt:"+12 HP. NIEGA el daño de hechizos de HIELO. -3 al daño físico." },
];

export const OBJECTS = [
  { id:"ob_pot", num:83, name:"Poción de Vida", tag:"CURACIÓN", cost:6, txt:"Cura 18 HP a un aliado." },
  { id:"ob_potbig", num:84, name:"Poción Mayor", tag:"CURACIÓN", cost:10, txt:"Cura 30 HP a un aliado." },
  { id:"ob_mana", num:85, name:"Cristal de Maná", tag:"MANÁ", cost:8, txt:"Restaura 20 de maná a un aliado." },
  { id:"ob_manabig", num:86, name:"Orbe de Maná", tag:"MANÁ", cost:13, txt:"Restaura 40 de maná a un aliado." },
  { id:"ob_shield", num:87, name:"Escudo de Energía", tag:"PROTECCIÓN", cost:7, txt:"Escudo de 12 que absorbe daño en un aliado." },
  { id:"ob_cleanse", num:88, name:"Despertar", tag:"PROTECCIÓN", cost:5, txt:"Quita sueño/parálisis/maldición a un aliado." },
  { id:"ob_bomb", num:89, name:"Bomba de Plasma", tag:"DAÑO", cost:8, txt:"14 de daño directo a un rival (no escala)." },
  { id:"ob_revive", num:90, name:"Pluma Fénix", tag:"REVIVIR", cost:16, txt:"Revive a UN héroe caído con el 50% de su vida." },
  { id:"ob_phoenix", num:91, name:"Ave Fénix", tag:"SUPREMO", cost:26, txt:"Revive a TODOS tus héroes caídos. La carta cumbre." },
];

export const BONUSES = [
  { id:"ban", num:92, name:"Gran Banquero", type:"BON", txt:"+25 monedas para esta subasta." },
  { id:"cor", num:93, name:"Corredor de Bolsa", type:"BON", txt:"+20 monedas esta subasta." },
  { id:"mer", num:94, name:"Mercader Zeta", type:"BON", txt:"+15 monedas esta subasta." },
  { id:"nau", num:95, name:"Nauta Financiero", type:"BON", txt:"+18 monedas esta subasta." },
  { id:"pre", num:96, name:"La Prestamista", type:"BON", txt:"+22 monedas ahora, -8 la próxima ronda." },
  { id:"for_", num:97, name:"Patrón de Forja", type:"EQP", txt:"+20 monedas para la fase de EQUIPAMIENTO." },
  { id:"arm", num:98, name:"Armero Real", type:"EQP", txt:"+15 monedas para la fase de EQUIPAMIENTO." },
  { id:"pir", num:99, name:"El Pirata", type:"RES", txt:"El rival pierde 20 monedas esta ronda." },
  { id:"cor2", num:100, name:"La Corsaria", type:"RES", txt:"El rival pierde 25 monedas esta ronda." },
  { id:"hac", num:101, name:"Hacker Nexus", type:"RES", txt:"El rival pierde 15 monedas esta ronda." },
  { id:"ban2", num:102, name:"Bandolero Seco", type:"RES", txt:"El rival pierde 12 monedas esta ronda." },
  { id:"gli", num:103, name:"Glitch", type:"RES", txt:"El rival pierde 10 monedas esta ronda." },
];

export const RACES = [
  { name:"Guerreros", color:"#cc3333", elite:"30%", trait:"Físico +2 · Magia −4 · Resiste golpes · Renace 30%", desc:"Brutos de guerra. Su fuerza y aguante no tienen rival, pero su afinidad mágica es casi nula.", stats:"CC +2 | AD 0 | HE -4 | Vel 0 | Mana -2 | Res.fis +2 | Res.mag 0" },
  { name:"Druidas", color:"#33aa44", elite:"38%", trait:"Magia +1 · Gran reserva de maná · Cura mejor · Renace 38%", desc:"Guardianes de la naturaleza. Equilibrados y sostenedores: gran reserva de maná, magia de curación y protección.", stats:"CC 0 | AD +1 | HE +1 | Vel 0 | Mana +12 | Res.fis +1 | Res.mag +1" },
  { name:"No-muertos", color:"#7a2a8a", elite:"60%", trait:"Magia +2 · Lentos −1 vel · RENACE 60% · Magia oscura", desc:"Muertos que se niegan a descansar. Dominan la magia oscura y renacen con un imponente 60% de vida.", stats:"CC +1 | AD 0 | HE +2 | Vel -1 | Mana +7 | Res.fis +1 | Res.mag +1" },
  { name:"Vaqueros", color:"#C9A227", elite:"30%", trait:"Distancia +2 · Velocidad +2 · Magia −3 · Renace 30%", desc:"Pistoleros del salvaje confín. Rápidos y certeros, pero negados para la magia.", stats:"CC 0 | AD +2 | HE -3 | Vel +2 | Mana -2 | Res.fis 0 | Res.mag 0" },
  { name:"Elfos", color:"#33aa66", elite:"32%", trait:"Distancia +2 · Velocidad +2 · Magia +1 · Buena reserva de maná", desc:"Arqueros ancestrales. Agilidad, puntería sobresaliente y una chispa de magia. Frágiles pero los primeros en actuar.", stats:"CC 0 | AD +2 | HE +1 | Vel +2 | Mana +7 | Res.fis 0 | Res.mag +1" },
  { name:"Magos", color:"#6644cc", elite:"30%", trait:"MAGIA +3 · Enorme reserva de maná · Físico −4 · Resiste magia", desc:"Maestros arcanos. Poder mágico y reserva de maná colosales, pero en combate cuerpo a cuerpo son un desastre.", stats:"CC -4 | AD 0 | HE +3 | Vel 0 | Mana +16 | Res.fis 0 | Res.mag +2" },
  { name:"Épicas", color:"#cc88ff", elite:"45%", trait:"Todo +1 · Buena reserva de maná · Resiste todo · Renace 45%", desc:"Seres legendarios. Sobresalen en todas las facetas y renacen con un poderoso 45% de vida.", stats:"CC +1 | AD +1 | HE +1 | Vel +1 | Mana +9 | Res.fis +1 | Res.mag +1" },
  { name:"Cotidianos", color:"#e0498b", elite:"32%", trait:"Versátiles · Distancia +1 · Velocidad +1 · Buena reserva de maná", desc:"Héroes de la vida real. Imprevisibles y con recursos para todo.", stats:"CC 0 | AD +1 | HE 0 | Vel +1 | Mana +7 | Res.fis +1 | Res.mag 0" },
];

export const CATEGORIES = [
  { key: "heroes", label: "Héroes", count: 45 },
  { key: "spells", label: "Hechizos", count: 13 },
  { key: "ranged", label: "Armas Distancia", count: 8 },
  { key: "melee", label: "Armas C/C", count: 6 },
  { key: "armors", label: "Armaduras", count: 10 },
  { key: "objects", label: "Objetos", count: 9 },
  { key: "bonuses", label: "Bonificadores", count: 12 },
  { key: "races", label: "Razas", count: 8 },
];