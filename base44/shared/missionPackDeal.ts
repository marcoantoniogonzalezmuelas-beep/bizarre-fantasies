// One server-side draw reserves distinct heroes for BOTH seats for the room's lifetime.
export async function createMissionPackDeal(base44, mission) {
  const cards = []; let page;
  do {
    page = await base44.asServiceRole.entities.Card.filter({ category: 'hero' }, 'number', 100, cards.length);
    cards.push(...page);
  } while (page.length === 100);
  const epic = c => String(c.clan || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === 'epicas';
  const eligible = cards.filter(c => c.card_id && Number.isFinite(Number(c.cost)) && Number(c.cost) >= 0 &&
    (String(c.tag || '').toLowerCase().split(/[^a-z0-9]+/).includes(mission) || (mission === 'club' && epic(c))));
  const ids = [...new Set(eligible.map(c => c.card_id))];
  const packCount = mission === 'l5r' ? 1 : 3, perSeat = packCount * 4;
  if (ids.length < perSeat * 2) throw new Error(`Se necesitan ${perSeat * 2} héroes distintos para este reparto; hay ${ids.length}.`);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const packs = offset => Array.from({ length: packCount }, (_, i) => ids.slice(offset + i * 4, offset + (i + 1) * 4));
  return { host: packs(0), guest: packs(perSeat) };
}