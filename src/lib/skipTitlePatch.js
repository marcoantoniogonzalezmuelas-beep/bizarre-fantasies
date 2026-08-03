// Parche inyectado en el iframe: saltar automáticamente la pantalla de título
// (s-title) pulsando "Comenzar" en cuanto aparece, para que el usuario nunca la
// vea y vaya directo al menú principal del juego.
export const SKIP_TITLE_PATCH = `
<script>
(function(){
  if (window.__bfSkipTitle) return;
  window.__bfSkipTitle = true;
  function trySkip(){
    var t = document.getElementById('s-title');
    if (!t || !t.classList.contains('active')) return false;
    // Busca el botón "Comenzar" (o el primer botón visible) y haz clic.
    var btns = t.querySelectorAll('button, a, [onclick], .btn, .button');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.offsetParent === null) continue;
      var tx = (b.textContent || '').trim();
      if (/comenzar|start|jugar|play|empezar|continuar|enter/i.test(tx)) { b.click(); return true; }
    }
    // Fallback: primer botón visible cualquiera.
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].offsetParent !== null) { btns[i].click(); return true; }
    }
    return false;
  }
  var tries = 0;
  function loop(){
    if (trySkip() || ++tries > 60) { clearInterval(iv); }
  }
  var iv = setInterval(loop, 80);
})();
</script>
`;