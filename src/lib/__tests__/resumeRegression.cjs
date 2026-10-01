// Reanudación de partidas multijugador: reglas puras (base44/shared) + cableado en las funciones.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const root=path.join(__dirname,'..','..','..');
const load=p=>import(pathToFileURL(path.join(root,p)).href);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const T=10_000_000,S=1000,MIN=60*S;

function room(o={}){
  const s={guest_token:'tg',guest_nick:'Bob',owner_token:'tp',room_name:'Sala',resume_nicks:['Ana','Bob'],...(o.state||{})};
  if('hostSeen' in o)s.host_last_seen=o.hostSeen;if('guestSeen' in o)s.guest_last_seen=o.guestSeen;
  if('hostLeft' in o)s.host_left_at=o.hostLeft;if('guestLeft' in o)s.guest_left_at=o.guestLeft;
  if('over' in o)s.match_over_at=o.over;if('started' in o)s.match_started_at=o.started;
  return {status:o.status||'playing',host_name:'Ana',guest_name:'Bob',created_date:new Date(T-60*MIN).toISOString(),state:s};
}

test('an abrupt crash makes the game resumable WITHOUT any explicit "leave" (the old bug)',async()=>{
  const {resumeInfo}=await load('base44/shared/resumePolicy.ts');
  assert.deepEqual(resumeInfo(room({hostSeen:T-5*S,guestSeen:T-8*S}),T),{resumable:false,reason:'in_progress',absentSeats:[],expiresInMs:0},'both playing: not listed');
  const crashedGuest=resumeInfo(room({hostSeen:T-5*S,guestSeen:T-50*S}),T);
  assert.equal(crashedGuest.resumable,true);assert.deepEqual(crashedGuest.absentSeats,['g'],'closed tab / lost network / dead battery: no left_at was ever written');
  assert.deepEqual(resumeInfo(room({hostSeen:T-70*S,guestSeen:T-3*S}),T).absentSeats,['p'],'host crash');
  assert.deepEqual(resumeInfo(room({hostSeen:T-70*S,guestSeen:T-60*S}),T).absentSeats,['p','g'],'both gone');
  assert.equal(resumeInfo(room({hostSeen:T-5*S,guestSeen:T-44*S}),T).resumable,false,'44s is still inside the grace period (no flicker on a slow poll)');
  assert.equal(resumeInfo(room({hostSeen:T-5*S,guestSeen:T-10*S,guestLeft:T-2*S}),T).resumable,true,'explicit leave also counts as absent');
});
test('resume window: 30 minutes from the last heartbeat, then the game expires',async()=>{
  const {resumeInfo,roomExpired,roomTtl}=await load('base44/shared/resumePolicy.ts');
  const both=(ago)=>room({hostSeen:T-ago,guestSeen:T-ago});
  assert.equal(resumeInfo(both(29*MIN),T).resumable,true);assert.equal(resumeInfo(both(29*MIN),T).expiresInMs>0,true);
  const late=resumeInfo(both(31*MIN),T);assert.equal(late.resumable,false);assert.equal(late.reason,'expired');
  assert.equal(roomExpired(both(29*MIN),T),false);assert.equal(roomExpired(both(31*MIN),T),true);
  assert.equal(roomExpired(room({status:'finished',hostSeen:T,guestSeen:T}),T),true);
  assert.equal(roomTtl(room({status:'waiting'})),10*MIN,'waiting rooms keep the old 10 min');
});
test('a FINISHED match is not resumable; a rematch in the same room makes it playable again',async()=>{
  const {resumeInfo,matchIsOver,roomTtl}=await load('base44/shared/resumePolicy.ts');
  const over=room({hostSeen:T-90*S,guestSeen:T-90*S,over:T-95*S,started:T-20*MIN});
  assert.equal(matchIsOver(over.state),true);assert.equal(resumeInfo(over,T).reason,'over');assert.equal(resumeInfo(over,T).resumable,false);
  assert.equal(roomTtl(over),10*MIN,'finished matches are cleaned up sooner');
  const rematch=room({hostSeen:T-90*S,guestSeen:T-90*S,over:T-95*S,started:T-80*S});
  assert.equal(matchIsOver(rematch.state),false);assert.equal(resumeInfo(rematch,T).resumable,true,'interrupted DURING the rematch: resumable');
  assert.equal(resumeInfo(room({status:'waiting',hostSeen:T-60*S}),T).reason,'not_playing');
  const noGuest=room({status:'playing',hostSeen:T-60*S,state:{guest_token:'',guest_nick:''}});assert.equal(resumeInfo(noGuest,T).reason,'no_guest');
});
test('canRejoin (owner of a seat) does not depend on heartbeats: a quick reload must still get back in',async()=>{
  const {canRejoin}=await load('base44/shared/resumePolicy.ts');
  assert.equal(canRejoin(room({hostSeen:T-2*S,guestSeen:T-2*S}),T).ok,true,'my seat still looks "present" for 45s after I closed the tab');
  assert.equal(canRejoin(room({hostSeen:T-31*MIN,guestSeen:T-31*MIN}),T).reason,'expired');
  assert.equal(canRejoin(room({over:T-1*S,started:T-9*MIN}),T).reason,'over');
  assert.equal(canRejoin(room({status:'finished'}),T).ok,false);
});
test('explicit "Sí, salir" ends the match (the dialog says so); it is no longer listed as resumable',async()=>{
  const {leavePatch,matchPhasePatch,resumeStatus}=await load('base44/shared/resumeActions.ts'),{resumeInfo,matchIsOver}=await load('base44/shared/resumePolicy.ts');
  const p=leavePatch('g',T);assert.equal(p.left_at,T);assert.equal(p['state.guest_left_at'],T);assert.equal(p['state.match_over_at'],T);assert.equal(p['state.abandoned_by'],'g');
  const r=room({hostSeen:T-1*S,guestSeen:T-1*S});for(const [k,v] of Object.entries(p))if(k.startsWith('state.'))r.state[k.slice(6)]=v;
  assert.equal(matchIsOver(r.state),true);assert.equal(resumeInfo(r,T+60*S).resumable,false);assert.equal(resumeStatus(r,'p',T+60*S).can_resume,false);
  assert.deepEqual(matchPhasePatch('over','p',T),{'state.match_over_at':T,'state.over_by':'p'});assert.deepEqual(matchPhasePatch('playing','g',T),{'state.match_started_at':T});
  assert.equal(matchPhasePatch('hack','p',T),null);assert.equal(matchPhasePatch(undefined,'p',T),null);
});
test('resumeStatus: my game, who I play against, whether the rival is away',async()=>{
  const {resumeStatus}=await load('base44/shared/resumeActions.ts');
  const r=resumeStatus(room({hostSeen:T-3*S,guestSeen:T-4*MIN,state:{password:'x'}}),'p',T);
  assert.equal(r.ok,true);assert.equal(r.can_resume,true);assert.deepEqual(r.nicks,['Ana','Bob']);assert.equal(r.has_pass,true);
  assert.equal(r.opponent_absent,true);assert.equal(r.opponent_away_ms,4*MIN-0);assert.equal(r.forfeit_after_ms,5*MIN);
  const here=resumeStatus(room({hostSeen:T-3*S,guestSeen:T-3*S}),'g',T);assert.equal(here.opponent_absent,false);assert.equal(here.opponent_away_ms,0);
});
test('claim victory: only when the SERVER sees the rival away for 5 minutes, and never while I am away',async()=>{
  const {forfeitDecision}=await load('base44/shared/resumeActions.ts');
  const d=(o,side='p')=>forfeitDecision(room(o),side,T);
  const early=d({hostSeen:T-2*S,guestSeen:T-4*MIN});assert.equal(early.ok,false);assert.equal(early.error,'too_early');assert.equal(early.wait_ms,MIN);
  const ok=d({hostSeen:T-2*S,guestSeen:T-5*MIN-1});assert.equal(ok.ok,true);assert.equal(ok.winner_nick,'Ana');assert.equal(ok.loser_nick,'Bob');
  assert.equal(ok.patch['state.match_over_at'],T);assert.equal(ok.patch['state.forfeit_by'],'g');
  assert.equal(d({hostSeen:T-2*S,guestSeen:T-2*S}).error,'too_early','rival present: nothing to claim');
  assert.equal(d({hostSeen:T-10*MIN,guestSeen:T-10*MIN}).error,'you_are_away','the claimant must be connected');
  assert.equal(d({hostSeen:T-2*S,guestSeen:T-9*MIN,over:T-1*MIN,started:T-20*MIN}).error,'already_over','cannot claim twice / after a quit');
  assert.equal(forfeitDecision(room({status:'waiting'}),'p',T).error,'not_playing');
  const asGuest=d({hostSeen:T-6*MIN,guestSeen:T-1*S},'g');assert.equal(asGuest.ok,true);assert.equal(asGuest.winner_nick,'Bob');assert.equal(asGuest.patch['state.forfeit_by'],'p');
});
test('authorizeResume: token OR room password OR your nick password (other device); lockout and no account creation',async()=>{
  const {authorizeResume}=await load('base44/shared/resumeActions.ts');
  const never=async()=>{throw new Error('nick verifier must not be called');};
  const run=(r,body,verify=never,side='p')=>authorizeResume({room:r,side,body,now:T,verifyNick:verify});
  const priv=room({state:{password:'secreto'}}),pub=room();
  assert.equal((await run(priv,{token:'tp'})).via,'token','a valid seat token needs NO password (before: it was always asked)');
  assert.equal((await run(pub,{token:'tg'},never,'g')).via,'token');assert.equal((await run(pub,{token:'tg'},never,'p')).allowed,false,'guest token does not open the host seat');
  assert.equal((await run(priv,{password:'secreto'})).via,'password');
  const wrong=await run(priv,{password:'mal'});assert.equal(wrong.allowed,false);assert.equal(wrong.status,403);assert.equal(wrong.error,'Wrong password');assert.equal(wrong.patch['state.join_fails'],1);
  const locked=room({state:{password:'secreto',join_locked_until:T+60*S}});const l=await run(locked,{password:'secreto'});assert.equal(l.status,429);
  assert.equal((await run(pub,{})).error,'Unauthorized');assert.equal((await run(pub,{})).status,403);
  // otro dispositivo: sin token, sala pública, demuestra ser "Ana" con la contraseña de su nick
  const asked=[];const verifier=async(n,p)=>{asked.push([n,p]);return p==='miClave'?{ok:true,mode:'verified'}:{ok:false,error:'wrong_password'};};
  const viaNick=await run(pub,{nick:'ana',nick_password:'miClave'},verifier);assert.equal(viaNick.allowed,true);assert.equal(viaNick.via,'nick');assert.deepEqual(asked,[['ana','miClave']]);
  assert.equal((await run(pub,{nick:'ana',nick_password:'otra'},verifier)).allowed,false);
  assert.equal((await run(pub,{nick:'Bob',nick_password:'miClave'},verifier)).allowed,false,'you cannot claim the OTHER seat with your own nick');
  assert.equal((await run(pub,{nick:'Bob',nick_password:'miClave'},verifier,'g')).allowed,true,'...but you can claim your own');
  assert.equal((await run(pub,{nick:'ana',nick_password:'x'},async()=>({ok:true,mode:'set'}))).allowed,false,'a brand-new credential never proves identity');
  // un único campo para el usuario: la misma clave como sala Y como nick; el fallo de sala no cuenta si el nick acierta
  const both=await run(priv,{password:'miClave',nick:'Ana',nick_password:'miClave'},verifier);assert.equal(both.allowed,true);assert.equal(both.via,'nick');assert.equal(both.patch,undefined,'no lockout counted for a successful identity');
});
test('nickAuth core: allowCreate=false only verifies — it never creates a credential',async()=>{
  const {checkNick}=await load('base44/shared/nickAuthCore.ts');const rows=[];
  const creds={async filter(q){return rows.filter(r=>r.nick===q.nick);},async create(d){rows.push({id:'1',...d});},async update(id,d){Object.assign(rows.find(r=>r.id===id),d);}};
  const r=await checkNick(creds,'ana','clave123',T,new Map(),false);assert.deepEqual(r,{ok:false,error:'no_credential'});assert.equal(rows.length,0,'nothing was created');
  await checkNick(creds,'ana','clave123',T,new Map());assert.equal(rows.length,1);
  assert.deepEqual(await checkNick(creds,'ana','clave123',T,new Map(),false),{ok:true,mode:'verified'});assert.equal((await checkNick(creds,'ana','mal',T,new Map(),false)).ok,false);
});
test('wiring: the functions use the policy (no left_at dependency), the new actions, and relayProtocol reports rival absence',()=>{
  const relay=read('base44/functions/gameRelay/entry.ts'),lobby=read('base44/functions/gameLobby/entry.ts'),proto=read('base44/shared/relayProtocol.ts');
  assert.match(relay,/\['poll', 'snap', 'send', 'leave', 'sendBatch', 'resume_status', 'match_phase', 'claim_forfeit'\]\.includes\(action\)/,'new actions require the seat token');
  for(const a of ['resume_status','match_phase','claim_forfeit'])assert.match(relay,new RegExp("action === '"+a+"'"),a);
  assert.match(relay,/authorizeResume\(\{/);assert.match(relay,/checkNick\(base44\.asServiceRole\.entities\.NickCredential, nick, password, now, undefined, false\)/,'verify-only, never create');
  assert.match(relay,/leavePatch\(side, now\)/);assert.match(relay,/'state\.match_started_at': now/,'join starts a match');
  assert.match(relay,/canRejoin\(room, now\)/);assert.doesNotMatch(relay,/const passOk = !!state\.password/,'old "password always required" logic removed');
  assert.match(lobby,/resumeInfo\(room, Date\.now\(\)\)/);assert.doesNotMatch(lobby,/if \(!leftAt \|\| Date\.now\(\) - leftAt > LEFT_TTL\) return;/,'list no longer depends on left_at');
  assert.match(lobby,/roomExpired\(room, now\)/);
  assert.match(proto,/other_away_ms: otherSeat\.absent \? otherSeat\.awayMs : 0, match_over: matchIsOver\(state\), forfeit_after_ms: FORFEIT_MS/);
  assert.match(proto,/m\.t === 'bfrematch'\)\) set\['state\.match_started_at'\] = now/,'a rematch clears the "finished" mark');
});
