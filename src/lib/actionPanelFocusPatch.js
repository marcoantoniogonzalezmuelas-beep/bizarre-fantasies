// Enfoque automático al jugar una acción desde el panel del héroe.
//
// En cuanto el jugador pulsa cualquier botón del panel (golpe, disparo,
// hechizo, objeto, habilidad, pasar turno), la vista sube al campo de batalla
// (parte superior de la pantalla) para que la acción y sus efectos se vean.
// Se mantiene el nivel de zoom actual: solo se sube, nunca se acerca o aleja.
export const ACTION_PANEL_FOCUS_PATCH = `
<script>
(function(){
  if(window.__bfActionPanelFocus) return;
  window.__bfActionPanelFocus = true;

  function toTop(){
    try{ if(typeof window.__bfPinchTop === 'function'){ window.__bfPinchTop(280); } }catch(e){}
    try{ window.scrollTo({ top:0, left:0, behavior:'auto' }); }catch(e){ try{ window.scrollTo(0,0); }catch(e2){} }
    try{
      var se = document.scrollingElement || document.documentElement;
      se.scrollTop = 0; document.body.scrollTop = 0;
    }catch(e){}
    try{ window.parent.scrollTo(0, 0); }catch(e){}
  }

  document.addEventListener('click', function(ev){
    var t = ev.target;
    if(!t || !t.closest) return;
    var btn = t.closest('.jrpg-btn, .act-btn, #s-battle button');
    if(!btn || btn.classList.contains('disabled')) return;
    // Tras el clic: el juego resuelve la acción y luego subimos la vista, así
    // los proyectiles se dibujan sobre el tablero ya visible.
    toTop();
    setTimeout(toTop, 60);
  }, true);
})();
</script>
`;