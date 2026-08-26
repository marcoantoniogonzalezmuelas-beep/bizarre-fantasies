// Marcador de stats ESTÁTICO en batalla.
//
// El juego reconstruye la fila de números en cada repintado, así que el
// marcador desaparecía un instante y reaparecía ya actualizado (parpadeo).
// Aquí se pinta UN marcador propio por héroe que nunca se destruye: solo se
// reescribe el texto de cada número cuando su valor cambia. El marcador nativo
// se oculta.
export const STAT_PANEL_STABLE_PATCH = `
<script>
(function(){
  if(window.__bfStatPanelStable) return;
  window.__bfStatPanelStable = true;

  var css = [
    // Marcador nativo fuera: era el que parpadeaba al reconstruirse.
    'html body .bhero .bhero-stats,html body .bhero .bhero-hpnum{display:none!important}',
    // Marcador propio: posición y altura fijas, sin animaciones ni transiciones.
    'html body .bhero .bf-stat-fixed{position:absolute;left:8px;right:8px;bottom:6px;z-index:18;display:flex;align-items:center;justify-content:center;gap:8px;height:20px;line-height:20px;font-family:Rubik,system-ui,sans-serif;font-size:12px;font-weight:800;color:#ffe9b8;text-shadow:0 1px 2px #000;font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;pointer-events:none;animation:none!important;transition:none!important;opacity:1!important}',
    'html body .bhero .bf-stat-fixed span{display:inline-block;min-width:34px;text-align:center;white-space:nowrap}',
    'html body .bhero .bf-stat-fixed span.bf-stat-hp{min-width:62px;color:#ffd0d0}'
  ].join('');

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  setInterval(function(){ if(document.head.lastChild !== st) document.head.appendChild(st); }, 1500);

  function heroFor(card){
    var m = String(card.id || '').match(/^b_([po])_(.+)$/);
    return m && typeof G !== 'undefined' && G.team ? (G.team[m[1]] || []).find(function(h){ return h && h.id === m[2]; }) : null;
  }
  function val(h, k){
    try { if(typeof stat === 'function') return stat(h, k); } catch(e){}
    return h[k];
  }

  function paint(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var h = heroFor(card);
      if(!h) return;
      var bar = card.querySelector('.bf-stat-fixed');
      if(!bar){
        bar = document.createElement('div');
        bar.className = 'bf-stat-fixed';
        bar.innerHTML = '<span class="bf-stat-hp"></span><span class="bf-stat-cc"></span><span class="bf-stat-ad"></span><span class="bf-stat-he"></span><span class="bf-stat-mana"></span>';
        card.appendChild(bar);
      }
      var parts = {
        hp: '\\u2764 ' + Math.max(0, Math.round(h.hp || 0)) + '/' + Math.round(h.maxHp || 0),
        cc: '\\u2694 ' + Math.round(val(h, 'cc') || 0),
        ad: '\\ud83c\\udff9 ' + Math.round(val(h, 'ad') || 0),
        he: '\\u2728 ' + Math.round(val(h, 'he') || 0),
        mana: (h.maxMana > 0 ? '\\ud83d\\udd35 ' + Math.round(h.mana || 0) : '')
      };
      Object.keys(parts).forEach(function(k){
        var el = bar.querySelector('.bf-stat-' + k);
        if(el && el.textContent !== parts[k]) el.textContent = parts[k];
      });
    });
  }

  function hook(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfStatFixed) return;
    var o = window.renderBattle;
    window.renderBattle = function(){ o.apply(this, arguments); try{ paint(); }catch(e){} };
    window.renderBattle.__bfStatFixed = 1;
  }

  var n = 0, t = setInterval(function(){ n++; hook(); paint(); if(n > 40) clearInterval(t); }, 300);
  setInterval(paint, 400);
})();
</script>
`;