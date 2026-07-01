// Parche inyectado en el HTML del juego (iframe) para el tutorial "Aprende a
// jugar" (startDemo): el guía paso a paso pasa a ser un "Punkito estudiante"
// — niño pequeño con gorro de graduación — animado y vistoso. Además oculta el
// Punkito arrastrable habitual (#bf-guide / #bf-guide-show) mientras el coach
// del tutorial está visible, para que solo se vea un Punkito.
export const COACH_PUNKITO_PATCH = `
<script>
(function(){
  if (window.__bfCoachPunkito) return;
  window.__bfCoachPunkito = true;

  var STUDENT_IMG = "https://base44.app/api/apps/6a39c9aee54efe3a86d6d69a/files/mp/public/6a39c9aee54efe3a86d6d69a/28702748f_punkito_student.png";

  var st = document.createElement('style');
  st.textContent = [
    // El coach del tutorial muestra a Punkito estudiante en vez del emoji 🧙.
    '#coach .coach-ico{display:none!important}',
    '#coach .bf-coach-punkito{flex:0 0 auto;width:74px;height:74px;display:flex;align-items:flex-end;justify-content:center;position:relative;animation:bfStudHop 1.8s ease-in-out infinite}',
    '#coach .bf-coach-punkito img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 6px 10px rgba(0,0,0,.55)) drop-shadow(0 0 12px rgba(255,210,74,.4));transform-origin:bottom center;animation:bfStudWobble 2.6s ease-in-out infinite}',
    // Gorrito de graduación ya va en la imagen; añadimos chispitas chulas.
    '#coach .bf-coach-punkito::after{content:"";position:absolute;top:-4px;right:-2px;width:14px;height:14px;background:radial-gradient(circle,#fff6c8 0%,#ffd24a 45%,transparent 70%);border-radius:50%;animation:bfStudSpark 1.4s ease-in-out infinite}',
    '@media(max-width:560px){#coach .bf-coach-punkito{width:56px;height:56px}}',
    '@keyframes bfStudHop{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}',
    '@keyframes bfStudWobble{0%,100%{transform:rotate(-4deg) scale(1)}50%{transform:rotate(4deg) scale(1.05)}}',
    '@keyframes bfStudSpark{0%,100%{opacity:.3;transform:scale(.7)}50%{opacity:1;transform:scale(1.25)}}',
    // Headbanging heavy: menea la cabeza rápido arriba/abajo (2s, cada minuto).
    '#coach .bf-coach-punkito.bf-headbang img{animation:bfHeadbang .28s ease-in-out infinite !important;transform-origin:top center}',
    '@keyframes bfHeadbang{0%,100%{transform:rotate(0) translateY(0)}25%{transform:rotate(2deg) translateY(3px)}50%{transform:rotate(0) translateY(8px)}75%{transform:rotate(-2deg) translateY(3px)}}',
    // ---- Caballito con la moto + meneo de flequillo punk (cada 2 min, dura ~5s) ----
    // Se aplica a cualquier Punkito visible (guía arrastrable, botón, narrador de
    // batalla y coach estudiante). La imagen hace el "wheelie" (rota hacia atrás
    // apoyándose en la rueda trasera) y un fondo/flequillo vibrante lo acompaña.
    '.bf-wheelie{animation:bfWheelie 5s cubic-bezier(.25,.8,.3,1) 1 !important;transform-origin:72% 92% !important;z-index:99998 !important}',
    '.bf-wheelie::after{content:"";position:absolute;left:8%;bottom:4%;width:38%;height:22%;border-radius:50%;background:radial-gradient(circle,rgba(255,210,74,.7),rgba(255,160,40,.25) 55%,transparent 74%);opacity:0;animation:bfWheelieDust 5s ease-out 1;pointer-events:none;z-index:-1}',
    // Wheelie más marcado: la moto se alza mucho hacia arriba (hasta -52°) y se
    // eleva bastante, se sostiene en alto vibrando, y baja al final.
    '@keyframes bfWheelie{0%{transform:rotate(0) translateY(0)}12%{transform:rotate(-40deg) translateY(-14px)}22%{transform:rotate(-52deg) translateY(-26px)}34%{transform:rotate(-48deg) translateX(5px) translateY(-24px)}46%{transform:rotate(-53deg) translateX(-4px) translateY(-27px)}58%{transform:rotate(-49deg) translateX(5px) translateY(-24px)}70%{transform:rotate(-53deg) translateX(-3px) translateY(-27px)}82%{transform:rotate(-38deg) translateY(-12px)}92%{transform:rotate(-10deg) translateY(-3px)}100%{transform:rotate(0) translateY(0)}}',
    '@keyframes bfWheelieDust{0%{opacity:0;transform:scale(.5)}20%{opacity:.9}60%{opacity:.6;transform:scale(1.5) translateX(-24px)}100%{opacity:0;transform:scale(2) translateX(-52px)}}',
    // Headbanging heavy de la cabeza/flequillo de Punkito mientras hace el caballito:
    // sacude fuerte arriba/abajo con leve giro + destello punk en el flequillo.
    '.bf-wheelie img{animation:bfWheelieHeadbang .26s ease-in-out infinite !important;transform-origin:top center}',
    '@keyframes bfWheelieHeadbang{0%,100%{transform:rotate(-3deg) translateY(-2px);filter:drop-shadow(0 0 6px rgba(255,210,74,.5))}50%{transform:rotate(3deg) translateY(6px);filter:drop-shadow(0 0 12px rgba(255,210,74,.85)) hue-rotate(-10deg)}}',
    // ---- Fondo redondeado (círculo) para los dos Punkitos, en vez del cuadrado ----
    '#coach .bf-coach-punkito{border-radius:50% !important;background:radial-gradient(circle at 42% 32%,rgba(48,34,84,.9),rgba(14,9,28,.95)) !important;border:2.5px solid rgba(255,210,74,.7) !important;box-shadow:0 6px 16px rgba(0,0,0,.55),0 0 16px rgba(255,210,74,.3) !important;overflow:hidden}',
    '#coach .bf-coach-punkito img{border-radius:50%}',
    '#bf-narrator .bf-nar-ch{border-radius:50% !important;background:radial-gradient(circle at 42% 32%,rgba(48,34,84,.9),rgba(14,9,28,.95)) !important;border:2.5px solid rgba(255,210,74,.7) !important;box-shadow:0 6px 16px rgba(0,0,0,.55),0 0 16px rgba(255,210,74,.3) !important;overflow:hidden}',
    '#bf-narrator .bf-nar-ch img{border-radius:50%}',
    // El Punkito de la página inicial / guía arrastrable (#bf-guide .bf-guide-char)
    // también con fondo circular y borde dorado (igual que el narrador).
    '#bf-guide .bf-guide-char{border-radius:50% !important;background:radial-gradient(circle at 42% 32%,rgba(48,34,84,.9),rgba(14,9,28,.95)) !important;border:2.5px solid rgba(255,210,74,.7) !important;box-shadow:0 6px 16px rgba(0,0,0,.55),0 0 16px rgba(255,210,74,.3) !important;overflow:hidden;padding:4px}',
    '#bf-guide .bf-guide-char img{border-radius:50%}'
  ].join('');
  document.head.appendChild(st);

  // ---- Caballito periódico: cada 2 minutos, el Punkito visible hace el truco ~5s ----
  function doWheelie(){
    var demoStudent = document.querySelector('#coach .bf-coach-punkito');
    var guide = document.querySelector('#bf-guide .bf-guide-char');
    var guideShow = document.getElementById('bf-guide-show');
    var narrator = document.querySelector('#bf-narrator .bf-nar-ch');
    var targets = [demoStudent, guide, guideShow, narrator].filter(function(el){
      return el && el.offsetParent !== null; // solo los visibles
    });
    targets.forEach(function(el){
      if (el.classList.contains('bf-wheelie')) return;
      // No pisar una reacción en curso del guía (bf-react-*/bf-battle-ride).
      if (el.dataset && el.dataset.bfReacting === '1') return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.classList.add('bf-wheelie');
      setTimeout(function(){ el.classList.remove('bf-wheelie'); }, 5000);
    });
  }
  setInterval(doWheelie, 60000);

  // ---- Headbanging heavy del Punkito estudiante: cada minuto, 2 segundos ----
  function doHeadbang(){
    var stu = document.querySelector('#coach .bf-coach-punkito');
    if (!stu || stu.offsetParent === null || stu.classList.contains('bf-headbang')) return;
    stu.classList.add('bf-headbang');
    setTimeout(function(){ stu.classList.remove('bf-headbang'); }, 2000);
  }
  setInterval(doHeadbang, 60000);

  // ---- En "Aprende a jugar": la batalla NO debe mostrar el narrador Punkito de
  // arriba; con el niño estudiante basta. Lo ocultamos mientras el demo esté activo.
  function hideBattleNarratorInDemo(){
    if (typeof G === 'undefined' || !G || !G.demo) return;
    var nar = document.getElementById('bf-narrator');
    if (nar) nar.style.display = 'none';
  }

  function swapCoachIcon(){
    var c = document.getElementById('coach');
    if (!c) return;
    // El juego reescribe el innerHTML del coach en cada paso: si vuelve a salir
    // el emoji, lo sustituimos por la imagen del Punkito estudiante.
    var ico = c.querySelector('.coach-ico');
    if (ico && !c.querySelector('.bf-coach-punkito')) {
      var box = document.createElement('div');
      box.className = 'bf-coach-punkito';
      box.innerHTML = '<img src="' + STUDENT_IMG + '" alt="Punkito estudiante">';
      ico.parentNode.insertBefore(box, ico);
    }
  }

  function hideRoamingGuideDuringDemo(){
    var c = document.getElementById('coach');
    var demoOn = c && getComputedStyle(c).display !== 'none';
    var dg = document.getElementById('bf-guide');
    var dgShow = document.getElementById('bf-guide-show');
    if (demoOn) {
      if (dg) dg.style.display = 'none';
      if (dgShow) dgShow.style.display = 'none';
    }
  }

  function tick(){ swapCoachIcon(); hideRoamingGuideDuringDemo(); hideBattleNarratorInDemo(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
  new MutationObserver(tick).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['style','class'] });
})();
</script>
`;