// Optimización de fluidez (sobre todo en Chrome):
//  1. Agrupa las llamadas repetidas a renderBattle/renderHand en un único
//     repintado por frame (muchos parches las llaman varias veces seguidas).
//  2. Congela los temporizadores de sondeo cuando la pestaña no está visible.
//  3. Evita repintados costosos de sombras/filtros durante el scroll/animación
//     limitando las capas compuestas del tablero.
export const PERF_BOOST_PATCH = `
<script>
(function(){
  if(window.__bfPerfBoost) return;
  window.__bfPerfBoost = true;

  // 1) Coalescer de renders: varias llamadas en el mismo frame = un solo pintado.
  function coalesce(name){
    var orig = window[name];
    if(typeof orig !== 'function' || orig.__bfCoalesced) return false;
    // La primera llamada se ejecuta al instante (así el DOM queda listo para
    // quien lo lea justo después); las repeticiones dentro del mismo frame se
    // descartan, que es lo que provocaba los tirones en Chrome.
    var painted = false;
    var wrapped = function(){
      if(painted) return;
      painted = true;
      requestAnimationFrame(function(){ painted = false; });
      try{ orig.call(window); }catch(e){}
    };
    wrapped.__bfCoalesced = true;
    window[name] = wrapped;
    return true;
  }

  var tries = 0, t = setInterval(function(){
    var ok = coalesce('renderBattle');
    coalesce('renderHand');
    if(ok || tries++ > 120) clearInterval(t);
  }, 150);

  // 2) Los sondeos (setInterval) no gastan CPU con la pestaña oculta.
  var origInterval = window.setInterval;
  window.setInterval = function(fn, ms){
    if(typeof fn !== 'function') return origInterval.apply(window, arguments);
    var args = Array.prototype.slice.call(arguments, 2);
    return origInterval.call(window, function(){
      if(document.hidden) return;
      fn.apply(null, args);
    }, ms);
  };

  // 3) Menos repintados en Chrome: el tablero y las cartas se pintan en su
  //    propia capa y no propagan invalidaciones al resto del documento.
  var st = document.createElement('style');
  st.textContent = '#battle-wrap,.hand-zone,.jrpg-actions{transform:translateZ(0)}'
    + '.hero-card,.hcard{backface-visibility:hidden}'
    + '@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}';
  document.head.appendChild(st);
})();
</script>
`;