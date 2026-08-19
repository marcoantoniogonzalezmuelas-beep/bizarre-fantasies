// Habilidad PROPIA de los Patitos de Goma (token tk_patito_goma).
//
// El bloqueo (tanqueo) ya lo hace el motor: cualquier golpe dirigido a un aliado
// se desvía al patito vivo, para el resto de la partida, hasta que muere.
// Lo que faltaba era SU habilidad, que caía en el ataque genérico del motor:
//   · Normal — «Picotazo»: pequeño ataque a distancia a un rival y el patito
//     queda EN JUEGO como bloqueador mientras siga vivo.
//   · Élite — «Doble Metralleta Láser»: ráfaga de 2 disparos a TODOS los rivales.
export const DUCK_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfDuckAbil) return;
  window.__bfDuckAbil = true;

  function isDuck(h){ return !!h && (h._bfDuck || h._token === 'tk_patito_goma' || h.id === 'tk_patito_goma'); }

  function install(){
    if(typeof window.useAbility !== 'function' || window.__bfDuckAbilHooked) return false;
    if(typeof G === 'undefined') return false;
    window.__bfDuckAbilHooked = true;
    var orig = window.useAbility;

    window.useAbility = function(side, h, done){
      if(!isDuck(h)) return orig.apply(this, arguments);
      var foes = enemySide(side);
      var finish = function(){ h.abilityUsed = true; if(typeof renderBattle === 'function') renderBattle(); if(typeof netSync === 'function') netSync('s-battle'); if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct(); };

      // ÉLITE — Doble Metralleta Láser: 2 disparos a todos los rivales.
      if(h.eliteMode){
        var total = 0;
        living(foes).forEach(function(t){
          total += dealDamage(t, 1, { type:'ranged' });
          pushFx({ k:'arrow', fromSide:side, fromId:h.id, toSide:tSide(t), toId:t.id, hits:1 });
        });
        pushLog('ld', h.name + ' suelta una ráfaga leve de metralleta láser sobre todos los rivales (-' + total + ').');
        finish();
        return;
      }

      // NORMAL — Picotazo: pequeño ataque a distancia y queda en juego bloqueando.
      var shoot = function(t){
        var d = dealDamage(t, 2, { type:'ranged' });
        pushFx({ k:'arrow', fromSide:side, fromId:h.id, toSide:tSide(t), toId:t.id, hits:1 });
        pushFx({ k:'status', side:side, id:h.id, txt:'\\u{1F986}' });
        pushLog('ld', h.name + ' da un Picotazo a ' + t.name + ' (-' + d + ') y queda EN JUEGO bloqueando los golpes de sus aliados.');
        finish();
      };

      if(humanCtl(side)) pendTarget('Objetivo del Picotazo', foes, shoot);
      else {
        var t = living(foes).sort(function(a,b){ return a.hp - b.hp; })[0];
        if(t) shoot(t); else finish();
      }
    };
    return true;
  }

  var n = 0, iv = setInterval(function(){ if(install() || n++ > 150) clearInterval(iv); }, 150);
  install();
})();
</script>
`;