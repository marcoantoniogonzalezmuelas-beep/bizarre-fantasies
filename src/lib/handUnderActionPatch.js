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
    '.bf-hands-row{display:flex;gap:10px;width:100%;margin:10px 0 16px;align-items:stretch;flex-wrap:wrap}',
    '.bf-hands-row .hand-under-action{flex:1 1 260px}',
    '.hand-under-action{margin:0!important;background:var(--panel);border:1px solid rgba(255,210,74,.35)!important;border-top:1px solid rgba(255,210,74,.35)!important;border-radius:12px;padding:8px 12px 10px!important}',
    '.hand-under-action.hand-rival{border-color:rgba(138,160,255,.4)!important;border-top-color:rgba(138,160,255,.4)!important}',
    '.hand-under-action.hand-rival .hand-under-title{color:var(--he)}',
    '.hand-under-title{font-size:12px;font-weight:700;color:var(--gold2);margin-bottom:4px;letter-spacing:.5px}'
  ].join('');
  document.head.appendChild(st);

  function relocate(){
    var s = document.getElementById('s-battle');
    if (!s || !s.classList.contains('active')) return;
    var mySide = 'p';
    try { if (typeof online === 'function' && online() && typeof NET !== 'undefined' && NET.mySide) mySide = NET.mySide; } catch (e) {}
    var otherSide = mySide === 'p' ? 'o' : 'p';
    var anchor = s.querySelector('.ctb-bar') || s.querySelector('.b-log-wrap');
    if (!anchor) return;
    var row = null;
    [mySide, otherSide].forEach(function(side){
      var hand = document.getElementById('hand_' + side);
      if (!hand || hand.dataset.bfMoved === '1') return;
      if (!row) {
        row = s.querySelector('.bf-hands-row');
        if (!row) { row = document.createElement('div'); row.className = 'bf-hands-row'; }
        anchor.parentNode.insertBefore(row, anchor);
      }
      var mine = side === mySide;
      hand.classList.add('hand-under-action');
      if (!mine) hand.classList.add('hand-rival');
      if (!hand.querySelector('.hand-under-title')) {
        var name = '';
        try { name = (window.G && G.names && G.names[side]) || ''; } catch (e) {}
        var t = document.createElement('div');
        t.className = 'hand-under-title';
        t.textContent = mine ? '🖐 Tu mano' : ('🖐 Mano de ' + (name || 'rival'));
        hand.insertBefore(t, hand.firstChild);
      }
      row.appendChild(hand);
      hand.dataset.bfMoved = '1';
    });
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