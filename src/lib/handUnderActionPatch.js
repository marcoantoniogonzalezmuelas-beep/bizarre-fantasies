// Parche inyectado en el iframe: recoloca la mano del jugador justo debajo del
// panel de acciones del héroe activo (antes del orden de turno), para que el
// panel quede más arriba y se vea sin hacer scroll. La mano del rival se queda
// en su panel de ejército.
export const HAND_UNDER_ACTION_PATCH = `
<script>
(function(){
  if (window.__bfHandUnderActionPatch) return;
  window.__bfHandUnderActionPatch = true;

  var st = document.createElement('style');
  st.textContent = [
    '.hand-under-action{margin:10px auto 0!important;max-width:820px;background:var(--panel);border:1px solid rgba(255,210,74,.35)!important;border-top:1px solid rgba(255,210,74,.35)!important;border-radius:12px;padding:8px 12px 10px!important}',
    '.hand-under-title{font-size:12px;font-weight:700;color:var(--gold2);margin-bottom:4px;letter-spacing:.5px}'
  ].join('');
  document.head.appendChild(st);

  function relocate(){
    var s = document.getElementById('s-battle');
    if (!s || !s.classList.contains('active')) return;
    var mySide = 'p';
    try { if (typeof online === 'function' && online() && typeof NET !== 'undefined' && NET.mySide) mySide = NET.mySide; } catch (e) {}
    var hand = document.getElementById('hand_' + mySide);
    if (!hand || hand.dataset.bfMoved === '1') return;
    var anchor = s.querySelector('.ctb-bar') || s.querySelector('.b-log-wrap');
    if (!anchor) return;
    hand.classList.add('hand-under-action');
    if (!hand.querySelector('.hand-under-title')) {
      var t = document.createElement('div');
      t.className = 'hand-under-title';
      t.textContent = '🖐 Tu mano';
      hand.insertBefore(t, hand.firstChild);
    }
    anchor.parentNode.insertBefore(hand, anchor);
    hand.dataset.bfMoved = '1';
  }

  // renderBattle reemplaza el innerHTML en cada acción: recolocamos tras cada render.
  var tries = 0;
  var iv = setInterval(function(){
    tries++;
    if (typeof window.renderBattle === 'function' && !window.renderBattle.__bfHand) {
      var orig = window.renderBattle;
      window.renderBattle = function(){ var r = orig.apply(this, arguments); try { relocate(); } catch (e) {} return r; };
      window.renderBattle.__bfHand = 1;
      clearInterval(iv);
    }
    if (tries > 200) clearInterval(iv);
  }, 150);
  setInterval(function(){ try { relocate(); } catch (e) {} }, 500);
})();
</script>
`;