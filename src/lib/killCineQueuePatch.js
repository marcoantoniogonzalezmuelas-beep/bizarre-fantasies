// Cola de remates: recopila todas las bajas de una acción y espera a que
// concluyan sus efectos antes de mostrar el nuevo reparto humorístico.
import { createDeathQuipPicker } from '@/lib/deathQuips';
import { DEATH_SCENE_CSS, createDeathScene } from '@/lib/deathScene';

export const KILL_CINE_QUEUE_PATCH = `
<script>
(function(){
  if(window.__bfKillCineQueue) return;
  window.__bfKillCineQueue = true;
  var pickDeathQuip=(${createDeathQuipPicker.toString()})();
  var buildScene=(${createDeathScene.toString()});
  var st=document.createElement('style');
  st.textContent=${JSON.stringify(DEATH_SCENE_CSS)};
  document.head.appendChild(st);

  // ---- Estado de la cola de kills ----
  var pendingVictims = [];
  var pendingActor = null;
  var killTimer = null, resolvingKills = 0;
  var lastCineSeen = 0, pollId = 0;
  // Una muerte sigue registrada al salir de la cola: el motor y flushFx
  // pueden notificarla de nuevo durante la espera o después del overlay.
  var claimedDeaths = Object.create(null), wasInBattle = false;
  function refreshDeaths(){
    var battle = document.getElementById('s-battle');
    var inBattle = !!(battle && battle.classList.contains('active'));
    if(wasInBattle && !inBattle) claimedDeaths = Object.create(null);
    wasInBattle = inBattle;
    Object.keys(claimedDeaths).forEach(function(key){
      var death = claimedDeaths[key];
      var hero = typeof getHero === 'function' ? getHero(death.side, death.id) : null;
      // Resucitar permite una nueva muerte legítima, incluso con el mismo id.
      if(hero && hero.alive) delete claimedDeaths[key];
    });
  }
  // Expone el estado de la cola para que bfStepWhenCalm sepa que hay un
  // golpe mortal pendiente de mostrarse (aún en el retardo antes de aparecer).
  window.__bfKillCinePending = function(){ return pendingVictims.length > 0 || resolvingKills > 0; };

  function seeCine(){
    try{ if(document.querySelector('#bf-abil-anim,#bf-spec-cine')) lastCineSeen = Date.now(); }catch(e){}
  }
  function startWatch(){ if(!pollId){ seeCine(); pollId = setInterval(seeCine, 120); } }
  function stopWatch(){ if(pollId && !pendingVictims.length){ clearInterval(pollId); pollId = 0; } }

  // ¿Hay algo reproduciéndose ahora mismo? (cinemática de habilidad, FX…)
  function busy(){
    try{
      if(typeof window.__bfCinematicBusy === 'function' && window.__bfCinematicBusy()) return true;
      var ctx = window.__bfActionCtx;
      if(ctx && ctx.ts && (Date.now() - ctx.ts) < 1200 && lastCineSeen < ctx.ts) return true;
      if(document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov')) return true;
      if(document.body.classList.contains('bf-cine-active')) return true;
      var fx = document.getElementById('bf-fx-layer');
      if(fx && fx.children.length) return true;
      if(document.querySelector('.bf-combat-fx,.bf-fx-projectile,.bf-fx-magic-orb,.bf-cast-flash,.bf-cast-runes')) return true;
      if(typeof window.__bfIndicatorsBusy==='function'&&window.__bfIndicatorsBusy())return true;
      if(document.querySelector('.bf-dmg-pop,.bf-heal-pop,.bf-absorb-pop,.bf-stat-pop,.bf-status-pop,.bf-loss-pop,.bf-fx-float')) return true;
    }catch(e){}
    return false;
  }

  function releaseVictims(victims){
    victims.forEach(function(v){
      if(window.__bfDeathVisHold)delete window.__bfDeathVisHold[v.key];
      var card=document.getElementById('b_'+v.side+'_'+v.id);
      if(card)card.classList.add('bf-truedead');
    });
  }

  // ---- Utilidades para obtener datos del héroe ----
  function heroFromCard(card){
    var parts = String(card.id || '').split('_');
    if(parts.length < 3 || typeof getHero !== 'function') return null;
    try{ return getHero(parts[1], parts.slice(2).join('_')); }catch(e){ return null; }
  }

  // El mapa de cartas contiene el mismo art_url mostrado en batalla. No usar
  // __bfAvatarMap: ese mapa asocia nicks a avatares de jugadores, no héroes.
  function heroArt(side,id){
    var card=document.getElementById('b_'+side+'_'+id);
    var hero=typeof getHero==='function'?getHero(side,id):null;
    var map=window.__bfCardArtMap||{};
    var entry=hero&&(map[hero._token]||map[hero.id]||map[hero.name]||map[String(hero.name||'').toLowerCase()]);
    var official=entry&&(hero.eliteMode?(entry.elite||entry.base):entry.base);
    if(official)return official;
    var portrait=card&&(card.querySelector('.bf-bscene-portrait')||card.querySelector('.bf-battle-art'));
    var bg=portrait&&(portrait.style.backgroundImage||getComputedStyle(portrait).backgroundImage)||'';
    var match=/url\\(["']?([^"')]+)["']?\\)/.exec(bg);
    return match?match[1]:null;
  }

  function showKillCinematic(actor,victims,selfKill){
    releaseVictims(victims);
    var ov=buildScene(document,actor,victims,selfKill,pickDeathQuip,!!window.__bfLangEn);
    (window.__bfAppend||function(n){document.body.appendChild(n);})(ov);
    var readTime=4500+Math.max(0,victims.length-1)*1000;
    setTimeout(function(){ov.classList.add('bf-kill-out');},readTime);
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},readTime+450);
  }

  // ---- Flush: tras el retraso, lanza la cinemática ----
  function flushPending(){
    killTimer = null;
    if(!pendingVictims.length){ stopWatch(); return; }

    var victims = pendingVictims.slice();
    var sources=victims.map(function(v){return v.source;}).filter(Boolean);
    var actor=sources.length===victims.length && sources.every(function(s){return !s.self && s.side===sources[0].side && s.id===sources[0].id;}) ? {side:sources[0].side,id:sources[0].id,kind:sources[0].kind} : (sources.length?null:pendingActor);
    var sides=victims.map(function(v){return v.side;}).filter(Boolean);
    if(!actor || !actor.side || !actor.id || !sides.length || sides.some(function(s){return s===actor.side;})) actor=null;
    if(actor){
      var ah=typeof getHero==='function' ? getHero(actor.side,actor.id) : null;
      if(!ah)actor=null;
      else { actor.name=ah.name;actor.art=heroArt(actor.side,actor.id); }
    }
    var seen = {};
    victims = victims.filter(function(v){
      if(!v.id) return true;
      if(seen[v.key]) return false;
      seen[v.key] = true;
      return true;
    });
    // Sin ejecutor rival verificado, muestra el gag de autogolpe/daño pasivo.
    var selfKill = !actor;
    pendingVictims = [];
    pendingActor = null;
    if(!victims.length){ stopWatch(); return; }

    // Keep the death pending while waiting for damage indicators, so the
    // next turn cannot slip into the gap before the death overlay mounts.
    resolvingKills++;
    function proceed(){
      if(busy()){
        setTimeout(proceed, 80);
        return;
      }
      resolvingKills--;
      showKillCinematic(actor, victims, selfKill);
      if(typeof B!=='undefined' && B && B.over && window.__bfFinalBlow)window.__bfKillFinalShown=window.__bfFinalBlow.ts;
      stopWatch();
    }
    proceed();
  }

  // ---- Hook de bfKillCinematic ----
  function install(){
    var orig = window.bfKillCinematic;
    if(typeof orig !== 'function' || orig.__bfQueued) return false;
    var wrapped = function(card, confirmedDeath, source){
      if(!card) return;

      // Recoge la víctima (sin duplicar: si el mismo héroe ya está en la
      // lista de víctimas pendientes, no se añade otra vez)
      var vHero = heroFromCard(card);
      var parts = String(card.id || '').split('_'), side = parts[1] || '';
      var vArt = heroArt(side,vHero ? vHero.id : parts.slice(2).join('_'));
      var vId = vHero ? vHero.id : ('dom_' + (card.id || ''));
      var key = side + '_' + vId;
      if(vHero && vHero.alive && !confirmedDeath) return;
      if(claimedDeaths[key]) return;
      claimedDeaths[key] = { side: side, id: vId };
      var dup = pendingVictims.some(function(p){ return p.key === key; });
      if(!dup){
        pendingVictims.push({
          id: vId, side: side, key: key,
          name: vHero ? vHero.name : '',
          clan: vHero ? vHero.clan || (vHero._token ? 'Bizarros' : '') : '',
          art: vArt, source: source || null
        });
      }

      // Anota el atacante
      var ka = window.__bfKillActor;
      if(source && !source.self && source.side !== side){
        pendingActor={side:source.side,id:source.id,ts:source.ts};
      }else if(!source && ka && ka.victim === vId && ka.side && ka.side !== side && Date.now() - ka.ts < 2000){
        pendingActor = { side: ka.side, id: ka.id, ts: ka.ts, kind:ka.kind };
      }
      // MULTIPLAYER (cliente): si __bfKillActor no se fijó (dealDamage no
      // corre en el invitado), deduce el atacante del turno activo. Es el
      // respaldo si bfKillCinematic se llama antes que flushFx.
      if(!source && !pendingActor && typeof NET!=='undefined' && NET && NET.role==='client'){
        var fbActor = null;
        try{
          if(typeof B !== 'undefined' && B && B.current){
            fbActor = { side: B.current.side, id: B.current.id, ts: Date.now() };
          }
          if(!fbActor){
            var ac = document.querySelector('.bhero.active-turn');
            if(ac && ac.id){
              var m = /^b_([po])_(.+)$/.exec(ac.id);
              if(m) fbActor = { side: m[1], id: m[2], ts: Date.now() };
            }
          }
          // Solo si el atacante no es la propia víctima
          if(fbActor && fbActor.side && fbActor.side !== side){
            pendingActor = fbActor;
          }
        }catch(e){}
      }

      startWatch();

      // Si no hay timer, arranca el retraso
      if(!killTimer){
        var ctx = window.__bfActionCtx;
        var delay = 300; // agrupa todas las bajas de la misma acción
        // Habilidades, hechizos y objetos pueden causar varias bajas a la vez;
        // deja una ventana breve para agruparlas y luego espera los FX.
        if(ctx && (ctx.kind === 'useAbility' || ctx.kind === 'castSpell' || ctx.kind === 'useItem') && Date.now() - ctx.ts < 6000){
          delay = 450;
        }
        killTimer = setTimeout(flushPending, delay);
      }
    };
    wrapped.__bfQueued = 1;
    window.bfKillCinematic = wrapped;
    return true;
  }

  var tries = 0, t = setInterval(function(){ if(install() || tries++ > 200) clearInterval(t); }, 150);
  install();

  // ---- Supresión de la cinemática original del juego ----
  // El juego tiene su propia cinemática de golpe mortal que crea elementos
  // con id="bf-kill-ov" (u otros overlays de muerte). Como no podemos evitar
  // que se ejecute (la llama por referencia interno), los eliminamos del DOM
  // inmediatamente. Nuestra cinemática lleva data-bf-new="1" y no se toca.
  setInterval(function(){
    refreshDeaths();
    document.querySelectorAll('[id="bf-kill-ov"]').forEach(function(el){
      if(el.dataset.bfNew !== '1') el.remove();
    });
    // También elimina overlays de muerte residuales del juego original
    var old = document.querySelector('.bf-kill-cine,.bf-death-cine,.bf-mortal-cine');
    if(old) old.remove();
  }, 100);
})();
</script>
`;