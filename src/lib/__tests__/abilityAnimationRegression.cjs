const test=require('node:test'),assert=require('node:assert/strict'),setup=require('./abilityAnimationHarness.cjs');
for(const mode of ['mission','ai','demo','local','host','client']){
 test(`${mode}: normal and elite both play, even with shared artwork`,()=>{
  const f=setup(mode),h=f.hero();f.assets({bagslord:{base:'same.png',elite:'same.png'}});f.c.G.team.p=[h];f.tick(150);
  f.c.useAbility('p',h);h.eliteMode=true;f.c.useAbility('p',h);f.tick(11000);
  assert.equal(f.overlays.length,2);assert.match(f.overlays[0],/NORMAL BAGSLORD/);assert.match(f.overlays[1],/ELITE BAGSLORD/);
 });
 test(`${mode}: the scanner keeps running after hooks install`,()=>{
  const f=setup(mode),h=f.hero();f.c.G.team.p=[h];f.assets({bagslord:{base:'normal.png',elite:'elite.png'}});f.tick(600);h.abilityUsed=true;f.tick(150);
  assert.equal(f.overlays.length,1);f.tick(5500);h.eliteMode=true;f.tick(150);assert.equal(f.overlays.length,2);
 });
 test(`${mode}: queued animations survive long effects and retain FIFO order`,()=>{
  const f=setup(mode);f.assets({a:{base:'a.png'},b:{base:'b.png'},c:{base:'c.png'}});f.block(true);
  for(const id of ['a','b','c']){const h=f.hero(id);f.c.__bfPlayAbilityAnim('p',h);f.c.__bfPlayAbilityAnim('p',h);}
  f.tick(12000);assert.equal(f.overlays.length,0);assert(f.c.__bfCinematicBusy());f.block(false);f.tick(16000);
  assert.equal(f.overlays.length,3);['A','B','C'].forEach((id,i)=>assert.match(f.overlays[i],new RegExp('NORMAL '+id)));assert(!f.c.__bfCinematicBusy());
 });
}
test('a repeated asset message does not discard a pending use',()=>{
 const f=setup(),h=f.hero();f.c.G.team.p=[h];f.tick(150);h.abilityUsed=true;f.tick(150);f.assets({bagslord:{base:'base.png'}});f.tick(150);assert.equal(f.overlays.length,1);
 f.assets({bagslord:{base:'base.png'}});f.tick(10000);assert.equal(f.overlays.length,1);
});
test('a new mission resets playback and clears the previous queue',()=>{
 const f=setup(),h=f.hero();f.assets({bagslord:{base:'base.png'}});f.block(true);f.c.__bfPlayAbilityAnim('p',h);f.screen('s-equip');f.tick(150);f.block(false);f.tick(6000);assert.equal(f.overlays.length,0);
 f.screen('s-battle');f.c.__bfPlayAbilityAnim('p',h);assert.equal(f.overlays.length,1);
});
test('opponents sharing the same artwork each get their animation',()=>{
 const f=setup(),h=f.hero();f.assets({bagslord:{base:'same.png'}});f.c.__bfPlayAbilityAnim('p',h);f.c.__bfPlayAbilityAnim('o',h);f.tick(11000);assert.equal(f.overlays.length,2);
});
test('disabled cinematics do not block or consume an unused form',()=>{
 const f=setup(),h=f.hero();f.assets({bagslord:{base:'base.png'}});f.c.__bfNoCinematics=true;f.c.__bfPlayAbilityAnim('p',h);assert(!f.c.__bfCinematicBusy());assert.equal(f.overlays.length,0);
 f.c.__bfNoCinematics=false;f.c.__bfPlayAbilityAnim('p',h);assert.equal(f.overlays.length,1);
});
test('sabotage or a fumble consumes no animation and does not suppress elite',()=>{
 const f=setup(),h=f.hero();f.assets({bagslord:{base:'base.png',elite:'elite.png'}});h.abilityUsed=true;h._bfAbilityCineSuppressed='normal';f.c.G.team.p=[h];f.tick(600);assert.equal(f.overlays.length,0);
 h.eliteMode=true;f.tick(150);assert.equal(f.overlays.length,1);
});test('Anim OFF queues nothing: abilities used while OFF are NOT played when switching back ON; new ones are',()=>{
 const f=setup(),h=f.hero(),h2=f.hero('otro');f.assets({bagslord:{base:'base.png'},otro:{base:'otro.png'}});f.c.G.team.p=[h,h2];f.tick(300);
 f.c.__bfNoCinematics=true;h.abilityUsed=true;f.tick(600);assert.equal(f.overlays.length,0,'nothing plays while OFF');
 f.c.__bfNoCinematics=false;f.tick(6000);assert.equal(f.overlays.length,0,'switching ON does not replay the ability used while OFF');
 h2.abilityUsed=true;f.tick(600);assert.equal(f.overlays.length,1,'an ability used after switching ON is played');assert.match(f.overlays[0],/NORMAL OTRO/);
});
test('a hero that dies and is reborn (elite) DURING its own ability gets no ability animation after the rebirth (KillerLin pricked by thorns, Motomami reflected by Juniana)',()=>{
 const f=setup(),h=f.hero('painkil');f.assets({painkil:{base:'normal.png',elite:'elite.png'}});f.c.G.team.p=[h];f.tick(300);
 let used=false;Object.defineProperty(h,'abilityUsed',{configurable:true,get(){return used;},set(v){used=v;if(v)h.eliteMode=true;}});   // renace en élite en mitad de su habilidad
 f.c.useAbility('p',h);f.tick(8000);
 assert.equal(f.overlays.length,0,'no animation after the rebirth');
 const g=setup(),k=g.hero('kru');g.assets({kru:{base:'k.png'}});g.c.G.team.p=[k];g.tick(300);
 g.c.useAbility('p',k);g.tick(8000);assert.equal(g.overlays.length,1,'a normal use still plays its animation');
});
test('an ability that is BLOCKED or does nothing shows no animation (the animation came out without the ability, e.g. after a rebirth)',()=>{
 const f=setup(),h=f.hero('painkil',true);f.assets({painkil:{base:'normal.png',elite:'elite.png'}});f.c.G.team.p=[h];f.tick(300);
 Object.defineProperty(h,'abilityUsed',{configurable:true,get(){return false;},set(){}});   // la protección la bloquea: nunca queda marcada como usada
 f.c.useAbility('p',h);f.tick(8000);
 assert.equal(f.overlays.length,0,'no animation when the ability did not execute');
});
