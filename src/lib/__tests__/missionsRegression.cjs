const fs = require('fs'), vm = require('vm'), assert = require('assert');
const root = '/app/';
function moduleApi(file, names, globals = {}) { const src = fs.readFileSync(root + file, 'utf8').replace(/^import .*;\n/gm, '').replace(/export /g, ''); const context = vm.createContext(globals); vm.runInContext(src + ';this.api={' + names + '};', context); return context.api; }
module.exports = async function missionsRegression(cards, html) {
  const rules = moduleApi('src/components/missions/missionRules.js', 'LEVELS,MISSIONS,missionPool,heroBudget,availableTeams,drawPack,chooseRival,valueOf,epicCount,unlocked,winsFor');
  let balanceCases = 0;
  for (const m of rules.MISSIONS) for (const l of rules.LEVELS) {
    const pool = rules.missionPool(cards, m.id), budget = rules.heroBudget(pool, l);
    const teams = rules.availableTeams(pool, l).filter(t => l.pack || rules.valueOf(t) <= budget);
    assert(teams.length > 0);
    for (const t of teams) { const r = rules.chooseRival(pool, t, l); assert.equal(r.length, 3); assert.equal(new Set(t.map(c => c.id)).size, 3); if(l.pack) assert.equal(rules.epicCount(t), rules.epicCount(r)); if(l.id===5)assert.equal(rules.epicCount(t),1); balanceCases++; }
    assert.equal(rules.unlocked([], m.id, l), l.id===1);
  }
  const records = [], database = {entities:{MissionVictory:{filter:async q=>records.filter(r=>Object.keys(q).every(k=>r[k]===q[k])),create:async r=>{const saved={...r,id:'test-'+records.length};records.push(saved);return saved;}}}};
  const persistence = moduleApi('src/components/missions/missionPersistence.js','saveVictory,loadVictories',{base44:database});
  await persistence.saveVictory({nick:'QA',mission:'club',level:1,run_id:'once'});await persistence.saveVictory({nick:'QA',mission:'club',level:1,run_id:'once'});
  assert.equal(records.length,1);assert.equal((await persistence.loadVictories('QA')).length,1);assert(rules.unlocked(records,'club',rules.LEVELS[1]));assert(!rules.unlocked(records,'l5r',rules.LEVELS[1]));
  const patch = moduleApi('src/lib/missionEnginePatch.js','patchMissionHtml,MISSION_ENGINE_PATCH');
  const patched = patch.patchMissionHtml(html); assert(patched.includes('window.bfOpenMissions();return;'));
  const events={},messages=[],intervals=[];let auctions=0,screen='',eqCalls=0;
  const c={parent:{postMessage:m=>messages.push(m)},G:{names:{p:'QA'}},B:null,NET:{},HEROES:[{id:'a'},{id:'b'},{id:'c'}],makeInstance:h=>({...h}),clearWatchdog(){},goSetup(){screen='s-setup';},aiEquip:()=>eqCalls++,show:s=>screen=s,renderEquip(){},showResult:w=>{screen='s-result';},setInterval:f=>intervals.push(f),document:{getElementById:()=>null,querySelector:()=>null,addEventListener(){}},addEventListener:(key,cb)=>events[key]=cb}; c.window=c;
  vm.createContext(c);vm.runInContext(patch.MISSION_ENGINE_PATCH.replace('<script>','').replace('</script>',''),c);
  const match={run_id:'run',mission:'club',level:1,ai:'novice',player:['a','b','c'],rival:['a','b','c']};events.message({source:c.parent,data:{bfMissionStart:match}});
  assert.equal(screen,'s-equip');assert.equal(c.G.equipCoins.p,100);assert.equal(c.G.coins.p,0);assert.equal(eqCalls,1);assert.equal(c.G.team.p.length,3);
  c.B={over:true};c.showResult(true);c.showResult(true);assert.equal(messages.filter(m=>m.bfMissionResult).length,1);assert.equal(messages.find(m=>m.bfMissionResult).bfMissionResult.won,true);
  events.message({source:c.parent,data:{bfMissionStart:{...match,run_id:'loss'}}});c.B={over:true};c.showResult(false);assert.equal(messages.filter(m=>m.bfMissionResult).length,2);assert.equal(messages.at(-1).bfMissionResult.won,false);
  events.message({source:c.parent,data:{bfMissionClose:true}});assert.equal(c.G.bfMission,null);assert.equal(screen,'s-setup');
  return {balanceCases,duplicateVictory:'pass',perMissionUnlocks:'pass',equipmentBudget:'pass',engineWinLossAndReturn:'pass',persistence:'mocked storage pass'};
};