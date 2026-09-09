// Parche inyectado en el iframe: cinemática de CELEBRACIÓN BIZARRA cuando un
// jugador se PASA un nivel de IA. Se dispara desde aiLevelPatch (hook de
// victorias) cada vez que el nick alcanza las victorias necesarias para
// desbloquear el siguiente nivel:
//   - novice_complete    → 2 victorias vs Novata   (desbloquea Bersérker)
//   - berserker_complete → 3 victorias vs Bersérker (desbloquea Estratega)
//   - strategist_complete→ 5 victorias vs Estratega (desbloquea Némesis)
//   - nemesis_complete   → 5 victorias vs Némesis   (desbloquea IA Bizarra)
//   - game_complete      → 10 victorias vs IA Bizarra (¡te has pasado el juego!)
//
// El estilo es deliberadamente bizarro y humorístico (confeti multicolor,
// emojis absurdos, el avatar del nivel, textos a lo grande), en la línea de
// las cinemáticas de final de batalla del juego. La final (Bizarra) es más
// larga en duración por ser el cierre del juego.
export const AI_VICTORY_CINEMATIC_PATCH = `
<script>
(function(){
  if (window.__bfAiVictoryPatch) return;
  window.__bfAiVictoryPatch = true;

  var BIZARRA_AV = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c2af32041_generated_image.png';

  // Configuración por hito: avatar, color, textos, duración y cantidad de
  // confeti/emojis. La final (game_complete) dura más y es más grandiosa.
  var CFG = {
    novice_complete: {
      av: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ac6f97a53_generated_image.png',
      color: '#7ec97e',
      title: '¡PASASTE A LA IA NOVATA!',
      sub: 'Ya no eres un novato del todo. La Bersérker te espera.',
      joke: '“La Novata aún cree que ‘puya’ es una estrategia.” 🌱',
      badge: '⚡ BERSÉRKER DESBLOQUEADA',
      duration: 4200, confetti: 40, emojis: 12
    },
    berserker_complete: {
      av: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/274f7a3e2_generated_image.png',
      color: '#ff7a5a',
      title: '¡PASASTE A LA IA BERSÉRKER!',
      sub: 'Domaste la furia. La Estratega te reta a pensar.',
      joke: '“La Bersérker ha roto la mesa por tercera vez esta semana.” 🔥',
      badge: '⚡ ESTRATEGA DESBLOQUEADA',
      duration: 4800, confetti: 55, emojis: 16
    },
    strategist_complete: {
      av: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/88ab0dd62_generated_image.png',
      color: '#7ab8ff',
      title: '¡PASASTE A LA IA ESTRATEGA!',
      sub: 'Tu cerebro ya cotiza en bolsa. Némesis se aburre mirándote.',
      joke: '“La Estratega lo había previsto todo… excepto que ganaras.” 🧠',
      badge: '⚡ NÉMESIS DESBLOQUEADA',
      duration: 5400, confetti: 65, emojis: 20
    },
    nemesis_complete: {
      av: BIZARRA_AV,
      color: '#c06bff',
      title: '¡VENCISTE A TODAS LAS IAs!',
      sub: 'La IA Bizarra ha despertado. Lo imposible se ha vuelto IA.',
      joke: '“¿Creías que Némesis era el final? Qué tierno. Yo soy el caos.” 🤡',
      badge: '⚡ IA BIZARRA DESBLOQUEADA',
      duration: 6500, confetti: 50, emojis: 16
    },
    game_complete: {
      av: BIZARRA_AV,
      color: '#ff44dd',
      title: '¡TE HAS PASADO EL JUEGO!',
      sub: 'Has derrotado a la IA Bizarra 10 veces. Ya no hay nada que demostrar… o quizá sí.',
      joke: '“Eres un BIZARRO legendario. Los dioses del caos te temen.” 🃏',
      badge: '🏆 JUEGO COMPLETADO',
      duration: 9000, confetti: 90, emojis: 30
    }
  };

  var css = [
    '#bf-ai-victory{position:fixed;inset:0;z-index:999998;pointer-events:none;overflow:hidden;background:radial-gradient(circle at 50% 40%, rgba(40,8,60,.92), rgba(6,3,12,.98))}',
    '#bf-ai-victory.bf-out{transition:opacity .8s ease-out;opacity:0}',
    '.bf-av-veil{position:absolute;inset:0;animation:bfAvVeil 1.4s ease-out forwards}',
    '@keyframes bfAvVeil{0%{opacity:0}30%{opacity:1}100%{opacity:.35}}',
    '.bf-av-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px}',
    '.bf-av-av{width:clamp(120px,22vw,220px);height:clamp(120px,22vw,220px);border-radius:50%;border-width:4px;border-style:solid;overflow:hidden;box-shadow:0 0 60px var(--bf-av-c,#ff44dd),0 0 120px rgba(255,210,74,.5),inset 0 0 30px rgba(0,0,0,.6);animation:bfAvPop 1s cubic-bezier(.2,1.4,.4,1) both,bfAvFloat 3s ease-in-out 1s infinite}',
    '.bf-av-av img{width:100%;height:100%;object-fit:cover;display:block}',
    '@keyframes bfAvPop{0%{transform:scale(0) rotate(-30deg);opacity:0}60%{transform:scale(1.15) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0)}}',
    '@keyframes bfAvFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-12px) rotate(-2deg)}}',
    '.bf-av-title{font-family:Cinzel,serif;font-weight:900;font-size:clamp(30px,7vw,72px);line-height:1;letter-spacing:3px;margin-top:18px;color:var(--bf-av-c,#ff44dd);text-shadow:0 0 30px var(--bf-av-c,#ff44dd),0 0 60px var(--bf-av-glow,#ff44dd55),0 4px 10px #000;animation:bfAvTitle 1s ease-out .3s both}',
    '@keyframes bfAvTitle{0%{opacity:0;transform:translateY(20px) scale(.8)}100%{opacity:1;transform:translateY(0) scale(1)}}',
    '.bf-av-sub{font-family:Rubik,sans-serif;font-weight:800;font-size:clamp(16px,3.4vw,30px);color:#fff;margin-top:14px;text-shadow:0 2px 8px #000,0 0 14px var(--bf-av-c,#ff44dd);animation:bfAvSub 1s ease-out .7s both;max-width:90vw}',
    '.bf-av-joke{font-family:Rubik,sans-serif;font-style:italic;font-size:clamp(13px,2.6vw,20px);color:#e2b0ff;margin-top:10px;text-shadow:0 2px 6px #000;animation:bfAvSub 1s ease-out 1.1s both;max-width:80vw}',
    '.bf-av-badge{margin-top:20px;display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:999px;background:linear-gradient(90deg,#ff44dd,#ffd24a,#7ab8ff,#66ffaa);background-size:300% 100%;animation:bfAvBadgeFlow 3s linear infinite,bfAvSub 1s ease-out 1.3s both;font-family:Cinzel,serif;font-weight:900;font-size:clamp(12px,2.4vw,18px);color:#1a0a24;text-shadow:0 1px 2px rgba(255,255,255,.4);letter-spacing:1px}',
    '@keyframes bfAvBadgeFlow{0%{background-position:0% 0}100%{background-position:300% 0}}',
    '.bf-av-confetti{position:absolute;top:-20px;width:10px;height:14px;border-radius:2px;animation:bfAvConfetti linear infinite;opacity:.9}',
    '@keyframes bfAvConfetti{0%{transform:translateY(-30px) rotate(0)}100%{transform:translateY(110vh) rotate(720deg)}}',
    '.bf-av-emoji{position:absolute;font-size:clamp(22px,4vw,40px);animation:bfAvEmoji linear infinite;opacity:.85;filter:drop-shadow(0 0 6px var(--bf-av-c,#ff44dd))}',
    '@keyframes bfAvEmoji{0%{transform:translateY(-30px) rotate(0) scale(.8)}50%{transform:translateY(50vh) rotate(360deg) scale(1.1)}100%{transform:translateY(110vh) rotate(720deg) scale(.8)}}',
    '.bf-av-skip{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);font-family:Rubik,sans-serif;font-size:12px;color:#cfc6dd;text-shadow:0 1px 3px #000;animation:bfAvSub 1s ease-out 1.6s both;pointer-events:auto;cursor:pointer;background:rgba(0,0,0,.4);padding:6px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.2)}',
    '.bf-av-skip:hover{background:rgba(255,68,221,.3)}',
  ].join('\\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var EMOJIS = ['🤡','💀','🎉','🌈','✨','🃏','👾','🤯','💩','🦄','⚡','🎲'];
  var COLORS = ['#ff44dd','#ffd24a','#7ab8ff','#66ffaa','#ff7a5a','#c06bff','#ffffff'];

  function makeConfetti(host, n, isEmoji){
    for (var i = 0; i < n; i++) {
      var el = document.createElement('div');
      el.className = isEmoji ? 'bf-av-emoji' : 'bf-av-confetti';
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.animationDuration = (2.5 + Math.random() * 3.5) + 's';
      el.style.animationDelay = (Math.random() * 2.5) + 's';
      if (isEmoji) { el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]; }
      else { el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)]; }
      host.appendChild(el);
    }
  }

  window.__bfBizarreCelebration = function(kind){
    if (window.__bfAvPlaying) return;
    var cfg = CFG[kind] || CFG.nemesis_complete;
    window.__bfAvPlaying = true;

    var host = document.createElement('div');
    host.id = 'bf-ai-victory';
    host.style.setProperty('--bf-av-c', cfg.color);
    host.style.setProperty('--bf-av-glow', cfg.color + '55');
    host.innerHTML =
      '<div class="bf-av-veil" style="background:radial-gradient(circle at 50% 45%, ' + cfg.color + '33, transparent 60%)"></div>' +
      '<div class="bf-av-stage">' +
        '<div class="bf-av-av" style="border-color:' + cfg.color + '"><img src="' + cfg.av + '" alt=""></div>' +
        '<div class="bf-av-title">' + cfg.title + '</div>' +
        '<div class="bf-av-sub">' + cfg.sub + '</div>' +
        '<div class="bf-av-joke">' + cfg.joke + '</div>' +
        '<div class="bf-av-badge">' + cfg.badge + '</div>' +
      '</div>' +
      '<div class="bf-av-skip" id="bf-av-skip">Saltar</div>';
    document.body.appendChild(host);
    makeConfetti(host, cfg.confetti, false);
    makeConfetti(host, cfg.emojis, true);

    var skip = host.querySelector('#bf-av-skip');
    skip.onclick = function(){ close(); };

    function close(){
      host.classList.add('bf-out');
      setTimeout(function(){ if (host.parentNode) host.parentNode.removeChild(host); window.__bfAvPlaying = false; }, 850);
    }
    setTimeout(close, cfg.duration);
  };

  // Permite dispararla también desde la página padre (postMessage).
  window.addEventListener('message', function(e){
    if (e.data && e.data.bfBizarreCelebration && typeof window.__bfBizarreCelebration === 'function') {
      window.__bfBizarreCelebration(e.data.bfBizarreCelebration);
    }
  });
})();
</script>
`;