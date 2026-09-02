// Coordinador ÚNICO del orden de las hojas de estilo de los parches.
//
// CAUSA REAL DEL PARPADEO EN TABLET: cinco parches (quietud de héroes, congelado
// total, tamaño estable, tamaño igualado y foil) mantenían cada uno un
// setInterval que re-añadía SU <style> al final del <head> para ganar por orden
// de cascada. Solo uno puede ser el último, así que se robaban la posición unos
// a otros en bucle infinito: mover un <style> invalida la hoja entera y fuerza
// un RECÁLCULO DE ESTILOS COMPLETO del documento cada ~1 s, para siempre. En
// móvil (lienzo de 860px) el repintado resultante es pequeño y pasa
// desapercibido; en tablet (lienzo de 1280px a escala ~0,7 con pantalla retina)
// cada recálculo repinta una textura enorme y se ve como un parpadeo constante
// durante las animaciones. (El mismo mecanismo que ya se documentó y corrigió
// una vez en endGameFixPatch: "los dos se movían el uno detrás del otro sin
// parar y ese vaivén forzaba un recálculo de estilos completo".)
//
// SOLUCIÓN: los parches ya no compiten. Registran su hoja aquí con una
// prioridad fija y este coordinador mantiene TODAS juntas al final del <head>,
// siempre en el mismo orden. En estado estable no toca el DOM (cero
// recálculos); solo reordena cuando el juego inyecta una hoja nueva por encima,
// y lo hace una única vez y en lote.
//
// Este parche debe inyectarse ANTES que los que se registran (va el primero en
// el INJECT de Home.jsx).
export const STYLE_ORDER_PATCH = `
<script>
(function(){
  if(window.__bfStyleOrder) return;
  var reg = [];
  var pending = null;

  // ¿Están las hojas registradas ya al final del <head> y en su orden?
  function inOrder(){
    var kids = document.head.children;
    var n = kids.length;
    if(n < reg.length) return false;
    for(var i = 0; i < reg.length; i++){
      if(kids[n - reg.length + i] !== reg[i].st) return false;
    }
    return true;
  }

  function ensure(){
    if(!reg.length || inOrder()) return;
    // Re-append en lote y en orden de prioridad: un solo recálculo, y solo
    // cuando de verdad hacía falta.
    for(var i = 0; i < reg.length; i++){
      try{ document.head.appendChild(reg[i].st); }catch(e){}
    }
  }

  function schedule(){
    if(pending) return;
    pending = setTimeout(function(){ pending = null; ensure(); }, 250);
  }

  // API para los parches: registra la hoja con su prioridad (menor = antes,
  // mayor = más al final del head, es decir, gana la cascada).
  window.__bfStyleOrder = function(st, prio){
    if(!st) return;
    for(var i = 0; i < reg.length; i++){ if(reg[i].st === st) return; }
    reg.push({ st: st, prio: prio || 0 });
    reg.sort(function(a, b){ return a.prio - b.prio; });
    schedule();
  };

  // Vigilancia barata: si el juego inyecta una hoja nueva en el <head>, se
  // reordena una vez (con debounce). El propio ensure() dispara el observer,
  // pero a la siguiente pasada inOrder() da true y no se toca nada.
  function watch(){
    if(!document.head) return setTimeout(watch, 50);
    try{
      new MutationObserver(schedule).observe(document.head, { childList: true });
    }catch(e){}
    // Red de seguridad por si el observer no está disponible.
    setInterval(ensure, 3000);
  }
  watch();
})();
</script>
`;
