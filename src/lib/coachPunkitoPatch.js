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

  var STUDENT_IMG = "https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/321c5b771_generated_image.png";

  var st = document.createElement('style');
  st.textContent = [
    // El coach del tutorial muestra a Punkito estudiante en vez del emoji 🧙.
    '#coach .coach-ico{display:none!important}',
    '#coach .bf-coach-punkito{flex:0 0 auto;width:74px;height:74px;display:flex;align-items:flex-end;justify-content:center;position:relative;animation:bfStudHop 1.8s ease-in-out infinite}',
    // La imagen trae fondo blanco sólido; con mix-blend-mode:multiply el blanco
    // se funde con el fondo oscuro del diálogo y desaparece, dejando solo la figura.
    '#coach .bf-coach-punkito img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply;filter:contrast(1.06) saturate(1.08);transform-origin:bottom center;animation:bfStudWobble 2.6s ease-in-out infinite}',
    // Gorrito de graduación ya va en la imagen; añadimos chispitas chulas.
    '#coach .bf-coach-punkito::after{content:"";position:absolute;top:-4px;right:-2px;width:14px;height:14px;background:radial-gradient(circle,#fff6c8 0%,#ffd24a 45%,transparent 70%);border-radius:50%;animation:bfStudSpark 1.4s ease-in-out infinite}',
    '@media(max-width:560px){#coach .bf-coach-punkito{width:56px;height:56px}}',
    '@keyframes bfStudHop{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}',
    '@keyframes bfStudWobble{0%,100%{transform:rotate(-4deg) scale(1)}50%{transform:rotate(4deg) scale(1.05)}}',
    '@keyframes bfStudSpark{0%,100%{opacity:.3;transform:scale(.7)}50%{opacity:1;transform:scale(1.25)}}'
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

  function tick(){ swapCoachIcon(); hideRoamingGuideDuringDemo(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
  new MutationObserver(tick).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['style','class'] });
})();
</script>
`;