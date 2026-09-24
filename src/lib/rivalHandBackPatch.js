// Parche inyectado en el iframe: en la BATALLA, las cartas de la mano del
// rival se muestran boca abajo con un reverso diseñado a partir del icono de
// Punkito. Se oculta todo el contenido de la carta (arte, nombre, coste,
// botones) y se bloquea la interacción para no revelar información.
//
// Además del CSS, un JS (forceBack) sobrescribe cualquier background-image
// inline con !important que hayan puesto injectHandArt u applyArtToChips en
// los chips del rival (inline !important > CSS !important, por lo que sin el
// JS no se podría guaranteer que el reverso del pollito se vea siempre).
export const CARD_BACK_URL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/47cb4e9b0_generated_image.png';

export const RIVAL_HAND_BACK_PATCH = `
<script>
(function(){
  if (window.__bfRivalHandBack) return;
  window.__bfRivalHandBack = true;

  var BACK_URL = '${CARD_BACK_URL}';

  var st = document.createElement('style');
  st.textContent = [
    // La mano del rival en batalla (clase hand-rival, añadida por el parche que
    // recoloca las manos): cada carta muestra solo el reverso de Punkito.
    '#s-battle .hand-rival .chip.bf-chip-card > *{display:none!important}',
    '#s-battle .hand-rival .chip.bf-chip-card{background-image:url("' + BACK_URL + '")!important;background-size:cover!important;background-position:center!important;background-color:#120a1e!important;border:1.5px solid rgba(192,107,255,.65)!important;box-shadow:0 4px 12px rgba(0,0,0,.6),0 0 10px rgba(160,80,255,.28)!important;pointer-events:none!important;cursor:default!important}',
    '#s-battle .hand-rival .chip.bf-chip-card:hover{transform:none!important}',
    '#s-battle .hand-rival .chip{background-image:url("' + BACK_URL + '")!important;background-size:cover!important;background-position:center!important;background-color:#120a1e!important}'
  ].join('');
  document.head.appendChild(st);

  // Fuerza el reverso del pollito en las cartas de la mano del rival.
  // Override cualquier background-image inline con !important que hayan
  // puesto injectHandArt u applyArtToChips (inline !important > CSS !important).
  function forceBack() {
    var battle = document.getElementById('s-battle');
    if (!battle || !battle.classList.contains('active')) return;
    battle.querySelectorAll('.hand-rival .chip').forEach(function(chip){
      chip.classList.add('bf-chip-card');
      chip.style.setProperty('background-image', 'url("' + BACK_URL + '")', 'important');
      chip.style.setProperty('background-size', 'cover', 'important');
      chip.style.setProperty('background-position', 'center', 'important');
      chip.style.setProperty('background-color', '#120a1e', 'important');
    });
  }
  // Precarga del reverso: ya está en caché al entrar en batalla.
  var _pre = new Image(); _pre.src = BACK_URL;

  // Igual que los retratos de los héroes: se aplica dentro del propio bucle de
  // render del juego (renderBattle / renderHand), en el mismo frame en que se
  // dibuja la mano del rival. Se elimina el MutationObserver global, que
  // repintaba con cualquier cambio del DOM y provocaba el parpadeo inicial.
  function hookRender(name){
    if(typeof window[name] !== 'function' || window[name].__bfRivalBack) return false;
    var orig = window[name];
    window[name] = function(){
      var r = orig.apply(this, arguments);
      try{ forceBack(); }catch(e){}
      return r;
    };
    window[name].__bfRivalBack = 1;
    return true;
  }
  function hookAll(){ var a = hookRender('renderBattle'), b = hookRender('renderHand'); return a && b; }
  var tries = 0, hk = setInterval(function(){ if(hookAll() || tries++ > 150) clearInterval(hk); }, 120);
  hookAll();

  setInterval(forceBack, 600);
})();
</script>
`;