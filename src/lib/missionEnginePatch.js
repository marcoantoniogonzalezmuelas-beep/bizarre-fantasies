// Native initialization stays authoritative; only the mission branch skips auctions.
export function patchMissionHtml(html) {
  const init = "show('s-recruit'); startAuctionPhase();";
  if (!html.includes(init)) throw new Error('No se encuentra el inicio del juego para las misiones.');
  return html.replace(init, "if(window.bfMissionRequested){window.bfMissionRequested=false;window.bfOpenMissions();return;} if(window.bfMissionMpRequested){window.bfMissionMpRequested=false;window.bfSetupMissionMp();return;} G.bfMission=null; " + init);
}
export const MISSION_ENGINE_PATCH = `<script>
(function(){
  var originalMeta=null, activeRun=null;
  function missionName(id){return id==='l5r'?'Leyendas':id==='club'?'Club':id==='todos'?'Todos los Héroes':id;}
  function tell(data){parent.postMessage(data,'*');}
  function reportMissionResult(){
    if(!activeRun||!G.bfMission||G.bfMission.run_id!==activeRun.run_id)return;
    if(!G._result||typeof G._result.pWin!=='boolean'||!G._gameOver)return;
    if(!activeRun.acknowledged&&(!activeRun.sentAt||Date.now()-activeRun.sentAt>=1000)){
      activeRun.sentAt=Date.now();
      var side=activeRun.level?'p':(NET.mySide||(NET.role==='client'?'o':'p'));
      tell({bfMissionResult:{run_id:activeRun.run_id,won:G._result.pWin===(side==='p')}});
    }
    var result=document.querySelector('#s-result.active');
    if(!result)return;
    if(!activeRun.resultShownAt)activeRun.resultShownAt=Date.now();
    if(activeRun.celebrationReady||Date.now()-activeRun.resultShownAt<1200)return;
    if(document.querySelector('#bf-end-cine,#bf-end-heroes,#bf-abil-anim,#bf-spec-cine,#bf-kill-ov'))return;
    if(typeof window.__bfCinematicBusy==='function'&&window.__bfCinematicBusy())return;
    if(typeof window.__bfIndicatorsBusy==='function'&&window.__bfIndicatorsBusy())return;
    activeRun.celebrationReady=true;
    tell({bfMissionCelebrationReady:activeRun.run_id});
  }
  window.bfOpenMissions=function(replay){
    reportMissionResult();
    if(typeof clearWatchdog==='function')clearWatchdog();
    if(typeof B!=='undefined'&&B)B.over=true;
    G._gameOver=true;
    tell({bfMissionOpen:{nick:(activeRun&&activeRun.nick)||G.names.p,heroes:HEROES.map(function(h){return {id:h.id,number:h.num,name:h.name};}),replay:replay&&activeRun&&activeRun.modality?{mission:activeRun.mission,modality:activeRun.modality,role:activeRun.role,room_code:activeRun.room_code,token:activeRun.token,password:activeRun.password,nick:activeRun.nick,oppNick:activeRun.oppNick,run_id:activeRun.run_id,round:activeRun.round||0}:null}});
  };
  function replayNow(){
    if(!activeRun||!activeRun.modality||activeRun.replayStarted||!document.querySelector('#s-result.active'))return;
    activeRun.replayStarted=true;
    reportMissionResult();
    var ov=document.getElementById('bf-end-cine');if(ov)ov.remove();
    window.bfOpenMissions(true);
  }
  window.bfMissionReplay=function(){
    if(!activeRun||!activeRun.modality||!document.querySelector('#s-result.active'))return;
    if(typeof NET==='undefined'||!NET.conn||!NET.conn.open)return;
    var rid=activeRun.run_id;
    if(NET.role==='client'){
      netSend({t:'bfMissionReplayRequest',run_id:rid});
      var b=document.getElementById('bf-mission-replay');if(b){b.disabled=true;b.textContent='Esperando al anfitrión…';}
      resendReplay(function(){netSend({t:'bfMissionReplayRequest',run_id:rid});});
    }else{
      netSend({t:'bfMissionReplayStart',run_id:rid});
      replayNow();
      resendReplay(function(){netSend({t:'bfMissionReplayStart',run_id:rid});});
    }
  };
  // Los mensajes de revancha se reenvían hasta que la otra parte actúa (o cambia la partida).
  var replayTimer=null;
  function resendReplay(fn){
    clearInterval(replayTimer);var n=0,rid=activeRun&&activeRun.run_id;
    replayTimer=setInterval(function(){
      if(!activeRun||activeRun.run_id!==rid||n++>25||typeof NET==='undefined'||!NET.conn||!NET.conn.open){clearInterval(replayTimer);return;}
      if(NET.role==='client'&&activeRun.replayStarted){clearInterval(replayTimer);return;}
      try{fn();}catch(e){}
    },1500);
  }
  var replayConn=null;
  setInterval(function(){
    if(typeof NET==='undefined'||!NET.conn||NET.conn===replayConn)return;
    replayConn=NET.conn;
    replayConn.on('data',function(msg){
      if(!msg||!activeRun||!activeRun.modality||msg.run_id!==activeRun.run_id)return;
      if(msg.t==='bfMissionReplayRequest'&&NET.role==='host')window.bfMissionReplay();
      if(msg.t==='bfMissionReplayStart'&&NET.role==='client')replayNow();
    });
  },350);
  window.bfSetupMissionMp=function(){
    var mp=window.bfMissionMpConfig;if(!mp)return;
    var tp=mp.myTeam.map(function(id){return HEROES.find(function(h){return h.id===id;});});
    var to=mp.oppTeam.map(function(id){return HEROES.find(function(h){return h.id===id;});});
    if(tp.length!==3||to.length!==3||tp.concat(to).some(function(h){return !h;})){tell({bfMissionStartError:'Algún héroe no está disponible en el motor.'});return;}
    G.bfMission={run_id:mp.run_id,mission:mp.mission,modality:mp.modality,role:mp.role,room_code:mp.room_code,token:mp.token,password:mp.password,nick:mp.nick,oppNick:mp.oppNick,round:mp.round};activeRun=G.bfMission;
    G.mode='online';G.online=true;G.demo=false;G.demoExample=false;G._gameOver=false;G._result=null;G.__bfAdWarnAck=false;
    G.team={p:tp.map(makeInstance),o:to.map(makeInstance)};
    var eqC=150;G.coins={p:0,o:0};G.equipCoins={p:eqC,o:eqC};G.equipReserve={p:0,o:0};G.bfEquipXfer={p:0,o:0};
    G.spellbook={p:[],o:[]};G.items={p:[],o:[]};G.bonus={p:null,o:null};G.eqReady={p:false,o:false};G.pendDebt={p:0,o:0};
    G.names.o=mp.oppNick||'Rival';var mySide=mp.role==='host'?'p':'o';G.eqSide=mySide;G.eqShop='spell';G.assign=null;
    G.__bfWinCounted=false;G.__bfScoredOnce=false;window.__bfResultSent=false;window.__bfLogSent=false;window.__bfEndCine=0;
    B=null;show('s-equip');renderEquip(mySide);netSync('s-equip');tell({bfMissionStarted:mp.run_id});window.bfMissionMpConfig=null;
  };
  window.addEventListener('message',function(e){
    if(e.source!==parent)return;
    if(activeRun&&e.data&&e.data.bfMissionResultAck===activeRun.run_id){activeRun.acknowledged=true;return;}
    if(activeRun&&e.data&&e.data.bfMissionSaveFailed===activeRun.run_id){window.bfOpenMissions();return;}
    if(e.data&&e.data.bfMissionReopen){if(activeRun&&document.querySelector('#s-result.active'))window.bfOpenMissions();return;}
    if(e.data&&e.data.bfMissionClose){G.bfMission=null;activeRun=null;if(originalMeta){window.__bfAiLevelMeta=originalMeta;originalMeta=null;}goSetup();return;}
    var mpc=e.data&&e.data.bfMissionMpConnect;if(mpc){window.bfMissionMpConfig=mpc;window.bfMissionMpRequested=mpc.role==='host';G._gameOver=false;window.__bfRoomMode='private';if(mpc.role==='host'){if(typeof hostCreate==='function')hostCreate(mpc.nick,mpc.password,'Misión '+missionName(mpc.mission));}else{if(typeof clientJoin==='function')clientJoin(mpc.game_code,mpc.password,mpc.nick);}return;}
    var m=e.data&&e.data.bfMissionStart;if(!m)return;
    var teams={p:m.player.map(function(id){return HEROES.find(function(h){return h.id===id;});}),o:m.rival.map(function(id){return HEROES.find(function(h){return h.id===id;});})};
    if(teams.p.length!==3||teams.o.length!==3||teams.p.concat(teams.o).some(function(h){return !h;})){tell({bfMissionStartError:'Algún héroe no está disponible en el motor.'});return;}
    if(!originalMeta)originalMeta=window.__bfAiLevelMeta;
    window.__bfAiLevelMeta=(window.__bfAiLevels||[]).find(function(l){return l.id===m.ai;})||originalMeta;
    G.bfMission={run_id:m.run_id,mission:m.mission,level:m.level};activeRun=G.bfMission;
    G.mode='ai';G.online=false;G.demo=false;G.demoExample=false;G._gameOver=false;G._result=null;G.__bfAdWarnAck=false;NET.role='local';NET.mySide='p';
    G.team={p:teams.p.map(makeInstance),o:teams.o.map(makeInstance)};
    var eqC=150;G.coins={p:0,o:0};G.equipCoins={p:eqC,o:eqC};G.equipReserve={p:0,o:0};G.bfEquipXfer={p:0,o:0};
    G.spellbook={p:[],o:[]};G.items={p:[],o:[]};G.bonus={p:null,o:null};G.eqReady={p:false,o:false};G.pendDebt={p:0,o:0};
    G.names.o='Misión '+missionName(m.mission).toUpperCase()+' · Nivel '+m.level;G.eqSide='p';G.eqShop='spell';G.assign=null;
    G.__bfWinCounted=false;G.__bfScoredOnce=false;window.__bfResultSent=false;window.__bfLogSent=false;window.__bfEndCine=0;
    ['bf-end-cine','bf-end-heroes'].forEach(function(id){var n=document.getElementById(id);if(n)n.remove();});
    B=null;aiEquip('o');show('s-equip');renderEquip('p');tell({bfMissionStarted:m.run_id});
  });
  var applyMpSnapshot=window.applySnapshot;
  window.applySnapshot=function(snap){
    var result=applyMpSnapshot.apply(this,arguments),mp=window.bfMissionMpConfig;
    if(mp&&mp.role==='guest'&&snap&&snap.screen==='s-equip'){
      G.online=true;G._gameOver=false;G.bfMission={run_id:mp.run_id,mission:mp.mission,modality:mp.modality,role:mp.role,room_code:mp.room_code,token:mp.token,password:mp.password,nick:mp.nick,oppNick:mp.oppNick,round:mp.round};activeRun=G.bfMission;
      tell({bfMissionStarted:mp.run_id});window.bfMissionMpConfig=null;
    }
    return result;
  };
  function refresh(){
    var row=document.querySelector('#s-setup #p1name');
    if(row){
      var btn=document.getElementById('bf-missions-entry');
      if(!btn){
        btn=document.createElement('button');btn.id='bf-missions-entry';btn.className='btn primary bf-missions-entry';btn.innerHTML='<span>⚔️</span><strong>Misiones</strong><small>Preludio de la campaña</small>';
        btn.onclick=function(){window.bfMissionRequested=true;startVsAI();};
      }
      var box=row.closest('.setup-box');
      var passWrap=box&&box.querySelector('.bf-pass-wrap');
      if(passWrap){passWrap.insertAdjacentElement('afterend',btn);}
      else{var grid=box&&box.querySelector('.mode-grid');if(grid)grid.insertAdjacentElement('afterend',btn);else if(box)box.appendChild(btn);}
    }
    if(!G.bfMission)return;
    reportMissionResult();
    var oldReplay=document.getElementById('bf-mission-replay');
    if(!G.bfMission.modality && oldReplay)oldReplay.remove();
    if(G.bfMission.modality && document.querySelector('#s-result.active') && !oldReplay){
      var replayBtn=document.createElement('button');replayBtn.id='bf-mission-replay';replayBtn.className='btn primary';replayBtn.textContent='Volver a jugar la misión';replayBtn.onclick=window.bfMissionReplay;
      document.querySelector('#s-result.active').appendChild(replayBtn);
    }
    var subtitle=document.querySelector('#s-equip .r-subtitle');if(subtitle&&subtitle.textContent.indexOf('Misión')!==0){var ec=150;var lbl='Misión '+missionName(G.bfMission.mission).toUpperCase();if(G.bfMission.level)lbl+=' · Nivel '+G.bfMission.level;if(G.bfMission.modality)lbl+=' · '+G.bfMission.modality;lbl+=' · '+ec+' monedas de equipamiento';if(!G.bfMission.modality)lbl+=' · Sin sobrante de héroes';subtitle.textContent=lbl;}
    var header=document.querySelector('#s-equip.active .r-header');
    if(header&&!document.getElementById('bf-mission-back')){var back=document.createElement('button');back.id='bf-mission-back';back.className='btn sm';back.textContent='Volver a misiones';back.onclick=window.bfOpenMissions;header.appendChild(back);}
    var result=document.querySelector('#s-result.active');if(!result)return;
    result.querySelectorAll('button').forEach(function(b){if(/bfRematch|bfMatchRematch|location.reload/.test(b.getAttribute('onclick')||'')){b.removeAttribute('onclick');b.textContent='Volver a misiones';b.onclick=window.bfOpenMissions;}});
  }
  document.addEventListener('click',function(e){if(e.target.closest('[onclick="startVsAI()"]'))window.bfMissionRequested=false;},true);
  var missionStyle=document.createElement('style');missionStyle.textContent='#bf-missions-entry{display:grid;grid-template-columns:auto auto;align-items:center;justify-content:center;column-gap:10px;width:min(440px,92%);margin:14px auto;padding:15px 24px;border:2px solid #ffd24a;box-shadow:0 0 22px rgba(255,210,74,.25)}#bf-missions-entry span{grid-row:1/3;font-size:28px}#bf-missions-entry strong{font:900 18px Cinzel,serif;letter-spacing:.06em}#bf-missions-entry small{font-size:11px;opacity:.8}';document.head.appendChild(missionStyle);
  // Observe the engine's committed result, not a replaceable/delayed showResult wrapper.
  setInterval(refresh,350);
})();
</script>`;