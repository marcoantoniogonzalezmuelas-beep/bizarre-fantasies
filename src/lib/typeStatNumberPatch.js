// Batalla: junto a las iniciales del tipo (CC / AD / HE) de cada héroe se
// muestra el NÚMERO del stat efectivo, igual que ya se hace con la velocidad.
// El valor se calcula con stat() del motor, así que refleja en vivo los
// cambios que las habilidades, equipo y estados aplican sobre los stats.
export const TYPE_STAT_NUMBER_PATCH = `
<script>
(function(){
  if(window.__bfTypeStatNum) return;
  window.__bfTypeStatNum = true;

  var COLORS = { cc:'#ff6a5f', ad:'#54e876', he:'#b06cff' };

  var st = document.createElement('style');
  st.textContent = '.bf-type-num{display:inline-block;margin-left:3px;font-family:Rubik,sans-serif;font-weight:900;font-size:12px;line-height:1;text-shadow:0 1px 2px #000,0 0 6px rgba(0,0,0,.6);white-space:nowrap}';
  document.head.appendChild(st);

  function keyOf(t){
    if(typeof primKey === 'function'){ try{ return primKey(t); }catch(e){} }
    var s = String(t || '').toLowerCase();
    return s === 'cc' || s === 'ad' || s === 'he' ? s : 'cc';
  }

  function effStat(h, k){
    if(typeof stat === 'function'){ try{ return stat(h, k); }catch(e){} }
    return h && h[k] != null ? h[k] : null;
  }

  function tick(){
    if(typeof G === 'undefined' || !G || !G.team) return;
    document.querySelectorAll('.bhero[id^="b_"] .vel-tag').forEach(function(tag){
      var card = tag.closest('.bhero');
      var m = String((card && card.id) || '').match(/^b_([po])_(.+)$/);
      if(!m) return;
      var h = (G.team[m[1]] || []).find(function(x){ return x && x.id === m[2]; });
      if(!h) return;
      var k = keyOf(h.type);
      var v = effStat(h, k);
      if(v == null) return;
      var num = tag.querySelector('.bf-type-num');
      if(!num){
        // Insertar justo después de las iniciales del tipo (nodo de texto "CC ·").
        var w = document.createTreeWalker(tag, NodeFilter.SHOW_TEXT, null);
        var node, hit = null;
        while((node = w.nextNode())){
          var mm = node.nodeValue.match(/\\b(CC|AD|HE)\\b/);
          if(mm){ hit = { node: node, end: mm.index + mm[0].length }; break; }
        }
        if(!hit) return;
        num = document.createElement('span');
        num.className = 'bf-type-num';
        num.style.color = COLORS[k] || '#ffe49a';
        var rest = hit.node.splitText(hit.end);
        rest.parentNode.insertBefore(num, rest);
      }
      var txt = String(v);
      if(num.textContent !== txt) num.textContent = txt;
    });
  }

  setInterval(tick, 300);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
})();
</script>
`;