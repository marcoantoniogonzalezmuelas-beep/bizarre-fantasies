// Parche inyectado en el iframe: DELAY de 1 segundo entre el turno del
// jugador humano y el turno de la IA.
//
// Problema: cuando el jugador humano juega su turno, la IA actúa
// inmediatamente después y las animaciones se solapan, yendo todo demasiado
// rápido para seguir las acciones con claridad.
//
// Solución: envolvemos endTurn (que avanza al siguiente héroe) con una capa
// adicional que añade 500ms de delay extra cuando el humano acaba de actuar
// en una partida contra la IA. Combinado con los delays existentes (200ms de
// finishAct + 300ms de endTurn __bfSlow), el total es ~1000ms entre la acción
// del humano y el inicio del turno de la IA.
//
// Entre turnos de la propia IA no se añade delay extra (la IA ya va lenta
// de por sí) y en modo online/local tampoco (no hay IA que esperar).
export const AI_TURN_DELAY_PATCH = `
<script>
(function(){
  if (window.__bfAiTurnDelayPatch) return;
  window.__bfAiTurnDelayPatch = true;

  function isAiGame() {
    try {
      if (typeof G === 'undefined' || !G || G.demo) return false;
      if (typeof online === 'function' && online()) return false;
      return !!G.oppHuman ? false : (G.oppHuman === false || (typeof NET === 'undefined' || !NET || !NET.role));
    } catch(e) { return false; }
  }

  function installDelay() {
    if (typeof window.endTurn !== 'function' || window.endTurn.__bfAiDelay) return;
    var inner = window.endTurn;
    window.endTurn = function() {
      var args = arguments, self = this;
      // Si el humano acaba de terminar su turno en una partida contra la IA,
      // añadimos 500ms extra para que el jugador vea las animaciones antes
      // de que la IA empiece a actuar.
      // Humano → IA: 1500ms extra. Entre turnos consecutivos de la propia IA:
      // 1000ms extra, para poder seguir qué hace cuando actúa varias veces
      // seguidas y para que no se solapen sus animaciones.
      var extraDelay = 0;
      try {
        if (isAiGame() && typeof B !== 'undefined' && B && B.current) {
          extraDelay = B.current.side === 'p' ? 1500 : 1000;
        }
      } catch(e) {}
      if (extraDelay > 0) {
        setTimeout(function() { inner.apply(self, args); }, extraDelay);
      } else {
        return inner.apply(self, args);
      }
    };
    window.endTurn.__bfAiDelay = 1;
  }

  // Poll hasta que endTurn esté definida y la hayamos envuelto.
  var tries = 0;
  var t = setInterval(function() {
    installDelay();
    if (tries++ > 200) clearInterval(t);
  }, 100);
})();
</script>
`;