// Registro de batalla en orden de causa → efecto: el juego pinta las líneas
// con la más reciente ARRIBA, así que la muerte de un héroe aparecía por
// encima del golpe que la provocaba (se leía al revés).
//
// Este parche detecta en vivo si las líneas nuevas se insertan al principio
// (más reciente primero) y, solo en ese caso, invierte el orden VISUAL del
// registro con CSS (column-reverse). El DOM no se toca, así que el narrador
// (que lee la primera línea) sigue funcionando igual.
export const BATTLE_LOG_ORDER_PATCH = `
<script>
(function(){
  if(window.__bfLogOrder) return;
  window.__bfLogOrder = true;

  var SELS = ['.b-log','#b-log','.log-box','.battle-log','.jrpg-log','#jrpg-log'];
  function logEl(){
    for(var i=0;i<SELS.length;i++){ var e=document.querySelector(SELS[i]); if(e) return e; }
    return null;
  }

  var watched = null, lastFirst = '', lastLast = '';

  function applyReverse(el){
    if(el.dataset.bfLogRev==='1') return;
    el.dataset.bfLogRev='1';
    el.style.display='flex';
    el.style.flexDirection='column-reverse';
    el.style.justifyContent='flex-end';
  }

  setInterval(function(){
    var el = logEl();
    if(!el) return;
    if(el!==watched){ watched=el; lastFirst=''; lastLast=''; }
    var kids = el.children;
    if(!kids.length) return;
    var f = (kids[0].textContent||'').trim();
    var l = (kids[kids.length-1].textContent||'').trim();
    // Línea nueva insertada al principio → el registro va del más reciente al
    // más antiguo: se invierte visualmente para leer golpe → caída.
    if(lastFirst && f!==lastFirst && l===lastLast) applyReverse(el);
    lastFirst = f; lastLast = l;
  }, 400);
})();
</script>
`;