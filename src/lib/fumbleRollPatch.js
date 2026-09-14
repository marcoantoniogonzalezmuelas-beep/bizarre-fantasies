// Sistema de tiradas de dado (rol americano) para TODAS las acciones.
//
// Antes de resolver una acción (golpe cuerpo a cuerpo, disparo, habilidad,
// hechizo u objeto) se tira internamente un d30 y se explica en el registro:
//   · 19 o 20 → PIFIA (≈7%): la acción no hace nada.
//   · 1       → FALLO ÉPICO (≈3%): además de fallar, el efecto se vuelve
//     contra el propio héroe.
//
// También marca como PIFIA las habilidades de héroes bizarros que el motor no
// resuelve (no producen ningún efecto), una vez terminada su animación.
export function buildFumbleRollPatch(lang) {
  const en = lang === 'en';
  const T = {
    pifia: en ? 'FUMBLE' : 'PIFIA',
    epic: en ? 'EPIC FAIL' : 'FALLO ÉPICO',
    roll: en ? 'd30 roll' : 'Tirada d30',
    fumbleLog: en ? 'FUMBLE! (19-20 on a d30 ≈ 7%): the action does nothing.' : '¡PIFIA! (19-20 en d30 ≈ 7%): la acción no hace nada.',
    // Un 1 en el d30 solo es FALLO ÉPICO si se confirma con un 1 en el d6;
    // si no se confirma, se queda en pifia normal (y así debe explicarse).
    oneLog: en ? 'FUMBLE! (a 1 on a d30 not confirmed on the d6): the action does nothing.' : '¡PIFIA! (1 en d30 no confirmado en el d6): la acción no hace nada.',
    epicLog: en ? 'EPIC FAIL! (a 1 on a d30 confirmed with a 1 on a d6 ≈ 0.5%): the action does nothing and the effect backfires.' : '¡FALLO ÉPICO! (1 en d30 confirmado con 1 en d6 ≈ 0,5%): la acción no hace nada y el efecto se vuelve en su contra.',
    selfHit: en ? 'hits itself for' : 'se golpea a sí mismo por',
    nothing: en ? 'FUMBLE: this ability has no effect.' : 'PIFIA: esta habilidad no produce ningún efecto.',
  };
  return `
<script>
(function(){
  if(window.__bfFumbleRoll) return;
  window.__bfFumbleRoll = true;

  var st = document.createElement('style');
  st.textContent = ''
    + '.bf-fumble-pop{position:fixed;z-index:100006;pointer-events:none;transform:translate(-50%,-50%);'
    + 'display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 18px;border-radius:14px;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:34px;line-height:1;color:#ff86d2;white-space:nowrap;"
    + 'background:radial-gradient(circle,rgba(60,8,42,.82),rgba(60,8,42,0) 74%);'
    + 'text-shadow:0 0 14px rgba(255,110,205,.95),0 3px 8px #000,0 0 3px #000;'
    + 'animation:bfFumblePop 4.4s cubic-bezier(.2,.8,.3,1) forwards}'
    + '.bf-fumble-pop.epic{font-size:30px;color:#ff5fc0}'
    + '.bf-fumble-pop small{font-size:15px;font-weight:800;color:#ffd0ec;letter-spacing:1px;text-shadow:0 2px 6px #000}'
    + '@keyframes bfFumblePop{0%{opacity:0;transform:translate(-50%,-20%) scale(.5) rotate(-6deg)}'
    + '10%{opacity:1;transform:translate(-50%,-62%) scale(1.18) rotate(3deg)}'
    + '18%{transform:translate(-50%,-64%) scale(1) rotate(-2deg)}'
    + '84%{opacity:1;transform:translate(-50%,-96%) scale(1)}'
    + '100%{opacity:0;transform:translate(-50%,-150%) scale(1.05)}}';
  document.head.appendChild(st);

  function pop(side, id, epic, roll){
    var el = document.getElementById('b_' + side + '_' + id);
    if(!el) return;
    var r = el.getBoundingClientRect();
    var n = document.createElement('div');
    n.className = 'bf-fumble-pop' + (epic ? ' epic' : '');
    n.style.left = (r.left + r.width / 2) + 'px';
    n.style.top = (r.top + r.height * 0.42) + 'px';
    n.innerHTML = (epic ? '\\u{1F480} ${T.epic}' : '\\u{1F3B2} ${T.pifia}') + (roll ? '<small>${T.roll}: ' + roll + '/30</small>' : '');
    (window.__bfAppend || function(x){ document.body.appendChild(x); })(n);
    setTimeout(function(){ if(n.parentNode) n.parentNode.removeChild(n); }, 4550);
  }
  // Disponible para otros parches (Juniana hace su propia tirada).
  window.__bfFumblePop = pop;

  function log(c, m){ if(typeof pushLog === 'function') pushLog(c, m); }

  // Contador de entradas del registro: sirve para detectar habilidades que no
  // producen ningún efecto (el motor escribe siempre en el registro al resolver).
  window.__bfLogSeq = 0;
  var iv0 = setInterval(function(){
    if(typeof window.pushLog !== 'function' || window.pushLog.__bfSeq) return;
    var o = window.pushLog;
    var w = function(){ window.__bfLogSeq++; return o.apply(this, arguments); };
    w.__bfSeq = true;
    window.pushLog = w;
    clearInterval(iv0);
  }, 150);

  function actor(){
    try{
      if(typeof B === 'undefined' || !B || !B.current) return null;
      var h = getHero(B.current.side, B.current.id);
      return h ? { side: B.current.side, h: h } : null;
    }catch(e){ return null; }
  }

  // Tirada interna: UNA sola tirada de d30 por acción.
  //   · 1        → FALLO ÉPICO (≈3%)
  //   · 19 o 20  → PIFIA (≈7%)
  //   · resto    → la acción se resuelve con normalidad
  // El fallo épico salía demasiado a menudo (1/30 = 3% por acción, y en una
  // partida hay 60-100 acciones → 2-3 por partida). Ahora el 1 hay que
  // CONFIRMARLO con un d6: solo si sale otro 1 es fallo épico (≈0,5%); si no,
  // se queda en pifia normal.
  // Dado realmente aleatorio y SIN SESGO: Math.random() escalado puede
  // repetir valores en rachas; se usa el generador criptográfico del navegador
  // con rechazo de los valores que sobran (para que las 30 caras sean
  // exactamente equiprobables).
  function die(faces){
    try{
      if(window.crypto && window.crypto.getRandomValues){
        var lim = Math.floor(256 / faces) * faces;
        var b = new Uint8Array(1);
        for(var i = 0; i < 32; i++){
          window.crypto.getRandomValues(b);
          if(b[0] < lim) return (b[0] % faces) + 1;
        }
      }
    }catch(e){}
    return 1 + Math.floor(Math.random() * faces);
  }
  window.__bfDie = die;

  function confirmEpic(){ return die(6) === 1; }

  // Anti-racha: dos pifias seguidas (o muy pegadas) hacen que el jugador sienta
  // que el dado "tiende al 1". Tras un fallo, las 2 acciones siguientes vuelven
  // a tirar el dado una vez más si repiten resultado de fallo.
  var lastFail = -99, actCount = 0;
  function roll(){
    actCount++;
    var r = die(30);
    var bad = (r === 1 || r === 19 || r === 20);
    if(bad && (actCount - lastFail) <= 2){
      r = die(30);
      bad = (r === 1 || r === 19 || r === 20);
    }
    if(!bad) return { ok:true, r:r };
    lastFail = actCount;
    if(r === 1) return { ok:false, r:r, epic:confirmEpic() };
    return { ok:false, r:r, epic:false };
  }

  function selfBackfire(a){
    try{
      var k = (typeof primKey === 'function') ? primKey(a.h.type) : 'cc';
      var dmg = Math.max(3, Math.round(stat(a.h, k) * 0.6));
      var d = dealDamage(a.h, dmg, { type:'true' });
      log('lx', '\\u{1F480} ' + a.h.name + ' ${T.selfHit} -' + d + '.');
    }catch(e){}
  }

  // UNA SOLA tirada por acción: una misma acción pasa por varias funciones
  // (habilidad que luego golpea, objeto que lanza un hechizo, targeteo…) y cada
  // paso tiraba su propio dado, así que la probabilidad real de pifia/fallo
  // épico se multiplicaba. El candado se abre al terminar la acción o el turno.
  var rolledThisAct = false;
  function openRoll(){ rolledThisAct = false; }
  ['finishAct','endTurn'].forEach(function(fn){
    var n = 0, iv = setInterval(function(){
      if(typeof window[fn] === 'function' && !window[fn].__bfRollReset){
        var o = window[fn];
        var w = function(){ openRoll(); return o.apply(this, arguments); };
        w.__bfRollReset = true;
        window[fn] = w;
        clearInterval(iv);
      }
      if(++n > 300) clearInterval(iv);
    }, 200);
  });

  // Devuelve true si la acción se ha "pifiado" (y ya se ha resuelto el fallo).
  function fumbled(label){
    var a = actor();
    if(!a) return false;
    if(rolledThisAct) return false;
    rolledThisAct = true;
    var t = roll();
    if(t.ok){
      log('li', '\\u{1F3B2} ${T.roll} (' + label + '): ' + t.r + '/30 \\u2192 ' + 'OK.');
      return false;
    }
    log('lx', '\\u{1F3B2} ${T.roll} (' + label + '): ' + t.r + '/30 \\u2192 ' + (t.epic ? '${T.epicLog}' : (t.r === 1 ? '${T.oneLog}' : '${T.fumbleLog}')));
    pop(a.side, a.h.id, t.epic, t.r);
    if(t.epic) selfBackfire(a);
    try{ if(typeof renderBattle === 'function') renderBattle(); }catch(e){}
    return true;
  }

  // Solo se envuelve UNA vez cada acción. Otros parches vuelven a envolver
  // estas funciones más tarde; sin este registro se apilaba una tirada por
  // cada capa y salían varias tiradas seguidas hasta que una fallaba.
  var WRAPPED = {};

  function wrapAction(name, label){
    if(WRAPPED[name]) return;
    if(typeof window[name] !== 'function' || window[name].__bfFum) return;
    WRAPPED[name] = true;
    var orig = window[name];
    var w = function(){
      try{
        if(typeof NET !== 'undefined' && NET && NET.role === 'client') return orig.apply(this, arguments);
        if(fumbled(label)){
          if(typeof finishAct === 'function') setTimeout(finishAct, 900);
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    w.__bfFum = true;
    window[name] = w;
  }

  // Habilidades de efecto PERMANENTE (se activan una vez y siguen actuando):
  // solo se tira el dado al activarlas, nunca hay fallo épico y, si sale pifia,
  // no ocurre nada pero la habilidad queda marcada como usada (no "en juego").
  // Auditadas del texto de las cartas:
  //   · Juniana (normal y élite): refracción mientras esté en juego.
  //   · KillerDucks (normal y élite): los patitos quedan en juego.
  //   · Daidoji Esva (normal): +5 por aliado "para el resto de la batalla".
  //   · Batu (élite): escudo que se regenera cada turno.
  //   · Edredon (normal y élite): sin penalización de tipo durante el combate.
  function isPassive(h){
    var n = String((h && h.name) || '').toLowerCase();
    if(n.indexOf('juniana') >= 0) return true;
    if(n.indexOf('killerduck') >= 0 || n.indexOf('patito') >= 0 || n.indexOf('duck') >= 0) return true;
    if(n.indexOf('daidoji') >= 0 && !h.eliteMode) return true;
    if(n.indexOf('batu') >= 0 && h.eliteMode) return true;
    if(n.indexOf('edredon') >= 0) return true;
    return false;
  }

  // Invocaciones (patitos de KillerDucks, Grulla de Daidoji y las que vengan en
  // cartas nuevas): pifia = no invoca nada; fallo épico = las criaturas
  // invocadas aparecen en el EJÉRCITO RIVAL.
  function isSummon(h){
    var txt = String((h && (h.eliteMode ? (h.eAbilityText || h.eAbility) : (h.abilityText || h.ability))) || '').toLowerCase();
    var n = String((h && h.name) || '').toLowerCase();
    if(/invoca|summon/.test(txt)) return true;
    return n.indexOf('daidoji') >= 0 || n.indexOf('killerduck') >= 0;
  }
  // Sin tirada de dado:
  //  · La Grulla (basta con la tirada de la invocación de Daidoji).
  //  · Juniana: su habilidad la resuelve su propio parche (cinemática 3D +
  //    espejo de refracción); interceptarla rompía ambos efectos.
  function noRoll(h){
    var n = String((h && h.name) || '').toLowerCase();
    if(h && (h.akind === 'reflect-damage' || h.cid === 'juni' || h.card_id === 'juni')) return true;
    return n.indexOf('grulla') >= 0 || n.indexOf('crane') >= 0 || n.indexOf('juniana') >= 0;
  }

  // Pifia de habilidad permanente: sin fallo épico, marcada como usada.
  function passiveFumbled(side, h){
    var r = die(30);
    if(r !== 19 && r !== 20 && r !== 1){
      log('li', '\\u{1F3B2} ${T.roll} (${en ? 'ability' : 'habilidad'}): ' + r + '/30 \\u2192 OK.');
      return false;
    }
    log('lx', '\\u{1F3B2} ${T.roll} (${en ? 'ability' : 'habilidad'}): ' + r + '/30 \\u2192 ' + (r === 1 ? '${T.oneLog}' : '${T.fumbleLog}'));
    pop(side, h.id, false, r);
    return true;
  }

  // Fallo épico de una invocación: las criaturas recién invocadas cambian de
  // bando y pasan a servir al ejército rival.
  function stealSummons(side, before){
    try{
      var foe = (typeof enemySide === 'function') ? enemySide(side) : (side === 'p' ? 'o' : 'p');
      var mine = (G.team[side] || []);
      var moved = mine.filter(function(x){ return before.indexOf(x.id) < 0; });
      if(!moved.length) return;
      G.team[side] = mine.filter(function(x){ return before.indexOf(x.id) >= 0; });
      G.team[foe] = (G.team[foe] || []).concat(moved);
      log('lx', '\\u{1F480} ' + moved.map(function(x){ return x.name; }).join(', ') + ' ${en ? 'turn against their summoner and join the rival army!' : '\\u00a1se vuelven contra quien los invoc\\u00f3 y se unen al ej\\u00e9rcito rival!'}');
      moved.forEach(function(x){ if(typeof pushFx === 'function') pushFx({k:'status', side:foe, id:x.id, txt:'\\u{1F480}'}); });
      if(typeof renderBattle === 'function') renderBattle();
      if(typeof netSync === 'function') netSync('s-battle');
    }catch(e){}
  }

  function wrapAbility(){
    if(WRAPPED.useAbility) return;
    if(typeof window.useAbility !== 'function' || window.useAbility.__bfFum) return;
    WRAPPED.useAbility = true;
    var orig = window.useAbility;
    var w = function(side, h, done){
      var self = this;
      if(noRoll(h)) return orig.apply(self, arguments);
      // Ya se tiró el dado en esta misma acción (p.ej. habilidad que vuelve a
      // pasar por aquí tras elegir objetivo): no se tira otra vez.
      if(rolledThisAct) return orig.apply(self, arguments);
      if(isSummon(h) || isPassive(h)) rolledThisAct = true;
      if(isSummon(h)){
        var r = die(30);
        if(r === 19 || r === 20 || (r === 1 && !(window.__bfEpicConfirmed = confirmEpic()))){
          log('lx', '\\u{1F3B2} ${T.roll} (${en ? 'summon' : 'invocaci\\u00f3n'}): ' + r + '/30 \\u2192 ' + (r === 1 ? '${T.oneLog}' : '${T.fumbleLog}'));
          pop(side, h.id, false, r);
          h.abilityUsed = true;
          try{ if(typeof renderBattle === 'function') renderBattle(); }catch(e){}
          setTimeout(function(){ if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct(); }, 900);
          return;
        }
        if(r === 1){
          log('lx', '\\u{1F3B2} ${T.roll} (${en ? 'summon' : 'invocaci\\u00f3n'}): 1/30 \\u2192 ${T.epicLog}');
          pop(side, h.id, true, r);
          var before = ((G.team[side] || []).map(function(x){ return x.id; }));
          var doneSteal = function(){
            stealSummons(side, before);
            if(typeof done === 'function') return done.apply(this, arguments);
            if(typeof finishAct === 'function') finishAct();
          };
          return orig.call(self, side, h, doneSteal);
        }
        log('li', '\\u{1F3B2} ${T.roll} (${en ? 'summon' : 'invocaci\\u00f3n'}): ' + r + '/30 \\u2192 OK.');
        return orig.apply(self, arguments);
      }
      if(isPassive(h)){
        if(passiveFumbled(side, h)){
          h.abilityUsed = true;
          try{ if(typeof renderBattle === 'function') renderBattle(); }catch(e){}
          setTimeout(function(){ if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct(); }, 900);
          return;
        }
        return orig.apply(self, arguments);
      }
      try{
        if(fumbled('${en ? 'ability' : 'habilidad'}')){
          h.abilityUsed = true;
          if(typeof renderBattle === 'function') renderBattle();
          setTimeout(function(){ if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct(); }, 900);
          return;
        }
      }catch(e){}
      var seq = window.__bfLogSeq;
      var wrappedDone = function(){
        try{
          // Habilidad sin efecto en el motor: se avisa con el marcador de pifia
          // una vez terminada la animación.
          if(window.__bfLogSeq === seq){
            log('lx', '\\u{1F3B2} ' + h.name + ' \\u2014 ${T.nothing}');
            setTimeout(function(){ try{ pop(side, h.id, false, 0); }catch(e){} }, 1300);
          }
        }catch(e){}
        if(typeof done === 'function') return done.apply(this, arguments);
        if(typeof finishAct === 'function') finishAct();
      };
      return orig.call(self, side, h, wrappedDone);
    };
    w.__bfFum = true;
    window.useAbility = w;
  }

  var tries = 0, iv = setInterval(function(){
    wrapAction('actMelee', '${en ? 'melee' : 'cuerpo a cuerpo'}');
    wrapAction('actRanged', '${en ? 'ranged' : 'disparo'}');
    wrapAction('castSpell', '${en ? 'spell' : 'hechizo'}');
    wrapAction('useItem', '${en ? 'item' : 'objeto'}');
    // La IA usa funciones separadas para hechizos y objetos (castSpell_AI,
    // useItem_AI). Sin envolverlas, la IA NUNCA pifia con hechizos ni objetos
    // — solo el jugador sí. Ahora ambos bandos tienen el mismo dado d30.
    wrapAction('castSpell_AI', '${en ? 'AI spell' : 'IA hechizo'}');
    wrapAction('useItem_AI', '${en ? 'AI item' : 'IA objeto'}');
    wrapAction('actMelee_AI', '${en ? 'AI melee' : 'IA cuerpo a cuerpo'}');
    wrapAction('actRanged_AI', '${en ? 'AI ranged' : 'IA disparo'}');
    wrapAbility();
    if(tries++ > 200) clearInterval(iv);
  }, 200);
})();
</script>
`;
}