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
    // Desenfoques de fondo: el mayor coste de composición en Chrome.
    + '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'
    // El tablero de batalla se aísla en su propia capa: los repintados de las
    // tarjetas ya no obligan a rehacer toda la pantalla.
    + '#s-battle{contain:layout style paint}'
    // Cada carta de héroe se aísla en su propia capa de layout/paint: repintar
    // una carta no fuerza recalcular el layout de sus vecinas.
    + '.bhero{contain:layout style paint}'
    // El registro de batalla (lista larga y scrollable) se salta su renderizado
    // cuando está fuera de la vista: content-visibility:auto es el mayor ahorro
    // de pintado en Chrome para listas largas.
    + '.b-log,#battle-log,.log-list{content-visibility:auto;contain-intrinsic-size:auto 200px}'
    // ANIMACIÓN DEL FONDO DEL PANEL DE ACCIÓN: el juego original anima
    // background-position, que en Chrome fuerza re-rasterizar la imagen de
    // fondo en CADA frame (la causa nº1 de tirones en batalla). Se sustituye
    // por una animación de solo transform (scale+translate), que es
    // GPU-acelerada y no toca el fondo.
    + '.bf-action-bg{will-change:transform!important}'
    + '@keyframes bfActionZoom{0%{transform:scale(1.02) translateY(0)}100%{transform:scale(1.3) translateY(-6%)}}'
    // Las brasas del panel (bfEmbers) también animaban background-position: lo
    // mismo, se reemplaza por un desplazamiento con transform.
    + '.bf-action-embers{will-change:transform!important}'
    + '@keyframes bfEmbers{0%{transform:translateY(0)}100%{transform:translateY(-32px)}}'
    // Animaciones decorativas pausadas mientras están fuera de la vista.
    + '.bf-offscreen,.bf-offscreen *{animation-play-state:paused!important}';
  document.head.appendChild(st);

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