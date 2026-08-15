// Parparpadeo 0 al hacer zoom de pellizco (móvil/tablet), en TODAS las fases
// del juego: subasta, equipamiento y batalla.
//
// CAUSA: mientras el dedo pellizca, el body está escalado (una sola capa GPU
// del tamaño de la pantalla). Los sondeos del juego y de los parches siguen
// llamando a sus funciones de repintado (renderBattle, renderHand, la subasta,
// la tienda…) varias veces por segundo. Cada repintado reconstruye nodos dentro
// de esa capa escalada, la GPU tiene que rehacer la textura entera y en tablet
// eso se ve como parpadeo.
//
// SOLUCIÓN: mientras hay gesto de pellizco (y durante el pequeño reencuadre al
// soltar) los repintados NO se ejecutan: se guarda que había uno pendiente y se
// hace UNA sola vez al terminar el gesto. La lógica del juego no se toca: solo
// se retrasa el dibujado unos milisegundos, y el estado que se pinta al final es
// el actual.
export const PINCH_FREEZE_PATCH = `
<script>
(function(){
  if(window.__bfPinchFreeze) return;
  window.__bfPinchFreeze = true;

  // Ventana de "gesto activo": el pellizco en curso + el reencuadre con
  // transición al soltar (durante la transición también parpadearía).
  var until = 0;
  function busy(){
    var g = false;
    try{ g = !!(window.__bfPinchBusy && window.__bfPinchBusy()); }catch(e){}
    if(g){ until = Date.now() + 420; return true; }
    return Date.now() < until;
  }
  document.addEventListener('touchstart', function(e){
    if(e.touches && e.touches.length >= 2) until = Date.now() + 420;
  }, { capture: true, passive: true });

  // Funciones de repintado que se congelan durante el gesto. Cubren la subasta,
  // el equipamiento/tienda, la mano y la batalla.
  var NAMES = ['renderBattle','renderHand','renderRecruit','renderAuction','renderShop',
               'renderEquip','renderSetup','renderTeam','renderArmy','renderBoard','render'];
  var pending = {};

  function freeze(name){
    var orig = window[name];
    if(typeof orig !== 'function' || orig.__bfPinchFrozen) return false;
    var wrapped = function(){
      if(busy()){ pending[name] = 1; return; }
      return orig.apply(this, arguments);
    };
    wrapped.__bfPinchFrozen = 1;
    wrapped.__bfOrig = orig;
    window[name] = wrapped;
    return true;
  }

  // Al soltar, un único repintado por función que lo pidiera.
  setInterval(function(){
    if(busy()) return;
    for(var n in pending){
      if(!pending[n]) continue;
      pending[n] = 0;
      var f = window[n];
      var target = (f && f.__bfPinchFrozen) ? f.__bfOrig : f;
      if(typeof target === 'function'){ try{ target.call(window); }catch(e){} }
    }
  }, 120);

  // Los parches se cargan de forma escalonada: se reintenta hasta cubrirlas.
  var tries = 0, t = setInterval(function(){
    for(var i=0;i<NAMES.length;i++) freeze(NAMES[i]);
    if(tries++ > 200) clearInterval(t);
  }, 200);
})();
</script>
`;