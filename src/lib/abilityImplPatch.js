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

  // Daño escalado con el stat del héroe: con params.min/params.max el golpe
  // va del mínimo al máximo según el stat indicado (por defecto HE), tomando
  // 10 como suelo y 30 como techo de referencia del stat.
  function scaledAmount(hero, p){
    var min = num(p.min, NaN), max = num(p.max, NaN);
    if(isNaN(min) || isNaN(max)) return num(p.amount, 0);
    var stat = ['cc','ad','he'].indexOf(p.stat) >= 0 ? p.stat : 'he';
    var val = 0;
    try{ val = (typeof stat_ === 'function') ? stat_(hero, stat) : (typeof stat === 'string' && typeof window.stat === 'function' ? window.stat(hero, stat) : num(hero[stat], 0)); }catch(e){ val = num(hero[stat], 0); }
    if(!val) val = num(hero[stat], 0);
    var f = Math.max(0, Math.min(1, (val - 10) / 20));
    return Math.round(min + (max - min) * f);
  }

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

  // Stat principal del héroe según su rol, y tipo de golpe correspondiente.
  function primStat(h){ return h && h.type === 'CC' ? 'cc' : h && h.type === 'AD' ? 'ad' : 'he'; }
  function hitType(h){ return h && h.type === 'CC' ? 'melee' : h && h.type === 'AD' ? 'ranged' : 'spell'; }
  function statOf(h, k){ try{ return typeof stat === 'function' ? stat(h, k) : num(h[k], 0); }catch(e){ return num(h[k], 0); } }
  // Valor del paso: amount fijo, o multiplicador sobre el stat del héroe
  // (stat_mult: 1.5 = "1,5 veces su stat principal").
  function stepAmount(hero, st){
    var mult = Number(st.stat_mult);
    if(!isNaN(mult) && mult > 0) return Math.max(1, Math.round(statOf(hero, primStat(hero)) * mult));
    return num(st.amount, 0);
  }
  // Devuelve a la mano una carta de la pila de usados (mismo mecanismo que el
  // hechizo "Reanimación Arcana").
  function recoverCard(side){
    try{
      var entry = typeof window.bfDiscardPop === 'function' ? window.bfDiscardPop(side) : null;
      if(!entry) return '';
      if(entry.kind === 'object'){
        var tmpl = typeof OBJECTS !== 'undefined' ? byId(OBJECTS, entry.id) : null;
        if(!tmpl) return '';
        G.items[side].push(JSON.parse(JSON.stringify(tmpl)));
        return tmpl.name;
      }
      var arr = entry.kind === 'mwep' ? (typeof MELEE !== 'undefined' ? MELEE : []) : entry.kind === 'rwep' ? (typeof RANGED !== 'undefined' ? RANGED : []) : (typeof ARMORS !== 'undefined' ? ARMORS : []);
      var eq = byId(arr, entry.id);
      if(!eq) return '';
      var rec = JSON.parse(JSON.stringify(eq));
      rec._bfRecoveredEq = true; rec._bfSlot = entry.kind; rec.kind = 'object'; rec.num = entry.num || 0;
      G.items[side].push(rec);
      return eq.name;
    }catch(e){ return ''; }
  }

  function applyStep(side, hero, st, t){
    var a = stepAmount(hero, st);
    var turns = Math.max(1, num(st.turns, st.action === 'buff' || st.action === 'debuff' ? 99 : 2));
    var sk = ['cc','ad','he','vel'].indexOf(st.stat) >= 0 ? st.stat : 'cc';
    var mods = function(x){ return (x._mods = x._mods || []); };
    var mark = function(x, txt){ try{ pushFx({k:'status', side:tSide(x), id:x.id, txt:txt}); }catch(e){} };
    switch(st.action){
      case 'damage': { var d = dealDamage(t, a, { type: hitType(hero), pierce: st.pierce ? 1 : 0 }); log(hero.name + ' golpea a ' + t.name + ' (-' + d + ').'); return true; }
      case 'true_damage': { var dt = dealDamage(t, a, { type:'true' }); log(hero.name + ' hiere a ' + t.name + ' ignorando su defensa (-' + dt + ').'); return true; }
      case 'drain': { var dd = dealDamage(t, a, { type: hitType(hero) }); var g = heal(hero, dd); log(hero.name + ' drena a ' + t.name + ' (-' + dd + ') y absorbe esa vida (+' + g + ').'); return true; }
      case 'heal': { var gh = heal(t, a); log(t.name + ' recupera +' + gh + ' de vida.'); return true; }
      case 'heal_full': { var gf = heal(t, t.maxHp); log(t.name + ' recupera toda su vida (+' + gf + ').'); return true; }
      case 'shield': { t.shield = (t.shield || 0) + a; try{ pushFx({k:'shieldup', toSide:tSide(t), toId:t.id}); }catch(e){} log(t.name + ' gana un escudo de ' + a + '.'); return true; }
      // El motor descuenta 1 a "turns" cada ronda y descarta el modificador al
      // llegar a 0: sin ese campo el bonus desaparecería en la misma ronda.
      case 'buff': { var mb = { turns: turns }; mb[sk] = Math.abs(a); mods(t).push(mb); mark(t, '\\u25b2'); log(t.name + ': +' + Math.abs(a) + ' de ' + sk.toUpperCase() + '.'); return true; }
      case 'debuff': { var md = { turns: turns }; md[sk] = -Math.abs(a); mods(t).push(md); mark(t, '\\u25bc'); log(t.name + ': -' + Math.abs(a) + ' de ' + sk.toUpperCase() + ' (' + turns + ' turnos).'); return true; }
      case 'debuff_all_stats': { mods(t).push({ cc:-Math.abs(a), ad:-Math.abs(a), he:-Math.abs(a), vel:-Math.abs(a), turns: turns }); mark(t, '\\u25bc'); log(t.name + ': -' + Math.abs(a) + ' a todos sus atributos (' + turns + ' turnos).'); return true; }
      case 'paralyze': { t.para = Math.max(t.para || 0, turns); mark(t, '\\u26a1'); log(t.name + ' queda paralizado ' + turns + ' turnos.'); return true; }
      case 'skip_turn': { t.skip = Math.max(t.skip || 0, turns); mark(t, '\\u23f8'); log(t.name + ' pierde ' + turns + ' turnos.'); return true; }
      case 'sleep': { t.sleep = Math.max(t.sleep || 0, turns); mark(t, '\\u{1F4A4}'); log(t.name + ' se queda dormido ' + turns + ' turnos.'); return true; }
      case 'silence': { t.silence = Math.max(t.silence || 0, turns); mark(t, '\\u{1F507}'); log(t.name + ' queda silenciado ' + turns + ' turnos.'); return true; }
      case 'confuse': { t._bfConfused = Math.max(t._bfConfused || 0, turns); mark(t, '\\u2605'); log(t.name + ' queda CONFUSO ' + turns + ' turnos (50% de fallar cada acci\\u00f3n).'); return true; }
      case 'drunk': { t._bfDrunk = Math.max(t._bfDrunk || 0, turns); mods(t).push({ cc:-3, ad:-3, he:-3, vel:-3, turns: turns }); var db = dealDamage(t, num(st.amount, 3), { type:'true' }); mark(t, '\\u25c9'); log(t.name + ' se emborracha: -3 a sus atributos, -' + db + ' y 35% de fallar durante ' + turns + ' turnos.'); return true; }
      case 'mark': { t.mark = { dmg: a || 5, turns: turns }; mark(t, '\\u{1F3AF}'); log(t.name + ' queda marcado: recibir\\u00e1 +' + (a || 5) + ' de da\\u00f1o.'); return true; }
      case 'evade': { t.evade = Math.max(t.evade || 0, num(st.amount, 1)); mark(t, '\\u{1F4A8}'); log(t.name + ' esquivar\\u00e1 los ' + Math.max(1, num(st.amount, 1)) + ' pr\\u00f3ximos ataques.'); return true; }
      case 'cleanse': { t.sleep = 0; t.para = 0; t.skip = 0; t.silence = 0; t.mark = null; t._bfConfused = 0; t._bfDrunk = 0; t._mods = (t._mods || []).filter(function(m){ return !((m.cc||0) < 0 || (m.ad||0) < 0 || (m.he||0) < 0 || (m.vel||0) < 0); }); log(t.name + ' vuelve a su estado normal.'); return true; }
      case 'mana': { t.mana = Math.max(0, Math.min(num(t.maxMana, 99), num(t.mana, 0) + a)); log(t.name + ': man\\u00e1 ' + (a >= 0 ? '+' : '') + a + '.'); return true; }
      case 'lifesteal': { hero._bfLifestealCC = 1; log(hero.name + ' roba vida con cada golpe cuerpo a cuerpo.'); return true; }
      case 'recover_card': { var nm = recoverCard(side); if(!nm) { log('No hay cartas en la pila de usados.'); return false; } log(hero.name + ' recupera ' + nm + ' de la pila de usados y la devuelve a su mano.'); return true; }
      // Robo de cartas de la mano rival (mismo mecanismo que el hechizo
      // "El Ladrón Enmascarado").
      case 'steal_card': {
        var veces = Math.max(1, num(st.amount, 1)), robadas = [];
        for(var q = 0; q < veces; q++){
          var rn = (typeof window.__bfStealFromRival === 'function') ? window.__bfStealFromRival(side) : '';
          if(!rn) break;
          robadas.push(rn);
        }
        if(!robadas.length){ log('El rival no tiene cartas en la mano.'); return false; }
        log(hero.name + ' roba de la mano del rival: ' + robadas.join(', ') + '.');
        return true;
      }
      default: return false;
    }
  }
  function log(msg){ try{ if(typeof pushLog === 'function') pushLog('lg', msg); }catch(e){} }

  // ¿Necesita que el jugador elija objetivo? Solo cuando algún paso apunta a un
  // único rival/aliado (los pasos de área o sobre uno mismo no preguntan).
  function needsPick(spec){
    var steps = ((spec.params || {}).steps) || [];
    for(var i = 0; i < steps.length; i++){
      var tg = String((steps[i] || {}).target || 'enemy');
      if(tg === 'enemy' || tg === 'ally') return tg;
    }
    return '';
  }

  function runSteps(side, hero, spec, chosen){
    var steps = ((spec.params || {}).steps) || [];
    var did = false;
    steps.forEach(function(st){
      if(!st || !st.action) return;
      var tg = String(st.target || 'enemy');
      var list = (chosen && (tg === 'enemy' || tg === 'ally')) ? [chosen] : pickTargets(side, hero, tg);
      list.forEach(function(t){
        if(!t || !t.alive) return;
        try{ if(applyStep(side, hero, st, t)) did = true; }catch(e){}
      });
    });
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
        var dmg = scaledAmount(hero, p);
        var list = foes(side);
        if(!p.all) list = list.slice(0, Math.max(1, num(p.targets, 1)));
        list.forEach(function(t){ if(typeof dealDamage === 'function') dealDamage(t, dmg, { type:'true' }); });
        if(typeof pushLog === 'function') pushLog('lg', hero.name + ' \\u2014 ' + (spec.ability_name || '') + ': ' + dmg + ' de da\\u00f1o a ' + (p.all ? 'todos los rivales' : (list.length > 1 ? list.length + ' rivales' : (list[0] ? list[0].name : 'un rival'))) + '.');
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
        var self = this, args = arguments;
        var pick = needsPick(spec);
        var finishSteps = function(t){
          if(!runSteps(side, hero, spec, t)){ orig.apply(self, args); return; }
          hero.abilityUsed = true;
          if(hero.eliteMode) hero.eliteUsed = true;
          if(typeof window.__bfPlayAbilityAnim === 'function'){ try{ window.__bfPlayAbilityAnim(side, hero); }catch(e){} }
          if(typeof renderBattle === 'function') renderBattle();
          if(typeof netSync === 'function') netSync('s-battle');
          setTimeout(complete, 420);
        };
        if(!pick){ finishSteps(null); return; }
        var pool = pick === 'ally' ? side : (side === 'p' ? 'o' : 'p');
        var label = 'Objetivo de ' + (hero.eliteMode ? (hero.eAbility || hero.ability) : hero.ability);
        if(typeof humanCtl === 'function' && humanCtl(side) && typeof pendTarget === 'function'){
          pendTarget(label, pool, finishSteps);
        } else {
          var cands = team(pool).filter(function(x){ return x && x.alive; }).sort(function(a, b){ return a.hp - b.hp; });
          finishSteps(cands[0] || null);
        }
        return;
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