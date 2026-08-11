// Parche global (todos los dispositivos): elimina el "cuadrado blanco" que
// aparecía sobre la carta del héroe al recibir cualquier acción (ataque cuerpo
// a cuerpo, a distancia, hechizos, objetos, habilidades…).
//
// CAUSA: las capas de impacto del juego se diseñaron con mix-blend-mode:screen
// y un núcleo blanco casi opaco. Cuando el blend no se aplica (móvil/tablet por
// el anti-parpadeo, o según el compositor del navegador), ese blanco se pinta
// plano y cubre la carta como un recuadro.
//
// SOLUCIÓN: se sustituye el blanco por el color temático de cada efecto con
// poca opacidad. El background NO lo animan los @keyframes, así que el fundido
// de entrada y salida de cada efecto se conserva intacto.
export const WHITE_FLASH_FIX_PATCH = `
<style id="bf-noflash">
/* Efectos nativos del juego (todas las acciones: cuerpo a cuerpo, distancia,
   hechizos, objetos). Su núcleo era blanco casi opaco y en algunos navegadores
   se pinta como un recuadro blanco sobre la carta. Se vuelven translúcidos y
   se funden con la escena (screen), conservando forma y animación. */
.fx-slash{background:linear-gradient(115deg,transparent 42%,rgba(255,236,190,.55) 50%,transparent 58%)!important;mix-blend-mode:screen!important}
.fx-burst{mix-blend-mode:screen!important;opacity:.6!important}
.fx-ring{border-color:rgba(255,240,210,.7)!important;mix-blend-mode:screen!important}

.bf-fx-bigblast{background:radial-gradient(circle at 50% 45%,rgba(255,150,60,.5),rgba(255,77,60,.28) 26%,transparent 62%)!important}
.bf-fx-frost-burst{background:radial-gradient(circle at 50% 45%,rgba(150,225,255,.45),rgba(120,195,255,.2) 28%,transparent 62%)!important}
.bf-fx-bless-burst{background:radial-gradient(circle at 50% 45%,rgba(255,224,121,.45),rgba(255,200,80,.2) 28%,transparent 62%)!important}
.bf-fx-tank-burst{background:radial-gradient(circle at 50% 50%,rgba(255,190,90,.45),rgba(255,130,30,.2) 28%,transparent 64%)!important}
.bf-fx-elite-flip,.bf-fx-elite-aura{background:radial-gradient(circle at 50% 45%,rgba(255,210,74,.35),rgba(176,108,255,.15) 40%,transparent 70%)!important}
.bf-cast-flash{background:radial-gradient(circle at 50% 45%,rgba(199,155,255,.28),rgba(176,108,255,.14) 32%,transparent 62%)!important}
.bf-fx-magic-orb{background:radial-gradient(circle,currentColor,transparent 72%)!important}
.bf-fx-slash{background:linear-gradient(90deg,transparent,#ff8a6a,#ff3b35,transparent)!important}
.bf-frost-sheet,.bf-frost-crack,.bf-fx-shock{opacity:.7!important}
.bf-shock-fx::before,.bf-shock-fx::after{opacity:.7!important}
/* Estrella de impacto (sale en TODAS las acciones: golpes, disparos, hechizos,
   objetos y habilidades). Era un cuadrado blanco de 190px recortado en forma de
   estrella; si el recorte no se aplicaba, se veía el cuadrado entero. */
.bf-hitstar{background:radial-gradient(circle,rgba(255,248,225,.85),rgba(255,225,150,.5) 60%,transparent 72%)!important;mix-blend-mode:screen!important}
.bf-streak,.bf-lines,.bf-crack,.bf-slash-arc{mix-blend-mode:screen!important;opacity:.7!important}
.bf-fireball{background:radial-gradient(circle,#ffe27a 0%,#ff8a2a 42%,#ff3a14 68%,transparent 78%)!important}
/* Rayo: el relámpago era una barra blanca gigante cuando el navegador no
   aplicaba su recorte. Se estrecha y se colorea para que no tape las cartas. */
.bf-bolt{width:56px!important;background:linear-gradient(180deg,rgba(255,255,255,.85),rgba(255,225,74,.9) 35%,rgba(150,215,255,.8))!important;opacity:1!important}
.bf-flash{background:radial-gradient(circle,rgba(255,225,120,.3),rgba(180,220,255,.12) 50%,transparent 72%)!important}

</style>
`;