// Habilidades fieles al texto de la carta.
//
// El motor del juego resuelve las habilidades con mecánicas genéricas
// ("debuff", "self-buff", "big-he"…) cuyos valores no siempre coinciden con lo
// que promete el texto de la carta. Este parche sustituye la resolución de los
// héroes afectados por una implementación exacta y añade los efectos que el
// motor no tenía (robo de vida en CC, intercambio de stats, parálisis en área,
// escudo regenerativo, igualar la vida del grupo, conjuro aleatorio…).
//
// Cada entrada de IMPL recibe el contexto del motor y resuelve la habilidad
// completa. Los héroes que no están en la tabla siguen usando el motor original.
export const FAITHFUL_ABILITIES_PATCH = `
<script>
(function(){
  if(window.__bfFaithfulAbilities) return;
  window.__bfFaithfulAbilities = true;

  function hid(h){ return String((h && (h.cardId || h.card_id || h.id)) || '').replace(/_\\d{6,}$/, ''); }
  function L(side){ return (typeof living === 'function' ? living(side) : []); }
  function mods(x){ return (x._mods = x._mods || []); }
  function fx(o){ if(typeof pushFx === 'function') pushFx(o); }
  function log(c,m){ if(typeof pushLog === 'function') pushLog(c,m); }
  function side_(x){ return typeof tSide === 'function' ? tSide(x) : 'o'; }

  // ---- efectos añadidos que el motor no tenía ----------------------------
  // Robo de vida en cuerpo a cuerpo (Hildra élite): al causar daño melee, el
  // héroe con el flag se cura la mitad.
  function hookLifesteal(){
    if(window.__bfLsHook || typeof window.dealDamage !== 'function') return;
    window.__bfLsHook = true;
    var orig = window.dealDamage;
    window.dealDamage = function(target, amount, opts){
      var d = orig.apply(this, arguments);
      try{
        if(d > 0 && opts && opts.type === 'melee' && typeof B !== 'undefined' && B.current){
          var a = getHero(B.current.side, B.current.id);
          if(a && a._bfLifestealCC && a !== target && typeof heal === 'function'){
            var g = heal(a, Math.round(d * 0.5));
            if(g) log('lh', a.name + ' roba ' + g + ' de vida.');
          }
        }
      }catch(e){}
      return d;
    };
  }

  // Escudo regenerativo (Batu élite): se rellena al final de cada turno, pero
  // cada vez con la MITAD del valor anterior (22 → 11 → 6 → 3 → 2 → 1 → 0), para
  // que no sea un muro eterno.
  function hookShieldRegen(){
    if(window.__bfSrHook || typeof window.endTurn !== 'function') return;
    window.__bfSrHook = true;
    var orig = window.endTurn;
    window.endTurn = function(){
      try{
        ['p','o'].forEach(function(s){
          L(s).forEach(function(x){
            if(!x._bfShieldRegen) return;
            var next = x._bfShieldRegen <= 1 ? 0 : Math.ceil(x._bfShieldRegen / 2);
            x._bfShieldRegen = next;
            if(!next){ delete x._bfShieldRegen; log('li', x.name + ': su escudo ancestral se agota.'); return; }
            if(x.shield < next){
              x.shield = next;
              fx({ k:'shieldup', toSide: side_(x), toId: x.id });
              log('lg', x.name + ' regenera su escudo ancestral a ' + next + '.');
            }
          });
        });
      }catch(e){}
      return orig.apply(this, arguments);
    };
  }

  // Maestría (Edredon): sin penalización por atacar fuera de su tipo. El motor
  // usa el stat correspondiente al tipo de ataque, así que mientras el flag esté
  // activo sus tres stats de combate valen lo mismo que su stat principal.
  function hookNoTypePen(){
    if(window.__bfNtpHook || typeof window.stat !== 'function') return;
    window.__bfNtpHook = true;
    var orig = window.stat;
    window.stat = function(h, k){
      if(h && h._bfNoTypePen && (k === 'cc' || k === 'ad' || k === 'he')){
        return Math.max(orig(h,'cc'), orig(h,'ad'), orig(h,'he'));
      }
      return orig.apply(this, arguments);
    };
  }

  // Vacío Mental (Coffetath élite): bloquea la mano del rival — su equipo no
  // puede lanzar hechizos ni usar objetos durante su siguiente turno.
  function hookHandBlock(){
    window.__bfHandBlock = window.__bfHandBlock || { p:0, o:0 };
    ['castSpell','useItem','castSpell_AI','useItem_AI'].forEach(function(fn){
      if(typeof window[fn] !== 'function' || window[fn].__bfHb) return;
      var orig = window[fn];
      var wrapped = function(){
        try{
          var s = (typeof B !== 'undefined' && B.current) ? B.current.side : null;
          if(s && window.__bfHandBlock[s] > 0){
            log('li', '\\ud83d\\udeab Mano bloqueada: este equipo no puede usar hechizos ni objetos.');
            return;
          }
        }catch(e){}
        return orig.apply(this, arguments);
      };
      wrapped.__bfHb = true;
      window[fn] = wrapped;
    });
    if(typeof window.nextRound === 'function' && !window.nextRound.__bfHb){
      var on = window.nextRound;
      var wr = function(){
        try{ ['p','o'].forEach(function(s){ if(window.__bfHandBlock[s] > 0) window.__bfHandBlock[s]--; }); }catch(e){}
        return on.apply(this, arguments);
      };
      wr.__bfHb = true;
      window.nextRound = wr;
    }
  }

  // ---- implementaciones fieles ------------------------------------------
  var IMPL = {
    // Boss — texto: -3 (1 turno) / -5 (2 turnos) a todos los rivales
    bos: function(c){
      var a = c.el ? 5 : 3, tn = c.el ? 2 : 1;
      L(c.foes).forEach(function(x){ mods(x).push({cc:-a, ad:-a, he:-a, turns:tn}); fx({k:'status', side:side_(x), id:x.id, txt:'\\u25bc'}); });
      log('li', c.h.name + ' \\u2192 -' + a + ' a todos los rivales (' + tn + ' turno' + (tn>1?'s':'') + ').');
    },
    // Narbon élite — además paraliza 2 turnos a los 3 héroes rivales
    nar: function(c){
      var t = c.t; t.mwep = null; t.rwep = null;
      var had = !!t.armor;
      if(t.armor){ t.maxHp = Math.max(1, t.maxHp - t.armor.hp); t.hp = Math.min(t.hp, t.maxHp); t.armor = null; }
      t.shield = 0;
      fx({k:'slash', toSide:side_(t), toId:t.id});
      var d = dealDamage(t, stat(c.h,'cc'), {type:'melee'});
      log('lx', c.h.name + ' DESTRUYE el equipo de ' + t.name + (had ? ' (armadura rota)' : '') + ' (-' + d + ').');
      if(c.el){
        L(c.foes).forEach(function(x){ x.para = Math.max(x.para || 0, 2); fx({k:'status', side:side_(x), id:x.id, txt:'\\u26a1'}); });
        log('li', c.h.name + ' paraliza 2 turnos a todo el equipo rival.');
      }
    },
    // Hildra — +6 CC / +4 vel (élite: +9 CC, +6 vel y robo de vida en CC)
    hil: function(c){
      var cc = c.el ? 9 : 6, vel = c.el ? 6 : 4;
      mods(c.h).push({cc:cc, vel:vel, turns:99});
      if(c.el) c.h._bfLifestealCC = 1;
      fx({k:'status', side:c.side, id:c.h.id, txt:'\\u25b2'});
      log('lg', c.h.name + ' entra en furia (+' + cc + ' CC, +' + vel + ' velocidad' + (c.el ? ' y robo de vida' : '') + ').');
    },
    // Renhubero — solo debuff, sin daño extra
    renhu: function(c){
      var a = c.el ? 8 : 6;
      mods(c.t).push({cc:-a, ad:-a, he:-a, turns: c.el ? 99 : 2});
      fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\u25bc'});
      log('li', c.h.name + ' enreda a ' + c.t.name + ' (-' + a + (c.el ? ' permanente' : ' durante 2 turnos') + ').');
    },
    // Boskimano — cura 12 (élite: 18 y +2 stats a los aliados)
    boski: function(c){
      var g = heal(c.h, c.el ? 18 : 12);
      log('lh', c.h.name + ' se cura (+' + g + ').');
      if(c.el){
        L(c.allies).forEach(function(x){ if(x !== c.h){ mods(x).push({cc:2, ad:2, he:2, turns:99}); fx({k:'status', side:side_(x), id:x.id, txt:'\\u25b2'}); } });
        log('lg', c.h.name + ' otorga +2 a sus aliados.');
      }
    },
    // Morthex élite — roba toda la vida infligida y +3 CC
    mor: function(c){
      if(!c.el) return false;
      fx({k:'slash', toSide:side_(c.t), toId:c.t.id});
      var d = dealDamage(c.t, stat(c.h,'cc'), {type:'melee'});
      var g = heal(c.h, d);
      mods(c.h).push({cc:3, turns:99});
      log('ld', c.h.name + ' drena a ' + c.t.name + ' (-' + d + ', +' + g + ') y gana +3 CC.');
    },
    // Hannai Boa élite — esquiva 2 ataques y +5 solo al siguiente golpe
    hannai: function(c){
      c.h.evade = c.el ? 2 : 1;
      if(c.el) mods(c.h).push({cc:5, ad:5, turns:1});
      fx({k:'status', side:c.side, id:c.h.id, txt:'\\ud83d\\udca8'});
      log('li', c.h.name + ' se vuelve evasiva' + (c.el ? ' (2 ataques) y su siguiente golpe hace +5.' : '.'));
    },
    // El Pijo — -4 a un rival (élite: -6 a TODOS y +3 CC propio)
    pij: function(c){
      if(c.el){
        L(c.foes).forEach(function(x){ mods(x).push({cc:-6, ad:-6, he:-6, turns:2}); fx({k:'status', side:side_(x), id:x.id, txt:'\\u25bc'}); });
        mods(c.h).push({cc:3, turns:99});
        log('li', c.h.name + ' humilla a todos los rivales (-6) y gana +3 CC.');
      } else {
        mods(c.t).push({cc:-4, ad:-4, he:-4, turns:2});
        fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\u25bc'});
        log('li', c.h.name + ' humilla a ' + c.t.name + ' (-4 durante 2 turnos).');
      }
    },
    // Patrón — ignora MEDIA defensa (élite: toda y atraviesa a un segundo rival)
    pat: function(c){
      fx({k:'arrow', fromSide:c.side, fromId:c.h.id, toSide:side_(c.t), toId:c.t.id, hits:1});
      var d = dealDamage(c.t, Math.round(stat(c.h,'ad')*1.2) + (c.el ? 5 : 0), {type:'ranged', pierce: c.el ? 1 : 0.5});
      log('ld', c.h.name + ' dispara a ' + c.t.name + ' (-' + d + ').');
      if(c.el){
        var o2 = L(c.foes).filter(function(x){ return x !== c.t; })[0];
        if(o2){ var d2 = dealDamage(o2, Math.round(stat(c.h,'ad')*0.7), {type:'ranged', pierce:1}); log('ld', '\\u2026la flecha atraviesa hasta ' + o2.name + ' (-' + d2 + ').'); }
      }
    },
    // Elderbar — marca +5 (élite +8 persistente), sin daño directo
    elder: function(c){
      c.t.mark = { dmg: c.el ? 8 : 5, turns: c.el ? 99 : 3 };
      fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\ud83c\\udfaf'});
      log('li', c.h.name + ' marca a ' + c.t.name + ': recibir\\u00e1 +' + (c.el ? 8 : 5) + ' de da\\u00f1o.');
    },
    // Zarmanda — disparo imbloqueable (élite: dos disparos y +6 AD el combate)
    zar: function(c){
      var shots = c.el ? 2 : 1;
      for(var i = 0; i < shots; i++){
        if(!c.t.alive) break;
        fx({k:'arrow', fromSide:c.side, fromId:c.h.id, toSide:side_(c.t), toId:c.t.id, hits:1});
        var d = dealDamage(c.t, Math.round(stat(c.h,'ad') * (c.el ? 0.9 : 1.2)) + (c.el ? 3 : 0), {type:'ranged', ignoreShield:true});
        log('ld', c.h.name + ' dispara sin ser bloqueada a ' + c.t.name + ' (-' + d + ').');
      }
      if(c.el){ mods(c.h).push({ad:6, turns:99}); log('lg', c.h.name + ' brilla con aura dorada (+6 AD este combate).'); }
    },
    // Alfredinho — segundo disparo a -3 de potencia
    alf: function(c){
      if(c.el) return false;
      for(var i = 0; i < 2; i++){
        if(!c.t.alive) break;
        fx({k:'arrow', fromSide:c.side, fromId:c.h.id, toSide:side_(c.t), toId:c.t.id, hits:1});
        var v = Math.round(stat(c.h,'ad') * 0.9) - (i === 1 ? 3 : 0);
        var d = dealDamage(c.t, v, {type:'ranged'});
        log('ld', c.h.name + ' dispara a ' + c.t.name + ' (-' + d + ')' + (i === 1 ? ' (segundo disparo -3)' : '') + '.');
      }
    },
    // Dixie Plasma élite — ignora equipo y pega al 50% de la vida del rival
    dix: function(c){
      if(!c.el) return false;
      fx({k:'arrow', fromSide:c.side, fromId:c.h.id, toSide:side_(c.t), toId:c.t.id, hits:1});
      var half = Math.max(1, Math.round(c.t.hp * 0.5));
      var d = dealDamage(c.t, half, {type:'ranged', pierce:1, ignoreShield:true, ignoreArmor:true});
      log('ld', c.h.name + ' fulmina a ' + c.t.name + ' al 50% de su vida (-' + d + ').');
    },
    // Sylvex — +4 a todos sus stats (élite: +6 y cura 10)
    syx: function(c){
      var a = c.el ? 6 : 4;
      mods(c.h).push({cc:a, ad:a, he:a, vel:a, turns:99});
      fx({k:'status', side:c.side, id:c.h.id, txt:'\\u25b2'});
      var extra = '';
      if(c.el){ var g = heal(c.h, 10); extra = ' y se cura +' + g; }
      log('lg', c.h.name + ' muta: +' + a + ' a todos sus stats' + extra + '.');
    },
    // Serafis — golpe mágico que intercambia CC y HE del rival (élite: dos rivales)
    ser: function(c){
      var targets = [c.t];
      if(c.el){ var o2 = L(c.foes).filter(function(x){ return x !== c.t; })[0]; if(o2) targets.push(o2); }
      targets.forEach(function(x){
        fx({k:'spell', toSide:side_(x), toId:x.id, el:'fuego'});
        var d = dealDamage(x, Math.round(stat(c.h,'he') * 1.5) + (c.el ? 6 : 0), {type:'spell', element:'fuego'});
        var cc = stat(x,'cc'), he = stat(x,'he');
        mods(x).push({cc: he - cc, he: cc - he, turns:99});
        fx({k:'status', side:side_(x), id:x.id, txt:'\\ud83d\\udd04'});
        log('li', c.h.name + ' golpea a ' + x.name + ' (-' + d + ') e intercambia su CC y su HE.');
      });
    },
    // Batu élite — escudo de 22 que se regenera cada turno
    bat: function(c){
      var v = c.el ? 22 : 14;
      c.t.shield += v;
      fx({k:'shieldup', toSide:side_(c.t), toId:c.t.id});
      if(c.el){ c.t._bfShieldRegen = v; log('lg', c.h.name + ' da a ' + c.t.name + ' un escudo regenerativo de ' + v + ' (cada turno se regenera a la mitad).'); }
      else log('lg', c.h.name + ' escuda ' + v + ' a ' + c.t.name + '.');
    },
    // Nixara élite — roba más HP y lo reparte entre los aliados
    nix: function(c){
      if(!c.el) return false;
      fx({k:'spell', toSide:side_(c.t), toId:c.t.id, el:'agua'});
      var d = dealDamage(c.t, Math.round(stat(c.h,'he') * 1.1) + 4, {type:'spell', element:'agua'});
      var al = L(c.allies);
      var each = Math.max(1, Math.round(d / Math.max(1, al.length)));
      al.forEach(function(x){ var g = heal(x, each); if(g) log('lh', x.name + ' +' + g + '.'); });
      log('ld', c.h.name + ' drena a ' + c.t.name + ' (-' + d + ') y reparte la vida entre sus aliados.');
    },
    // Mantenimiento — iguala la vida del grupo (élite: cura a todos al máximo)
    man: function(c){
      var al = L(c.allies);
      if(c.el){
        al.forEach(function(x){ var g = heal(x, x.maxHp); if(g) log('lh', x.name + ' +' + g + '.'); });
        log('lh', c.h.name + ' repara al grupo entero: todos a vida completa.');
      } else {
        var top = al.reduce(function(m,x){ return Math.max(m, x.hp); }, 0);
        al.forEach(function(x){ var g = heal(x, Math.max(0, top - x.hp)); if(g) log('lh', x.name + ' +' + g + '.'); });
        log('lh', c.h.name + ' iguala la vida del grupo a ' + top + ' HP.');
      }
    },
    // Pacopiton — golpe mágico que además maldice (-stats)
    pac: function(c){
      fx({k:'spell', toSide:side_(c.t), toId:c.t.id, el:'fuego'});
      var d = dealDamage(c.t, Math.round(stat(c.h,'he') * 1.5) + (c.el ? 6 : 0), {type:'spell', element:'fuego'});
      var a = c.el ? 6 : 4;
      mods(c.t).push({cc:-a, ad:-a, he:-a, turns: c.el ? 99 : 2});
      fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\u25bc'});
      log('li', c.h.name + ' maldice a ' + c.t.name + ' (-' + d + ', -' + a + (c.el ? ' permanente' : '') + ').');
    },
    // Reverendo Sapis — golpe mágico y -3 a los stats del objetivo
    rev: function(c){
      if(c.el) return false;
      var d = dealDamage(c.t, Math.round(stat(c.h, primKey(c.h.type)) * 0.6), {type: c.h.type === 'HE' ? 'spell' : c.h.type === 'AD' ? 'ranged' : 'melee', element:'agua'});
      mods(c.t).push({cc:-3, ad:-3, he:-3, turns:2});
      fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\u25bc'});
      log('li', c.h.name + ' maldice a ' + c.t.name + ' (-' + d + ', -3).');
    },
    // Edredon — sin penalización por atacar fuera de su tipo (élite: +3 stats)
    edre: function(c){
      c.h._bfNoTypePen = 1;
      if(c.el) mods(c.h).push({cc:3, ad:3, he:3, vel:3, turns:99});
      fx({k:'status', side:c.side, id:c.h.id, txt:'\\u2694\\ufe0f'});
      log('lg', c.h.name + ' domina todas las armas: sin penalizaci\\u00f3n por atacar fuera de su tipo' + (c.el ? ' y +3 a todos sus stats' : '') + '.');
    },
    // Coffetath élite — golpe mágico que bloquea la mano rival un turno
    caoffe: function(c){
      if(!c.el) return false;
      fx({k:'spell', toSide:side_(c.t), toId:c.t.id, el:'rayo'});
      var d = dealDamage(c.t, Math.round(stat(c.h,'he') * 1.5) + 6, {type:'spell', element:'rayo'});
      window.__bfHandBlock = window.__bfHandBlock || { p:0, o:0 };
      window.__bfHandBlock[c.foes] = 2;
      L(c.foes).forEach(function(x){ fx({k:'status', side:side_(x), id:x.id, txt:'\\ud83d\\udeab'}); });
      log('li', c.h.name + ' golpea a ' + c.t.name + ' (-' + d + ') y BLOQUEA la mano rival: sin hechizos ni objetos en su siguiente turno.');
    },
    // El Rolero — conjuro aleatorio (élite: crítico garantizado)
    rol: function(c){
      var roll = c.el ? 20 : (1 + Math.floor(Math.random() * 20));
      var mult = 0.9 + (roll / 20) * 1.1;
      fx({k:'spell', toSide:side_(c.t), toId:c.t.id, el:'rayo'});
      var d = dealDamage(c.t, Math.round(stat(c.h,'he') * mult) + (c.el ? 6 : 0), {type:'spell', element:'rayo', pierce: c.el ? 1 : 0});
      log('ld', c.h.name + ' tira el dado (' + roll + '/20) y su conjuro golpea a ' + c.t.name + ' (-' + d + ')' + (c.el ? ' \\u00a1CR\\u00cdTICO!' : '') + '.');
    }
  };

  var NEEDS_ENEMY = { edre:0, caoffe:1, bos:0, nar:1, hil:0, renhu:1, boski:0, mor:1, hannai:0, pij:1, pat:1, elder:1, zar:1, alf:1, dix:1, syx:0, ser:1, bat:0, nix:1, man:0, pac:1, rev:1, rol:1 };
  var NEEDS_ALLY = { bat:1 };

  function hook(){
    if(window.__bfFaHooked || typeof window.useAbility !== 'function') return false;
    window.__bfFaHooked = true;
    hookLifesteal();
    hookShieldRegen();
    hookNoTypePen();
    hookHandBlock();
    var orig = window.useAbility;
    window.useAbility = function(side, h, done){
      var id = hid(h), impl = IMPL[id];
      if(!impl) return orig.apply(this, arguments);
      var self = this, args = arguments;
      var foes = enemySide(side), allies = side;
      var ctx = { side:side, h:h, el:!!h.eliteMode, foes:foes, allies:allies, t:null };
      var run = function(t){
        ctx.t = t;
        var res;
        try { res = impl(ctx); } catch(e){ res = false; }
        if(res === false){ orig.apply(self, args); return; }
        h.abilityUsed = true;
        if(typeof window.__bfPlayAbilityAnim === 'function') window.__bfPlayAbilityAnim(side, h);
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
        if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct();
      };
      var need = NEEDS_ENEMY[id] ? foes : NEEDS_ALLY[id] ? allies : null;
      if(!need){ run(null); return; }
      if(typeof humanCtl === 'function' && humanCtl(side)){
        pendTarget('Objetivo de ' + (h.eliteMode ? h.eAbility : h.ability), need, run);
      } else {
        var t = need === foes
          ? L(foes).sort(function(a,b){ return a.hp - b.hp; })[0]
          : L(allies).sort(function(a,b){ return a.hp/a.maxHp - b.hp/b.maxHp; })[0];
        run(t);
      }
    };
    return true;
  }

  var tries = 0, iv = setInterval(function(){ if(hook() || tries++ > 160) clearInterval(iv); }, 150);
})();
</script>
`;