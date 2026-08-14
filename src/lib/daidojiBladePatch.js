// Habilidad NORMAL de Daidoji Esva: "Filo Espectral".
//
// Al activarla, la habilidad queda MARCADA COMO USADA (1 uso por combate) y a
// partir de ese momento, cada vez que Daidoji ataque, añade +5 de daño por
// cada aliado vivo en batalla en ese momento. El bonus se muestra con su
// número concreto sobre el héroe rival en la escena de batalla.
export const DAIDOJI_BLADE_PATCH = `
<script>
(function(){
  if(window.__bfDaidojiBladePatch) return;
  window.__bfDaidojiBladePatch = true;

  var BONUS = 5;

  function isDaidoji(h){ return !!h && h.akind === 'crane-summon' && !h.eliteMode; }

  // Aliados vivos en batalla en este momento (sin contar a Daidoji).
  function allyCount(side, hero){
    var team = (typeof G !== 'undefined' && G.team && G.team[side]) || [];
    return team.filter(function(h){ return h && h.alive && h.id !== hero.id; }).length;
  }

  // Número flotante del bonus sobre el rival golpeado.
  function bonusFx(target, extra){
    try{
      if(!document.getElementById('bf-spectral-css')){
        var st = document.createElement('style'); st.id = 'bf-spectral-css';
        st.textContent = '.bf-spectral-num{position:absolute;z-index:60;pointer-events:none;font-family:Rubik,system-ui,sans-serif;font-weight:1000;font-size:30px;color:#dcbcff;text-shadow:0 0 12px rgba(180,90,255,.95),0 0 26px rgba(120,40,220,.8),0 2px 3px #000;animation:bfSpectralNum 1.35s ease-out forwards}'
          + '@keyframes bfSpectralNum{0%{opacity:0;transform:translate(-50%,10px) scale(.6)}18%{opacity:1;transform:translate(-50%,-6px) scale(1.25)}100%{opacity:0;transform:translate(-50%,-64px) scale(1)}}';
        document.head.appendChild(st);
      }
      var side = (typeof tSide === 'function') ? tSide(target) : null;
      var host = document.querySelector('.hero-card[data-side="' + side + '"][data-id="' + target.id + '"]')
        || document.querySelector('[data-hid="' + target.id + '"]')
        || document.getElementById('battle-wrap') || document.body;
      var cs = getComputedStyle(host);
      if(cs.position === 'static') host.style.position = 'relative';
      var el = document.createElement('div');
      el.className = 'bf-spectral-num';
      el.textContent = '\\u2694\\ufe0f +' + extra;
      el.style.left = '50%';
      el.style.top = '18%';
      host.appendChild(el);
      setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 1450);
    }catch(e){}
    try{ if(typeof pushFx === 'function') pushFx({k:'status', side:(typeof tSide==='function'?tSide(target):''), id:target.id, txt:'+' + extra}); }catch(e){}
  }

  // 1) Activación: marca la habilidad como usada y deja el filo activo.
  function installAbility(){
    if(window.__bfDaidojiAbilHooked || typeof window.useAbility !== 'function' || typeof G === 'undefined') return false;
    window.__bfDaidojiAbilHooked = true;
    var orig = window.useAbility;
    window.useAbility = function(side, h, done){
      if(!isDaidoji(h)) return orig.apply(this, arguments);
      h._bfSpectral = true;
      h.abilityUsed = true;
      if(typeof pushLog === 'function') pushLog('lg', '\\u2694\\ufe0f ' + h.name + ' invoca Filo Espectral: sus ataques suman +' + BONUS + ' de da\\u00f1o por cada aliado vivo.');
      if(typeof pushFx === 'function') pushFx({k:'status', side:side, id:h.id, txt:'\\u2694\\ufe0f'});
      if(typeof window.__bfPlayAbilityAnim === 'function'){ try{ window.__bfPlayAbilityAnim(side, h); }catch(e){} }
      if(typeof renderBattle === 'function') renderBattle();
      if(typeof netSync === 'function') netSync('s-battle');
      setTimeout(function(){ if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct(); }, 420);
    };
    return true;
  }

  // 2) Cada ataque de Daidoji suma el bonus mientras el filo está activo.
  function installDamage(){
    if(window.__bfDaidojiHooked || typeof window.dealDamage !== 'function' || typeof G === 'undefined') return false;
    window.__bfDaidojiHooked = true;
    var orig = window.dealDamage;
    window.dealDamage = function(target, amount, opts){
      try{
        if(!(opts && opts.bfSpectral) && target && amount > 0 && typeof B !== 'undefined' && B && B.current){
          var attacker = (typeof getHero === 'function') ? getHero(B.current.side, B.current.id) : null;
          if(isDaidoji(attacker) && attacker._bfSpectral && (typeof tSide !== 'function' || tSide(target) !== B.current.side)){
            var n = allyCount(B.current.side, attacker);
            if(n > 0){
              var extra = BONUS * n;
              amount = amount + extra;
              arguments[1] = amount;
              bonusFx(target, extra);
              if(typeof pushLog === 'function') pushLog('lg', '\\u2694\\ufe0f Filo Espectral: +' + extra + ' de da\\u00f1o (' + n + ' aliado' + (n > 1 ? 's' : '') + ' vivo' + (n > 1 ? 's' : '') + ').');
            }
          }
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    return true;
  }

  var tries = 0, t = setInterval(function(){
    installAbility(); installDamage();
    if((window.__bfDaidojiAbilHooked && window.__bfDaidojiHooked) || tries++ > 160) clearInterval(t);
  }, 150);
})();
</script>
`;