const test=require('node:test'),assert=require('node:assert/strict'),setup=require('./abilityAnimationHarness.cjs');

for(const id of ['tk_caj','tk_buf','tk_lav','tk_ban','tk_pez','tk_patito_goma','tk_unicornio','tk_pegaso','tk_grulla']){
 for(const mode of ['host','client']){
  test(`${mode} ${id}: normal and elite use their own art after the ability resolves`,()=>{
    const f=setup(mode),h=f.hero(id);h._token=id;h.akind=id==='tk_patito_goma'?'big-ad':'kamikaze-token';
    f.assets({[id]:{base:'normal.png',elite:'elite.png'}});
    f.c.G.team.p=[h];
    // The ability opens a target picker first; no animation before selection.
    f.c.useAbility=()=>{};
    f.tick(150);
    f.c.useAbility('p',h);
    assert.equal(f.overlays.length,0);
    h.abilityUsed=true;
    f.tick(150);
    assert.equal(f.overlays.length,1);
    assert.match(f.overlays[0],/normal\.png/);
    h.eliteMode=true;
    f.tick(5500);
    assert.equal(f.overlays.length,2);
    assert.match(f.overlays[1],/elite\.png/);
  });
 }
}

test('a transformed bizarre hero resolves art using its new identity',()=>{
  const f=setup('host'),h=f.hero('tk_caj_m1');h.cid='tk_caj';h._token='tk_caj';
  f.assets({tk_caj:{base:'caja-normal.png',elite:'caja-elite.png'}});
  f.c.G.team.p=[h];f.tick(150);h.abilityUsed=true;f.tick(150);
  assert.match(f.overlays[0],/caja-normal\.png/);
  h.eliteMode=true;f.tick(5500);
  assert.match(f.overlays[1],/caja-elite\.png/);
});