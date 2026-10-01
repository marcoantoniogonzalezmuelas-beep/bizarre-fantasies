// Guardas de "cableado": comprueba que el código real usa las protecciones de servidor
// (un test de la pieza aislada no detecta que alguien la deje de llamar).
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const root=path.join(__dirname,'..','..','..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('room passwords go through the lockout guard everywhere they are compared',()=>{
  const relay=read('base44/functions/gameRelay/entry.ts'),lobby=read('base44/functions/gameLobby/entry.ts');
  assert.equal((relay.match(/checkRoomPassword\(state, body\.password, now\)/g)||[]).length,1,'join');
  assert.match(relay,/authorizeResume\(\{/,'resume goes through authorizeResume, which applies the same guard');
  assert.match(read('base44/shared/resumeActions.ts'),/checkRoomPassword\(state, body && body\.password, now\)/);
  assert.doesNotMatch(relay,/String\(body\.password \|\| ''\) [!=]== state\.password/,'no plain comparison left in gameRelay');
  assert.match(lobby,/!isJoinLocked\(existing\.state, Date\.now\(\)\)/,'lobby takeover honours the lock');
});
test('nickAuth delegates to the persistent-lockout core',()=>{
  const e=read('base44/functions/nickAuth/entry.ts');assert.match(e,/checkNick\(creds, body\.nick, body\.password\)/);assert.doesNotMatch(e,/new Map/,'no per-instance Map anymore');
  const schema=read('base44/entities/NickCredential.jsonc');assert.match(schema,/"fail_count"/);assert.match(schema,/"locked_until"/);
});
test('gameRecord function is wired to the validated handler with the service role',()=>{
  const e=read('base44/functions/gameRecord/entry.ts');assert.match(e,/handleRecord\(base44\.asServiceRole\.entities, body\)/);
});
test('every client write goes through recordGame first (direct writes are only the fallback)',()=>{
  const home=read('src/pages/Home.jsx'),chat=read('src/components/chat/ChatOverlay.jsx'),mis=read('src/components/missions/missionPersistence.js');
  for(const kind of ['match','score_win','game_log','avatar'])assert.match(home,new RegExp("recordGame\\('"+kind+"'"),kind);
  assert.match(chat,/recordGame\('chat'/);assert.match(mis,/recordGame\('mission_victory'/);
  // Cada escritura directa debe ser RESERVA: dentro de la función marcada como antigua, o en un
  // catch que sigue a una llamada a recordGame (nunca el primer camino).
  const direct=/base44\.entities\.(MatchResult|GameLog|PlayerAvatar|HeadToHead|PlayerAiProgress)\.(create|update)\(/g;let m,n=0;
  while((m=direct.exec(home))){n++;const before=home.slice(Math.max(0,m.index-2500),m.index);
    const inLegacyFn=before.lastIndexOf('Escritura directa ANTIGUA')>=0&&before.lastIndexOf('Escritura directa ANTIGUA')>before.lastIndexOf('recordGame(');
    const afterRecord=before.lastIndexOf('recordGame(')>=0&&before.slice(before.lastIndexOf('recordGame(')).includes('catch');
    assert(inLegacyFn||afterRecord,'direct write that is not a fallback: '+home.slice(m.index,m.index+70));}
  assert(n>=6,'fallback writes still present (transition): '+n);
  assert.match(home,/e\.source !== iframeRef\.current\?\.contentWindow\) return;/,'privileged messages only from the game iframe');
  assert.match(chat,/session_token: status\.sessionToken/);assert.match(read('src/lib/bizarreRoomPatch.js'),/sessionToken:active&&session\?session\.token:''/);
});
