// RANKING: ninguna partida se pierde en silencio (servidor -> escritura directa -> cola persistente) y las
// partidas de MISIÓN (solitario y multijugador) tienen su propia sección.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),root=path.join(__dirname,'..','..','..'),read=f=>fs.readFileSync(lib(f),'utf8');
const load=f=>import(pathToFileURL(f.startsWith('/')?f:lib(f)).href);

async function client(){   // gameRecordClient + resultSaver con el SDK de la plataforma sustituido
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bf-rank-'));
  fs.writeFileSync(path.join(dir,'package.json'),'{"type":"module"}');
  fs.writeFileSync(path.join(dir,'gameRecordClient.js'),read('gameRecordClient.js').replace("import { base44 } from '@/api/base44Client';","const base44 = { functions: { invoke: (...a) => globalThis.__fakeB44.functions.invoke(...a) } };"));
  fs.writeFileSync(path.join(dir,'resultSaver.js'),read('resultSaver.js').replace("'@/lib/gameRecordClient'","'./gameRecordClient.js'"));
  const rc=await import(pathToFileURL(path.join(dir,'gameRecordClient.js')).href),rs=await import(pathToFileURL(path.join(dir,'resultSaver.js')).href);
  return {...rc,...rs,dir};
}
const httpErr=(status,error)=>{const e=new Error('http '+status);e.response={status,data:error?{ok:false,error}:{}};return e;};
const mem=()=>{const m={};return {m,getItem:k=>(k in m?m[k]:null),setItem:(k,v)=>{m[k]=String(v);}};};
const result=(o={})=>({mode:'ia',winner_nick:'Ana',loser_nick:'IA Novata',loser_is_ai:true,winner_is_ai:false,ai_level:'novice',winner_heroes:[],loser_heroes:[],...o});

test('THE BUG: a platform 400/401/403/500 (no server code) no longer drops the result — only the server\'s own rejection codes do',async()=>{
  const C=await client();
  const mk=(status,code)=>{globalThis.__fakeB44={functions:{invoke:async()=>{throw httpErr(status,code);}}};return C.recordGame('match',{result:result()}).catch(e=>e);};
  for(const [status,code,expected] of [[400,undefined,false],[401,undefined,false],[403,undefined,false],[500,'db_error',false],[404,undefined,false],[502,undefined,false],
      [400,'invalid_result',true],[429,'rate_limited',true],[403,'unauthorized',true],[422,'blocked',true],[404,'room_not_found',true]]){
    const e=await mk(status,code);assert.equal(C.isRejection(e),expected,`HTTP ${status} ${code||'(no code)'} -> rejection=${expected}`);
  }
  delete globalThis.__fakeB44;
});
test('three layers: server -> direct write -> persistent queue; every failure leaves a trace',async()=>{
  const C=await client(),box=(await load('resultOutbox.js')).createOutbox(mem()),log=[],direct=[];
  const down=async()=>{throw Object.assign(new Error('forbidden'),{status:403,code:'record_failed'});};
  // 1) servidor caído por un 403 de plataforma: guarda por escritura directa (antes: se perdía)
  let st=await C.saveResult({kind:'match',result:result()},box,{record:down,reject:C.isRejection,direct:async r=>direct.push(r),notify:i=>log.push(i)});
  assert.equal(st,'ok');assert.equal(direct.length,1);assert.equal(box.size(),0);assert.equal(log[0].stage,'server');assert.equal(log[0].status,403);
  // 2) servidor y escritura directa fallan (permisos cerrados + función caída): NO se pierde, queda en cola
  st=await C.saveResult({kind:'match',result:result({winner_nick:'Bob'}),key:'k1'},box,{record:down,reject:C.isRejection,direct:async()=>{throw new Error('RLS');},notify:i=>log.push(i)});
  assert.equal(st,'retry');assert.equal(box.size(),1,'queued on the device');assert.ok(log.some(l=>l.stage==='direct'),'both failures are reported');
  // 3) rechazo explícito del servidor: no se reintenta por otro camino ni se encola
  st=await C.saveResult({kind:'match',result:result({winner_nick:'C'})},box,{record:async()=>{throw Object.assign(new Error('x'),{status:400,code:'invalid_result'});},reject:C.isRejection,direct:async r=>direct.push(r)});
  assert.equal(st,'reject');assert.equal(direct.length,1,'no direct write after a deliberate rejection');assert.equal(box.size(),1);
  // 4) éxito por el servidor: se avisa al llamador (avatar/progreso de IA)
  let seen=null;st=await C.saveResult({kind:'match',result:result()},box,{record:async()=>({ok:true,ai_wins:3}),onServer:res=>{seen=res;}});assert.equal(st,'ok');assert.equal(seen.ai_wins,3);
});
test('persistent queue: survives a reload, retries with backoff, never duplicates, gives up on old/hopeless items',async()=>{
  const {createOutbox,OUTBOX_KEY}=await load('resultOutbox.js');let now=1_000_000;const store=mem();
  let box=createOutbox(store,()=>now);assert.equal(box.add({kind:'match',result:{a:1},key:'r1'}),true);assert.equal(box.add({kind:'match',result:{a:1},key:'r1'}),false,'same result is not queued twice');box.add({kind:'match',result:{a:2},key:'r2'});
  box=createOutbox(store,()=>now);assert.equal(box.size(),2,'after a page reload the queue is still there');
  const sent=[];let r=await box.flush(async it=>{if(it.key==='r1')return 'retry';sent.push(it.key);return 'ok';});
  assert.deepEqual(r,{sent:1,kept:1});assert.deepEqual(sent,['r2']);
  r=await box.flush(async()=>{throw new Error('boom');});assert.deepEqual(r,{sent:0,kept:1},'not due yet (backoff): the sender is not even called');
  now+=60000;r=await box.flush(async it=>{assert.equal(it.key,'r1');return 'ok';});assert.deepEqual(r,{sent:1,kept:0});assert.equal(box.size(),0);
  box.add({kind:'match',result:{},key:'old'});now+=8*24*3600*1000;r=await box.flush(async()=>'ok');assert.deepEqual(r,{sent:0,kept:0},'older than 7 days: discarded');
  store.m[OUTBOX_KEY]='{corrupt';assert.equal(createOutbox(store,()=>now).size(),0,'corrupt storage never throws');
  box.add({kind:'match',result:{},key:'rej'});await box.flush(async()=>'reject');assert.equal(box.size(),0,'a deliberate rejection is dropped');
  for(let i=0;i<70;i++)createOutbox(store,()=>now).add({kind:'match',result:{i},key:'n'+i});assert(createOutbox(store,()=>now).size()<=60,'bounded size');
});
test('missions: every mission game (won OR lost, solo or multiplayer) becomes a result the server accepts, once per run',async()=>{
  const C=await client(),{handleRecord,makeLimiter}=await load(path.join(root,'base44/shared/gameRecord.ts')),allow=makeLimiter();
  const mkE=()=>{let n=0;const rows=[];return {rows,async filter(q){return rows.filter(r=>Object.entries(q).every(([k,v])=>r[k]===v));},async create(d){const r={id:'r'+(++n),...d};rows.push(r);return r;},async update(id,d){Object.assign(rows.find(r=>r.id===id),d);}};};
  const E={MatchResult:mkE(),PlayerAvatar:mkE(),PlayerAiProgress:mkE(),HeadToHead:mkE()};
  const solo={nick:'Ana',mission:'club',level:3,run_id:'run-solo-0001',ai:'novice'};
  const win=C.missionResult(solo,true),loss=C.missionResult({...solo,run_id:'run-solo-0002'},false);
  assert.deepEqual([win.mode,win.winner_nick,win.loser_nick,win.winner_is_ai,win.loser_is_ai,win.mission,win.mission_level],['mission','Ana','IA Misión',false,true,'club',3]);
  assert.deepEqual([loss.winner_nick,loss.loser_nick,loss.winner_is_ai,loss.loser_is_ai],['IA Misión','Ana',true,false],'a lost mission is recorded too');
  for(const [r,t] of [[win,1000],[loss,2000]])assert.equal((await handleRecord(E,{kind:'match',result:r},t,allow)).status,200);
  assert.equal(E.MatchResult.rows.length,2);assert.deepEqual([E.MatchResult.rows[0].mode,E.MatchResult.rows[0].mission,E.MatchResult.rows[0].run_id],['mission','club','run-solo-0001']);
  assert.equal(E.PlayerAiProgress.rows.length,0,'mission games do not touch the AI-level progress');
  // multijugador: los dos jugadores informan del MISMO run_id -> una sola fila
  const mpA=C.missionResult({nick:'Ana',oppNick:'Bob',mission:'l5r',modality:'coop',run_id:'run-mp-000001',role:'host'},true),mpB=C.missionResult({nick:'Bob',oppNick:'Ana',mission:'l5r',modality:'coop',run_id:'run-mp-000001',role:'guest'},false);
  assert.equal(mpA.mode,'mission_mp');assert.deepEqual([mpA.winner_nick,mpA.loser_nick,mpA.winner_is_ai,mpA.loser_is_ai],['Ana','Bob',false,false]);assert.deepEqual([mpB.winner_nick,mpB.loser_nick],['Ana','Bob'],'both clients describe the same result');
  assert.equal((await handleRecord(E,{kind:'match',result:mpA},3000,allow)).status,200);const dup=await handleRecord(E,{kind:'match',result:mpB},3100,allow);
  assert.equal(dup.body.duplicate,true);assert.equal(E.MatchResult.rows.filter(r=>r.run_id==='run-mp-000001').length,1,'one row per run_id');
  for(const bad of [{...win,mission:'hack',run_id:'run-bad-00001'},{...win,run_id:'x'},{...win,run_id:undefined}])assert.equal((await handleRecord(E,{kind:'match',result:bad},9000,allow)).status,400,'invalid mission data is rejected');
});
test('ranking section: missions are counted apart from the general ranking, legacy victories merge without double counting',async()=>{
  const tmp=path.join(os.tmpdir(),'bf-rm-'+process.pid+'.mjs');fs.writeFileSync(tmp,read('rankingMissions.js').replace("'@/lib/nickCanon'",JSON.stringify(pathToFileURL(lib('nickCanon.js')).href)));
  const {buildMissionRanking,isMissionRow}=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);const {makeNickDisplay}=await load('nickCanon.js');const d=makeNickDisplay('es');
  const row=(o)=>({mode:'mission',winner_is_ai:false,loser_is_ai:false,...o});
  const rows=[row({winner_nick:'Ana',loser_nick:'IA Misión',loser_is_ai:true,run_id:'r1'}),row({winner_nick:'IA Misión',winner_is_ai:true,loser_nick:'ana',run_id:'r2'}),
    row({mode:'mission_mp',winner_nick:'Ana',loser_nick:'Bob',run_id:'m1'}),row({mode:'mission_mp',winner_nick:'bob',loser_nick:'Cleo',run_id:'m2'}),{mode:'ia',winner_nick:'Zed',loser_nick:'IA Novata',run_id:'g1'}];
  const victories=[{nick:'Ana',run_id:'r1'},{nick:'ANA',run_id:'old-1'},{nick:'Bob',run_id:'old-2'}];
  const R=buildMissionRanking(rows,victories,d);
  assert.deepEqual(R.wins.all,{Ana:3,Bob:2},'r1 counted once even though it exists as a match AND as a legacy victory; AI rows never count');
  assert.deepEqual(R.wins.solo,{Ana:2,Bob:1});assert.deepEqual(R.wins.mp,{Ana:1,Bob:1});
  assert.deepEqual(R.losses.all,{Ana:1,Bob:1,Cleo:1},'a lost solo mission counts for the player; the AI side is ignored');
  assert.equal(isMissionRow(rows[0]),true);assert.equal(isMissionRow(rows[4]),false);assert.equal(isMissionRow(null),false);
  assert.deepEqual(buildMissionRanking(null,null,d),{wins:{all:{},solo:{},mp:{}},losses:{all:{},solo:{},mp:{}}});
});
test('wiring: results go through the safe pipeline, missions are recorded, the ranking has its Missions section, diagnostics are not rejected',()=>{
  const home=read('../pages/Home.jsx'),ms=read('../components/missions/useMissionSession.js'),rk=read('../pages/Ranking.jsx');
  assert.match(home,/saveMatchResult\(r, \{/);assert.doesNotMatch(home,/recordGame\('match'/,'Home no longer calls the server directly for results');
  assert.match(home,/flushResultOutbox\(\)/);assert.match(home,/addEventListener\('online', run\)/,'the queue is retried when the network returns');
  assert.match(home,/CONNECTION_ERROR_TYPES\.includes\(err\.error_type\) \? err\.error_type : 'server_error'/);assert.match(home,/\.\.\.\(err\.side === 'p' \|\| err\.side === 'g' \? \{ side: err\.side \} : \{\}\)/,'side is only sent when it is p/g (empty string violated the enum)');
  assert.match(ms,/saveMatchResult\(missionResult\(run\.current, d\.bfMissionResult\.won\)\)/);assert.match(ms,/oppNick: cfg\.oppNick, role: cfg\.role/,'multiplayer missions know their rival');
  assert.match(rk,/generalResults = \(results \|\| \[\]\)\.filter\(r => !isMissionRow\(r\)\)/);assert.match(rk,/filter\(\{ mode: 'mission' \}/);assert.match(rk,/filter\(\{ mode: 'mission_mp' \}/);assert.match(rk,/t\('Misiones'\)/);assert.match(rk,/buildMissionRanking\(missionRows, missionVictories, nickDisplay\)/);
  assert.doesNotMatch(rk,/\(results \|\| \[\]\)\.forEach/,'no loop of the general ranking reads mission rows');
  const schema=fs.readFileSync(path.join(root,'base44/entities/MatchResult.jsonc'),'utf8');assert.match(schema,/"enum":\s*\[\s*"online",\s*"local",\s*"ia",\s*"mission",\s*"mission_mp"\s*\]/);for(const f of ['"mission"','"mission_level"','"run_id"'])assert(schema.includes(f),f);
  const {DICT}=0||{};const i18n=read('i18n.js');for(const k of ['Misiones','Mejores en misiones','Misiones en solitario','Misiones multijugador','Nadie ha ganado una misión todavía','partidas de misión registradas'])assert(i18n.includes("'"+k+"':"),'English text for '+k);
});
