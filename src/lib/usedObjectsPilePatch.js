// Parche inyectado en el iframe: en la BATALLA, añade una "pila de objetos
// usados" (descartes) a la mano del jugador. Cada objeto consumido se acumula
// como una carta boca abajo (reverso BF, mismo tamaño que las cartas de la mano
// del rival) con tooltip "Pila de descartes de objetos" al pasar el ratón.
//
// Seguimiento por diffing: al inicio de cada batalla se memoriza cuántos
// objetos (G.items.p) tenía el jugador; la pila muestra la diferencia entre
// ese valor inicial y el actual, así no hace falta tocar el código del juego.
const CARD_BACK_URL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/47cb4e9b0_generated_image.png';

export const USED_OBJECTS_PILE_PATCH = `
<script>
(function(){
  if (window.__bfUsedPilePatch) return;
  window.__bfUsedPilePatch = true;

  var st = document.createElement('style');
  st.textContent = [
    '#s-battle .bf-used-pile{display:flex;flex-wrap:wrap;align-items:center;gap:3px;margin-top:2px}',
    '#s-battle .bf-used-chip{display:inline-block;width:46px;height:30px;border-radius:8px;background:url("${CARD_BACK_URL}") center/cover #120a1e;border:1.5px solid rgba(192,107,255,.6);box-shadow:0 3px 9px rgba(0,0,0,.55),0 0 8px rgba(160,80,255,.22);padding:0;margin:0;cursor:help;flex:0 0 auto}',
    '#s-battle .bf-used-lbl{cursor:help}'
  ].join('');
  document.head.appendChild(st);

  var snap = null; // nº de objetos al iniciar la batalla actual
  function renderPile(){
    try{
      if (typeof G === 'undefined' || !G) return;
      var hand = document.getElementById('hand_p');
      if (!hand) { snap = null; return; } // fuera de batalla → reset
      var cur = (G.items && G.items.p) ? G.items.p.length : 0;
      if (snap === null) snap = cur; // primer render de esta batalla
      var used = Math.max(0, snap - cur);
      var box = hand.querySelector('.bf-used-box');
      if (!box){
        box = document.createElement('div');
        box.className = 'bf-used-box';
        hand.appendChild(box);
      }
      var chips = used
        ? new Array(used).fill(0).map(function(){ return '<span class="bf-used-chip" title="Pila de descartes de objetos"></span>'; }).join('')
        : '<span style="color:#666;font-size:11px">—</span>';
      box.innerHTML =
        '<div class="hand-lbl bf-used-lbl" title="Pila de descartes de objetos">Pila · Objetos usados (' + used + ')</div>' +
        '<div class="hand-chips bf-used-pile" title="Pila de descartes de objetos">' + chips + '</div>';
    }catch(e){ snap = null; }
  }

  setInterval(renderPile, 700);
  try{
    var obs = new MutationObserver(renderPile);
    var battle = document.getElementById('s-battle');
    if (battle) obs.observe(battle, {childList:true, subtree:true});
    else document.addEventListener('DOMContentLoaded', function(){ var b=document.getElementById('s-battle'); if(b) obs.observe(b,{childList:true,subtree:true}); });
  }catch(e){}
  renderPile();
})();
</script>
`;