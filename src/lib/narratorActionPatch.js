// Patch inyectado en el HTML del juego (iframe): hace que el propio Punkito
// NARRADOR (arriba durante la batalla) se ANIME DE VERDAD — cambia su propia
// ilustración (sprite-swap) a una pose de acción dibujada específicamente para
// cada tipo de ataque, en vez de solo aplicar CSS sobre la imagen fija:
//  - Ataque a distancia -> Punkito disparando una metralleta.
//  - Hechizo             -> Punkito lanzando un hechizo con la varita.
//  - Cuerpo a cuerpo     -> Punkito dando un espadazo.
//  - Renace ÉLITE de un héroe -> Punkito se transforma en un estallido dorado.
// Se combina con efectos CSS extra (destellos, chispas) para reforzar la acción.
// Todos los efectos se añaden al contenedor EXTERIOR (.bf-nar-ch), que ya no
// tiene overflow:hidden (solo el círculo interior .bf-nar-circle lo tiene),
// así que se ven completos en vez de recortarse por el marco redondo.
export const NARRATOR_ACTION_PATCH = `
<script>
(function(){
  if (window.__bfNarratorActionPatch) return;
  window.__bfNarratorActionPatch = true;

  var POSE_GUN = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fa82ca4c3_generated_image.png";
  var POSE_SWORD = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/abb964970_generated_image.png";
  var POSE_WAND = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4525d3e54_generated_image.png";
  var POSE_TRANSFORM = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/78c844752_generated_image.png";
  var POSE_BY_TYPE = { gun: POSE_GUN, sword: POSE_SWORD, wand: POSE_WAND };

  var st = document.createElement('style');
  st.textContent = [
    '.bf-nar-fx{position:absolute;pointer-events:none;z-index:8;filter:drop-shadow(0 0 8px currentColor)}',
    '.bf-nar-fx-gun{color:#ffe49a;top:0;left:-26px;font-size:36px;animation:bfNarFxGun .5s ease-out infinite}',
    '.bf-nar-fx-wand{color:#ffd24a;top:-14px;right:-14px;font-size:30px;animation:bfNarFxWand .6s ease-in-out infinite}',
    '.bf-nar-fx-sword{color:#dfe8ff;top:-18px;left:50%;font-size:32px;animation:bfNarFxSword .5s ease-out infinite}',
    '@keyframes bfNarFxGun{0%,100%{opacity:0;transform:scale(.5) translateX(8px) rotate(0)}35%{opacity:1;transform:scale(1.5) translateX(-18px) rotate(-12deg)}}',
    '@keyframes bfNarFxWand{0%,100%{opacity:.3;transform:rotate(0) scale(.8)}50%{opacity:1;transform:rotate(200deg) scale(1.4)}}',
    '@keyframes bfNarFxSword{0%,100%{opacity:.2;transform:translateX(-50%) scale(.7) rotate(-10deg)}45%{opacity:1;transform:translateX(-50%) scale(1.4) rotate(10deg)}}',
    '.bf-nar-action-gun .bf-nar-ch-img{animation:bfNarGunKick .1s ease-in-out infinite !important}',
    '@keyframes bfNarGunKick{0%,100%{transform:translate(0,0) rotate(0) scale(1)}25%{transform:translate(-6px,-3px) rotate(-7deg) scale(1.04)}55%{transform:translate(5px,2px) rotate(6deg) scale(.97)}80%{transform:translate(-3px,-1px) rotate(-3deg) scale(1.02)}}',
    '.bf-nar-action-gun .bf-nar-circle{animation:bfNarGunGlow .2s ease-in-out infinite !important}',
    '@keyframes bfNarGunGlow{0%,100%{box-shadow:0 6px 16px rgba(0,0,0,.55),0 0 16px rgba(255,210,74,.3)}50%{box-shadow:0 6px 24px rgba(0,0,0,.6),0 0 36px rgba(255,150,40,.9)}}',
    '.bf-nar-gunspark{position:absolute;top:14px;width:7px;height:7px;border-radius:50%;background:#ffe49a;box-shadow:0 0 10px #ffd24a;pointer-events:none;animation:bfNarSparkFly .5s ease-out infinite}',
    '.bf-nar-gunspark.s1{left:-8px;animation-delay:0s}.bf-nar-gunspark.s2{left:-16px;animation-delay:.12s}.bf-nar-gunspark.s3{left:-4px;animation-delay:.24s}',
    '@keyframes bfNarSparkFly{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(-26px,-14px) scale(.3)}}',
    '.bf-nar-action-sword .bf-nar-ch-img{animation:bfNarSwordSwing .38s ease-in-out infinite !important}',
    '@keyframes bfNarSwordSwing{0%,100%{transform:rotate(-20deg) scale(1)}50%{transform:rotate(20deg) scale(1.14)}}',
    '.bf-nar-slash{position:absolute;left:-18px;right:-18px;top:50%;height:6px;border-radius:999px;background:linear-gradient(90deg,transparent,#fff,#ff3b35,transparent);transform:rotate(-22deg) scaleX(0);box-shadow:0 0 22px #ff3b35;animation:bfNarSlashAnim .5s ease-out infinite;pointer-events:none}',
    '@keyframes bfNarSlashAnim{0%{opacity:0;transform:rotate(-22deg) scaleX(0)}35%{opacity:1;transform:rotate(-22deg) scaleX(1.15)}100%{opacity:0;transform:rotate(-22deg) scaleX(1.3)}}',
    '.bf-nar-action-wand .bf-nar-ch-img{animation:bfNarWandWave .45s ease-in-out infinite !important}',
    '@keyframes bfNarWandWave{0%,100%{transform:rotate(-9deg) scale(1)}50%{transform:rotate(11deg) scale(1.12)}}',
    '.bf-nar-magic-ring{position:absolute;inset:-10px;border-radius:50%;border:3px solid transparent;border-top-color:#c79bff;border-right-color:#7ad6ff;pointer-events:none;animation:bfNarRingSpin .7s linear infinite}',
    '@keyframes bfNarRingSpin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}',
    '.bf-nar-wandmote{position:absolute;bottom:0;font-size:13px;color:#ffe49a;text-shadow:0 0 8px #c79bff;pointer-events:none;animation:bfNarMoteRise .9s ease-out infinite}',
    '.bf-nar-wandmote.m1{left:6px;animation-delay:0s}.bf-nar-wandmote.m2{left:60px;animation-delay:.3s}.bf-nar-wandmote.m3{left:34px;animation-delay:.6s}',
    '@keyframes bfNarMoteRise{0%{opacity:0;transform:translateY(0) scale(.6)}25%{opacity:1}100%{opacity:0;transform:translateY(-46px) scale(1.2)}}',
    '.bf-nar-ssj .bf-nar-ch-img{animation:bfNarSsjPulse .35s ease-in-out infinite !important;filter:saturate(2.4) brightness(1.4) sepia(.55) hue-rotate(-15deg) drop-shadow(0 0 20px #ffe14a) !important}',
    '@keyframes bfNarSsjPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.16)}}',
    '.bf-nar-ssj-flash{position:absolute;inset:-10px;z-index:7;pointer-events:none;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.95),transparent 70%);animation:bfNarSsjFlash .6s ease-out 1}',
    '@keyframes bfNarSsjFlash{0%{opacity:1;transform:scale(.3)}100%{opacity:0;transform:scale(2)}}',
    '.bf-nar-ssj-aura{position:absolute;inset:-20px;z-index:-1;pointer-events:none;border-radius:50%;background:radial-gradient(circle,rgba(255,225,74,.9),rgba(255,170,20,.4) 45%,transparent 72%);animation:bfNarSsjAura .45s ease-in-out infinite}',
    '@keyframes bfNarSsjAura{0%,100%{opacity:.65;transform:scale(1)}50%{opacity:1;transform:scale(1.22)}}',
    '.bf-nar-ssj-rays{position:absolute;inset:-24px;z-index:-1;pointer-events:none;border-radius:50%;background:conic-gradient(from 0deg,rgba(255,235,150,0) 0deg,rgba(255,220,110,.55) 14deg,rgba(255,235,150,0) 28deg,rgba(255,220,110,.55) 42deg,rgba(255,235,150,0) 56deg,rgba(255,220,110,.55) 70deg,rgba(255,235,150,0) 84deg);animation:bfNarRaysSpin 2.2s linear infinite}',
    '@keyframes bfNarRaysSpin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}',
    '.bf-nar-ssj-ring{position:absolute;inset:-14px;z-index:-1;pointer-events:none;border-radius:50%;border:3px solid rgba(255,225,120,.85);box-shadow:0 0 22px rgba(255,200,80,.8);animation:bfNarRingBurst 1.3s ease-out 2}',
    '@keyframes bfNarRingBurst{0%{opacity:1;transform:scale(.6)}100%{opacity:0;transform:scale(1.9)}}',
    '.bf-nar-ssj-mote{position:absolute;bottom:-6px;width:6px;height:6px;border-radius:50%;background:#ffe49a;box-shadow:0 0 10px #ffd24a;pointer-events:none;animation:bfNarSsjMoteRise 1.1s ease-out infinite}',
    '.bf-nar-ssj-mote.m1{left:8px;animation-delay:0s}.bf-nar-ssj-mote.m2{left:36px;animation-delay:.25s}.bf-nar-ssj-mote.m3{left:60px;animation-delay:.5s}.bf-nar-ssj-mote.m4{left:22px;animation-delay:.75s}',
    '@keyframes bfNarSsjMoteRise{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-70px) scale(.3)}}'
  ].join('');
  document.head.appendChild(st);

  function narratorChar() {
    var nw = document.getElementById('bf-narrator');
    if (nw && !nw.classList.contains('hid')) {
      var ch = nw.querySelector('.bf-nar-ch');
      var img = ch && ch.querySelector('img');
      if (ch && img) {
        if (!img.classList.contains('bf-nar-ch-img')) img.classList.add('bf-nar-ch-img');
        return { ch: ch, img: img };
      }
    }
    // Narrador recogido: usa el botón circular como "personaje" para que la
    // pose de acción (metralleta/espada/varita) también se vea recogido.
    var show = document.getElementById('bf-nar-show');
    if (show && getComputedStyle(show).display !== 'none') {
      var simg = show.querySelector('img');
      if (simg) {
        if (!simg.classList.contains('bf-nar-ch-img')) simg.classList.add('bf-nar-ch-img');
        return { ch: show, img: simg };
      }
    }
    return null;
  }

  var EXTRA = {
    gun: ['<div class="bf-nar-gunspark s1"></div>','<div class="bf-nar-gunspark s2"></div>','<div class="bf-nar-gunspark s3"></div>'],
    sword: ['<div class="bf-nar-slash"></div>'],
    wand: ['<div class="bf-nar-magic-ring"></div>','<div class="bf-nar-wandmote m1">✦</div>','<div class="bf-nar-wandmote m2">✧</div>','<div class="bf-nar-wandmote m3">✦</div>']
  };

  function bfNarratorAction(type) {
    var ref = narratorChar();
    if (!ref) return;
    var ch = ref.ch, img = ref.img;
    if (ch.dataset.bfActioning === '1') return;
    ch.dataset.bfActioning = '1';
    ch.classList.add('bf-nar-action-' + type);
    // Real sprite-swap: Punkito's OWN illustration changes to the action pose.
    var prevSrc = img.getAttribute('src');
    var pose = POSE_BY_TYPE[type];
    if (pose) img.src = pose;
    var wrap = document.createElement('div');
    wrap.innerHTML = (EXTRA[type] || []).join('');
    var nodes = Array.prototype.slice.call(wrap.children);
    nodes.forEach(function(n) { ch.appendChild(n); });
    var fx = document.createElement('div');
    fx.className = 'bf-nar-fx bf-nar-fx-' + type;
    fx.textContent = type === 'gun' ? '💥' : type === 'wand' ? '✨' : '⚔️';
    ch.appendChild(fx);
    setTimeout(function() {
      ch.classList.remove('bf-nar-action-' + type);
      nodes.forEach(function(n) { if (n.parentNode) n.parentNode.removeChild(n); });
      if (fx.parentNode) fx.parentNode.removeChild(fx);
      if (pose) img.src = prevSrc;
      ch.dataset.bfActioning = '';
    }, 1000);
  }
  window.bfNarratorAction = bfNarratorAction;

  function bfNarratorTransform() {
    var ref = narratorChar();
    if (!ref) return;
    var ch = ref.ch, img = ref.img;
    if (ch.dataset.bfTransforming === '1') return;
    ch.dataset.bfTransforming = '1';
    ch.classList.add('bf-nar-ssj');
    var prevSrc = img.getAttribute('src');
    img.src = POSE_TRANSFORM;
    var extra = document.createElement('div');
    extra.innerHTML = '<div class="bf-nar-ssj-rays"></div><div class="bf-nar-ssj-aura"></div><div class="bf-nar-ssj-ring"></div><div class="bf-nar-ssj-mote m1"></div><div class="bf-nar-ssj-mote m2"></div><div class="bf-nar-ssj-mote m3"></div><div class="bf-nar-ssj-mote m4"></div>';
    var nodes = Array.prototype.slice.call(extra.children);
    nodes.forEach(function(n) { ch.insertBefore(n, ch.firstChild); });
    var flash = document.createElement('div');
    flash.className = 'bf-nar-ssj-flash';
    ch.appendChild(flash);
    setTimeout(function() { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 700);
    setTimeout(function() {
      ch.classList.remove('bf-nar-ssj');
      nodes.forEach(function(n) { if (n.parentNode) n.parentNode.removeChild(n); });
      img.src = prevSrc;
      ch.dataset.bfTransforming = '';
    }, 2800);
  }
  window.bfNarratorTransform = bfNarratorTransform;

  function handleEvent(ev) {
    if (!ev || !ev.k) return;
    if (ev.k === 'arrow') bfNarratorAction('gun');
    else if (ev.k === 'spell') bfNarratorAction('wand');
    else if (ev.k === 'hit' && ev.dtype !== 'ranged' && ev.dtype !== 'spell') bfNarratorAction('sword');
    else if (ev.k === 'elite') bfNarratorTransform();
  }

  function tryPatch() {
    if (typeof window.flushFx !== 'function' || window.flushFx.__bfNarAction) return;
    var original = window.flushFx;
    window.flushFx = function(list) {
      original(list);
      setTimeout(function() { (list || []).forEach(handleEvent); }, 10);
    };
    window.flushFx.__bfNarAction = true;
  }

  var attempts = 0;
  var iv = setInterval(function() {
    attempts++;
    tryPatch();
    if (window.flushFx && window.flushFx.__bfNarAction) clearInterval(iv);
    if (attempts > 80) clearInterval(iv);
  }, 150);
})();
</script>
`;