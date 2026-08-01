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

  function curScreen(){ var a=document.querySelector('.screen.active'); return a?a.id:''; }

  // ---- Explicación de la ronda de puja (después de resolver) ----
  function explainBidResult(){
    var pr=G.phaseResult||{};
    var lines=[];
    if(pr.contested){
      var w=pr.winner==='p'?G.names.p:G.names.o;
      var amt=pr.winner==='p'?pr.bpAmt:pr.boAmt;
      lines.push('¡Pugna reñida! Las dos IAs querían a '+(pr.contestName||'el mismo héroe')+'. Gana '+w+' con '+amt+'🪙; la otra IA repite puja con una tanda nueva.');
    } else {
      if(pr.gotP) lines.push('IA Azul → '+pr.gotP+' ('+pr.bpAmt+'🪙).');
      if(pr.gotO) lines.push('IA Roja → '+pr.gotO+' ('+pr.boAmt+'🪙).');
      if(pr.pPass) lines.push('IA Azul pasó.');
      if(pr.oPass) lines.push('IA Roja pasó.');
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
      return h.name+': '+(bits.length?bits.join(' '):'sin equipo');
    });
    var sb=(G.spellbook[side]||[]).length, ib=(G.items[side]||[]).length;
    var extra=[];
    if(sb) extra.push(sb+' hechizo'+(sb>1?'s':''));
    if(ib) extra.push(ib+' objeto'+(ib>1?'s':''));
    var tail = extra.length ? ' · +' + extra.join(', ') : '';
    return parts.join(' · ')+tail+' · sobran '+G.equipCoins[side]+'🪙';
  }

  // ---- Paso a paso de la subasta ----
  function demoBidStep(){
    try{ aiDecision('p'); aiDecision('o'); tryResolveRound(); }catch(e){}
    var r=explainBidResult();
    coach('PUJA RESUELTA · '+r+'  ➜  Pulsa "Seguir" para avanzar.');
    coachBtn('Seguir ▶', window.__bfDemoAdvanceStep);
  }

  function demoAdvanceStep(){
    try{ advancePhase(); }catch(e){}
    if(curScreen()==='s-equip'){ window.__bfDemoEquipShow(); return; }
    var msg;
    if(G.subRound>0){
      msg='REPITE PUJA · La IA que se quedó sin héroe elige de una tanda nueva. Pulsa "Seguir" para ver la puja.';
    } else {
      msg='FASE '+(G.aIndex+1)+'/3 · '+roleIcon(G.curType)+' '+typeLong(G.curType)+'. Nueva tanda de 6 héroes (uno por raza). Las dos IAs pujan en secreto. Pulsa "Seguir".';
    }
    coach(msg);
    coachBtn('Seguir ▶', window.__bfDemoBidStep);
  }

  // ---- Equipamiento: la IA Azul ('p') también se equipa (finishAuction solo
  // equipa a 'o' cuando !oppHuman). Mostramos el resumen de ambos lados. ----
  function demoEquipShow(){
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
      }catch(e){ if(window.console)console.error('bfDemoBattle',e); if(typeof notif==='function')notif('No se pudo iniciar el combate: '+(e&&e.message||e)); }
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
    coach('PASO 2 · EQUIPAMIENTO. Cada IA gastó su presupuesto en armas, armaduras, hechizos y objetos (van a la mano).'+
          '  🔵 IA Azul: '+explainEquip('p')+
          '  🔴 IA Roja: '+explainEquip('o')+
          '  ➜  Pulsa "Seguir" para empezar el combate.');
    coachBtn('Seguir ▶', startDemoBattle);
  }

  // ---- Reescribe demoAuction: arranca la subasta de verdad ----
  window.demoAuction=function(){
    G.demo=true; G.demoExample=true; G.oppHuman=false; G.online=false; NET.role='local';
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
    // Mostrar la pantalla de subasta con la TERNA de 6 héroes ANTES del mensaje
    // del entrenador. Sin esto el "Empezar demo" dejaba la pantalla anterior
    // (el modal) y el espectador veía el mensaje sin contexto, y al pulsar
    // "Seguir" saltaba directamente al resultado de la puja.
    try{ if(typeof window.closeModal==='function') window.closeModal(); }catch(e){}
    try{ if(typeof window.show==='function') window.show('s-recruit'); }catch(e){}
    try{ if(typeof window.renderRecruit==='function') window.renderRecruit('p'); }catch(e){}
    coach('PASO 1 · SUBASTA — Fase 1/3 ⚔️ Cuerpo a Cuerpo. Salen 6 héroes, uno por raza (cada raza con su color y símbolo). Las dos IAs pujan en SECRETO: gana quien más ofrece. Si pujan por el mismo, se repite. Pulsa "Seguir" para ver la puja.');
    coachBtn('Seguir ▶', window.__bfDemoBidStep);
  };

  // Actualizar el texto del modal "Aprender a jugar": el nativo dice "salta
  // directa al combate", pero ahora la demo juega la subasta completa.
  function patchDemoModalText(){
    var root=document.getElementById('modalRoot')||document.body;
    root.querySelectorAll('*').forEach(function(el){
      if(el.children.length) return;
      var t=el.textContent||'';
      if(/salta directa al combate/i.test(t)){
        el.textContent='Esta demo juega la SUBASTA COMPLETA (3 fases, IA vs IA) y luego el combate, para que veas una partida real de principio a fin.';
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
  // está activo: es el momento ideal para invitar a ver la guía visual antes
  // de seguir. Al pulsar, navega a la página padre /guiacartas.
  function ensureGuideBtn(){
    var show = (typeof G!=='undefined' && G && G.demo && curScreen()==='s-recruit');
    var btn = document.getElementById('bf-demo-guide-btn');
    if (show && !btn){
      btn = document.createElement('div');
      btn.id = 'bf-demo-guide-btn';
      btn.style.cssText = 'position:fixed;top:14px;right:14px;z-index:99999;display:flex;align-items:center;gap:8px;cursor:pointer;padding:9px 14px;border-radius:13px;background:linear-gradient(135deg,rgba(192,107,255,.92),rgba(120,60,180,.92));border:2px solid rgba(255,210,74,.8);color:#fff5dc;font-family:Cinzel,serif;font-weight:900;font-size:13px;letter-spacing:.3px;box-shadow:0 8px 22px rgba(0,0,0,.5),0 0 16px rgba(192,107,255,.5);text-shadow:0 1px 3px #000;animation:bfDemoGuidePulse 2.4s ease-in-out infinite';
      btn.innerHTML = '<span style="font-size:18px">🃏</span> Conocer las Cartas';
      btn.onclick = function(){ try{ window.parent.postMessage({bfNavigate:'/guiacartas'},'*'); }catch(e){} };
      document.body.appendChild(btn);
    } else if (!show && btn){ btn.remove(); }
  }
  var gSty=document.createElement('style');
  gSty.textContent='@keyframes bfDemoGuidePulse{0%,100%{box-shadow:0 8px 22px rgba(0,0,0,.5),0 0 12px rgba(192,107,255,.4)}50%{box-shadow:0 8px 22px rgba(0,0,0,.5),0 0 22px rgba(192,107,255,.85),0 0 30px rgba(255,210,74,.4)}}';
  document.head.appendChild(gSty);
  setInterval(ensureGuideBtn, 500);

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
      btn.innerHTML='🎬 Ver cinemática de intro';
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