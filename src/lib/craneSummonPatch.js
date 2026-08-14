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

  // La Grulla normal cura 5; su versión élite cura 7.
  function healAmount(crane){ return crane && crane.eliteMode ? 7 : 5; }

  // Efecto visual de curación: destello verde mágico a pantalla completa y un
  // "+7" flotante sobre cada aliado curado.
  function healFx(side){
    try{
      if(!document.getElementById('bf-crane-heal-css')){
        var st = document.createElement('style'); st.id = 'bf-crane-heal-css';
        st.textContent = '#bf-crane-heal{position:fixed;inset:0;z-index:100006;pointer-events:none;background:radial-gradient(circle at 50% 55%,rgba(126,255,196,.34),rgba(60,220,170,.14) 45%,transparent 72%);animation:bfCraneHeal 1.25s ease-out forwards}'
          + '@keyframes bfCraneHeal{0%{opacity:0}25%{opacity:1}100%{opacity:0}}'
          + '#bf-crane-heal .bf-ch-ring{position:absolute;left:50%;top:52%;width:12vmin;height:12vmin;transform:translate(-50%,-50%);border-radius:50%;border:3px solid rgba(150,255,210,.9);box-shadow:0 0 26px rgba(126,255,196,.85);animation:bfCraneRing 1.2s ease-out forwards}'
          + '@keyframes bfCraneRing{0%{opacity:1}100%{opacity:0;width:130vmin;height:130vmin;border-width:1px}}'
          + '#bf-crane-heal .bf-ch-mote{position:absolute;width:7px;height:7px;border-radius:50%;background:#c8ffe6;box-shadow:0 0 12px #7effc4;animation:bfCraneMote 1.3s ease-out forwards}'
          + '@keyframes bfCraneMote{0%{opacity:0;transform:translateY(0) scale(.4)}20%{opacity:1}100%{opacity:0;transform:translateY(-38vh) scale(1.3)}}';
        document.head.appendChild(st);
      }
      var ov = document.createElement('div'); ov.id = 'bf-crane-heal';
      var html = '<div class="bf-ch-ring"></div>';
      for(var i=0;i<16;i++) html += '<span class="bf-ch-mote" style="left:'+(4+Math.random()*92).toFixed(0)+'%;bottom:'+(10+Math.random()*30).toFixed(0)+'%;animation-delay:'+(Math.random()*.5).toFixed(2)+'s"></span>';
      ov.innerHTML = html;
      document.body.appendChild(ov);
      setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 1400);
    }catch(e){}
    // El número de puntos curados lo muestra el FX nativo de heal() del juego.
  }

  function healAllies(side, crane){
    var team = (typeof G !== 'undefined' && G.team && G.team[side]) || [];
    var amount = healAmount(crane);
    var healed = 0;
    team.forEach(function(a){
      if(!a || !a.alive) return;
      if((typeof heal === 'function' ? heal(a, amount) : 0) > 0) healed++;
    });
    if(healed){
      if(typeof pushLog === 'function') pushLog('lg', '\\u{1F426} ' + crane.name + ' extiende su c\\u00edrculo de protecci\\u00f3n: +' + amount + ' de vida a todos los aliados.');
      healFx(side);
    }
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
      // La Grulla entra en su versión normal: su propia habilidad (cura 5 por
      // turno mientras viva) es la que hace el efecto.
      inst.eliteUsed = true; inst.eliteMode = false; inst.abilityUsed = false;
      inst._mods = []; inst.shield = 0; inst.wardTurns = 0; inst.evade = 0; inst.defending = false;
      inst.maxHp = Number(token.hp) || 41; inst.hp = inst.maxHp; inst.alive = true;
      (G.team[side] || (G.team[side] = [])).push(inst);
      hero.abilityUsed = true;
      if(typeof pushLog === 'function') pushLog('lg', hero.name + ' invoca a la ' + inst.name + ': mientras viva, cura ' + healAmount(inst) + ' de vida por turno a todos los aliados.');
      if(typeof pushFx === 'function') pushFx({k:'status', side:side, id:hero.id, txt:'\\u{1F426}'});
      // Cinemática 3D del descenso de la Grulla (usa el arte de animación de
      // la carta tk_grulla, igual que el resto de habilidades).
      if(typeof window.__bfPlayAbilityAnim === 'function'){
        // Primero la cinemática élite del héroe (este hook no llama al original,
        // así que la disparamos aquí) y después el descenso de la Grulla.
        try{ window.__bfPlayAbilityAnim(side, hero); }catch(e){}
        setTimeout(function(){ try{ window.__bfPlayAbilityAnim(side, { id:'tk_grulla', ability: inst.ability || inst.name, eliteMode:false }); }catch(e){} }, 3400);
        // (eliteMode:false en la cinemática: solo hay un arte de animación)
      }
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