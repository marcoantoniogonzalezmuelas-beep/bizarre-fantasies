// Motor genérico de habilidades "implementadas desde el editor".
//
// El backoffice guarda, para cada carta, un efecto de un catálogo cerrado de
// mecánicas soportadas (entidad AbilityImpl). Este parche recibe esas fichas
// por postMessage (bfAbilitySpecs) y las aplica en la batalla:
//
//   · attack_bonus_per_ally  → daño extra al atacar por cada aliado vivo
//   · heal_allies_per_turn   → cura a todo el equipo al inicio de cada ronda
//   · heal_allies_now        → cura a todo el equipo al usar la habilidad
//   · damage_enemy           → daño directo a un rival (o a todos)
//   · buff_self              → sube un stat del propio héroe
//   · shield_self            → escudo al propio héroe
//
// Las habilidades que no encajan en el catálogo se marcan como "manual" en el
// editor y NO se tocan aquí (siguen su comportamiento original en el juego).
export const ABILITY_IMPL_PATCH = `
<script>
(function(){
  if(window.__bfAbilityImplPatch) return;
  window.__bfAbilityImplPatch = true;

  var SPECS = {}; // key: card_id + '|' + (elite?'e':'n')

  window.addEventListener('message', function(e){
    if(e.data && e.data.bfAbilitySpecs){
      SPECS = {};
      (e.data.bfAbilitySpecs || []).forEach(function(s){
        if(s && s.card_id && s.effect_type && s.effect_type !== 'unsupported' && s.status === 'implemented'){
          SPECS[s.card_id + '|' + (s.elite ? 'e' : 'n')] = s;
        }
      });
    }
  });

  function cardIdOf(h){ return h && (h._token || h.cardId || h.card_id || h.id) || ''; }
  function specFor(h){
    if(!h) return null;
    var id = String(cardIdOf(h)).replace(/_\\d{6,}$/, '');
    return SPECS[id + '|' + (h.eliteMode ? 'e' : 'n')] || null;
  }
  function team(side){ return (typeof G !== 'undefined' && G.team && G.team[side]) || []; }
  function allies(side, hero){ return team(side).filter(function(h){ return h && h.alive && h !== hero; }); }
  function foes(side){
    var other = side === 'p' ? 'o' : 'p';
    return team(other).filter(function(h){ return h && h.alive; });
  }
  function num(v, d){ var n = Number(v); return isNaN(n) ? d : n; }

  // ── Mecánicas NUEVAS creadas desde el editor: lista de pasos (custom_steps).
  // El editor guarda params.steps = [{action, target, amount, stat, turns}] y
  // aquí se traduce cada paso a las funciones reales del motor de batalla.
  function pickTargets(side, hero, target){
    var f = foes(side), a = team(side).filter(function(h){ return h && h.alive; });
    var byHp = function(list, asc){ return list.slice().sort(function(x,y){ return asc ? (x.hp - y.hp) : (y.hp - x.hp); }); };
    switch(String(target || 'enemy')){
      case 'self': return [hero];
      case 'ally': return byHp(a.filter(function(h){ return h !== hero; }), true).slice(0, 1);
      case 'all_allies': return a;
      case 'all_enemies': return f;
      case 'weakest_enemy': return byHp(f, true).slice(0, 1);
      case 'strongest_enemy': return byHp(f, false).slice(0, 1);
      default: return f.slice(0, 1);
    }
  }

  function runSteps(side, hero, spec){
    var steps = ((spec.params || {}).steps) || [];
    var did = false;
    steps.forEach(function(st){
      if(!st || !st.action) return;
      var list = pickTargets(side, hero, st.target);
      var amount = num(st.amount, 0);
      var stat = ['cc','ad','he'].indexOf(st.stat) >= 0 ? st.stat : 'cc';
      list.forEach(function(t){
        if(!t) return;
        try{
          if(st.action === 'damage' && typeof dealDamage === 'function'){ dealDamage(t, amount, { type:'true' }); did = true; }
          else if(st.action === 'heal' && typeof heal === 'function'){ heal(t, amount); did = true; }
          else if(st.action === 'shield'){ t.shield = (t.shield || 0) + amount; did = true; }
          // IMPORTANTE: el motor descuenta 1 a "turns" cada ronda y descarta el
          // modificador cuando llega a 0. Sin ese campo el bonus/penalización
          // desaparecía en la misma ronda y nunca se veía en los indicadores.
          else if(st.action === 'buff'){ var m = { turns: Math.max(1, num(st.turns, 99)) }; m[stat] = Math.abs(amount); (t._mods = t._mods || []).push(m); did = true; }
          else if(st.action === 'debuff'){ var d = { turns: Math.max(1, num(st.turns, 2)) }; d[stat] = -Math.abs(amount); (t._mods = t._mods || []).push(d); did = true; }
          else if(st.action === 'paralyze'){ t.skipTurns = (t.skipTurns || 0) + Math.max(1, num(st.turns, 1)); did = true; }
          else if(st.action === 'mana'){ t.mana = Math.max(0, Math.min(num(t.maxMana, 99), num(t.mana, 0) + amount)); did = true; }
        }catch(e){}
      });
    });
    if(did && typeof pushLog === 'function') pushLog('lg', hero.name + ' \\u2014 ' + (spec.ability_name || '') + ': ' + (spec.note || 'habilidad aplicada') + '.');
    return did;
  }

  // ── Pasiva: daño extra al atacar por cada aliado vivo (opcionalmente de un clan)
  function hookDamage(){
    if(window.__bfAiDmgHooked || typeof window.dealDamage !== 'function') return false;
    window.__bfAiDmgHooked = true;
    var orig = window.dealDamage;
    window.dealDamage = function(target, amount, opts){
      try{
        if(target && amount > 0 && typeof B !== 'undefined' && B && B.current){
          var attacker = (typeof getHero === 'function') ? getHero(B.current.side, B.current.id) : null;
          var spec = specFor(attacker);
          if(spec && spec.effect_type === 'attack_bonus_per_ally' && (typeof tSide !== 'function' || tSide(target) !== B.current.side)){
            var p = spec.params || {};
            var list = allies(B.current.side, attacker).filter(function(a){ return !p.clan || String(a.clan || '') === p.clan; });
            var extra = num(p.bonus, 0) * list.length;
            if(extra > 0){
              arguments[1] = amount + extra;
              if(typeof pushLog === 'function') pushLog('lg', '\\u2728 ' + (spec.ability_name || attacker.name) + ': +' + extra + ' de da\\u00f1o.');
            }
          }
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    return true;
  }

  // ── Pasiva: curación de equipo al inicio de cada ronda
  function hookRound(){
    if(window.__bfAiRoundHooked || typeof window.nextRound !== 'function') return false;
    window.__bfAiRoundHooked = true;
    var orig = window.nextRound;
    window.nextRound = function(){
      try{
        ['p','o'].forEach(function(side){
          team(side).forEach(function(h){
            if(!h || !h.alive) return;
            var spec = specFor(h);
            if(!spec || spec.effect_type !== 'heal_allies_per_turn' || !h._bfImplActive) return;
            var amount = num((spec.params || {}).amount, 0);
            if(amount <= 0) return;
            var healed = 0;
            team(side).forEach(function(a){ if(a && a.alive && (typeof heal === 'function' ? heal(a, amount) : 0) > 0) healed++; });
            if(healed && typeof pushLog === 'function') pushLog('lg', '\\u{1F49A} ' + h.name + ': +' + amount + ' de vida a todo el equipo.');
          });
        });
        if(typeof renderBattle === 'function') renderBattle();
      }catch(e){}
      return orig.apply(this, arguments);
    };
    return true;
  }

  // ── Activas: se resuelven al usar la habilidad
  function hookAbility(){
    if(window.__bfAiAbilHooked || typeof window.useAbility !== 'function' || typeof G === 'undefined') return false;
    window.__bfAiAbilHooked = true;
    var orig = window.useAbility;
    window.useAbility = function(side, hero, done){
      var spec = specFor(hero);
      var kind = spec && spec.effect_type;
      var p = (spec && spec.params) || {};
      if(!spec) return orig.apply(this, arguments);

      // Pasivas: se activan y el turno sigue su curso normal.
      if(kind === 'attack_bonus_per_ally') return orig.apply(this, arguments);
      if(kind === 'heal_allies_per_turn'){ hero._bfImplActive = true; return orig.apply(this, arguments); }

      var complete = typeof done === 'function' ? done : function(){ if(typeof finishAct === 'function') finishAct(); };
      var acted = false;

      if(kind === 'heal_allies_now'){
        var amount = num(p.amount, 0);
        team(side).forEach(function(a){ if(a && a.alive && typeof heal === 'function') heal(a, amount); });
        if(typeof pushLog === 'function') pushLog('lg', hero.name + ' \\u2014 ' + (spec.ability_name || '') + ': +' + amount + ' de vida a todo el equipo.');
        acted = true;
      } else if(kind === 'damage_enemy'){
        var dmg = num(p.amount, 0);
        var list = foes(side);
        if(!p.all) list = list.slice(0, 1);
        list.forEach(function(t){ if(typeof dealDamage === 'function') dealDamage(t, dmg, { type:'true' }); });
        if(typeof pushLog === 'function') pushLog('lg', hero.name + ' \\u2014 ' + (spec.ability_name || '') + ': ' + dmg + ' de da\\u00f1o a ' + (p.all ? 'todos los rivales' : (list[0] ? list[0].name : 'un rival')) + '.');
        acted = list.length > 0;
      } else if(kind === 'buff_self'){
        var stat = ['cc','ad','he'].indexOf(p.stat) >= 0 ? p.stat : 'cc';
        var inc = num(p.amount, 0);
        // turns: el motor caduca los modificadores por rondas; 99 = todo el combate.
        var mod = { turns: Math.max(1, num(p.turns, 99)) }; mod[stat] = inc;
        (hero._mods = hero._mods || []).push(mod);
        if(typeof pushLog === 'function') pushLog('lg', hero.name + ' \\u2014 ' + (spec.ability_name || '') + ': +' + inc + ' de ' + stat.toUpperCase() + '.');
        acted = true;
      } else if(kind === 'custom_steps'){
        acted = runSteps(side, hero, spec);
      } else if(kind === 'shield_self'){
        var sh = num(p.amount, 0);
        hero.shield = (hero.shield || 0) + sh;
        if(typeof pushLog === 'function') pushLog('lg', hero.name + ' \\u2014 ' + (spec.ability_name || '') + ': escudo de ' + sh + '.');
        acted = true;
      } else {
        return orig.apply(this, arguments);
      }

      if(!acted) return orig.apply(this, arguments);
      hero.abilityUsed = true;
      if(hero.eliteMode) hero.eliteUsed = true;
      if(typeof window.__bfPlayAbilityAnim === 'function'){ try{ window.__bfPlayAbilityAnim(side, hero); }catch(e){} }
      if(typeof renderBattle === 'function') renderBattle();
      if(typeof netSync === 'function') netSync('s-battle');
      setTimeout(complete, 420);
    };
    return true;
  }

  var tries = 0, t = setInterval(function(){
    hookDamage(); hookRound(); hookAbility();
    if((window.__bfAiDmgHooked && window.__bfAiRoundHooked && window.__bfAiAbilHooked) || tries++ > 160) clearInterval(t);
  }, 150);
})();
</script>
`;