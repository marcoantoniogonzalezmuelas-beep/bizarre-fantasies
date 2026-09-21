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

  // 0) Optimizaciones CSS universales (todos los navegadores):
  //  - Aislar cada carta de hero y el tablero con contain para que repintar
  //    una carta no fuerce recalcular el layout de las vecinas.
  //  - content-visibility:auto en el registro de batalla (lista larga): el
  //    navegador salta su renderizado cuando esta fuera de la vista.
  //  - Reemplazar las animaciones de background-position (fondo del panel de
  //    accion y brasas) por animaciones de solo transform: animar
  //    background-position fuerza re-rasterizar la imagen en cada frame en
  //    TODOS los navegadores; transform es GPU-acelerado.
  var st = document.createElement('style');
  st.textContent = ''
    + '#s-battle{contain:layout style paint}'
    + '.bhero{contain:layout style paint}'
    + '.b-log,#battle-log,.log-list{content-visibility:auto;contain-intrinsic-size:auto 200px}'
    + '.bf-action-bg{will-change:transform!important}'
    + '@keyframes bfActionZoom{0%{transform:scale(1.02) translateY(0)}100%{transform:scale(1.3) translateY(-6%)}}'
    + '.bf-action-embers{will-change:transform!important}'
    + '@keyframes bfEmbers{0%{transform:translateY(0)}100%{transform:translateY(-32px)}}';
  document.head.appendChild(st);

  // 1) Coalescer de renders: varias llamadas en el mismo frame = un solo pintado.
  function coalesce(name){
    var orig = window[name];
    if(typeof orig !== 'function' || orig.__bfCoalesced) return false;
    // Paint immediately, then retain the LAST request in this frame. Dropping
    // it could leave B.current=null painted while the next hero already acts.
    var painted = false, trailing = null;
    function nextFrame(){
      painted = false;
      if(!trailing)return;
      var call = trailing; trailing = null;
      wrapped.apply(call.self, call.args);
    }
    var wrapped = function(){
      if(painted){ trailing = { self:this, args:Array.prototype.slice.call(arguments) }; return; }
      painted = true;
      requestAnimationFrame(nextFrame);
      return orig.apply(this, arguments);
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