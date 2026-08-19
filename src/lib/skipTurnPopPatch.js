// Indicador flotante "PIERDE SU TURNO" (mismo estilo que las pifias, curaciones,
// daño y stats). Aparece sobre el retrato del héroe cuando le llega su turno y
// no puede jugarlo (paralizado, dormido, congelado o cualquier "pierde turno"),
// y se mantiene en pantalla el tiempo suficiente para leerlo con calma.
export const SKIP_TURN_POP_PATCH = `
<script>
(function(){
  if(window.__bfSkipTurnPop) return;
  window.__bfSkipTurnPop = true;

  var st = document.createElement('style');
  st.textContent = ''
    + '.bf-skip-pop{position:fixed;z-index:100006;pointer-events:none;transform:translate(-50%,-50%);'
    + 'display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 18px;border-radius:14px;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:26px;line-height:1;color:#9fd4ff;white-space:nowrap;"
    + 'background:radial-gradient(circle,rgba(8,26,54,.85),rgba(8,26,54,0) 74%);'
    + 'text-shadow:0 0 14px rgba(120,200,255,.95),0 3px 8px #000,0 0 3px #000;'
    + 'animation:bfSkipPop 4.6s cubic-bezier(.2,.8,.3,1) forwards}'
    + '.bf-skip-pop small{font-size:14px;font-weight:800;color:#d8ecff;letter-spacing:1px;text-shadow:0 2px 6px #000}'
    + '@keyframes bfSkipPop{0%{opacity:0;transform:translate(-50%,-20%) scale(.6)}'
    + '10%{opacity:1;transform:translate(-50%,-62%) scale(1.14)}'
    + '18%{transform:translate(-50%,-64%) scale(1)}'
    + '86%{opacity:1;transform:translate(-50%,-92%) scale(1)}'
    + '100%{opacity:0;transform:translate(-50%,-140%) scale(1.05)}}';
  document.head.appendChild(st);

  function reasonOf(h){
    if(!h) return null;
    if(h.para > 0) return { ic:'\\u26D3', lb:'PARALIZADO' };
    if(h.frozen > 0) return { ic:'\\u2744', lb:'CONGELADO' };
    if(h.sleep > 0) return { ic:'\\u{1F4A4}', lb:'DORMIDO' };
    if(h.skip > 0) return { ic:'\\u{1F6AB}', lb:'SIN TURNO' };
    return null;
  }

  function pop(side, id, reason){
    var el = document.getElementById('b_' + side + '_' + id);
    if(!el) return;
    var r = el.getBoundingClientRect();
    var n = document.createElement('div');
    n.className = 'bf-skip-pop';
    n.style.left = (r.left + r.width / 2) + 'px';
    n.style.top = (r.top + r.height * 0.42) + 'px';
    n.innerHTML = reason.ic + ' PIERDE SU TURNO<small>' + reason.lb + '</small>';
    (window.__bfAppend || function(x){ document.body.appendChild(x); })(n);
    setTimeout(function(){ if(n.parentNode) n.parentNode.removeChild(n); }, 4800);
  }

  function install(){
    if(typeof window.stepTurn !== 'function') return false;
    if(window.stepTurn.__bfSkipPop) return true;
    var orig = window.stepTurn;
    window.stepTurn = function(){
      try{
        if(typeof B !== 'undefined' && B && !B.over && B.queue && B.qi < B.queue.length){
          var slot = B.queue[B.qi];
          var h = (typeof getHero === 'function' && slot) ? getHero(slot.side, slot.id) : null;
          var rs = reasonOf(h);
          if(h && h.alive && rs){
            var key = (B.turn || B.round || 0) + '|' + B.qi + '|' + slot.side + '|' + slot.id + '|' + rs.lb;
            if(window.__bfSkipPopKey !== key){
              window.__bfSkipPopKey = key;
              setTimeout(function(){ try{ pop(slot.side, slot.id, rs); }catch(e){} }, 60);
            }
          }
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    window.stepTurn.__bfSkipPop = 1;
    return true;
  }

  var iv = setInterval(function(){ if(install()) clearInterval(iv); }, 300);
  install();
})();
</script>
`;