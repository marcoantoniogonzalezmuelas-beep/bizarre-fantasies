// Integración: ejecuta gameRelay y gameLobby REALES (TypeScript) contra una BD en memoria y
// recorre la reanudación de punta a punta. Las importaciones de la plataforma (SDK, runtime)
// se sustituyen por dobles con module.registerHooks.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const root=path.join(__dirname,'..','..','..');const at=p=>pathToFileURL(path.join(root,p)).href;

// ---- BD en memoria con la semántica de updateMany que usan las funciones ----
const getP=(o,k)=>k.split('.').reduce((a,p)=>(a==null?undefined:a[p]),o);
const setP=(o,k,v)=>{const ps=k.split('.');let c=o;for(let i=0;i<ps.length-1;i++){if(c[ps[i]]==null||typeof c[ps[i]]!=='object')c[ps[i]]={};c=c[ps[i]];}c[ps.at(-1)]=v;};
const delP=(o,k)=>{const ps=k.split('.');let c=o;for(let i=0;i<ps.length-1;i++){c=c&&c[ps[i]];if(c==null)return;}delete c[ps.at(-1)];};
const matches=(row,q)=>Object.entries(q||{}).every(([k,v])=>{const cur=getP(row,k);if(v&&typeof v==='object'&&'$ne' in v)return cur!==v.$ne;return cur===v;});
function entity(){let n=0;const rows=[];const clone=x=>structuredClone(x);
  return {rows,async filter(q={},sort,limit){return rows.filter(r=>matches(r,q)).map(clone).slice(0,limit||1000);},
    async list(sort,limit){return rows.map(clone).slice(0,limit||1000);},
    async create(d){const r={id:'r'+(++n),created_date:new Date().toISOString(),updated_date:new Date().toISOString(),...clone(d)};rows.push(r);return clone(r);},
    async update(id,d){const r=rows.find(x=>x.id===id);Object.assign(r,clone(d));r.updated_date=new Date().toISOString();return clone(r);},
    async delete(id){const i=rows.findIndex(r=>r.id===id);if(i>=0)rows.splice(i,1);},
    async deleteMany(q){for(let i=rows.length-1;i>=0;i--)if(matches(rows[i],q))rows.splice(i,1);},
    async updateMany(q,ops){for(const r of rows.filter(x=>matches(x,q))){
      for(const [k,v] of Object.entries(ops.$set||{}))setP(r,k,v);for(const k of Object.keys(ops.$unset||{}))delP(r,k);
      for(const [k,v] of Object.entries(ops.$inc||{}))setP(r,k,(getP(r,k)||0)+v);
      for(const [k,v] of Object.entries(ops.$max||{}))setP(r,k,Math.max(getP(r,k)||0,v));
      for(const [k,v] of Object.entries(ops.$push||{})){const cur=getP(r,k)||[];const add=v&&v.$each?v.$each:[v];let next=cur.concat(clone(add));if(v&&v.$slice)next=v.$slice<0?next.slice(v.$slice):next.slice(0,v.$slice);setP(r,k,next);}
      r.updated_date=new Date().toISOString();}}};}
const db={};const entities=new Proxy({},{get:(t,n)=>(db[n]||=entity())});
globalThis.__b44={asServiceRole:{entities}};
Module.registerHooks({resolve(spec,ctx,next){
  if(spec.startsWith('npm:@base44/sdk'))return {url:'data:text/javascript,export const createClientFromRequest=()=>globalThis.__b44;',shortCircuit:true,format:'module'};
  if(spec==='base44:runtime')return {url:'data:text/javascript,export const waitUntil=()=>{};',shortCircuit:true,format:'module'};
  return next(spec,ctx);}});
globalThis.Deno={serve:f=>{globalThis.__lobbyFn=f;}};

const post=async(fn,payload)=>{const res=await fn(new Request('http://localhost/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}));return {status:res.status,json:await res.json()};};
const T=()=>Date.now(),S=1000,MIN=60*S;
let relay,lobby;
const seed=async(code,o={})=>{const n=T();const st={owner_token:'tp-'+code,guest_token:'tg-'+code,guest_nick:'Bob',resume_nicks:['Ana','Bob'],room_name:'Sala',
  host_last_seen:n-(o.hostAgo??5*S),guest_last_seen:n-(o.guestAgo??5*S),snap:{t:'snap',screen:'s-battle',n:1},snap_seq:3,...(o.state||{})};
  if(o.noGuest)delete st.guest_last_seen;   // una sala en espera aún no tiene invitado
  for(const k of Object.keys(st))if(st[k]===undefined)delete st[k];
  // Salas "antiguas": la BD real fija created/updated_date al crear/escribir; aquí se fijan a mano.
  const old=new Date(n-Math.max(o.hostAgo??5*S,o.guestAgo??5*S)-2*MIN).toISOString();
  return entities.GameRoom.create({room_code:code,status:o.status||'playing',host_name:'Ana',guest_name:o.noGuest?'':'Bob',state:st,created_date:old,updated_date:old});};
const room=code=>db.GameRoom.rows.find(r=>r.room_code===code);
const R=async(payload)=>post(relay,payload);
test.before(async()=>{relay=(await import(at('base44/functions/gameRelay/entry.ts'))).default;await import(at('base44/functions/gameLobby/entry.ts'));lobby=globalThis.__lobbyFn;assert.equal(typeof lobby,'function');});

test('cleanup: a playing match lives 30 minutes from the last heartbeat; a finished one 10; waiting rooms keep 10',async()=>{
  await seed('OLD111',{hostAgo:31*MIN,guestAgo:31*MIN});await seed('KEEP22',{hostAgo:29*MIN,guestAgo:29*MIN});
  await seed('OVER33',{hostAgo:11*MIN,guestAgo:11*MIN,state:{match_over_at:T()-12*MIN,match_started_at:T()-40*MIN}});
  await seed('WAIT44',{status:'waiting',noGuest:true,hostAgo:11*MIN,state:{guest_token:undefined,guest_nick:undefined}});
  await entities.GameRoom.create({room_code:'JOIN55',status:'waiting',host_name:'Zed',guest_name:'',state:{owner_token:'tp-J',room_name:'J',host_last_seen:T()-2*S}});
  const j=await R({action:'join',code:'JOIN55',nick:'Nuevo',avatar:'https://m.test/a.png'});   // dispara la limpieza de gameRelay (1ª vez)
  assert.equal(j.status,200);const codes=db.GameRoom.rows.map(r=>r.room_code).sort();
  assert.deepEqual(codes,['JOIN55','KEEP22'],'OLD111 (31 min), OVER33 (finished 11 min) and WAIT44 (11 min) are gone; KEEP22 (29 min) is kept');
  const st=room('JOIN55').state;assert.ok(st.match_started_at>0,'join starts a match');assert.equal(st.match_over_at,null);assert.equal(st.guest_nick,'Nuevo');
});
test('lobby: an abrupt crash (no "leave" ever sent) shows the match as resumable; while both play it is hidden',async()=>{
  await seed('LIVE01',{});await seed('CRASH2',{guestAgo:70*S});await seed('CRASH3',{hostAgo:2*MIN,guestAgo:2*MIN});
  const {json}=await post(lobby,{action:'list'});const byId=Object.fromEntries(json.rooms.map(r=>[r.id,r]));
  assert.equal(byId.LIVE01,undefined,'a match in progress is not listed');
  assert.equal(byId.CRASH2.isResume,true);assert.deepEqual(byId.CRASH2.nicks,['Ana','Bob']);assert.equal(byId.CRASH3.isResume,true,'both gone');
});
test('resume_status: only the owner of a seat, with its token, can ask about their match',async()=>{
  await seed('STAT01',{guestAgo:90*S});
  const ok=await R({action:'resume_status',code:'STAT01',side:'g',token:'tg-STAT01'});assert.equal(ok.status,200);
  assert.equal(ok.json.can_resume,true);assert.deepEqual(ok.json.nicks,['Ana','Bob']);assert.equal(ok.json.opponent_absent,false);
  const host=await R({action:'resume_status',code:'STAT01',side:'p',token:'tp-STAT01'});assert.equal(host.json.opponent_absent,true);assert.ok(host.json.opponent_away_ms>=90*S-2000);
  assert.equal((await R({action:'resume_status',code:'STAT01',side:'g',token:'tp-STAT01'})).status,403,'host token on the guest seat');
  assert.equal((await R({action:'resume_status',code:'STAT01',side:'g'})).status,403,'no token');
  assert.equal((await R({action:'resume_status',code:'NOPE99',side:'g',token:'x'})).status,404,'unknown room: the client forgets the match');
});
test('resume with the seat token: no password needed, state restored, token rotated, old session locked out',async()=>{
  await seed('TOK001',{guestAgo:2*MIN,state:{password:'secreta'}});
  const r=await R({action:'resume',code:'TOK001',side:'g',token:'tg-TOK001',nick:'Bob'});
  assert.equal(r.status,200,'a private room no longer asks for the password when the browser has the token');
  assert.equal(r.json.ok,true);assert.deepEqual(r.json.snap,{t:'snap',screen:'s-battle',n:1});assert.deepEqual(r.json.nicks,['Ana','Bob']);assert.equal(r.json.side,'g');
  assert.notEqual(r.json.token,'tg-TOK001');assert.equal(room('TOK001').state.guest_token,r.json.token);assert.equal(room('TOK001').state.guest_left_at,null);
  assert.ok(room('TOK001').state.guest_last_seen>T()-5*S,'heartbeat refreshed: the match is "in progress" again');
  assert.equal((await R({action:'resume_status',code:'TOK001',side:'g',token:'tg-TOK001'})).status,403,'old token is dead');
  assert.equal((await R({action:'resume_status',code:'TOK001',side:'g',token:r.json.token})).status,200);
});
test('resume from ANOTHER device: room password, or the password of your own nick',async()=>{
  const {checkNick}=await import(at('base44/shared/nickAuthCore.ts'));await checkNick(entities.NickCredential,'bob','claveBob');
  await seed('PUB001',{guestAgo:2*MIN});
  assert.equal((await R({action:'resume',code:'PUB001',side:'g',nick:'Bob'})).status,403,'public room, no token, no proof');
  assert.equal((await R({action:'resume',code:'PUB001',side:'g',nick:'Bob',nick_password:'mal'})).status,403);
  assert.equal((await R({action:'resume',code:'PUB001',side:'p',nick:'Bob',nick_password:'claveBob'})).status,403,'your nick does not open the HOST seat');
  assert.equal((await R({action:'resume',code:'PUB001',side:'g',nick:'Ana',nick_password:'claveBob'})).status,403,'nor can you claim a nick that is not yours');
  assert.equal((await R({action:'resume',code:'PUB001',side:'g',nick:'Bob',nick_password:'claveBob'})).status,200,'the right nick password works');
  assert.equal(db.NickCredential.rows.length,1,'no credential was created as a side effect');
  await seed('PRV001',{guestAgo:2*MIN,state:{password:'sala1'}});
  assert.equal((await R({action:'resume',code:'PRV001',side:'g',nick:'Bob'})).json.error,'Wrong password');
  assert.equal((await R({action:'resume',code:'PRV001',side:'g',nick:'Bob',password:'sala1'})).status,200,'room password');
  await seed('PRV002',{guestAgo:2*MIN,state:{password:'sala2'}});
  assert.equal((await R({action:'resume',code:'PRV002',side:'g',nick:'Bob',password:'claveBob',nick_password:'claveBob'})).status,200,'ONE field in the UI: the same text as room password and nick password');
  assert.equal(room('PRV002').state.join_fails||0,0,'a successful identity does not count as a failed attempt');
});
test('guessing the room password is throttled, but the real owner (token) is never locked out',async()=>{
  await seed('LOCK01',{guestAgo:2*MIN,state:{password:'sala3'}});let last;
  for(let i=0;i<5;i++)last=await R({action:'resume',code:'LOCK01',side:'g',nick:'Bob',password:'mal'+i});
  assert.equal(last.status,403);const blocked=await R({action:'resume',code:'LOCK01',side:'g',nick:'Bob',password:'sala3'});assert.equal(blocked.status,429,'even the right password is refused while locked');
  assert.equal((await R({action:'resume',code:'LOCK01',side:'g',token:'tg-LOCK01',nick:'Bob'})).status,200,'the seat token is proof enough');
});
test('a finished match is not resumable and not listed; a rematch makes the room playable again',async()=>{
  await seed('END001',{guestAgo:2*MIN,hostAgo:2*MIN});
  assert.equal((await post(lobby,{action:'list'})).json.rooms.some(r=>r.id==='END001'),true,'interrupted: listed');
  assert.equal((await R({action:'match_phase',code:'END001',side:'p',token:'tp-END001',phase:'over'})).status,200);
  assert.equal((await post(lobby,{action:'list'})).json.rooms.some(r=>r.id==='END001'),false,'finished: no longer offered');
  const st=await R({action:'resume_status',code:'END001',side:'g',token:'tg-END001'});assert.equal(st.json.can_resume,false);assert.equal(st.json.reason,'over');
  const res=await R({action:'resume',code:'END001',side:'g',token:'tg-END001',nick:'Bob'});assert.equal(res.status,410);assert.equal(res.json.error,'Match over');
  assert.equal((await R({action:'match_phase',code:'END001',side:'p',token:'tp-END001',phase:'hack'})).status,400);
  await new Promise(r=>setTimeout(r,5));
  const rm=await R({action:'sendBatch',code:'END001',side:'p',token:'tp-END001',batch_id:'b-rematch-1',messages:[{t:'bfrematch',bfMatchId:'m2',bfMatchRound:1}]});assert.equal(rm.status,200);
  assert.ok(room('END001').state.match_started_at>=room('END001').state.match_over_at,'the rematch message reopened the match');
  assert.equal((await R({action:'resume',code:'END001',side:'g',token:'tg-END001',nick:'Bob'})).status,200,'interrupted during the rematch: resumable');
});
test('rival away: poll reports it; claiming victory needs 5 minutes seen by the SERVER',async()=>{
  await seed('FOR001',{guestAgo:4*MIN,hostAgo:3*S});
  const poll=await R({action:'poll',protocol:2,code:'FOR001',side:'p',token:'tp-FOR001',ack:[]});
  assert.equal(poll.status,200);assert.ok(poll.json.other_away_ms>=4*MIN-2000);assert.equal(poll.json.match_over,false);assert.equal(poll.json.forfeit_after_ms,5*MIN);
  const early=await R({action:'claim_forfeit',code:'FOR001',side:'p',token:'tp-FOR001'});assert.equal(early.status,409);assert.equal(early.json.error,'too_early');assert.ok(early.json.wait_ms>0&&early.json.wait_ms<=MIN);
  await seed('FOR002',{guestAgo:6*MIN,hostAgo:3*S});
  assert.equal((await R({action:'claim_forfeit',code:'FOR002',side:'g',token:'tg-FOR002'})).json.error,'you_are_away','the absent one cannot claim');
  const ok=await R({action:'claim_forfeit',code:'FOR002',side:'p',token:'tp-FOR002'});assert.equal(ok.status,200);assert.equal(ok.json.winner_nick,'Ana');assert.equal(ok.json.loser_nick,'Bob');
  assert.equal(room('FOR002').state.forfeit_by,'g');assert.equal((await R({action:'claim_forfeit',code:'FOR002',side:'p',token:'tp-FOR002'})).json.error,'already_over','cannot be claimed twice');
  assert.equal((await R({action:'resume',code:'FOR002',side:'g',token:'tg-FOR002',nick:'Bob'})).status,410,'the absent player comes back too late');
  assert.equal((await R({action:'claim_forfeit',code:'FOR002',side:'p'})).status,403,'needs the seat token');
});
test('"Sí, salir": the match ends for both, is not offered, cannot be resumed',async()=>{
  await seed('QUIT01',{});
  assert.equal((await R({action:'leave',code:'QUIT01',side:'g',token:'tg-QUIT01'})).status,200);
  const s=room('QUIT01').state;assert.equal(s.abandoned_by,'g');assert.ok(s.match_over_at>0);assert.ok(s.guest_left_at>0);
  assert.equal((await R({action:'resume_status',code:'QUIT01',side:'p',token:'tp-QUIT01'})).json.can_resume,false);
  assert.equal((await post(lobby,{action:'list'})).json.rooms.some(r=>r.id==='QUIT01'),false);
  assert.equal((await R({action:'leave',code:'QUIT01',side:'g'})).status,403,'leave needs the seat token');
});

test('match id: the host fixes it, the server remembers it, and a joiner or a resumer adopts THAT one',async()=>{
  await seed('MID001',{guestAgo:2*MIN});
  const host=await R({action:'sendBatch',code:'MID001',side:'p',token:'tp-MID001',batch_id:'b-mid-1',messages:[{t:'snap',screen:'s-recruit',bfMatchId:'match-AAA',bfMatchRound:0}]});
  assert.equal(host.status,200);assert.equal(room('MID001').state.match_id,'match-AAA');
  // el invitado NO puede cambiar el id de la partida
  const g=await R({action:'sendBatch',code:'MID001',side:'g',token:'tg-MID001',batch_id:'b-mid-2',messages:[{t:'intent',op:'pass',bfMatchId:'evil'}]});assert.equal(g.status,200);
  assert.equal(room('MID001').state.match_id,'match-AAA','only the host sets the id');
  // revancha: el id nuevo sustituye al anterior
  await R({action:'sendBatch',code:'MID001',side:'p',token:'tp-MID001',batch_id:'b-mid-3',messages:[{t:'bfrematch',bfMatchId:'match-BBB',bfMatchRound:1}]});
  assert.equal(room('MID001').state.match_id,'match-BBB');assert.equal(room('MID001').state.match_round,1);
  // reanudar (cualquiera de los dos lados): recibe el id vigente, no tiene que inventarlo ni copiarlo de un mensaje suelto
  const rs=await R({action:'resume',code:'MID001',side:'g',token:'tg-MID001',nick:'Bob'});assert.equal(rs.json.match_id,'match-BBB');assert.equal(rs.json.match_round,1);
  const rh=await R({action:'resume',code:'MID001',side:'p',token:'tp-MID001',nick:'Ana'});assert.equal(rh.json.match_id,'match-BBB');
  // unirse a una sala cuyo anfitrión ya fijó el id: el invitado lo recibe en la respuesta del join
  await entities.GameRoom.create({room_code:'MID002',status:'waiting',host_name:'Zed',guest_name:'',state:{owner_token:'tp-M2',room_name:'M',host_last_seen:T()-2*S,match_id:'match-CCC',match_round:0}});
  const j=await R({action:'join',code:'MID002',nick:'Nuevo'});assert.equal(j.status,200);assert.equal(j.json.match_id,'match-CCC');
});
