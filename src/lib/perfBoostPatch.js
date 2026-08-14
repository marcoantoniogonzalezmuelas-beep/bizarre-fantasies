// Optimización de fluidez (sobre todo en Chrome):
//  1. Agrupa las llamadas repetidas a renderBattle/renderHand en un único
//     repintado por frame (muchos parches las llaman varias veces seguidas).
//  2. Congela los temporizadores de sondeo cuando la pestaña no está visible.
// No toca el CSS ni la portada: solo afecta al bucle de repintado del juego
// (equipamiento y batalla).
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

  // (Sin cambios de CSS: las capas compuestas hacían parpadear los iconos de
  //  la portada, así que la portada se deja exactamente como estaba.)
})();
</script>
`;