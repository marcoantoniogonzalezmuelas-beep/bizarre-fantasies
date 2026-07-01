// Patch inyectado en el HTML del juego (iframe): hace que el propio Punkito
// NARRADOR (el que aparece arriba durante la batalla, siempre la MISMA imagen)
// se anime según el tipo de ataque que se acaba de producir, sin cambiar de
// personaje — solo un gesto/vibración distinto + un icono flotante (~2s):
//  - Ataque a distancia -> vibra como si disparara una metralleta (💥).
//  - Hechizo             -> gesto de varita mágica (✨).
//  - Cuerpo a cuerpo     -> gesto de blandir una espada (⚔️).
// Además, cuando un héroe en batalla RENACE ÉLITE, Punkito se transforma unos
// segundos en un "Pollito Punki Super Guerrero" (estilo Super Saiyan) y luego
// vuelve a la normalidad.
// Se engancha a window.flushFx (que ya reparte los eventos de combate) sin
// tocar la lógica del juego: solo lee los eventos ya emitidos.
export const NARRATOR_ACTION_PATCH = `
<script>
(function(){
  if (window.__bfNarratorActionPatch) return;
  window.__bfNarratorActionPatch = true;

  var SSJ_IMG = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/7a9ac62e3_generated_image.png";

  var st = document.createElement('style');
  st.textContent = [
    '.bf-nar-action-gun .bf-nar-ch-img{animation:bfNarGunKick .11s ease-in-out infinite !important}',
    '.bf-nar-action-wand .bf-nar-ch-img{animation:bfNarWandWave .5s ease-in-out infinite !important}',
    '.bf-nar-action-sword .bf-nar-ch-img{animation:bfNarSwordSwing .45s ease-in-out infinite !important}',
    '@keyframes bfNarGunKick{0%,100%{transform:translate(0,0) rotate(0)}30%{transform:translate(-3px,-2px) rotate(-4deg)}60%{transform:translate(2px,1px) rotate(3deg)}}',
    '@keyframes bfNarWandWave{0%,100%{transform:rotate(-6deg) scale(1)}50%{transform:rotate(8deg) scale(1.08)}}',
    '@keyframes bfNarSwordSwing{0%,100%{transform:rotate(-14deg) scale(1)}50%{transform:rotate(14deg) scale(1.1)}}',
    '.bf-nar-fx{position:absolute;pointer-events:none;z-index:6;font-size:26px;filter:drop-shadow(0 0 8px currentColor)}',
    '.bf-nar-fx-gun{top:6px;left:-14px;color:#ffe49a;animation:bfNarFxGun .9s ease-out infinite}',
    '.bf-nar-fx-wand{top:-10px;right:-8px;color:#ffd24a;animation:bfNarFxWand 1.1s ease-in-out infinite}',
    '.bf-nar-fx-sword{top:-14px;left:50%;color:#dfe8ff;animation:bfNarFxSword .9s ease-out infinite}',
    '@keyframes bfNarFxGun{0%,100%{opacity:.2;transform:scale(.7) translateX(0)}40%{opacity:1;transform:scale(1.25) translateX(-10px)}}',
    '@keyframes bfNarFxWand{0%,100%{opacity:.3;transform:rotate(0) scale(.8)}50%{opacity:1;transform:rotate(180deg) scale(1.3)}}',
    '@keyframes bfNarFxSword{0%,100%{opacity:.2;transform:translateX(-50%) scale(.7)}50%{opacity:1;transform:translateX(-50%) scale(1.3)}}',
    '.bf-nar-ssj .bf-nar-ch-img{animation:bfNarSsjPulse .4s ease-in-out infinite !important;filter:saturate(1.4) drop-shadow(0 0 18px #ffe14a) !important}',
    '@keyframes bfNarSsjPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}',
    '.bf-nar-ssj-aura{position:absolute;inset:-16px;z-index:-1;pointer-events:none;border-radius:50%;background:radial-gradient(circle,rgba(255,225,74,.85),rgba(255,170,20,.35) 45%,transparent 72%);animation:bfNarSsjAura .5s ease-in-out infinite}',
    '@keyframes bfNarSsjAura{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.18)}}'
  ].join('');
  document.head.appendChild(st);

  function narratorChar() {
    var nw = document.getElementById('bf-narrator');
    if (!nw || nw.classList.contains('hid')) return null;
    var ch = nw.querySelector('.bf-nar-ch');
    var img = ch && ch.querySelector('img');
    if (!ch || !img) return null;
    if (!img.classList.contains('bf-nar-ch-img')) img.classList.add('bf-nar-ch-img');
    return { ch: ch, img: img };
  }

  function bfNarratorAction(type) {
    var ref = narratorChar();
    if (!ref) return;
    var ch = ref.ch;
    if (ch.dataset.bfActioning === '1') return;
    ch.dataset.bfActioning = '1';
    ch.classList.add('bf-nar-action-' + type);
    var fx = document.createElement('div');
    fx.className = 'bf-nar-fx bf-nar-fx-' + type;
    fx.textContent = type === 'gun' ? '💥' : type === 'wand' ? '✨' : '⚔️';
    ch.appendChild(fx);
    setTimeout(function() {
      ch.classList.remove('bf-nar-action-' + type);
      if (fx.parentNode) fx.parentNode.removeChild(fx);
      ch.dataset.bfActioning = '';
    }, 2000);
  }
  window.bfNarratorAction = bfNarratorAction;

  // Transformación especial: cuando un héroe renace ÉLITE en batalla, Punkito
  // se transforma en su forma "Pollito Punki Super Guerrero" unos segundos.
  function bfNarratorTransform() {
    var ref = narratorChar();
    if (!ref) return;
    var ch = ref.ch, img = ref.img;
    if (ch.dataset.bfTransforming === '1') return;
    ch.dataset.bfTransforming = '1';
    var prevSrc = img.getAttribute('src');
    img.src = SSJ_IMG;
    ch.classList.add('bf-nar-ssj');
    var aura = document.createElement('div');
    aura.className = 'bf-nar-ssj-aura';
    ch.insertBefore(aura, ch.firstChild);
    setTimeout(function() {
      ch.classList.remove('bf-nar-ssj');
      img.src = prevSrc;
      if (aura.parentNode) aura.parentNode.removeChild(aura);
      ch.dataset.bfTransforming = '';
    }, 2600);
  }
  window.bfNarratorTransform = bfNarratorTransform;

  function handleEvent(ev) {
    if (!ev || !ev.k) return;
    if (ev.k === 'arrow') bfNarratorAction('gun');
    else if (ev.k === 'spell') bfNarratorAction('wand');
    else if (ev.k === 'slash') bfNarratorAction('sword');
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