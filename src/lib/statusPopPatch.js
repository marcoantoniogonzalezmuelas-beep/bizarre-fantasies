// Marcador flotante de texto sobre el retrato de un héroe, con el mismo estilo
// que los avisos de pifia, curación o cambios de stats.
//
// Uso desde cualquier otro parche: window.bfStatusPop(side, heroId, '⛔ SIN ÉLITE')
export const STATUS_POP_PATCH = `
<script>
(function(){
  if(window.bfStatusPop) return;

  var st = document.createElement('style');
  st.textContent = '.bf-status-pop{position:fixed;z-index:100004;pointer-events:none;transform:translate(-50%,-50%);'
    + "display:flex;align-items:center;gap:6px;padding:5px 14px;border-radius:999px;font-family:'Cinzel',serif;"
    + 'font-weight:900;font-size:20px;line-height:1.15;white-space:nowrap;color:#ffd9ff;'
    + 'background:radial-gradient(circle,rgba(40,8,52,.78),rgba(40,8,52,0) 74%);'
    + 'text-shadow:0 0 12px rgba(214,120,255,.95),0 3px 8px #000;'
    + 'animation:bfStatusPop 3.2s cubic-bezier(.2,.8,.3,1) forwards}'
    + '@keyframes bfStatusPop{0%{opacity:0;transform:translate(-50%,10%) scale(.6)}'
    + '14%{opacity:1;transform:translate(-50%,-24%) scale(1.1)}'
    + '24%{transform:translate(-50%,-28%) scale(1)}'
    + '72%{opacity:1;transform:translate(-50%,-64%) scale(1)}'
    + '100%{opacity:0;transform:translate(-50%,-112%) scale(1.04)}}';
  document.head.appendChild(st);

  window.bfStatusPop = function(side, id, text){
    window.__bfQueueIndicator(function(){return paint(side,id,text);},3300);
  };
  function paint(side, id, text){
    var el = document.getElementById('b_' + side + '_' + id);
    if(!el) return;
    var r = el.getBoundingClientRect();
    var n = document.createElement('div');
    n.className = 'bf-status-pop';
    n.style.left = (r.left + r.width / 2) + 'px';
    n.style.top = (r.top + r.height * 0.24) + 'px';
    n.textContent = text;
    (window.__bfAppend || function(x){ document.body.appendChild(x); })(n);
    return [n];
  }
})();
</script>
`;