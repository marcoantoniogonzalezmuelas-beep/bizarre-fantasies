// Curaciones bien visibles: cuando un héroe recupera vida (hechizos de
// curación, habilidades, tokens…), en su escena de batalla aparece el número
// curado en grande (+10 ❤) durante 2,2 s, tiempo suficiente para leerlo con
// claridad, y luego se desvanece. Sustituye el numerito diminuto nativo.
export const HEAL_NUMBER_PATCH = `
<script>
(function(){
  if(window.__bfHealNum) return;
  window.__bfHealNum = true;

  var st = document.createElement('style');
  st.textContent = ''
    + '.bf-heal-pop{position:fixed;z-index:100004;pointer-events:none;transform:translate(-50%,-50%);'
    + 'display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:40px;line-height:1;color:#8dffc4;"
    + 'background:radial-gradient(circle,rgba(10,40,26,.72),rgba(10,40,26,0) 72%);'
    + 'text-shadow:0 0 12px rgba(110,255,190,.95),0 3px 8px #000,0 0 3px #000;'
    + 'animation:bfHealPop 3.4s cubic-bezier(.2,.8,.3,1) forwards}'
    + '.bf-heal-pop small{font-size:18px;font-weight:800;color:#d6ffe9;text-shadow:0 2px 6px #000}'
    + '@keyframes bfHealPop{0%{opacity:0;transform:translate(-50%,-20%) scale(.5)}'
    + '12%{opacity:1;transform:translate(-50%,-60%) scale(1.12)}'
    + '22%{transform:translate(-50%,-62%) scale(1)}'
    + '75%{opacity:1;transform:translate(-50%,-95%) scale(1)}'
    + '100%{opacity:0;transform:translate(-50%,-150%) scale(1.05)}}'
    + '.bf-heal-glow{position:fixed;z-index:100003;pointer-events:none;transform:translate(-50%,-50%);'
    + 'border-radius:16px;box-shadow:0 0 0 3px rgba(126,255,196,.85),0 0 34px rgba(110,255,190,.75) inset;'
    + 'animation:bfHealGlow 2.2s ease-out forwards}'
    + '@keyframes bfHealGlow{0%{opacity:0}20%{opacity:1}100%{opacity:0}}';
  document.head.appendChild(st);

  function pop(side, id, amt){
    window.__bfQueueIndicator(function(){return paint(side,id,amt);},3550);
  }
  function paint(side, id, amt){
    var el = document.getElementById('b_' + side + '_' + id);
    if(!el) return;
    var r = el.getBoundingClientRect();
    var glow = document.createElement('div');
    glow.className = 'bf-heal-glow';
    glow.style.left = (r.left + r.width / 2) + 'px';
    glow.style.top = (r.top + r.height / 2) + 'px';
    glow.style.width = r.width + 'px';
    glow.style.height = r.height + 'px';
    var n = document.createElement('div');
    n.className = 'bf-heal-pop';
    n.style.left = (r.left + r.width / 2) + 'px';
    n.style.top = (r.top + r.height * 0.42) + 'px';
    n.innerHTML = '+' + amt + ' <small>HP</small>';
    (window.__bfAppend||function(x){document.body.appendChild(x);})(glow);
    (window.__bfAppend||function(x){document.body.appendChild(x);})(n);
    return [glow,n];
  }

  function install(){
    if(window.__bfHealHooked || typeof window.flushFx !== 'function') return false;
    window.__bfHealHooked = true;
    var orig = window.flushFx;
    window.flushFx = function(list){
      if(list && list.length){
        var rest = [];
        list.forEach(function(ev){
          if(ev && ev.k === 'heal' && ev.amt > 0){ try{ pop(ev.side, ev.id, ev.amt); }catch(e){} }
          else rest.push(ev);
        });
        return orig.call(this, rest);
      }
      return orig.apply(this, arguments);
    };
    return true;
  }

  var n = 0, t = setInterval(function(){ if(install() || n++ > 160) clearInterval(t); }, 150);
})();
</script>
`;