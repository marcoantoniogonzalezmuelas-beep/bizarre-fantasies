// XSS por nick/avatar: ayudantes del cliente, saneado del servidor y guardas estáticas.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const { pathToFileURL }=require('node:url');
const root=path.join(__dirname,'..','..','..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
async function helpers(){
  const {HTML_SAFETY_PATCH}=await import(pathToFileURL(path.join(root,'src/lib/htmlSafetyPatch.js')).href);
  const ctx={};ctx.window=ctx;vm.runInNewContext(HTML_SAFETY_PATCH.replace(/<\/?script>/g,''),ctx);return ctx;
}
const EVIL_ATTR='https://x.test/a.png" onerror="alert(document.cookie)" x="';
const EVIL_TAG='<img src=x onerror=alert(1)>';

test('bfEscH neutralises markup',async()=>{
  const w=await helpers();const out=w.bfEscH(EVIL_TAG+' & "q" \'s');
  assert.doesNotMatch(out,/[<>"']/);assert.match(out,/&lt;img/);assert.equal(w.bfEscH(null),'');
});
test('bfAvUrl only lets safe image URLs through and cannot break out of src="..."',async()=>{
  const w=await helpers();
  for(const bad of ['javascript:alert(1)','JaVaScRiPt:alert(1)','data:text/html,<script>alert(1)</script>','//evil.test/x.png','vbscript:x','',null,undefined])
    assert.equal(w.bfAvUrl(bad),'',String(bad));
  const out=w.bfAvUrl(EVIL_ATTR);
  assert.doesNotMatch(out,/["'<>`\s\\]/,'no attribute-breaking characters survive: '+out);
  assert(out.startsWith('https://x.test/a.png'));
  assert.equal(w.bfAvUrl("https://m.base44.com/a.png?x='y'"),'https://m.base44.com/a.png?x=%27y%27');
  assert.equal(w.bfAvUrl('https://media.base44.com/images/public/av1.png'),'https://media.base44.com/images/public/av1.png','legit URL unchanged');
  assert.equal(w.bfAvUrl('/avatars/a.png'),'/avatars/a.png','same-site relative path allowed');
});
test('bfCleanIncoming cleans names/nicks/avatars deep inside a snapshot and leaves game text alone',async()=>{
  const w=await helpers();
  const msg={t:'snap',G:{names:{p:EVIL_TAG,o:'Ana'},hostName:'<b>Bob</b>',players:[{nick:'Zed<script>',avatar:'javascript:alert(1)',hp:10}],
    log:[{txt:'<b>Golpe crítico</b> a Zarmandis'}],cards:[{name:'Zarmandis',ability_text:'Hace <i>daño</i> & más'}]},guest_avatar:EVIL_ATTR};
  w.bfCleanIncoming(msg);
  assert.equal(msg.G.names.p,'img src=x onerror=alert(1)');assert.equal(msg.G.names.o,'Ana');assert.equal(msg.G.hostName,'bBob/b');
  assert.equal(msg.G.players[0].nick,'Zedscript');assert.equal(msg.G.players[0].avatar,'');assert.equal(msg.G.players[0].hp,10);
  assert.doesNotMatch(msg.guest_avatar,/["'<>\s]/);
  assert.equal(msg.G.log[0].txt,'<b>Golpe crítico</b> a Zarmandis','non-name game text untouched');
  assert.equal(msg.G.cards[0].ability_text,'Hace <i>daño</i> & más');assert.equal(msg.G.cards[0].name,'Zarmandis');
  const m2={nicks:['A<b>','Zoe'],room:{hostAvatar:'javascript:x',name:'<i>sala</i>'}};w.bfCleanIncoming(m2);
  assert.deepEqual(m2.nicks,['Ab','Zoe']);assert.equal(m2.room.hostAvatar,'');assert.equal(m2.room.name,'isala/i');
  assert.equal(w.bfCleanIncoming(null),null);assert.equal(w.bfCleanIncoming('str'),'str');
});
test('server sanitizers: strip markup/bidi/control chars, keep legitimate nicks, https-only avatars',()=>{
  const src=read('base44/shared/sanitize.ts').replace(/export function/g,'function').replace(/: (unknown|string)\b/g,'');
  const {cleanNick,cleanAvatarUrl}=vm.runInNewContext(src+'\n({cleanNick,cleanAvatarUrl})');
  assert.equal(cleanNick(EVIL_TAG),'img src=x onerror=alert(1)');assert.doesNotMatch(cleanNick('a\u202eb\u0000c<d>'),/[<>\u202e\u0000]/);
  assert.equal(cleanNick("O'Brien & Co"),"O'Brien & Co");assert.equal(cleanNick('  Zé  '),'Zé');assert.equal(cleanNick('x'.repeat(99)).length,28);assert.equal(cleanNick(null),'');
  assert.equal(cleanAvatarUrl('https://media.base44.com/a.png'),'https://media.base44.com/a.png');
  for(const bad of ['javascript:alert(1)',EVIL_ATTR,'http://insecure.test/a.png','//evil.test/a.png','data:image/png;base64,AAAA',null])assert.equal(cleanAvatarUrl(bad),'',String(bad));
});
test('the vulnerable sinks are gone (static guards)',()=>{
  const av=read('src/lib/avatarPatch.js'),cl=read('src/lib/centralLobbyPatch.js'),rp=read('src/lib/serverRelayPatch.js'),home=read('src/pages/Home.jsx');
  assert.doesNotMatch(av,/<img src="' \+ (a|av)\.url \+/,'avatarPatch must not concatenate raw urls');
  assert.equal((av.match(/window\.bfAvUrl\?window\.bfAvUrl\(/g)||[]).length,3);
  assert.doesNotMatch(cl,/<img src="'\+url\+'"/);assert.match(cl,/bfAvUrl\(url\)/);
  assert.doesNotMatch(cl,/'código <b>'\+r\.id\+'<\/b>/);assert.match(cl,/esc\(r\.id\)/);assert.match(cl,/map\(function\(n\)\{return esc\(n\);\}\)/);
  assert.match(rp,/bfCleanIncoming\(msg\)/,'every incoming relay message is cleaned');
  assert.match(home,/const INJECT = UUID_POLYFILL \+ HTML_SAFETY_PATCH \+/,'helpers are injected before any patch that uses them');
  assert.match(cl,/bfPlayerAvatars&&event\.source===window\.parent/);assert.match(av,/bfPlayerAvatars === 'object' && e\.source === window\.parent/);
  for(const f of ['base44/functions/gameRelay/entry.ts','base44/functions/gameLobby/entry.ts'])
    assert.doesNotMatch(read(f),/String\(body\.(nick|avatar)\b/,f+' must sanitise nick/avatar');
});
