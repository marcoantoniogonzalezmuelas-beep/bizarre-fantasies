// LÓGICA (sin nada visual) de los estados propios: CONFUSO, BORRACHO y MAREADO.
//
// El sistema VISUAL de estados (rótulos, auras, partículas, congelado de
// retratos) se ha eliminado por completo y se rehará desde cero. Aquí solo
// queda la mecánica de juego para que las habilidades sigan funcionando:
//   · tk_confuse → deja CONFUSO a un rival (puede perder el turno).
//   · tk_drunk   → emborracha a un rival (-3 atributos y 3 de daño).
//   · tk_dizzy   → marea a todos los rivales (-4 atributos varios turnos).
//   · tk_none    → habilidad espectacular que no altera la batalla.
export const ODD_STATES_LOGIC_PATCH = `
<script>
(function(){
  if(window.__bfOddStatesLogic) return;
  window.__bfOddStatesLogic = true;

  function installAbilities(){
    if(typeof window.useAbility !== 'function') return false;
    if(window.useAbility.__bfOddStates) return true;
    var original = window.useAbility;
    window.useAbility = function(side, hero, done){
      var kind = hero && hero.akind, isNoEffect = kind === 'tk_none' || (kind === 'tk_dizzy' && !hero.eliteMode);
      if(!hero || (!isNoEffect && kind !== 'tk_confuse' && kind !== 'tk_drunk' && kind !== 'tk_dizzy')) return original.apply(this, arguments);
      function complete(){ hero.abilityUsed = true; if(typeof renderBattle === 'function') renderBattle(); if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct(); }
      if(isNoEffect){
        if(typeof pushLog === 'function') pushLog('li','\\u2726 ' + hero.name + ' usa ' + (hero.eliteMode ? (hero.eAbility || hero.ability) : hero.ability) + '. Es espectacular, pero no altera la batalla.');
        complete(); return;
      }
      var foes = typeof enemySide === 'function' ? enemySide(side) : (side === 'p' ? 'o' : 'p');
      if(kind === 'tk_dizzy'){
        var turns = hero.eliteMode ? 3 : 2, targets = (typeof G !== 'undefined' && G.team && G.team[foes] || []).filter(function(h){ return h && h.alive; });
        targets.forEach(function(target){ target._bfDizzy = Math.max(target._bfDizzy || 0, turns); target._mods = target._mods || []; target._mods.push({cc:-4,ad:-4,he:-4,turns:turns}); if(typeof pushFx === 'function') pushFx({k:'status',side:foes,id:target.id,txt:'\\ud83c\\udf00'}); });
        if(typeof pushLog === 'function') pushLog('li','\\u2623 ' + hero.name + ' marea a todos los rivales: -4 a CC, AD y HE durante ' + turns + ' turnos.');
        complete(); return;
      }
      var label = kind === 'tk_confuse' ? 'Rival a confundir' : 'Rival que beber\\u00e1 el licor';
      if(typeof pendTarget !== 'function') return original.apply(this, arguments);
      pendTarget(label, foes, function(target){
        var turns = hero.eliteMode ? 3 : 2;
        if(kind === 'tk_confuse'){
          target._bfConfused = Math.max(target._bfConfused || 0, turns);
          if(typeof pushLog === 'function') pushLog('li','\\u2605 ' + hero.name + ' deja CONFUSO a ' + target.name + ' durante ' + turns + ' turnos.');
          if(typeof pushFx === 'function') pushFx({k:'status',side:typeof tSide === 'function' ? tSide(target) : foes,id:target.id,txt:'\\u2605'});
        } else {
          target._bfDrunk = Math.max(target._bfDrunk || 0, turns);
          target._mods = target._mods || [];
          target._mods.push({cc:-3,ad:-3,he:-3,turns:turns});
          if(typeof dealDamage === 'function') dealDamage(target, 3, {type:'true'});
          if(typeof pushLog === 'function') pushLog('li','\\u25c9 ' + hero.name + ' emborracha a ' + target.name + ': -3 a sus atributos y 3 de da\\u00f1o.');
          if(typeof pushFx === 'function') pushFx({k:'status',side:typeof tSide === 'function' ? tSide(target) : foes,id:target.id,txt:'\\u25c9'});
        }
        complete();
      });
    };
    window.useAbility.__bfOddStates = 1; return true;
  }

  function installTurns(){
    if(typeof window.stepTurn !== 'function') return false;
    if(window.stepTurn.__bfOddStates) return true;
    var original = window.stepTurn;
    window.stepTurn = function(){
      if(typeof B !== 'undefined' && B && !B.over && B.queue && B.qi < B.queue.length){
        var slot = B.queue[B.qi], h = typeof getHero === 'function' ? getHero(slot.side, slot.id) : null;
        if(h && h.alive){
          if(h._bfConfused > 0){ h._bfConfused--; if(Math.random() < .5){ h.skip = Math.max(h.skip || 0, 1); if(typeof pushLog === 'function') pushLog('li','\\u2605 ' + h.name + ' est\\u00e1 CONFUSO y pierde el turno.'); } }
          if(h._bfDrunk > 0){ h._bfDrunk--; if(Math.random() < .35){ h.skip = Math.max(h.skip || 0, 1); if(typeof pushLog === 'function') pushLog('li','\\u25c9 ' + h.name + ' est\\u00e1 BORRACHO y falla su acci\\u00f3n.'); } }
          if(h._bfDizzy > 0) h._bfDizzy--;
        }
      }
      return original.apply(this, arguments);
    };
    window.stepTurn.__bfOddStates = 1; return true;
  }

  var t = 0, timer = setInterval(function(){ t++; installAbilities(); installTurns(); if(t > 40) clearInterval(timer); }, 300);
  installAbilities(); installTurns();
})();
</script>
`;