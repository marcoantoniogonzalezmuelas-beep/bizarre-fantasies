// Nombre del héroe en batalla SIEMPRE legible y en una línea de altura fija.
//
// Problema: la etiqueta de stats (.vel-tag) ahora lleva muchos números (stat
// efectivo, otros dos stats y velocidad) y acapara el ancho de la cabecera; el
// nombre se quedaba sin espacio y solo se veían los puntos suspensivos.
//
// Solución: el nombre tiene PRIORIDAD de ancho (flex:1, no se encoge), la
// etiqueta de stats no crece más allá de su contenido, y un auto-ajuste reduce
// el cuerpo de letra del nombre si aun así no cabe (hasta un mínimo legible)
// antes de recortar con puntos.
export const HERO_NAME_FIT_PATCH = `
<style>
/* El nombre acompaña al tamaño de la barra de atributos (que ahora es más
   ancha): mismo cuerpo de letra, sigue en UNA sola línea de altura fija. */
.bhero .bhero-top{min-height:40px!important;display:flex!important;align-items:center!important;gap:6px!important;contain:layout style}
/* El nombre TIENE prioridad de ancho: ocupa todo el espacio libre y no se
   deja robar por la etiqueta de stats. min-width:0 permite el recorte final. */
.bhero .bhero-name{flex:1 1 auto!important;min-width:0!important;text-align:left!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:15px!important;line-height:20px!important}
/* La etiqueta de stats NO crece ni se encoge: ocupa solo su contenido y se
   queda al final de la cabecera, sin pisar el nombre. */
.bhero .vel-tag{flex:0 0 auto!important;white-space:nowrap!important;display:inline-flex!important;align-items:center}
</style>
<script>
(function(){
  if(window.__bfHeroNameFit) return;
  window.__bfHeroNameFit = true;

  var MIN_FS = 9;     // mínimo legible
  var MAX_FS = 15;     // tamaño nominal
  var STEP = 1;

  // Ajusta el cuerpo de letra de cada nombre para que quepa entero (sin
   // puntos suspensivos) cuando es posible. Solo se reduce; si al mínimo sigue
   // sin caber, el CSS ya pone los puntos.
  function fit(){
    var names = document.querySelectorAll('#s-battle.active .bhero .bhero-name');
    names.forEach(function(el){
      // Limpia el flag de iteraciones anteriores.
      if(el.__bfFs == null) el.__bfFs = MAX_FS;
      var fs = MAX_FS;
      el.style.fontSize = fs + 'px';
      // Si ya cabe al máximo, listo.
      if(el.scrollWidth <= el.clientWidth){ el.__bfFs = fs; return; }
      // Va reduciendo hasta que quepa o llegue al mínimo.
      while(fs > MIN_FS && el.scrollWidth > el.clientWidth){
        fs -= STEP;
        el.style.fontSize = fs + 'px';
      }
      el.__bfFs = fs;
    });
  }

  // Se ejecuta tras cada repintado del tablero (cuando el motor reconstruye los
  // retratos) y por intervalo como red de seguridad.
  function hook(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfNameFit) return false;
    var orig = window.renderBattle;
    window.renderBattle = function(){ var r = orig.apply(this, arguments); try{ fit(); }catch(e){} return r; };
    window.renderBattle.__bfNameFit = 1;
    return true;
  }
  var t = 0; (function w(){ if(hook() || t++ > 120) return; setTimeout(w, 200); })();
  setInterval(function(){ try{ fit(); }catch(e){} }, 500);
  fit();
})();
</script>
`;