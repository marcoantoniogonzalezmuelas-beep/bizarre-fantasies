// Segunda tanda de fallos: pifias, arte de hechizos en la mano.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),read=f=>fs.readFileSync(lib(f),'utf8'),script=s=>s.replace(/<\/?script>/g,'');
const load=f=>import(pathToFileURL(lib(f)).href);
function clock(extra={}){
  let now=1_000_000,id=0;const timers=new Map();
  const env={Date:{now:()=>now},Math,JSON,console,Object,Array,String,Number,Promise,parseInt,
    setTimeout:(f,ms)=>{timers.set(++id,{f,at:now+ms,rep:0});return id;},setInterval:(f,ms)=>{timers.set(++id,{f,at:now+ms,rep:ms});return id;},
    clearTimeout:i=>timers.delete(i),clearInterval:i=>timers.delete(i),MutationObserver:class{observe(){}},...extra};
  env.window=env;
  const advance=ms=>{const end=now+ms;while(now<end){now=Math.min(end,now+10);for(const [i,t] of [...timers])if(t.at<=now){if(t.rep)t.at+=t.rep;else timers.delete(i);t.f();}}};
  return {env,advance,now:()=>now};
}
const cls=()=>{const s=new Set();return {add:c=>s.add(c),remove:c=>s.delete(c),contains:c=>s.has(c),toggle:(c,f)=>{(f===undefined?!s.has(c):f)?s.add(c):s.delete(c);},_s:s};};

test('fumbles: Juniana and Doji use the CENTRAL d30 (only a 20 fumbles, ≈3 %) — no private d20 any more',async()=>{
  for(const f of ['junianaAbilityPatch.js','dojiConpuriAbilityPatch.js']){
    const src=read(f);assert.doesNotMatch(src,/Math\.random\(\) *\* *20\)|r >= 19/,f+': no private d20');assert.match(src,/__bfDie\(30\)/);assert.match(src,/fum = \(r === 20\)/);
  }
  const {JUNIANA_ABILITY_PATCH}=await load('junianaAbilityPatch.js');
  const run=(roll)=>{
    const logs=[],pops=[];let done=0;
    const c=clock({__bfDuckAbilHooked:true,__bfDie:()=>roll,__bfFumblePop:(...a)=>pops.push(a),pushLog:(t,m)=>logs.push(m),pushFx(){},renderBattle(){},netSync(){},finishAct(){done++;},
      B:{current:null},document:{createElement:()=>({style:{}}),head:{appendChild(){}},getElementById:()=>null,querySelector:()=>null,body:{appendChild(){}}}});
    c.env.useAbility=function(){throw new Error('original must not run for Juniana');};
    vm.runInNewContext(script(JUNIANA_ABILITY_PATCH),c.env);c.advance(600);
    const h={id:'juni',name:'Juniana',akind:'reflect-damage',abilityUsed:false};c.env.useAbility('p',h,()=>{done++;});c.advance(1000);
    return {h,logs,pops,done};
  };
  const f20=run(20);assert.equal(f20.pops.length,1,'20 on the d30 = fumble');assert.equal(f20.h._bfRefract,undefined);assert.match(f20.logs[0],/d30.*20\/30/);
  for(const r of [19,1,15,30]){const o=run(r);assert.equal(o.pops.length,0,'a '+r+' used to fumble (d20) or is a normal roll: no fumble now');assert.equal(o.h._bfRefract,true,'refraction is active after a '+r);}
  // frecuencia con un dado uniforme de 30 caras
  let bad=0,N=6000;for(let i=0;i<N;i++){const r=1+Math.floor(Math.random()*30);if(r===20)bad++;}assert(bad/N<0.05,'≈3 %: '+(100*bad/N).toFixed(1)+' %');
});
test('"ability had no effect": only when NOTHING was logged AND nothing changed in the heroes',async()=>{
  const src=read('fumbleRollPatch.js');assert.match(src,/var seq = window\.__bfLogSeq, sig0 = stateSig\(\);/);assert.match(src,/if\(window\.__bfLogSeq === seq && stateSig\(\) === sig0\)/);
  const {buildFumbleRollPatch}=await load('fumbleRollPatch.js');const code=script(buildFumbleRollPatch(false));
  const mk=(effect)=>{
    const logs=[];let fin=0;
    const G={team:{p:[{id:'a',name:'Krunder',hp:50,mana:20,alive:true,ability:'Golpe'}],o:[{id:'d',name:'Boss',hp:50,mana:20,alive:true}]}};
    const c=clock({G,B:{current:{side:'p',id:'a'}},pushLog:(t,m)=>logs.push(m),getHero:(s,i)=>G.team[s].find(h=>h.id===i),finishAct(){fin++;},endTurn(){},
      renderBattle(){},document:{createElement:()=>({style:{},appendChild(){}}),getElementById:()=>null,body:{appendChild(){}},head:{appendChild(){}},querySelector:()=>null,querySelectorAll:()=>[]},
      crypto:{getRandomValues:a=>{a[0]=7;return a;}}});
    c.env.useAbility=function(side,h,done){if(effect==='log')c.env.pushLog('li','x');if(effect==='state')G.team.o[0].hp-=10;if(effect==='flag')h0._bfDojiThreat=!h0._bfDojiThreat;if(effect==='status')G.team.o[0].para=2;done();};const h0=G.team.p[0];h0._bfDojiThreat=false;
    vm.runInNewContext(code,c.env);c.advance(800);
    const h=G.team.p[0];c.env.useAbility('p',h,()=>{});c.advance(2500);
    return logs.filter(l=>/no ha tenido efecto visible|no visible effect/i.test(l)).length;
  };
  assert.equal(mk('none'),1,'truly nothing happened: flagged');assert.equal(mk('log'),0,'wrote a log line: not flagged');assert.equal(mk('state'),0,'changed a hero without logging (this used to show a bogus PIFIA)');assert.equal(mk('flag'),0,'armed a passive (internal mark) without logging: an effect, not a fumble');assert.equal(mk('status'),0,'applied a status without logging: an effect');
});
test('hand art: the DB name wins over the engine\'s index/number art (Ladrón Enmascarado showed Reanimación Arcana)',async()=>{
  const {SHOP_SPELL_ART_PATCH}=await load('shopSpellArtPatch.js');
  const REANIM='https://cdn/reanimacion.png?bfart=9',LADRON='https://cdn/ladron.png',TRANSF='https://cdn/transformer.png';
  const mkChip=(name,bg)=>{const st={backgroundImage:bg,set:{},setProperty(k,v){this.set[k]=v;if(k==='background-image')this.backgroundImage=v;},removeProperty(){}};
    return {style:st,classList:cls(),dataset:{},title:'',textContent:name+' 12',querySelector:s=>s==='.bf-chip-name'?{textContent:name}:null};};
  const chips=[mkChip('El Ladrón Enmascarado','url("'+REANIM+'")'),mkChip('Transformer','url("'+REANIM+'")'),mkChip('Bola de Fuego','url("https://cdn/bola.png?bfart=2")'),mkChip('Cosa Rara','')];
  const hand={querySelectorAll:()=>chips},posted=[];const L={};
  const c=clock({NET:undefined,renderBattle(){},document:{head:{appendChild(){}},createElement:()=>({style:{},appendChild(){}}),getElementById:i=>(i==='hand_p'?hand:i==='hand_o'?{querySelectorAll:()=>[]}:null),querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}}});
  c.env.addEventListener=(t,f)=>{L[t]=f;};c.env.parent={postMessage:m=>posted.push(m)};
  vm.runInNewContext(script(SHOP_SPELL_ART_PATCH),c.env);
  // el padre manda el arte por nombre (la BD escribe "Ladrón Enmascarado" sin artículo)
  L.message({data:{bfArtMap:{'Ladrón Enmascarado':LADRON,'Transformer':TRANSF,'Bola de Fuego':'https://cdn/bola.png'},bfCardInfo:{}}});
  c.advance(200);c.env.renderBattle();c.advance(100);
  assert.equal(chips[0].style.backgroundImage,'url("'+LADRON+'")','Ladrón: corrected despite the article / the wrong engine art');
  assert.equal(chips[1].style.backgroundImage,'url("'+TRANSF+'")','Transformer: corrected');
  assert.equal(chips[2].style.set['background-image'],undefined,'already the right art (only the cache stamp differs): untouched');
  assert.equal(chips[3].style.backgroundImage,'','unknown card: left alone');assert.ok(chips[0].classList.contains('bf-chip-card'),'marked, so the direct-play button is added');
  assert.equal(posted.filter(m=>m.bfArtMapRequest).length,1,'asked once at start');
});
test('hand art: if the art map never arrives the iframe keeps asking (every 3 s, up to 25 times) and stops once it has it',async()=>{
  const {SHOP_SPELL_ART_PATCH}=await load('shopSpellArtPatch.js');const posted=[],L={};
  const c=clock({document:{head:{appendChild(){}},createElement:()=>({style:{},appendChild(){}}),getElementById:()=>null,querySelectorAll:()=>[],querySelector:()=>null}});
  c.env.addEventListener=(t,f)=>{L[t]=f;};c.env.parent={postMessage:m=>posted.push(m)};
  vm.runInNewContext(script(SHOP_SPELL_ART_PATCH),c.env);c.advance(10000);const asked=posted.filter(m=>m.bfArtMapRequest).length;assert.equal(asked,1+3,'initial + one every 3 s');
  L.message({data:{bfArtMap:{'X':'u'}}});c.advance(20000);assert.equal(posted.filter(m=>m.bfArtMapRequest).length,asked,'it stops asking once the map has arrived');
});
test('card catalog: retries with back-off, no 300 cap, local copy as a fallback, a failure is never memorised',async()=>{
  const os=require('node:os'),tmp=path.join(os.tmpdir(),'bf-cat-'+process.pid+'.mjs');
  fs.writeFileSync(tmp,read('cardCatalog.js').replace("import { base44 } from '@/api/base44Client';","const base44 = { entities: { Card: { list: async () => [] } } };"));
  const {createCatalogLoader,CATALOG_LIMIT}=await import(pathToFileURL(tmp).href);fs.unlinkSync(tmp);
  const mem=()=>{const m={};return {m,getItem:k=>(k in m?m[k]:null),setItem:(k,v)=>{m[k]=String(v);}};};
  const cards=[{name:'A',number:1},{name:'B',number:301}];
  // falla 2 veces y luego funciona
  let calls=0,waits=[];const st=mem();
  const L=createCatalogLoader({fetchCards:async()=>{calls++;if(calls<3)throw new Error('net');return cards;},storage:st,wait:async ms=>{waits.push(ms);}});
  const [a,b]=await Promise.all([L.load(),L.load()]);assert.deepEqual(a,cards);assert.equal(b,a);assert.equal(calls,3,'two failures + one success; concurrent callers share the same load');assert.deepEqual(waits,[400,1000],'growing waits');
  assert.equal(await L.load(),cards);assert.equal(calls,3,'cached after success');assert.ok(JSON.parse(st.m.bfCardCatalogV1).cards.length===2,'saved locally');
  // todo falla: usa la copia local; sin copia: error, y NO queda memorizado
  const L2=createCatalogLoader({fetchCards:async()=>{throw new Error('down');},storage:st,wait:async()=>{}});assert.deepEqual(await L2.load(),cards,'network down: the last good copy is used');
  let n=0,down=true;const L3=createCatalogLoader({fetchCards:async()=>{n++;if(down)throw new Error('down');return cards;},storage:mem(),wait:async()=>{}});
  await assert.rejects(()=>L3.load(),/down/);assert.equal(n,6,'6 attempts');down=false;assert.deepEqual(await L3.load(),cards,'the next request tries again (the failure was not remembered)');
  assert.equal(CATALOG_LIMIT,1000);
  const home=read('../pages/Home.jsx');assert.doesNotMatch(home,/Card\.list\('number', 300\)/);assert.equal((home.match(/loadCardCatalog\(\)/g)||[]).length>=2,true);assert.match(home,/attempt < 8\) timer = setTimeout\(\(\) => loadBattleData\(attempt \+ 1\), 15000\)/);
});
test('end guard: lineup photo at battle start; extinct side forces the end (host/local only); revival cancels it; cinematic is kicked',async()=>{
  const {END_GUARD_PATCH}=await load('endGuardPatch.js'),{MATCH_EPOCH_PATCH}=await load('matchEpochPatch.js');
  const mk=(role,over={})=>{
    const el={s:{classList:cls()},r:{classList:cls()}};el.s.classList.add('active');
    const mkh=(id,alive=true)=>({id,name:id.toUpperCase(),alive});
    const G={demo:false,team:{p:[mkh('a'),mkh('b'),mkh('c')],o:[mkh('d'),mkh('e'),mkh('f')]}};const B={over:false};
    const calls={check:0,show:[],net:0,end:0,posts:[]};let ov=null;
    const c=clock({G,B,NET:{role},living:sd=>G.team[sd].filter(h=>h.alive),checkWin(){calls.check++;},showResult(w){calls.show.push(w);},netSync(){calls.net++;},
      document:{getElementById:i=>(i==='s-battle'?el.s:i==='s-result'?el.r:i==='bf-end-cine'?ov:null)},parent:{postMessage:m=>calls.posts.push(m)},...over});
    c.env.bfEndCinematic=()=>{calls.end++;};
    vm.runInNewContext(script(MATCH_EPOCH_PATCH),c.env);vm.runInNewContext(script(END_GUARD_PATCH),c.env);
    return {c,el,G,B,calls,setOv:v=>{ov=v;}};
  };
  // 1) foto fija al empezar y reinicio por partida nueva
  let w=mk('host');w.c.advance(1200);
  assert.deepEqual(JSON.parse(JSON.stringify(w.c.env.__bfLineup.p.map(h=>h.id))),['a','b','c']);assert.equal(w.c.env.__bfLineup.o.length,3);
  w.G.team.p=[];w.c.advance(600);assert.equal(w.c.env.__bfLineup.p.length,3,'kept even if G.team later comes back empty (the old cinematic then showed no portraits)');
  w.c.env.bfNewMatchEpoch('rematch');assert.equal(w.c.env.__bfLineup.p.length,0,'a new match forgets the old lineup');
  assert.equal(w.c.env.bfLineupArt({id:'x',name:'Zed'}),'');
  w.c.env.__bfCardArtMap={zed:{base:'B',elite:'E'},Zed:{base:'B2',elite:'E2'}};assert.equal(w.c.env.bfLineupArt({id:'x',name:'Zed'}),'B2');assert.equal(w.c.env.bfLineupArt({id:'x',name:'Zed',eliteMode:true}),'E2');
  // 2) 3 héroes originales muertos, la partida NO termina (checkWin no hace nada): 4 s -> checkWin; 8 s -> fin forzado
  w=mk('host');w.c.advance(800);w.G.team.o.forEach(h=>{h.alive=false;});w.G.team.o.push({id:'uni',name:'Unicornio',alive:true});   // una invocación sigue viva
  w.c.advance(15000);assert.equal(w.calls.check,0,'a living summon is a hero like any other: the side is NOT extinct');assert.equal(w.calls.show.length,0);
  w.G.team.o[3].alive=false;   // ahora cae también la invocación
  w.c.advance(3500);assert.equal(w.calls.check,0);w.c.advance(1200);assert.equal(w.calls.check,1,'after 4 s the engine is asked to decide');assert.equal(w.B.over,false);
  w.c.advance(4500);assert.equal(w.B.over,true,'still not over: forced');assert.deepEqual(w.calls.show,[true],'side o is extinct => p wins');assert.equal(w.G._result.pWin,true);assert.ok(w.calls.net>=1);
  assert.ok(w.calls.posts.some(m=>m.bfRelayError&&m.bfRelayError.error_type==='forced_end'),'reported in diagnostics');
  w.c.advance(9000);assert.equal(w.calls.show.length,1,'forced once');
  // 3) un renacimiento dentro de la ventana lo cancela
  w=mk('host');w.c.advance(800);w.G.team.p.forEach(h=>{h.alive=false;});w.c.advance(3000);w.G.team.p[0].alive=true;w.c.advance(12000);assert.equal(w.calls.check,0);assert.equal(w.B.over,false);assert.equal(w.calls.show.length,0,'revived in time: nothing forced');
  // 4) el invitado y las demos nunca fuerzan; con la partida ya terminada tampoco
  for(const [role,over] of [['client',{}],['host',{}]]){w=mk(role);w.c.advance(800);w.G.team.p.forEach(h=>{h.alive=false;});if(role==='host')w.G.demo=true;w.c.advance(12000);assert.equal(w.calls.show.length,0,role+(role==='host'?' demo':'')+' never forces');}
  w=mk('host');w.c.advance(800);w.G.team.p.forEach(h=>{h.alive=false;});w.B.over=true;w.c.advance(12000);assert.equal(w.calls.check+w.calls.show.length,0);
  // 5) cinemática final: arranca si en 3 s no hay overlay; no si ya se mostró
  w=mk('host');w.c.advance(800);w.el.s.classList.remove('active');w.el.r.classList.add('active');w.c.env.__bfEndCine=1;w.c.advance(2500);assert.equal(w.calls.end,0);w.c.advance(1500);assert.equal(w.calls.end,1,'result screen without the cinematic for 3 s: started');assert.equal(w.c.env.__bfEndCine,0,'stale flag cleared first');w.c.advance(8000);assert.equal(w.calls.end,1,'once');
  w=mk('host');w.c.advance(800);w.el.s.classList.remove('active');w.el.r.classList.add('active');w.c.env.__bfEndCineDoneAt=5;w.c.advance(6000);assert.equal(w.calls.end,0,'already shown: not replayed');
  w=mk('host');w.c.advance(800);w.el.s.classList.remove('active');w.el.r.classList.add('active');w.setOv({});w.c.advance(6000);assert.equal(w.calls.end,0,'overlay present: nothing to do');
  // cableado servidor + inyección
  const srv=fs.readFileSync(path.join(__dirname,'..','..','..','base44','functions','gameHtml','entry.ts'),'utf8');
  assert.match(srv,/function originals\(side\)\{var live=[^]*?window\.__bfLineup/);assert.match(srv,/window\.bfLineupArt&&window\.bfLineupArt\(h\)/);assert.match(srv,/e\.style\.animation='none';e\.style\.opacity='1'/,'portraits forced visible whatever the animation does');
  assert.match(read('gameInject.js'),/MATCH_EPOCH_PATCH \+ END_GUARD_PATCH \+/);
});
test('MP self-healing: host heartbeat, guest resync request, silent-guest state resend with back-off, match-id adoption',()=>{
  const src=read('serverRelayPatch.js');
  const a=src.indexOf('// ---- AUTORREPARACIÓN DE TURNOS ----'),b=src.indexOf('  // ---- Estado de polling ----');assert(a>0&&b>a);
  const region=src.slice(a,b);assert.doesNotMatch(region,/\\|\$\{/,'region is plain code (no template escapes)');
  const cvStart=region.indexOf('  function createVirtualConn');
  const run=(side,{cur,active=true,hostCur})=>{
    const posts=[],sent=[],errs=[],nets=[];let guestCur=cur;
    const cls={contains:c=>c==='active'&&active};
    const c=clock({B:{current:cur?{side:cur[0],id:cur.slice(2)}:null,over:false},relaySide:side,relayConn:null,
      document:{getElementById:id=>(id==='s-battle'?{classList:cls}:null),querySelector:()=>({id:'s-battle'})},netSync:id=>nets.push(id),
      reportRelayError:(t,a2,m)=>errs.push([t,a2,m]),relayRequest:()=>Promise.resolve({}),__bfMatchId:'',__bfMatchRound:0,
      bfCreateRelayOutbox:()=>({send:m=>sent.push(m),close(){}}),crypto:{randomUUID:()=>'id-1'},G:{}});
    const code=region.replace(/^\s*\/\/.*$/gm,'');
    vm.runInNewContext('var relayConn=null,relaySide='+JSON.stringify(side)+';'+code+';this.__api={handleControl:handleControl,startHostBeat:startHostBeat,createVirtualConn:createVirtualConn,setConn:function(x){relayConn=x;},foreignId:foreignId};',c.env);
    return {c,posts,sent,errs,nets,api:c.env.__api};
  };
  // --- anfitrión: latido cada 2,5 s con su turno; reenvío con espera creciente si el invitado calla en SU turno
  let h=run('p',{cur:'o:x'});const conn=h.api.createVirtualConn('p','ABCD');conn.open=true;h.api.setConn(conn);conn._bfLastSeen=h.c.now();h.api.startHostBeat();
  h.c.advance(2600);const hb=h.sent.filter(m=>m.t==='bfTurnHb');assert.equal(hb.length,1);assert.equal(hb[0].turn,'o:x');
  h.c.advance(5200);assert.equal(h.nets.length,0,'guest silent < 8 s: nothing resent');
  h.c.advance(2600);assert.equal(h.nets.length,1,'8 s without news in the guest\'s turn: full state resent');
  h.c.advance(15000);assert.equal(h.nets.length,1,'back-off: not again after 8 s (next gap is 20 s)');h.c.advance(8000);assert.equal(h.nets.length,2,'again after ~20 s');
  conn._bfLastSeen=h.c.now()+1;h.c.advance(2600);h.c.advance(10000);assert.equal(h.nets.length,3,'the guest spoke: back-off resets to 8 s');
  // en el turno del anfitrión o fuera de batalla no reenvía nada
  h=run('p',{cur:'p:a'});const c2=h.api.createVirtualConn('p','ABCD');c2.open=true;h.api.setConn(c2);h.api.startHostBeat();h.c.advance(30000);assert.equal(h.nets.length,0,'host own turn: no resend');
  h=run('p',{cur:'o:x',active:false});const c3=h.api.createVirtualConn('p','ABCD');c3.open=true;h.api.setConn(c3);h.api.startHostBeat();h.c.advance(30000);assert.equal(h.sent.length,0,'no battle: no heartbeat');
  // --- el host recibe bfResync: reenvía el estado; los mensajes de control NO llegan al motor
  h=run('p',{cur:'p:a'});const c4=h.api.createVirtualConn('p','ABCD');const got=[];c4.on('data',m=>got.push(m));
  c4._dispatch({t:'bfResync',turn:'o:x'});c4._dispatch({t:'bfTurnHb',turn:'p:a'});c4._dispatch({t:'intent',op:'act'});assert.equal(h.nets.length,1,'resync => state pushed');assert.deepEqual(got.map(m=>m.t),['intent'],'control messages are not given to the engine');
  // --- invitado: 2 latidos seguidos con otro turno => pide resincronizar (con límite de frecuencia)
  const g=run('g',{cur:'p:a'});const gc=g.api.createVirtualConn('g','ABCD');const gseen=[];gc.on('data',m=>gseen.push(m));
  gc._dispatch({t:'bfTurnHb',turn:'o:x'});assert.equal(g.sent.filter(m=>m.t==='bfResync').length,0,'one mismatch can be a transit: wait');
  gc._dispatch({t:'bfTurnHb',turn:'o:x'});assert.equal(g.sent.filter(m=>m.t==='bfResync').length,1,'second one: resync requested');assert.equal(g.errs[0][0],'turn_desync','and reported');
  gc._dispatch({t:'bfTurnHb',turn:'o:x'});gc._dispatch({t:'bfTurnHb',turn:'o:x'});assert.equal(g.sent.filter(m=>m.t==='bfResync').length,1,'rate limited (4 s)');
  g.c.advance(4500);gc._dispatch({t:'bfTurnHb',turn:'p:a'});gc._dispatch({t:'bfTurnHb',turn:'p:a'});assert.equal(g.sent.filter(m=>m.t==='bfResync').length,1,'same turn: nothing to ask');assert.equal(gseen.length,0);
  // --- el invitado con un id de partida viejo adopta el del anfitrión tras 3 mensajes seguidos del MISMO id
  const g2=run('g',{cur:'p:a'});g2.c.env.__bfMatchId='OLD';const gc2=g2.api.createVirtualConn('g','ABCD');const seen2=[];gc2.on('data',m=>seen2.push(m));
  gc2._dispatch({t:'snap',bfMatchId:'NEW'});gc2._dispatch({t:'snap',bfMatchId:'NEW'});assert.equal(seen2.length,0,'first two are still dropped (could be stale leftovers)');
  gc2._dispatch({t:'snap',bfMatchId:'NEW'});assert.equal(g2.c.env.__bfMatchId,'NEW','third: adopted');assert.equal(seen2.length,1,'and that message is processed');gc2._dispatch({t:'snap',bfMatchId:'NEW'});assert.equal(seen2.length,2,'from now on everything flows');
  const g3=run('g',{cur:'p:a'});g3.c.env.__bfMatchId='OLD';const gc3=g3.api.createVirtualConn('g','ABCD');const seen3=[];gc3.on('data',m=>seen3.push(m));
  ['X','Y','X','Z','Y'].forEach(id=>gc3._dispatch({t:'snap',bfMatchId:id}));assert.equal(seen3.length,0,'a mix of foreign ids (stale leftovers) is NOT adopted');assert.equal(g3.c.env.__bfMatchId,'OLD');
  // el anfitrión nunca cambia su id por mensajes ajenos
  const hh=run('p',{cur:'p:a'});hh.c.env.__bfMatchId='MINE';const hc=hh.api.createVirtualConn('p','ABCD');const seenH=[];hc.on('data',m=>seenH.push(m));for(let i=0;i<5;i++)hc._dispatch({t:'intent',bfMatchId:'OTHER'});assert.equal(seenH.length,0);assert.equal(hh.c.env.__bfMatchId,'MINE');
});
test('language guard (Spanish games only): English DB text is turned back into Spanish, other English-looking text is reported with a sample',async()=>{
  const {LANG_GUARD_PATCH}=await load('langGuardPatch.js');
  const mk=(v,p='DIV')=>({nodeValue:v,parentNode:{nodeName:p}});
  const nodes=[mk('Daña a todos los enemigos y gana 5 de vida'),mk('Deals 12 damage to the target hero and gains a shield'),mk('Hace daño'),mk('Deals 30 damage to all enemies and heals each ally'),mk('shield up!','SCRIPT'),mk('Hit')];
  const posts=[],L={};
  const c=clock({NodeFilter:{SHOW_TEXT:4},document:{hidden:false,body:{},createTreeWalker:()=>{let i=-1;return {nextNode:()=>nodes[++i]||null};}},parent:{postMessage:m=>posts.push(m)}});
  c.env.addEventListener=(t,f)=>{L[t]=f;};vm.runInNewContext(script(LANG_GUARD_PATCH),c.env);
  assert.equal(c.env.bfLooksEnglish('Deals 12 damage to the target hero'),true);assert.equal(c.env.bfLooksEnglish('Hace daño a todos los enemigos'),false);assert.equal(c.env.bfLooksEnglish('Hit'),false,'too short to judge');
  assert.equal(c.env.bfLooksEnglish('Golpe Épico del héroe de la montaña'),false);
  L.message({data:{bfCardDictRev:{'Deals 12 damage to the target hero and gains a shield':'Hace 12 de daño al héroe objetivo y gana un escudo'}}});
  assert.equal(nodes[1].nodeValue,'Hace 12 de daño al héroe objetivo y gana un escudo','exact DB English text -> Spanish');
  assert.equal(nodes[0].nodeValue,'Daña a todos los enemigos y gana 5 de vida','Spanish untouched');assert.equal(nodes[4].nodeValue,'shield up!','scripts skipped');
  const leaks=posts.filter(m=>m.bfRelayError&&m.bfRelayError.error_type==='lang_leak');assert.equal(leaks.length,1,'the English text that is NOT in the dictionary is reported');assert.match(leaks[0].bfRelayError.error_message,/Deals 30 damage to all enemies/);
  c.env.__bfLangGuardScan();c.env.__bfLangGuardScan();assert.equal(posts.filter(m=>m.bfRelayError&&m.bfRelayError.error_type==='lang_leak').length,1,'reported once per text');
  // tope de avisos por sesión
  for(let i=0;i<20;i++)nodes.push(mk('Deals '+i+' damage to the target and heals the ally '+i));c.env.__bfLangGuardScan();assert(posts.filter(m=>m.bfRelayError&&m.bfRelayError.error_type==='lang_leak').length<=8,'at most 8 reports');
  // cableado: solo en castellano
  assert.match(read('gameInject.js'),/buildLangEnPatch\(getLang\(\)\) \+ \(getLang\(\) === 'en' \? '' : LANG_GUARD_PATCH\) \+/);
  const home=read('../pages/Home.jsx');assert.match(home,/if \(!isEn && c\.en\) \{[^]*?rev\[String\(c\.en\[f\]\)\.trim\(\)\] = c\[f\]/);assert.match(home,/bfCardDictRev: rev/);
});

test('DESORIENTADO: when the d3 sends the hit to an ally/self, the queued effect, the log line and the damage all go to the NEW target',async()=>{
  const {MONKGETA_ABILITY_PATCH}=await load('monkgetaAbilityPatch.js');
  const run=(roll,allyAlive=true)=>{
    const mkh=(id,name,alive=true)=>({id,name,alive,hp:50});
    const G={team:{p:[mkh('a','Atacante'),mkh('b','Aliado',allyAlive)],o:[mkh('r','Rival')]}};const B={current:{side:'p',id:'a'}};
    const logs=[],hits=[];const queue=[{k:'slash',toSide:'o',toId:'r'},{k:'status',side:'o',id:'r'}];
    const c=clock({G,B,_fxQueue:queue,tSide:h=>G.team.p.includes(h)?'p':'o',enemySide:s=>s==='p'?'o':'p',getHero:(s,i)=>G.team[s].find(h=>h.id===i),pushFx(){},
      dealDamage:(t,a)=>{hits.push(t.id);t.hp-=a;return a;},__bfHeroRoll:()=>roll,pendTarget(){},finishAct(){},renderBattle(){},document:{}});
    c.env.pushLog=(k,t)=>logs.push(t);
    vm.runInNewContext(script(MONKGETA_ABILITY_PATCH),c.env);c.advance(400);
    G.team.p[0]._bfDisoriented=1;
    const d=c.env.dealDamage(G.team.o[0],12,{type:'melee'});c.env.pushLog('ld','Atacante golpea a Rival (-'+d+') cuerpo a cuerpo.');c.env.pushLog('li','Rival esquiva.');
    c.advance(5);c.env.pushLog('ld','Otro golpea a Rival (-3).');
    return {hits,logs,queue:JSON.parse(JSON.stringify(queue))};
  };
  let r=run(1);assert.deepEqual(r.hits,['r']);assert.equal(r.queue[0].toId,'r','1 = the rival: nothing changes');assert.match(r.logs.find(l=>/golpea a/.test(l)),/golpea a Rival/);
  r=run(2);assert.deepEqual(r.hits,['b'],'2 = an ally takes the damage');assert.deepEqual([r.queue[0].toSide,r.queue[0].toId],['p','b'],'the slash goes to the ally');assert.equal(r.queue[1].id,'r','other queued effects are not touched');
  assert.match(r.logs.find(l=>/Atacante golpea a/.test(l)),/golpea a Aliado \(-12\)/,'the log names the REAL target');assert.match(r.logs.find(l=>/Otro golpea/.test(l)),/a Rival/,'only the same action is rewritten, not later lines');assert.ok(r.logs.some(l=>/Rival esquiva/.test(l)),'lines without damage are untouched');
  r=run(2,false);assert.deepEqual(r.hits,['a'],'2 with no living ally = himself');assert.equal(r.queue[0].toId,'a');assert.match(r.logs.find(l=>/Atacante golpea a/.test(l)),/golpea a Atacante/);
  r=run(3);assert.deepEqual(r.hits,['a'],'3 = himself');assert.deepEqual([r.queue[0].toSide,r.queue[0].toId],['p','a']);
  assert.match(read('monkgetaAbilityPatch.js'),/note:'1 rival · 2 aliado · 3 él mismo',delay:0\}/,'the die appears with the attack, not 0.7 s later');
});
test('TRANSFORMER and summons read TOKENS as a global: the server must expose it (it lived inside an IIFE and they saw undefined)',()=>{
  const srv=fs.readFileSync(path.join(__dirname,'..','..','..','base44','functions','gameHtml','entry.ts'),'utf8');
  assert.match(srv,/var TOKENS = LOCAL_TOKENS[^\n]*\n(?:\s*\/\/[^\n]*\n)+\s*window\.TOKENS = TOKENS;/);
  assert.doesNotMatch(srv.slice(srv.indexOf('window.TOKENS = TOKENS')-400,srv.indexOf('window.TOKENS = TOKENS')),/`/,'no backtick inside the server template (it broke the whole function)');
  for(const f of ['transformFixPatch.js','epicSummonPatch.js','craneSummonPatch.js'])assert.match(read(f),/typeof TOKENS/,f+' reads the global');
  assert.match(read('fumbleRollPatch.js'),/doji\|conpuri\|dojpur\|monkgeta\|llorilomo\|rolero\|compresor/,'heroes whose mechanic is their own die skip the central fumble roll');
  assert.match(read('endGuardPatch.js'),/living\(side\)\.filter/,'forced end uses the engine rule (summons and bizarre heroes count as heroes)');
});
test('hand art in the EQUIPMENT phase comes from the card itself (card_id / name in the DB), never from a table position, and heals itself',()=>{
  const e=fs.readFileSync(path.join(__dirname,'..','..','..','base44/functions/gameHtml/entry.ts'),'utf8'),s=read('shopSpellArtPatch.js');
  assert.match(e,/const EQUIP_ART_BY_ID = \{\}, EQUIP_ART_BY_NAME = \{\};/);assert.match(e,/function equipArt\(it\) \{ return \(it && \(EQUIP_ART_BY_ID\[it\.id\] \|\| EQUIP_ART_BY_NAME\[it\.name\]\)\) \|\| ''; \}/);
  for(const re of [/var _a = equipArt\(s\) \|\| \(SPELL_ART/,/var _b = equipArt\(o\) \|\| \(OBJECT_ART/,/var art = equipArt\(item\) \|\| \(SPELL_ART\[indexInList/,/var art = equipArt\(item\) \|\| \(OBJECT_ART\[indexInList/,/art: equipArt\(it\) \|\| \(NUM_ART/,/artArr\[i\] = equipArt\(it\) \|\|/])assert.match(e,re,'card art first: '+re);
  assert.match(e,/if \(chip\.dataset\.bfHandArt === '1'\) \{[\s\S]{0,400}l\.style\.backgroundImage = 'url\("' \+ u0 \+ '"\)'/,'an already painted hand card is repainted if its image is not its own');
  assert.match(s,/document\.querySelectorAll\('#s-equip \.chip-spell, #s-equip \.chip-object'\)/,'the client also fixes the equipment-phase hand (before: only the battle hand)');
});
test('no card magnifier on the equipment weapon/armour picker (the card is already big there); it stays on the shop and the hand',async()=>{
  const {CARD_MAGNIFIER_PATCH}=await load('cardMagnifierPatch.js').catch(()=>({}));
  const src=read('cardMagnifierPatch.js');
  assert.match(src,/if \(e\.target\.closest\('\.bf-quick-card'\)\) \{ hide\(\); return; \}/);
  assert.doesNotMatch(src,/\|\| e\.target\.closest\('\.bf-quick-card'\)\;/,'the picker cards no longer open the magnifier');
  assert.match(src,/e\.target\.closest\('\.chip\.bf-chip-card'\) \|\| e\.target\.closest\('\.shop-card\.has-art'\)/,'hand and shop keep it');
});
