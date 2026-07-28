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
    coach('PASO 2 · EQUIPAMIENTO. Cada IA gastó su presupuesto en armas, armaduras, hechizos y objetos (van a la mano).'+
          '  🔵 IA Azul: '+explainEquip('p')+
          '  🔴 IA Roja: '+explainEquip('o')+
          '  ➜  Pulsa "Seguir" para empezar el combate.');
    coachBtn('Seguir ▶', window.demoBattle);
  }

  // ---- Reescribe demoAuction: arranca la subasta de verdad ----
  window.demoAuction=function(){
    G.demo=true; G.demoExample=true; G.oppHuman=false; G.online=false; NET.role='local';
    G.team={p:[],o:[]}; G.spellbook={p:[],o:[]}; G.items={p:[],o:[]};
    G.equipReserve={p:0,o:0};
    var poolOf=function(t){ return HEROES.filter(function(h){return h.type===t&&h.clan!=='Bizarros'&&!String(h.id||'').startsWith('tk_');}); };
    G.pools={CC:shuffle(poolOf('CC')),AD:shuffle(poolOf('AD')),HE:shuffle(poolOf('HE'))};
    G.coins={p:START_COINS,o:START_COINS};
    G.aIndex=0; G.subRound=0; G.phaseResult=null;
    try{ startAuctionPhase(); }catch(e){}  // fase 0 (CC): slate, phaseNeeds, bonus, renderRecruit
    coach('PASO 1 · SUBASTA — Fase 1/3 ⚔️ Cuerpo a Cuerpo. Salen 6 héroes, uno por raza (cada raza con su color y símbolo). Las dos IAs pujan en SECRETO: gana quien más ofrece. Si pujan por el mismo, se repite. Pulsa "Seguir" para ver la puja.');
    coachBtn('Seguir ▶', window.__bfDemoBidStep);
  };

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
})();
</script>
`;