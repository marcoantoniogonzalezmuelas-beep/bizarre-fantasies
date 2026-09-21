const fs=require('node:fs'), vm=require('node:vm'), path=require('node:path'), assert=require('node:assert/strict');
module.exports=async function relayOutboxRegression(){
  const source=fs.readFileSync(path.join(__dirname,'..','relayOutboxPatch.js'),'utf8');
  const script=vm.runInNewContext(source.replace(/export /g,'')+'\nRELAY_OUTBOX_PATCH').replace(/^\s*<script>/,'').replace(/<\/script>\s*$/,'');
  let serial=0, fail=false;const timers=new Map(),sent=[],results=[];
  const c={crypto:{randomUUID:()=> 'test-session'},Date,JSON,Math,setTimeout:(fn,ms)=>{timers.set(++serial,{fn,ms});return serial;},clearTimeout:id=>timers.delete(id)};c.window=c;vm.createContext(c);vm.runInContext(script,c);
  const box=c.bfCreateRelayOutbox(async(action,payload)=>{sent.push(JSON.parse(JSON.stringify(payload)));if(fail)throw Error('offline');return {ok:true};},'g','QAONLY',()=>{});
  const flush=async()=>{const entry=timers.entries().next().value;assert.ok(entry);timers.delete(entry[0]);entry[1].fn();for(let n=0;n<8;n++)await Promise.resolve();};
  const intent={t:'intent',op:'defend'};box.send(intent);intent.op='changed';
  assert.equal([...timers.values()][0].ms,0);await flush();assert.equal(sent[0].messages[0].op,'defend');results.push({name:'Immediate send retains immutable click payload',pass:true});
  fail=true;box.send({t:'intent',op:'melee'});await flush();const retryId=sent.at(-1).batch_id;assert.equal([...timers.values()][0].ms,1000);
  box.send({t:'intent',op:'target',id:'enemy'});assert.equal([...timers.values()][0].ms,1000);fail=false;await flush();assert.equal(sent.at(-1).batch_id,retryId);await flush();assert.equal(sent.at(-1).messages[0].op,'target');results.push({name:'Retries preserve batch identity and FIFO without bypassing backoff',pass:true});
  box.send({t:'snap'});assert.equal([...timers.values()][0].ms,0);box.close();assert.equal(timers.size,0);results.push({name:'Snapshots have no batching delay and closing cancels sends',pass:true});
  return results;
};