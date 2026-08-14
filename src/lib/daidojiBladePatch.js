// Habilidad NORMAL de Daidoji Esva: "Filo Espectral" — cuando ataca, inflige
// 2 puntos de daño adicional por cada OTRO guerrero vivo en su campo.
//
// Se implementa envolviendo dealDamage: cuando el héroe que actúa es Daidoji
// en su versión normal (no élite) y golpea a un rival, se añade el daño extra.
export const DAIDOJI_BLADE_PATCH = `
<script>
(function(){
  if(window.__bfDaidojiBladePatch) return;
  window.__bfDaidojiBladePatch = true;

  var BONUS = 2;

  function isDaidoji(h){ return !!h && h.akind === 'crane-summon' && !h.eliteMode; }

  function warriorCount(side, hero){
    var team = (typeof G !== 'undefined' && G.team && G.team[side]) || [];
    return team.filter(function(h){
      return h && h.alive && h !== hero && h.id !== hero.id && String(h.clan || '') === 'Guerreros';
    }).length;
  }

  function install(){
    if(window.__bfDaidojiHooked || typeof window.dealDamage !== 'function' || typeof G === 'undefined') return false;
    window.__bfDaidojiHooked = true;
    var orig = window.dealDamage;
    window.dealDamage = function(target, amount, opts){
      try{
        if(!(opts && opts.bfSpectral) && target && amount > 0 && typeof B !== 'undefined' && B && B.current){
          var attacker = (typeof getHero === 'function') ? getHero(B.current.side, B.current.id) : null;
          if(isDaidoji(attacker) && (typeof tSide !== 'function' || tSide(target) !== B.current.side)){
            var n = warriorCount(B.current.side, attacker);
            if(n > 0){
              amount = amount + BONUS * n;
              arguments[1] = amount;
              if(typeof pushLog === 'function') pushLog('lg', '\\u2694\\ufe0f Filo Espectral: +' + (BONUS * n) + ' de da\\u00f1o de ' + attacker.name + ' (' + n + ' guerrero' + (n > 1 ? 's' : '') + ' aliado' + (n > 1 ? 's' : '') + ').');
            }
          }
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    return true;
  }

  var tries = 0, t = setInterval(function(){
    if(install() || tries++ > 160) clearInterval(t);
  }, 150);
})();
</script>
`;