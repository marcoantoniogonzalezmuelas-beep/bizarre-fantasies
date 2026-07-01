// Patch inyectado en el HTML del juego (iframe): hace que el Punkito NARRADOR
// (el que aparece arriba durante la batalla) saque un arma/objeto distinto según
// el tipo de ataque que se acaba de producir, con una animación corta (~2s):
//  - Ataque a distancia -> saca una metralleta y dispara.
//  - Hechizo             -> gesto de varita mágica, estilo Harry Potter.
//  - Cuerpo a cuerpo     -> alza una espada, estilo He-Man.
// Se engancha a window.flushFx (que ya reparte los eventos de combate) sin
// tocar la lógica del juego: solo lee los eventos ya emitidos.
export const NARRATOR_ACTION_PATCH = `
<script>
(function(){
  if (window.__bfNarratorActionPatch) return;
  window.__bfNarratorActionPatch = true;

  var ACTION_IMG = {
    gun: "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ceb007b23_generated_image.png",
    wand: "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ed7f9e9d2_generated_image.png",
    sword: "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/534f411fb_generated_image.png"
  };

  var st = document.createElement('style');
  st.textContent = [
    '.bf-nar-action-gun{animation:bfNarGunKick .11s ease-in-out infinite !important}',
    '.bf-nar-action-wand{animation:bfNarWandWave .5s ease-in-out infinite !important}',
    '.bf-nar-action-sword{animation:bfNarSwordSwing .45s ease-in-out infinite !important}',
    '@keyframes bfNarGunKick{0%,100%{transform:translate(0,0) rotate(0)}30%{transform:translate(-3px,-2px) rotate(-4deg)}60%{transform:translate(2px,1px) rotate(3deg)}}',
    '@keyframes bfNarWandWave{0%,100%{transform:rotate(-6deg) scale(1)}50%{transform:rotate(8deg) scale(1.08)}}',
    '@keyframes bfNarSwordSwing{0%,100%{transform:rotate(-14deg) scale(1)}50%{transform:rotate(14deg) scale(1.1)}}',
    '.bf-nar-fx{position:absolute;pointer-events:none;z-index:6;font-size:26px;filter:drop-shadow(0 0 8px currentColor)}',
    '.bf-nar-fx-gun{top:6px;left:-14px;color:#ffe49a;animation:bfNarFxGun .9s ease-out infinite}',
    '.bf-nar-fx-wand{top:-10px;right:-8px;color:#ffd24a;animation:bfNarFxWand 1.1s ease-in-out infinite}',
    '.bf-nar-fx-sword{top:-14px;left:50%;color:#dfe8ff;animation:bfNarFxSword .9s ease-out infinite}',
    '@keyframes bfNarFxGun{0%,100%{opacity:.2;transform:scale(.7) translateX(0)}40%{opacity:1;transform:scale(1.25) translateX(-10px)}}',
    '@keyframes bfNarFxWand{0%,100%{opacity:.3;transform:rotate(0) scale(.8)}50%{opacity:1;transform:rotate(180deg) scale(1.3)}}',
    '@keyframes bfNarFxSword{0%,100%{opacity:.2;transform:translateX(-50%) scale(.7)}50%{opacity:1;transform:translateX(-50%) scale(1.3)}}'
  ].join('');
  document.head.appendChild(st);

  function narratorChar() {
    var nw = document.getElementById('bf-narrator');
    if (!nw || nw.classList.contains('hid')) return null;
    var ch = nw.querySelector('.bf-nar-ch');
    var img = ch && ch.querySelector('img');
    if (!ch || !img) return null;
    return { ch: ch, img: img };
  }

  function bfNarratorAction(type) {
    var ref = narratorChar();
    if (!ref || !ACTION_IMG[type]) return;
    var ch = ref.ch, img = ref.img;
    if (ch.dataset.bfActioning === '1') return;
    ch.dataset.bfActioning = '1';
    var prevSrc = img.getAttribute('src');
    img.src = ACTION_IMG[type];
    ch.classList.add('bf-nar-action-' + type);
    var fx = document.createElement('div');
    fx.className = 'bf-nar-fx bf-nar-fx-' + type;
    fx.textContent = type === 'gun' ? '💥' : type === 'wand' ? '✨' : '⚔️';
    ch.appendChild(fx);
    setTimeout(function() {
      ch.classList.remove('bf-nar-action-' + type);
      img.src = prevSrc;
      if (fx.parentNode) fx.parentNode.removeChild(fx);
      ch.dataset.bfActioning = '';
    }, 2000);
  }
  window.bfNarratorAction = bfNarratorAction;

  function handleEvent(ev) {
    if (!ev || !ev.k) return;
    if (ev.k === 'arrow') bfNarratorAction('gun');
    else if (ev.k === 'spell') bfNarratorAction('wand');
    else if (ev.k === 'slash') bfNarratorAction('sword');
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