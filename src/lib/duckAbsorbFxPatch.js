// Marcador visual del daño ABSORBIDO por un héroe que está tanqueando
// (Patitos de Goma con su habilidad normal «Picotazo», Muro de Hierro, etc.).
// Cada vez que un golpe dirigido a un aliado se desvía al tanque, sobre su
// retrato aparece «🛡️ -X ABSORBIDO», al estilo de los marcadores de daño,
// curación y stats.
export const DUCK_ABSORB_FX_PATCH = `
<script>
(function(){
  if(window.__bfDuckAbsFx) return;
  window.__bfDuckAbsFx = true;

  var st = document.createElement('style');
  st.textContent = '.bf-absorb-pop{position:fixed;z-index:100005;pointer-events:none;transform:translate(-50%,-50%);'
    + "display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;font-family:'Cinzel',serif;"
    + 'font-weight:900;font-size:34px;line-height:1;color:#bfe9ff;background:radial-gradient(circle,rgba(6,32,58,.72),rgba(6,32,58,0) 72%);'
    + 'text-shadow:0 0 12px rgba(53,167,255,.95),0 3px 8px #000;white-space:nowrap;animation:bfAbsorbPop 3s cubic-bezier(.2,.8,.3,1) forwards}'
    + '.bf-absorb-pop small{font-family:Rubik,sans-serif;font-size:13px;font-weight:800;letter-spacing:2px;color:#eaf6ff;text-shadow:0 2px 6px #000}'
    + '@keyframes bfAbsorbPop{0%{opacity:0;transform:translate(-50%,-20%) scale(.5)}12%{opacity:1;transform:translate(-50%,-58%) scale(1.14)}22%{transform:translate(-50%,-60%) scale(1)}75%{opacity:1;transform:translate(-50%,-92%) scale(1)}100%{opacity:0;transform:translate(-50%,-145%) scale(1.05)}}';
  document.head.appendChild(st);

  function isTank(h){
    if(!h) return false;
    return !!(h._bfDuck || h._bfTank || h._bfBlock || h.tank || h.taunt || h.blocker || h.guard || h.isTank
      || h._token === 'tk_patito_goma' || h.id === 'tk_patito_goma' || h.akind === 'tk_patito_goma');
  }

  // ¿Quién recibe REALMENTE el golpe? El motor desvía al tanque vivo del bando
  // del objetivo, así que aquí se calcula el absorbedor antes de aplicar el daño.
  function absorberFor(target){
    if(!target) return null;
    if(isTank(target)) return { h: target, redirected: false };
    try{
      var side = typeof tSide === 'function' ? tSide(target) : null;
      var tank = side && (G.team[side] || []).find(function(h){ return h && h.alive && isTank(h) && h !== target; });
      if(tank) return { h: tank, redirected: true, from: target };
    }catch(e){}
    return null;
  }

  function pop(h){
    var side = '';
    try{ side = typeof tSide === 'function' ? tSide(h) : ''; }catch(e){}
    return document.getElementById('b_' + side + '_' + h.id);
  }

  function show(h, dmg){
    window.__bfQueueIndicator(function(){return paint(h,dmg);},3150);
  }
  function paint(h, dmg){
    var el = pop(h);
    var r = el ? el.getBoundingClientRect() : null;
    var d = document.createElement('div');
    d.className = 'bf-absorb-pop';
    d.style.left = (r ? r.left + r.width/2 : window.innerWidth/2) + 'px';
    d.style.top = (r ? r.top + r.height*0.42 : window.innerHeight/2) + 'px';
    d.innerHTML = '\\u{1F6E1}\\uFE0F -' + dmg + ' <small>ABSORBIDO</small>';
    (window.__bfAppend||function(n){document.body.appendChild(n);})(d);
    return [d];
  }

  function install(){
    if(typeof window.dealDamage !== 'function' || window.__bfDuckAbsHooked) return false;
    window.__bfDuckAbsHooked = true;
    var orig = window.dealDamage;
    window.dealDamage = function(t){
      var abs = absorberFor(t);
      var d = orig.apply(this, arguments);
      try{
        if(abs && d > 0){
          show(abs.h, d);
          if(typeof pushLog === 'function') pushLog('ld', '\\u{1F6E1}\\uFE0F ' + abs.h.name + ' absorbe ' + d + ' de daño' + (abs.redirected ? ' dirigido a ' + abs.from.name : '') + '.');
        }
      }catch(e){}
      return d;
    };
    return true;
  }

  var n = 0, iv = setInterval(function(){ if(install() || n++ > 150) clearInterval(iv); }, 150);
  install();
})();
</script>
`;