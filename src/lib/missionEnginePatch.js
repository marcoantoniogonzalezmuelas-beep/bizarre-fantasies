// Native initialization stays authoritative; only the mission branch skips auctions.
export function patchMissionHtml(html) {
  const init = "show('s-recruit'); startAuctionPhase();";
  if (!html.includes(init)) throw new Error('No se encuentra el inicio del juego para las misiones.');
  return html.replace(init, "if(window.bfMissionRequested){window.bfMissionRequested=false;window.bfOpenMissions();return;} G.bfMission=null; " + init);
}
export const MISSION_ENGINE_PATCH = `<script>
(function(){
  var originalMeta=null, activeRun=null;
  function tell(data){parent.postMessage(data,'*');}
  window.bfOpenMissions=function(){
    if(typeof clearWatchdog==='function')clearWatchdog();
    if(typeof B!=='undefined'&&B)B.over=true;
    G._gameOver=true;
    tell({bfMissionOpen:{nick:G.names.p,heroes:HEROES.map(function(h){return {id:h.id,number:h.num,name:h.name};})}});
  };
  window.addEventListener('message',function(e){
    if(e.source!==parent)return;
    if(e.data&&e.data.bfMissionClose){G.bfMission=null;activeRun=null;if(originalMeta){window.__bfAiLevelMeta=originalMeta;originalMeta=null;}goSetup();return;}
    var m=e.data&&e.data.bfMissionStart;if(!m)return;
    var teams={p:m.player.map(function(id){return HEROES.find(function(h){return h.id===id;});}),o:m.rival.map(function(id){return HEROES.find(function(h){return h.id===id;});})};
    if(teams.p.length!==3||teams.o.length!==3||teams.p.concat(teams.o).some(function(h){return !h;})){tell({bfMissionStartError:'Algún héroe no está disponible en el motor.'});return;}
    if(!originalMeta)originalMeta=window.__bfAiLevelMeta;
    window.__bfAiLevelMeta=(window.__bfAiLevels||[]).find(function(l){return l.id===m.ai;})||originalMeta;
    G.bfMission={run_id:m.run_id,mission:m.mission,level:m.level};activeRun=G.bfMission;
    var isLocal=m.mode==='local';G.mode=isLocal?'local':'ai';G.online=false;G.demo=false;G.demoExample=false;G.oppHuman=isLocal;G._gameOver=false;G._result=null;G.__bfAdWarnAck=false;NET.role='local';NET.mySide='p';
    G.team={p:teams.p.map(makeInstance),o:teams.o.map(makeInstance)};
    var eqC=Math.max(100,[150,140,130,120,100][(m.level||1)-1]||100);G.coins={p:0,o:0};G.equipCoins={p:eqC,o:eqC};G.equipReserve={p:0,o:0};G.bfEquipXfer={p:0,o:0};
    G.spellbook={p:[],o:[]};G.items={p:[],o:[]};G.bonus={p:null,o:null};G.eqReady={p:false,o:false};G.pendDebt={p:0,o:0};
    G.names.o=isLocal?(m.p2name||'Jugador 2'):'Misión '+m.mission.toUpperCase()+' · Nivel '+m.level;G.eqSide='p';G.eqShop='spell';G.assign=null;
    G.__bfWinCounted=false;G.__bfScoredOnce=false;window.__bfResultSent=false;window.__bfLogSent=false;window.__bfEndCine=0;
    ['bf-end-cine','bf-end-heroes'].forEach(function(id){var n=document.getElementById(id);if(n)n.remove();});
    B=null;if(!isLocal)aiEquip('o');show('s-equip');renderEquip('p');tell({bfMissionStarted:m.run_id});
  });
  function refresh(){
    var row=document.querySelector('#s-setup #p1name');
    if(row&&!document.getElementById('bf-missions-entry')){
      var btn=document.createElement('button');btn.id='bf-missions-entry';btn.className='btn primary bf-missions-entry';btn.innerHTML='<span>⚔️</span><strong>Misiones</strong><small>Preludio de la campaña</small>';
      btn.onclick=function(){window.bfMissionRequested=true;startVsAI();};
      var grid=row.closest('.setup-box').querySelector('.mode-grid');grid.insertAdjacentElement('afterend',btn);
    }
    if(!G.bfMission)return;
    var subtitle=document.querySelector('#s-equip .r-subtitle');if(subtitle&&subtitle.textContent.indexOf('Misión')!==0){var ec=Math.max(100,[150,140,130,120,100][(G.bfMission.level||1)-1]||100);subtitle.textContent='Misión '+G.bfMission.mission.toUpperCase()+' · Nivel '+G.bfMission.level+' · '+ec+' monedas de equipamiento · Sin sobrante de héroes';}
    var header=document.querySelector('#s-equip.active .r-header');
    if(header&&!document.getElementById('bf-mission-back')){var back=document.createElement('button');back.id='bf-mission-back';back.className='btn sm';back.textContent='Volver a misiones';back.onclick=window.bfOpenMissions;header.appendChild(back);}
    var result=document.querySelector('#s-result.active');if(!result)return;
    result.querySelectorAll('button').forEach(function(b){if(/bfRematch|bfMatchRematch|location.reload/.test(b.getAttribute('onclick')||'')){b.removeAttribute('onclick');b.textContent='Volver a misiones';b.onclick=window.bfOpenMissions;}});
  }
  document.addEventListener('click',function(e){if(e.target.closest('[onclick="startVsAI()"]'))window.bfMissionRequested=false;},true);
  var missionStyle=document.createElement('style');missionStyle.textContent='#bf-missions-entry{display:grid;grid-template-columns:auto auto;align-items:center;justify-content:center;column-gap:10px;width:min(440px,92%);margin:22px auto;padding:15px 24px;border:2px solid #ffd24a;box-shadow:0 0 22px rgba(255,210,74,.25)}#bf-missions-entry span{grid-row:1/3;font-size:28px}#bf-missions-entry strong{font:900 18px Cinzel,serif;letter-spacing:.06em}#bf-missions-entry small{font-size:11px;opacity:.8}';document.head.appendChild(missionStyle);
  var resultFn=window.showResult;
  window.showResult=function(won){
    if(G.bfMission&&activeRun&&!activeRun.reported&&typeof B!=='undefined'&&B&&B.over){activeRun.reported=true;tell({bfMissionResult:{run_id:activeRun.run_id,won:!!won}});}
    return resultFn.apply(this,arguments);
  };
  setInterval(refresh,350);
})();
</script>`;