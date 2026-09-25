const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const setup = require('./abilityAnimationHarness.cjs');
const source = fs.readFileSync(path.join(__dirname, '..', 'abilityTargetFlowPatch.js'), 'utf8');
const patch = vm.runInNewContext(source.replace('export const', 'const') + '\nABILITY_TARGET_FLOW_PATCH').replace(/<\/?script>/g, '');
const mpSource = fs.readFileSync(path.join(__dirname, '..', 'mpAbilityCinePatch.js'), 'utf8');
const mpPatch = vm.runInNewContext(mpSource.replace('export const', 'const') + '\nMP_ABILITY_CINE_PATCH').replace(/<\/?script>/g, '');

function scene(mode, count = 1, id = 'bagslord', direct = false, multiplayer = false) {
  const f = setup(mode), h = f.hero(id);
  if (id.startsWith('tk_')) h._token = id;
  f.assets({ [id]: { base: 'normal.png', elite: 'elite.png' } });
  f.c.G.team.p = [h];
  f.c.B = { current: { side: 'p', id: h.id }, round: 1, qi: 0, pending: null, over: false };
  let choices = 0, sent = 0;
  if (multiplayer) {
    f.c.NET.conn = { open: true, send: () => sent++, on() {} };
  } else f.c.__bfSendTargetAbilityCine = () => sent++;
  f.c.pendTarget = function(label, side, cb) { this.B.pending = { cb, side }; };
  f.c.useAbility = function(side, hero, done) {
    if (direct) this.__bfPlayAbilityAnim(side, hero);
    hero.abilityUsed = true;
    const next = () => this.pendTarget('Choose', 'o', () => {
      choices++;
      if (choices < count) next();
      else if (done) done();
    });
    next();
  };
  f.tick(150); // install the animation hook around the native ability
  if (multiplayer) vm.runInContext(mpPatch, f.c);
  vm.runInContext(patch, f.c);
  f.tick(200); // install the target hook around the animation hook
  const pick = () => { const pending = f.c.B.pending; assert(pending); f.c.B.pending = null; pending.cb({ id: 'enemy' + choices }); };
  return { f, h, pick, choices: () => choices, sent: () => sent };
}

for (const mode of ['ai', 'mission', 'host']) {
  test(`${mode}: targeted normal and elite wait for the chosen hero`, () => {
    const { f, h, pick, sent } = scene(mode);
    f.c.useAbility('p', h);
    f.tick(1200);
    assert.equal(f.overlays.length, 0);
    assert.equal(sent(), 0);
    pick();
    assert.equal(f.overlays.length, 1);
    assert.match(f.overlays[0], /normal\.png/);
    assert.equal(sent(), 1);
    f.tick(5500);
    h.eliteMode = true; h.abilityUsed = false; f.c.B.qi++;
    f.c.useAbility('p', h);
    assert.equal(f.overlays.length, 1);
    pick();
    f.tick(150);
    assert.equal(f.overlays.length, 2);
    assert.match(f.overlays[1], /elite\.png/);
  });
}

test('multiple targets trigger only after the final valid choice', () => {
  const { f, h, pick, sent } = scene('host', 2);
  f.c.useAbility('p', h);
  pick();
  f.tick(450);
  assert.equal(f.overlays.length, 0);
  assert.equal(sent(), 0);
  pick();
  assert.equal(f.overlays.length, 1);
  assert.equal(sent(), 1);
});

test('a targeted bizarro also waits for the chosen enemy', () => {
  const { f, h, pick } = scene('host', 1, 'tk_ban');
  f.c.useAbility('p', h);
  f.tick(900);
  assert.equal(f.overlays.length, 0);
  pick();
  assert.equal(f.overlays.length, 1);
});

test('guest snapshot cannot trigger a 3D animation while targeting is pending', () => {
  const f = setup('client'), h = f.hero();
  f.assets({ bagslord: { base: 'normal.png' } });
  f.c.G.team.p = [h];
  f.c.B = { pending: { requestId: 'target-1' }, current: { side: 'p', id: h.id } };
  h.abilityUsed = true;
  f.tick(450);
  assert.equal(f.overlays.length, 0);
  f.c.B.pending = null;
  f.tick(150);
  assert.equal(f.overlays.length, 1);
});

test('direct hooks, target confirmation and later scans play once in total', () => {
  const { f, h, pick, sent } = scene('host', 1, 'bagslord', true);
  f.c.useAbility('p', h);
  f.c.__bfPlayAbilityAnim('p', h); // another wrapper tries while the picker is open
  f.tick(1200);
  assert.equal(f.overlays.length, 0);
  pick();
  f.c.__bfPlayAbilityAnim('p', h); // repeated post-confirmation callback
  f.tick(11000); // periodic scanner and queued effects must not replay it
  assert.equal(f.overlays.length, 1);
  assert.equal(sent(), 1);
});

test('host sends a targeted cinematic only after the last target is confirmed', () => {
  const { f, h, pick, sent } = scene('host', 2, 'bagslord', false, true);
  f.c.useAbility('p', h);
  assert.equal(sent(), 0);
  pick();
  assert.equal(sent(), 0);
  pick();
  assert.equal(sent(), 1);
  f.tick(500);
  assert.equal(sent(), 1);
});

test('a cancelled choice does not play the animation', () => {
  const { f, h } = scene('ai');
  f.c.useAbility('p', h);
  f.c.B.pending = null;
  f.c.bfReleaseAbility();
  h.abilityUsed = false;
  f.tick(500);
  assert.equal(f.overlays.length, 0);
});