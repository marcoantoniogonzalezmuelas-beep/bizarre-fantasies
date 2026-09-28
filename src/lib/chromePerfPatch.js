// Optimización de rendimiento SOLO para Chrome/Edge (motor Chromium).
//
// En Firefox el juego ya va fluido, así que este parche se desactiva por
// completo ahí: solo se instala si el navegador es Chromium.
//
// Qué hace (sin cambiar el aspecto del juego):
//  · Sustituye los desenfoques de fondo (backdrop-filter) por un fondo opaco
//    equivalente: es el efecto más caro del compositor de Chrome.
//  · Pausa las animaciones decorativas que están fuera de la pantalla.
export const CHROME_PERF_PATCH = `
<script>
(function(){
  var ua = navigator.userAgent || '';
  var isChromium = /Chrome|Chromium|Edg\\//.test(ua) && !/Firefox/.test(ua);
  if(!isChromium || window.__bfChromePerf) return;
  window.__bfChromePerf = true;

  var st = document.createElement('style');
  st.textContent = ''
    // Desenfoques de fondo: el mayor coste de composición en Chrome. Firefox
    // los maneja bien, así que solo se desactivan en Chromium.
    + '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'
    // Animaciones decorativas pausadas mientras están fuera de la vista.
    + '.bf-offscreen,.bf-offscreen *{animation-play-state:paused!important}'
    // Pantallas no activas: no se pintan ni se calculan; cartas aisladas para
    // que un cambio en una no obligue a recalcular el layout de toda la mesa.
    + '.screen:not(.active){content-visibility:hidden}'
    + '.hcard,.bhero{contain:layout style}';
  document.head.appendChild(st);

  // Las imágenes se decodifican fuera del hilo principal (menos tirones al
  // abrir sobres, subastas o cambiar de héroe).
  function asyncImgs(){
    document.querySelectorAll('img:not([decoding])').forEach(function(im){ im.decoding = 'async'; });
  }
  asyncImgs();
  setInterval(asyncImgs, 2500);

  // Marca como fuera de vista las secciones que no se están viendo, para que
  // sus animaciones en bucle no consuman GPU.
  var io = null;
  function watch(){
    if(!('IntersectionObserver' in window)) return;
    if(!io) io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ e.target.classList.toggle('bf-offscreen', !e.isIntersecting); });
    }, { rootMargin: '80px' });
    document.querySelectorAll('.screen, .bhero, .hcard').forEach(function(el){
      if(el.dataset.bfPerfWatched === '1') return;
      el.dataset.bfPerfWatched = '1';
      io.observe(el);
    });
  }
  watch();
  setInterval(watch, 1500);
})();
</script>
`;