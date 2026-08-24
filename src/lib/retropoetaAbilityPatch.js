// Habilidad de Retropoeta (id "ret") — daño mágico escalado con su stat HE.
//
// NORMAL "Paradoja Arcana": golpe a un rival elegido, de 15 a 30 según su HE.
// ÉLITE  "Bucle Temporal":  el golpe se repite en dos rivales, de 25 a 50.
//
// La escala usa HE 10 como suelo y HE 30 como techo de referencia.
export const RETROPOETA_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfRetroAbil) return;
  window.__bfRetroAbil = true;

  function isRetro(h){
    if(!h) return false;
    return String(h.id || '').toLowerCase() === 'ret' || String(h.name || '') === 'Retropoeta';
  }

  function scaled(h, min, max){
    var he = 0;
    try{ he = (typeof stat === 'function') ? stat(h, 'he') : Number(h.he || 0); }catch(e){ he = Number(h.he || 0); }
    var f = Math.max(0, Math.min(1, (he - 10) / 20));
    return Math.round(min + (max - min) * f);
  }

  function install(){
    if(typeof window.useAbility !== 'function' || window.__bfRetroHooked) return false;
    if(typeof pendTarget !== 'function' || typeof G === 'undefined') return false;
    window.__bfRetroHooked = true;
    var orig = window.useAbility;

    window.useAbility = function(side, h, done){
      if(!isRetro(h)) return orig.apply(this, arguments);

      var foesSide = (typeof enemySide === 'function') ? enemySide(side) : (side === 'p' ? 'o' : 'p');
      function livingFoes(){
        var arr = (G.team && G.team[foesSide]) || [];
        return (typeof living === 'function') ? living(arr) : arr.filter(function(x){ return x && x.alive; });
      }
      function finish(){
        h.abilityUsed = true;
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
        if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct();
      }
      function hit(t){
        if(!t) return;
        var dmg = h.eliteMode ? scaled(h, 25, 50) : scaled(h, 15, 30);
        if(typeof pushFx === 'function') pushFx({ k:'spell', toSide: foesSide, toId: t.id, el:'rayo' });
        var d = (typeof dealDamage === 'function') ? dealDamage(t, dmg, { type:'spell', element:'rayo' }) : 0;
        if(typeof pushLog === 'function') pushLog('ld', h.name + ' \\u2014 ' + (h.eliteMode ? 'Bucle Temporal' : 'Paradoja Arcana') + ' \\u2192 ' + t.name + ' (-' + (d || dmg) + ').');
      }

      try{
        var pool = livingFoes();
        if(!pool.length){ finish(); return; }

        function apply(main){
          hit(main);
          if(h.eliteMode){
            var second = livingFoes().find(function(x){ return x !== main; });
            if(second) hit(second);
          }
          finish();
        }

        // IA: golpea al rival más debilitado sin diálogo.
        if(typeof humanCtl === 'function' && !humanCtl(side)){
          apply(pool.slice().sort(function(a, b){ return a.hp - b.hp; })[0]);
          return;
        }

        pendTarget('Objetivo del conjuro', foesSide, function(t){ apply(t); });
      }catch(e){ finish(); }
    };
    return true;
  }

  var n = 0, iv = setInterval(function(){ if(install() || n++ > 200) clearInterval(iv); }, 150);
  install();
})();
</script>
`;