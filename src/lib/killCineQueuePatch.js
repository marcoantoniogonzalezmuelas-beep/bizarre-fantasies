// La cinemática de GOLPE MORTAL nunca debe solaparse con la animación 3D de la
// habilidad del héroe. Además, se sustituye la cinemática original del juego
// (demasiado rápida y que distorsiona la pantalla en tablet) por una nueva
// bizarra y humorística: el héroe atacante aparece en grande a la izquierda,
// los objetivo/s eliminado/s a la derecha con ojos de X, estrellitas y un
// fantasma que se eleva, y un cartel "¡ELIMINADO!" / "¡ANIQUILADO!".
//
// RETRASO: cuando la muerte la causa una habilidad (useAbility), la cinemática
// de golpe mortal se retrasa 5 s (la duración exacta de la animación 3D de la
// habilidad). Así nunca se solapan. Para kills de ataque normal, se mantiene
// el comportamiento anterior (espera corta + sondeo de escena ocupada).
//
// MULTI-KILL: si una habilidad mata a varios rivales a la vez, se recogen
// todas las víctimas durante la ventana de retraso y se muestran juntas en
// una sola cinemática.
export const KILL_CINE_QUEUE_PATCH = `
<script>
(function(){
  if(window.__bfKillCineQueue) return;
  window.__bfKillCineQueue = true;

  // ---- CSS de la nueva cinemática bizarra ----
  var css = [
    '#bf-kill-ov{position:fixed;inset:0;z-index:100006;pointer-events:none;overflow:hidden;animation:bfKillFade .35s ease-out}',
    '@keyframes bfKillFade{from{opacity:0}to{opacity:1}}',
    '#bf-kill-ov.bf-kill-out{transition:opacity .5s;opacity:0}',
    '#bf-kill-ov .bf-kill-bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(20,5,5,.72),rgba(6,2,2,.92))}',
    // Atacante: retrato grande a la izquierda, con brillo dorado victorioso
    '#bf-kill-ov .bf-kill-att{position:absolute;left:6%;top:50%;transform:translateY(-50%);width:min(34vw,280px);height:min(46vw,380px);border-radius:16px;overflow:hidden;border:3px solid #ffd24a;box-shadow:0 0 28px rgba(255,210,74,.55),0 10px 28px rgba(0,0,0,.7);background-size:cover;background-position:center 10%;background-color:#0a0710;animation:bfKillAtt .6s cubic-bezier(.2,.8,.3,1) both}',
    '@keyframes bfKillAtt{0%{opacity:0;transform:translateY(-50%) translateX(-50px) scale(.75)}100%{opacity:1;transform:translateY(-50%) translateX(0) scale(1)}}',
    '#bf-kill-ov .bf-kill-att::after{content:"";position:absolute;inset:-3px;border-radius:18px;border:2px solid rgba(255,210,74,.45);box-shadow:0 0 18px rgba(255,210,74,.35);animation:bfKillGlow 1.4s ease-in-out infinite;pointer-events:none}',
    '@keyframes bfKillGlow{0%,100%{opacity:.4}50%{opacity:.9}}',
    // Contenedor de víctimas (derecha)
    '#bf-kill-ov .bf-kill-vics{position:absolute;right:6%;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;align-items:flex-end;max-height:80vh}',
    // Cada víctima: retrato más pequeño, inclinado, con ojos de X
    '#bf-kill-ov .bf-kill-vic{position:relative;width:min(26vw,200px);height:min(36vw,300px);border-radius:14px;overflow:hidden;border:3px solid #ff3b30;box-shadow:0 0 22px rgba(255,59,48,.45),0 8px 22px rgba(0,0,0,.7);background-size:cover;background-position:center 10%;background-color:#0a0710;filter:saturate(.35) brightness(.55);animation:bfKillVic .6s cubic-bezier(.2,.8,.3,1) .15s both}',
    '@keyframes bfKillVic{0%{opacity:0;transform:translateX(50px) scale(.75) rotate(0)}100%{opacity:1;transform:translateX(0) scale(1) rotate(-4deg)}}',
    // Ojos de X sobre la víctima
    '#bf-kill-ov .bf-kill-vic::before{content:"\\u274C \\u274C";position:absolute;top:28%;left:50%;transform:translateX(-50%);font-size:clamp(28px,6vw,44px);letter-spacing:8px;filter:drop-shadow(0 0 8px #ff3b30);animation:bfKillX .7s ease-out .3s both;z-index:2}',
    '@keyframes bfKillX{0%{opacity:0;transform:translateX(-50%) scale(.3) rotate(-15deg)}100%{opacity:1;transform:translateX(-50%) scale(1) rotate(0)}}',
    // Estrellitas mareando encima de la víctima
    '#bf-kill-ov .bf-kill-vic .bf-kill-star{position:absolute;top:12%;left:50%;transform:translateX(-50%);font-size:clamp(20px,4vw,28px);animation:bfKillStar 1.4s linear infinite;z-index:3;filter:drop-shadow(0 0 6px #ffd24a)}',
    '@keyframes bfKillStar{from{transform:translateX(-50%) rotate(0)}to{transform:translateX(-50%) rotate(360deg)}}',
    // Fantasma elevándose desde la víctima
    '#bf-kill-ov .bf-kill-vic .bf-kill-ghost{position:absolute;bottom:5%;left:50%;font-size:clamp(32px,7vw,48px);opacity:0;animation:bfKillGhost 2.2s ease-out .6s forwards;z-index:3;filter:drop-shadow(0 0 10px rgba(200,220,255,.6))}',
    '@keyframes bfKillGhost{0%{opacity:0;transform:translateX(-50%) translateY(20px) scale(.6)}15%{opacity:.85}80%{opacity:.5}100%{opacity:0;transform:translateX(-50%) translateY(-100px) scale(1.1)}}',
    // Cartel KO / ELIMINADO
    '#bf-kill-ov .bf-kill-ko{position:absolute;top:10%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(36px,9vw,72px);color:#ff3b30;text-shadow:0 0 28px rgba(255,59,48,.9),0 0 56px rgba(255,59,48,.35),0 4px 10px #000;letter-spacing:5px;white-space:nowrap;animation:bfKillKo .6s cubic-bezier(.2,.8,.3,1) .3s both;z-index:5}',
    '@keyframes bfKillKo{0%{opacity:0;transform:translateX(-50%) scale(2.2)}100%{opacity:1;transform:translateX(-50%) scale(1)}}',
    // Nombre del atacante (abajo izquierda)
    '#bf-kill-ov .bf-kill-aname{position:absolute;bottom:8%;left:6%;font-family:Cinzel,serif;font-weight:900;font-size:clamp(13px,3vw,20px);color:#ffd24a;text-shadow:0 2px 8px #000,0 0 14px rgba(255,210,74,.5);text-align:left;max-width:40vw;animation:bfKillFade .5s ease-out .4s both;z-index:5}',
    // Nombre de víctimas (abajo derecha)
    '#bf-kill-ov .bf-kill-vname{position:absolute;bottom:8%;right:6%;font-family:Cinzel,serif;font-weight:900;font-size:clamp(13px,3vw,20px);color:#ff8a8a;text-shadow:0 2px 8px #000,0 0 14px rgba(255,59,48,.5);text-align:right;max-width:40vw;animation:bfKillFade .5s ease-out .4s both;z-index:5}',
    // Tablet/móvil: todo más pequeño, sin desbordar
    '@media(max-width:880px){#bf-kill-ov .bf-kill-att{left:3%;width:min(38vw,180px);height:min(52vw,260px)}#bf-kill-ov .bf-kill-vics{right:3%;gap:6px}#bf-kill-ov .bf-kill-vic{width:min(28vw,130px);height:min(38vw,180px)}#bf-kill-ov .bf-kill-ko{font-size:clamp(28px,11vw,52px);top:8%}#bf-kill-ov .bf-kill-aname{left:3%;font-size:clamp(11px,2.8vw,16px)}#bf-kill-ov .bf-kill-vname{right:3%;font-size:clamp(11px,2.8vw,16px)}}'
  ].join('\\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ---- Estado de la cola de kills ----
  var pendingVictims = [];
  var pendingActor = null;
  var killTimer = null;
  var lastCineSeen = 0, pollId = 0;

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
      if(ctx && ctx.ts && (Date.now() - ctx.ts) < 2500 && lastCineSeen < ctx.ts) return true;
      if(document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov')) return true;
      if(document.body.classList.contains('bf-cine-active')) return true;
      var fx = document.getElementById('bf-fx-layer');
      if(fx && fx.children.length) return true;
      if(document.querySelector('.bf-combat-fx,.bf-fx-projectile,.bf-fx-magic-orb,.bf-cast-flash,.bf-cast-runes')) return true;
      if(window.__bfDmgPending > 0) return true;
      if(document.querySelector('.bf-dmg-pop,.bf-heal-pop,.bf-absorb-pop,.bf-stat-pop,.bf-status-pop,.bf-loss-pop,.bf-fx-float')) return true;
    }catch(e){}
    return false;
  }

  // ---- Utilidades para obtener datos del héroe ----
  function heroFromCard(card){
    var parts = String(card.id || '').split('_');
    if(parts.length < 3 || typeof getHero !== 'function') return null;
    try{ return getHero(parts[1], parts.slice(2).join('_')); }catch(e){ return null; }
  }

  function artFromCard(card){
    try{
      var art = card.querySelector('.bf-battle-art');
      if(art){
        var bg = art.style.backgroundImage || getComputedStyle(art).backgroundImage;
        var m = /url\\(["']?([^"')]+)["']?\\)/.exec(bg);
        if(m) return m[1];
      }
    }catch(e){}
    return null;
  }

  function attackerArt(actor){
    try{
      if(!actor) return null;
      var card = document.getElementById('b_' + actor.side + '_' + actor.id);
      if(card) return artFromCard(card);
    }catch(e){}
    return null;
  }

  // ---- Nueva cinemática bizarra ----
  function showKillCinematic(actor, victims){
    var ov = document.createElement('div');
    ov.id = 'bf-kill-ov';

    var bg = document.createElement('div');
    bg.className = 'bf-kill-bg';
    ov.appendChild(bg);

    // Atacante
    var attArt = attackerArt(actor);
    var attName = '';
    try{
      if(actor && typeof getHero === 'function'){
        var ah = getHero(actor.side, actor.id);
        if(ah) attName = ah.name || '';
      }
    }catch(e){}

    if(attArt){
      var att = document.createElement('div');
      att.className = 'bf-kill-att';
      att.style.backgroundImage = 'url("' + attArt + '")';
      ov.appendChild(att);
    }
    if(attName){
      var aname = document.createElement('div');
      aname.className = 'bf-kill-aname';
      aname.textContent = attName;
      ov.appendChild(aname);
    }

    // Víctimas
    var vicWrap = document.createElement('div');
    vicWrap.className = 'bf-kill-vics';
    victims.forEach(function(v){
      var vic = document.createElement('div');
      vic.className = 'bf-kill-vic';
      if(v.art) vic.style.backgroundImage = 'url("' + v.art + '")';
      var star = document.createElement('div');
      star.className = 'bf-kill-star';
      star.textContent = '\\u2b50\\u2b50\\u2b50';
      vic.appendChild(star);
      var ghost = document.createElement('div');
      ghost.className = 'bf-kill-ghost';
      ghost.textContent = '\\ud83d\\udc7b';
      vic.appendChild(ghost);
      vicWrap.appendChild(vic);
    });
    ov.appendChild(vicWrap);

    // Cartel KO
    var ko = document.createElement('div');
    ko.className = 'bf-kill-ko';
    ko.textContent = victims.length > 1 ? '\\u00a1ANIQUILADO!' : '\\u00a1ELIMINADO!';
    ov.appendChild(ko);

    // Nombres de víctimas
    var vnames = victims.map(function(v){ return v.name; }).filter(Boolean).join(' \\u00b7 ');
    if(vnames){
      var vname = document.createElement('div');
      vname.className = 'bf-kill-vname';
      vname.textContent = vnames;
      ov.appendChild(vname);
    }

    (window.__bfAppend || function(n){ document.body.appendChild(n); })(ov);

    // Duración lenta (3,5 s) para que se vea bien sin prisa
    setTimeout(function(){ ov.classList.add('bf-kill-out'); }, 3000);
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 3600);
  }

  // ---- Flush: tras el retraso, lanza la cinemática ----
  function flushPending(){
    killTimer = null;
    if(!pendingVictims.length){ stopWatch(); return; }
    var actor = pendingActor;
    var victims = pendingVictims.slice();
    pendingVictims = [];
    pendingActor = null;

    // Pequeño margen: si la escena sigue ocupada, espera un poco más
    function proceed(){
      if(busy()){
        setTimeout(proceed, 200);
        return;
      }
      setTimeout(function(){
        if(busy()){ setTimeout(proceed, 200); return; }
        showKillCinematic(actor, victims);
        stopWatch();
      }, 260);
    }
    proceed();
  }

  // ---- Hook de bfKillCinematic ----
  function install(){
    var orig = window.bfKillCinematic;
    if(typeof orig !== 'function' || orig.__bfQueued) return false;
    var wrapped = function(card){
      if(!card) return;

      // Recoge la víctima
      var vHero = heroFromCard(card);
      var vArt = artFromCard(card);
      pendingVictims.push({
        id: vHero ? vHero.id : '',
        name: vHero ? vHero.name : '',
        art: vArt
      });

      // Anota el atacante
      var ka = window.__bfKillActor;
      if(ka && Date.now() - ka.ts < 6000){
        if(!pendingActor) pendingActor = { side: ka.side, id: ka.id, ts: ka.ts };
      }

      startWatch();

      // Si no hay timer, arranca el retraso
      if(!killTimer){
        var ctx = window.__bfActionCtx;
        var delay = 900; // kill de ataque normal: espera corta
        // Kill por habilidad/hechizo/objeto: retrasa 5 s (duración de la
        // animación 3D de la habilidad) para que NUNCA se solapen.
        if(ctx && (ctx.kind === 'useAbility' || ctx.kind === 'castSpell' || ctx.kind === 'useItem') && Date.now() - ctx.ts < 6000){
          delay = 5000;
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
})();
</script>
`;