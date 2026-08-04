// Parche inyectado en el iframe: reescribe la demo "Aprende a jugar" para que
// la SUBASTA se juegue COMPLETA (las 3 fases, IA vs IA) como en una partida
// real, en vez de mostrar solo la fase 1 y saltar. El espectador solo pulsa
// "Seguir" para avanzar cada ronda; el pollito-entrenador (coach) explica cada
// fase y cada acción de las IAs. Al ejecutar la subasta de verdad (award()
// elimina al héroe del pool), es imposible que se repitan héroes entre los 6
// que van a la batalla — antes venían de un pick aleatorio en startDemo.
export const DEMO_FLOW_PATCH = `
<script>
(function(){
  if(window.__bfDemoFlowPatch)return;
  window.__bfDemoFlowPatch=true;

  var EN=!!window.__bfLangEn;
  function T(es,en){return EN?en:es;}

  function curScreen(){ var a=document.querySelector('.screen.active'); return a?a.id:''; }

  // ---- Explicación de la ronda de puja (después de resolver) ----
  function explainBidResult(){
    var pr=G.phaseResult||{};
    var lines=[];
    if(pr.contested){
      var w=pr.winner==='p'?G.names.p:G.names.o;
      var amt=pr.winner==='p'?pr.bpAmt:pr.boAmt;
      lines.push(T('¡Pugna reñida! Las dos IAs querían a ','Close bid! Both AIs wanted ')+(pr.contestName||T('el mismo héroe','the same hero'))+T('. Gana ','. Won by ')+w+T(' con ',' with ')+amt+'🪙'+T('; la otra IA repite puja con una tanda nueva.','; the other AI rebids with a fresh round.'));
    } else {
      if(pr.gotP) lines.push(T('IA Azul → ','Blue AI → ')+pr.gotP+' ('+pr.bpAmt+'🪙).');
      if(pr.gotO) lines.push(T('IA Roja → ','Red AI → ')+pr.gotO+' ('+pr.boAmt+'🪙).');
      if(pr.pPass) lines.push(T('IA Azul pasó.','Blue AI passed.'));
      if(pr.oPass) lines.push(T('IA Roja pasó.','Red AI passed.'));
    }
    return lines.join(' ');
  }

  // ---- Resumen del equipamiento de un lado ----
  function explainEquip(side){
    var parts=(G.team[side]||[]).map(function(h){
      var bits=[];
      if(h.mwep) bits.push('⚔️'+h.mwep.name);
      if(h.rwep) bits.push('🏹'+h.rwep.name);
      if(h.armor) bits.push('🛡️'+h.armor.name);
      return h.name+': '+(bits.length?bits.join(' '):T('sin equipo','no gear'));
    });
    var sb=(G.spellbook[side]||[]).length, ib=(G.items[side]||[]).length;
    var extra=[];
    if(sb) extra.push(sb+' '+T('hechizo','spell')+(sb>1?'s':''));
    if(ib) extra.push(ib+' '+T('objeto','item')+(ib>1?'s':''));
    var tail = extra.length ? ' · +' + extra.join(', ') : '';
    return parts.join(' · ')+tail+T(' · sobran ',' · leftover ')+G.equipCoins[side]+'🪙';
  }

  // ---- Paso a paso de la subasta ----
  function demoBidStep(){
    // Resolución de la puja: pausa los tips (no cuadran sobre el resultado).
    window.__bfDemoTipsPause=true;
    try{ aiDecision('p'); aiDecision('o'); tryResolveRound(); }catch(e){}
    var r=explainBidResult();
    coach(T('PUJA RESUELTA · ','BID RESOLVED · ')+r+T('  ➜  Pulsa "Seguir" para avanzar.','  ➜  Press "Follow" to advance.'));
    coachBtn(T('Seguir ▶','Follow ▶'), window.__bfDemoAdvanceStep);
  }

  function demoAdvanceStep(){
    // Nueva fase de puja: reanuda los tips.
    window.__bfDemoTipsPause=false;
    try{ advancePhase(); }catch(e){}
    if(curScreen()==='s-equip'){ window.__bfDemoEquipShow(); return; }
    var msg;
    if(G.subRound>0){
      msg=T('REPITE PUJA · La IA que se quedó sin héroe elige de una tanda nueva. Pulsa "Seguir" para ver la puja.','REBID · The AI left without a hero picks from a fresh round. Press "Follow" to see the bid.');
    } else {
      msg=T('FASE ','PHASE ')+(G.aIndex+1)+'/3 · '+roleIcon(G.curType)+' '+typeLong(G.curType)+T('. Nueva tanda de 6 héroes (uno por raza). Las dos IAs pujan en secreto. Pulsa "Seguir".','. A fresh batch of 6 heroes (one per race). Both AIs bid in secret. Press "Follow".');
    }
    coach(msg);
    coachBtn(T('Seguir ▶','Follow ▶'), window.__bfDemoBidStep);
  }

  // ---- Equipamiento: la IA Azul ('p') también se equipa (finishAuction solo
  // equipa a 'o' cuando !oppHuman). Mostramos el resumen de ambos lados. ----
  function demoEquipShow(){
    // Pantalla de equipamiento: reanuda los tips (tips de s-equip).
    window.__bfDemoTipsPause=false;
    try{
      var pUnequipped=(G.team.p||[]).every(function(h){ return h&&!h.mwep&&!h.rwep&&!h.armor; });
      if(pUnequipped && G.team.p && G.team.p.length) aiEquip('p');
    }catch(e){}
    G.eqReady={p:true,o:true};
    show('s-equip'); renderEquip('p');
    // Arranque del combate robusto: envolvemos startBattle para que cualquier
    // error se muestre claro (notif + consola) en vez de fallar en silencio o
    // colgar el navegador. Así, si algo impide arrancar la batalla, se ve el
    // motivo en lugar de un "error raro".
    var startDemoBattle=function(){
      try{
        if(typeof window.demoBattle==='function') window.demoBattle();
        else if(typeof startBattle==='function') startBattle();
        }catch(e){ if(window.console)console.error('bfDemoBattle',e); if(typeof notif==='function')notif(T('No se pudo iniciar el combate: ','Could not start the battle: ')+(e&&e.message||e)); }
    };
    // En la demo el botón nativo "Listo — a la batalla" (eqDone) está desactivado
    // por G.demoExample (tanto el wrapper como el original hacen return). Lo
    // rebindamos con un interval ligero (sólo actúa mientras s-equip está
    // activa) para que TAMBIÉN arranque el combate, igual que el "Seguir".
    if(!window.__bfDemoListoBound){
      window.__bfDemoListoBound=true;
      setInterval(function(){
        var sc=document.getElementById('s-equip');
        if(!sc||!sc.classList.contains('active'))return;
        sc.querySelectorAll('button[onclick*="eqDone"]').forEach(function(b){
          if(b.dataset.bfDemoListo==='1')return;
          b.dataset.bfDemoListo='1';
          b.removeAttribute('onclick');
          b.onclick=function(e){e.preventDefault();e.stopPropagation();startDemoBattle();};
        });
      },500);
    }
    coach(T('PASO 2 · EQUIPAMIENTO. Cada IA gastó su presupuesto en armas, armaduras, hechizos y objetos (van a la mano).','STEP 2 · GEAR. Each AI spent its budget on weapons, armor, spells and items (they go to the hand).')+
          T('  🔵 IA Azul: ','  🔵 Blue AI: ')+explainEquip('p')+
          T('  🔴 IA Roja: ','  🔴 Red AI: ')+explainEquip('o')+
          T('  ➜  Pulsa "Seguir" para empezar el combate.','  ➜  Press "Follow" to start the battle.'));
    coachBtn(T('Seguir ▶','Follow ▶'), startDemoBattle);
  }

  // ---- Reescribe demoAuction: arranca la subasta de verdad ----
  window.demoAuction=function(){
    G.demo=true; G.demoExample=true; G.oppHuman=false; G.online=false; NET.role='local'; window.__bfDemoTipsPause=false;
    // Tips SOLO en la demo: activamos el flag dedicado y reseteamos los tips
    // cerrados en la demo anterior para que vuelvan a aparecer.
    window.__bfDemoOn=true;
    if(typeof window.__bfResetDemoTips==='function') window.__bfResetDemoTips();
    G.team={p:[],o:[]}; G.spellbook={p:[],o:[]}; G.items={p:[],o:[]};
    G.equipReserve={p:0,o:0};
    var poolOf=function(t){ return HEROES.filter(function(h){return h.type===t&&h.clan!=='Bizarros'&&!String(h.id||'').startsWith('tk_');}); };
    G.pools={CC:shuffle(poolOf('CC')),AD:shuffle(poolOf('AD')),HE:shuffle(poolOf('HE'))};
    G.coins={p:START_COINS,o:START_COINS};
    G.aIndex=0; G.subRound=0; G.phaseResult=null;
    try{ startAuctionPhase(); }catch(e){}
    // SOLO en la 1ª fase de la subasta del demo: fuerza un bonificador que
    // modifique la puja (BID_ADD suma / BID_SUB resta al rival) para que el
    // tip explicativo del bidcalc (bonificador verde / restador rojo) tenga
    // sentido. En fases posteriores vuelve al azado normal del juego.
    try{
      if (G.demo && Number(G.aIndex||0)===0 && Number(G.subRound||0)===0 && typeof BONUS!=='undefined' && BONUS) {
        var bidBs=BONUS.filter(function(b){ return b && (b.type==='BID_ADD'||b.type==='BID_SUB'); });
        if (bidBs.length) {
          if (!G.bonus) G.bonus={p:null,o:null};
          ['p','o'].forEach(function(s){
            var pick=bidBs[Math.floor(Math.random()*bidBs.length)];
            G.bonus[s]=pick;
          });
        }
      }
    }catch(e){}
    // Mostrar la pantalla de subasta con la TERNA de 6 héroes ANTES del mensaje
    // del entrenador. Sin esto el "Empezar demo" dejaba la pantalla anterior
    // (el modal) y el espectador veía el mensaje sin contexto, y al pulsar
    // "Seguir" saltaba directamente al resultado de la puja.
    try{ if(typeof window.closeModal==='function') window.closeModal(); }catch(e){}
    try{ if(typeof window.show==='function') window.show('s-recruit'); }catch(e){}
    try{ if(typeof window.renderRecruit==='function') window.renderRecruit('p'); }catch(e){}
    coach(T('PASO 1 · SUBASTA — Fase 1/3 ⚔️ Cuerpo a Cuerpo. Salen 6 héroes, uno por raza (cada raza con su color y símbolo). Las dos IAs pujan en SECRETO: gana quien más ofrece. Si pujan por el mismo, se repite. Pulsa "Seguir" para ver la puja.','STEP 1 · AUCTION — Phase 1/3 ⚔️ Melee. 6 heroes appear, one per race (each race with its color and symbol). Both AIs bid in SECRET: the highest offer wins. If they bid on the same one, it rebids. Press "Follow" to see the bid.'));
    coachBtn(T('Seguir ▶','Follow ▶'), window.__bfDemoBidStep);
  };

  // Actualizar el texto del modal "Aprender a jugar": el nativo dice "salta
  // directa al combate", pero ahora la demo juega la subasta completa.
  function patchDemoModalText(){
    var root=document.getElementById('modalRoot')||document.body;
    root.querySelectorAll('*').forEach(function(el){
      if(el.children.length) return;
      var t=el.textContent||'';
      if(/salta directa al combate/i.test(t)){
        el.textContent=T('Esta demo juega la SUBASTA COMPLETA (3 fases, IA vs IA) y luego el combate, para que veas una partida real de principio a fin.','This demo plays the FULL AUCTION (3 phases, AI vs AI) and then the battle, so you can watch a real match from start to finish.');
      }
    });
  }
  if(!window.__bfDemoModalTextPatched){
    window.__bfDemoModalTextPatched=true;
    var origStartDemo=window.startDemo;
    if(typeof origStartDemo==='function'){
      window.startDemo=function(){ var r=origStartDemo.apply(this,arguments); setTimeout(patchDemoModalText,50); setTimeout(patchDemoModalText,250); return r; };
    }
    new MutationObserver(patchDemoModalText).observe(document.documentElement,{childList:true,subtree:true});
  }

  // Mantén el nombre demoEquip apuntando al flujo nuevo (por si se invoca).
  window.demoEquip=function(){ window.__bfDemoEquipShow(); };

  // ---- Registra los pasos en el lado global (el juego los llama por nombre) ----
  window.__bfDemoBidStep=demoBidStep;
  window.__bfDemoAdvanceStep=demoAdvanceStep;
  window.__bfDemoEquipShow=demoEquipShow;

  // No hace falta instalar con polling: las asignaciones a window.* ya pisan
  // las funciones nativas (este script corre tras el del juego, al final del
  // body). Las funciones referenciadas (aiDecision, tryResolveRound, ...)
  // existen en el momento del clic, no al cargar.

  // ---- Botón "Conocer las Cartas" durante la SUBASTA del demo ----
  // Aparece solo en la pantalla de reclutamiento (s-recruit) mientras el demo
  // está activo, anclado a la IZQUIERDA del indicador de fase (.phase-badge)
  // para no solaparse con el botón de salir (esquina sup. derecha). Al pulsar,
  // navega a la página padre /guiacartas.
  function ensureGuideBtn(){
    var show = (typeof G!=='undefined' && G && G.demo && curScreen()==='s-recruit');
    var btn = document.getElementById('bf-demo-guide-btn');
    if (!show){ if(btn) btn.remove(); return; }
    var badge = document.querySelector('#s-recruit .phase-badge');
    if(!badge){ if(btn) btn.remove(); return; }
    // El botón va DENTRO del DOM, junto al badge de fase — no como un overlay
    // flotante. Así se mueve con la página naturalmente (scroll, zoom, re-
    // render) sin tener que recalcular su posición. Es un botón más.
    if (!btn || !badge.parentNode || badge.parentNode !== btn.parentNode){
      if(btn) btn.remove();
      btn = document.createElement('div');
      btn.id = 'bf-demo-guide-btn';
      btn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border-radius:9px;background:linear-gradient(135deg,rgba(192,107,255,.92),rgba(120,60,180,.92));border:2px solid rgba(255,210,74,.8);color:#fff5dc;font-family:Cinzel,serif;font-weight:900;font-size:11px;letter-spacing:.3px;box-shadow:0 4px 14px rgba(0,0,0,.5),0 0 10px rgba(192,107,255,.5);text-shadow:0 1px 3px #000;white-space:nowrap;flex-shrink:0;margin-left:10px;vertical-align:middle;animation:bfDemoGuidePulse 2.4s ease-in-out infinite';
      btn.innerHTML = '<span style="font-size:14px">🃏</span> ' + T('Conocer las Cartas','Know the Cards');
      btn.onclick = function(e){ e.preventDefault(); e.stopPropagation(); try{ window.parent.postMessage({bfNavigate:'/guiacartas',fromDemo:true},'*'); }catch(err){} };
      badge.parentNode.insertBefore(btn, badge.nextSibling);
    }
  }
  if(!window.__bfDemoGuideSty){
    window.__bfDemoGuideSty=true;
    var gSty=document.createElement('style');
    gSty.textContent='@keyframes bfDemoGuidePulse{0%,100%{box-shadow:0 6px 18px rgba(0,0,0,.5),0 0 10px rgba(192,107,255,.4)}50%{box-shadow:0 6px 18px rgba(0,0,0,.5),0 0 18px rgba(192,107,255,.8),0 0 26px rgba(255,210,74,.4)}}';
    document.head.appendChild(gSty);
  }
  setInterval(ensureGuideBtn, 400);

  // ---- Opción "Ver cinemática de intro" en el modal de "Aprender a jugar" ----
  // Detecta el modal de la demo por su botón "Empezar demo" (visible) e inserta
  // un segundo botón para ver la cinemática antes de empezar. Al acabar/saltar
  // la intro, el padre envía bfStartDemo y arrancamos la demo aquí mismo.
  // Mientras el modal esté abierto avisamos al padre para que oculte el cartel
  // de flash news.
  function ensureDemoIntroBtn(){
    var root=document.getElementById('modalRoot');
    if(!root){
      var rb=document.getElementById('bf-demo-intro-btn'); if(rb)rb.remove();
      if(window.__bfDemoModalOpen){ window.__bfDemoModalOpen=false; try{window.parent.postMessage({bfDemoModalOpen:false},'*');}catch(e){} }
      return;
    }
    var startBtn=null;
    root.querySelectorAll('button').forEach(function(b){
      if(!startBtn && /Empezar demo|Empezar la demo|Start demo/i.test(b.textContent||'') && b.offsetParent!==null) startBtn=b;
    });
    var isDemo=!!startBtn;
    if(window.__bfDemoModalOpen!==isDemo){ window.__bfDemoModalOpen=isDemo; try{window.parent.postMessage({bfDemoModalOpen:isDemo},'*');}catch(e){} }
    var btn=document.getElementById('bf-demo-intro-btn');
    if(isDemo && !btn && startBtn){
      btn=document.createElement('button');
      btn.id='bf-demo-intro-btn';
      btn.type='button';
      btn.style.cssText='display:block;width:100%;margin-top:10px;padding:11px 16px;border-radius:12px;cursor:pointer;font-family:Cinzel,serif;font-weight:900;font-size:14px;letter-spacing:.04em;border:2px solid rgba(192,91,255,.8);background:linear-gradient(135deg,#1e0c32,#3c145a);color:#e8c0ff;box-shadow:0 6px 18px rgba(0,0,0,.6),0 0 12px rgba(192,91,255,.4);text-shadow:0 1px 4px #000;';
      btn.innerHTML=T('🎬 Ver cinemática de intro','🎬 Watch the intro cinematic');
      btn.onclick=function(e){ e.preventDefault(); e.stopPropagation(); try{ window.parent.postMessage({bfOpenIntro:true,bfAutoDemo:true},'*'); }catch(err){} };
      startBtn.parentNode.insertBefore(btn, startBtn);
    } else if(!isDemo && btn){ btn.remove(); }
  }
  setInterval(ensureDemoIntroBtn, 400);
  new MutationObserver(ensureDemoIntroBtn).observe(document.documentElement,{childList:true,subtree:true});

  // El padre avisa cuando la cinemática cerró/saltó desde "Aprender a jugar":
  // arrancamos la demo (subasta completa IA vs IA + combate).
  window.addEventListener('message', function(e){
    if(e.data && e.data.bfStartDemo){
      try{ if(typeof window.demoAuction==='function') window.demoAuction(); }catch(err){}
    }
  });
})();
</script>
`;