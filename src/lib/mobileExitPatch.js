// Móvil/tablet: el botón "Salir" del propio juego (y su zona táctil ampliada)
// se ocultan, porque el juego va encogido y el botón resultaba diminuto. En su
// lugar la portada muestra un botón nativo (MobileExitButton) que envía aquí la
// orden de salir cuando el jugador confirma.
export const MOBILE_EXIT_PATCH = `
<script>
(function(){
  if(window.__bfMobileExit) return;
  window.__bfMobileExit = true;
  var st=document.createElement('style');
  st.textContent='#homeBtn{display:none!important}.bf-home-hit{display:none!important}';
  document.head.appendChild(st);
  window.addEventListener('message', function(e){
    if(!e.data || !e.data.bfQuitHome) return;
    if(typeof window.doQuitHome === 'function') window.doQuitHome();
    else window.parent.location.href = window.parent.location.pathname + '?bf=' + Date.now();
  });
})();
</script>
`;