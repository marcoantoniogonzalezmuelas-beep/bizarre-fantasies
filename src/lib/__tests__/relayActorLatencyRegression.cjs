// El actor debe entregar y confirmar una jugada SIN esperar al guardado en disco
// (antes el broadcast iba después de reescribir toda la cola: retraso al pasar turno).
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const src=fs.readFileSync(path.join(__dirname,'..','..','..','base44','actors','GameRelayRoom','entry.ts'),'utf8')
  .replace(/^import .*;$/gm,'').replace('export default class','class');
const PUT_MS=120;
function makeRoom(){
  class Actor{constructor(){this.conns=[];this.puts=[];this.stored={};this.instanceId='ROOM';
    this.storage={get:async k=>this.stored[k],put:async(k,v)=>{await new Promise(r=>setTimeout(r,PUT_MS));this.stored[k]=JSON.parse(JSON.stringify(v));this.puts.push(k);}};
    this.client={asServiceRole:{entities:{GameRoom:{filter:async()=>[{state:{owner_token:'tp',guest_token:'tg'}}]}}}};}
    getConnections(){return this.conns;} broadcast(m){this.conns.forEach(c=>c.send(m));}}
  const Room=new Function('Actor',src+'\nreturn GameRelayRoom;')(Actor);
  const room=new Room();const mk=id=>{const c={id,got:[],send(m){c.got.push({m,t:Date.now()});}};room.conns.push(c);return c;};
  return {room,p:mk('p1'),g:mk('g1')};
}
async function join(room,p,g){
  await room.handleMessage(p,{type:'hello',side:'p',token:'tp'});await room.handleMessage(g,{type:'hello',side:'g',token:'tg'});
  p.got.length=0;g.got.length=0;
}
test('a move reaches the rival and is acknowledged BEFORE the storage write finishes',async()=>{
  const {room,p,g}=makeRoom();await join(room,p,g);
  const t0=Date.now();const done=room.handleMessage(p,{type:'send_batch',batch_id:'b1',messages:[{t:'snap',n:1}]});
  await new Promise(r=>setTimeout(r,20)); // mucho menos que PUT_MS
  const delivered=g.got.find(x=>x.m.type==='deliveries'),acked=p.got.find(x=>x.m.type==='batch_ack');
  assert(delivered,'rival got the delivery before the disk write');assert(acked,'sender got its ack before the disk write');
  assert(delivered.t-t0<PUT_MS/2,'delivery latency '+(delivered.t-t0)+'ms must not include the put');
  await done;assert.equal(room.stored.relay.p.length,1,'still persisted afterwards');
});
test('back-to-back moves keep their order and are not serialized behind disk writes',async()=>{
  const {room,p,g}=makeRoom();await join(room,p,g);const t0=Date.now();
  for(let i=1;i<=5;i++)room.handleMessage(p,{type:'send_batch',batch_id:'b'+i,messages:[{t:'intent',i}]});
  await new Promise(r=>setTimeout(r,30));
  const ids=g.got.filter(x=>x.m.type==='deliveries').map(x=>x.m.deliveries[0].data.i);
  assert.deepEqual(ids,[1,2,3,4,5]);assert(Date.now()-t0<PUT_MS,'five moves delivered in well under one disk write');
  await room.persisting;assert.equal(room.stored.relay.p.length,5,'final state fully persisted');const relayWrites=room.puts.filter(k=>k==='relay').length;assert(relayWrites<=2,'relay writes are coalesced, not one per message ('+relayWrites+')');
});
test('retry of the same batch is re-delivered and acked but not stored twice; acks prune the queue; guests cannot send snaps',async()=>{
  const {room,p,g}=makeRoom();await join(room,p,g);
  room.handleMessage(p,{type:'send_batch',batch_id:'r1',messages:[{t:'x'}]});
  room.handleMessage(p,{type:'send_batch',batch_id:'r1',messages:[{t:'x'}]});
  assert.equal(room.relay.p.length,1);assert.equal(p.got.filter(x=>x.m.type==='batch_ack').length,2);
  room.handleMessage(g,{type:'ack_deliveries',ids:['r1_0']});assert.equal(room.relay.p.length,0);
  room.handleMessage(g,{type:'send_batch',batch_id:'s1',messages:[{t:'snap'}]});assert.equal(room.relay.g.length,0,'guest snap rejected');
  await room.persisting;
});
