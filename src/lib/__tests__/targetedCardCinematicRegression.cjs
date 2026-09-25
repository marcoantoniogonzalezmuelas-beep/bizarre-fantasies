const test = require('node:test');
const assert = require('node:assert/strict');
const setup = require('./abilityAnimationHarness.cjs');

function fixture(mode, kind, isSpell) {
  const f = setup(mode);
  const item = { id: 'test-card', name: 'Test card', kind };
  f.c.B = { current: { side: 'p', id: 'hero' } };
  f.c.G.items = { p: [item], o: [] };
  f.c.SPELLS = [item];
  f.c.byId = (list, id) => list.find(card => card.id === id);
  let chosen;
  f.c.pendTarget = (_prompt, _side, callback) => { chosen = callback; };
  f.c.flushFx = () => {};
  f.c.castSpell = () => { if (isSpell && kind !== 'global') f.c.pendTarget('Choose', 'o', () => {}); };
  f.c.useItem = () => { if (!isSpell && kind !== 'global') f.c.pendTarget('Choose', 'o', () => {}); };
  f.assets({ 'test-card': { name: item.name, base: 'card.png' } });
  f.tick(150);
  return { f, item, choose: target => chosen(target), hasChoice: () => !!chosen };
}

test('targeted spell waits for confirmation and plays once', () => {
  const { f, hasChoice, choose } = fixture('host', 'dmg1', true);
  f.c.castSpell('test-card');
  assert.equal(hasChoice(), true);
  assert.equal(f.overlays.length, 0);
  choose({ id: 'enemy' });
  assert.equal(f.overlays.length, 1);
  f.tick(6000);
  assert.equal(f.overlays.length, 1);
});

test('cancelled item choice does not play', () => {
  const { f } = fixture('host', 'heal', false);
  f.c.useItem(0);
  assert.equal(f.overlays.length, 0);
});

test('guest targeted card waits for host confirmation', () => {
  const { f } = fixture('client', 'dmg1', true);
  f.c.castSpell('test-card');
  assert.equal(f.overlays.length, 0);
  f.c.flushFx([{ k: 'bfItemCine', name: 'Test card' }]);
  assert.equal(f.overlays.length, 1);
});

test('untargeted guest card retains immediate playback', () => {
  const { f } = fixture('client', 'global', true);
  f.c.castSpell('test-card');
  assert.equal(f.overlays.length, 1);
});