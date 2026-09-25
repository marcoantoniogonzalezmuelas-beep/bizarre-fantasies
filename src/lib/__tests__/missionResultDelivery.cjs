const fs = require('fs'), vm = require('vm'), assert = require('assert');
function load(path, names, globals = {}) {
  const source = fs.readFileSync('/app/' + path, 'utf8').replace(/^import .*;\n/gm, '').replace(/export default /g, '').replace(/export /g, '');
  const context = vm.createContext(globals); vm.runInContext(source + ';this.api={' + names + '}', context); return context.api;
}
module.exports = async function missionResultDelivery(database) {
  const memory = new Map(), storage = { getItem:k=>memory.get(k)||null, setItem:(k,v)=>memory.set(k,v), removeItem:k=>memory.delete(k) };
  const pending = load('src/components/missions/missionPendingVictory.js', 'readPendingVictory,rememberPendingVictory,clearPendingVictory', { localStorage: storage });
  const persist = load('src/components/missions/missionPersistence.js', 'loadVictories,saveVictory', { base44: database });
  const rules = load('src/components/missions/missionRules.js', 'LEVELS,unlocked,winsFor');
  const patch = load('src/lib/missionEnginePatch.js', 'MISSION_ENGINE_PATCH');
  const messages = [], intervals = [], handlers = {}, root = { querySelectorAll:()=>[] };
  let now = 10000, visible = false, cinematic = false;
  const c = { G:{names:{p:'QA'},_result:null}, B:null, NET:{}, HEROES:[{id:'a'},{id:'b'},{id:'c'}], parent:{postMessage:m=>messages.push(m)},
    Date:{now:()=>now}, makeInstance:h=>({...h}), aiEquip(){}, show(){}, renderEquip(){}, clearWatchdog(){}, goSetup(){},
    setInterval:f=>intervals.push(f), addEventListener:(k,f)=>handlers[k]=f,
    document:{head:{appendChild(){}},createElement:()=>({}),getElementById:()=>null,addEventListener(){},querySelector:s=>s==='#s-result.active'?(visible?root:null):(s.startsWith('#bf-end-cine')&&cinematic?{}:null)} };
  c.window=c;vm.createContext(c);vm.runInContext(patch.MISSION_ENGINE_PATCH.replace('<script>','').replace('</script>',''),c);
  const send=data=>handlers.message({source:c.parent,data}), tick=()=>intervals.forEach(f=>f());
  send({unrelated:true});
  const run={nick:'qa-mission-delivery',run_id:'qa-'+Date.now(),mission:'todos',level:2,ai:'novice',player:['a','b','c'],rival:['a','b','c']};
  send({bfMissionStart:run}); tick(); assert(!messages.some(m=>m.bfMissionResult));
  // Native final state without calling showResult: this was dropped by the old hook.
  c.B={over:true};c.G._result={pWin:true};c.G._gameOver=true;visible=true;cinematic=true;tick();
  assert.equal(messages.filter(m=>m.bfMissionResult).length,1);assert.equal(messages.at(-1).bfMissionResult.won,true);
  now+=1100;tick();assert.equal(messages.filter(m=>m.bfMissionResult).length,2);
  send({bfMissionResultAck:run.run_id});now+=1100;tick();assert.equal(messages.filter(m=>m.bfMissionResult).length,2);
  assert(!messages.some(m=>m.bfMissionCelebrationReady));cinematic=false;tick();tick();assert.equal(messages.filter(m=>m.bfMissionCelebrationReady).length,1);
  const queued=pending.rememberPendingVictory(run);assert.equal(pending.readPendingVictory().run_id,run.run_id);
  let saved;
  try {
    saved=await persist.saveVictory(queued);assert(saved.id);const duplicate=await persist.saveVictory(queued);assert.equal(duplicate.id,saved.id);
    const rows=await persist.loadVictories(run.nick);assert.equal(rules.winsFor(rows,'todos',2),1);assert(rules.unlocked(rows,'todos',rules.LEVELS[2]));
    pending.clearPendingVictory(run.run_id);assert.equal(pending.readPendingVictory(),null);
  } finally { if(saved)await database.entities.MissionVictory.delete(saved.id); }
  // A following defeat must not inherit the preceding win.
  send({bfMissionStart:{...run,run_id:run.run_id+'-loss'}});c.G._result={pWin:false};c.G._gameOver=true;tick();assert.equal(messages.at(-1).bfMissionResult.won,false);
  return {nativeResultWithoutDisplayHook:'pass',deliveryRetryAndAck:'pass',celebrationAfterCinematics:'pass',pendingRecovery:'pass',savedOnce:'pass',levelTwoCounter:'1/1',levelThreeUnlocked:true,consecutiveLoss:'pass',testVictoryDeleted:true};
};