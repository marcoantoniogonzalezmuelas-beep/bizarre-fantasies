// PASO 2: ninguna entidad del juego admite escritura anónima. Las escrituras de los jugadores
// pasan por la función gameRecord (rol de servicio). Solo ConnectionError acepta "create"
// abierto a propósito: el cliente informa ahí de sus errores de conexión.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const dir=path.join(__dirname,'..','..','..','base44','entities');
const strip=t=>t.replace(/^\s*\/\/.*$/gm,'');
const ents=fs.readdirSync(dir).filter(f=>f.endsWith('.jsonc')).map(f=>({name:f.slice(0,-6),d:JSON.parse(strip(fs.readFileSync(path.join(dir,f),'utf8')))}));
const isAdminOnly=v=>!!(v&&v.user_condition&&v.user_condition.role==='admin');

test('the entities players used to write directly are now admin-write (server function only)',()=>{
  const plan={MatchResult:['create','update','delete'],GameLog:['create','update','delete'],MissionVictory:['create','update','delete'],
    PlayerAiProgress:['create','update','delete'],HeadToHead:['create','update','delete'],PlayerAvatar:['create','update','delete'],ChatMessage:['create','update','delete']};
  for(const [name,ops] of Object.entries(plan)){const e=ents.find(x=>x.name===name);assert(e,name);for(const op of ops)assert(isAdminOnly(e.d.rls&&e.d.rls[op]),name+'.'+op+' must be admin-only');}
});
test('reads stay public where the ranking and the chat subscription need them',()=>{
  for(const n of ['MatchResult','HeadToHead','PlayerAvatar','PlayerAiProgress','MissionVictory','ChatMessage']){const e=ents.find(x=>x.name===n);assert(!isAdminOnly(e.d.rls.read),n+' must stay readable');}
});
test('no entity allows anonymous writes except ConnectionError.create',()=>{
  const open=[];for(const {name,d} of ents){if(!d.rls)continue;for(const op of ['create','update','delete']){const v=d.rls[op];if(v===undefined||v===null||(typeof v==='object'&&Object.keys(v).length===0))open.push(name+'.'+op);}}
  assert.deepEqual(open,['ConnectionError.create']);
});
test('every function that writes these entities uses the service role (RLS does not apply to it)',()=>{
  const fdir=path.join(__dirname,'..','..','..','base44');let checked=0;
  (function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else if(p.endsWith('.ts')){const s=fs.readFileSync(p,'utf8');
    for(const m of s.matchAll(/base44\.(asServiceRole\.)?entities\.(MatchResult|GameLog|MissionVictory|PlayerAiProgress|HeadToHead|PlayerAvatar|ChatMessage)\.(create|update|delete|bulkCreate|updateMany|deleteMany)/g)){checked++;assert(m[1],p+': '+m[0]+' would be blocked by RLS');}}}})(fdir);
  assert(checked>0);
});
