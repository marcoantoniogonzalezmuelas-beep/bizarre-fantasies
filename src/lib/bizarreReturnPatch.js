// Parche inyectado en el iframe: BOTÓN "VOLVER A LA HABITACIÓN BIZARRA".
//
// Cuando una partida empezó desde la Habitación Bizarra (window.__bfBizarreMatch),
// al terminar se añade un botón extra junto a "Volver a jugar" que devuelve al
// jugador a la Habitación Bizarra sin pasar por la portada.
//
// El botón recarga el iframe (que vuelve a la portada del juego) y marca un
// flag en sessionStorage para que el juego auto-abra la Habitación Bizarra al
// cargar. El parche de la Habitación Bizarra lee ese flag al inicializarse.
export const BIZARRE_RETURN_PATCH = `
<script>
(function(){
  if(window.__bfBizarreReturnPatch) return;
  window.__bfBizarreReturnPatch = true;

  function isEn(){ try { return localStorage.getItem('bfLang') === 'en'; } catch(e) { return false; } }
  function L(es, en){ return isEn() ? en : es; }

  // Añade el botón "Volver a la Habitación Bizarra" a la pantalla de resultado.
  // Solo aparece si la partida actual empezó desde la Habitación Bizarra.
  function addButton(){
    var root = document.getElementById('s-result');
    if(!root || !root.classList.contains('active')) return;
    if(!window.__bfBizarreMatch) return;
    if(document.getElementById('bf-biz-return-btn')) return;
    // Busca el botón de revancha para colocar el nuevo junto a él.
    var rematchBtn = document.getElementById('bf-rematch-btn');
    var container = rematchBtn ? rematchBtn.parentElement : null;
    if(!container) {
      // Fallback: cualquier botón de la pantalla de resultado
      var btns = root.querySelectorAll('button');
      if(btns.length) container = btns[0].parentElement;
    }
    if(!container) return;
    var btn = document.createElement('button');
    btn.id = 'bf-biz-return-btn';
    btn.textContent = '🚪 ' + L('Volver a la Habitación', 'Back to the Room');
    btn.setAttribute('onclick', 'bfBizarreReturn()');
    btn.setAttribute('style',
      'display:block;width:100%;margin-top:10px;padding:13px;border-radius:13px;border:2px solid rgba(192,91,255,.6);' +
      'background:linear-gradient(180deg,#9d5df0,#7a3df0);color:#fff;font-family:Cinzel,serif;font-weight:900;font-size:16px;' +
      'cursor:pointer;letter-spacing:.5px;text-shadow:0 2px 4px #000;box-shadow:0 4px 14px rgba(160,80,255,.4);transition:transform .12s ease');
    btn.onmouseover = function(){ btn.style.transform = 'translateY(-2px)'; };
    btn.onmouseout = function(){ btn.style.transform = ''; };
    container.appendChild(btn);
  }

  // Acción del botón: marca el flag y recarga el iframe.
  window.bfBizarreReturn = function(){
    try { sessionStorage.setItem('bfBizarreReturn', '1'); } catch(e) {}
    try { window.__bfBizarreMatch = false; } catch(e) {}
    location.reload();
  };

  function hookShowResult(){
    if(typeof window.showResult !== 'function' || window.showResult.__bfBizReturn) return false;
    var orig = window.showResult;
    window.showResult = function(){
      var r = orig.apply(this, arguments);
      setTimeout(addButton, 200);
      return r;
    };
    window.showResult.__bfBizReturn = 1;
    return true;
  }

  var tries = 0, t = setInterval(function(){
    if(hookShowResult() || ++tries > 150) clearInterval(t);
  }, 200);

  // Re-check periódico por si la pantalla se repinta
  setInterval(function(){
    var r = document.getElementById('s-result');
    if(r && r.classList.contains('active') && window.__bfBizarreMatch) addButton();
  }, 800);
})();
</script>
`;