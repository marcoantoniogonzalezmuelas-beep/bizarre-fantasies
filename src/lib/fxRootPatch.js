// Parche inyectado en el iframe: crea un contenedor #bf-fx-root colgado de
// <html> (documentElement), NO de <body>. En móvil/tablet el body lleva un
// transform permanente (translate3d + scale del pellizco), y los elementos
// position:fixed que cuelgan del body se posicionan respecto al espacio
// del body transformado, no al viewport. Eso hacía que los FX de hechizos
// (Maremoto, Bola de Fuego…) aparecieran en coordenadas equivocadas cuando
// había zoom: getBoundingClientRect() da coordenadas visuales, pero al
// fijarlas en el body escalado se duplicaba la transformación y el efecto
// salía desplazado/fuera de pantalla (la "zona negra" al pellizcar).
//
// Con #bf-fx-root fuera del body transformado, position:fixed vuelve a ser
// relativo al viewport real y las coordenadas visuales de
// getBoundingClientRect() se usan directamente. En escritorio (sin zoom) el
// contenedor es equivalente a body y todo funciona igual que antes.
export const FX_ROOT_PATCH = `
<script>
(function(){
  if(window.__bfFxRootPatch)return;
  window.__bfFxRootPatch=true;

  function ensure(){
    var r=document.getElementById('bf-fx-root');
    if(r)return r;
    r=document.createElement('div');
    r.id='bf-fx-root';
    // position:fixed sin transform propio: sus hijos position:fixed se
    // posicionan respecto al viewport real, no al body escalado.
    r.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:99990';
    // Colgar de documentElement (NO de body): body tiene el transform del
    // pellizco y arrastraría a todos sus descendientes fixed.
    document.documentElement.appendChild(r);
    return r;
  }
  window.__bfFxRoot=ensure;
  // Helper de append: manda SIEMPRE al FX root. Solo lo usan los parches de
  // FX (hechizos, ataques, cinemáticas) con position:fixed, así que es seguro.
  // Los nodos que deben vivir en body (guía, pujas…) se añaden con appendChild
  // directo y no pasan por aquí.
  window.__bfAppend=function(node){ try{ node.dataset.bfT=Date.now(); }catch(e){} ensure().appendChild(node); };

  // Red de seguridad: si un efecto se queda colgado (animación congelada, un
  // setTimeout de borrado que no llegó a ejecutarse, un lote de FX duplicado…)
  // el turno se quedaba bloqueado para siempre, porque la comprobación de
  // "escena ocupada" ve hijos en la capa de FX. Todo nodo de FX con más de 8s
  // se elimina: ninguna animación del juego dura tanto.
  //
  // MULTIPLAYER: el mpFxSyncPatch envía TODOS los flushFx del host al
  // invitado por el relay. Si una ráfaga llega de golpe (20+ eventos de un
  // ataque multi-objetivo), el invitado los procesa todos a la vez y los nodos
  // se acumulan en #bf-fx-layer SIN que sus setTimeout de borrado lleguen a
  // ejecutarse (el navegador está congelado procesando). Sin esta limpieza
  // extendida a #bf-fx-layer, fxBusy ve hijos para siempre y el turno NUNCA
  // avanza → la partida se satura totalmente.
  var MAX_AGE=8000;
  function cleanContainer(sel){
    var c=document.getElementById(sel);
    if(!c||!c.children.length)return;
    var now=Date.now();
    Array.prototype.slice.call(c.children).forEach(function(n){
      if(n.nodeType!==1||n.dataset.bfIndicator==='1')return;
      var t=Number(n.dataset&&n.dataset.bfT||0);
      // Nodos sin timestamp (FX del juego original que no pasan por __bfAppend):
      // se marca la primera vez que se ven y se eliminan tras MAX_AGE.
      if(!t){
        if(!n.dataset.bfSeen)n.dataset.bfSeen=String(now);
        t=Number(n.dataset.bfSeen);
      }
      if(t&&now-t>MAX_AGE&&n.parentNode)n.parentNode.removeChild(n);
    });
  }
  // Limpieza de cinemáticas 3D atascadas: si #bf-abil-anim lleva más de 6s en
  // pantalla, su setTimeout de borrado (5s) no ejecutó (navegador congelado por
  // ráfaga de FX del relay). Sin esto, cineBusy() siempre devuelve true y el
  // turno nunca avanza. Se elimina y se restaura el tablero.
  setInterval(function(){
    var ov=document.getElementById('bf-abil-anim');
    if(ov){
      var t=Number(ov.dataset&&ov.dataset.bfT||0);
      if(!t){ov.dataset.bfT=String(Date.now());t=Number(ov.dataset.bfT);}
      if(Date.now()-t>6000){
        if(ov.parentNode)ov.parentNode.removeChild(ov);
        // Restaurar paneles congelados
        document.querySelectorAll('.bf-cine-frozen').forEach(function(p){
          try{p.classList.remove('bf-cine-frozen');}catch(e){}
        });
      }
    }
  },1000);
  setInterval(function(){
    cleanContainer('bf-fx-root');
    cleanContainer('bf-fx-layer');
  },1500);
  // Re-crea el contenedor si alguien lo borra (el juego reconstruye el DOM).
  var _t=setInterval(function(){ ensure(); },2000);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);
  else ensure();
})();
</script>
`;