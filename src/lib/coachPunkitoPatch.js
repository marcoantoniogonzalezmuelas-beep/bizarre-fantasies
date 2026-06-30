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
    // Símbolo de victoria ✌️ que aparece al lado del Punkito: entra con un
    // saltito girando y luego hace un gesto sutil de balanceo.
    '#coach .bf-coach-victory{position:absolute;top:-10px;left:-14px;font-size:30px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6));transform-origin:bottom right;animation:bfStudVictoryIn .9s cubic-bezier(.2,.8,.3,1.2) both, bfStudVictoryIdle 2.2s ease-in-out 1s infinite}',
    '@media(max-width:560px){#coach .bf-coach-punkito{width:56px;height:56px}#coach .bf-coach-victory{font-size:24px;top:-8px;left:-10px}}',
    '@keyframes bfStudHop{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}',
    '@keyframes bfStudWobble{0%,100%{transform:rotate(-4deg) scale(1)}50%{transform:rotate(4deg) scale(1.05)}}',
    '@keyframes bfStudSpark{0%,100%{opacity:.3;transform:scale(.7)}50%{opacity:1;transform:scale(1.25)}}',
    '@keyframes bfStudVictoryIn{0%{opacity:0;transform:scale(.2) rotate(-40deg) translateY(14px)}60%{opacity:1;transform:scale(1.25) rotate(12deg) translateY(-4px)}100%{opacity:1;transform:scale(1) rotate(0) translateY(0)}}',
    '@keyframes bfStudVictoryIdle{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}'
  ].join('');
  document.head.appendChild(st);

  function swapCoachIcon(){
    var c = document.getElementById('coach');
    if (!c) return;
    // El juego reescribe el innerHTML del coach en cada paso: si vuelve a salir
    // el emoji, lo sustituimos por la imagen del Punkito estudiante.
    var ico = c.querySelector('.coach-ico');
    if (ico && !c.querySelector('.bf-coach-punkito')) {
      var box = document.createElement('div');
      box.className = 'bf-coach-punkito';
      box.innerHTML = '<img src="' + STUDENT_IMG + '" alt="Punkito estudiante"><span class="bf-coach-victory">✌️</span>';
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

  function tick(){ swapCoachIcon(); hideRoamingGuideDuringDemo(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
  new MutationObserver(tick).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['style','class'] });
})();
</script>
`;