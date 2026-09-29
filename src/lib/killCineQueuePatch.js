// El golpe mortal usa un único retrato oficial del héroe caído, el mismo
// que en su carta y en el tablero. Su marco y destello son efectos de la
// escena, no elementos dibujados sobre la cara.
//
// RETRASO: cuando la muerte la causa una habilidad (useAbility), la cinemática
// de golpe mortal se retrasa 5 s (la duración exacta de la animación 3D de la
// habilidad). Así nunca se solapan. Para kills de ataque normal, se mantiene
// el comportamiento anterior (espera corta + sondeo de escena ocupada).
//
// FIN DE PARTIDA: el último héroe no repite la animación de golpe mortal.
// La acción definitiva se muestra una sola vez en el cierre de la partida.
//
// MULTI-KILL: si una habilidad mata a varios rivales a la vez, se recogen
// todas las víctimas durante la ventana de retraso pero solo se muestra la
// ÚLTIMA en la cinemática (con texto "¡ANIQUILADO!" si hubo varias).
import { createDeathQuipPicker } from '@/lib/deathQuips';

export const KILL_CINE_QUEUE_PATCH = `
<script>
(function(){
  if(window.__bfKillCineQueue) return;
  window.__bfKillCineQueue = true;
  var pickDeathQuip=(${createDeathQuipPicker.toString()})();

  // El retrato permanece despejado: marco, halo y ondas viven fuera de la cara.
  var st = document.createElement('style');
  st.textContent = [
    '#bf-kill-ov{position:fixed;inset:0;z-index:100006;pointer-events:none;overflow:hidden;isolation:isolate;color:#fff4dc;font-family:Cinzel,serif;animation:bfKillIn .35s ease-out}',
    '@keyframes bfKillIn{from{opacity:0}to{opacity:1}}',
    '#bf-kill-ov.bf-kill-out{transition:opacity .5s;opacity:0}',
    '#bf-kill-ov .bf-kill-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#392345 0%,#110d20 57%,#05040b 100%)}',
    '#bf-kill-ov .bf-kill-bg::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(125deg,transparent 0 56px,rgba(239,190,112,.035) 57px 58px,transparent 59px 116px)}',
    '#bf-kill-ov .bf-kill-title{position:absolute;top:5%;left:0;width:100%;text-align:center;color:#f6d58a;letter-spacing:.23em;font-size:clamp(18px,3vw,32px);font-weight:800;text-shadow:0 2px 12px #000,0 0 26px #ad6a41;z-index:4}',
    '#bf-kill-ov .bf-kill-stage{position:absolute;left:50%;top:43%;transform:translate(-50%,-50%);width:min(42vw,340px);height:min(54vh,440px);display:grid;place-items:center;z-index:2}',
    '#bf-kill-ov .bf-kill-stage::before{content:"";position:absolute;inset:-22px;border:1px solid rgba(246,213,138,.55);border-radius:28px;box-shadow:0 0 0 12px rgba(246,213,138,.04),0 0 55px rgba(237,159,86,.35);animation:bfKillRing 1.5s ease-out both}',
    '@keyframes bfKillRing{from{opacity:0;transform:scale(.82)}to{opacity:1;transform:scale(1)}}',
    '#bf-kill-ov .bf-kill-stage::after{content:"";position:absolute;inset:-9px;border:2px solid #f5c777;border-radius:23px;box-shadow:0 0 22px rgba(245,199,119,.7),inset 0 0 16px rgba(245,199,119,.35);pointer-events:none}',
    '#bf-kill-ov .bf-kill-vic{position:relative;width:100%;height:100%;border-radius:16px;background-color:#161020;background-size:cover;background-position:center 8%;box-shadow:0 20px 60px #000c;animation:bfKillPortrait .65s cubic-bezier(.2,.8,.3,1) both}',
    '@keyframes bfKillPortrait{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:scale(1)}}',
    '#bf-kill-ov .bf-kill-vic::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,transparent 68%,rgba(12,6,23,.48));pointer-events:none}',
    '#bf-kill-ov .bf-kill-vname{position:absolute;left:8%;right:8%;top:calc(43% + min(27vh,220px) + 20px);text-align:center;font-size:clamp(17px,2.8vw,29px);font-weight:800;color:#ffe5b1;text-shadow:0 3px 10px #000;z-index:3}',
    '#bf-kill-ov .bf-kill-ko{position:absolute;bottom:4%;left:50%;transform:translateX(-50%);width:min(86vw,760px);max-height:24vh;overflow:auto;box-sizing:border-box;padding:12px 20px;border:1px solid rgba(246,213,138,.55);border-radius:16px;background:rgba(17,11,29,.94);text-align:center;font:600 clamp(14px,2vw,22px)/1.35 Rubik,sans-serif;color:#fff4dc;box-shadow:0 12px 32px #0009;z-index:4}',
    '#bf-kill-ov .bf-kill-speaker{display:block;font-size:.65em;color:#f6d58a;letter-spacing:.12em;margin-bottom:4px}',
    '#bf-kill-ov .bf-kill-line+.bf-kill-line{margin-top:9px}',
    '@media(max-width:880px){#bf-kill-ov .bf-kill-title{top:3%;font-size:clamp(14px,3vw,22px)}#bf-kill-ov .bf-kill-stage{top:38%;width:min(38vw,230px);height:min(48vh,290px)}#bf-kill-ov .bf-kill-vname{top:calc(38% + min(24vh,145px) + 12px)}#bf-kill-ov .bf-kill-ko{bottom:2%;padding:8px 12px;max-height:25vh}}',
    '@media(prefers-reduced-motion:reduce){#bf-kill-ov,#bf-kill-ov *{animation:none!important}}'
  ].join('');
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

  // El cierre puede aún no haber activado B.over cuando se vacía la cola:
  // detectar si murió el último héroe real del bando de la víctima.
  function finalKill(victims){
    try{
      if(typeof G==='undefined'||!G||!G.team) return false;
      return victims.some(function(v){
        var team=G.team[v.side];
        return team && team.length && team.every(function(h){return !h || !h.alive || h._bfDuck;});
      });
    }catch(e){return false;}
  }
  function releaseVictims(victims){
    victims.forEach(function(v){
      if(window.__bfDeathVisHold)delete window.__bfDeathVisHold[v.key];
      var card=document.getElementById('b_'+v.side+'_'+v.id);
      if(card)card.classList.add('bf-truedead');
    });
  }
  // Si el resultado ya está en pantalla, no superponer un remate tardío.
  function gameEnded(){
    try{
      // La animación definitiva ya está en pantalla.
      if(document.querySelector('#bf-final-blow,.bf-final-blow,.bf-game-over,.bf-end-cine')) return true;
      // El juego muestra el panel de fin de partida
      if(document.querySelector('#s-gameover,#gameover,.bf-end-screen')) return true;
    }catch(e){}
    return false;
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

  // Un único retrato del caído; los otros nombres quedan en la cita si hay varias bajas.
  function showKillCinematic(actor, victims, selfKill){
    releaseVictims(victims);
    var victim=victims[victims.length-1];
    var ov=document.createElement('div');
    ov.id='bf-kill-ov';
    ov.dataset.bfNew='1';
    var bg=document.createElement('div');bg.className='bf-kill-bg';ov.appendChild(bg);
    var title=document.createElement('div');title.className='bf-kill-title';
    title.textContent=selfKill?'¡AUTOGOLPE!':(victims.length>1?'¡ANIQUILADOS!':'¡GOLPE MORTAL!');ov.appendChild(title);
    var stage=document.createElement('div');stage.className='bf-kill-stage';
    var portrait=document.createElement('div');portrait.className='bf-kill-vic';
    var art=victim.art||heroArt(victim.side,victim.id);
    if(art)portrait.style.backgroundImage='url("'+art+'")';
    stage.appendChild(portrait);ov.appendChild(stage);
    var name=document.createElement('div');name.className='bf-kill-vname';
    name.textContent=victim.name||'';ov.appendChild(name);
    var ko=document.createElement('div');ko.className='bf-kill-ko';
    victims.forEach(function(v){
      var line=document.createElement('div');line.className='bf-kill-line';
      var speaker=document.createElement('span');speaker.className='bf-kill-speaker';
      speaker.textContent=[v.name,v.clan].filter(Boolean).join(' · ');
      var quote=document.createElement('span');quote.textContent='«'+pickDeathQuip(v.clan,!!window.__bfLangEn,selfKill?'self':'')+'»';
      line.appendChild(speaker);line.appendChild(quote);ko.appendChild(line);
    });
    ov.appendChild(ko);
    (window.__bfAppend||function(n){document.body.appendChild(n);})(ov);
    var readTime=4500+Math.max(0,victims.length-1)*1600;
    setTimeout(function(){ov.classList.add('bf-kill-out');},readTime);
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},readTime+600);
  }

  // ---- Flush: tras el retraso, lanza la cinemática ----
  function flushPending(){
    killTimer = null;
    if(!pendingVictims.length){ stopWatch(); return; }

    // El último remate pertenece al cierre de partida: no duplicar su escena.
    if(finalKill(pendingVictims)||gameEnded()){
      releaseVictims(pendingVictims);
      pendingVictims = [];
      pendingActor = null;
      stopWatch();
      return;
    }

    var victims = pendingVictims.slice();
    var sources=victims.map(function(v){return v.source;}).filter(Boolean);
    var actor=sources.length===victims.length && sources.every(function(s){return s.side!==victims[0].side && s.side===sources[0].side && s.id===sources[0].id;}) ? {side:sources[0].side,id:sources[0].id} : (sources.length?null:pendingActor);
    // El ejecutor debe pertenecer al bando opuesto de TODAS las víctimas.
    // Si el turno avanzó (o hay daño reflejado), no atribuir la muerte a un aliado.
    var sides = victims.map(function(v){return v.side;}).filter(Boolean);
    if(!actor || !actor.side || !sides.length || sides.some(function(s){return s===actor.side;})) actor=null;
    var seen = {};
    victims = victims.filter(function(v){
      if(!v.id) return true;
      if(seen[v.key]) return false;
      seen[v.key] = true;
      return true;
    });
    // Autogolpe: nadie del bando rival remató al héroe (se mató él solo o un
    // aliado). Se muestra la versión humorística del tropezón.
    var selfKill = !actor && victims.length === 1 && !!(victims[0].source && victims[0].source.self && victims[0].source.side === victims[0].side);
    pendingVictims = [];
    pendingActor = null;
    if(!victims.length){ stopWatch(); return; }

    // Keep the death pending while waiting for damage indicators, so the
    // next turn cannot slip into the gap before the death overlay mounts.
    resolvingKills++;
    function proceed(){
      if(finalKill(victims)||gameEnded()){ releaseVictims(victims); resolvingKills--; stopWatch(); return; }
      if(busy()){
        setTimeout(proceed, 80);
        return;
      }
      resolvingKills--;
      showKillCinematic(actor, victims, selfKill);
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
        pendingActor = { side: ka.side, id: ka.id, ts: ka.ts };
      }
      // MULTIPLAYER (cliente): si __bfKillActor no se fijó (dealDamage no
      // corre en el invitado), deduce el atacante del turno activo. Es el
      // respaldo si bfKillCinematic se llama antes que flushFx.
      if(!source && !pendingActor){
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
        var delay = 120; // kill de ataque normal: casi inmediato
        // Kill por habilidad/hechizo/objeto: retrasa 3.5 s (duración de la
        // animación 3D de la habilidad) para que NUNCA se solapen.
        if(ctx && (ctx.kind === 'useAbility' || ctx.kind === 'castSpell' || ctx.kind === 'useItem') && Date.now() - ctx.ts < 6000){
          delay = 350; // busy() ya espera a que termine la animación 3D si la hay
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