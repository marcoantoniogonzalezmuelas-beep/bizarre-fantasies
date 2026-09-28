// La cinemática de GOLPE MORTAL nunca debe solaparse con la animación 3D de la
// habilidad del héroe. Además, se sustituye la cinemática original del juego
// (demasiado rápida y que distorsiona la pantalla en tablet) por una nueva
// bizarra y humorística: el héroe ATACANTE aparece en GRANDE a la izquierda
// con pose victoriosa, y el héroe CAÍDO (solo uno) a la derecha derrotado,
// con lágrimas, estrellitas de mareo y un fantasma que se eleva. Entre ambos
// un estallido cómic "¡POW!/¡BAM!".
//
// RETRASO: cuando la muerte la causa una habilidad (useAbility), la cinemática
// de golpe mortal se retrasa 5 s (la duración exacta de la animación 3D de la
// habilidad). Así nunca se solapan. Para kills de ataque normal, se mantiene
// el comportamiento anterior (espera corta + sondeo de escena ocupada).
//
// FIN DE PARTIDA: si el golpe mortal supone el final de la partida (el juego
// detecta B.over o lanza la animación de golpe definitivo), NO se muestra la
// cinemática de golpe mortal: ya hay suficiente con la animación de fin de
// batalla existente.
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

  // ---- CSS de la nueva cinemática bizarra ----
  var css = [
    '#bf-kill-ov{position:fixed;inset:0;z-index:100006;pointer-events:none;overflow:hidden;animation:bfKillFade .35s ease-out}',
    '@keyframes bfKillFade{from{opacity:0}to{opacity:1}}',
    '#bf-kill-ov.bf-kill-out{transition:opacity .5s;opacity:0}',
    '#bf-kill-ov .bf-kill-bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(20,5,5,.72),rgba(6,2,2,.92))}',
    // Atacante: retrato ENORME a la izquierda, con brillo dorado victorioso
    '#bf-kill-ov .bf-kill-att{position:absolute;left:4%;top:50%;transform:translateY(-50%);width:min(44vw,420px);height:min(62vw,560px);border-radius:20px;overflow:hidden;border:4px solid #ffd24a;box-shadow:0 0 40px rgba(255,210,74,.6),0 12px 36px rgba(0,0,0,.75);background-size:cover;background-position:center 8%;background-color:#0a0710;animation:bfKillAtt .7s cubic-bezier(.2,.8,.3,1) both}',
    '@keyframes bfKillAtt{0%{opacity:0;transform:translateY(-50%) translateX(-80px) scale(.7) rotate(-8deg)}60%{transform:translateY(-50%) translateX(10px) scale(1.05) rotate(2deg)}100%{opacity:1;transform:translateY(-50%) translateX(0) scale(1) rotate(0)}}',
    '#bf-kill-ov .bf-kill-att::after{content:"";position:absolute;inset:-4px;border-radius:22px;border:3px solid rgba(255,210,74,.5);box-shadow:0 0 24px rgba(255,210,74,.4);animation:bfKillGlow 1.4s ease-in-out infinite;pointer-events:none}',
    '@keyframes bfKillGlow{0%,100%{opacity:.4}50%{opacity:.9}}',
    // Emoji 😎 del atacante flotando encima (guay/victorioso)
    '#bf-kill-ov .bf-kill-att-cool{position:absolute;top:-8%;right:-6%;font-size:clamp(40px,8vw,64px);z-index:6;animation:bfKillCool .6s ease-out .5s both,bfKillCoolBob 2s ease-in-out 1s infinite;filter:drop-shadow(0 0 12px rgba(255,210,74,.8))}',
    '@keyframes bfKillCool{0%{opacity:0;transform:scale(0) rotate(-180deg)}100%{opacity:1;transform:scale(1) rotate(0)}}',
    '@keyframes bfKillCoolBob{0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(-8px) rotate(8deg)}}',
    // Contenedor de víctimas (derecha): apila varias si hay multi-kill
    '#bf-kill-ov .bf-kill-vics{position:absolute;right:4%;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:12px;align-items:flex-end;max-height:88vh}',
    // Cada víctima: retrato GRANDE, inclinada, derrotada
    '#bf-kill-ov .bf-kill-vic{position:relative;width:min(38vw,360px);height:min(54vw,480px);border-radius:18px;overflow:hidden;border:4px solid #ff3b30;box-shadow:0 0 34px rgba(255,59,48,.5),0 10px 28px rgba(0,0,0,.75);background-size:cover;background-position:center 8%;background-color:#0a0710;filter:saturate(.3) brightness(.5);animation:bfKillVic .7s cubic-bezier(.2,.8,.3,1) .15s both}',
    '@keyframes bfKillVic{0%{opacity:0;transform:translateX(80px) scale(.7) rotate(8deg)}60%{transform:translateX(-10px) scale(1.05) rotate(-6deg)}100%{opacity:1;transform:translateX(0) scale(1) rotate(-6deg)}}',
    // Lágrimas 💧 cayendo del héroe caído
    '#bf-kill-ov .bf-kill-tears{position:absolute;top:30%;left:50%;transform:translateX(-50%);font-size:clamp(22px,5vw,36px);animation:bfKillTears 1.6s ease-in .5s infinite;z-index:3;filter:drop-shadow(0 0 8px rgba(100,180,255,.7))}',
    '@keyframes bfKillTears{0%{opacity:0;transform:translateX(-50%) translateY(0)}15%{opacity:1}80%{opacity:.7}100%{opacity:0;transform:translateX(-50%) translateY(60px)}}',
    // Estrellitas 💫 de mareo girando encima de la víctima
    '#bf-kill-ov .bf-kill-star{position:absolute;top:8%;left:50%;transform:translateX(-50%);font-size:clamp(24px,5vw,36px);animation:bfKillStar 1.4s linear infinite;z-index:3;filter:drop-shadow(0 0 8px #ffd24a)}',
    '@keyframes bfKillStar{from{transform:translateX(-50%) rotate(0)}to{transform:translateX(-50%) rotate(360deg)}}',
    // Fantasma 👻 elevándose desde la víctima
    '#bf-kill-ov .bf-kill-ghost{position:absolute;bottom:4%;left:50%;font-size:clamp(36px,8vw,56px);opacity:0;animation:bfKillGhost 2.2s ease-out .6s forwards;z-index:3;filter:drop-shadow(0 0 12px rgba(200,220,255,.7))}',
    '@keyframes bfKillGhost{0%{opacity:0;transform:translateX(-50%) translateY(20px) scale(.6)}15%{opacity:.85}80%{opacity:.5}100%{opacity:0;transform:translateX(-50%) translateY(-120px) scale(1.1)}}',
    // Estallido cómic "¡POW!" entre los dos héroes
    '#bf-kill-ov .bf-kill-pow{position:absolute;top:42%;left:50%;transform:translate(-50%,-50%);z-index:7;animation:bfKillPow .5s cubic-bezier(.2,.8,.3,1) .4s both}',
    '@keyframes bfKillPow{0%{opacity:0;transform:translate(-50%,-50%) scale(0) rotate(-20deg)}60%{transform:translate(-50%,-50%) scale(1.3) rotate(8deg)}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-5deg)}}',
    '#bf-kill-ov .bf-kill-pow-txt{font-family:Cinzel,serif;font-weight:1000;font-size:clamp(40px,10vw,80px);color:#ffd24a;text-shadow:0 0 24px rgba(255,210,74,.9),0 0 48px rgba(255,180,40,.5),0 5px 0 #b8860b,0 6px 12px #000;letter-spacing:3px;transform:rotate(-8deg)}',
    // Cartel KO / ELIMINADO (abajo centro)
    '#bf-kill-ov .bf-kill-ko{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(30px,8vw,60px);color:#ff3b30;text-shadow:0 0 28px rgba(255,59,48,.9),0 0 56px rgba(255,59,48,.35),0 4px 10px #000;letter-spacing:5px;white-space:nowrap;animation:bfKillKo .6s cubic-bezier(.2,.8,.3,1) .3s both;z-index:5}',
    '@keyframes bfKillKo{0%{opacity:0;transform:translateX(-50%) scale(2.2)}100%{opacity:1;transform:translateX(-50%) scale(1)}}',
    // Nombre del atacante (abajo izquierda)
    '#bf-kill-ov .bf-kill-aname{position:absolute;bottom:2%;left:4%;font-family:Cinzel,serif;font-weight:900;font-size:clamp(14px,3.5vw,24px);color:#ffd24a;text-shadow:0 2px 8px #000,0 0 14px rgba(255,210,74,.5);text-align:left;max-width:44vw;animation:bfKillFade .5s ease-out .4s both;z-index:5}',
    // Nombre de la víctima (abajo derecha)
    '#bf-kill-ov .bf-kill-vname{position:absolute;bottom:2%;right:4%;font-family:Cinzel,serif;font-weight:900;font-size:clamp(14px,3.5vw,24px);color:#ff8a8a;text-shadow:0 2px 8px #000,0 0 14px rgba(255,59,48,.5);text-align:right;max-width:44vw;animation:bfKillFade .5s ease-out .4s both;z-index:5}',
    // Multi-kill: cuando hay varias víctimas, se encogen para que quepan
    '#bf-kill-ov .bf-kill-vics:has(.bf-kill-vic:nth-child(2)) .bf-kill-vic{width:min(30vw,280px);height:min(42vw,380px)}',
    '#bf-kill-ov .bf-kill-vics:has(.bf-kill-vic:nth-child(3)) .bf-kill-vic{width:min(24vw,220px);height:min(34vw,300px)}',
    '#bf-kill-ov .bf-kill-vics:has(.bf-kill-vic:nth-child(4)) .bf-kill-vic{width:min(20vw,180px);height:min(28vw,250px)}',
    // Tablet/móvil: héroes aún más grandes relativamente
    '@media(max-width:880px){#bf-kill-ov .bf-kill-att{left:2%;width:min(48vw,240px);height:min(68vw,340px);border-width:3px}#bf-kill-ov .bf-kill-vic{width:min(42vw,210px);height:min(60vw,300px);border-width:3px}#bf-kill-ov .bf-kill-vics{right:2%;gap:8px}#bf-kill-ov .bf-kill-vics:has(.bf-kill-vic:nth-child(2)) .bf-kill-vic{width:min(34vw,170px);height:min(48vw,240px)}#bf-kill-ov .bf-kill-vics:has(.bf-kill-vic:nth-child(3)) .bf-kill-vic{width:min(28vw,140px);height:min(40vw,200px)}#bf-kill-ov .bf-kill-pow-txt{font-size:clamp(32px,12vw,56px)}#bf-kill-ov .bf-kill-ko{font-size:clamp(24px,9vw,44px);bottom:4%}#bf-kill-ov .bf-kill-aname{left:2%;font-size:clamp(11px,3vw,16px)}#bf-kill-ov .bf-kill-vname{right:2%;font-size:clamp(11px,3vw,16px)}#bf-kill-ov .bf-kill-att-cool{font-size:clamp(32px,7vw,48px)}}'
  ].join('\\n');
  css += [
    // Multi-kill: el atacante crece y los caídos salen juntitos, en fila y solapados
    '#bf-kill-ov.bf-kill-multi .bf-kill-att{width:min(50vw,470px);height:min(70vw,600px);animation:bfKillAtt .7s cubic-bezier(.2,.8,.3,1) both,bfKillShake .45s linear .7s 3}',
    '@keyframes bfKillShake{0%,100%{margin-left:0}25%{margin-left:-6px}75%{margin-left:6px}}',
    '#bf-kill-ov.bf-kill-multi .bf-kill-vics{flex-direction:row;flex-wrap:nowrap;align-items:center;gap:0;max-width:56vw}',
    '#bf-kill-ov.bf-kill-multi .bf-kill-vic{flex:0 1 auto;margin-left:-4%;width:min(20vw,200px)!important;height:min(30vw,300px)!important}',
    '#bf-kill-ov.bf-kill-multi .bf-kill-vic:first-child{margin-left:0}',
    '#bf-kill-ov.bf-kill-multi .bf-kill-vic:nth-child(even){margin-top:26px}',
    '#bf-kill-ov.bf-kill-multi .bf-kill-pow-txt{font-size:clamp(30px,7vw,64px);color:#ff5a3c}',
    // Autogolpe: la víctima ocupa el centro y resbala con un plátano
    '#bf-kill-ov.bf-kill-self .bf-kill-vics{right:auto;left:50%;transform:translate(-50%,-50%)}',
    '#bf-kill-ov.bf-kill-self .bf-kill-vic{width:min(52vw,340px);height:min(72vw,460px);animation:bfKillSlip 1.5s cubic-bezier(.3,.7,.4,1) .2s both}',
    '@keyframes bfKillSlip{0%{opacity:0;transform:translateX(-120px) rotate(0)}35%{opacity:1;transform:translateX(0) rotate(0)}55%{transform:translateY(-40px) rotate(-25deg)}80%{transform:translateY(10px) rotate(-95deg)}100%{opacity:1;transform:translateY(0) rotate(-88deg)}}',
    '#bf-kill-ov .bf-kill-banana{position:absolute;bottom:6%;left:14%;font-size:clamp(46px,10vw,84px);z-index:6;filter:drop-shadow(0 4px 6px #000);animation:bfKillBanana 1.5s ease-out .2s both}',
    '@keyframes bfKillBanana{0%{opacity:0;transform:translateY(-140px) rotate(0)}30%{opacity:1;transform:translateY(0) rotate(20deg)}100%{opacity:1;transform:translateY(0) rotate(160deg)}}',
    '#bf-kill-ov.bf-kill-self .bf-kill-pow{top:22%}',
    '#bf-kill-ov.bf-kill-self .bf-kill-pow-txt{color:#ffe14a}'
  ].join('\\n');
  var st = document.createElement('style');
  css += '#bf-kill-ov .bf-kill-ko{bottom:10%;width:min(86vw,760px);box-sizing:border-box;padding:14px 22px;background:#160d1f;border:2px solid #e6b86b;border-radius:18px;font:700 clamp(19px,3vw,28px)/1.35 Rubik,sans-serif;color:#fff4dc;text-shadow:0 2px 3px #000;letter-spacing:0;white-space:normal;text-align:center;box-shadow:0 12px 40px #0009}#bf-kill-ov .bf-kill-speaker{display:block;font-size:.55em;color:#ffce88;margin-bottom:5px;letter-spacing:1px}#bf-kill-ov .bf-kill-line+ .bf-kill-line{margin-top:12px}';
  st.textContent = css;
  document.head.appendChild(st);

  // ---- Estado de la cola de kills ----
  var pendingVictims = [];
  var pendingActor = null, pendingSelf = null;
  var killTimer = null;
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
  window.__bfKillCinePending = function(){ return pendingVictims.length > 0; };

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
      if(typeof window.__bfIndicatorsBusy==='function'&&window.__bfIndicatorsBusy())return true;
      if(document.querySelector('.bf-dmg-pop,.bf-heal-pop,.bf-absorb-pop,.bf-stat-pop,.bf-status-pop,.bf-loss-pop,.bf-fx-float')) return true;
    }catch(e){}
    return false;
  }

  // ¿El golpe mortal ha puesto fin a la partida? Si es así, NO lanzamos la
  // cinemática de golpe mortal: la animación de fin de batalla (golpe
  // definitivo) ya es suficiente y no hay que duplicar.
  function gameEnded(){
    try{
      // Flag global del juego: B.over se establece cuando la partida termina
      if(typeof B !== 'undefined' && B && B.over) return true;
      // La animación de golpe definitivo ya está en pantalla
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

  function artFromCard(card){
    try{
      var art = card.querySelector('.bf-battle-art');
      if(art){
        var bg = art.style.backgroundImage || getComputedStyle(art).backgroundImage;
        var m = /url\\(["']?([^"')]+)["']?\\)/.exec(bg);
        if(m) return m[1];
      }
      // Respaldo: cualquier imagen del retrato para que NUNCA falte el héroe.
      // Solo elementos GRANDES (el retrato); los iconos de armas, armaduras,
      // estados o efectos se descartan (salía el icono del arma a distancia).
      var cr = card.getBoundingClientRect();
      var cand = card.querySelectorAll('img, div, span');
      for(var k=0;k<cand.length;k++){
        var el = cand[k];
        if(el.closest('.bf-kill-ov,[class*="chip"],[class*="badge"],[class*="fx"],[class*="mark"],[class*="icon"],[class*="status"]')) continue;
        var er = el.getBoundingClientRect();
        if(er.width < cr.width * 0.7 || er.height < cr.height * 0.4) continue;
        var src2 = el.tagName === 'IMG' ? el.src : '';
        if(!src2){
          var m2 = /url\\(["']?([^"')]+)["']?\\)/.exec(getComputedStyle(el).backgroundImage || '');
          if(m2) src2 = m2[1];
        }
        if(src2) return src2;
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
  function showKillCinematic(actor, victims, selfKill){
    var multiKill = victims.length > 1;
    var ov = document.createElement('div');
    ov.id = 'bf-kill-ov';
    if(multiKill) ov.classList.add('bf-kill-multi');
    if(selfKill) ov.classList.add('bf-kill-self');
    ov.dataset.bfNew = '1';

    var bg = document.createElement('div');
    bg.className = 'bf-kill-bg';
    ov.appendChild(bg);

    // ---- Atacante (héroe que mata) ----
    var attArt = attackerArt(actor);
    var attName = '';
    try{
      if(actor && typeof getHero === 'function'){
        var ah = getHero(actor.side, actor.id);
        if(ah) attName = ah.name || '';
      }
    }catch(e){}

    if(attArt && !selfKill){
      var att = document.createElement('div');
      att.className = 'bf-kill-att';
      att.style.backgroundImage = 'url("' + attArt + '")';
      // Emoji 😎 flotando encima del atacante (guay/victorioso)
      var cool = document.createElement('div');
      cool.className = 'bf-kill-att-cool';
      cool.textContent = '\\ud83d\\ude0e';
      att.appendChild(cool);
      ov.appendChild(att);
    }
    if(attName && !selfKill){
      var aname = document.createElement('div');
      aname.className = 'bf-kill-aname';
      aname.textContent = attName;
      ov.appendChild(aname);
    }

    // ---- Víctimas (todos los héroes que mueren, apilados a la derecha) ----
    var vicWrap = document.createElement('div');
    vicWrap.className = 'bf-kill-vics';
    victims.forEach(function(v, i){
      var vic = document.createElement('div');
      vic.className = 'bf-kill-vic';
      if(v.art) vic.style.backgroundImage = 'url("' + v.art + '")';
      if(selfKill){
        var banana = document.createElement('div');
        banana.className = 'bf-kill-banana';
        banana.textContent = '\\ud83c\\udf4c';
        vic.appendChild(banana);
      }
      vic.style.animationDelay = (0.15 + i * 0.12) + 's';
      // Estrellitas 💫 de mareo
      var star = document.createElement('div');
      star.className = 'bf-kill-star';
      star.textContent = '\\ud83d\\udcab';
      vic.appendChild(star);
      // Lágrimas 💧
      var tears = document.createElement('div');
      tears.className = 'bf-kill-tears';
      tears.textContent = '\\ud83d\\udca7 \\ud83d\\udca7';
      vic.appendChild(tears);
      // Fantasma 👻 elevándose
      var ghost = document.createElement('div');
      ghost.className = 'bf-kill-ghost';
      vic.appendChild(ghost);
      vicWrap.appendChild(vic);
    });
    ov.appendChild(vicWrap);

    // Nombres de todas las víctimas
    var vnames = victims.map(function(v){ return v.name; }).filter(Boolean).join(' \\u00b7 ');
    if(vnames){
      var vname = document.createElement('div');
      vname.className = 'bf-kill-vname';
      vname.textContent = vnames;
      ov.appendChild(vname);
    }

    // ---- Estallido cómic "¡POW!" entre los dos ----
    var pow = document.createElement('div');
    pow.className = 'bf-kill-pow';
    var powTxt = document.createElement('div');
    powTxt.className = 'bf-kill-pow-txt';
    powTxt.textContent = selfKill ? '\\u00a1CATAPLUM!' : (multiKill ? '\\u00a1ANIQUILADOS!' : '\\u00a1POW!');
    pow.appendChild(powTxt);
    ov.appendChild(pow);

    // Últimas palabras del héroe caído, no del atacante.
    var ko = document.createElement('div');
    ko.className = 'bf-kill-ko';
    victims.forEach(function(v){
      var line=document.createElement('div');line.className='bf-kill-line';
      var speaker=document.createElement('span');speaker.className='bf-kill-speaker';
      speaker.textContent=[v.name,v.clan].filter(Boolean).join(' · ');
      var quote=document.createElement('span');quote.textContent='«'+pickDeathQuip(v.clan,!!window.__bfLangEn,selfKill?'self':'')+'»';
      line.appendChild(speaker);line.appendChild(quote);ko.appendChild(line);
    });
    ov.appendChild(ko);

    (window.__bfAppend || function(n){ document.body.appendChild(n); })(ov);

    // Tiempo de lectura para las últimas palabras sin adelantar otro turno.
    var readTime=4500+Math.max(0,victims.length-1)*1600;
    setTimeout(function(){ ov.classList.add('bf-kill-out'); }, readTime);
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, readTime+600);
  }

  // ---- Flush: tras el retraso, lanza la cinemática ----
  function flushPending(){
    killTimer = null;
    if(!pendingVictims.length){ stopWatch(); return; }

    // Si el golpe mortal ha puesto fin a la partida, NO lanzamos la
    // cinemática: la animación de fin de batalla ya es suficiente.
    if(gameEnded()){
      pendingVictims = [];
      pendingActor = null;
      stopWatch();
      return;
    }

    var actor = pendingActor;
    var selfHint = pendingSelf;
    pendingSelf = null;
    var victims = pendingVictims.slice();
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
    var sk = window.__bfSelfKill;
    var selfKill = !actor && victims.length === 1 && !!(
      (sk && Date.now() - sk.ts < 8000 && sk.victim === victims[0].id) ||
      (selfHint && selfHint.side === victims[0].side));
    pendingVictims = [];
    pendingActor = null;
    if(!victims.length){ stopWatch(); return; }

    // Pequeño margen: si la escena sigue ocupada, espera un poco más
    function proceed(){
      // Re-check fin de partida tras la espera
      if(gameEnded()){ stopWatch(); return; }
      if(busy()){
        setTimeout(proceed, 200);
        return;
      }
      setTimeout(function(){
        if(gameEnded()){ stopWatch(); return; }
        if(busy()){ setTimeout(proceed, 200); return; }
        showKillCinematic(actor, victims, selfKill);
        stopWatch();
      }, 150);
    }
    proceed();
  }

  // ---- Hook de bfKillCinematic ----
  function install(){
    var orig = window.bfKillCinematic;
    if(typeof orig !== 'function' || orig.__bfQueued) return false;
    var wrapped = function(card){
      if(!card) return;

      // Recoge la víctima (sin duplicar: si el mismo héroe ya está en la
      // lista de víctimas pendientes, no se añade otra vez)
      var vHero = heroFromCard(card);
      var vArt = artFromCard(card);
      var vId = vHero ? vHero.id : ('dom_' + (card.id || ''));
      var parts = String(card.id || '').split('_'), side = parts[1] || '';
      var key = side + '_' + vId;
      if(vHero && vHero.alive) return;
      if(claimedDeaths[key]) return;
      claimedDeaths[key] = { side: side, id: vId };
      var dup = pendingVictims.some(function(p){ return p.key === key; });
      if(!dup){
        pendingVictims.push({
          id: vId, side: side, key: key,
          name: vHero ? vHero.name : '',
          clan: vHero ? vHero.clan || (vHero._token ? 'Bizarros' : '') : '',
          art: vArt
        });
      }

      // Anota el atacante
      var ka = window.__bfKillActor;
      if(ka && ka.victim === vId && ka.side && ka.side !== side && Date.now() - ka.ts < 6000){
        pendingActor = { side: ka.side, id: ka.id, ts: ka.ts };
      }
      // MULTIPLAYER (cliente): si __bfKillActor no se fijó (dealDamage no
      // corre en el invitado), deduce el atacante del turno activo. Es el
      // respaldo si bfKillCinematic se llama antes que flushFx.
      if(!pendingActor){
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
          } else if(fbActor && fbActor.side === side){
            pendingSelf = fbActor;
          }
        }catch(e){}
      }

      startWatch();

      // Si no hay timer, arranca el retraso
      if(!killTimer){
        var ctx = window.__bfActionCtx;
        var delay = 600; // kill de ataque normal: espera corta
        // Kill por habilidad/hechizo/objeto: retrasa 3.5 s (duración de la
        // animación 3D de la habilidad) para que NUNCA se solapen.
        if(ctx && (ctx.kind === 'useAbility' || ctx.kind === 'castSpell' || ctx.kind === 'useItem') && Date.now() - ctx.ts < 6000){
          delay = 3500;
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