// Cola de remates: recopila todas las bajas de una acción y espera a que
// concluyan sus efectos antes de mostrar el nuevo reparto humorístico.
import { createDeathQuipPicker } from '@/lib/deathQuips';


export const KILL_CINE_QUEUE_PATCH = `
<script>
(function(){
  if(window.__bfKillCineQueue) return;
  window.__bfKillCineQueue = true;
  var pickDeathQuip=(${createDeathQuipPicker.toString()})();
  var css = [
    '#bf-kill-ov{position:fixed;inset:0;z-index:100006;pointer-events:none;overflow:hidden;animation:bfKqFade .35s ease-out}',
    '@keyframes bfKqFade{from{opacity:0}to{opacity:1}}',
    '#bf-kill-ov.bf-kill-out{transition:opacity .5s;opacity:0}',
    '#bf-kill-ov .bf-kill-bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(20,5,5,.72),rgba(6,2,2,.92))}',
    '#bf-kill-ov .bf-kill-att{position:absolute;left:4%;top:50%;transform:translateY(-50%);width:min(44vw,420px);height:min(62vw,560px);border-radius:20px;overflow:hidden;border:4px solid #ffd24a;box-shadow:0 0 40px rgba(255,210,74,.6),0 12px 36px rgba(0,0,0,.75);background-size:cover;background-position:center 8%;background-color:#0a0710;animation:bfKillAtt .7s cubic-bezier(.2,.8,.3,1) both}',
    '@keyframes bfKillAtt{0%{opacity:0;transform:translateY(-50%) translateX(-80px) scale(.7) rotate(-8deg)}60%{transform:translateY(-50%) translateX(10px) scale(1.05) rotate(2deg)}100%{opacity:1;transform:translateY(-50%) translateX(0) scale(1) rotate(0)}}',
    '#bf-kill-ov .bf-kill-att-cool{position:absolute;top:2%;right:2%;font-size:clamp(40px,8vw,64px);z-index:6;animation:bfKillCool .6s ease-out .5s both,bfKillCoolBob 2s ease-in-out 1s infinite;filter:drop-shadow(0 0 12px rgba(255,210,74,.8))}',
    '@keyframes bfKillCool{0%{opacity:0;transform:scale(0) rotate(-180deg)}100%{opacity:1;transform:scale(1) rotate(0)}}',
    '@keyframes bfKillCoolBob{0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(-8px) rotate(8deg)}}',
    '#bf-kill-ov .bf-kill-vics{position:absolute;right:4%;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:12px;align-items:flex-end;max-height:88vh}',
    '#bf-kill-ov .bf-kill-vic{position:relative;width:min(38vw,360px);height:min(54vw,480px);border-radius:18px;overflow:hidden;border:4px solid #ff3b30;box-shadow:0 0 34px rgba(255,59,48,.5),0 10px 28px rgba(0,0,0,.75);background-size:cover;background-position:center 8%;background-color:#0a0710;filter:saturate(.3) brightness(.6);animation:bfKillVic .7s cubic-bezier(.2,.8,.3,1) .15s both}',
    '@keyframes bfKillVic{0%{opacity:0;transform:translateX(80px) scale(.7) rotate(8deg)}60%{transform:translateX(-10px) scale(1.05) rotate(-6deg)}100%{opacity:1;transform:translateX(0) scale(1) rotate(-6deg)}}',
    '#bf-kill-ov .bf-kill-star{position:absolute;top:8%;left:50%;transform:translateX(-50%);font-size:clamp(24px,5vw,36px);animation:bfKillStar 1.4s linear infinite;z-index:3;filter:drop-shadow(0 0 8px #ffd24a)}',
    '@keyframes bfKillStar{from{transform:translateX(-50%) rotate(0)}to{transform:translateX(-50%) rotate(360deg)}}',
    '#bf-kill-ov .bf-kill-pow{position:absolute;top:36%;left:50%;transform:translate(-50%,-50%);z-index:7;animation:bfKillPow .5s cubic-bezier(.2,.8,.3,1) .4s both}',
    '@keyframes bfKillPow{0%{opacity:0;transform:translate(-50%,-50%) scale(0) rotate(-20deg)}60%{transform:translate(-50%,-50%) scale(1.3) rotate(8deg)}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-5deg)}}',
    '#bf-kill-ov .bf-kill-pow-txt{font-family:Cinzel,serif;font-weight:1000;font-size:clamp(40px,10vw,80px);color:#ffd24a;text-shadow:0 0 24px rgba(255,210,74,.9),0 0 48px rgba(255,180,40,.5),0 5px 0 #b8860b,0 6px 12px #000;letter-spacing:3px;transform:rotate(-8deg);white-space:nowrap}',
    '#bf-kill-ov .bf-kill-ko{position:absolute;bottom:10%;left:50%;transform:translateX(-50%);width:min(86vw,760px);box-sizing:border-box;padding:14px 22px;background:#160d1f;border:2px solid #e6b86b;border-radius:18px;font:700 clamp(19px,3vw,28px)/1.35 Rubik,sans-serif;color:#fff4dc;text-shadow:0 2px 3px #000;text-align:center;box-shadow:0 12px 40px #0009;z-index:8;animation:bfKillKo .6s cubic-bezier(.2,.8,.3,1) .3s both}',
    '@keyframes bfKillKo{0%{opacity:0;transform:translateX(-50%) scale(1.6)}100%{opacity:1;transform:translateX(-50%) scale(1)}}',
    '#bf-kill-ov .bf-kill-speaker{display:block;font-size:.55em;color:#ffce88;margin-bottom:5px;letter-spacing:1px}',
    '#bf-kill-ov .bf-kill-line+.bf-kill-line{margin-top:12px}',
    '#bf-kill-ov .bf-kill-aname{position:absolute;bottom:2%;left:4%;font-family:Cinzel,serif;font-weight:900;font-size:clamp(14px,3.5vw,24px);color:#ffd24a;text-shadow:0 2px 8px #000;max-width:44vw;z-index:5}',
    '#bf-kill-ov .bf-kill-vname{position:absolute;bottom:2%;right:4%;font-family:Cinzel,serif;font-weight:900;font-size:clamp(14px,3.5vw,24px);color:#ff8a8a;text-shadow:0 2px 8px #000;text-align:right;max-width:44vw;z-index:5}',
    '#bf-kill-ov .bf-kill-vics:has(.bf-kill-vic:nth-child(2)) .bf-kill-vic{width:min(30vw,280px);height:min(42vw,380px)}',
    '#bf-kill-ov .bf-kill-vics:has(.bf-kill-vic:nth-child(3)) .bf-kill-vic{width:min(24vw,220px);height:min(34vw,300px)}',
    '#bf-kill-ov.bf-kill-multi .bf-kill-vics{flex-direction:row;flex-wrap:nowrap;align-items:center;gap:0;max-width:56vw}',
    '#bf-kill-ov.bf-kill-multi .bf-kill-vic{flex:0 1 auto;margin-left:-4%;width:min(20vw,200px)!important;height:min(30vw,300px)!important}',
    '#bf-kill-ov.bf-kill-multi .bf-kill-vic:first-child{margin-left:0}',
    '#bf-kill-ov.bf-kill-self .bf-kill-vics{right:auto;left:50%;transform:translate(-50%,-50%)}',
    '#bf-kill-ov.bf-kill-self .bf-kill-vic{width:min(52vw,340px);height:min(72vw,460px);animation:bfKillSlip 1.5s cubic-bezier(.3,.7,.4,1) .2s both}',
    '@keyframes bfKillSlip{0%{opacity:0;transform:translateX(-120px) rotate(0)}35%{opacity:1;transform:translateX(0) rotate(0)}55%{transform:translateY(-40px) rotate(-25deg)}80%{transform:translateY(10px) rotate(-95deg)}100%{opacity:1;transform:translateY(0) rotate(-88deg)}}',
    '#bf-kill-ov .bf-kill-banana{position:absolute;bottom:6%;left:14%;font-size:clamp(46px,10vw,84px);z-index:6;filter:drop-shadow(0 4px 6px #000);animation:bfKillBanana 1.5s ease-out .2s both}',
    '@keyframes bfKillBanana{0%{opacity:0;transform:translateY(-140px) rotate(0)}30%{opacity:1;transform:translateY(0) rotate(20deg)}100%{opacity:1;transform:translateY(0) rotate(160deg)}}',
    '@media(max-width:880px){#bf-kill-ov .bf-kill-att{left:2%;top:38%;width:min(46vw,240px);height:min(66vw,340px);border-width:3px}#bf-kill-ov .bf-kill-vic{width:min(44vw,220px);height:min(62vw,310px);border-width:3px}#bf-kill-ov .bf-kill-vics{right:2%;top:38%;gap:8px}#bf-kill-ov .bf-kill-pow-txt{font-size:clamp(30px,11vw,52px)}#bf-kill-ov .bf-kill-ko{bottom:5%;width:94vw;padding:10px 14px;font-size:clamp(17px,4.6vw,22px)}#bf-kill-ov .bf-kill-aname,#bf-kill-ov .bf-kill-vname{bottom:26%;font-size:clamp(11px,3vw,15px)}}'
  ].join('\\n');
  var st=document.createElement('style');
  st.textContent=css;
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
  // Partida nueva: se descarta lo que la anterior dejó en cola (si no, el golpe mortal de la
  // partida vieja se reproducía en la nueva) y se libera el registro de muertes.
  if(window.bfOnMatchReset)window.bfOnMatchReset(function(){
    if(killTimer){clearTimeout(killTimer);killTimer=null;}
    pendingVictims=[];pendingActor=null;resolvingKills=0;claimedDeaths=Object.create(null);wasInBattle=false;
    if(pollId){clearInterval(pollId);pollId=0;}
  });

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
    var multi=victims.length>1;
    var ov=document.createElement('div');
    ov.id='bf-kill-ov';ov.dataset.bfNew='1';
    if(multi)ov.classList.add('bf-kill-multi');
    if(selfKill)ov.classList.add('bf-kill-self');
    var bg=document.createElement('div');bg.className='bf-kill-bg';ov.appendChild(bg);
    if(actor&&!selfKill){
      if(actor.art){
        var att=document.createElement('div');att.className='bf-kill-att';
        att.style.backgroundImage='url("'+actor.art+'")';
        var cool=document.createElement('div');cool.className='bf-kill-att-cool';cool.textContent='\\ud83d\\ude0e';
        att.appendChild(cool);ov.appendChild(att);
      }
      if(actor.name){var an=document.createElement('div');an.className='bf-kill-aname';an.textContent=actor.name;ov.appendChild(an);}
    }
    var wrap=document.createElement('div');wrap.className='bf-kill-vics';
    victims.forEach(function(v,i){
      var vic=document.createElement('div');vic.className='bf-kill-vic';
      var a=v.art||heroArt(v.side,v.id);
      if(a)vic.style.backgroundImage='url("'+a+'")';
      vic.style.animationDelay=(0.15+i*0.12)+'s';
      if(selfKill){var b=document.createElement('div');b.className='bf-kill-banana';b.textContent='\\ud83c\\udf4c';vic.appendChild(b);}
      var s=document.createElement('div');s.className='bf-kill-star';s.textContent='\\ud83d\\udcab';vic.appendChild(s);
      wrap.appendChild(vic);
    });
    ov.appendChild(wrap);
    var vn=victims.map(function(v){return v.name;}).filter(Boolean).join(' \\u00b7 ');
    if(vn){var vname=document.createElement('div');vname.className='bf-kill-vname';vname.textContent=vn;ov.appendChild(vname);}
    var pow=document.createElement('div');pow.className='bf-kill-pow';
    var pt=document.createElement('div');pt.className='bf-kill-pow-txt';
    pt.textContent=selfKill?'\\u00a1CATAPLUM!':(multi?'\\u00a1ANIQUILADOS!':'\\u00a1POW!');
    pow.appendChild(pt);ov.appendChild(pow);
    var ko=document.createElement('div');ko.className='bf-kill-ko';
    victims.forEach(function(v){
      var line=document.createElement('div');line.className='bf-kill-line';
      var sp=document.createElement('span');sp.className='bf-kill-speaker';
      sp.textContent=[v.name,v.clan].filter(Boolean).join(' \\u00b7 ');
      var q=document.createElement('span');q.textContent='\\u00ab'+pickDeathQuip(v.clan,!!window.__bfLangEn,selfKill?'self':'')+'\\u00bb';
      line.appendChild(sp);line.appendChild(q);ko.appendChild(line);
    });
    ov.appendChild(ko);
    (window.__bfAppend||function(n){document.body.appendChild(n);})(ov);
    var readTime=4500+Math.max(0,victims.length-1)*1000;
    setTimeout(function(){ov.classList.add('bf-kill-out');},readTime);
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},readTime+450);
  }

  // ---- Flush: tras el retraso, lanza la cinemática ----
  function flushPending(){
    killTimer = null;
    if(!pendingVictims.length){ stopWatch(); return; }

    // El último remate de la partida lo cubre la animación definitiva:
    // no se duplica con esta escena.
    var lastDown=false;
    try{
      lastDown=pendingVictims.some(function(v){
        var team=typeof G!=='undefined'&&G&&G.team&&G.team[v.side];
        return team&&team.length&&team.every(function(h){return !h||!h.alive||h._bfDuck;});
      });
    }catch(e){}
    if(lastDown){
      releaseVictims(pendingVictims);
      pendingVictims=[];pendingActor=null;stopWatch();return;
    }
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
    var epochAtStart = window.__bfMatchEpoch|0;
    function proceed(){
      if((window.__bfMatchEpoch|0)!==epochAtStart){ resolvingKills=Math.max(0,resolvingKills-1); return; }
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