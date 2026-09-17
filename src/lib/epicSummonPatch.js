// Chuchinjo Tokatus (Épicas) — habilidades de INVOCACIÓN de caballería:
//
//   Normal (akind 'epic-summon', no élite): pierde 15 de vida e invoca un
//   Unicornio Kamikaze (arte aleatorio entre las dos ilustraciones). El
//   unicornio puede inmolarse: 20 de daño a un rival, atravesando armaduras, y
//   se sacrifica.
//
//   Élite: pierde 20 de vida e invoca un Pegaso. El Pegaso pasa a ser el más
//   rápido de todos los héroes y lanza un rayo que atraviesa armaduras a TODOS
//   los rivales (5 de daño; 10 en su versión élite, curándose además 5).
//
// La vida que pierde el invocador se aplica con dealDamage, así que se muestra
// con el mismo marcador de daño que cualquier otro golpe.
export const EPIC_SUMMON_PATCH = `
<script>
(function(){
  if(window.__bfEpicSummon) return;
  window.__bfEpicSummon = true;

  function tokenTpl(id){
    var fromH = (typeof HEROES !== 'undefined' ? HEROES : []).find(function(h){ return h && h.id === id; });
    if(fromH) return fromH;
    return (typeof TOKENS !== 'undefined' ? TOKENS : []).find(function(t){ return t && t.id === id; }) || null;
  }
  function alive(side){ return ((typeof G !== 'undefined' && G.team && G.team[side]) || []).filter(function(x){ return x && x.alive; }); }
  function sideOf(x){ return (typeof tSide === 'function') ? tSide(x) : 'p'; }
  function log(k, t){ try{ if(typeof pushLog === 'function') pushLog(k, t); }catch(e){} }
  function fx(o){ try{ if(typeof pushFx === 'function') pushFx(o); }catch(e){} }
  function sync(){
    try{ if(typeof renderBattle === 'function') renderBattle(); }catch(e){}
    try{ if(typeof netSync === 'function') netSync('s-battle'); }catch(e){}
  }

  function summon(side, hero){
    var el = !!hero.eliteMode;
    var id = el ? 'tk_pegaso' : 'tk_unicornio';
    var tpl = tokenTpl(id);
    if(!tpl) return false;
    var cost = el ? 20 : 15;
    // Coste en vida del invocador: se muestra como cualquier otro daño.
    if(typeof dealDamage === 'function') dealDamage(hero, cost, { type:'true', ignoreShield:true, ignoreArmor:true });
    var inst = (typeof makeInstance === 'function') ? makeInstance(tpl) : Object.assign({}, tpl);
    inst.id = id + '_' + Date.now();
    inst._token = id;
    inst.akind = el ? 'pegasus-token' : 'kamikaze-token';
    // Pegaso: entra en su versión NORMAL (como cualquier carta). Al morir
    // evoluciona a élite (el motor lo revive en modo élite) y entonces puede
    // jugar su habilidad élite.
    // Unicornio: sin versión élite real — se elige al azar una de sus dos
    // ilustraciones (los stats y la habilidad son idénticos).
    // Pegaso: entra en su versión NORMAL (como cualquier carta). Al morir
    // evoluciona a élite (el motor lo revive en modo élite) y entonces puede
    // jugar su habilidad élite.
    // Unicornio (Kamikaze): NO tiene versión élite. Se le pone eliteUsed=true
    // para que el motor NO lo reviva en modo élite al morir. El arte de
    // batalla se elige al azar entre las dos ilustraciones (normal y élite),
    // pero los stats y la habilidad son siempre los de la versión normal.
    if(el){
      inst.eliteMode = false;
      inst.eliteUsed = false;
    } else {
      inst.eliteMode = false;
      inst.eliteUsed = true; // sin renacer élite
      // Arte aleatorio entre las dos versiones
      var normArt = (typeof ART_BY_ID !== 'undefined') ? ART_BY_ID[id] : '';
      var eliteArt = (typeof ELITE_BY_ID !== 'undefined') ? ELITE_BY_ID[id] : '';
      inst._bfArtUrl = Math.random() < 0.5 ? (normArt || eliteArt) : (eliteArt || normArt);
    }
    inst.abilityUsed = false;
    inst._mods = []; inst.shield = 0; inst.wardTurns = 0; inst.evade = 0; inst.defending = false;
    inst.maxHp = Number(tpl.hp) || 15;
    inst.hp = inst.maxHp; inst.alive = true;
    (G.team[side] || (G.team[side] = [])).push(inst);
    hero.abilityUsed = true;
    log('lg', hero.name + ' pierde ' + cost + ' de vida e invoca a ' + inst.name + '.');
    fx({ k:'status', side:side, id:hero.id, txt: el ? '\\u{1F40E}' : '\\u{1F984}' });
    if(typeof window.__bfPlayAbilityAnim === 'function'){ try{ window.__bfPlayAbilityAnim(side, hero); }catch(e){} }
    sync();
    return true;
  }

  function kamikaze(side, h, finish){
    var foes = (typeof enemySide === 'function') ? enemySide(side) : (side === 'p' ? 'o' : 'p');
    function blow(t){
      if(typeof window.__bfPlayAbilityAnim === 'function'){ try{ window.__bfPlayAbilityAnim(side, h, true); }catch(e){} }
      if(t && typeof dealDamage === 'function'){
        fx({ k:'spell', toSide:sideOf(t), toId:t.id, el:'fuego' });
        var d = dealDamage(t, 20, { type:'true', pierce:1, ignoreArmor:true });
        log('ld', h.name + ' se INMOLA sobre ' + t.name + ' (-' + d + ').');
      }
      // Se sacrifica.
      if(typeof dealDamage === 'function') dealDamage(h, (h.hp || 0) + (h.shield || 0) + 1, { type:'true', ignoreShield:true, ignoreArmor:true });
      h.abilityUsed = true;
      sync();
      finish();
    }
    if(window.bfAbilityHuman(side) && typeof pendTarget === 'function'){
      pendTarget('Objetivo de Kamikaze', foes, blow);
    } else {
      blow(alive(foes).sort(function(a,b){ return a.hp - b.hp; })[0]);
    }
  }

  function pegasus(side, h, finish){
    var el = !!h.eliteMode, dmg = el ? 10 : 5;
    var foes = (typeof enemySide === 'function') ? enemySide(side) : (side === 'p' ? 'o' : 'p');
    if(typeof window.__bfPlayAbilityAnim === 'function'){ try{ window.__bfPlayAbilityAnim(side, h, true); }catch(e){} }
    // Pasa a ser el más rápido de todos los héroes.
    (h._mods = h._mods || []).push({ vel:99, turns:99 });
    fx({ k:'status', side:side, id:h.id, txt:'\\u26A1' });
    alive(foes).forEach(function(x){
      fx({ k:'spell', toSide:sideOf(x), toId:x.id, el:'rayo' });
      var d = (typeof dealDamage === 'function') ? dealDamage(x, dmg, { type:'spell', element:'rayo', pierce:1, ignoreArmor:true }) : 0;
      log('ld', h.name + ' fulmina a ' + x.name + ' con un rayo (-' + d + ').');
    });
    if(el && typeof heal === 'function'){
      var g = heal(h, 5);
      if(g) log('lh', h.name + ' se cura +' + g + '.');
    }
    log('li', h.name + ' se vuelve el m\\u00e1s r\\u00e1pido de todos los h\\u00e9roes.');
    // Marca la habilidad como usada (abilityUsed) para que scanAbilityUsage
    // del battleRulesPatch detecte la transición y fije _bfNormalUsed o
    // _bfEliteUsed según el modo actual. Antes se ponía eliteUsed=true para
    // la versión élite, pero ese flag no lo detecta scanAbilityUsage y la
    // habilidad élite se podía usar repetidas veces.
    h.abilityUsed = true;
    sync();
    finish();
  }

  function install(){
    if(window.__bfEpicSummonHooked || typeof window.useAbility !== 'function' || typeof G === 'undefined') return false;
    window.__bfEpicSummonHooked = true;
    var orig = window.useAbility;
    window.useAbility = function(side, h, done){
      var k = h && h.akind;
      if(k !== 'epic-summon' && k !== 'kamikaze-token' && k !== 'pegasus-token') return orig.apply(this, arguments);
      // Se resuelve localmente en ambos lados (igual que faithfulAbilitiesPatch):
      // el anfitrión es la autoridad y netSync envía el estado final al invitado.
      var finish = function(){
        if(typeof done === 'function') done();
        else if(typeof finishAct === 'function') finishAct();
      };
      if(k === 'kamikaze-token'){ kamikaze(side, h, finish); return; }
      if(k === 'pegasus-token'){ pegasus(side, h, finish); return; }
      if(!summon(side, h)) return orig.apply(this, arguments);
      setTimeout(finish, 420);
    };
    return true;
  }

  // ---- IA: forzar el uso de habilidad de las invocaciones ----
  // El motor del juego no reconoce estos identificadores internos como
  // héroes con habilidad, así que la IA no llama a useAbility para ellos: los
  // manda a golpe melee y sus habilidades nunca se disparan. Se intercepta
  // aiTurn para que, cuando le toque el turno a uno de estos tokens, la IA
  // use su habilidad automáticamente (igual que haría un jugador humano).
  function installAiTurnHook(){
    if(window.__bfEpicAiTurnHooked || typeof window.aiTurn !== 'function') return false;
    window.__bfEpicAiTurnHooked = true;
    var orig = window.aiTurn;
    window.aiTurn = function(h, side){
      var k = h && h.akind;
      if((k === 'pegasus-token' || k === 'kamikaze-token') && !h.abilityUsed && h.alive){
        // Espera a que terminen las animaciones en pantalla antes de lanzar
        // la habilidad (igual que aiWaitCinePatch, pero solo para estos tokens).
        var t0 = Date.now();
        (function tick(){
          if(typeof B !== 'undefined' && B && B.over) return;
          var busy = document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov,.bf-dmg-num,.bf-heal-num,.bf-absorb-pop,.bf-skip-pop,.bf-status-pop,.bf-fumble-pop,.bf-stat-pop');
          if(busy && Date.now() - t0 < 6000){
            try { if(typeof window.armWatchdog === 'function'){ if(typeof window.clearWatchdog === 'function') window.clearWatchdog(); window.armWatchdog(); } } catch(e){}
            return setTimeout(tick, 200);
          }
          setTimeout(function(){
            if(typeof window.useAbility === 'function' && !h.abilityUsed && h.alive) window.useAbility(side, h);
          }, 200);
        })();
        return;
      }
      return orig.apply(this, arguments);
    };
    return true;
  }

  // ---- Arte aleatorio del Kamikaze en batalla ----
  // El Unicornio no tiene versión élite, pero tiene dos ilustraciones. Se
  // elige una al azar al invocarlo (inst._bfArtUrl) y se aplica sobre la
  // capa .bf-battle-art de su carta. El juego re-renderiza la carta en cada
  // ciclo, así que hay que reaplicar el arte periódicamente.
  setInterval(function(){
    if(typeof G === 'undefined' || !G || !G.team) return;
    ['p','o'].forEach(function(side){
      (G.team[side] || []).forEach(function(h){
        if(!h || !h._bfArtUrl || !h.alive) return;
        var card = document.getElementById('b_' + side + '_' + h.id);
        if(!card) return;
        var art = card.querySelector('.bf-battle-art');
        if(!art) return;
        var cur = (art.style.backgroundImage || '').match(/url\(["']?([^"')]+)["']?\)/);
        cur = cur ? cur[1] : '';
        if(cur !== h._bfArtUrl){
          art.style.backgroundImage = 'url("' + h._bfArtUrl + '")';
          art.style.backgroundSize = 'cover';
        }
      });
    });
  }, 300);

  var tries = 0, iv = setInterval(function(){ if(install() || installAiTurnHook() || tries++ > 160) clearInterval(iv); }, 150);
  install();
  installAiTurnHook();
})();
</script>
`;