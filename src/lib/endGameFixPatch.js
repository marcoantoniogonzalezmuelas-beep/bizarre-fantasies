// Parche inyectado en el iframe: FIN DE PARTIDA — tres arreglos:
//
// 1) RED DE SEGURIDAD: si todos los héroes de un bando están muertos pero el
//    juego no ha terminado (checkWin no se disparó por un error en
//    renderBattle/finishAct/endTurn), se fuerza showResult. Así la partida
//    nunca se queda colgada con el jugador mirando héroes a 0 HP.
//
// 2) GRIS EN HÉROES CAÍDOS: el parche anti-parpadeo (mobileAntiFlickerPatch)
//    aplica filter:none!important a todo elemento con clase bf-, lo que anula
//    el grayscale de los héroes caídos en la cinemática final. Aquí se
//    reinyecta el grayscale con un selector MÁS ESPECÍFICO y se añade un
//    velo oscuro superpuesto (sin filter) para que el efecto se vea incluso
//    en móvil/tablet donde el anti-parpadeo está activo.
//
// 3) TUMBA: los héroes caídos en la cinemática final llevan una lápida
//    decorativa (🪦) sobre el retrato, además del grayscale.
export const END_GAME_FIX_PATCH = `
<style id="bf-end-game-fix">
/* Exime a la cinemática de fin de partida del anti-parpadeo: los filtros de
   los héroes caídos (grayscale) deben verse. Mayor especificidad + !important. */
#bf-end-cine .bf-cine-fallen .bf-cine-portrait,
#bf-end-cine .bf-cine-fallen .bf-cine-portrait img {
  filter: grayscale(.85) brightness(.55) !important;
}
#bf-end-cine .bf-cine-fallen .bf-cine-portrait {
  border-color: #5a4a72 !important;
  box-shadow: 0 8px 20px rgba(0,0,0,.8), inset 0 0 30px rgba(0,0,0,.6) !important;
  opacity: .82 !important;
}
/* Velo oscuro superpuesto al retrato caído: refuerza el efecto sin filter. */
#bf-end-cine .bf-cine-fallen .bf-cine-portrait::after {
  content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: linear-gradient(180deg, rgba(20,10,30,.35), rgba(0,0,0,.55));
  border-radius: inherit;
}
/* Lápida sobre el retrato caído */
#bf-end-cine .bf-cine-fallen .bf-cine-portrait::before {
  content: "🪦"; position: absolute; top: -18px; left: 50%; transform: translateX(-50%);
  z-index: 3; font-size: clamp(22px, 4vw, 38px); line-height: 1;
  filter: drop-shadow(0 3px 6px #000) drop-shadow(0 0 10px rgba(120,100,150,.5)) !important;
  animation: bfTombAppear .6s ease-out calc(.8s + var(--bf-delay)) both;
}
@keyframes bfTombAppear {
  0% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(.5); }
  60% { opacity: 1; transform: translateX(-50%) translateY(4px) scale(1.1); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}
/* Nombre del héroe caído en tono apagado */
#bf-end-cine .bf-cine-fallen .bf-cine-name {
  color: #9a8ba8 !important;
  border-color: rgba(90,74,114,.5) !important;
  background: rgba(10,6,18,.85) !important;
}
</style>
<script>
(function(){
  if(window.__bfEndGameFix) return;
  window.__bfEndGameFix = true;

  // ---- 1) RED DE SEGURIDAD: fuerza el fin de partida si un bando está extinto ----
  // Se ejecuta cada 500 ms SOLO durante la pantalla de batalla. Si todos los
  // héroes de un bando tienen alive=false y el juego no ha terminado (B.over
  // es false), fuerza checkWin() → showResult. Esto cubre el caso en el que
  // un error en renderBattle/finishAct/endTurn impide que checkWin se dispare.
  var forceCheckTries = 0;
  setInterval(function(){
    try {
      if(typeof G === 'undefined' || !G || G.demo) return;
      if(typeof B === 'undefined' || !B || B.over) return;
      var battle = document.getElementById('s-battle');
      if(!battle || !battle.classList.contains('active')) return;
      if(!G.team || !G.team.p || !G.team.o) return;
      var pAlive = (G.team.p || []).filter(function(h){ return h && h.alive && !h._bfDuck; }).length;
      var oAlive = (G.team.o || []).filter(function(h){ return h && h.alive && !h._bfDuck; }).length;
      if(pAlive === 0 || oAlive === 0) {
        // Un bando está extinto pero el juego no lo ha detectado: fuerza checkWin.
        if(typeof checkWin === 'function') {
          checkWin();
        } else if(typeof window.checkWin === 'function') {
          window.checkWin();
        }
      }
    } catch(e) {}
  }, 500);

  // ---- 2) Reinyecta el CSS de la cinemática si el anti-parpadeo lo anula ----
  // El anti-parpadeo se reinserta como último <style> del <head> cada 800 ms.
  // Nuestro CSS tiene mayor especificidad (#bf-end-cine ...) + !important, así
  // que debería ganar, pero lo reinsertamos por si acaso.
  setInterval(function(){
    var s = document.getElementById('bf-end-game-fix');
    if(!s) return;
    // Si el anti-parpadeo va después, movemos nuestro estilo después de él.
    var anti = document.getElementById('bf-antiflicker');
    if(anti && anti.parentNode === s.parentNode && anti.previousSibling === s) {
      // anti está después: movemos nuestro estilo al final
      document.head.appendChild(s);
    }
  }, 1000);
})();
</script>
`;