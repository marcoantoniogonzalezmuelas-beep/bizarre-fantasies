// Variantes de movimiento temático para las cinemáticas 3D de habilidad.
// Se eligen por palabras clave en la descripción (ability_anim_desc) y se
// aplican tanto en el juego (abilityAnimPatch) como en la vista previa del
// editor (AbilityAnimPreview). El CONTENIDO de la imagen lo decide el prompt
// de generación; aquí solo decidimos el MOVIMIENTO de entrada de la criatura
// y las partículas/destellos extra (tajo de espada, fogonazo de pistola, etc).
//
// Todas las variantes son "artesanales" al estilo del patito de goma
// (specialCardCinematicPatch): varias capas de partículas, destellos y
// sacudidas dedicadas, no un único efecto genérico. La descripción que
// escriba el admin puede pedir cualquier acción (beber, servir, magia,
// fuego…): si encaja con un verbo conocido se usa su variante dedicada y,
// si no, la variante por defecto sigue siendo rica y artesanal.

export const DEFAULT_MOTION = {
  id: 'default',
  keywords: [],
  anim: 'bfAaImg',
  keyframes:
    '@keyframes bfAaImg{0%{transform:rotateY(-90deg) rotateX(15deg) translateZ(-900px) scale(.15);opacity:0}12%{opacity:1}28%{transform:rotateY(35deg) rotateX(-8deg) translateZ(-250px) scale(.7) translateY(10vh)}42%{transform:rotateY(-22deg) rotateX(5deg) translateZ(0) scale(1.2) translateY(-2vh)}54%{transform:rotateY(18deg) rotateX(-3deg) scale(1.1) translateY(0)}66%{transform:rotateY(-10deg) rotateX(2deg) scale(1.15)}78%{transform:rotateY(6deg) scale(1.2)}100%{transform:rotateY(0) translateZ(0) scale(1.25) translateY(-8vh);opacity:1}}',
  fxCss:
    '.bf-aa-mote{position:absolute;bottom:6%;width:8px;height:8px;border-radius:50%;background:var(--aa-color,#fff);box-shadow:0 0 12px var(--aa-color,#fff),0 0 22px var(--aa-glow,#fff);opacity:0;animation:bfAaMote 2.4s ease-out forwards}' +
    '@keyframes bfAaMote{0%{opacity:0;transform:translateY(0) scale(.3)}18%{opacity:1}100%{opacity:0;transform:translateY(-72vh) translateX(var(--dx,0px)) scale(1.2)}}' +
    '.bf-aa-halo{position:absolute;top:50%;left:50%;width:60vmin;height:60vmin;margin:-30vmin 0 0 -30vmin;border-radius:50%;background:radial-gradient(circle,var(--aa-glow,rgba(255,255,255,.3)),transparent 68%);opacity:0;animation:bfAaHalo 2.6s ease-out forwards;filter:blur(8px)}' +
    '@keyframes bfAaHalo{0%{opacity:0;transform:scale(.4)}30%{opacity:.7}100%{opacity:0;transform:scale(1.3)}}',
  fxTag:
    '<div class="bf-aa-halo"></div>' +
    '<span class="bf-aa-mote" style="left:14%;--dx:20px;animation-delay:.1s"></span><span class="bf-aa-mote" style="left:28%;--dx:-30px;animation-delay:.35s"></span><span class="bf-aa-mote" style="left:42%;--dx:15px;animation-delay:.2s"></span><span class="bf-aa-mote" style="left:58%;--dx:-20px;animation-delay:.5s"></span><span class="bf-aa-mote" style="left:72%;--dx:25px;animation-delay:.3s"></span><span class="bf-aa-mote" style="left:86%;--dx:-15px;animation-delay:.6s"></span><span class="bf-aa-mote" style="left:36%;--dx:40px;animation-delay:.75s"></span><span class="bf-aa-mote" style="left:64%;--dx:-35px;animation-delay:.9s"></span>',
};

export const MOTIONS = [
  // CHILANA / tiro libre / bicicleta (fútbol): el héroe se inclina ~200°
  // simulando una chilena (bicycle kick): salta, se invierte boca abajo al
  // impacto, mantiene el remate y aterriza. Balón que sale disparado + césped
  // + líneas de movimiento. Va PRIMERO para que "Tiro Libre" encaje aquí antes
  // que con el keyword "tiro" del motion de disparo.
  {
    id: 'bicycle',
    keywords: ['chilana', 'chilena', 'bicycle', 'bicicleta', 'tijera', 'scissor', 'tiro libre', 'free kick', 'freekick', 'futbolista', 'fútbol', 'futbol', 'football', 'soccer', 'chutar', 'chut', 'volea', 'volley', 'penal', 'penalty', 'penalti', 'rematar', 'remate'],
    anim: 'bfAaBicycle',
    keyframes:
      '@keyframes bfAaBicycle{0%{transform:scale(.2) translateY(22vh) rotate(0);opacity:0}16%{opacity:1;transform:scale(1.1) translateY(0) rotate(0)}30%{transform:scale(1.15) translateY(-10vh) rotate(95deg)}45%{transform:scale(1.2) translateY(-16vh) rotate(200deg)}55%{transform:scale(1.18) translateY(-14vh) rotate(200deg)}68%{transform:scale(1.1) translateY(-4vh) rotate(40deg)}82%{transform:scale(1.1) translateY(-2vh) rotate(0)}100%{transform:scale(1.2) translateY(-6vh) rotate(0);opacity:1}}',
    fxCss:
      '.bf-aa-sball{position:absolute;top:50%;left:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,#222 70%);box-shadow:0 0 16px rgba(255,255,255,.8),0 0 28px var(--aa-glow,#fff);opacity:0;animation:bfAaSBall .9s ease-out .35s forwards}' +
      '@keyframes bfAaSBall{0%{opacity:0;transform:translate(0,0) scale(.3) rotate(0)}15%{opacity:1;transform:translate(0,0) scale(1) rotate(0)}100%{opacity:0;transform:translate(60vw,-18vh) scale(.7) rotate(720deg)}}' +
      '.bf-aa-grass{position:absolute;width:9px;height:9px;border-radius:50% 50% 0 0;background:linear-gradient(180deg,#7ec846,#3f7a1f);opacity:0;animation:bfAaGrass 1.3s ease-out forwards;filter:drop-shadow(0 0 6px rgba(80,160,40,.6))}' +
      '@keyframes bfAaGrass{0%{opacity:0;transform:translate(0,0) scale(.4) rotate(0)}25%{opacity:.9}100%{opacity:0;transform:translate(var(--dx,40px),var(--dy,-30px)) scale(1.4) rotate(var(--r,180deg))}}' +
      '.bf-aa-sstreak{position:absolute;top:50%;left:50%;width:46vmin;height:6px;margin:-3px 0 0 -23vmin;background:linear-gradient(90deg,transparent,#fff 45%,#fff 55%,transparent);transform-origin:center;filter:drop-shadow(0 0 12px var(--aa-color,#fff));opacity:0;animation:bfAaSStreak .6s ease-out .4s forwards}' +
      '@keyframes bfAaSStreak{0%{opacity:0;transform:rotate(-18deg) scaleX(.2)}40%{opacity:.9;transform:rotate(-18deg) scaleX(1)}100%{opacity:0;transform:rotate(-18deg) scaleX(1.4)}}' +
      '.bf-aa-pitch{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 75%,rgba(80,160,40,.18),transparent 60%);opacity:0;animation:bfAaPitch 2.6s ease-out forwards}' +
      '@keyframes bfAaPitch{0%{opacity:0}30%{opacity:.5}100%{opacity:0}}',
    fxTag:
      '<div class="bf-aa-pitch"></div><div class="bf-aa-sstreak"></div><div class="bf-aa-sball"></div>' +
      '<span class="bf-aa-grass" style="left:40%;top:62%;--dx:-40px;--dy:-25px;--r:-160deg;animation-delay:.2s"></span><span class="bf-aa-grass" style="left:52%;top:64%;--dx:55px;--dy:-20px;--r:180deg;animation-delay:.28s"></span><span class="bf-aa-grass" style="left:46%;top:60%;--dx:-60px;--dy:-35px;--r:-220deg;animation-delay:.36s"></span><span class="bf-aa-grass" style="left:56%;top:66%;--dx:70px;--dy:-30px;--r:200deg;animation-delay:.44s"></span><span class="bf-aa-grass" style="left:48%;top:68%;--dx:-30px;--dy:-40px;--r:-180deg;animation-delay:.5s"></span><span class="bf-aa-grass" style="left:54%;top:62%;--dx:45px;--dy:-25px;--r:240deg;animation-delay:.58s"></span>',
  },
  // Espada / arma blanca: tajo diagonal + estela + lluvia de chispas + destello.
  {
    id: 'slash',
    keywords: ['espada', 'sword', 'sable', 'katana', 'tajo', 'slash', 'cuchillo', 'knife', 'daga', 'dagger', 'hacha', 'axe', 'machete', 'cimitarr', 'filo', 'blade', 'lanza', 'spear', 'alabarda', 'glaive', 'montante', 'guadaña', 'guadana', 'corta', 'rebanar', 'tajar'],
    anim: 'bfAaSlash',
    keyframes:
      '@keyframes bfAaSlash{0%{transform:translate(35vw,-38vh) rotate(-35deg) scale(.2);opacity:0}15%{opacity:1}45%{transform:translate(-12vw,8vh) rotate(22deg) scale(1.1);opacity:1}58%{transform:translate(4vw,-3vh) rotate(-6deg) scale(1.05)}100%{transform:translate(0,0) rotate(0) scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-slash{position:absolute;top:50%;left:50%;width:150%;height:16px;margin:-8px 0 0 -75%;background:linear-gradient(90deg,transparent,#fff 45%,#fff 55%,transparent);transform:rotate(35deg) scaleX(0);transform-origin:left center;filter:drop-shadow(0 0 14px var(--aa-color,#fff));opacity:0;animation:bfAaSlashStreak 1.15s ease-out .25s forwards}' +
      '@keyframes bfAaSlashStreak{0%{opacity:0;transform:rotate(35deg) translate(-30vw,-18vh) scaleX(.2) scaleY(.4)}30%{opacity:1;transform:rotate(35deg) translate(0,0) scaleX(1) scaleY(1)}55%{opacity:.9;transform:rotate(30deg) translate(18vw,10vh) scaleX(1.4) scaleY(.7)}100%{opacity:0;transform:rotate(28deg) translate(30vw,18vh) scaleX(1.6) scaleY(.3)}}' +
      '.bf-aa-spark2{position:absolute;top:46%;left:48%;width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 10px #fff,0 0 18px var(--aa-color,#fff);opacity:0;animation:bfAaSpark2 .9s ease-out .55s forwards}' +
      '@keyframes bfAaSpark2{0%{opacity:0;transform:translate(0,0) scale(.3)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),var(--dy,0px)) scale(1.4)}}' +
      '.bf-aa-impact{position:absolute;top:48%;left:44%;width:30vmin;height:30vmin;margin:-15vmin 0 0 -15vmin;border-radius:50%;background:radial-gradient(circle,#fff,transparent 60%);opacity:0;animation:bfAaImpact .6s ease-out .5s forwards;filter:blur(2px)}' +
      '@keyframes bfAaImpact{0%{opacity:0;transform:scale(.2)}30%{opacity:.9;transform:scale(1.2)}100%{opacity:0;transform:scale(1.8)}}',
    fxTag:
      '<div class="bf-aa-slash"></div><div class="bf-aa-impact"></div>' +
      '<span class="bf-aa-spark2" style="--dx:-90px;--dy:-40px"></span><span class="bf-aa-spark2" style="--dx:70px;--dy:-60px;animation-delay:.6s"></span><span class="bf-aa-spark2" style="--dx:-50px;--dy:50px;animation-delay:.65s"></span><span class="bf-aa-spark2" style="--dx:90px;--dy:30px;animation-delay:.7s"></span><span class="bf-aa-spark2" style="--dx:-30px;--dy:-80px;animation-delay:.75s"></span><span class="bf-aa-spark2" style="--dx:60px;--dy:70px;animation-delay:.8s"></span>',
  },
  // Escopeta: gran patada + cono de perdigones + casquillos + humo + destello.
  {
    id: 'shotgun',
    keywords: ['escopeta', 'shotgun', 'cartucho', 'recortada', 'perdigones'],
    anim: 'bfAaShotgun',
    keyframes:
      '@keyframes bfAaShotgun{0%{transform:scale(.15) translateY(18vh) rotate(-5deg);opacity:0}18%{opacity:1;transform:scale(1.5) translateY(0) rotate(0)}34%{transform:scale(.8) translate(10vw,-12vh) rotate(10deg)}55%{transform:scale(1) translate(0,0) rotate(0)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-spread{position:absolute;top:50%;left:62%;width:65vmin;height:55vmin;margin:-27vmin 0 0 -8vmin;background:linear-gradient(90deg,var(--aa-flash,#fff) 0%,transparent 78%);clip-path:polygon(0 46%,100% 0,100% 100%);opacity:0;animation:bfAaSpread .45s ease-out .22s forwards;filter:blur(2px)}' +
      '@keyframes bfAaSpread{0%{opacity:0;transform:scaleX(.2) scaleY(.4)}40%{opacity:.9;transform:scaleX(1) scaleY(1)}100%{opacity:0;transform:scaleX(1.3) scaleY(1.1)}}' +
      '.bf-aa-shell{position:absolute;width:7px;height:12px;border-radius:3px;background:linear-gradient(180deg,#ffe27a,#c8901f);box-shadow:0 0 8px rgba(255,200,60,.8);opacity:0;animation:bfAaShell 1.1s ease-in forwards}' +
      '@keyframes bfAaShell{0%{opacity:0;transform:translate(0,0) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx,40px),55vh) rotate(520deg)}}' +
      '.bf-aa-smoke{position:absolute;width:20px;height:20px;border-radius:50%;background:radial-gradient(circle,#b0b0b0,transparent 70%);opacity:0;animation:bfAaSmoke 1.4s ease-out infinite}' +
      '@keyframes bfAaSmoke{0%{opacity:0;transform:translate(0,0) scale(.4)}18%{opacity:.6}100%{opacity:0;transform:translate(var(--dx,40px),-28vh) scale(2.2)}}' +
      '.bf-aa-boom2{position:absolute;font-size:clamp(30px,7vw,56px);opacity:0;animation:bfAaBoom2 .7s ease-out .2s forwards;filter:drop-shadow(0 0 14px rgba(255,180,40,.9))}' +
      '@keyframes bfAaBoom2{0%{opacity:0;transform:scale(.2)}35%{opacity:1;transform:scale(1.3)}100%{opacity:0;transform:scale(1.6)}}',
    fxTag:
      '<div class="bf-aa-spread"></div><span class="bf-aa-boom2" style="left:60%;top:44%">💥</span>' +
      '<span class="bf-aa-shell" style="left:58%;top:40%;--dx:60px;animation-delay:.24s"></span><span class="bf-aa-shell" style="left:56%;top:38%;--dx:80px;animation-delay:.4s"></span><span class="bf-aa-shell" style="left:60%;top:42%;--dx:50px;animation-delay:.52s"></span><span class="bf-aa-shell" style="left:57%;top:44%;--dx:70px;animation-delay:.66s"></span>' +
      '<span class="bf-aa-smoke" style="left:62%;top:52%;--dx:30px;animation-delay:.3s"></span><span class="bf-aa-smoke" style="left:60%;top:50%;--dx:20px;animation-delay:.6s"></span><span class="bf-aa-smoke" style="left:64%;top:54%;--dx:40px;animation-delay:.9s"></span>',
  },
  // Metralleta / ametralladora / plasma: retroceso + ráfaga de fogonazos
  // encadenados, casquillos cayendo, destellos 💥, trazas de disparo y humo.
  {
    id: 'rapid',
    keywords: ['metralleta', 'metralla', 'ametralladora', 'machinegun', 'machine gun', 'subfusil', 'rafaga', 'ráfaga', 'rapid fire', 'rapidfire', 'fusil', 'plasma', 'láser', 'laser', 'blaster'],
    anim: 'bfAaRapid',
    keyframes:
      '@keyframes bfAaRapid{0%{transform:scale(.15) translateY(14vh);opacity:0}14%{opacity:1;transform:scale(1.3) translateY(0) rotate(0)}19%{transform:scale(1.22) translate(4vw,1vh) rotate(-2deg)}25%{transform:scale(1.22) translate(-4vw,0) rotate(1.5deg)}31%{transform:scale(1.22) translate(3vw,1vh) rotate(-1.5deg)}37%{transform:scale(1.22) translate(-3vw,0) rotate(1deg)}43%{transform:scale(1.22) translate(2.5vw,.5vh) rotate(-1deg)}49%{transform:scale(1.22) translate(-2vw,0) rotate(.8deg)}55%{transform:scale(1.2) translate(2vw,.5vh) rotate(-.8deg)}61%{transform:scale(1.2) translate(-1.5vw,0) rotate(.6deg)}68%{transform:scale(1.2) translate(1vw,0) rotate(-.5deg)}75%{transform:scale(1.18) translate(0,0) rotate(0)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-rmuzzle{position:absolute;top:50%;left:64%;width:24vmin;height:24vmin;margin:-12vmin 0 0 -12vmin;background:radial-gradient(circle,#fff 0%,var(--aa-flash,#fff) 22%,transparent 60%);opacity:0;animation:bfAaRMuzzle .4s ease-out forwards;filter:blur(.5px)}' +
      '@keyframes bfAaRMuzzle{0%{opacity:0;transform:scale(.15) rotate(0)}30%{opacity:1;transform:scale(1.4) rotate(20deg)}100%{opacity:0;transform:scale(2) rotate(80deg)}}' +
      '.bf-aa-shell{position:absolute;width:7px;height:12px;border-radius:3px;background:linear-gradient(180deg,#ffe27a,#c8901f);box-shadow:0 0 8px rgba(255,200,60,.8);opacity:0;animation:bfAaShell 1.1s ease-in forwards}' +
      '@keyframes bfAaShell{0%{opacity:0;transform:translate(0,0) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx,40px),55vh) rotate(520deg)}}' +
      '.bf-aa-boom{position:absolute;font-size:clamp(22px,5vw,42px);opacity:0;animation:bfAaBoom .55s ease-out infinite;filter:drop-shadow(0 0 12px rgba(255,180,40,.9))}' +
      '@keyframes bfAaBoom{0%,100%{opacity:0;transform:scale(.3)}35%{opacity:1;transform:scale(1.25)}}' +
      '.bf-aa-tracer{position:absolute;top:50%;left:60%;height:3px;width:0;background:linear-gradient(90deg,#fff,var(--aa-color,#fff),transparent);box-shadow:0 0 10px var(--aa-color,#fff);opacity:0;animation:bfAaTracer .5s ease-out forwards}' +
      '@keyframes bfAaTracer{0%{opacity:0;width:0}20%{opacity:1;width:38vw}80%{opacity:.6}100%{opacity:0;width:42vw}}' +
      '.bf-aa-smoke{position:absolute;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle,#b0b0b0,transparent 70%);opacity:0;animation:bfAaSmoke2 1.3s ease-out infinite}' +
      '@keyframes bfAaSmoke2{0%{opacity:0;transform:translate(0,0) scale(.4)}18%{opacity:.6}100%{opacity:0;transform:translate(var(--dx,40px),-26vh) scale(2)}}',
    fxTag:
      '<div class="bf-aa-rmuzzle" style="animation-delay:.16s"></div><div class="bf-aa-rmuzzle" style="left:60%;animation-delay:.26s"></div><div class="bf-aa-rmuzzle" style="left:62%;animation-delay:.36s"></div><div class="bf-aa-rmuzzle" style="left:59%;animation-delay:.46s"></div><div class="bf-aa-rmuzzle" style="left:61%;animation-delay:.56s"></div><div class="bf-aa-rmuzzle" style="left:63%;animation-delay:.66s"></div>' +
      '<span class="bf-aa-boom" style="left:62%;top:42%;animation-delay:.2s">💥</span><span class="bf-aa-boom" style="left:64%;top:46%;animation-delay:.4s">💥</span><span class="bf-aa-boom" style="left:60%;top:44%;animation-delay:.6s">💥</span><span class="bf-aa-boom" style="left:63%;top:48%;animation-delay:.8s">💥</span>' +
      '<span class="bf-aa-shell" style="left:60%;top:40%;--dx:50px;animation-delay:.22s"></span><span class="bf-aa-shell" style="left:58%;top:38%;--dx:70px;animation-delay:.34s"></span><span class="bf-aa-shell" style="left:62%;top:42%;--dx:55px;animation-delay:.46s"></span><span class="bf-aa-shell" style="left:59%;top:40%;--dx:80px;animation-delay:.58s"></span><span class="bf-aa-shell" style="left:61%;top:44%;--dx:60px;animation-delay:.7s"></span><span class="bf-aa-shell" style="left:63%;top:38%;--dx:75px;animation-delay:.82s"></span><span class="bf-aa-shell" style="left:57%;top:42%;--dx:65px;animation-delay:.94s"></span>' +
      '<div class="bf-aa-tracer" style="animation-delay:.2s"></div><div class="bf-aa-tracer" style="top:54%;animation-delay:.4s"></div><div class="bf-aa-tracer" style="top:52%;animation-delay:.6s"></div>' +
      '<span class="bf-aa-smoke" style="left:64%;top:50%;--dx:30px;animation-delay:.3s"></span><span class="bf-aa-smoke" style="left:62%;top:48%;--dx:20px;animation-delay:.6s"></span><span class="bf-aa-smoke" style="left:66%;top:52%;--dx:40px;animation-delay:.9s"></span>',
  },
  // Tirachinas / honda: tensar y soltar + proyectil + estela + impacto.
  {
    id: 'slingshot',
    keywords: ['tirachinas', 'honda', 'slingshot', 'resortera', 'gomera', 'tirachina', 'tira', 'gomas'],
    anim: 'bfAaSlingshot',
    keyframes:
      '@keyframes bfAaSlingshot{0%{transform:translate(15vw,0) scale(.8);opacity:0}12%{opacity:1;transform:translate(18vw,0) scale(.9)}28%{transform:translate(22vw,0) scale(.92)}45%{transform:translate(-16vw,0) scale(1.3)}60%{transform:translate(4vw,0) scale(1.05)}100%{transform:translate(0,0) scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-proj{position:absolute;top:50%;left:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:#fff;box-shadow:0 0 16px var(--aa-color,#fff),0 0 30px var(--aa-glow,#fff);opacity:0;animation:bfAaProj 1s ease-out .45s forwards}' +
      '@keyframes bfAaProj{0%{opacity:0;transform:translate(0,0) scale(.4)}15%{opacity:1;transform:translate(8vw,-2vh) scale(1.1)}80%{opacity:1;transform:translate(40vw,-6vh) scale(.8)}100%{opacity:0;transform:translate(55vw,-10vh) scale(.3)}}' +
      '.bf-aa-proj-trail{position:absolute;top:50%;left:48%;height:4px;width:0;background:linear-gradient(90deg,transparent,#fff,var(--aa-color,#fff));border-radius:4px;box-shadow:0 0 12px var(--aa-color,#fff);opacity:0;animation:bfAaProjTrail .8s ease-out .5s forwards}' +
      '@keyframes bfAaProjTrail{0%{opacity:0;width:0}30%{opacity:.9;width:42vw}100%{opacity:0;width:52vw}}' +
      '.bf-aa-proj-burst{position:absolute;top:50%;left:78%;width:24vmin;height:24vmin;margin:-12vmin 0 0 -12vmin;border-radius:50%;border:4px solid var(--aa-color,#fff);box-shadow:0 0 22px var(--aa-glow,#fff);opacity:0;animation:bfAaProjBurst .8s ease-out 1.1s forwards}' +
      '@keyframes bfAaProjBurst{0%{opacity:0;transform:scale(.2)}30%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(2)}}',
    fxTag:
      '<div class="bf-aa-proj-trail"></div><div class="bf-aa-proj"></div><div class="bf-aa-proj-burst"></div>',
  },
  // Escoba / fregar: barrido en arco + estela + polvo + burbujas.
  {
    id: 'sweep',
    keywords: ['escoba', 'broom', 'barrer', 'sweep', 'fregar', 'trapear', 'limpiar', 'mopa', 'mop', 'barredora', 'cepillo'],
    anim: 'bfAaSweep',
    keyframes:
      '@keyframes bfAaSweep{0%{transform:translate(-35vw,0) rotate(-28deg) scale(.3);opacity:0}15%{opacity:1}50%{transform:translate(22vw,0) rotate(22deg) scale(1.1);opacity:1}65%{transform:translate(0,0) rotate(-5deg) scale(1.05)}100%{transform:translate(0,0) rotate(0) scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-sweep-fx{position:absolute;top:54%;left:50%;width:160%;height:10px;margin:-5px 0 0 -80%;background:linear-gradient(90deg,transparent,var(--aa-color,#fff),transparent);filter:drop-shadow(0 0 12px var(--aa-glow,#fff));opacity:0;animation:bfAaSweepFx 1.2s ease-out .25s forwards}' +
      '@keyframes bfAaSweepFx{0%{opacity:0;transform:translate(-40vw,0) scaleX(.2)}40%{opacity:1;transform:translate(0,0) scaleX(1)}100%{opacity:0;transform:translate(40vw,0) scaleX(1.4)}}' +
      '.bf-aa-dust{position:absolute;width:10px;height:10px;border-radius:50%;background:radial-gradient(circle,#d9c9a0,transparent 70%);opacity:0;animation:bfAaDust 1.3s ease-out forwards}' +
      '@keyframes bfAaDust{0%{opacity:0;transform:translate(0,0) scale(.4)}20%{opacity:.8}100%{opacity:0;transform:translate(var(--dx,0px),var(--dy,-30px)) scale(2)}}',
    fxTag:
      '<div class="bf-aa-sweep-fx"></div>' +
      '<span class="bf-aa-dust" style="left:30%;top:58%;--dx:-40px;--dy:-20px;animation-delay:.3s"></span><span class="bf-aa-dust" style="left:40%;top:60%;--dx:30px;--dy:-15px;animation-delay:.4s"></span><span class="bf-aa-dust" style="left:50%;top:56%;--dx:-50px;--dy:-25px;animation-delay:.5s"></span><span class="bf-aa-dust" style="left:60%;top:58%;--dx:45px;--dy:-20px;animation-delay:.6s"></span><span class="bf-aa-dust" style="left:48%;top:62%;--dx:-30px;--dy:-35px;animation-delay:.7s"></span><span class="bf-aa-dust" style="left:42%;top:60%;--dx:55px;--dy:-22px;animation-delay:.8s"></span>',
  },
  // Pistola / disparo: zoom al cañón + retroceso + fogonazo + casquillo + humo.
  {
    id: 'shoot',
    keywords: ['pistola', 'pistol', 'gun', 'revolver', 'revólver', 'revolver', 'bala', 'bullet', 'dispar', 'shoot', 'bang', 'semiauto', 'tiro', 'cañón', 'canon', 'cannon'],
    anim: 'bfAaShoot',
    keyframes:
      '@keyframes bfAaShoot{0%{transform:scale(.1) translateY(25vh);opacity:0}20%{opacity:1;transform:scale(1.5) translateY(0)}35%{transform:scale(.85) translateY(-9vh)}55%{transform:scale(1.05) translateY(0)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-muzzle{position:absolute;top:50%;left:62%;width:26vmin;height:26vmin;margin:-13vmin 0 0 -13vmin;background:radial-gradient(circle,#fff 0%,var(--aa-flash,#fff) 26%,transparent 62%);opacity:0;animation:bfAaMuzzle .55s ease-out .2s forwards;filter:blur(1px)}' +
      '@keyframes bfAaMuzzle{0%{opacity:0;transform:scale(.2) rotate(0)}35%{opacity:1;transform:scale(1.3) rotate(25deg)}100%{opacity:0;transform:scale(1.8) rotate(60deg)}}' +
      '.bf-aa-shell{position:absolute;width:7px;height:12px;border-radius:3px;background:linear-gradient(180deg,#ffe27a,#c8901f);box-shadow:0 0 8px rgba(255,200,60,.8);opacity:0;animation:bfAaShell 1.1s ease-in .3s forwards}' +
      '.bf-aa-smoke3{position:absolute;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle,#b0b0b0,transparent 70%);opacity:0;animation:bfAaSmoke3 1.3s ease-out .35s forwards}' +
      '@keyframes bfAaSmoke3{0%{opacity:0;transform:translate(0,0) scale(.4)}18%{opacity:.5}100%{opacity:0;transform:translate(var(--dx,30px),-24vh) scale(2)}}' +
      '.bf-aa-boom3{position:absolute;font-size:clamp(28px,6vw,48px);opacity:0;animation:bfAaBoom3 .6s ease-out .2s forwards;filter:drop-shadow(0 0 14px rgba(255,180,40,.9))}' +
      '@keyframes bfAaBoom3{0%{opacity:0;transform:scale(.2)}35%{opacity:1;transform:scale(1.3)}100%{opacity:0;transform:scale(1.5)}}',
    fxTag:
      '<div class="bf-aa-muzzle"></div><span class="bf-aa-boom3" style="left:62%;top:44%">💥</span>' +
      '<span class="bf-aa-shell" style="left:60%;top:42%;--dx:60px"></span>' +
      '<span class="bf-aa-smoke3" style="left:62%;top:50%;--dx:25px"></span><span class="bf-aa-smoke3" style="left:64%;top:52%;--dx:35px;animation-delay:.5s"></span>',
  },
  // Cabeceo / headbanging: bota arriba/abajo + notas musicales + luces.
  {
    id: 'headbang',
    keywords: ['cabeza', 'headbang', 'headbanging', 'boba-cabeza', 'bobacabeza', 'cabecear', 'cabeceo', 'metal', 'rock', 'punk', 'mecer la cabeza', 'mover la cabeza', 'bailar la cabeza', 'guitarra', 'guitar'],
    anim: 'bfAaHeadbang',
    keyframes:
      '@keyframes bfAaHeadbang{0%{transform:translateY(28vh) scale(.2) rotate(-3deg);opacity:0}12%{opacity:1;transform:translateY(0) scale(1.1) rotate(0)}18%{transform:translateY(-5vh) scale(1.12) rotate(2deg)}24%{transform:translateY(1vh) scale(1.08) rotate(-2deg)}30%{transform:translateY(-4.5vh) scale(1.1) rotate(2deg)}36%{transform:translateY(1vh) scale(1.07) rotate(-1deg)}42%{transform:translateY(-3.5vh) scale(1.08) rotate(1deg)}48%{transform:translateY(1vh) scale(1.06) rotate(-1deg)}54%{transform:translateY(-2.5vh) scale(1.07) rotate(1deg)}60%{transform:translateY(0.5vh) scale(1.05)}68%{transform:translateY(-1.5vh) scale(1.06)}76%{transform:translateY(0) scale(1.1)}100%{transform:translateY(-6vh) scale(1.2);opacity:1}}',
    fxCss:
      '.bf-aa-note{position:absolute;top:-10%;color:var(--aa-color,#fff);font-size:clamp(20px,4vw,40px);opacity:0;animation:bfAaNote 2.2s linear forwards;text-shadow:0 0 14px var(--aa-glow,#fff);pointer-events:none;line-height:1}' +
      '@keyframes bfAaNote{0%{opacity:0;transform:translateY(-8vh) rotate(-18deg)}12%{opacity:1}80%{opacity:.9}100%{opacity:0;transform:translateY(92vh) rotate(22deg)}}' +
      '.bf-aa-stagebeam{position:absolute;top:0;width:18vw;height:120vh;background:linear-gradient(180deg,var(--aa-color,#fff),transparent 70%);opacity:0;mix-blend-mode:screen;filter:blur(6px);animation:bfAaBeam 1.8s ease-in-out infinite;transform-origin:top center}' +
      '@keyframes bfAaBeam{0%,100%{opacity:0;transform:rotate(-18deg)}50%{opacity:.5;transform:rotate(18deg)}}',
    fxTag:
      '<div class="bf-aa-stagebeam" style="left:20%;animation-delay:0s"></div><div class="bf-aa-stagebeam" style="left:62%;animation-delay:.6s"></div>' +
      '<span class="bf-aa-note" style="left:14%;animation-delay:.1s">♪</span><span class="bf-aa-note" style="left:30%;animation-delay:.45s">♫</span><span class="bf-aa-note" style="left:48%;animation-delay:.2s">♪</span><span class="bf-aa-note" style="left:66%;animation-delay:.6s">♫</span><span class="bf-aa-note" style="left:82%;animation-delay:.35s">♪</span><span class="bf-aa-note" style="left:22%;animation-delay:.8s">♫</span><span class="bf-aa-note" style="left:58%;animation-delay:1s">♪</span><span class="bf-aa-note" style="left:40%;animation-delay:1.2s">♬</span>',
  },
  // BEBER / brindar: la criatura bota suavemente + burbujas + espuma + salpicadura.
  {
    id: 'drink',
    keywords: ['beber', 'bebiendo', 'cerveza', 'copa', 'vaso', 'agua', 'vino', 'brindis', 'bebida', 'sorbo', 'trago', 'chupito', 'whisky', 'ron', 'tequila', 'champán', 'champan', 'soda', 'bebida'],
    anim: 'bfAaDrink',
    keyframes:
      '@keyframes bfAaDrink{0%{transform:scale(.15) translateY(20vh);opacity:0}14%{opacity:1;transform:scale(1.15) translateY(0)}22%{transform:scale(1.1) translateY(-3vh)}30%{transform:scale(1.12) translateY(1vh)}38%{transform:scale(1.1) translateY(-2.5vh)}46%{transform:scale(1.12) translateY(1vh)}54%{transform:scale(1.1) translateY(-2vh)}64%{transform:scale(1.12) translateY(.5vh)}74%{transform:scale(1.1) translateY(0)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-bubble{position:absolute;bottom:18%;width:10px;height:10px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,rgba(255,255,255,.2));box-shadow:0 0 10px rgba(255,255,255,.6);opacity:0;animation:bfAaBubble 2.4s ease-out forwards}' +
      '@keyframes bfAaBubble{0%{opacity:0;transform:translateY(0) scale(.4)}15%{opacity:.9}100%{opacity:0;transform:translateY(-58vh) translateX(var(--dx,0px)) scale(1.3)}}' +
      '.bf-aa-foam{position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;opacity:0;animation:bfAaFoam 1.6s ease-out forwards;filter:blur(1px)}' +
      '@keyframes bfAaFoam{0%{opacity:0;transform:translate(0,0) scale(.3)}25%{opacity:.9}100%{opacity:0;transform:translate(var(--dx,0px),var(--dy,0px)) scale(1.6)}}' +
      '.bf-aa-splash{position:absolute;top:40%;left:50%;width:30vmin;height:30vmin;margin:-15vmin 0 0 -15vmin;border-radius:50%;background:radial-gradient(circle,var(--aa-glow,rgba(255,255,255,.5)),transparent 60%);opacity:0;animation:bfAaSplash 1s ease-out .4s forwards;filter:blur(4px)}' +
      '@keyframes bfAaSplash{0%{opacity:0;transform:scale(.3)}30%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.6)}}',
    fxTag:
      '<div class="bf-aa-splash"></div>' +
      '<span class="bf-aa-bubble" style="left:44%;--dx:10px;animation-delay:.2s"></span><span class="bf-aa-bubble" style="left:50%;--dx:-15px;animation-delay:.5s"></span><span class="bf-aa-bubble" style="left:56%;--dx:20px;animation-delay:.8s"></span><span class="bf-aa-bubble" style="left:48%;--dx:-10px;animation-delay:1.1s"></span><span class="bf-aa-bubble" style="left:52%;--dx:15px;animation-delay:1.4s"></span><span class="bf-aa-bubble" style="left:42%;--dx:-20px;animation-delay:1.7s"></span><span class="bf-aa-bubble" style="left:58%;--dx:25px;animation-delay:2s"></span>' +
      '<span class="bf-aa-foam" style="left:46%;top:34%;--dx:-30px;--dy:-20px;animation-delay:.3s"></span><span class="bf-aa-foam" style="left:54%;top:32%;--dx:35px;--dy:-15px;animation-delay:.5s"></span><span class="bf-aa-foam" style="left:50%;top:36%;--dx:-20px;--dy:-30px;animation-delay:.7s"></span><span class="bf-aa-foam" style="left:52%;top:38%;--dx:40px;--dy:-10px;animation-delay:.9s"></span>',
  },
  // SERVIR / barista: inclinación de vertido + vapor + gotas + aroma.
  {
    id: 'serve',
    keywords: ['servir', 'sirviendo', 'cortado', 'café', 'cafe', 'barista', 'jarra', 'taza', 'latte', 'capuchino', 'espresso', 'barra', 'camarero', 'mesonero', 'verter', 'escanciar'],
    anim: 'bfAaServe',
    keyframes:
      '@keyframes bfAaServe{0%{transform:scale(.15) translateY(18vh) rotate(0);opacity:0}14%{opacity:1;transform:scale(1.1) translateY(0) rotate(0)}26%{transform:scale(1.05) translateY(-2vh) rotate(-6deg)}40%{transform:scale(1.08) translateY(0) rotate(6deg)}52%{transform:scale(1.06) translateY(-1vh) rotate(-3deg)}66%{transform:scale(1.08) translateY(0) rotate(3deg)}78%{transform:scale(1.1) translateY(0) rotate(0)}100%{transform:scale(1.2) translateY(-6vh) rotate(0);opacity:1}}',
    fxCss:
      '.bf-aa-steam{position:absolute;bottom:30%;width:24px;height:24px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.7),transparent 70%);opacity:0;animation:bfAaSteam 2.2s ease-out forwards;filter:blur(3px)}' +
      '@keyframes bfAaSteam{0%{opacity:0;transform:translateY(0) scale(.5)}20%{opacity:.7}100%{opacity:0;transform:translateY(-52vh) translateX(var(--dx,0px)) scale(2.4)}}' +
      '.bf-aa-drop{position:absolute;top:42%;width:6px;height:10px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:var(--aa-color,#fff);box-shadow:0 0 8px var(--aa-glow,#fff);opacity:0;animation:bfAaDrop 1.1s ease-in forwards}' +
      '@keyframes bfAaDrop{0%{opacity:0;transform:translate(0,0) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),40vh) scale(.6)}}' +
      '.bf-aa-aroma{position:absolute;top:20%;font-size:clamp(18px,3vw,30px);opacity:0;animation:bfAaAroma 2s ease-out forwards;filter:drop-shadow(0 0 8px var(--aa-glow,#fff))}' +
      '@keyframes bfAaAroma{0%{opacity:0;transform:translateY(0) scale(.4)}20%{opacity:.8}100%{opacity:0;transform:translateY(-40vh) scale(1.4)}}',
    fxTag:
      '<span class="bf-aa-steam" style="left:46%;--dx:-10px;animation-delay:.2s"></span><span class="bf-aa-steam" style="left:52%;--dx:15px;animation-delay:.5s"></span><span class="bf-aa-steam" style="left:48%;--dx:-20px;animation-delay:.8s"></span><span class="bf-aa-steam" style="left:54%;--dx:25px;animation-delay:1.1s"></span><span class="bf-aa-steam" style="left:50%;--dx:-5px;animation-delay:1.4s"></span>' +
      '<span class="bf-aa-drop" style="left:50%;--dx:8px;animation-delay:.3s"></span><span class="bf-aa-drop" style="left:48%;--dx:-12px;animation-delay:.5s"></span><span class="bf-aa-drop" style="left:52%;--dx:14px;animation-delay:.7s"></span><span class="bf-aa-drop" style="left:50%;--dx:6px;animation-delay:.9s"></span>' +
      '<span class="bf-aa-aroma" style="left:42%;animation-delay:.4s">☕</span><span class="bf-aa-aroma" style="left:56%;animation-delay:.8s">☕</span>',
  },
  // MAGIA / arcano: flotación con remolino + orbes + runas + espiral mística.
  {
    id: 'magic',
    keywords: ['magia', 'mágico', 'magico', 'mago', 'hechizo', 'conjuro', 'arcano', 'espectral', 'místico', 'mistico', 'sortilegio', 'encanto', 'brujería', 'hechicería', 'ritual', 'rúnico', 'runico'],
    anim: 'bfAaMagic',
    keyframes:
      '@keyframes bfAaMagic{0%{transform:scale(.1) translateY(20vh) rotateY(180deg);opacity:0}16%{opacity:1;transform:scale(1) translateY(-2vh) rotateY(-20deg)}40%{transform:scale(1.05) translateY(0) rotateY(15deg) rotate(3deg)}60%{transform:scale(1.1) translateY(-1vh) rotateY(-8deg) rotate(-2deg)}80%{transform:scale(1.15) translateY(0) rotateY(0)}100%{transform:scale(1.2) translateY(-6vh) rotateY(0);opacity:1}}',
    fxCss:
      '.bf-aa-orb{position:absolute;top:50%;left:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:radial-gradient(circle,#fff,var(--aa-color,#fff));box-shadow:0 0 18px var(--aa-color,#fff),0 0 30px var(--aa-glow,#fff);opacity:0;animation:bfAaOrb 2.6s ease-in-out forwards}' +
      '@keyframes bfAaOrb{0%{opacity:0;transform:rotate(var(--a,0deg)) translateX(0) scale(.3)}25%{opacity:1}100%{opacity:0;transform:rotate(var(--a,360deg)) translateX(32vmin) scale(1.2)}}' +
      '.bf-aa-rune{position:absolute;top:50%;left:50%;width:44vmin;height:44vmin;margin:-22vmin 0 0 -22vmin;border-radius:50%;border:2px solid var(--aa-color,#fff);box-shadow:0 0 18px var(--aa-glow,#fff),inset 0 0 18px var(--aa-glow,#fff);opacity:0;animation:bfAaRune 2.4s ease-out forwards}' +
      '@keyframes bfAaRune{0%{opacity:0;transform:scale(.2) rotate(0)}30%{opacity:.7;transform:scale(1) rotate(40deg)}100%{opacity:0;transform:scale(1.4) rotate(120deg)}}' +
      '.bf-aa-mote{position:absolute;bottom:14%;width:8px;height:8px;border-radius:50%;background:var(--aa-color,#fff);box-shadow:0 0 12px var(--aa-color,#fff);opacity:0;animation:bfAaMoteM 2.8s ease-out forwards}' +
      '@keyframes bfAaMoteM{0%{opacity:0;transform:translateY(0) scale(.3)}20%{opacity:1}100%{opacity:0;transform:translateY(-68vh) translateX(var(--dx,0px)) scale(1.3)}}',
    fxTag:
      '<div class="bf-aa-rune"></div><div class="bf-aa-rune" style="animation-delay:.4s;width:30vmin;height:30vmin;margin:-15vmin 0 0 -15vmin"></div>' +
      '<span class="bf-aa-orb" style="--a:0deg;animation-delay:.1s"></span><span class="bf-aa-orb" style="--a:90deg;animation-delay:.3s"></span><span class="bf-aa-orb" style="--a:180deg;animation-delay:.5s"></span><span class="bf-aa-orb" style="--a:270deg;animation-delay:.7s"></span><span class="bf-aa-orb" style="--a:45deg;animation-delay:.9s"></span><span class="bf-aa-orb" style="--a:225deg;animation-delay:1.1s"></span>' +
      '<span class="bf-aa-mote" style="left:20%;--dx:20px;animation-delay:.2s"></span><span class="bf-aa-mote" style="left:40%;--dx:-15px;animation-delay:.6s"></span><span class="bf-aa-mote" style="left:60%;--dx:25px;animation-delay:1s"></span><span class="bf-aa-mote" style="left:80%;--dx:-20px;animation-delay:1.4s"></span>',
  },
  // FUEGO / llamas: ascenso con calor + brasas + ráfagas de llama.
  {
    id: 'fire',
    keywords: ['fuego', 'llama', 'llamas', 'ardiente', 'quemar', 'incendio', 'flama', 'piro', 'brasas', 'arder', 'combustión', 'infierno', 'volcán', 'magma', 'calor'],
    anim: 'bfAaFire',
    keyframes:
      '@keyframes bfAaFire{0%{transform:scale(.1) translateY(30vh) scale(.1);opacity:0}16%{opacity:1;transform:scale(1.15) translateY(0)}30%{transform:scale(1.1) translateY(-3vh)}45%{transform:scale(1.12) translateY(1vh)}60%{transform:scale(1.1) translateY(-2vh)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-ember{position:absolute;bottom:8%;width:10px;height:10px;border-radius:50%;background:#ffc14a;box-shadow:0 0 14px #ff7a14,0 0 24px #ff5a14;opacity:0;animation:bfAaEmber 1.8s ease-out forwards}' +
      '@keyframes bfAaEmber{0%{opacity:0;transform:translateY(0) scale(1)}20%{opacity:1}100%{opacity:0;transform:translateY(-78vh) translateX(var(--dx,0px)) scale(.3)}}' +
      '.bf-aa-flame2{position:absolute;font-size:clamp(28px,6vw,52px);opacity:0;animation:bfAaFlame2 1.5s ease-out infinite;filter:drop-shadow(0 0 14px rgba(255,100,20,.9))}' +
      '@keyframes bfAaFlame2{0%,100%{opacity:0;transform:scale(.4) rotate(-12deg)}40%{opacity:1;transform:scale(1.2) rotate(12deg)}}' +
      '.bf-aa-heat{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 70%,rgba(255,90,20,.3),transparent 60%);opacity:0;animation:bfAaHeat 2.6s ease-out forwards}' +
      '@keyframes bfAaHeat{0%{opacity:0}30%{opacity:.6}100%{opacity:0}}',
    fxTag:
      '<div class="bf-aa-heat"></div>' +
      '<span class="bf-aa-ember" style="left:16%;--dx:20px;animation-delay:.1s"></span><span class="bf-aa-ember" style="left:32%;--dx:-30px;animation-delay:.4s"></span><span class="bf-aa-ember" style="left:48%;--dx:15px;animation-delay:.2s"></span><span class="bf-aa-ember" style="left:64%;--dx:-25px;animation-delay:.6s"></span><span class="bf-aa-ember" style="left:80%;--dx:35px;animation-delay:.3s"></span><span class="bf-aa-ember" style="left:40%;--dx:-20px;animation-delay:.9s"></span><span class="bf-aa-ember" style="left:58%;--dx:40px;animation-delay:1.2s"></span>' +
      '<span class="bf-aa-flame2" style="left:24%;bottom:22%;animation-delay:.2s">🔥</span><span class="bf-aa-flame2" style="left:48%;bottom:26%;animation-delay:.5s">🔥</span><span class="bf-aa-flame2" style="left:68%;bottom:20%;animation-delay:.8s">🔥</span><span class="bf-aa-flame2" style="left:36%;bottom:30%;animation-delay:1.1s">🔥</span>',
  },
  // HIELO / congelación: entrada cristalina + esquirlas + escarcha + copos.
  {
    id: 'ice',
    keywords: ['hielo', 'congelar', 'frío', 'frio', 'escarcha', 'nevada', 'glacial', 'gélido', 'helar', 'congelación', 'congelacion', 'nieve', 'ventisca', 'polar', 'ártico', 'artico'],
    anim: 'bfAaIce',
    keyframes:
      '@keyframes bfAaIce{0%{transform:scale(1.4) translateY(-20vh) rotateY(40deg);opacity:0;filter:blur(8px)}18%{opacity:1;transform:scale(1) translateY(0) rotateY(0);filter:blur(0)}40%{transform:scale(1.1) translateY(-1vh)}60%{transform:scale(1.05)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-shard{position:absolute;top:50%;left:50%;width:6px;height:18px;margin:-9px 0 0 -3px;background:linear-gradient(180deg,#fff,#9fd8ff);box-shadow:0 0 12px #9fd8ff;opacity:0;animation:bfAaShard 1.2s ease-out forwards;clip-path:polygon(50% 0,100% 40%,50% 100%,0 40%)}' +
      '@keyframes bfAaShard{0%{opacity:0;transform:translate(0,0) scale(.3) rotate(0)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),var(--dy,0px)) scale(1.4) rotate(var(--r,180deg))}}' +
      '.bf-aa-flake{position:absolute;font-size:clamp(18px,3vw,32px);opacity:0;animation:bfAaFlake 2.4s linear forwards;color:#cfe8ff;filter:drop-shadow(0 0 10px #9fd8ff)}' +
      '@keyframes bfAaFlake{0%{opacity:0;transform:translateY(-8vh) rotate(0) scale(.4)}15%{opacity:.9}100%{opacity:0;transform:translateY(78vh) translateX(var(--dx,0px)) rotate(360deg) scale(1.1)}}' +
      '.bf-aa-frost{position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,rgba(159,216,255,.3),transparent 65%);opacity:0;animation:bfAaFrost 2.6s ease-out forwards}' +
      '@keyframes bfAaFrost{0%{opacity:0}30%{opacity:.6}100%{opacity:0}}',
    fxTag:
      '<div class="bf-aa-frost"></div>' +
      '<span class="bf-aa-shard" style="--dx:-60px;--dy:-40px;--r:-120deg;animation-delay:.15s"></span><span class="bf-aa-shard" style="--dx:70px;--dy:-50px;--r:140deg;animation-delay:.25s"></span><span class="bf-aa-shard" style="--dx:-80px;--dy:30px;--r:200deg;animation-delay:.35s"></span><span class="bf-aa-shard" style="--dx:60px;--dy:40px;--r:-160deg;animation-delay:.45s"></span><span class="bf-aa-shard" style="--dx:0px;--dy:-70px;--r:90deg;animation-delay:.55s"></span><span class="bf-aa-shard" style="--dx:40px;--dy:-30px;--r:-90deg;animation-delay:.65s"></span>' +
      '<span class="bf-aa-flake" style="left:14%;--dx:15px;animation-delay:.2s">❄</span><span class="bf-aa-flake" style="left:30%;--dx:-20px;animation-delay:.6s">❄</span><span class="bf-aa-flake" style="left:48%;--dx:25px;animation-delay:.4s">❄</span><span class="bf-aa-flake" style="left:64%;--dx:-15px;animation-delay:.9s">❄</span><span class="bf-aa-flake" style="left:80%;--dx:20px;animation-delay:.7s">❄</span><span class="bf-aa-flake" style="left:38%;--dx:-25px;animation-delay:1.2s">❄</span>',
  },
  // RAYO / eléctrico: entrada instantánea + relámpagos + destello + crepitar.
  {
    id: 'lightning',
    keywords: ['rayo', 'trueno', 'relámpago', 'relampago', 'eléctrico', 'electrico', 'electro', 'voltio', 'fulminar', 'centella', 'tormenta', 'trueno', 'voltage'],
    anim: 'bfAaLightning',
    keyframes:
      '@keyframes bfAaLightning{0%{transform:scale(1.6) translateY(10vh);opacity:0;filter:blur(20px) brightness(3)}10%{opacity:1;transform:scale(1) translateY(0);filter:blur(0) brightness(1.2)}22%{transform:scale(1.1) translateY(-2vh)}34%{transform:scale(1) translateY(0)}48%{transform:scale(1.08)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-bolt{position:absolute;width:5px;background:linear-gradient(180deg,#fff,#7ec8ff);box-shadow:0 0 16px #7ec8ff,0 0 28px #fff;clip-path:polygon(55% 0,80% 30%,40% 55%,70% 80%,30% 100%,20% 60%,60% 40%,25% 20%);opacity:0;animation:bfAaBolt .5s ease-out forwards}' +
      '@keyframes bfAaBolt{0%,100%{opacity:0}40%{opacity:1}}' +
      '.bf-aa-arc2{position:absolute;width:4px;background:linear-gradient(180deg,#fff,#5ab8ff);box-shadow:0 0 14px #5ab8ff;clip-path:polygon(60% 0,85% 25%,40% 50%,70% 78%,30% 100%,22% 78%,55% 50%,25% 25%);opacity:0;animation:bfAaArc2 .55s ease-out infinite}' +
      '@keyframes bfAaArc2{0%,100%{opacity:0}45%{opacity:1}}' +
      '.bf-aa-zap-flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,255,255,.95),transparent 55%);opacity:0;animation:bfAaZapFlash .8s ease-out .15s forwards}' +
      '@keyframes bfAaZapFlash{0%{opacity:0}25%{opacity:.9}100%{opacity:0}}' +
      '.bf-aa-spark3{position:absolute;width:5px;height:5px;border-radius:50%;background:#fff;box-shadow:0 0 12px #7ec8ff;opacity:0;animation:bfAaSpark3 .8s ease-out forwards}' +
      '@keyframes bfAaSpark3{0%{opacity:0;transform:translate(0,0) scale(.3)}30%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),var(--dy,0px)) scale(1.5)}}',
    fxTag:
      '<div class="bf-aa-zap-flash"></div>' +
      '<div class="bf-aa-bolt" style="top:0%;left:30%;height:60vh;animation-delay:.15s"></div><div class="bf-aa-bolt" style="top:0%;left:60%;height:55vh;animation-delay:.35s"></div><div class="bf-aa-bolt" style="top:10%;left:45%;height:50vh;animation-delay:.55s"></div>' +
      '<div class="bf-aa-arc2" style="top:30%;left:20%;height:80px;animation-delay:.3s"></div><div class="bf-aa-arc2" style="top:40%;left:72%;height:70px;animation-delay:.5s"></div><div class="bf-aa-arc2" style="top:55%;left:38%;height:90px;animation-delay:.7s"></div>' +
      '<span class="bf-aa-spark3" style="top:45%;left:45%;--dx:-40px;--dy:-30px;animation-delay:.2s"></span><span class="bf-aa-spark3" style="top:48%;left:52%;--dx:50px;--dy:-20px;animation-delay:.4s"></span><span class="bf-aa-spark3" style="top:42%;left:50%;--dx:-30px;--dy:40px;animation-delay:.6s"></span><span class="bf-aa-spark3" style="top:46%;left:48%;--dx:45px;--dy:35px;animation-delay:.8s"></span>',
  },
  // BAILAR / danza: giro rítmico + puntos + luces de discoteca + notas.
  {
    id: 'dance',
    keywords: ['bailar', 'baile', 'danza', 'dance', 'rumba', 'salsa', 'groove', 'perreo', 'breaker', 'bailarín', 'bailarin', 'coreografía', 'coreografia', 'discoteca', 'fiesta', 'festejar'],
    anim: 'bfAaDance',
    keyframes:
      '@keyframes bfAaDance{0%{transform:scale(.1) translateY(20vh) rotate(0);opacity:0}16%{opacity:1;transform:scale(1.1) translateY(0) rotate(0)}26%{transform:scale(1.08) translateY(-2vh) rotate(8deg)}36%{transform:scale(1.1) translateY(0) rotate(-8deg)}46%{transform:scale(1.08) translateY(-2vh) rotate(6deg)}56%{transform:scale(1.1) translateY(0) rotate(-6deg)}66%{transform:scale(1.08) translateY(-1vh) rotate(4deg)}78%{transform:scale(1.1) translateY(0) rotate(0)}100%{transform:scale(1.2) translateY(-6vh) rotate(0);opacity:1}}',
    fxCss:
      '.bf-aa-beat{position:absolute;top:50%;left:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--aa-color,#fff);box-shadow:0 0 16px var(--aa-color,#fff);opacity:0;animation:bfAaBeat 1.6s ease-out forwards}' +
      '@keyframes bfAaBeat{0%{opacity:0;transform:rotate(var(--a,0deg)) translateX(8vmin) scale(.3)}30%{opacity:1}100%{opacity:0;transform:rotate(var(--a,360deg)) translateX(40vmin) scale(1.4)}}' +
      '.bf-aa-disco{position:absolute;top:0;width:22vw;height:100vh;background:linear-gradient(180deg,var(--aa-color,#fff),transparent 65%);opacity:0;mix-blend-mode:screen;filter:blur(8px);animation:bfAaDisco 1.4s ease-in-out infinite;transform-origin:top center}' +
      '@keyframes bfAaDisco{0%,100%{opacity:0;transform:rotate(-22deg)}50%{opacity:.6;transform:rotate(22deg)}}' +
      '.bf-aa-note{position:absolute;top:-10%;color:var(--aa-color,#fff);font-size:clamp(20px,4vw,40px);opacity:0;animation:bfAaNoteD 2s linear forwards;text-shadow:0 0 14px var(--aa-glow,#fff);line-height:1}' +
      '@keyframes bfAaNoteD{0%{opacity:0;transform:translateY(-8vh) rotate(-18deg)}12%{opacity:1}80%{opacity:.9}100%{opacity:0;transform:translateY(92vh) rotate(22deg)}}',
    fxTag:
      '<div class="bf-aa-disco" style="left:12%;animation-delay:0s"></div><div class="bf-aa-disco" style="left:66%;animation-delay:.4s"></div><div class="bf-aa-disco" style="left:40%;animation-delay:.8s"></div>' +
      '<span class="bf-aa-beat" style="--a:0deg;animation-delay:.1s"></span><span class="bf-aa-beat" style="--a:72deg;animation-delay:.3s"></span><span class="bf-aa-beat" style="--a:144deg;animation-delay:.5s"></span><span class="bf-aa-beat" style="--a:216deg;animation-delay:.7s"></span><span class="bf-aa-beat" style="--a:288deg;animation-delay:.9s"></span>' +
      '<span class="bf-aa-note" style="left:20%;animation-delay:.2s">🎵</span><span class="bf-aa-note" style="left:36%;animation-delay:.5s">🎶</span><span class="bf-aa-note" style="left:56%;animation-delay:.8s">🎵</span><span class="bf-aa-note" style="left:74%;animation-delay:1.1s">🎶</span>',
  },
  // COMER / masticar / chicle / helado / chupachup: bote de masticar + migas + motas de sabor.
  {
    id: 'eat',
    keywords: ['comer', 'comiendo', 'masticar', 'masticando', 'galleta', 'galletas', 'chicle', 'mascar', 'mordisco', 'morder', 'tragar', 'devorar', 'helado', 'chupa-chup', 'chupachup', 'caramelo', 'bombón', 'bocadillo', 'bocata', 'emparedado', 'comida', 'alimento', 'merendar', 'tentempi', 'aperitivo', 'picar'],
    anim: 'bfAaEat',
    keyframes:
      '@keyframes bfAaEat{0%{transform:scale(.12) translateY(22vh);opacity:0}14%{opacity:1;transform:scale(1.12) translateY(0)}24%{transform:scale(1.08) translateY(-1.5vh)}32%{transform:scale(1.12) translateY(.5vh)}40%{transform:scale(1.08) translateY(-1.5vh)}48%{transform:scale(1.12) translateY(.5vh)}56%{transform:scale(1.08) translateY(-1vh)}66%{transform:scale(1.1) translateY(0)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-crumb{position:absolute;width:7px;height:7px;border-radius:2px;background:linear-gradient(180deg,#f3d9a0,#b88a3e);box-shadow:0 0 8px rgba(200,160,80,.7);opacity:0;animation:bfAaCrumb 1.3s ease-out forwards}' +
      '@keyframes bfAaCrumb{0%{opacity:0;transform:translate(0,0) scale(.4) rotate(0)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),45vh) scale(1) rotate(var(--r,360deg))}}' +
      '.bf-aa-flav{position:absolute;top:30%;width:10px;height:10px;border-radius:50%;background:var(--aa-color,#fff);box-shadow:0 0 14px var(--aa-glow,#fff);opacity:0;animation:bfAaFlav 2.2s ease-out forwards}' +
      '@keyframes bfAaFlav{0%{opacity:0;transform:translateY(0) scale(.3)}18%{opacity:.9}100%{opacity:0;transform:translateY(-58vh) translateX(var(--dx,0px)) scale(1.4)}}' +
      '.bf-aa-chomp{position:absolute;top:46%;left:50%;width:36vmin;height:36vmin;margin:-18vmin 0 0 -18vmin;border-radius:50%;background:radial-gradient(circle,var(--aa-glow,rgba(255,255,255,.5)),transparent 62%);opacity:0;animation:bfAaChomp 1.4s ease-out .2s forwards;filter:blur(4px)}' +
      '@keyframes bfAaChomp{0%{opacity:0;transform:scale(.3)}30%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}',
    fxTag:
      '<div class="bf-aa-chomp"></div>' +
      '<span class="bf-aa-crumb" style="left:40%;top:34%;--dx:-30px;--r:-220deg;animation-delay:.2s"></span><span class="bf-aa-crumb" style="left:54%;top:36%;--dx:40px;--r:240deg;animation-delay:.3s"></span><span class="bf-aa-crumb" style="left:48%;top:32%;--dx:-45px;--r:180deg;animation-delay:.5s"></span><span class="bf-aa-crumb" style="left:52%;top:38%;--dx:35px;--r:-260deg;animation-delay:.6s"></span><span class="bf-aa-crumb" style="left:46%;top:36%;--dx:50px;--r:300deg;animation-delay:.8s"></span><span class="bf-aa-crumb" style="left:50%;top:34%;--dx:-25px;--r:-180deg;animation-delay:1s"></span><span class="bf-aa-crumb" style="left:44%;top:38%;--dx:45px;--r:220deg;animation-delay:1.2s"></span><span class="bf-aa-crumb" style="left:56%;top:32%;--dx:-50px;--r:-240deg;animation-delay:1.4s"></span>' +
      '<span class="bf-aa-flav" style="left:38%;--dx:18px;animation-delay:.3s"></span><span class="bf-aa-flav" style="left:52%;--dx:-22px;animation-delay:.6s"></span><span class="bf-aa-flav" style="left:62%;--dx:25px;animation-delay:.9s"></span><span class="bf-aa-flav" style="left:30%;--dx:-15px;animation-delay:1.2s"></span>',
  },
  // FUMAR / tabaco / cigarro / vape: calar + exhalar anillos de humo + ceniza.
  {
    id: 'smoke',
    keywords: ['fumar', 'fumando', 'tabaco', 'humo', 'cigarro', 'cigarrillo', 'purito', 'puro', 'pipa', 'vape', 'vaporizador', 'calar', 'calada', 'porro', 'maría', 'mota', 'cachimba', 'shisha', 'narguile', 'boquita'],
    anim: 'bfAaSmoke',
    keyframes:
      '@keyframes bfAaSmoke{0%{transform:scale(.15) translateY(16vh) rotate(-2deg);opacity:0}14%{opacity:1;transform:scale(1.1) translateY(0) rotate(0)}24%{transform:scale(1.08) translateY(-2vh) rotate(-1deg)}34%{transform:scale(1.12) translateY(.5vh) rotate(1deg)}44%{transform:scale(1.08) translateY(-1vh) rotate(-1deg)}54%{transform:scale(1.1) translateY(0) rotate(0)}100%{transform:scale(1.2) translateY(-6vh) rotate(0);opacity:1}}',
    fxCss:
      '.bf-aa-puff{position:absolute;top:28%;width:34px;height:34px;border-radius:50%;background:radial-gradient(circle,rgba(200,200,210,.85),transparent 70%);opacity:0;animation:bfAaPuff 2.4s ease-out forwards;filter:blur(6px)}' +
      '@keyframes bfAaPuff{0%{opacity:0;transform:translate(0,0) scale(.4)}18%{opacity:.8}100%{opacity:0;transform:translate(var(--dx,0px),-62vh) scale(3)}}' +
      '.bf-aa-ring2{position:absolute;top:32%;left:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:3px solid rgba(210,210,220,.9);box-shadow:0 0 14px rgba(180,180,200,.6);opacity:0;animation:bfAaRing2 2s ease-out forwards}' +
      '@keyframes bfAaRing2{0%{opacity:0;transform:translate(0,0) scale(.3)}20%{opacity:.9}100%{opacity:0;transform:translate(var(--dx,0px),-50vh) scale(3.4)}}' +
      '.bf-aa-ash{position:absolute;width:4px;height:4px;border-radius:50%;background:#888;box-shadow:0 0 6px rgba(255,120,40,.8);opacity:0;animation:bfAaAsh 1.1s ease-in forwards}' +
      '@keyframes bfAaAsh{0%{opacity:0;transform:translate(0,0) scale(.5)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),38vh) scale(.4) rotate(180deg)}}',
    fxTag:
      '<span class="bf-aa-puff" style="left:46%;--dx:-15px;animation-delay:.2s"></span><span class="bf-aa-puff" style="left:54%;--dx:20px;animation-delay:.5s"></span><span class="bf-aa-puff" style="left:48%;--dx:-25px;animation-delay:.9s"></span><span class="bf-aa-puff" style="left:52%;--dx:30px;animation-delay:1.3s"></span>' +
      '<span class="bf-aa-ring2" style="--dx:-20px;animation-delay:.4s"></span><span class="bf-aa-ring2" style="--dx:25px;animation-delay:.9s"></span><span class="bf-aa-ring2" style="--dx:-10px;animation-delay:1.4s"></span>' +
      '<span class="bf-aa-ash" style="left:50%;top:24%;--dx:8px;animation-delay:.3s"></span><span class="bf-aa-ash" style="left:48%;top:26%;--dx:-12px;animation-delay:.6s"></span><span class="bf-aa-ash" style="left:52%;top:22%;--dx:14px;animation-delay:.9s"></span><span class="bf-aa-ash" style="left:50%;top:28%;--dx:-6px;animation-delay:1.2s"></span>',
  },
  // ATERRIZAJE HEROICO / épico: caída + grieta en el suelo + polvo + esquirlas.
  {
    id: 'heroic',
    keywords: ['saltar', 'salto', 'aterrizar', 'aterrizaje', 'heroico', 'héroe', 'caer', 'impacto', 'legendario', 'épico', 'epico', 'mitológico', 'mitologico', 'titán', 'titan', 'coloso', 'gigante', 'aplastar'],
    anim: 'bfAaHeroic',
    keyframes:
      '@keyframes bfAaHeroic{0%{transform:scale(.4) translateY(-50vh) rotate(-2deg);opacity:0}16%{opacity:1;transform:scale(1.2) translateY(0) rotate(0)}30%{transform:scale(.9) translateY(4vh)}45%{transform:scale(1.1) translateY(0)}100%{transform:scale(1.2) translateY(-6vh);opacity:1}}',
    fxCss:
      '.bf-aa-crack{position:absolute;bottom:14%;left:50%;width:70vmin;height:30vmin;margin:0 0 0 -35vmin;border-radius:50%;border:4px solid var(--aa-color,#fff);box-shadow:0 0 22px var(--aa-glow,#fff);opacity:0;animation:bfAaCrack .9s ease-out .25s forwards;clip-path:polygon(50% 40%,60% 50%,70% 42%,80% 52%,90% 45%,100% 50%,100% 55%,90% 55%,80% 60%,70% 52%,60% 58%,50% 55%,40% 58%,30% 52%,20% 60%,10% 55%,0 55%,0 50%,10% 45%,20% 52%,30% 42%,40% 50%)}}' +
      '@keyframes bfAaCrack{0%{opacity:0;transform:scale(.2)}40%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.3)}}' +
      '.bf-aa-dust2{position:absolute;bottom:18%;width:24px;height:8px;border-radius:50%;background:radial-gradient(circle,#c9b896,transparent 70%);opacity:0;animation:bfAaDust2 1.4s ease-out .25s forwards;filter:blur(2px)}' +
      '@keyframes bfAaDust2{0%{opacity:0;transform:translate(0,0) scale(.3)}25%{opacity:.8}100%{opacity:0;transform:translate(var(--dx,0px),0) scale(2.4)}}' +
      '.bf-aa-debris{position:absolute;bottom:20%;width:8px;height:8px;border-radius:2px;background:var(--aa-color,#fff);box-shadow:0 0 10px var(--aa-glow,#fff);opacity:0;animation:bfAaDebris 1.2s ease-out .3s forwards}' +
      '@keyframes bfAaDebris{0%{opacity:0;transform:translate(0,0) scale(.4)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),var(--dy,0px)) scale(1) rotate(360deg)}}',
    fxTag:
      '<div class="bf-aa-crack"></div>' +
      '<span class="bf-aa-dust2" style="left:42%;--dx:-80px;animation-delay:.2s"></span><span class="bf-aa-dust2" style="left:50%;--dx:90px;animation-delay:.25s"></span><span class="bf-aa-dust2" style="left:46%;--dx:-110px;animation-delay:.35s"></span><span class="bf-aa-dust2" style="left:54%;--dx:120px;animation-delay:.4s"></span>' +
      '<span class="bf-aa-debris" style="left:44%;--dx:-60px;--dy:-80px;animation-delay:.3s"></span><span class="bf-aa-debris" style="left:56%;--dx:70px;--dy:-90px;animation-delay:.35s"></span><span class="bf-aa-debris" style="left:50%;--dx:-40px;--dy:-100px;animation-delay:.4s"></span><span class="bf-aa-debris" style="left:48%;--dx:50px;--dy:-70px;animation-delay:.45s"></span><span class="bf-aa-debris" style="left:52%;--dx:30px;--dy:-110px;animation-delay:.5s"></span>',
  },
  // VOLAR: cruza toda la pantalla de lado a lado planeando, con estelas de
  // viento y plumas/motas de velocidad.
  {
    id: 'fly',
    keywords: ['volar', 'volando', 'vuelo', 'alas', 'aletear', 'planear', 'fly', 'flying', 'ave', 'pájaro', 'pajaro', 'dragón', 'dragon', 'murciélago', 'murcielago'],
    anim: 'bfAaFly',
    keyframes:
      '@keyframes bfAaFly{0%{transform:translate(-70vw,18vh) rotate(-14deg) scale(.5);opacity:0}12%{opacity:1}30%{transform:translate(-20vw,-10vh) rotate(8deg) scale(.85)}50%{transform:translate(25vw,10vh) rotate(-10deg) scale(1.05)}70%{transform:translate(-10vw,-6vh) rotate(6deg) scale(1.15)}88%{transform:translate(6vw,2vh) rotate(-3deg) scale(1.2)}100%{transform:translate(0,-8vh) rotate(0) scale(1.25);opacity:1}}',
    fxCss:
      '.bf-aa-wind{position:absolute;height:4px;width:34vw;background:linear-gradient(90deg,transparent,var(--aa-color,#fff),transparent);border-radius:4px;filter:drop-shadow(0 0 10px var(--aa-glow,#fff));opacity:0;animation:bfAaWind 1.4s ease-out forwards}' +
      '@keyframes bfAaWind{0%{opacity:0;transform:translateX(-40vw) scaleX(.3)}30%{opacity:.9}100%{opacity:0;transform:translateX(60vw) scaleX(1.3)}}' +
      '.bf-aa-feather{position:absolute;width:9px;height:16px;border-radius:60% 40% 60% 40%;background:linear-gradient(180deg,#fff,var(--aa-color,#fff));box-shadow:0 0 10px var(--aa-glow,#fff);opacity:0;animation:bfAaFeather 2.2s ease-in-out forwards}' +
      '@keyframes bfAaFeather{0%{opacity:0;transform:translate(0,0) rotate(0) scale(.5)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx,40px),52vh) rotate(320deg) scale(1)}}',
    fxTag:
      '<div class="bf-aa-wind" style="top:32%;animation-delay:.1s"></div><div class="bf-aa-wind" style="top:48%;animation-delay:.45s"></div><div class="bf-aa-wind" style="top:62%;animation-delay:.8s"></div><div class="bf-aa-wind" style="top:40%;animation-delay:1.15s"></div>' +
      '<span class="bf-aa-feather" style="left:30%;top:34%;--dx:-60px;animation-delay:.3s"></span><span class="bf-aa-feather" style="left:52%;top:30%;--dx:70px;animation-delay:.6s"></span><span class="bf-aa-feather" style="left:66%;top:38%;--dx:-40px;animation-delay:.9s"></span><span class="bf-aa-feather" style="left:44%;top:42%;--dx:55px;animation-delay:1.2s"></span>',
  },
  // GIRAR / pirueta: vueltas completas sobre sí mismo con estelas circulares.
  {
    id: 'spin',
    keywords: ['girar', 'giro', 'rotar', 'rotación', 'rotacion', 'vueltas', 'dar vueltas', 'pirueta', 'spin', 'twirl', 'remolino', 'torbellino corto', 'voltereta'],
    anim: 'bfAaSpin',
    keyframes:
      '@keyframes bfAaSpin{0%{transform:scale(.2) rotate(0) rotateY(0);opacity:0}14%{opacity:1;transform:scale(1) rotate(180deg) rotateY(180deg)}40%{transform:scale(1.12) rotate(540deg) rotateY(360deg)}66%{transform:scale(1.15) rotate(900deg) rotateY(540deg)}86%{transform:scale(1.2) rotate(1080deg) rotateY(720deg)}100%{transform:scale(1.25) rotate(1080deg) rotateY(720deg) translateY(-8vh);opacity:1}}',
    fxCss:
      '.bf-aa-swirl{position:absolute;top:50%;left:50%;width:56vmin;height:56vmin;margin:-28vmin 0 0 -28vmin;border-radius:50%;border:3px dashed var(--aa-color,#fff);box-shadow:0 0 20px var(--aa-glow,#fff);opacity:0;animation:bfAaSwirl 2.4s linear forwards}' +
      '@keyframes bfAaSwirl{0%{opacity:0;transform:scale(.3) rotate(0)}25%{opacity:.8}100%{opacity:0;transform:scale(1.5) rotate(720deg)}}' +
      '.bf-aa-trailmote{position:absolute;top:50%;left:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:var(--aa-color,#fff);box-shadow:0 0 14px var(--aa-glow,#fff);opacity:0;animation:bfAaTrailMote 2.2s linear forwards}' +
      '@keyframes bfAaTrailMote{0%{opacity:0;transform:rotate(var(--a,0deg)) translateX(10vmin) scale(.4)}25%{opacity:1}100%{opacity:0;transform:rotate(calc(var(--a,0deg) + 720deg)) translateX(38vmin) scale(1.2)}}',
    fxTag:
      '<div class="bf-aa-swirl"></div><div class="bf-aa-swirl" style="width:34vmin;height:34vmin;margin:-17vmin 0 0 -17vmin;animation-delay:.4s"></div>' +
      '<span class="bf-aa-trailmote" style="--a:0deg;animation-delay:.1s"></span><span class="bf-aa-trailmote" style="--a:60deg;animation-delay:.3s"></span><span class="bf-aa-trailmote" style="--a:120deg;animation-delay:.5s"></span><span class="bf-aa-trailmote" style="--a:180deg;animation-delay:.7s"></span><span class="bf-aa-trailmote" style="--a:240deg;animation-delay:.9s"></span><span class="bf-aa-trailmote" style="--a:300deg;animation-delay:1.1s"></span>',
  },
  // CABEZAZO / embestida: carga contra la cámara dando dos testarazos secos.
  {
    id: 'headbutt',
    keywords: ['cabezazo', 'cabezazos', 'testarazo', 'topetazo', 'embestida', 'embestir', 'cornada', 'cornear', 'placaje', 'headbutt', 'charge', 'arremeter', 'topar'],
    anim: 'bfAaHeadbutt',
    keyframes:
      '@keyframes bfAaHeadbutt{0%{transform:translateZ(-800px) scale(.3) rotate(-6deg);opacity:0}14%{opacity:1;transform:translateZ(-200px) scale(.8) rotate(4deg)}28%{transform:translateZ(120px) scale(1.45) rotate(-8deg) translateY(3vh)}38%{transform:translateZ(-80px) scale(1) rotate(6deg) translateY(-2vh)}52%{transform:translateZ(140px) scale(1.5) rotate(-10deg) translateY(4vh)}62%{transform:translateZ(-60px) scale(1.05) rotate(5deg)}76%{transform:translateZ(0) scale(1.2) rotate(-2deg)}100%{transform:translateZ(0) scale(1.25) translateY(-8vh) rotate(0);opacity:1}}',
    fxCss:
      '.bf-aa-thud{position:absolute;top:46%;left:50%;width:44vmin;height:44vmin;margin:-22vmin 0 0 -22vmin;border-radius:50%;border:6px solid var(--aa-color,#fff);box-shadow:0 0 26px var(--aa-glow,#fff);opacity:0;animation:bfAaThud .6s ease-out forwards}' +
      '@keyframes bfAaThud{0%{opacity:0;transform:scale(.2)}35%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.8)}}' +
      '.bf-aa-star{position:absolute;font-size:clamp(22px,5vw,44px);opacity:0;animation:bfAaStar 1.1s ease-out forwards;filter:drop-shadow(0 0 12px var(--aa-glow,#fff))}' +
      '@keyframes bfAaStar{0%{opacity:0;transform:translate(0,0) scale(.3) rotate(0)}30%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),var(--dy,-40px)) scale(1.2) rotate(220deg)}}',
    fxTag:
      '<div class="bf-aa-thud" style="animation-delay:.26s"></div><div class="bf-aa-thud" style="animation-delay:.5s"></div>' +
      '<span class="bf-aa-star" style="left:40%;top:38%;--dx:-60px;--dy:-50px;animation-delay:.3s">✦</span><span class="bf-aa-star" style="left:56%;top:36%;--dx:70px;--dy:-40px;animation-delay:.36s">✦</span><span class="bf-aa-star" style="left:48%;top:34%;--dx:-20px;--dy:-70px;animation-delay:.54s">✦</span><span class="bf-aa-star" style="left:52%;top:40%;--dx:50px;--dy:-60px;animation-delay:.6s">✦</span>',
  },
  // RECORRER TODA LA PANTALLA: rebota por las cuatro esquinas antes de plantarse.
  {
    id: 'roam',
    keywords: ['recorrer', 'toda la pantalla', 'cruzar la pantalla', 'de lado a lado', 'rebotar', 'rebote', 'caos', 'frenético por la pantalla', 'zigzag'],
    anim: 'bfAaRoam',
    keyframes:
      '@keyframes bfAaRoam{0%{transform:translate(-60vw,-30vh) scale(.35) rotate(-20deg);opacity:0}10%{opacity:1}24%{transform:translate(30vw,-26vh) scale(.6) rotate(18deg)}40%{transform:translate(34vw,24vh) scale(.8) rotate(-14deg)}56%{transform:translate(-32vw,26vh) scale(.95) rotate(12deg)}72%{transform:translate(-28vw,-18vh) scale(1.05) rotate(-8deg)}86%{transform:translate(6vw,4vh) scale(1.18) rotate(4deg)}100%{transform:translate(0,-8vh) scale(1.25) rotate(0);opacity:1}}',
    fxCss:
      '.bf-aa-dash{position:absolute;height:5px;width:26vw;background:linear-gradient(90deg,transparent,#fff,var(--aa-color,#fff),transparent);border-radius:5px;filter:drop-shadow(0 0 12px var(--aa-glow,#fff));opacity:0;animation:bfAaDash 1s ease-out forwards}' +
      '@keyframes bfAaDash{0%{opacity:0;transform:translateX(var(--from,-30vw)) scaleX(.2)}35%{opacity:1}100%{opacity:0;transform:translateX(var(--to,30vw)) scaleX(1.3)}}' +
      '.bf-aa-ghost{position:absolute;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle,#fff,var(--aa-color,#fff));box-shadow:0 0 18px var(--aa-glow,#fff);opacity:0;animation:bfAaGhost 1.2s ease-out forwards}' +
      '@keyframes bfAaGhost{0%{opacity:0;transform:scale(.3)}25%{opacity:.9;transform:scale(1.1)}100%{opacity:0;transform:scale(1.9)}}',
    fxTag:
      '<div class="bf-aa-dash" style="top:24%;--from:-40vw;--to:40vw;animation-delay:.15s"></div><div class="bf-aa-dash" style="top:70%;--from:40vw;--to:-40vw;animation-delay:.55s"></div><div class="bf-aa-dash" style="top:44%;--from:-30vw;--to:34vw;animation-delay:.95s"></div>' +
      '<span class="bf-aa-ghost" style="left:22%;top:26%;animation-delay:.2s"></span><span class="bf-aa-ghost" style="left:74%;top:28%;animation-delay:.45s"></span><span class="bf-aa-ghost" style="left:76%;top:70%;animation-delay:.7s"></span><span class="bf-aa-ghost" style="left:22%;top:72%;animation-delay:.95s"></span>',
  },
  // TORNADO: sube girando como un torbellino con conos de viento y escombros.
  {
    id: 'tornado',
    keywords: ['tornado', 'torbellino', 'ciclón', 'ciclon', 'huracán', 'huracan', 'vórtice', 'vortice', 'tromba', 'viento'],
    anim: 'bfAaTornado',
    keyframes:
      '@keyframes bfAaTornado{0%{transform:translateY(30vh) scale(.2) rotate(0);opacity:0}12%{opacity:1}34%{transform:translateY(8vh) scale(.8) rotate(540deg)}56%{transform:translateY(-2vh) scale(1.05) rotate(1080deg)}78%{transform:translateY(-5vh) scale(1.18) rotate(1440deg)}100%{transform:translateY(-8vh) scale(1.25) rotate(1440deg);opacity:1}}',
    fxCss:
      '.bf-aa-vortex{position:absolute;top:50%;left:50%;border-radius:50%;border:3px solid var(--aa-color,#fff);box-shadow:0 0 18px var(--aa-glow,#fff);opacity:0;animation:bfAaVortex 2.4s linear forwards}' +
      '@keyframes bfAaVortex{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(0)}25%{opacity:.75}100%{opacity:0;transform:translate(-50%,-50%) scale(1.6) rotate(900deg)}}' +
      '.bf-aa-debris2{position:absolute;width:9px;height:9px;border-radius:2px;background:var(--aa-color,#fff);box-shadow:0 0 12px var(--aa-glow,#fff);opacity:0;animation:bfAaDebris2 2s linear forwards}' +
      '@keyframes bfAaDebris2{0%{opacity:0;transform:translateY(0) rotate(var(--a,0deg)) translateX(14vmin) scale(.4)}20%{opacity:1}100%{opacity:0;transform:translateY(-60vh) rotate(calc(var(--a,0deg) + 900deg)) translateX(26vmin) scale(1.1)}}',
    fxTag:
      '<div class="bf-aa-vortex" style="width:30vmin;height:30vmin;animation-delay:.1s"></div><div class="bf-aa-vortex" style="width:46vmin;height:46vmin;animation-delay:.4s"></div><div class="bf-aa-vortex" style="width:62vmin;height:62vmin;animation-delay:.7s"></div>' +
      '<span class="bf-aa-debris2" style="left:46%;bottom:16%;--a:0deg;animation-delay:.2s"></span><span class="bf-aa-debris2" style="left:52%;bottom:14%;--a:90deg;animation-delay:.45s"></span><span class="bf-aa-debris2" style="left:48%;bottom:18%;--a:180deg;animation-delay:.7s"></span><span class="bf-aa-debris2" style="left:54%;bottom:12%;--a:270deg;animation-delay:.95s"></span><span class="bf-aa-debris2" style="left:44%;bottom:20%;--a:45deg;animation-delay:1.2s"></span>',
  },
  // TELEPORT: aparece y desaparece a saltos por la pantalla hasta materializarse.
  {
    id: 'teleport',
    keywords: ['teleport', 'teletransport', 'parpadeo', 'desvanecer', 'aparecer', 'sombra', 'blink', 'fantasma', 'espectro', 'invisible'],
    anim: 'bfAaTeleport',
    keyframes:
      '@keyframes bfAaTeleport{0%{transform:translate(-30vw,-16vh) scale(.5);opacity:0;filter:blur(10px)}8%{opacity:1;filter:blur(0)}16%{opacity:1}20%{opacity:0;transform:translate(-30vw,-16vh) scale(.6)}24%{opacity:0;transform:translate(28vw,12vh) scale(.7)}30%{opacity:1;transform:translate(28vw,12vh) scale(.8)}42%{opacity:1}46%{opacity:0;transform:translate(28vw,12vh) scale(.9)}50%{opacity:0;transform:translate(-18vw,14vh) scale(1)}58%{opacity:1;transform:translate(-18vw,14vh) scale(1.05)}70%{opacity:1}74%{opacity:0;transform:translate(-18vw,14vh) scale(1.1)}80%{opacity:0;transform:translate(0,0) scale(1.15)}88%{opacity:1;transform:translate(0,-4vh) scale(1.22)}100%{opacity:1;transform:translate(0,-8vh) scale(1.25)}}',
    fxCss:
      '.bf-aa-blink{position:absolute;width:26vmin;height:26vmin;margin:-13vmin 0 0 -13vmin;border-radius:50%;background:radial-gradient(circle,var(--aa-glow,rgba(255,255,255,.6)),transparent 62%);opacity:0;animation:bfAaBlink .8s ease-out forwards;filter:blur(3px)}' +
      '@keyframes bfAaBlink{0%{opacity:0;transform:scale(.2)}35%{opacity:.9;transform:scale(1.1)}100%{opacity:0;transform:scale(1.7)}}' +
      '.bf-aa-glitch{position:absolute;height:3px;width:30vw;background:linear-gradient(90deg,transparent,var(--aa-color,#fff),transparent);opacity:0;animation:bfAaGlitch .5s steps(3) forwards;filter:drop-shadow(0 0 10px var(--aa-glow,#fff))}' +
      '@keyframes bfAaGlitch{0%,100%{opacity:0}50%{opacity:1}}',
    fxTag:
      '<div class="bf-aa-blink" style="left:20%;top:34%;animation-delay:.1s"></div><div class="bf-aa-blink" style="left:78%;top:62%;animation-delay:.75s"></div><div class="bf-aa-blink" style="left:32%;top:64%;animation-delay:1.5s"></div><div class="bf-aa-blink" style="left:50%;top:50%;animation-delay:2.3s"></div>' +
      '<div class="bf-aa-glitch" style="left:14%;top:40%;animation-delay:.3s"></div><div class="bf-aa-glitch" style="left:52%;top:56%;animation-delay:1.1s"></div><div class="bf-aa-glitch" style="left:26%;top:48%;animation-delay:1.9s"></div>',
  },
  DEFAULT_MOTION,
];

// Etiquetas en español para el selector del editor (backoffice).
export const MOTION_LABELS = {
  auto: '🎲 Automático (según la descripción)',
  default: '✨ Entrada 3D clásica',
  fly: '🕊️ Volar cruzando la pantalla',
  spin: '🌀 Girar / dar vueltas',
  headbutt: '🐏 Cabezazos / embestida',
  roam: '💨 Recorrer toda la pantalla',
  tornado: '🌪️ Tornado ascendente',
  teleport: '👻 Teletransporte / parpadeo',
  heroic: '💥 Salto y aterrizaje épico',
  bicycle: '⚽ Chilena / remate',
  slash: '⚔️ Tajo de espada',
  shoot: '🔫 Disparo con fogonazo',
  shotgun: '💣 Escopetazo',
  rapid: '🔥 Ráfaga automática',
  slingshot: '🎯 Tirachinas',
  sweep: '🧹 Barrido de escoba',
  headbang: '🤘 Headbanging metalero',
  drink: '🍺 Beber / brindar',
  serve: '☕ Servir bebida',
  eat: '🍪 Comer / masticar',
  smoke: '🚬 Fumar',
  magic: '🔮 Magia arcana',
  fire: '🔥 Fuego',
  ice: '❄️ Hielo',
  lightning: '⚡ Rayo',
  dance: '🕺 Bailar',
};

// Orden en el que se muestran en el selector.
export const MOTION_OPTIONS = ['auto', ...Object.keys(MOTION_LABELS).filter((k) => k !== 'auto')];

export function getMotionById(id) {
  if (!id || id === 'auto') return null;
  return MOTIONS.find((m) => m.id === id) || null;
}

// CSS completo (keyframes + clases de FX) de todas las variantes, para inyectar
// en un <style> tanto en el juego como en la vista previa.
export const ALL_MOTION_CSS = MOTIONS.map((m) => m.keyframes + m.fxCss).join('');

// Versión mínima (id + keywords + anim + fxTag) serializada como JSON para
// inyectar el picker dentro del script del iframe del juego.
export const MOTIONS_MIN_JSON = JSON.stringify(
  MOTIONS.map((m) => ({ id: m.id, keywords: m.keywords, anim: m.anim, fxTag: m.fxTag }))
);

export function pickMotion(desc, motionId) {
  const forced = getMotionById(motionId);
  if (forced) return forced;
  const d = String(desc || '').toLowerCase();
  if (!d) return DEFAULT_MOTION;
  for (const m of MOTIONS) {
    if (m.id === 'default') continue;
    if (m.keywords.some((k) => d.includes(k))) return m;
  }
  return DEFAULT_MOTION;
}