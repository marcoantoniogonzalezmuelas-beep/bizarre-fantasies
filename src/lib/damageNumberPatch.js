// Daño siempre visible: cada vez que un héroe recibe daño, sobre su retrato
// aparece la cantidad en ROJO y en grande (-8 HP) durante 2,2 s, igual que el
// número verde de las curaciones. Sustituye el numerito diminuto nativo.
export const DAMAGE_NUMBER_PATCH = `
<script>
(function(){
  if(window.__bfDmgNum) return;
  window.__bfDmgNum = true;

  var st = document.createElement('style');
  st.textContent = ''
    // El numerito nativo se oculta: lo sustituye el número grande de abajo.
    + '.fx-dmg-melee,.fx-dmg-ranged,.fx-dmg-spell{display:none!important}'
    + '.bf-dmg-pop{position:fixed;z-index:100004;pointer-events:none;transform:translate(-50%,-50%);'
    + 'display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:40px;line-height:1;color:#ff6b6b;"
    + 'background:radial-gradient(circle,rgba(48,8,8,.72),rgba(48,8,8,0) 72%);'
    + 'text-shadow:0 0 12px rgba(255,70,70,.95),0 3px 8px #000,0 0 3px #000;'
    + 'animation:bfDmgPop 2.2s cubic-bezier(.2,.8,.3,1) forwards}'
    + '.bf-dmg-pop small{font-size:18px;font-weight:800;color:#ffd9d9;text-shadow:0 2px 6px #000}'
    + '@keyframes bfDmgPop{0%{opacity:0;transform:translate(-50%,-20%) scale(.5)}'
    + '12%{opacity:1;transform:translate(-50%,-58%) scale(1.14)}'
    + '22%{transform:translate(-50%,-60%) scale(1)}'
    + '75%{opacity:1;transform:translate(-50%,-92%) scale(1)}'
    + '100%{opacity:0;transform:translate(-50%,-145%) scale(1.05)}}';
  document.head.appendChild(st);

  function pop(side, id, amt){
    var el = document.getElementById('b_' + side + '_' + id);
    if(!el) return;
    var r = el.getBoundingClientRect();
    var n = document.createElement('div');
    n.className = 'bf-dmg-pop';
    n.style.left = (r.left + r.width / 2) + 'px';
    n.style.top = (r.top + r.height * 0.42) + 'px';
    n.innerHTML = '-' + amt + ' <small>HP</small>';
    (window.__bfAppend || function(x){ document.body.appendChild(x); })(n);
    setTimeout(function(){ if(n.parentNode) n.parentNode.removeChild(n); }, 2350);
  }

  function install(){
    if(window.__bfDmgHooked || typeof window.flushFx !== 'function') return false;
    window.__bfDmgHooked = true;
    var orig = window.flushFx;
    window.flushFx = function(list){
      try{
        (list || []).forEach(function(ev){
          if(ev && ev.k === 'hit' && ev.dmg > 0) pop(ev.side, ev.id, ev.dmg);
        });
      }catch(e){}
      return orig.apply(this, arguments);
    };
    return true;
  }

  var n = 0, t = setInterval(function(){ if(install() || n++ > 160) clearInterval(t); }, 150);
})();
</script>
`;