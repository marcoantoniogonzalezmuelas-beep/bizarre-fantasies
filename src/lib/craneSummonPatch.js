// Habilidad élite de Daidoji Esva: "Dios de la Grulla" — invoca un token de
// Grulla. La habilidad de la Grulla es PASIVA: no se puede activar ni
// desactivar (su panel de acciones lo muestra como "EN JUEGO") y cada vez que
// le toca turno cura 5 de vida (7 si es élite) a cada aliado vivo, sin
// incluirse a ella misma.
export const CRANE_SUMMON_PATCH = `
<script>
(function(){
  if(window.__bfCranePatch) return;
  window.__bfCranePatch = true;

  function craneToken(){
    var fromHeroes = (typeof HEROES !== 'undefined' ? HEROES : []).find(function(h){ return h && h.id === 'tk_grulla'; });
    if(fromHeroes) return fromHeroes;
    return (typeof TOKENS !== 'undefined' ? TOKENS : []).find(function(t){ return t && t.id === 'tk_grulla'; });
  }

  function healAmount(crane){ return crane && crane.eliteMode ? 7 : 5; }

  // Destello verde mágico a pantalla completa mientras la Grulla cura.
  function healFx(){
    try{
      if(!document.getElementById('bf-crane-heal-css')){
        var st = document.createElement('style'); st.id = 'bf-crane-heal-css';
        st.textContent = '#bf-crane-heal{position:fixed;inset:0;z-index:100006;pointer-events:none;background:radial-gradient(circle at 50% 55%,rgba(126,255,196,.34),rgba(60,220,170,.14) 45%,transparent 72%);animation:bfCraneHeal 1.35s ease-out forwards}'
          + '@keyframes bfCraneHeal{0%{opacity:0}25%{opacity:1}100%{opacity:0}}'
          + '#bf-crane-heal .bf-ch-ring{position:absolute;left:50%;top:52%;width:12vmin;height:12vmin;transform:translate(-50%,-50%);border-radius:50%;border:3px solid rgba(150,255,210,.9);box-shadow:0 0 26px rgba(126,255,196,.85);animation:bfCraneRing 1.3s ease-out forwards}'
          + '@keyframes bfCraneRing{0%{opacity:1}100%{opacity:0;width:130vmin;height:130vmin;border-width:1px}}'
          + '#bf-crane-heal .bf-ch-mote{position:absolute;width:7px;height:7px;border-radius:50%;background:#c8ffe6;box-shadow:0 0 12px #7effc4;animation:bfCraneMote 1.35s ease-out forwards}'
          + '@keyframes bfCraneMote{0%{opacity:0;transform:translateY(0) scale(.4)}20%{opacity:1}100%{opacity:0;transform:translateY(-38vh) scale(1.3)}}';
        document.head.appendChild(st);
      }
      var ov = document.createElement('div'); ov.id = 'bf-crane-heal';
      var html = '<div class="bf-ch-ring"></div>';
      for(var i=0;i<16;i++) html += '<span class="bf-ch-mote" style="left:'+(4+Math.random()*92).toFixed(0)+'%;bottom:'+(10+Math.random()*30).toFixed(0)+'%;animation-delay:'+(Math.random()*.5).toFixed(2)+'s"></span>';
      ov.innerHTML = html;
      document.body.appendChild(ov);
      setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 1500);
    }catch(e){}
  }

  // Cura a todos los aliados vivos (la Grulla NO se cura a sí misma).
  function healAllies(side, crane){
    var team = (typeof G !== 'undefined' && G.team && G.team[side]) || [];
    var amount = healAmount(crane);
    var healed = 0;
    team.forEach(function(a){
      if(!a || !a.alive || a.id === crane.id) return;
      if((typeof heal === 'function' ? heal(a, amount) : 0) > 0){
        healed++;
        if(typeof pushFx === 'function') pushFx({k:'status', side:side, id:a.id, txt:'+' + amount});
      }
    });
    if(typeof pushLog === 'function') pushLog('lg', '\\u{1F426} ' + crane.name + ' extiende su c\\u00edrculo de protecci\\u00f3n: +' + amount + ' de vida a cada aliado vivo.');
    healFx();
    if(typeof window.__bfPlayAbilityAnim === 'function'){ try{ window.__bfPlayAbilityAnim(side, crane); }catch(e){} }
    if(typeof renderBattle === 'function') renderBattle();
    if(typeof netSync === 'function') netSync('s-battle');
    return healed;
  }

  // La cura se dispara al comenzar el turno de la Grulla (incluido el primero).
  function installTurnHeal(){
    if(window.__bfCraneTurnHooked || typeof window.stepTurn !== 'function') return false;
    window.__bfCraneTurnHooked = true;
    var origStep = window.stepTurn;
    window.stepTurn = function(){
      try{
        if(typeof B !== 'undefined' && B && !B.over && B.queue && B.qi < B.queue.length){
          var slot = B.queue[B.qi];
          var h = (typeof getHero === 'function') ? getHero(slot.side, slot.id) : null;
          if(h && h.alive && h._bfCrane && h._bfHealRound !== B.round){
            h._bfHealRound = B.round;
            healAllies(slot.side, h);
            var self = this, args = arguments;
            return setTimeout(function(){ origStep.apply(self, args); }, 1500);
          }
        }
      }catch(e){}
      return origStep.apply(this, arguments);
    };
    return true;
  }

  // Panel de acciones de la Grulla: su habilidad aparece como "EN JUEGO" y no
  // se puede pulsar (es pasiva, ni se activa ni se desactiva).
  function markPassiveButton(){
    try{
      if(typeof B === 'undefined' || !B || !B.current) return;
      var h = (typeof getHero === 'function') ? getHero(B.current.side, B.current.id) : null;
      if(!h || !h._bfCrane) return;
      var btn = document.querySelector('.jrpg-btn.ability');
      if(!btn || btn.dataset.bfCrane === '1') return;
      btn.dataset.bfCrane = '1';
      btn.classList.add('disabled');
      btn.removeAttribute('onclick');
      btn.onclick = null;
      btn.style.pointerEvents = 'none';
      var lab = btn.querySelector('.jrpg-btn-label');
      var val = btn.querySelector('.jrpg-btn-val');
      if(lab) lab.textContent = 'EN JUEGO';
      if(val){ val.textContent = '\\u267B\\ufe0f +' + healAmount(h); val.style.color = '#9dffcf'; }
      btn.title = 'Habilidad pasiva en juego: cura ' + healAmount(h) + ' de vida a cada aliado vivo en su turno.';
    }catch(e){}
  }

  function installAbility(){
    if(window.__bfCraneAbilHooked || typeof window.useAbility !== 'function' || typeof G === 'undefined') return false;
    window.__bfCraneAbilHooked = true;
    var orig = window.useAbility;
    window.useAbility = function(side, hero, done){
      // La Grulla no puede usar habilidad: la suya es pasiva.
      if(hero && hero._bfCrane){
        hero.abilityUsed = true;
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct();
        return;
      }
      // Solo la habilidad ÉLITE de Daidoji invoca la grulla.
      if(!hero || hero.akind !== 'crane-summon' || !hero.eliteMode) return orig.apply(this, arguments);
      var token = craneToken();
      if(!token) return orig.apply(this, arguments);
      var complete = typeof done === 'function' ? done : function(){ if(typeof finishAct === 'function') finishAct(); };
      var inst = typeof makeInstance === 'function' ? makeInstance(token) : Object.assign({}, token);
      inst.id = 'crane_' + Date.now();
      inst._token = token.id; inst._bfCrane = true;
      inst.eliteUsed = true; inst.eliteMode = false;
      // Su habilidad es pasiva: marcada como usada para que no se pueda activar.
      inst.abilityUsed = true;
      inst._mods = []; inst.shield = 0; inst.wardTurns = 0; inst.evade = 0; inst.defending = false;
      inst.maxHp = Number(token.hp) || 41; inst.hp = inst.maxHp; inst.alive = true;
      (G.team[side] || (G.team[side] = [])).push(inst);
      hero.abilityUsed = true;
      if(typeof pushLog === 'function') pushLog('lg', hero.name + ' invoca a la ' + inst.name + ': en cada uno de sus turnos cura ' + healAmount(inst) + ' de vida a cada aliado vivo.');
      if(typeof pushFx === 'function') pushFx({k:'status', side:side, id:hero.id, txt:'\\u{1F426}'});
      if(typeof window.__bfPlayAbilityAnim === 'function'){
        try{ window.__bfPlayAbilityAnim(side, hero); }catch(e){}
        setTimeout(function(){ try{ window.__bfPlayAbilityAnim(side, { id:'tk_grulla', ability: inst.ability || inst.name, eliteMode:false }); }catch(e){} }, 3400);
      }
      if(typeof renderBattle === 'function') renderBattle();
      if(typeof netSync === 'function') netSync('s-battle');
      setTimeout(complete, 420);
    };
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    installAbility(); installTurnHeal();
    if((window.__bfCraneAbilHooked && window.__bfCraneTurnHooked) || tries++ > 160) clearInterval(timer);
  }, 150);
  setInterval(markPassiveButton, 250);
})();
</script>
`;