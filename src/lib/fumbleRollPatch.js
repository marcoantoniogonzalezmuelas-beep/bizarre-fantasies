// Sistema de tiradas de dado (rol americano) para TODAS las acciones.
//
// Antes de resolver una acción (golpe cuerpo a cuerpo, disparo, habilidad,
// hechizo u objeto) se tira internamente un d20 y se explica en el registro:
//   · 1-2  → PIFIA (10%): la acción no hace nada.
//   · de esas pifias, un segundo d20 con un 1 → FALLO ÉPICO (5% de las pifias):
//     además de fallar, el efecto se vuelve contra el propio héroe.
//
// También marca como PIFIA las habilidades de héroes bizarros que el motor no
// resuelve (no producen ningún efecto), una vez terminada su animación.
export function buildFumbleRollPatch(lang) {
  const en = lang === 'en';
  const T = {
    pifia: en ? 'FUMBLE' : 'PIFIA',
    epic: en ? 'EPIC FAIL' : 'FALLO ÉPICO',
    roll: en ? 'd20 roll' : 'Tirada d20',
    fumbleLog: en ? 'FUMBLE! (19-20 on a d20 = 10%): the action does nothing.' : '¡PIFIA! (19-20 en d20 = 10%): la acción no hace nada.',
    epicLog: en ? 'EPIC FAIL! (a 1 on a d20 = 5%): the action does nothing and the effect backfires.' : '¡FALLO ÉPICO! (1 en d20 = 5%): la acción no hace nada y el efecto se vuelve en su contra.',
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
    + 'animation:bfFumblePop 3.6s cubic-bezier(.2,.8,.3,1) forwards}'
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
    n.innerHTML = (epic ? '\\u{1F480} ${T.epic}' : '\\u{1F3B2} ${T.pifia}') + (roll ? '<small>${T.roll}: ' + roll + '/20</small>' : '');
    (window.__bfAppend || function(x){ document.body.appendChild(x); })(n);
    setTimeout(function(){ if(n.parentNode) n.parentNode.removeChild(n); }, 3750);
  }

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

  // Tirada interna: UNA sola tirada de d20 por acción.
  //   · 1        → FALLO ÉPICO (5%)
  //   · 19 o 20  → PIFIA (10%)
  //   · resto    → la acción se resuelve con normalidad
  function roll(){
    var r = 1 + Math.floor(Math.random() * 20);
    if(r === 1) return { ok:false, r:r, epic:true };
    if(r >= 19) return { ok:false, r:r, epic:false };
    return { ok:true, r:r };
  }

  function selfBackfire(a){
    try{
      var k = (typeof primKey === 'function') ? primKey(a.h.type) : 'cc';
      var dmg = Math.max(3, Math.round(stat(a.h, k) * 0.6));
      var d = dealDamage(a.h, dmg, { type:'true' });
      log('lx', '\\u{1F480} ' + a.h.name + ' ${T.selfHit} -' + d + '.');
    }catch(e){}
  }

  // Devuelve true si la acción se ha "pifiado" (y ya se ha resuelto el fallo).
  function fumbled(label){
    var a = actor();
    if(!a) return false;
    var t = roll();
    if(t.ok){
      log('li', '\\u{1F3B2} ${T.roll} (' + label + '): ' + t.r + '/20 \\u2192 ' + (t.r >= 18 ? '\\u00a1' : '') + 'OK.');
      return false;
    }
    log('lx', '\\u{1F3B2} ${T.roll} (' + label + '): ' + t.r + '/20 \\u2192 ' + (t.epic ? '${T.epicLog}' : '${T.fumbleLog}'));
    pop(a.side, a.h.id, t.epic, t.r);
    if(t.epic) selfBackfire(a);
    try{ if(typeof renderBattle === 'function') renderBattle(); }catch(e){}
    return true;
  }

  function wrapAction(name, label){
    if(typeof window[name] !== 'function' || window[name].__bfFum) return;
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

  function wrapAbility(){
    if(typeof window.useAbility !== 'function' || window.useAbility.__bfFum) return;
    var orig = window.useAbility;
    var w = function(side, h, done){
      var self = this;
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
    wrapAbility();
    if(tries++ > 200) clearInterval(iv);
  }, 200);
})();
</script>
`;
}