// Texto de la guía del juego para la documentación en PDF.
export const GAME_RULES_DOC = [
 [
  "Objetivo",
  "Forma un equipo de 3 héroes, equípalos y derrota a los 3 héroes del rival en un combate por turnos."
 ],
 [
  "Fase 1 · Subasta",
  "La subasta se juega en 3 fases, una por tipo de héroe: cuerpo a cuerpo (CC), a distancia (AD) y magia (HE). En cada fase salen 6 héroes, uno por raza (cada raza con su color y símbolo). Cada jugador escribe en secreto una puja por el héroe que quiere (puja sellada, a ciegas) y, al revelarse, quien haya ofrecido más monedas se lo lleva y paga su puja. Si los dos pujan por el mismo héroe, se abre una nueva tanda de pujas. Al final de las 3 fases cada jugador tiene su equipo de 3 héroes, uno de cada tipo. Además, cada ronda trae un bonificador único que no se repite en la partida: más monedas, ventajas o un castigo al rival. Las cartas Épicas son las más poderosas, cuestan +20 monedas y solo aparecen mediante ciertos bonificadores."
 ],
 [
  "Monedas",
  "Empiezas con 100 monedas de subasta y 100 de equipamiento. Si te quedas corto durante la subasta, puedes transferir monedas de tu presupuesto de equipamiento a la subasta de 10 en 10. Al acabar toda la subasta, las monedas de subasta que te sobren (si quedan) se suman a tus monedas de equipamiento, junto con los bonificadores positivos de equipamiento que te hayan salido durante la fase de subasta. Y si llegas sin monedas a la última fase, no te quedas sin tu tercer héroe: reclutas con deuda y lo que falte se resta de tu presupuesto de equipamiento."
 ],
 [
  "Fase 2 · Equipamiento",
  "Cada héroe puede llevar 1 arma (cuerpo a cuerpo o a distancia) y 1 armadura; al equipar verás cómo cambian sus stats. Los hechizos son cartas únicas (solo 1 copia, gastan maná) y los objetos admiten hasta 3 copias; ambos van a tu mano para usarlos en batalla. Puedes quitar una carta comprada (×) y recuperar sus monedas."
 ],
 [
  "Fase 3 · Combate",
  "Orden de turnos: distancia → hechizos → cuerpo a cuerpo (si empatan, va antes quien tenga más velocidad). En cada carta, la barra verde es la vida y la azul el maná. Acciones del héroe activo: golpe cuerpo a cuerpo (daño = CC + arma), disparo (requiere arma a distancia; daño por potencia × AD), hechizo (usa HE y gasta maná), habilidad propia del héroe, objeto de la mano, defender (recibes menos daño ese turno) o tanquear (atrae los ataques dirigidos a sus aliados). Cada acción gasta el turno. El maná es una reserva fija que no se regenera: recupéralo con el Cristal o el Orbe de Maná."
 ],
 [
  "Velocidad",
  "Cada héroe lleva un marcador ⚡ + su velocidad base (el stat de su tipo: CC, AD o HE). Dentro del mismo tipo de acción, actúa antes el héroe más rápido. Los héroes más veloces (velocidad 21 o más) brillan en dorado con el sello RÁPIDO bien visible, para que sepas de un vistazo quién vuela al ficharlos y al ordenar los turnos. Algunas armas y armaduras aumentan la velocidad al equiparlas; los estados como Congelado la reducen y Dormido o Paralizado hacen perder el turno entero."
 ],
 [
  "Armaduras",
  "Reducen el daño de golpes, disparos y hechizos. Las armaduras elementales anulan por completo su elemento contrario (agua-fuego, rayo-agua, hielo-rayo, fuego-hielo). La Barrera Arcana protege del daño mágico."
 ],
 [
  "Estados de combate",
  "Dormido — pierde su próximo turno.\nParalizado — pierde su próximo turno.\nCongelado — actúa con velocidad reducida (va más tarde).\nMaldito — sufre una reducción temporal de atributos.\nBendito — recibe un aumento temporal de atributos.\nTanqueando — intercepta los ataques dirigidos a sus aliados hasta su próximo turno.\nConfuso — dura 2 turnos (3 en Élite) y en cada uno tiene un 50% de probabilidad de perder la acción.\nBorracho — recibe 3 de daño, pierde 3 puntos de CC, AD y HE durante 2 turnos (3 en Élite) y tiene un 35% de probabilidad de fallar su acción.\nMareado — pierde 4 puntos de CC, AD y HE durante 2 turnos.\nDesorientado — el próximo ataque se redirige mediante un dado de 3 caras: rival, aliado o el propio atacante.\nInvisible — no puede ser elegido ni recibe daño rival durante su duración y queda limpio de estados negativos."
 ],
 [
  "Forma Élite",
  "Cuando un héroe cae por primera vez, renace en forma Élite con parte de su vida y stats mejorados según su raza (los No-muertos renacen con más). Al revivir, el héroe renace limpio: sin estados negativos (parálisis, maldición, veneno, confusión…) y sin arma ni armadura (van a la pila de descartes). Si vuelve a caer, muere definitivamente, salvo que uses Pluma Fénix (revive a un héroe) o Ave Fénix (cura a dos héroes a vida completa)."
 ],
 [
  "Regla de oro de habilidades",
  "Cada héroe puede usar su habilidad normal y su habilidad élite una sola vez por batalla (se cuentan por separado). Una vez jugada una, no se puede volver a usar en esa batalla, ni siquiera tras revivir en forma Élite. El botón de la habilidad ya usada se muestra atenuado y bloqueado."
 ],
 [
  "Tirada de d30 · Pifia y Fallo Épico",
  "Antes de resolver cualquier acción (golpe cuerpo a cuerpo, disparo, hechizo, objeto o habilidad) se tira un d30 y el resultado se anota en el registro de batalla:\n\n• 2-19 y 21-30 → la acción se resuelve con normalidad.\n• 20 (≈3,3%) → PIFIA: la acción falla y no produce ningún efecto; el turno se gasta igual.\n• 1 → se tira un d6 de confirmación. Si sale 1 (≈0,5% del total) es FALLO ÉPICO: la acción falla y el efecto se vuelve contra su autor. Si el d6 no lo confirma, la acción se resuelve con normalidad.\n\nSolo se tira UN dado por acción, aunque pase por varios pasos (elegir objetivo, habilidad que luego golpea…), y nunca hay dos pifias seguidas casi consecutivas: si un fallo llega justo después de otro, se repite la tirada una vez.\n\nCasos especiales:\n• Habilidades con dado propio (Monkgeta, Llorilomo, El Rolero, Doji Conpuri, Faseve…) no tiran además el d30.\n• Invocaciones: con pifia no aparece nada; con fallo épico las criaturas invocadas se pasan al ejército rival.\n• Una habilidad que no cambia nada en ese momento NO es una pifia: solo se anota en el registro.\n\nEn las partidas online la tirada la resuelve el anfitrión y se sincroniza con el rival."
 ],
 [
  "Tiradas de dado del héroe y golpes CRÍTICOS",
  "Aparte de la tirada de d30 de pifia y fallo épico (que se aplica a todas las acciones), algunas habilidades tiran su PROPIO dado. No hay que confundirlas: son dos tiradas distintas y las dos quedan anotadas en el registro de batalla.\n\n• Tirada de habilidad (d20): El Rolero, con «Tirada Crítica», lanza un d20 y su conjuro multiplica su HE según el resultado, de ×0,9 con un 1 hasta ×2 con un 20. El número obtenido se escribe en el registro y aparece también dentro de la cinemática 3D de la habilidad.\n• ¿Qué es un CRÍTICO? No es un porcentaje que pueda salir en cualquier ataque: solo lo producen cartas concretas y significa daño con potencia máxima que además ATRAVIESA LA DEFENSA (ignora escudo y/o armadura del objetivo).\n• El Rolero élite («Dado Cargado»): el dado sale siempre 20, así que aplica el multiplicador máximo, suma +6 de daño y atraviesa la defensa. Por eso el registro escribe «¡CRÍTICO!».\n• Otros críticos de carta: El Gamer (Headshot / Aimbot) y Dixie Plasma disparan críticos que ignoran la armadura o todo el equipo del rival; Dixie en Élite golpea directamente al 50% de la vida del objetivo.\n• Cualquier habilidad que decida algo al azar (potencia, víctima, sabotaje…) muestra la MISMA cinemática bizarra del dado: la pantalla se oscurece, el hueso mágico rueda entre runas y se detiene en el resultado. Las cartas nuevas que tiren dado usarán automáticamente esta misma cinemática.\n• En el registro de batalla se indica el dado usado, el número obtenido, el multiplicador resultante y si el golpe fue crítico y atravesó la defensa. En partidas online la tirada la resuelve el anfitrión, así que los dos jugadores ven el mismo resultado."
 ],
 [
  "Pila de descartes",
  "Cuando un héroe cae en combate, su arma y armadura van a tu pila de descartes (mazo de usados). Los objetos consumidos también van allí. La pila se muestra junto a tu mano durante la batalla, boca abajo, con un contador de cartas."
 ],
 [
  "Reanimación Arcana",
  "El hechizo Reanimación Arcana (nº 117, maná 12) recupera una carta aleatoria de tu pila de descartes y la devuelve a tu mano. Si es un objeto, vuelve a ser utilizable. Si es un arma o armadura, se equipa gratis (sin coste de oro) en el héroe activo al jugarlo desde la mano. El equipo viejo del mismo tipo que tuviera el héroe va al descarte al reequiparlo."
 ],
 [
  "Tipos de partida",
  "Bizarre Fantasies tiene estos tipos de partida:\n\n• Contra la IA: subasta, equipamiento y combate contra uno de los 5 niveles de IA (ver «Niveles de la IA»).\n• Sala privada online: creas una sala con contraseña y compartes el código con tu rival.\n• Sala pública online: sala sin contraseña; cualquiera con el código puede entrar.\n• Habitación Bizarra: te empareja al azar con otro visitante.\n• Misiones (individual): campañas de 5 niveles sin subasta (ver «Misiones»).\n• Misiones multijugador: la misión contra otro jugador, con sobre o con 100 monedas (ver «Misiones multijugador»).\n\nEn las partidas online, si alguien pierde la conexión la partida se puede reanudar durante 30 minutos volviendo a entrar en la sala. Si tu rival desaparece, el juego te avisa y la partida sigue esperándole."
 ],
 [
  "Habitación Bizarra",
  "La Habitación Bizarra es un lobby público donde cualquier jugador entra con su nick y contraseña, ve quién hay dentro y puede pulsar el Botón de Pánico para ser emparejado al azar con otro visitante. Necesita un mínimo de 3 visitantes en total para activarse y tiene un máximo de 20.\n\nAl pulsar el Botón de Pánico aparece una Ruleta de la Suerte que gira entre todos los visitantes y se detiene en tu rival: la partida arranca automáticamente. Todos los que estén en la habitación ven la ruleta girar al mismo tiempo.\n\nLas partidas nacidas de la Habitación Bizarra llevan una contraseña interna (invisible para los jugadores) que permite reanudarlas si se cae la conexión. Al terminar la partida, el botón \"Volver a la Habitación Bizarra\" te devuelve al lobby sin pasar por el menú principal."
 ],
 [
  "Manos desplegables en móvil y tablet",
  "En móvil y tablet, durante la batalla, TU MANO y la MANO DEL RIVAL se muestran recogidas bajo el panel de acciones para dejar el campo de batalla despejado. Cada una lleva su chapa de título (dorada la tuya, azul la del rival) con un botón redondeado «▼ Ver cartas (n)» que indica cuántas cartas hay; mientras la mano está recogida el botón parpadea para avisar de que se puede desplegar, y con «▲ Recoger cartas» se vuelve a cerrar. El estado de cada mano se recuerda durante la partida, así que puedes dejar la tuya abierta y la del rival cerrada. En PC las manos se muestran siempre abiertas."
 ],
 [
  "Absorción del tanque",
  "Cuando un héroe está tanqueando (o cuando los Patitos de Goma usan su habilidad normal «Picotazo» y quedan en juego bloqueando), intercepta los golpes dirigidos a sus aliados. Cada vez que absorbe un ataque que no iba para él, sobre su retrato aparece el marcador «🛡️ -X ABSORBIDO» (igual que los marcadores de daño, curación o stats) y queda anotado en el registro de batalla."
 ],
 [
  "Chat entre jugadores",
  "Durante las partidas multijugador puedes abrir el chat desde el icono circular del borde derecho de la pantalla. El chat muestra los mensajes en tiempo real y permite enviar emojis de héroes generados por IA. Los mensajes con insultos o contenido inapropiado se bloquean automáticamente antes de enviarse. Al salir de la Habitación Bizarra, todos tus mensajes del lobby se borran automáticamente."
 ],
 [
  "Misiones",
  "Las Misiones son campañas individuales de 5 niveles progresivos, sin subasta de héroes. Hay tres campañas: Club, Leyendas (L5R) y Todos los Héroes (incluidas las Épicas).\n\nSegún el nivel, compras tus tres héroes con un presupuesto o abres un sobre aleatorio. Después siempre tienes 150 monedas de equipamiento para armas, armaduras, hechizos y objetos. El rival usa tres héroes distintos de los tuyos (nunca se repiten entre equipos) y una IA que endurece con cada nivel.\n\nLas victorias se guardan por nick, se acumulan y desbloquean el nivel siguiente; cada nivel completado tiene su propia celebración y la misión aparece en el ranking de misiones."
 ],
 [
  "Niveles de misión",
  "• Nivel 1 · Iniciación: compras 3 héroes con 100 monedas, sin Épicas. IA Novata. 1 victoria.\n• Nivel 2 · El sobre sorpresa: tres héroes al azar de un sobre, hasta una Épica. IA Novata. 1 victoria.\n• Nivel 3 · Desafío: 75 monedas, sin Épicas; rival de más valor con hasta una Épica. IA Estratega. 2 victorias.\n• Nivel 4 · Maestría: 50 monedas, rival exigente. IA Némesis. 3 victorias.\n• Nivel 5 · El sello épico: sobre con una Épica garantizada; rival con una Épica y más valor. IA Némesis. 3 victorias.\n\nEn todos los niveles hay 150 monedas de equipamiento."
 ],
 [
  "Misiones multijugador",
  "La misión también se puede jugar contra otro jugador (Club, Leyendas o Todos los Héroes) en una sala propia, con dos modalidades:\n\n• Sobre: cada jugador abre sus sobres exclusivos y elige 3 héroes; como máximo una Épica por ejército.\n• 100 monedas: cada jugador compra 3 héroes con 100 monedas.\n\nEn las dos, cada jugador tiene después 150 monedas de equipamiento. Al terminar se puede pedir la revancha y el resultado cuenta para el ranking de misiones."
 ],
 [
  "Niveles de la IA",
  "Contra la IA hay 5 niveles que se desbloquean ganando:\n\n• IA Novata: puja bajo y usa pocas habilidades. 2 victorias desbloquean la siguiente.\n• IA Bersérker: agresiva al máximo. 3 victorias.\n• IA Estratega: equilibrada y táctica (la recomendada). 5 victorias.\n• IA Némesis: te roba los héroes y juega casi perfecto. 5 victorias.\n• IA Bizarra: el caos hecho IA. Gánale 10 veces para pasarte el juego.\n\nLas victorias se guardan por nick y cada nivel superado tiene su propia celebración."
 ],
 [
  "Bizarros e invocaciones",
  "Los Bizarros son héroes sorpresa completos, con habilidad normal y Élite. Las invocaciones también son unidades completas creadas por habilidades: Patitos de Goma, Grulla, Unicornio Kamikaze y Pegaso. Usan sus habilidades implementadas y, si la invocación sufre un Fallo Épico, aparecen en el ejército rival."
 ],
 [
  "Sinergias estratégicas",
  "Marca combina con ataques múltiples o de área para repetir daño extra. Tanquear, escudar y curar protege a los atacantes frágiles. Los penalizadores preparan ejecuciones y ataques concentrados. La velocidad del equipo altera el orden de turnos. Críticos y perforación contrarrestan armaduras. Recuperar maná sostiene equipos mágicos. Reanimación Arcana reutiliza equipo y objetos. Las invocaciones añaden presión, objetivos y defensa."
 ],
 [
  "Catálogo actual",
  "El índice de cartas del PDF se genera desde la base de datos activa al descargarlo. Incluye todos los héroes, Bizarros, invocaciones, razas, hechizos, armas, armaduras, objetos y bonificadores actuales, con sus textos en español e inglés cuando existe traducción."
 ]
];
