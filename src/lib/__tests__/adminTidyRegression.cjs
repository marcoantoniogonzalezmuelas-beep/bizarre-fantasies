// Backoffice ordenado: menú de secciones, panel de mantenimiento y un único "Actualizar datos del juego" seguro.
// También: el veneno se ve en el retrato y Sanar lo cura; la comprobación pregunta al servidor del juego.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const lib=f=>path.join(__dirname,'..',f),read=f=>fs.readFileSync(lib(f),'utf8');
// gameDataSync importa con el alias '@/lib/...': se carga desde una copia con rutas relativas
async function loadSync(){
  const dir=fs.mkdtempSync('/tmp/gds-');
  for(const f of ['gameDataSync.js','abilitySeed.js','equipmentSeed.js','newCardsSeed.js','equipmentStore.js','equipmentEffects.js']){
    if(!fs.existsSync(lib(f)))continue;
    fs.writeFileSync(path.join(dir,f),read(f).replace(/'@\/lib\/([A-Za-z0-9_]+)'/g,"'./$1.js'"));
  }
  fs.writeFileSync(path.join(dir,'package.json'),'{"type":"module"}');
  return import(pathToFileURL(path.join(dir,'gameDataSync.js')).href);
}
function fakeDb(cards,impls){
  const db={Card:cards.map((c,i)=>({id:'c'+i,...c})),AbilityImpl:impls.map((r,i)=>({id:'a'+i,...r}))};let n=1000;const log={create:{Card:0,AbilityImpl:0},update:{Card:0,AbilityImpl:0}};
  const ent=name=>({list:async()=>db[name].slice(),filter:async(q)=>db[name].filter(r=>Object.keys(q).every(k=>r[k]===q[k])),
    create:async(o)=>{log.create[name]++;const r={id:'n'+(n++),...o};db[name].push(r);return r;},
    update:async(id,o)=>{log.update[name]++;const r=db[name].find(x=>x.id===id);Object.assign(r,o);return r;}});
  return {db,log,client:{entities:{Card:ent('Card'),AbilityImpl:ent('AbilityImpl')}}};
}
test('"Actualizar datos del juego": creates what is missing, a second click does nothing, and never overwrites your edits',async()=>{
  const {syncGameData}=await loadSync();
  const base=[{card_id:'sp_steal',name:'El Ladrón',category:'spell',number:124,mana:12},{card_id:'ob_drain',name:'Drenaje',category:'object',number:125},{card_id:'kru',name:'Xabierus',category:'hero',number:1}];
  const F=fakeDb(base,[]);
  let r=await syncGameData(F.client);
  assert.equal(r.cardsCreated,5,'the 5 new cards');assert.ok(r.paramsAdded>=6,'their parameters + those of existing equipment');assert.ok(r.specsAdded>=1,'missing ability sheets');assert.equal(r.adjusted,1,'Ladrón 12 -> 20 mana');
  assert.equal(F.db.Card.find(c=>c.card_id==='sp_steal').mana,20);
  const r2=await syncGameData(F.client);
  assert.deepEqual([r2.cardsCreated,r2.paramsAdded,r2.specsAdded,r2.adjusted],[0,0,0,0],'second click: nothing to do');
  // tus cambios se respetan: parámetros editados y un maná puesto a mano
  F.db.Card.find(c=>c.card_id==='sp_steal').mana=15;
  const eq=F.db.AbilityImpl.find(x=>x.card_id==='ob_drain'&&x.effect_type==='equipment');const before=JSON.stringify(eq.params);
  const r3=await syncGameData(F.client);
  assert.equal(r3.adjusted,0);assert.equal(F.db.Card.find(c=>c.card_id==='sp_steal').mana,15,'your 15 stays');assert.equal(JSON.stringify(eq.params),before,'edited parameters untouched');
  assert.equal(F.log.update.AbilityImpl,0,'never updates an existing sheet');
});
test('backoffice header: sections menu + collapsible maintenance panel instead of 13 loose buttons and links',()=>{
  const a=read('../pages/AdminCards.jsx');
  assert.match(a,/<AdminNav \/><\/div><MaintenancePanel cards=\{cards\} \/>/);
  for(const old of ['<AbilitySeedImportButton','<EquipmentSeedImportButton','<NewCardsImportButton','to="/admin/subastas"','to="/admin/red"'])assert.ok(!a.includes(old),'moved out of the header: '+old);
  const n=read('../components/admin/AdminNav.jsx');for(const to of ['/admin','/admin/subastas','/admin/estadisticas-heroes','/admin/ia','/admin/jugadores','/admin/chat','/admin/news','/admin/red'])assert.ok(n.includes("to: '"+to+"'"),to);
  const m=read('../components/admin/MaintenancePanel.jsx');for(const c of ['<GameDataSyncButton />','<EquipShopCheckButton />','<OrphanSpecsButton />','<BackupCardsButton cards={cards} />'])assert.ok(m.includes(c),c);
  assert.match(m,/<details /,'collapsible');
});
test('POISON: fixed badge on the portrait and Sanar cures it (engine message or its rewritten form)',()=>{
  const p=read('newGearPatch.js');
  assert.match(p,/class="status-badge st-poison"/);assert.match(p,/var m=\/: \(\.\+\?\) \(\?:liberado\|vuelve a su estado normal\)/);
  assert.match(read('abilityImplPatch.js'),/case 'cleanse': \{ t\.sleep = 0; t\.para = 0; t\.skip = 0; t\.silence = 0; t\.mark = null; t\._bfConfused = 0; t\._bfDrunk = 0; t\._bfPoison = null;/);
});
test('the shop check also asks the GAME SERVER: its version and which equipment cards it carries',async()=>{
  const {checkServerGame}=await import(pathToFileURL(lib('equipShopCheck.js')).href.replace('equipShopCheck.js','equipShopCheck.js')).catch(()=>({}));
  const src=read('equipShopCheck.js');assert.match(src,/export function checkServerGame\(html, headerVersion, expectedVersion, cards\)/);
  const b=read('../components/admin/EquipShopCheckButton.jsx');assert.match(b,/base44\.functions\.invoke\('gameHtml'/);assert.match(b,/vuelve a publicar en Base44/);
});
test('INVITE: "Invitar con enlace" in the room wait screen (link /?sala=CODE, no password in it); opening it joins that room',()=>{
  const p=read('invitePatch.js');
  assert.match(p,/var link=origin\(\)\+'\/\?sala='\+encodeURIComponent\(code\);/);assert.doesNotMatch(p,/sala='\+[^;]*NET\.pass/,'the password never goes in the link');
  assert.match(p,/if\(stage==='hostwait'\)/);assert.match(p,/joinRoomFromList\(room\.id,!!room\.hasPass\)/);
  const h=read('../pages/Home.jsx');
  assert.match(h,/new URLSearchParams\(window\.location\.search\)\.get\('sala'\)/);assert.match(h,/postMessage\(\{ bfJoinRoom: code \}, '\*'\)/);assert.match(h,/u\.searchParams\.delete\('sala'\)/,'the link is used once');
  assert.match(h,/clipboard-write; web-share"/);assert.match(read('gameInject.js'),/NEW_GEAR_PATCH \+ INVITE_PATCH/);
});
test('SHARE RESULT: image with VICTORY/DEFEAT, both players and the 3 + 3 heroes; shared on mobile, downloaded on desktop',()=>{
  const p=read('invitePatch.js');
  assert.match(p,/win\?'\\\\u00a1VICTORIA!':'DERROTA'/);assert.match(p,/var mine=\(L\[me\]\|\|\[\]\)\.slice\(0,3\),theirs=\(L\[rv\]\|\|\[\]\)\.slice\(0,3\);/);
  assert.match(p,/n\.canShare&&n\.canShare\(\{files:\[file\]\}\)/);assert.match(p,/a\.download='bizarre-fantasies-resultado\.png'/);
  assert.match(p,/if\(typeof NET!=='undefined'&&NET\.role==='client'\)return r\.pWin===\(NET\.mySide==='p'\);/,'the guest sees its own result');
});
test('BALANCE: win rate per hero from match results (only with 5+ games), shown in Stats héroes',async()=>{
  const {heroWinRates,MIN_GAMES}=await import(pathToFileURL(lib('heroWinRates.js')).href);
  assert.equal(MIN_GAMES,5);
  const R=[];for(let i=0;i<6;i++)R.push({winner_heroes:[{name:'Xabierus'}],loser_heroes:[{name:'Vap'}]});R.push({winner_heroes:[{name:'Vap'}],loser_heroes:[{name:'Xabierus'},{name:'Juni'}]});
  const w=heroWinRates(R);
  assert.deepEqual([w.xabierus.wins,w.xabierus.played,w.xabierus.winRate],[6,7,86]);assert.equal(w.vap.winRate,14);assert.equal(w.juni.winRate,null,'1 game: no %');
  assert.match(read('../hooks/useHeroStats.js'),/base44\.entities\.MatchResult\.list\('-created_date', 3000\)/);
  assert.match(read('../components/admin/heroes/HeroStatRow.jsx'),/\$\{winRate\}% victorias/);
});
test('STATS: hero win ranking (with survival and elite), gear by category, players vs each AI level, summary',async()=>{
  const S=await import(pathToFileURL(lib('adminStats.js')).href);
  const R=[];for(let i=0;i<6;i++)R.push({mode:'ia',ai_level:'novice',loser_is_ai:true,winner_heroes:[{name:'Xabierus',died:false},{name:'Boss',died:true,elite:true}],loser_heroes:[{name:'Vap',died:true,elite:true}]});
  R.push({mode:'ia',ai_level:'novice',winner_is_ai:true,winner_heroes:[{name:'Vap',died:false}],loser_heroes:[{name:'Xabierus',died:true},{name:'Boss',died:true}]});
  const h=Object.fromEntries(S.heroRanking(R).map(x=>[x.key,x]));
  assert.deepEqual([h.xabierus.winRate,h.xabierus.survivalRate,h.boss.eliteRate,h.vap.winRate],[86,86,86,14]);
  const L=[];for(let i=0;i<6;i++)L.push({player_won:i<5,duration_seconds:300,turns_played:8,items_bought:[{name:'Hacha de Guerra',side:'p'},{name:'Bola de Fuego',side:'o'},{name:'p',side:'p'}]});
  const g=Object.fromEntries(S.gearRanking(L,[{name:'Hacha de Guerra',category:'melee_weapon'},{name:'Bola de Fuego',category:'spell'}]).map(x=>[x.key,x]));
  assert.deepEqual([g['hacha de guerra'].used,g['hacha de guerra'].winRate,g['bola de fuego'].winRate],[6,83,17],'opponent gear wins when the player loses');
  assert.ok(!g.p,'old broken records ("p") are ignored');
  assert.deepEqual(S.aiStats(R)[0],{level:'novice',games:7,humanWins:6,humanWinRate:86});
  assert.deepEqual([S.summaryStats(R,L).avgSeconds,S.summaryStats(R,L).avgRounds],[300,8]);
  assert.match(read('../pages/AdminHeroStats.jsx'),/<StatsDashboard results=\{results\} logs=\{logs\} cards=\{cards\} \/>/);
});
test('GAME LOG: the gear of BOTH sides is saved when the battle starts (before: the side "p" was saved instead of the card)',()=>{
  const p=read('gameLogPatch.js');
  assert.match(p,/function startLog\(\)\{battleStart=Date\.now\(\);itemsBought=gearSnapshot\(\);/);
  assert.match(p,/\[h\.mwep,h\.rwep,h\.armor\]\.forEach/);assert.match(p,/G\.spellbook&&G\.spellbook\[side\]/);assert.match(p,/G\.items&&G\.items\[side\]/);
  assert.doesNotMatch(p,/var item=arguments\[0\]\|\|arguments\[1\]/,'the broken purchase tracking is gone');
});
