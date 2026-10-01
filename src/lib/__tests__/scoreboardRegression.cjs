// MARCADORES POR NICK: se actualizan bien en cada partida, no se parten por idioma ni por mayúsculas,
// el relleno desde la BD conoce todos los niveles de IA, y el servidor/ranking usan la misma identidad.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),root=path.join(__dirname,'..','..','..');
const load=f=>import(pathToFileURL(f.startsWith('/')?f:lib(f)).href);
const read=f=>fs.readFileSync(lib(f),'utf8'),script=s=>s.replace(/<\/?script>/g,'');

function world({names={p:'Ana',o:'IA Novata'},online=false,role='host',nets={}}={}){
  const store={},posts=[],timers=[],handlers={};let now=1_000_000;
  const el=()=>({style:{setProperty(){}},classList:{add(){},remove(){}},querySelector:()=>el(),textContent:'',innerHTML:'',offsetWidth:0,dataset:{},appendChild(){},parentNode:null,getBoundingClientRect:()=>({width:0,left:0,top:0})});
  const env={Date:{now:()=>now},Math,JSON,console,Object,Array,String,Number,parseInt,
    setTimeout:(f,ms)=>{timers.push({f,at:now+ms,rep:0});},clearInterval(){},clearTimeout(){},setInterval:(f,ms)=>{timers.push({f,at:now+ms,rep:ms});},
    localStorage:{getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},
    document:{head:{appendChild(){}},body:{appendChild(){}},createElement:()=>el(),querySelector:s=>(s==='.screen.active'?{id:'s-battle'}:null),getElementById:()=>null},
    G:{names:{...names},demo:false},NET:{role,names_self:nets.self||names.p,names_opp:nets.opp||names.o},online:()=>online,
    addEventListener:(k,f)=>{handlers[k]=f;},showResult(){},initGame(){}};
  env.window=env;env.parent={postMessage:m=>posts.push(JSON.parse(JSON.stringify(m)))};
  const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+100);for(const t of timers)if(t.at<=now){t.f();t.at=t.rep?t.at+t.rep:Infinity;}}};
  return {env,store,posts,advance,handlers};
}
async function boot(w){
  const {NICK_CANON_PATCH}=await load('nickCanon.js'),{MATCH_EPOCH_PATCH}=await load('matchEpochPatch.js'),{MATCH_SCORE_PATCH}=await load('matchScorePatch.js');
  vm.runInNewContext(script(NICK_CANON_PATCH),w.env);vm.runInNewContext(script(MATCH_EPOCH_PATCH),w.env);vm.runInNewContext(script(MATCH_SCORE_PATCH),w.env);w.advance(500);return w;
}
const rec=w=>JSON.parse(w.store.bfScoreByNick||'{}');

test('every game adds exactly ONE win to the right nick, stored under a canonical pair key and sent to the server',async()=>{
  const w=await boot(world());const S=w.env.bfSeriesScore;
  w.env.showResult(true);w.env.showResult(true);w.env.showResult(true);             // envoltorios/reenvíos: solo suma una vez
  assert.deepEqual(rec(w),{'ana||ia novata':{ana:1}});
  assert.deepEqual(w.posts.filter(p=>p.bfScoreWin).map(p=>p.bfScoreWin),[{pair_key:'ana||ia novata',nick:'ana',wins:1}]);
  assert.deepEqual({...S.get()},{self:1,opp:0,selfNick:'Ana',oppNick:'IA Novata'});
});
test('the NEXT game also counts (the "already scored" mark of the previous game is cleared by the new match epoch)',async()=>{
  const w=await boot(world());w.advance(400);
  w.env.showResult(true);assert.equal(rec(w)['ana||ia novata'].ana,1);
  w.env.showResult(true);assert.equal(rec(w)['ana||ia novata'].ana,1,'same game: not twice');
  w.env.initGame('Ana','IA Novata',false);   // partida nueva (el parche de epoch envuelve initGame)
  w.advance(400);w.env.showResult(true);assert.equal(rec(w)['ana||ia novata'].ana,2,'new game: counts');
  w.env.initGame('Ana','IA Novata',false);w.advance(400);w.env.showResult(false);                      // y una derrota suma al rival
  assert.equal(rec(w)['ana||ia novata']['ia novata'],1);
  assert.deepEqual(w.posts.filter(p=>p.bfScoreWin).map(p=>p.bfScoreWin.wins),[1,2,1]);
});
test('switching the game language does NOT split the scoreboard against the AI',async()=>{
  const w=await boot(world({names:{p:'Ana',o:'IA Novata'}}));w.advance(400);w.env.showResult(true);
  w.env.initGame();w.env.G.names.o='AI Novice';w.advance(400);w.env.showResult(true);            // mismo rival, ahora en inglés
  assert.deepEqual(rec(w),{'ana||ia novata':{ana:2}},'one pair, two wins');
  assert.equal(w.env.bfSeriesScore.get().self,2);
  const ana2=await boot(world({names:{p:'ANA',o:'AI Novice'}}));ana2.store.bfScoreByNick=JSON.stringify({'ana||ia novata':{ana:5}});ana2.advance(400);
  assert.equal(ana2.env.bfSeriesScore.get().self,5,'different capitalisation + English AI name = the same record');
  const bz=await boot(world({names:{p:'Ana',o:'Bizarre AI'}}));bz.advance(400);bz.env.showResult(true);assert.deepEqual(rec(bz),{'ana||ia bizarra':{ana:1}},'the last AI level is covered too');
});
test('history from the database is merged (never lowers the local score) and the next win continues from it',async()=>{
  const w=await boot(world());w.advance(400);w.store.bfScoreByNick=JSON.stringify({'ana||ia novata':{ana:3}});
  w.handlers.message({data:{bfScoreDb:{'ana||ia novata':{ana:7,'ia novata':2}}}});
  assert.deepEqual({...w.env.bfSeriesScore.get()},{self:7,opp:2,selfNick:'Ana',oppNick:'IA Novata'});
  w.handlers.message({data:{bfScoreDb:{'ana||ia novata':{ana:1}}}});assert.equal(w.env.bfSeriesScore.get().self,7,'a stale DB value never lowers it');
  w.env.showResult(true);assert.equal(w.posts.at(-1).bfScoreWin.wins,8,'continues from the merged history');
});
test('online: only the host writes to the database (no duplicate rows); the guest keeps its local copy',async()=>{
  const host=await boot(world({online:true,role:'host',names:{p:'Ana',o:'Bob'},nets:{self:'Ana',opp:'Bob'}}));host.advance(400);
  host.env.bfSeriesScore.addWin('Bob');assert.equal(host.posts.filter(p=>p.bfScoreWin).length,1);assert.deepEqual(rec(host),{'ana||bob':{bob:1}},'the opponent wins: +1 for the opponent');
  const guest=await boot(world({online:true,role:'client',names:{p:'Bob',o:'Ana'},nets:{self:'Bob',opp:'Ana'}}));guest.advance(400);
  guest.env.bfSeriesScore.addWin('Bob');assert.equal(guest.posts.filter(p=>p.bfScoreWin).length,0,'guest does not write to the DB');assert.deepEqual(rec(guest),{'ana||bob':{bob:1}},'same pair key on both devices');
});
test('DB history loader: canonical keys, English/Spanish AI rows merged, ALL AI levels (bizarra was missing)',async()=>{
  const tmp=path.join(os.tmpdir(),'bf-scoredb-'+process.pid+'.mjs');
  fs.writeFileSync(tmp,read('scoreDb.js').replace("import { base44 } from '@/api/base44Client';","const base44 = globalThis.__fakeBase44;").replace("'@/lib/nickCanon'",JSON.stringify(pathToFileURL(lib('nickCanon.js')).href)));
  const rows={HeadToHead:[{pair_key:'ai novice||ana',nick:'Ana',wins:3},{pair_key:'ana||ia novata',nick:'ana',wins:5},{pair_key:'bob||ana',nick:'bob',wins:2}],
    PlayerAiProgress:[{nick:'Ana',level_id:'bizarra',wins:4},{nick:'Ana',level_id:'novice',wins:2},{nick:'Ana',level_id:'nemesis',wins:6},{nick:'Ana',level_id:'unknown',wins:9}]};
  globalThis.__fakeBase44={entities:{HeadToHead:{list:async()=>rows.HeadToHead},PlayerAiProgress:{list:async()=>rows.PlayerAiProgress}}};
  const {loadScoreDb}=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);const map=await loadScoreDb();delete globalThis.__fakeBase44;
  assert.deepEqual(map,{'ana||ia novata':{ana:5},'ana||bob':{bob:2},'ana||ia bizarra':{ana:4},'ana||ia némesis':{ana:6}});
});
test('the result recorded for the ranking uses the canonical AI name (no split by language)',async()=>{
  const {MATCH_RESULT_PATCH}=await load('matchResultPatch.js'),{NICK_CANON_PATCH}=await load('nickCanon.js');
  const w=world({names:{p:'Ana',o:'AI Novice'}});w.env.G.oppHuman=false;w.env.G.team={p:[],o:[]};
  vm.runInNewContext(script(NICK_CANON_PATCH),w.env);vm.runInNewContext(script(MATCH_RESULT_PATCH),w.env);w.advance(400);
  w.env.showResult(true);const r=w.posts.find(p=>p.bfMatchResult).bfMatchResult;
  assert.equal(r.winner_nick,'Ana');assert.equal(r.loser_nick,'IA Novata');assert.equal(r.mode,'ia');assert.equal(r.loser_is_ai,true);
});
test('server: results and scores are stored under the canonical identity; same row updated whatever the spelling',async()=>{
  const {handleRecord,makeLimiter}=await load(path.join(root,'base44/shared/gameRecord.ts'));const allow=makeLimiter();
  const mk=()=>{let n=0;const rows=[];return {rows,async filter(q){return rows.filter(r=>Object.entries(q).every(([k,v])=>r[k]===v));},async create(d){const r={id:'r'+(++n),...d};rows.push(r);return r;},async update(id,d){Object.assign(rows.find(r=>r.id===id),d);}};};
  const E={MatchResult:mk(),PlayerAvatar:mk(),PlayerAiProgress:mk(),HeadToHead:mk()};
  const a=await handleRecord(E,{kind:'match',result:{mode:'ia',winner_nick:'Ana',loser_nick:'AI Novice',loser_is_ai:true,ai_level:'novice'}},1000,allow);assert.equal(a.status,200);
  assert.equal(E.MatchResult.rows[0].loser_nick,'IA Novata');
  await handleRecord(E,{kind:'score_win',pair_key:'AI Novice||Ana',nick:'Ana',wins:1},2000,allow);
  await handleRecord(E,{kind:'score_win',pair_key:'ana||ia novata',nick:'ANA',wins:2},3000,allow);
  assert.equal(E.HeadToHead.rows.length,1,'one row regardless of spelling/language');assert.deepEqual([E.HeadToHead.rows[0].pair_key,E.HeadToHead.rows[0].nick,E.HeadToHead.rows[0].wins],['ana||ia novata','ana',2]);
});
test('client and server canonical identity are the same table; the ranking merges "Ana"/"ana" and AI names',async()=>{
  const c=await load('nickCanon.js'),s=await load(path.join(root,'base44/shared/nickCanon.ts'));
  for(const a of c.AI_NAMES){assert.equal(s.canonNick(a.en),a.es,a.en);assert.equal(c.canonNick(a.en),a.es);assert.equal(s.canonNick(a.es),a.es);}
  for(const x of ['Ana',' ana ','AI Novice','bizarre ai','','IA Bizarra',null,undefined])assert.equal(c.canonNick(x),s.canonNick(x),String(x));
  assert.equal(c.canonPairKey('AI Novice||Ana'),s.canonPairKey('AI Novice||Ana'));assert.equal(s.canonPairKey('Zed||ana'),'ana||zed');
  const disp=c.makeNickDisplay('es');assert.equal(disp('Ana'),'Ana');assert.equal(disp('ana'),'Ana','first spelling seen wins (results come newest first)');assert.equal(disp('AI Novice'),'IA Novata');
  assert.equal(c.makeNickDisplay('en')('IA Novata'),'AI Novice','AIs are shown in the active language');
  const rk=read('../pages/Ranking.jsx');assert.doesNotMatch(rk,/(wins|losses|monthWins|monthLosses)\[r\.(winner|loser)_nick\]/,'ranking groups by canonical nick');assert.match(rk,/nickDisplay\(r\.winner_nick\)/);
  assert.match(read('gameInject.js'),/HTML_SAFETY_PATCH \+ NICK_CANON_PATCH \+/,'canonical helper is injected before the score/result patches');
});
