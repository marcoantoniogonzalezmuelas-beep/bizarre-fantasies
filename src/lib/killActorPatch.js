// Parche inyectado en el iframe: garantiza que en la cinemática de GOLPE MORTAL
// aparezca SIEMPRE el héroe que realmente ha provocado la muerte.
//
// PROBLEMA: la cinemática del juego deduce al ejecutor leyendo el DOM
// (.bhero.active-turn) y, como respaldo, B.current / __bfLastTurn. Cuando la
// muerte se pinta después de que el turno haya avanzado (habilidades, hechizos,
// objetos, daño en cadena…), esos datos ya apuntan a otro héroe y la cinemática
// mostraba al equivocado — o a ninguno.
//
// SOLUCIÓN: se anota el ejecutor EN EL MOMENTO del daño mortal (dealDamage) y,
// justo antes de que la cinemática lo lea, se marca su retrato como el activo
// durante ese instante, restaurando después el estado real del tablero. No se
// altera ninguna lógica de combate: solo se corrige a quién retrata la escena.
export const KILL_ACTOR_PATCH = `
<script>
(function(){
  if(window.__bfKillActorPatch) return;
  window.__bfKillActorPatch = true;

  // Acción en curso (para saber CON QUÉ se remató: ataque, habilidad, hechizo
  // u objeto). Se usará también en el resumen de la acción definitiva.
  function markAction(kind){ var c=null; try{ if(typeof B!=='undefined'&&B&&B.current) c={side:B.current.side,id:B.current.id}; }catch(e){} window.__bfActionCtx = { kind: kind, ts: Date.now(), actor: c }; }
  ['useAbility','castSpell','useItem'].forEach(function(fn){
    var tries = 0, t = setInterval(function(){
      if(typeof window[fn] === 'function' && !window[fn].__bfKillActor){
        var orig = window[fn];
        window[fn] = function(){ markAction(fn); return orig.apply(this, arguments); };
        window[fn].__bfKillActor = 1;
        clearInterval(t);
      } else if(tries++ > 150) clearInterval(t);
    }, 200);
  });

  var deathSources = Object.create(null);
  function currentActor(){
    try{
      if(typeof B === 'undefined' || !B || !B.current) return null;
      return { side: B.current.side, id: B.current.id };
    }catch(e){ return null; }
  }

  // Anota el ejecutor del golpe que deja a un héroe sin vida.
  function installDamageHook(){
    // El flag va en window (no en la función): otros parches vuelven a envolver
    // dealDamage después y, con un flag en la función, este parche se apilaría
    // una y otra vez.
    if(typeof window.dealDamage !== 'function' || window.__bfKillActorDmgHooked) return false;
    window.__bfKillActorDmgHooked = true;
    var orig = window.dealDamage;
    window.dealDamage = function(target, amount){
      var wasAlive = !!(target && target.alive);
      var actor = currentActor();
      // El turno actual es la fuente de verdad: un contexto de habilidad de
      // hace segundos no puede atribuir un ataque posterior a otro héroe.
      var cx = window.__bfActionCtx;
      if(!actor && cx && cx.actor && Date.now()-cx.ts<1200) actor=cx.actor;
      var result = orig.apply(this, arguments);
      try{
        // Autogolpe: el héroe (o un aliado) cae por daño de su propio bando.
        // Solo cuenta como autogolpe si el propio bando lo provocó con un
        // hechizo/objeto/habilidad reciente (no por veneno, contraataque, etc.).
        if(wasAlive && target && !target.alive && typeof G !== 'undefined' && G.team){
          var victimSide=(G.team.p||[]).includes(target)?'p':(G.team.o||[]).includes(target)?'o':null;
          if(victimSide){
            var opts=arguments[2]||{}, periodic=/poison|veneno|burn|bleed|dot|persist/i.test(String(opts.type||opts.element||opts.status||'')) || !!opts.bfPeriodic;
            var valid=actor && (G.team[actor.side]||[]).some(function(h){return h && h.id===actor.id;});
            var isSelf=!valid || actor.side===victimSide || periodic;
            deathSources[victimSide+'_'+target.id]={side:valid?actor.side:victimSide,id:valid?actor.id:target.id,ts:Date.now(),self:isSelf,kind:cx&&Date.now()-cx.ts<2000?cx.kind:'attack'};
          }
        }
        if(wasAlive && target && !target.alive && actor && deathSources[(G.team.p||[]).includes(target)?'p_'+target.id:'o_'+target.id] && !deathSources[(G.team.p||[]).includes(target)?'p_'+target.id:'o_'+target.id].self && (G.team[actor.side === 'p' ? 'o' : 'p'] || []).includes(target)){
          var ctx = window.__bfActionCtx;
          var kind = (ctx && Date.now() - ctx.ts < 20000) ? ctx.kind : 'attack';
          window.__bfKillActor = {
            side: actor.side,
            id: actor.id,
            victim: target.id,
            kind: kind,
            ts: Date.now(),
          };
          // Datos para el REPASO de la acción definitiva (último golpe mortal de
          // la partida): quién, a quién, con qué y cuánto daño.
          var ah = null;
          try{
            (G.team[actor.side] || []).forEach(function(h){ if(h && h.id === actor.id) ah = h; });
          }catch(e2){}
          window.__bfFinalBlow = {
            side: actor.side, id: actor.id,
            actorName: (ah && ah.name) || '',
            actorElite: !!(ah && ah.eliteMode),
            actorKey: (ah && ah._token) || actor.id,
            victimId: target.id,
            victimName: target.name || '',
            victimElite: !!target.eliteMode,
            victimKey: target._token || target.id,
            kind: kind,
            amount: Number(amount) || 0,
            ts: Date.now(),
          };
        }
      }catch(e){}
      return result;
    };
    window.dealDamage.__bfKillActor = 1;
    return true;
  }

  // Justo cuando llega el evento de muerte, el retrato del ejecutor anotado
  // pasa a ser el "activo" durante el instante en que la cinemática lo lee.
  function installDeathHook(){
    if(typeof window.flushFx !== 'function' || window.__bfKillActorFxHooked) return false;
    window.__bfKillActorFxHooked = true;
    var orig = window.flushFx;
    window.flushFx = function(events){
      try{
        (events||[]).forEach(function(ev){
          if(!ev||ev.k!=='death')return;
          var key=ev.side+'_'+ev.id;
          if(deathSources[key]){ev.bfKillSource=deathSources[key];delete deathSources[key];}
        });
        var death = (events || []).filter(function(ev){ return ev && ev.k === 'death'; })[0];
        var a = death && death.bfKillSource ? (death.bfKillSource.self ? null : {...death.bfKillSource,victim:death.id}) : window.__bfKillActor;
        // MULTIPLAYER (cliente): dealDamage NO se ejecuta en el lado del
        // invitado — solo el host simula el combate. __bfKillActor nunca se
        // establece, así que la cinemática de golpe mortal no mostraba al
        // atacante (solo al héroe caído). Fallback: deducir el atacante del
        // turno activo (B.current o .bhero.active-turn), que SÍ llega sincronizado
        // al cliente. Solo si no hay un __bfKillActor válido ya fijado.
        if(death && !death.bfKillSource && (!a || Date.now() - a.ts > 2000 || a.victim !== death.id)){
          var fallbackActor = null;
          // 1) B.current: el héroe cuyo turno está en curso (el atacante).
          if(typeof B !== 'undefined' && B && B.current){
            fallbackActor = { side: B.current.side, id: B.current.id, victim: death.id, kind: 'attack', ts: Date.now() };
          }
          // 2) .bhero.active-turn: respaldo del DOM si B.current no está.
          if(!fallbackActor){
            var activeCard = document.querySelector('.bhero.active-turn');
            if(activeCard && activeCard.id){
              var m = /^b_([po])_(.+)$/.exec(activeCard.id);
              if(m) fallbackActor = { side: m[1], id: m[2], victim: death.id, kind: 'attack', ts: Date.now() };
            }
          }
          // Solo lo usa si el atacante deducido NO es la propia víctima (un
          // héroe no se mata a sí mismo).
          var deathSide = death.side || death.toSide || (typeof G !== 'undefined' && G.team && (G.team.p || []).some(function(h){return h && h.id === death.id;}) ? 'p' : (typeof G !== 'undefined' && G.team && (G.team.o || []).some(function(h){return h && h.id === death.id;}) ? 'o' : ''));
          if(fallbackActor && deathSide && fallbackActor.side && fallbackActor.side !== deathSide){
            a = fallbackActor;
            window.__bfKillActor = a;
          }
        }
        if(death && a && Date.now() - a.ts < 20000 && a.victim === death.id){
          var card = document.getElementById('b_' + a.side + '_' + a.id);
          if(card && !card.classList.contains('active-turn')){
            var prev = Array.prototype.slice.call(document.querySelectorAll('.bhero.active-turn'));
            prev.forEach(function(c){ c.classList.remove('active-turn'); });
            card.classList.add('active-turn');
            window.__bfLastTurn = { side: a.side, id: a.id, elite: card.classList.contains('elite-mode') || card.classList.contains('bf-auto-elite') };
            setTimeout(function(){
              card.classList.remove('active-turn');
              prev.forEach(function(c){ c.classList.add('active-turn'); });
            }, 500);
          } else if(card){
            window.__bfLastTurn = { side: a.side, id: a.id, elite: card.classList.contains('elite-mode') || card.classList.contains('bf-auto-elite') };
          }
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    window.flushFx.__bfKillActor = 1;
    return true;
  }

  var tries = 0, timer = setInterval(function(){
    var a = installDamageHook(), b = installDeathHook();
    if((a && b) || tries++ > 200) clearInterval(timer);
  }, 200);
  installDamageHook(); installDeathHook();
})();
</script>
`;