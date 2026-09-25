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
    + 'animation:bfDmgPop 3.4s cubic-bezier(.2,.8,.3,1) forwards}'
    + '.bf-dmg-pop small{font-size:18px;font-weight:800;color:#ffd9d9;text-shadow:0 2px 6px #000}'
    + '@keyframes bfDmgPop{0%{opacity:0;transform:translate(-50%,-20%) scale(.5)}'
    + '12%{opacity:1;transform:translate(-50%,-58%) scale(1.14)}'
    + '22%{transform:translate(-50%,-60%) scale(1)}'
    + '75%{opacity:1;transform:translate(-50%,-92%) scale(1)}'
    + '100%{opacity:0;transform:translate(-50%,-145%) scale(1.05)}}';
  document.head.appendChild(st);

  // Lado del héroe objetivo. tSide no siempre es accesible desde aquí (vive en
  // el ámbito del juego), así que si falla se deduce del propio tablero: se
  // busca en qué lado existe el retrato con ese id.
  function sideOf(target){
    try{ if(typeof tSide === 'function'){ var s = tSide(target); if(s) return s; } }catch(e){}
    var hasP = !!document.getElementById('b_p_' + target.id);
    var hasO = !!document.getElementById('b_o_' + target.id);
    if(hasP !== hasO) return hasP ? 'p' : 'o';
    return null;
  }

  function pop(side, id, amt){
    window.__bfQueueIndicator(function(){return paint(side,id,amt);},3550);
  }

  function paint(side, id, amt){
    var el = document.getElementById('b_' + side + '_' + id);
    if(!el) return;
    var r = el.getBoundingClientRect();
    var n = document.createElement('div');
    n.className = 'bf-dmg-pop';
    n.style.left = (r.left + r.width / 2) + 'px';
    n.style.top = (r.top + r.height * 0.42) + 'px';
    n.innerHTML = '-' + amt + ' <small>HP</small>';
    (window.__bfAppend || function(x){ document.body.appendChild(x); })(n);
    return [n];
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

  // Red de seguridad: hay daños (ataques en área, habilidades, efectos) que se
  // aplican con dealDamage SIN encolar el efecto 'hit', así que el número rojo
  // no aparecía. Se registra cada 'hit' encolado y, si un dealDamage no genera
  // ninguno para ese héroe, se muestra el número directamente.
  var recent = {};
  function markHit(ev){
    // Solo cuenta como "ya mostrado" si el efecto lleva daño: los eventos sin
    // cantidad (flecha, golpe sin cifra) no pintan número y hacían que el
    // número rojo se perdiera (habilidad del Patrón, entre otras).
    if(ev && ev.k === 'hit' && ev.dmg > 0) recent[ev.side + '_' + ev.id] = Date.now();
  }

  function installFallback(){
    if(window.__bfDmgFallback) return false;
    if(typeof window.dealDamage !== 'function' || typeof window.pushFx !== 'function') return false;
    window.__bfDmgFallback = true;

    var origPush = window.pushFx;
    window.pushFx = function(ev){ try{ markHit(ev); }catch(e){} return origPush.apply(this, arguments); };

    var origDeal = window.dealDamage;
    window.dealDamage = function(target){
      var before = target && target.hp;
      var out = origDeal.apply(this, arguments);
      try{
        var amt = Number(out);
        if(!amt && typeof before === 'number' && target) amt = before - target.hp;
        if(target && amt > 0){
          var side = sideOf(target);
          if(side){
            var key = side + '_' + target.id;
            var since = Date.now();
            setTimeout(function(){
              if(!recent[key] || recent[key] < since - 60) pop(side, target.id, amt);
            }, 40);
          }
        }
      }catch(e){}
      return out;
    };
    return true;
  }

  var n = 0, t = setInterval(function(){
    var a = install(), b = installFallback();
    if((a || window.__bfDmgHooked) && (b || window.__bfDmgFallback)) clearInterval(t);
    else if(n++ > 200) clearInterval(t);
  }, 150);
})();
</script>
`;