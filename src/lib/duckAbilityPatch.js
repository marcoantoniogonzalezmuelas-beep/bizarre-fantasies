// Habilidad PROPIA de los Patitos de Goma (token tk_patito_goma).
//
// El bloqueo (tanqueo) ya lo hace el motor: cualquier golpe dirigido a un aliado
// se desvía al patito vivo, para el resto de la partida, hasta que muere.
// Lo que faltaba era SU habilidad, que caía en el ataque genérico del motor:
//   · Normal — «Picotazo»: pequeño ataque a distancia a un rival y el patito
//     queda EN JUEGO como bloqueador mientras siga vivo.
//   · Élite — «Doble Metralleta Láser»: ráfaga de metralleta a TODOS los
//     rivales. Disparo de 10 a cada héroe enemigo. Lanza la cinemática 3D
//     de la habilidad y una ráfaga visual de trazadores láser (ligera:
//     usa el sistema pushFx del motor, que se sincroniza solo en
//     multiplayer y no crea elementos DOM pesados).
export const DUCK_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfDuckAbil) return;
  window.__bfDuckAbil = true;

  function isDuck(h){ return !!h && (h._bfDuck || h._token === 'tk_patito_goma' || h.id === 'tk_patito_goma' || String(h.id||'').indexOf('tk_patito_goma') === 0); }

  function install(){
    if(typeof window.useAbility !== 'function' || window.__bfDuckAbilHooked) return false;
    if(typeof G === 'undefined') return false;
    window.__bfDuckAbilHooked = true;
    var orig = window.useAbility;

    window.useAbility = function(side, h, done){
      if(!isDuck(h)) return orig.apply(this, arguments);

      // Multiplayer: el cliente envía un intent al host y NO ejecuta la
      // habilidad en local. El host la ejecuta, aplica el daño autoritativo
      // y sincroniza el estado. Sin esto, el cliente aplica daño local (que
      // el host sobrescribe) y el turno se queda colgado.
      if(typeof NET !== 'undefined' && NET.role === 'client' && typeof sendIntent === 'function'){
        sendIntent('useAbility', {});
        return;
      }

      var foes = enemySide(side);
      function sync(){ if(typeof renderBattle === 'function') renderBattle(); if(typeof netSync === 'function') netSync('s-battle'); }
      var finish = function(){ h.abilityUsed = true; sync(); if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct(); };

      // ÉLITE — Doble Metralleta Láser: 10 de daño a TODOS los rivales.
      if(h.eliteMode){
        var targets = living(foes).slice();
        // Lanza la cinemática 3D de la habilidad (si el patito tiene arte
        // de animación asignado en la BD).
        if(typeof window.__bfPlayAbilityAnim === 'function'){
          try{ window.__bfPlayAbilityAnim(side, h, true); }catch(e){}
        }
        // Ráfaga visual de metralleta: usa el sistema pushFx del motor
        // (launchProjectile), que es ligero y se sincroniza solo en
        // multiplayer. 3 trazadores por rival simulan la ráfaga sin
        // saturar el DOM (antes se creaban 144 elementos con setInterval
        // y bloqueaba el navegador del invitado).
        targets.forEach(function(t){
          for(var s = 0; s < 3; s++){
            pushFx({ k:'arrow', fromSide:side, fromId:h.id, toSide:tSide(t), toId:t.id, hits:1 });
          }
        });
        // Aplica 10 de daño a cada rival
        var total = 0;
        targets.forEach(function(t){
          var d = dealDamage(t, 10, { type:'ranged' });
          total += d;
        });
        pushLog('ld', h.name + ' suelta una r\\u00e1faga de metralleta l\\u00e1ser sobre todos los rivales (-' + total + ').');
        finish();
        return;
      }

      // NORMAL — Picotazo: pequeño ataque a distancia y queda en juego bloqueando.
      var shoot = function(t){
        if(typeof window.__bfPlayAbilityAnim === 'function'){
          try{ window.__bfPlayAbilityAnim(side, h, true); }catch(e){}
        }
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