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

  // ¿Esta unidad tiene una ficha EJECUTABLE en la base de datos? Los parches por héroe escritos en código ceden
  // ante ella: la base de datos manda. Las fichas dedicated_* no cuentan (su comportamiento sigue en el motor).
  window.__bfSpecOwns = function(h){
    try{
      var s = specFor(h);
      return !!(s && s.status === 'implemented' && s.effect_type && s.effect_type !== 'unsupported' && String(s.effect_type).indexOf('dedicated_') !== 0);
    }catch(e){ return false; }
  };

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
  // FX arcano (mágico) para las habilidades de héroes arcanos (HE): orbes + runas
  // violetas en vez del agua/fuego/rayo por defecto del motor nativo.
  function arcaneFx(t){ try{ if(t && typeof pushFx==='function') pushFx({k:'spell', toSide:(typeof tSide==='function'?tSide(t):'o'), toId:t.id, el:'arcano'}); }catch(e){} }

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
      case 'random_enemy': { var rf = f.filter(function(h){ return h && h.alive; }); return rf.length ? [rf[Math.floor(Math.random() * rf.length)]] : []; }
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
  // Escalado por Magia, igual que los hechizos del motor: base x (HE del lanzador / HE_REF).
  function magicAmount(hero, st){
    var ref = (typeof HE_REF !== 'undefined' && HE_REF > 0) ? HE_REF : 18;
    return Math.max(1, Math.round(Number(st.magic_base) * statOf(hero, 'he') / ref));
  }
  function stepAmount(hero, st){
    if(Number(st.magic_base) > 0) return magicAmount(hero, st);
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

  // ── PRIMITIVAS AMPLIADAS (todas opcionales; una ficha que no las usa se ejecuta exactamente como antes).
  // Con ellas una habilidad se describe entera en la base de datos, sin código por héroe:
  //   daño:    scale_stat (cc|ad|he) + stat_mult, bonus (plano), dtype (melee|ranged|spell|true), element,
  //            pierce (0..1), ignore_shield, ignore_armor, hits (lista de ajustes: [0,-3] = dos golpes, el 2º -3),
  //            double_below (x2 si al rival le queda esa fracción de vida), hp_pct (fracción de SU vida actual),
  //            lifesteal (fracción del daño que cura), heal_to ('weakest_ally'), split_allies (reparte esa fracción)
  //   acciones: execute, destroy_equipment, reduce_max_hp, swap_stats, revive, heal_equalize, shield_regen, noop
  //   buff/debuff con mods {cc,ad,he,vel}: un único modificador con varios stats
  //   objetivos: other_enemy (otro rival distinto del elegido), dead_ally (aliado caído a elegir)
  function dmgFxFor(side, hero, t, dtype, el){
    try{
      if(dtype === 'melee') pushFx({k:'slash', toSide:tSide(t), toId:t.id});
      else if(dtype === 'ranged') pushFx({k:'arrow', fromSide:side, fromId:hero.id, toSide:tSide(t), toId:t.id, hits:1});
      else if(dtype === 'spell') pushFx({k:'spell', toSide:tSide(t), toId:t.id, el: el || 'arcano'});
    }catch(e){}
  }
  function extAmount(hero, st, t){
    var mult = Number(st.stat_mult), v;
    if(Number(st.magic_base) > 0){ v = magicAmount(hero, st); }
    else if(!isNaN(mult) && mult > 0){
      var sk2 = ['cc','ad','he'].indexOf(st.scale_stat) >= 0 ? st.scale_stat : primStat(hero);
      v = Math.round(statOf(hero, sk2) * mult);
    } else v = num(st.amount, 0);
    v += num(st.bonus, 0);
    if(Number(st.hp_pct) > 0 && t) v = Math.max(1, Math.round(t.hp * Number(st.hp_pct)));
    if(Number(st.double_below) > 0 && t && t.maxHp && (t.hp / t.maxHp) <= Number(st.double_below)) v *= 2;
    return Math.max(1, v);
  }
  var EXT_DAMAGE_KEYS = ['magic_base','dtype','scale_stat','bonus','ignore_shield','ignore_armor','hits','double_below','hp_pct','lifesteal','heal_to','split_allies'];
  function usesExt(st){
    for(var i = 0; i < EXT_DAMAGE_KEYS.length; i++) if(st[EXT_DAMAGE_KEYS[i]] !== undefined) return true;
    return typeof st.pierce === 'number' && st.pierce > 0 && st.pierce < 1;
  }
  function extDamage(side, hero, st, t){
    var dtype = ['melee','ranged','spell','true'].indexOf(st.dtype) >= 0 ? st.dtype : (st.element ? 'spell' : hitType(hero));
    var o = { type: dtype };
    if(st.element) o.element = st.element;
    if(st.pierce === true) o.pierce = 1; else if(typeof st.pierce === 'number' && st.pierce > 0) o.pierce = st.pierce;
    if(st.ignore_shield) o.ignoreShield = true;
    if(st.ignore_armor) o.ignoreArmor = true;
    var pen = Array.isArray(st.hits) && st.hits.length ? st.hits : [0];
    var total = 0;
    for(var i = 0; i < pen.length; i++){
      if(!t.alive) break;
      var amt = Math.max(1, extAmount(hero, st, t) + num(pen[i], 0));
      dmgFxFor(side, hero, t, dtype, st.element);
      var d = dealDamage(t, amt, o); total += d;
      log(hero.name + ' golpea a ' + t.name + ' (-' + d + ').');
    }
    var ratio = Number(st.lifesteal);
    if(ratio > 0 && total > 0){
      var recv = hero;
      if(st.heal_to === 'weakest_ally'){
        var al = team(side).filter(function(x){ return x && x.alive; }).sort(function(p, q){ return (p.hp / p.maxHp) - (q.hp / q.maxHp); });
        if(al.length) recv = al[0];
      }
      var g = heal(recv, Math.round(total * ratio));
      log(hero.name + ' absorbe vida de ' + t.name + ' y cura a ' + recv.name + ' (+' + g + ').');
    }
    var sp = Number(st.split_allies);
    if(sp > 0 && total > 0){
      var others = team(side).filter(function(x){ return x && x.alive && x !== hero; });
      var each = Math.max(1, Math.round(total * sp / Math.max(1, others.length)));
      others.forEach(function(x){ var gg = heal(x, each); if(gg) log(x.name + ' +' + gg + '.'); });
    }
    return true;
  }
  function applyStepExt(side, hero, st, t){
    var act = st.action;
    var mods = function(x){ return (x._mods = x._mods || []); };
    if((act === 'damage' || act === 'drain') && usesExt(st)) return extDamage(side, hero, st, t);
    if((act === 'buff' || act === 'debuff') && st.mods && typeof st.mods === 'object'){
      var mm = { turns: Math.max(1, num(st.turns, 99)) }, sign = act === 'debuff' ? -1 : 1;
      Object.keys(st.mods).forEach(function(k){ mm[k] = sign * Math.abs(num(st.mods[k], 0)); });
      mods(t).push(mm);
      try{ pushFx({k:'status', side:tSide(t), id:t.id, txt: act === 'debuff' ? '\\\\u25bc' : '\\\\u25b2'}); }catch(e){}
      log(t.name + ': ' + Object.keys(st.mods).map(function(k){ return (sign < 0 ? '-' : '+') + Math.abs(num(st.mods[k], 0)) + ' ' + k.toUpperCase(); }).join(', ') + '.');
      return true;
    }
    switch(act){
      case 'execute': {
        var thr = num(st.threshold, 8);
        if(t.hp <= thr){
          try{ pushFx({k:'slash', toSide:tSide(t), toId:t.id}); }catch(e){}
          t.hp = 1; dealDamage(t, 9999, { type:'true' });
          log(hero.name + ' EJECUTA a ' + t.name + '.');
        } else if(Number(st.else_mult) > 0){
          var sk3 = ['cc','ad','he'].indexOf(st.scale_stat) >= 0 ? st.scale_stat : primStat(hero);
          var de = dealDamage(t, Math.max(1, Math.round(statOf(hero, sk3) * Number(st.else_mult))), { type: hitType(hero) });
          log(hero.name + ' no ejecuta a ' + t.name + ' (-' + de + ').');
        } else log(t.name + ' no est\\\\u00e1 por debajo de ' + thr + ' HP.');
        return true;
      }
      case 'destroy_equipment': {
        t.mwep = null; t.rwep = null;
        var had = !!t.armor;
        if(t.armor){ t.maxHp = Math.max(1, t.maxHp - num(t.armor.hp, 0)); t.hp = Math.min(t.hp, t.maxHp); t.armor = null; }
        t.shield = 0;
        log(hero.name + ' DESTRUYE el equipo de ' + t.name + (had ? ' (armadura rota)' : '') + '.');
        return true;
      }
      case 'reduce_max_hp': { var rm = Math.abs(num(st.amount, 0)); t.maxHp = Math.max(1, t.maxHp - rm); t.hp = Math.min(t.hp, t.maxHp); log(t.name + ': -' + rm + ' de vida m\\\\u00e1xima.'); return true; }
      case 'swap_stats': {
        var s1 = statOf(t, 'cc'), s2 = statOf(t, 'he');
        mods(t).push({ cc: s2 - s1, he: s1 - s2, turns: 99 });
        log(t.name + ': intercambia su CC y su HE.');
        return true;
      }
      case 'revive': {
        if(t.alive || typeof reviveHero !== 'function') return false;
        reviveHero(t, num(st.hp_pct, 0.5));
        try{ pushFx({k:'elite', side:tSide(t), id:t.id}); }catch(e){}
        log(hero.name + ' revive a ' + t.name + '.');
        return true;
      }
      case 'heal_equalize': {
        var top = team(side).filter(function(x){ return x && x.alive; }).reduce(function(m, x){ return Math.max(m, x.hp); }, 0);
        var ge = heal(t, Math.max(0, top - t.hp));
        if(ge) log(t.name + ' +' + ge + '.');
        return true;
      }
      case 'shield_regen': { t._bfShieldRegen = Math.max(1, num(st.amount, 0)); return true; }   // lo procesa el gancho de fin de turno del motor (22 > 11 > 6 > 3 > 2 > 1 > 0)
      case 'block_hand': { var bh = Math.max(1, num(st.turns, 2)); t._bfHandBlock = Math.max(t._bfHandBlock || 0, bh); try{ pushFx({k:'status', side:tSide(t), id:t.id, txt:'\\ud83d\\udeab'}); }catch(e){} log(t.name + ' tiene la mano bloqueada ' + bh + ' turnos: no puede jugar hechizos ni objetos.'); return true; }
      case 'noop': { log(hero.name + ': ' + (st.text || 'no pasa nada en absoluto.')); return true; }
      default: return undefined;
    }
  }

  function applyStep(side, hero, st, t){
    var ext = applyStepExt(side, hero, st, t);
    if(ext !== undefined) return ext;
    var a = stepAmount(hero, st);
    var turns = Math.max(1, num(st.turns, st.action === 'buff' || st.action === 'debuff' ? 99 : 2));
    var sk = ['cc','ad','he','vel'].indexOf(st.stat) >= 0 ? st.stat : 'cc';
    var mods = function(x){ return (x._mods = x._mods || []); };
    var mark = function(x, txt){ try{ pushFx({k:'status', side:tSide(x), id:x.id, txt:txt}); }catch(e){} };
    switch(st.action){
      case 'damage': { var d = dealDamage(t, a, { type: st.element ? 'spell' : hitType(hero), pierce: st.pierce ? 1 : 0 }); if(st.element){ try{ pushFx({k:'spell', toSide:(typeof tSide==='function'?tSide(t):'o'), toId:t.id, el:st.element}); }catch(e){} } else if(hitType(hero)==='spell') arcaneFx(t); log(hero.name + ' golpea a ' + t.name + ' (-' + d + ').'); return true; }
      case 'true_damage': { var dt = dealDamage(t, a, { type:'true' }); if(primStat(hero)==='he') arcaneFx(t); log(hero.name + ' hiere a ' + t.name + ' ignorando su defensa (-' + dt + ').'); return true; }
      case 'drain': { var dd = dealDamage(t, a, { type: hitType(hero) }); if(hitType(hero)==='spell') arcaneFx(t); var g = heal(hero, dd); log(hero.name + ' drena a ' + t.name + ' (-' + dd + ') y absorbe esa vida (+' + g + ').'); return true; }
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
      case 'disarm': {
        // Quita TODAS las armas (cuerpo a cuerpo y a distancia) del héroe
        // objetivo y las manda a la pila de descartes de su dueño.
        var removedW = [];
        ['mwep','rwep'].forEach(function(slot){
          if(t[slot]){
            var arr = slot==='mwep' ? (typeof MELEE!=='undefined'?MELEE:[]) : (typeof RANGED!=='undefined'?RANGED:[]);
            var it = typeof byId==='function' ? byId(arr, t[slot].id) : null;
            removedW.push({ id: t[slot].id, kind: slot, name: it ? it.name : 'Arma', num: (it && it.num) || 0 });
            t[slot] = null;
          }
        });
        if(removedW.length && typeof G!=='undefined' && G.itemDescarte){
          var ds = typeof tSide==='function' ? tSide(t) : (side==='p'?'o':'p');
          if(!G.itemDescarte[ds]) G.itemDescarte[ds] = [];
          removedW.forEach(function(r){ G.itemDescarte[ds].push(r); });
          window.__bfDiscardJust = ds;
        }
        if(removedW.length){
          try{ pushFx({k:'status', side:(typeof tSide==='function'?tSide(t):'o'), id:t.id, txt:' disarmado'}); }catch(e){}
          log(t.name + ' pierde sus armas (' + removedW.map(function(r){return r.name;}).join(', ') + ').');
          return true;
        }
        log(t.name + ' no lleva armas.');
        return false;
      }
      case 'fx': {
        // La luz se dispara DESPUÉS de la cinemática 3D (5s) para que no la tapen.
        if(st.element === 'luz'){
          setTimeout(function(){
            try{
              if(typeof window.__bfFxLight === 'function') window.__bfFxLight();
              else if(typeof pushFx === 'function') pushFx({k:'spell', el:'luz'});
            }catch(e){}
          }, 5000);
        } else {
          try{ pushFx({k:'spell', toSide:(typeof tSide==='function'?tSide(t):'o'), toId:t.id, el:st.element||'arcano'}); }catch(e){}
        }
        return true;
      }
      default: return false;
    }
  }
  function log(msg){ try{ if(typeof pushLog === 'function') pushLog('lg', msg); }catch(e){} }

  // ¿Necesita que el jugador elija objetivo? Solo cuando algún paso apunta a un
  // único rival/aliado (los pasos de área o sobre uno mismo no preguntan).
  function needsPick(spec){
    var kinds = [];
    (((spec.params || {}).steps) || []).forEach(function(st){
      var tg = String((st || {}).target || 'enemy');
      if((tg === 'enemy' || tg === 'ally' || tg === 'dead_ally') && kinds.indexOf(tg) < 0) kinds.push(tg);
    });
    return kinds;
  }

  function runSteps(side, hero, spec, chosen){
    var steps = ((spec.params || {}).steps) || [];
    var did = false;
    steps.forEach(function(st){
      if(!st || !st.action) return;
      var tg = String(st.target || 'enemy');
      var list;
      if(tg === 'other_enemy'){ var ce = chosen && chosen.enemy; list = foes(side).filter(function(x){ return x !== ce; }).slice(0, 1); }
      else if(tg === 'dead_ally') list = (chosen && chosen.dead_ally) ? [chosen.dead_ally] : [];
      else list = (chosen && chosen[tg] && (tg === 'enemy' || tg === 'ally')) ? [chosen[tg]] : pickTargets(side, hero, tg);
      list.forEach(function(t){
        if(!t || (!t.alive && st.action !== 'revive')) return;
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

  // ── Héroe SIN ficha de habilidad y sin mecánica conocida (p. ej. uno recién creado en el editor).
  // Antes el motor intentaba su golpe genérico con un objetivo vacío, lanzaba un error y la acción NO
  // terminaba nunca (atasco de turno). Ahora hace un golpe genérico (1,3 x su stat principal, igual que el
  // valor por defecto del motor), el turno termina, y queda un aviso en diagnósticos con el card_id.
  // Mecánicas que el juego sabe resolver: las del motor y las de los parches dedicados. Un héroe con otra
  // (o sin ninguna) y sin ficha es un héroe NUEVO sin implementar.
  var KNOWN_KINDS = {};
  ['aoe-ad','aoe-cc','aoe-he','big-ad','big-he','crush-cc','debuff','debuff-all','double-ad','drain','evade','execute','heal-all','heal-ally','lifesteal-cc','mark','pierce-ad','pierce-cc','revive','self-buff','self-heal','shield-ally','silence','skip-turn','smash-equip','unblock-cc',
   'kamikaze-token','pegasus-token','epic-summon','crane-summon','duck-summon','reflect-damage','tk_dizzy','tk_confuse','tk_drunk','tk_none'].forEach(function(k){ KNOWN_KINDS[k] = 1; });
  function isKnownKind(h){ return !!(h && h.akind && KNOWN_KINDS[h.akind]); }
  var reportedGeneric = {};
  function genericAbility(side, hero, done, err){
    var complete = typeof done === 'function' ? done : function(){ if(typeof finishAct === 'function') finishAct(); };
    var name = hero.eliteMode ? (hero.eAbility || hero.ability) : hero.ability;
    var key = String(cardIdOf(hero)) + (hero.eliteMode ? '|e' : '|n');
    if(!reportedGeneric[key]){
      reportedGeneric[key] = 1;
      try{ window.parent.postMessage({ bfRelayError: { room_code:'', side:'', nick:'', error_type:'ability_unimplemented', action:'useAbility', error_message:'sin ficha ni mecánica: ' + key + ' (' + String(err && err.message || '') + ')' } }, '*'); }catch(e){}
    }
    if(typeof pushLog === 'function') pushLog('lx', hero.name + ': la habilidad «' + (name || '?') + '» aún no está implementada en la base de datos; hace un golpe genérico.');
    var finish = function(){
      hero.abilityUsed = true; if(hero.eliteMode) hero.eliteUsed = true;
      if(typeof renderBattle === 'function') renderBattle();
      if(typeof netSync === 'function') netSync('s-battle');
      setTimeout(complete, 420);
    };
    var hit = function(t){
      if(t && typeof dealDamage === 'function') dealDamage(t, Math.max(1, Math.round(statOf(hero, primStat(hero)) * 1.3)), { type: hitType(hero) });
      finish();
    };
    if(typeof window.bfChooseAbilityTarget === 'function') window.bfChooseAbilityTarget(side, 'Objetivo de ' + (name || 'habilidad'), side === 'p' ? 'o' : 'p', hit);
    else hit(foes(side)[0] || null);
  }
  window.__bfGenericAbility = genericAbility;

  // ── Activas: se resuelven al usar la habilidad
  // Ejecuta una lista de pasos como si fuera una habilidad: pide los objetivos que haga falta (rival, aliado, aliado
  // caído), aplica los pasos y llama a onDone; si ningún paso hizo nada llama a onNone. La usan las fichas de
  // habilidad y también los hechizos y objetos de tipo "bf_steps" (spellStepsPatch), así un efecto nuevo se
  // describe solo con datos.
  function executeSteps(side, hero, steps, label, onDone, onNone){
    var spec = { params: { steps: steps || [] } }, picks = needsPick(spec), chosen = {};
    var chooseNext = function(index){
      if(index >= picks.length){
        if(!runSteps(side, hero, spec, chosen)){ if(onNone) onNone(); return; }
        if(onDone) onDone(); return;
      }
      var kind = picks[index], pool = kind === 'ally' ? side : (side === 'p' ? 'o' : 'p');
      if(kind === 'dead_ally'){
        var deadList = team(side).filter(function(x){ return x && !x.alive; });
        if(!deadList.length){ chosen[kind] = null; chooseNext(index + 1); return; }
        if(typeof humanCtl === 'function' && humanCtl(side) && typeof pendTarget === 'function'){
          pendTarget('Aliado CA\\u00cdDO a revivir', side, function(t){ chosen[kind] = t; chooseNext(index + 1); }, { allowDead: true });
        } else { chosen[kind] = deadList[0]; chooseNext(index + 1); }
        return;
      }
      window.bfChooseAbilityTarget(side, 'Objetivo ' + (kind === 'ally' ? 'aliado' : 'rival') + ' de ' + (label || 'la carta'), pool, function(t){
        chosen[kind] = t;
        chooseNext(index + 1);
      });
    };
    chooseNext(0);
  }
  window.__bfExecuteSteps = executeSteps;

  function hookAbility(){
    if(window.__bfAiAbilHooked || typeof window.useAbility !== 'function' || typeof G === 'undefined') return false;
    window.__bfAiAbilHooked = true;
    var orig = window.useAbility;
    window.useAbility = function(side, hero, done){
      var spec = specFor(hero);
      var kind = spec && spec.effect_type;
      var p = (spec && spec.params) || {};
      if(!spec){
        if(isKnownKind(hero)) return orig.apply(this, arguments);
        // Héroe sin ficha y sin mecánica conocida: se intenta lo que haga el motor, pero si falla (error)
        // o no avanza (la acción no termina ni pide objetivo), el golpe genérico cierra la acción.
        var finished = false, self0 = this;
        var wrapped = function(){ finished = true; return (typeof done === 'function' ? done : function(){ if(typeof finishAct === 'function') finishAct(); }).apply(this, arguments); };
        try{ orig.call(self0, side, hero, wrapped); }
        catch(err){ return genericAbility(side, hero, done, err); }
        setTimeout(function(){
          if(finished || hero.abilityUsed) return;
          if(typeof B !== 'undefined' && B && (B.pending || B.over)) return;
          genericAbility(side, hero, done, new Error('sin progreso'));
        }, 1500);
        return;
      }

      // Pasivas: se activan y el turno sigue su curso normal.
      if(kind === 'attack_bonus_per_ally') return orig.apply(this, arguments);
      if(kind === 'heal_allies_per_turn'){ hero._bfImplActive = true; return orig.apply(this, arguments); }

      var complete = typeof done === 'function' ? done : function(){ if(typeof finishAct === 'function') finishAct(); };
      var acted = false;
      function finishAbility(){
        hero.abilityUsed = true;
        if(hero.eliteMode) hero.eliteUsed = true;
        if(typeof window.__bfPlayAbilityAnim === 'function') window.__bfPlayAbilityAnim(side, hero);
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
        setTimeout(complete, 420);
      }

      if(kind === 'heal_allies_now'){
        var amount = num(p.amount, 0);
        team(side).forEach(function(a){ if(a && a.alive && typeof heal === 'function') heal(a, amount); });
        if(typeof pushLog === 'function') pushLog('lg', hero.name + ' \\u2014 ' + (spec.ability_name || '') + ': +' + amount + ' de vida a todo el equipo.');
        acted = true;
      } else if(kind === 'damage_enemy'){
        var dmg = scaledAmount(hero, p);
        var hitSelected = function(list){
          list.forEach(function(t){ if(t.alive && typeof dealDamage === 'function') dealDamage(t, dmg, {type:'true'}); });
          if(primStat(hero) === 'he') list.forEach(arcaneFx);
          if(typeof pushLog === 'function') pushLog('lg', hero.name + ' — ' + (spec.ability_name || hero.ability) + ': ' + dmg + ' de daño a ' + list.map(function(t){return t.name;}).join(', ') + '.');
          finishAbility();
        };
        if(p.all) hitSelected(foes(side));
        else window.bfChooseAbilityTargets(side, side === 'p' ? 'o' : 'p', Math.max(1, Math.floor(num(p.targets, 1))), 'Objetivo de ' + (spec.ability_name || hero.ability), hitSelected);
        return;
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
        executeSteps(side, hero, (spec.params || {}).steps || [], spec.ability_name || hero.ability, finishAbility, function(){ orig.apply(self, args); });
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
      finishAbility();
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