// Habilidad élite de Daidoji Esva: "Dios de la Grulla" — invoca un token de
// Grulla (igual que KillerDucks con los Patitos de Goma). Mientras la Grulla
// siga viva, al inicio de cada ronda cura 5 de vida a todos los aliados.
//
// La habilidad NORMAL de Daidoji (Filo Espectral) no se toca: solo se
// intercepta cuando el héroe está en modo élite.
export const CRANE_SUMMON_PATCH = `
<script>
(function(){
  if(window.__bfCranePatch) return;
  window.__bfCranePatch = true;

  // El token de la Grulla vive en la lista de héroes del juego (los tokens de
  // la BD se registran ahí al iniciar la partida).
  function craneToken(){
    var fromHeroes = (typeof HEROES !== 'undefined' ? HEROES : []).find(function(h){ return h && h.id === 'tk_grulla'; });
    if(fromHeroes) return fromHeroes;
    return (typeof TOKENS !== 'undefined' ? TOKENS : []).find(function(t){ return t && t.id === 'tk_grulla'; });
  }

  function healAllies(side, crane){
    var team = (typeof G !== 'undefined' && G.team && G.team[side]) || [];
    var healed = 0;
    team.forEach(function(a){
      if(!a || !a.alive) return;
      var g = (typeof heal === 'function') ? heal(a, 5) : 0;
      if(g > 0) healed++;
    });
    if(healed && typeof pushLog === 'function') pushLog('lg', '\\u{1F426} ' + crane.name + ' extiende su c\\u00edrculo de protecci\\u00f3n: +5 de vida a todos los aliados.');
  }

  function installRoundHeal(){
    if(window.__bfCraneRoundHooked || typeof window.nextRound !== 'function') return false;
    window.__bfCraneRoundHooked = true;
    var origRound = window.nextRound;
    window.nextRound = function(){
      try{
        ['p','o'].forEach(function(s){
          var crane = ((typeof G !== 'undefined' && G.team && G.team[s]) || []).find(function(h){ return h && h.alive && h._bfCrane; });
          if(crane) healAllies(s, crane);
        });
        if(typeof renderBattle === 'function') renderBattle();
      }catch(e){}
      return origRound.apply(this, arguments);
    };
    return true;
  }

  function installAbility(){
    if(window.__bfCraneAbilHooked || typeof window.useAbility !== 'function' || typeof G === 'undefined') return false;
    window.__bfCraneAbilHooked = true;
    var orig = window.useAbility;
    window.useAbility = function(side, hero, done){
      // Solo la habilidad ÉLITE invoca la grulla; la normal sigue su curso.
      if(!hero || hero.akind !== 'crane-summon' || !hero.eliteMode) return orig.apply(this, arguments);
      var token = craneToken();
      if(!token) return orig.apply(this, arguments);
      var complete = typeof done === 'function' ? done : function(){ if(typeof finishAct === 'function') finishAct(); };
      var inst = typeof makeInstance === 'function' ? makeInstance(token) : Object.assign({}, token);
      inst.id = 'crane_' + Date.now();
      inst._token = token.id; inst._bfCrane = true;
      inst.eliteUsed = true; inst.eliteMode = false; inst.abilityUsed = false;
      inst._mods = []; inst.shield = 0; inst.wardTurns = 0; inst.evade = 0; inst.defending = false;
      inst.maxHp = Number(token.hp) || 41; inst.hp = inst.maxHp; inst.alive = true;
      (G.team[side] || (G.team[side] = [])).push(inst);
      hero.abilityUsed = true;
      if(typeof pushLog === 'function') pushLog('lg', hero.name + ' invoca a la ' + inst.name + ': mientras viva, cura 5 de vida por turno a todos los aliados.');
      if(typeof pushFx === 'function') pushFx({k:'status', side:side, id:hero.id, txt:'\\u{1F426}'});
      if(typeof renderBattle === 'function') renderBattle();
      if(typeof netSync === 'function') netSync('s-battle');
      setTimeout(complete, 420);
    };
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    var a = installAbility(), b = installRoundHeal();
    if((window.__bfCraneAbilHooked && window.__bfCraneRoundHooked) || tries++ > 160) clearInterval(timer);
  }, 150);
})();
</script>
`;