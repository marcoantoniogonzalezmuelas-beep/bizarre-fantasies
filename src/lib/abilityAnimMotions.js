// Variantes de movimiento temático para las cinemáticas 3D de habilidad.
// Se eligen por palabras clave en la descripción (ability_anim_desc) y se
// aplican tanto en el juego (abilityAnimPatch) como en la vista previa del
// editor (AbilityAnimPreview). El CONTENIDO de la imagen lo decide el prompt
// de generación; aquí solo decidimos el MOVIMIENTO de entrada de la criatura
// y las partículas/destellos extra (tajo de espada, fogonazo de pistola, etc).
//
// La descripción que escriba el admin puede pedir cualquier acción (ej.
// "sirviendo un cortado"): si no encaja con ningún arma conocido, se usa el
// movimiento 3D por defecto y la imagen simplemente muestra lo que se pidió.

export const DEFAULT_MOTION = {
  id: 'default',
  keywords: [],
  anim: 'bfAaImg',
  keyframes:
    '@keyframes bfAaImg{0%{transform:rotateY(-90deg) rotateX(15deg) translateZ(-900px) scale(.15);opacity:0}12%{opacity:1}28%{transform:rotateY(35deg) rotateX(-8deg) translateZ(-250px) scale(.7) translateY(10vh)}42%{transform:rotateY(-22deg) rotateX(5deg) translateZ(0) scale(1.2) translateY(-2vh)}54%{transform:rotateY(18deg) rotateX(-3deg) scale(1.1) translateY(0)}66%{transform:rotateY(-10deg) rotateX(2deg) scale(1.15)}78%{transform:rotateY(6deg) scale(1.2)}100%{transform:rotateY(0) translateZ(0) scale(1.25) translateY(-8vh);opacity:1}}',
  fxCss: '',
  fxTag: '',
};

export const MOTIONS = [
  // Espada / arma blanca: tajo diagonal descendente + estela blanca.
  {
    id: 'slash',
    keywords: ['espada', 'sword', 'sable', 'katana', 'tajo', 'slash', 'cuchillo', 'knife', 'daga', 'dagger', 'hacha', 'axe', 'machete', 'cimitarr', 'filo', 'blade', 'lanza', 'spear', 'alabarda', 'glaive', 'montante'],
    anim: 'bfAaSlash',
    keyframes:
      '@keyframes bfAaSlash{0%{transform:translate(35vw,-38vh) rotate(-35deg) scale(.2);opacity:0}15%{opacity:1}45%{transform:translate(-12vw,8vh) rotate(22deg) scale(1.1);opacity:1}58%{transform:translate(4vw,-3vh) rotate(-6deg) scale(1.05)}100%{transform:translate(0,0) rotate(0) scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-slash{position:absolute;top:50%;left:50%;width:150%;height:16px;margin:-8px 0 0 -75%;background:linear-gradient(90deg,transparent,#fff 45%,#fff 55%,transparent);transform:rotate(35deg) scaleX(0);transform-origin:left center;filter:drop-shadow(0 0 14px var(--aa-color,#fff));opacity:0;animation:bfAaSlashStreak 1.15s ease-out .25s forwards}' +
      '@keyframes bfAaSlashStreak{0%{opacity:0;transform:rotate(35deg) translate(-30vw,-18vh) scaleX(.2) scaleY(.4)}30%{opacity:1;transform:rotate(35deg) translate(0,0) scaleX(1) scaleY(1)}55%{opacity:.9;transform:rotate(30deg) translate(18vw,10vh) scaleX(1.4) scaleY(.7)}100%{opacity:0;transform:rotate(28deg) translate(30vw,18vh) scaleX(1.6) scaleY(.3)}}',
    fxTag: '<div class="bf-aa-slash"></div>',
  },
  // Escopeta: gran patada + cono de perdigones.
  {
    id: 'shotgun',
    keywords: ['escopeta', 'shotgun', 'cartucho', 'recortada', 'perdigones'],
    anim: 'bfAaShotgun',
    keyframes:
      '@keyframes bfAaShotgun{0%{transform:scale(.15) translateY(18vh) rotate(-5deg);opacity:0}18%{opacity:1;transform:scale(1.5) translateY(0) rotate(0)}34%{transform:scale(.8) translate(10vw,-12vh) rotate(10deg)}55%{transform:scale(1) translate(0,0) rotate(0)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-spread{position:absolute;top:50%;left:62%;width:65vmin;height:55vmin;margin:-27vmin 0 0 -8vmin;background:linear-gradient(90deg,var(--aa-flash,#fff) 0%,transparent 78%);clip-path:polygon(0 46%,100% 0,100% 100%);opacity:0;animation:bfAaSpread .45s ease-out .22s forwards;filter:blur(2px)}' +
      '@keyframes bfAaSpread{0%{opacity:0;transform:scaleX(.2) scaleY(.4)}40%{opacity:.9;transform:scaleX(1) scaleY(1)}100%{opacity:0;transform:scaleX(1.3) scaleY(1.1)}}',
    fxTag: '<div class="bf-aa-spread"></div>',
  },
  // Metralleta / ametralladora: sacudida rápida + varios fogonazos.
  {
    id: 'rapid',
    keywords: ['metralleta', 'metralla', 'ametralladora', 'machinegun', 'machine gun', 'subfusil', 'rafaga', 'ráfaga', 'rapid fire', 'rapidfire', 'fusil'],
    anim: 'bfAaRapid',
    keyframes:
      '@keyframes bfAaRapid{0%{transform:scale(.15) translateY(12vh);opacity:0}15%{opacity:1;transform:scale(1.25) translateY(0)}20%{transform:scale(1.2) translate(3vw,0)}26%{transform:scale(1.2) translate(-3vw,0)}32%{transform:scale(1.2) translate(2vw,0)}38%{transform:scale(1.2) translate(-2vw,0)}44%{transform:scale(1.2) translate(1.5vw,0)}50%{transform:scale(1.2) translate(-1.5vw,0)}58%{transform:scale(1.2) translate(1vw,0)}66%{transform:scale(1.2) translate(-1vw,0)}75%{transform:scale(1.2) translate(0,0)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-muzzle{position:absolute;top:50%;left:62%;width:26vmin;height:26vmin;margin:-13vmin 0 0 -13vmin;background:radial-gradient(circle,#fff 0%,var(--aa-flash,#fff) 26%,transparent 62%);opacity:0;animation:bfAaMuzzle .5s ease-out forwards;filter:blur(1px)}' +
      '@keyframes bfAaMuzzle{0%{opacity:0;transform:scale(.2) rotate(0)}35%{opacity:1;transform:scale(1.3) rotate(25deg)}100%{opacity:0;transform:scale(1.8) rotate(60deg)}}',
    fxTag:
      '<div class="bf-aa-muzzle" style="animation-delay:.18s"></div><div class="bf-aa-muzzle" style="left:56%;animation-delay:.3s"></div><div class="bf-aa-muzzle" style="left:58%;animation-delay:.42s"></div><div class="bf-aa-muzzle" style="left:60%;animation-delay:.54s"></div>',
  },
  // Tirachinas / honda: tensar y soltar + proyectil.
  {
    id: 'slingshot',
    keywords: ['tirachinas', 'honda', 'slingshot', 'resortera', 'gomera', 'tirachina'],
    anim: 'bfAaSlingshot',
    keyframes:
      '@keyframes bfAaSlingshot{0%{transform:translate(15vw,0) scale(.8);opacity:0}12%{opacity:1;transform:translate(18vw,0) scale(.9)}28%{transform:translate(22vw,0) scale(.92)}45%{transform:translate(-16vw,0) scale(1.3)}60%{transform:translate(4vw,0) scale(1.05)}100%{transform:translate(0,0) scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-proj{position:absolute;top:50%;left:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:#fff;box-shadow:0 0 16px var(--aa-color,#fff),0 0 30px var(--aa-glow,#fff);opacity:0;animation:bfAaProj 1s ease-out .45s forwards}' +
      '@keyframes bfAaProj{0%{opacity:0;transform:translate(0,0) scale(.4)}15%{opacity:1;transform:translate(8vw,-2vh) scale(1.1)}80%{opacity:1;transform:translate(40vw,-6vh) scale(.8)}100%{opacity:0;transform:translate(55vw,-10vh) scale(.3)}}',
    fxTag: '<div class="bf-aa-proj"></div>',
  },
  // Escoba / fregar: barrido en arco horizontal + estela.
  {
    id: 'sweep',
    keywords: ['escoba', 'broom', 'barrer', 'sweep', 'fregar', 'trapear', 'limpiar', 'mopa', 'mop'],
    anim: 'bfAaSweep',
    keyframes:
      '@keyframes bfAaSweep{0%{transform:translate(-35vw,0) rotate(-28deg) scale(.3);opacity:0}15%{opacity:1}50%{transform:translate(22vw,0) rotate(22deg) scale(1.1);opacity:1}65%{transform:translate(0,0) rotate(-5deg) scale(1.05)}100%{transform:translate(0,0) rotate(0) scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-sweep-fx{position:absolute;top:54%;left:50%;width:160%;height:10px;margin:-5px 0 0 -80%;background:linear-gradient(90deg,transparent,var(--aa-color,#fff),transparent);filter:drop-shadow(0 0 12px var(--aa-glow,#fff));opacity:0;animation:bfAaSweepFx 1.2s ease-out .25s forwards}' +
      '@keyframes bfAaSweepFx{0%{opacity:0;transform:translate(-40vw,0) scaleX(.2)}40%{opacity:1;transform:translate(0,0) scaleX(1)}100%{opacity:0;transform:translate(40vw,0) scaleX(1.4)}}',
    fxTag: '<div class="bf-aa-sweep-fx"></div>',
  },
  // Pistola / disparo: zoom al cañón + retroceso + fogonazo.
  {
    id: 'shoot',
    keywords: ['pistola', 'pistol', 'gun', 'revolver', 'bala', 'bullet', 'dispar', 'shoot', 'bang', 'semiauto', 'tiro'],
    anim: 'bfAaShoot',
    keyframes:
      '@keyframes bfAaShoot{0%{transform:scale(.1) translateY(25vh);opacity:0}20%{opacity:1;transform:scale(1.5) translateY(0)}35%{transform:scale(.85) translateY(-9vh)}55%{transform:scale(1.05) translateY(0)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-muzzle{position:absolute;top:50%;left:62%;width:26vmin;height:26vmin;margin:-13vmin 0 0 -13vmin;background:radial-gradient(circle,#fff 0%,var(--aa-flash,#fff) 26%,transparent 62%);opacity:0;animation:bfAaMuzzle .55s ease-out .2s forwards;filter:blur(1px)}' +
      '@keyframes bfAaMuzzle{0%{opacity:0;transform:scale(.2) rotate(0)}35%{opacity:1;transform:scale(1.3) rotate(25deg)}100%{opacity:0;transform:scale(1.8) rotate(60deg)}}',
    fxTag: '<div class="bf-aa-muzzle"></div>',
  },
  // Cabeceo / headbanging: el personaje entra y bota arriba/abajo rápidamente
  // (energía metalera) con notas musicales cayendo. La IA genera UNA imagen
  // estática, así que el "cabeceo" mueve toda la criatura; para que se lea
  // bien, el ARTE debe mostrarlo ya con la cabeza agachada y el pelo al viento.
  {
    id: 'headbang',
    keywords: ['cabeza', 'headbang', 'headbanging', 'boba-cabeza', 'bobacabeza', 'cabecear', 'cabeceo', 'metal', 'rock', 'punk', 'cabeceo', 'mecer la cabeza', 'mover la cabeza', 'bailar la cabeza'],
    anim: 'bfAaHeadbang',
    keyframes:
      '@keyframes bfAaHeadbang{0%{transform:translateY(28vh) scale(.2) rotate(-3deg);opacity:0}12%{opacity:1;transform:translateY(0) scale(1.1) rotate(0)}18%{transform:translateY(-5vh) scale(1.12) rotate(2deg)}24%{transform:translateY(1vh) scale(1.08) rotate(-2deg)}30%{transform:translateY(-4.5vh) scale(1.1) rotate(2deg)}36%{transform:translateY(1vh) scale(1.07) rotate(-1deg)}42%{transform:translateY(-3.5vh) scale(1.08) rotate(1deg)}48%{transform:translateY(1vh) scale(1.06) rotate(-1deg)}54%{transform:translateY(-2.5vh) scale(1.07) rotate(1deg)}60%{transform:translateY(0.5vh) scale(1.05)}68%{transform:translateY(-1.5vh) scale(1.06)}76%{transform:translateY(0) scale(1.1)}100%{transform:translateY(-6vh) scale(1.2);opacity:1}}',
    fxCss:
      '.bf-aa-note{position:absolute;top:-10%;color:var(--aa-color,#fff);font-size:clamp(20px,4vw,40px);opacity:0;animation:bfAaNote 2.2s linear forwards;text-shadow:0 0 14px var(--aa-glow,#fff);pointer-events:none;line-height:1}' +
      '@keyframes bfAaNote{0%{opacity:0;transform:translateY(-8vh) rotate(-18deg)}12%{opacity:1}80%{opacity:.9}100%{opacity:0;transform:translateY(92vh) rotate(22deg)}}',
    fxTag:
      '<span class="bf-aa-note" style="left:14%;animation-delay:.1s">♪</span><span class="bf-aa-note" style="left:30%;animation-delay:.45s">♫</span><span class="bf-aa-note" style="left:48%;animation-delay:.2s">♪</span><span class="bf-aa-note" style="left:66%;animation-delay:.6s">♫</span><span class="bf-aa-note" style="left:82%;animation-delay:.35s">♪</span><span class="bf-aa-note" style="left:22%;animation-delay:.8s">♫</span><span class="bf-aa-note" style="left:58%;animation-delay:1s">♪</span>',
  },
  DEFAULT_MOTION,
];

// CSS completo (keyframes + clases de FX) de todas las variantes, para inyectar
// en un <style> tanto en el juego como en la vista previa.
export const ALL_MOTION_CSS = MOTIONS.map((m) => m.keyframes + m.fxCss).join('');

// Versión mínima (id + keywords + anim + fxTag) serializada como JSON para
// inyectar el picker dentro del script del iframe del juego.
export const MOTIONS_MIN_JSON = JSON.stringify(
  MOTIONS.map((m) => ({ id: m.id, keywords: m.keywords, anim: m.anim, fxTag: m.fxTag }))
);

export function pickMotion(desc) {
  const d = String(desc || '').toLowerCase();
  if (!d) return DEFAULT_MOTION;
  for (const m of MOTIONS) {
    if (m.id === 'default') continue;
    if (m.keywords.some((k) => d.includes(k))) return m;
  }
  return DEFAULT_MOTION;
}