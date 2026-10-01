// Servidor: gameRecord (validación/ranking/chat), guardián de contraseña de sala y
// bloqueo persistente de nicks. Importa los módulos TypeScript reales de base44/shared.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const root=path.join(__dirname,'..','..','..');
const load=p=>import(pathToFileURL(path.join(root,p)).href);

function entity(seed=[]){let n=0;const rows=seed.map(r=>({id:'s'+(++n),...r}));
  return {rows,async filter(q={}){return rows.filter(r=>Object.entries(q).every(([k,v])=>r[k]===v)).slice().reverse();},
    async create(d){const r={id:'r'+(++n),created_date:new Date().toISOString(),...d};rows.push(r);return r;},
    async update(id,d){Object.assign(rows.find(r=>r.id===id),d);return rows.find(r=>r.id===id);},
    async list(){return rows.slice();}};}
const db=(over={})=>({MatchResult:entity(),PlayerAvatar:entity(),PlayerAiProgress:entity(),HeadToHead:entity(),GameLog:entity(),
  MissionVictory:entity(),ChatMessage:entity(),GameRoom:entity(),BizarreVisitor:entity(),...over});
const mk=async()=>{const m=await load('base44/shared/gameRecord.ts');return {...m,allow:m.makeLimiter()};};
const T0=1_000_000;

test('match: stores a cleaned result + avatars once; hostile input is neutralised',async()=>{
  const {handleRecord,allow}=await mk();const E=db();
  const r=await handleRecord(E,{kind:'match',result:{mode:'online',winner_nick:'Ana<script>',loser_nick:'Bob',winner_avatar:'https://media.base44.com/a.png',
    loser_avatar:'javascript:alert(1)',winner_heroes:Array.from({length:30},(_,i)=>({name:'H'+i+'<b>',died:true})),loser_heroes:'nope',ai_level:'x'.repeat(99),
    is_admin:true,_id:'hack'}},T0,allow);
  assert.equal(r.status,200);const m=E.MatchResult.rows[0];
  assert.equal(m.winner_nick,'Anascript');assert.equal(m.winner_heroes.length,12);assert.ok(!/[<>]/.test(m.winner_heroes[0].name));
  assert.deepEqual(m.loser_heroes,[]);assert.equal(m.loser_avatar,'');assert.equal(m.ai_level.length,40);assert.ok(!('is_admin' in m)&&!('_id' in m),'unknown fields are dropped');
  assert.equal(E.PlayerAvatar.rows.length,1,'only the valid avatar is stored');assert.equal(E.PlayerAvatar.rows[0].avatar_url,'https://media.base44.com/a.png');
  for(const bad of [{mode:'x',winner_nick:'a',loser_nick:'b'},{mode:'ia',winner_nick:'',loser_nick:'b'},{mode:'ia',winner_nick:'a',loser_nick:'b',winner_is_ai:true,loser_is_ai:true},null])
    assert.equal((await handleRecord(E,{kind:'match',result:bad},T0+5000,allow)).status,400);
  assert.equal((await handleRecord(E,{kind:'nope'},T0,allow)).body.error,'unknown_kind');
});
test('match vs AI increments progress on the server; duplicates and floods are stopped',async()=>{
  const {handleRecord,allow}=await mk();const E=db();
  const ia={mode:'ia',winner_nick:'Zoe',loser_nick:'IA',loser_is_ai:true,ai_level:'nivel2'};
  const a=await handleRecord(E,{kind:'match',result:ia},T0,allow);assert.equal(a.body.ai_wins,1);
  const dup=await handleRecord(E,{kind:'match',result:ia},T0+3000,allow);assert.equal(dup.body.duplicate,true);assert.equal(E.MatchResult.rows.length,1,'both clients reporting the same match store it once');
  const b=await handleRecord(E,{kind:'match',result:ia},T0+30000,allow);assert.equal(b.body.ai_wins,2);assert.equal(E.PlayerAiProgress.rows.length,1);
  let last;for(let i=0;i<8;i++)last=await handleRecord(E,{kind:'match',result:{mode:'online',winner_nick:'Spam',loser_nick:'v'+i}},T0+100000+i*10,allow);
  assert.equal(last.status,429,'more than 6 results per minute from one winner is refused');
});
test('score_win: can only climb slowly, never be set to an arbitrary number',async()=>{
  const {handleRecord,allow}=await mk();const E=db();
  assert.equal((await handleRecord(E,{kind:'score_win',pair_key:'a|b',nick:'a',wins:99999},T0,allow)).body.wins,10,'new row capped');
  assert.equal((await handleRecord(E,{kind:'score_win',pair_key:'a|b',nick:'a',wins:99999},T0+1,allow)).body.wins,20,'update capped at +10');
  assert.equal((await handleRecord(E,{kind:'score_win',pair_key:'a|b',nick:'a',wins:2},T0+2,allow)).body.wins,20,'never goes down');
  assert.equal(E.HeadToHead.rows.length,1);
  for(const bad of [{pair_key:'',nick:'a',wins:1},{pair_key:'a|b',nick:'a',wins:0},{pair_key:'a|b',nick:'a',wins:'x'}])assert.equal((await handleRecord(E,{kind:'score_win',...bad},T0,allow)).status,400);
});
test('avatar: only https URLs, one row per nick (update, not duplicate)',async()=>{
  const {handleRecord,allow}=await mk();const E=db();
  assert.equal((await handleRecord(E,{kind:'avatar',nick:'Ana',avatar_url:'javascript:alert(1)'},T0,allow)).status,400);
  await handleRecord(E,{kind:'avatar',nick:'Ana',avatar_url:'https://m.test/1.png'},T0,allow);await handleRecord(E,{kind:'avatar',nick:'Ana',avatar_url:'https://m.test/2.png'},T0+1,allow);
  assert.equal(E.PlayerAvatar.rows.length,1);assert.equal(E.PlayerAvatar.rows[0].avatar_url,'https://m.test/2.png');
});
test('game_log: whitelist (the AI learns from these), caps and size limit',async()=>{
  const {handleRecord,allow}=await mk();const E=db();
  const log={mode:'ia',player_nick:'Ana',winner:'player',player_won:true,turns_played:12,analyzed_by:['x'],admin:true,
    events:Array.from({length:5000},(_,i)=>({turn:i,type:'hit',actor:'<i>a</i>',detail:'d'.repeat(900)})),player_heroes:[{name:'Zar',number:7,elite:true}]};
  assert.equal((await handleRecord(E,{kind:'game_log',log},T0,allow)).status,200);const g=E.GameLog.rows[0];
  assert.ok(!('analyzed_by' in g)&&!('admin' in g),'server-controlled/unknown fields dropped');assert.equal(g.events.length,300);assert.equal(g.events[0].detail.length,200);assert.ok(!/[<>]/.test(g.events[0].actor));
  assert.equal(g.winner,'player');assert.equal(g.player_heroes[0].number,7);
  assert.equal((await handleRecord(E,{kind:'game_log',log:{mode:'zzz',player_nick:'a'}},T0+9e4,allow)).status,400);
});
test('mission_victory: idempotent by run_id, validated mission/level',async()=>{
  const {handleRecord,allow}=await mk();const E=db();const v={kind:'mission_victory',nick:'Ana',mission:'club',level:3,run_id:'run-abc123'};
  const a=await handleRecord(E,v,T0,allow),b=await handleRecord(E,v,T0+1,allow);assert.equal(E.MissionVictory.rows.length,1);assert.equal(a.body.victory.id,b.body.victory.id);
  for(const bad of [{...v,mission:'hack',run_id:'run-zzz111'},{...v,level:0,run_id:'run-zzz222'},{...v,run_id:'x'}])assert.equal((await handleRecord(E,bad,T0+2,allow)).status,400);
});
test('chat (room): the SERVER decides who speaks; tokens, moderation, rate limit',async()=>{
  const {handleRecord,allow}=await mk();
  const E=db({GameRoom:entity([{room_code:'ABC123',host_name:'Host',guest_name:'Guest',state:{owner_token:'tokP',guest_token:'tokG'}}])});
  const send=(body,t)=>handleRecord(E,{kind:'chat',room_code:'abc123',...body},t,allow);
  const h=await send({side:'p',token:'tokP',text:'hola',nick:'Admin',sender_nick:'Admin'},T0);
  assert.equal(h.status,200);assert.equal(E.ChatMessage.rows[0].sender_nick,'Host','a forged nick is ignored');assert.equal(E.ChatMessage.rows[0].sender_is_host,true);
  assert.equal((await send({side:'g',token:'tokG',text:'hey'},T0+1000)).status,200);assert.equal(E.ChatMessage.rows[1].sender_nick,'Guest');assert.equal(E.ChatMessage.rows[1].sender_is_host,false);
  assert.equal((await send({side:'g',token:'tokP',text:'x'},T0+2000)).status,403,'host token does not work for the guest seat');
  assert.equal((await send({side:'p',token:'',text:'x'},T0+2000)).status,403);
  assert.equal((await handleRecord(E,{kind:'chat',room_code:'ZZZ999',side:'p',token:'tokP',text:'x'},T0+2000,allow)).status,404);
  assert.equal((await send({side:'p',token:'tokP',text:'eres un h1j0 d3 put4'},T0+3000)).status,422,'moderation runs on the server');
  assert.equal((await send({side:'p',token:'tokP',text:'uno'},T0+4000)).status,200);assert.equal((await send({side:'p',token:'tokP',text:'dos'},T0+4100)).status,429,'under 500ms apart');
  assert.equal((await send({side:'p',token:'tokP',text:'',emoji_id:'bad id!'},T0+9000)).status,400);assert.equal((await send({side:'p',token:'tokP',text:''},T0+9000)).status,400);
  assert.equal((await send({side:'p',token:'tokP',text:'<b>x</b>'.repeat(60)},T0+10000)).status,200);assert.ok(E.ChatMessage.rows.at(-1).text.length<=200&&!/[<>]/.test(E.ChatMessage.rows.at(-1).text));
});
test('chat (Habitación Bizarra): identity comes from the visitor session token',async()=>{
  const {handleRecord,allow}=await mk();const E=db({BizarreVisitor:entity([{nick:'Visitante',session_token:'sess-1'}])});
  assert.equal((await handleRecord(E,{kind:'chat',room_code:'BIZARRE_ROOM',session_token:'nope',text:'hola'},T0,allow)).status,403);
  assert.equal((await handleRecord(E,{kind:'chat',room_code:'BIZARRE_ROOM',text:'hola'},T0,allow)).status,403);
  const r=await handleRecord(E,{kind:'chat',room_code:'BIZARRE_ROOM',session_token:'sess-1',text:'hola',nick:'Otro'},T0+1000,allow);
  assert.equal(r.status,200);assert.equal(E.ChatMessage.rows[0].sender_nick,'Visitante');assert.equal(E.ChatMessage.rows[0].room_code,'BIZARRE_ROOM');
});
test('server moderation behaves exactly like the client one',async()=>{
  const {isChatMessageBlocked:cli}=await load('src/lib/chatModeration.js'),{isChatMessageBlocked:srv}=await load('base44/shared/chatModeration.ts');
  const samples=['hola','buena partida','eres un h1j0 d3 put4','pu.t.a','f u c k','sexo','sexual','mierda!!!','puuuuta','hijo de puta','hij0d3put4','nazi','vamos a jugar','culo','PENE','cona','classic','assistant','Hitler','n1gg4'];
  for(const s of samples)assert.equal(srv(s),cli(s),'mismatch for: '+s);assert.equal(srv(null),cli(null));
});
test('joinGuard: wrong passwords lock the room with growing delays; right one resets',async()=>{
  const {checkRoomPassword,isJoinLocked}=await load('base44/shared/joinGuard.ts');
  assert.equal(checkRoomPassword({},'x',T0).allowed,true,'rooms without password are open');
  let st={password:'secreto'};const apply=(g)=>{if(g.patch)for(const [k,v] of Object.entries(g.patch))st[k.replace('state.','')]=v;return g;};
  for(let i=1;i<=4;i++){const g=apply(checkRoomPassword(st,'mal',T0));assert.equal(g.allowed,false);assert.equal(g.reason,'wrong');assert.equal(st.join_fails,i);assert.equal(st.join_locked_until,0);}
  const g5=apply(checkRoomPassword(st,'mal',T0));assert.equal(st.join_locked_until,T0+2000);
  assert.equal(checkRoomPassword(st,'secreto',T0+500).reason,'locked','even the right password is refused while locked');assert.equal(isJoinLocked(st,T0+500),true);
  apply(checkRoomPassword(st,'mal',T0+2500));assert.equal(st.join_locked_until,T0+2500+4000,'6th failure doubles the wait');
  for(let i=0;i<20;i++)apply(checkRoomPassword(st,'mal',st.join_locked_until+1));assert(st.join_locked_until-(st.join_locked_until-300000)<=300000);
  const ok=apply(checkRoomPassword(st,'secreto',st.join_locked_until+1));assert.equal(ok.allowed,true);assert.equal(st.join_fails,0);assert.equal(st.join_locked_until,0);
  assert.equal(checkRoomPassword({password:'a'},'ab',T0).allowed,false,'length differences are handled');assert.equal(checkRoomPassword({password:'a'},undefined,T0).allowed,false);
});
test('nickAuth: the lockout is stored in the database, so it survives a new server instance',async()=>{
  const {checkNick}=await load('base44/shared/nickAuthCore.ts');const creds=entity();const fresh=()=>new Map();
  assert.deepEqual(await checkNick(creds,'  ',"x",T0,fresh()),{ok:false,error:'empty'});assert.equal((await checkNick(creds,'Ana','ab',T0,fresh())).error,'too_short');
  assert.deepEqual(await checkNick(creds,'Ana','buenaClave',T0,fresh()),{ok:true,mode:'set'});assert.ok(creds.rows[0].password.startsWith('pbkdf2$'));
  assert.deepEqual(await checkNick(creds,'ANA','buenaClave',T0,fresh()),{ok:true,mode:'verified'});
  for(let i=0;i<5;i++)assert.equal((await checkNick(creds,'ana','mal'+i,T0,fresh())).error,'wrong_password');   // un Map nuevo cada vez = otra instancia
  assert.ok(creds.rows[0].locked_until>T0,'lock persisted in the row');assert.equal(creds.rows[0].fail_count,5);
  assert.equal((await checkNick(creds,'ana','buenaClave',T0+1000,fresh())).ok,false,'correct password refused during the lock, even on a new instance');
  assert.deepEqual(await checkNick(creds,'ana','buenaClave',creds.rows[0].locked_until+1,fresh()),{ok:true,mode:'verified'});
  assert.equal(creds.rows[0].fail_count,0);assert.equal(creds.rows[0].locked_until,0);
});
test('nickAuth: old unsalted SHA-256 hashes still work once and are upgraded',async()=>{
  const {checkNick}=await load('base44/shared/nickAuthCore.ts');
  const sha=async t=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t))),x=>x.toString(16).padStart(2,'0')).join('');
  const creds=entity([{nick:'vieja',password:await sha('claveAntigua')}]);
  assert.equal((await checkNick(creds,'vieja','otra',T0,new Map())).ok,false);
  assert.deepEqual(await checkNick(creds,'vieja','claveAntigua',T0,new Map()),{ok:true,mode:'verified'});assert.ok(creds.rows[0].password.startsWith('pbkdf2$'),'migrated to PBKDF2');
});
