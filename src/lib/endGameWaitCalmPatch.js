// Antes de mostrar la animación del GOLPE DEFINITIVO (fin de partida), espera
// siempre a que acaben TODAS las animaciones 3D en cola.
//
// PROBLEMA: cuando un golpe mata al último héroe y decide la partida, el juego
// lanza de inmediato la cinemática de fin de batalla (bfEndCinematic / showResult
// / transición a s-result). Pero es posible que aún haya animaciones 3D en cola
// (la habilidad que causó la muerte, la cinemática de golpe mortal, la carta
// especial…) que se ven cortadas o solapadas por la pantalla final.
//
// SOLUCIÓN: engancha bfEndCinematic, showResult y la transición a s-result para
// que NO se ejecuten mientras quede ninguna animación 3D en pantalla o en cola.
// Como bfEndCinematic se llama cada 400ms, basta con "saltar" la llamada cuando
// la escena no está calmada: se volverá a intentar en el siguiente ciclo. Para
// showResult/show (que son llamadas puntuales) se usa un bucle de espera con
// techo de seguridad (12 s) para no colgar el juego si una cinemática se atasca.
export const END_GAME_WAIT_CALM_PATCH = `
<script>
(function(){
  if(window.__bfEndWaitCalm) return;
  window.__bfEndWaitCalm = true;

  function indicatorsBusy(){return typeof window.__bfIndicatorsBusy==='function'&&window.__bfIndicatorsBusy();}
  // ¿Queda alguna animación 3D o aviso de combate en pantalla o en cola?
  function calm(){
    try{
      if(document.getElementById('bf-abil-anim')) return false;
      if(document.getElementById('bf-spec-cine')) return false;
      if(document.getElementById('bf-rearm-cine')) return false;
      if(typeof window.__bfCinematicBusy === 'function' && window.__bfCinematicBusy()) return false;
      // Partida terminada: tras la animación de la acción definitiva se pasa
      // directo a la animación final. No se esperan números de daño, golpe
      // mortal en cola ni avisos de combate (antes sumaban varios segundos).
      if(typeof B !== 'undefined' && B && B.over){
        var ko = document.getElementById('bf-kill-ov');
        if(ko && ko.parentNode) ko.parentNode.removeChild(ko);
        return true;
      }
      if(document.getElementById('bf-kill-ov')) return false;
      if(indicatorsBusy())return false;
      if(typeof window.__bfKillCinePending === 'function' && window.__bfKillCinePending()) return false;
      if(document.body.classList.contains('bf-cine-active')) return false;
    }catch(e){}
    return true;
  }

  // ---- 1) bfEndCinematic: el juego la llama cada 400ms. Si la partida ha
  // terminado (B.over) pero aún hay animaciones 3D, se SALTA la llamada: se
  // reintentará en el siguiente ciclo de 400ms. Cuando todo esté calmado, la
  // llamada pasa al original y muestra la cinemática de fin de partida. ----
  function hookEndCine(){
    var orig = window.bfEndCinematic;
    if(typeof orig !== 'function' || orig.__bfWaitCalm) return false;
    var wrapped = function(){
      try{
        if(typeof B !== 'undefined' && B && B.over && !calm()) return;
      }catch(e){}
      return orig.apply(this, arguments);
    };
    wrapped.__bfWaitCalm = 1;
    window.bfEndCinematic = wrapped;
    return true;
  }

  // ---- 2) showResult: llamada puntual. Se retrasa hasta que todo está calmado
  // (con techo de 12 s). Un flag evita que múltiples llamadas encadenen varias
  // esperas en paralelo. ----
  var resultPending = false, resultArgs = null, resultDeadline = 0;
  function hookShowResult(){
    var orig = window.showResult;
    if(typeof orig !== 'function' || orig.__bfWaitCalm) return false;
    var wrapped = function(youWin){
      // Si ya hay un resultado pendiente (esperando a que termine la animación),
      // se absorbe la nueva llamada: se queda con los argumentos del primero.
      resultArgs = arguments;
      if(resultPending) return;
      resultPending = true;
      resultDeadline = Date.now() + 12000;
      (function proceed(){
        if(calm() || (Date.now() > resultDeadline && !indicatorsBusy())){
          resultPending = false;
          var a = resultArgs; resultArgs = null;
          try{ return orig.apply(window, a); }catch(e){}
          return;
        }
        setTimeout(proceed, 200);
      })();
    };
    wrapped.__bfWaitCalm = 1;
    window.showResult = wrapped;
    return true;
  }

  // ---- 3) show('s-result'): transición directa a la pantalla de resultado.
  // Se retrasa igual que showResult. Cualquier otra pantalla se muestra sin
  // retraso. ----
  var showPending = false, showArgs = null, showDeadline = 0;
  function hookShow(){
    var orig = window.show;
    if(typeof orig !== 'function' || orig.__bfWaitCalm) return false;
    var wrapped = function(id){
      if(id !== 's-result') return orig.apply(this, arguments);
      showArgs = arguments;
      if(showPending) return;
      showPending = true;
      showDeadline = Date.now() + 12000;
      (function proceed(){
        if(calm() || (Date.now() > showDeadline && !indicatorsBusy())){
          showPending = false;
          var a = showArgs; showArgs = null;
          try{ return orig.apply(window, a); }catch(e){}
          return;
        }
        setTimeout(proceed, 200);
      })();
    };
    wrapped.__bfWaitCalm = 1;
    window.show = wrapped;
    return true;
  }

  var tries = 0, iv = setInterval(function(){
    var a = hookEndCine(), b = hookShowResult(), c = hookShow();
    if((a && b && c) || tries++ > 200) clearInterval(iv);
  }, 150);
  hookEndCine(); hookShowResult(); hookShow();
})();
</script>
`;