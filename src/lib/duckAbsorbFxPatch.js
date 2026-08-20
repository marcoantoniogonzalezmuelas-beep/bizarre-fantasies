// Marcador visual del daño ABSORBIDO por los Patitos de Goma (tanqueo /
// bloqueo de la habilidad normal). Cuando el motor desvía un golpe al patito,
// se muestra sobre su retrato un cartel «🛡 ABSORBE -X», al estilo de los
// marcadores de Pifia / curación / daño.
export const DUCK_ABSORB_FX_PATCH = `
<script>
(function(){
  if(window.__bfDuckAbsFx) return;
  window.__bfDuckAbsFx = true;

  var st = document.createElement('style');
  st.textContent='.bf-duck-abs{position:fixed;z-index:10000;pointer-events:none;transform:translate(-50%,-50%);font-family:Cinzel,serif;font-weight:1000;font-size:26px;color:#bfe9ff;text-shadow:0 0 12px #35a7ff,0 0 24px rgba(53,167,255,.8),0 3px 6px #000;white-space:nowrap;text-align:center;animation:bfDuckAbs 1.9s ease-out forwards}'
    +'.bf-duck-abs small{display:block;font-family:Rubik,sans-serif;font-size:10px;letter-spacing:2px;color:#fff;opacity:.9}'
    +'@keyframes bfDuckAbs{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}16%{opacity:1;transform:translate(-50%,-95%) scale(1.2)}75%{opacity:1;transform:translate(-50%,-120%) scale(1.08)}100%{opacity:0;transform:translate(-50%,-160%) scale(1)}}';
  document.head.appendChild(st);

  // Cualquier héroe que esté tanqueando/bloqueando golpes por sus aliados:
  // patitos de goma o cualquier otro con un estado de tanque/provocación activo.
  function isTank(h){
    if(!h) return false;
    return !!(h._bfDuck || h._bfTank || h._bfBlock || h.tank || h.taunt || h.blocker || h.guard || h.isTank
      || h._token === 'tk_patito_goma' || h.id === 'tk_patito_goma' || h.akind === 'tk_patito_goma');
  }

  function cardEl(h){
    if(!h) return null;
    return document.querySelector('.bhero[data-id="' + h.id + '"]') || document.querySelector('[data-hero-id="' + h.id + '"]');
  }

  function pop(h, dmg){
    var el = cardEl(h);
    var r = el ? el.getBoundingClientRect() : null;
    var x = r ? r.left + r.width/2 : window.innerWidth/2;
    var y = r ? r.top + r.height*0.35 : window.innerHeight/2;
    var d = document.createElement('div');
    d.className = 'bf-duck-abs';
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.innerHTML = '\\u{1F6E1}\\uFE0F -' + dmg + '<small>ABSORBIDO</small>';
    (window.__bfAppend||function(n){document.body.appendChild(n);})(d);
    setTimeout(function(){ if(d.parentNode) d.remove(); }, 2000);
  }

  function install(){
    if(typeof window.dealDamage !== 'function' || window.__bfDuckAbsHooked) return false;
    window.__bfDuckAbsHooked = true;
    var orig = window.dealDamage;
    window.dealDamage = function(t){
      var d = orig.apply(this, arguments);
      try{
        if(isTank(t) && d > 0){
          pop(t, d);
          if(typeof pushLog === 'function') pushLog('ld', t.name + ' absorbe ' + d + ' de daño tanqueando por sus aliados.');
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