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

  // Al ejecutar una acción, el panel del héroe se OCULTA hasta que el turno
  // pasa de verdad. Así la animación y los efectos visuales se ven limpios y
  // el panel no reaparece un instante antes de cambiar de héroe.
  // Se usa visibility (no display) para que el tablero no se mueva.
  var st = document.createElement('style');
  st.textContent = '#s-battle.bf-acting .active-hero-panel{visibility:hidden!important}';
  (document.head || document.documentElement).appendChild(st);

  var acted = false, backT = null;
  function battleEl() { return document.getElementById('s-battle'); }
  function hidePanel() { var b = battleEl(); if (b) b.classList.add('bf-acting'); }
  function showPanel() { acted = false; var b = battleEl(); if (b) b.classList.remove('bf-acting'); }

  // El panel se recoge en el MISMO instante en que se pulsa la acción, no al
  // terminarla: así no se queda visible durante la animación.
  document.addEventListener('click', function(e) {
    try {
      var t = e.target;
      if (t && t.closest && t.closest('.active-hero-panel')) {
        hidePanel();
        // Si el clic no era una acción (elegir objetivo, cancelar…), el panel
        // vuelve enseguida: solo se queda oculto si la acción se ejecuta.
        clearTimeout(backT);
        backT = setTimeout(function() { if (!acted) showPanel(); }, 900);
      }
    } catch(err) {}
  }, true);

  function installActHide() {
    if (typeof window.finishAct !== 'function' || window.finishAct.__bfHidePanel) return;
    var inner = window.finishAct;
    window.finishAct = function() {
      acted = true;
      clearTimeout(backT);
      hidePanel();
      // Seguro: si por cualquier motivo el turno no avanza, el panel vuelve.
      setTimeout(showPanel, 6000);
      return inner.apply(this, arguments);
    };
    window.finishAct.__bfHidePanel = 1;
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
          extraDelay = B.current.side === 'p' ? 1500 : 2400;
        }
      } catch(e) {}
      if (extraDelay > 0) {
        setTimeout(function() { showPanel(); inner.apply(self, args); }, extraDelay);
      } else {
        showPanel();
        return inner.apply(self, args);
      }
    };
    window.endTurn.__bfAiDelay = 1;
  }

  // Poll hasta que endTurn esté definida y la hayamos envuelto.
  var tries = 0;
  var t = setInterval(function() {
    installDelay();
    installActHide();
    if (tries++ > 200) clearInterval(t);
  }, 100);
})();
</script>
`;