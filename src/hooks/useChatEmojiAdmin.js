import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const categoryName = (card) => card.clan || ({ hero: 'Héroes', bizarro: 'Bizarros', spell: 'Hechizos', object: 'Objetos', armor: 'Armaduras', melee_weapon: 'Armas CC', ranged_weapon: 'Armas AD', bonus: 'Bonus' }[card.category] || 'Cartas');

export default function useChatEmojiAdmin(enabled) {
  const [emojis, setEmojis] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const load = useCallback(async () => setEmojis((await base44.entities.ChatEmoji.list('sort_order', 500)) || []), []);
  useEffect(() => { if (enabled) load(); }, [enabled, load]);
  const save = async (id, data) => { await base44.entities.ChatEmoji.update(id, data); await load(); };
  const sync = async () => {
    setSyncing(true);
    const [cards, current] = await Promise.all([base44.entities.Card.list('number', 500), base44.entities.ChatEmoji.list('sort_order', 500)]);
    const desired = (cards || []).filter((c) => c.art_url && c.card_id).map((c, i) => ({ source_card_id: c.card_id, name: c.name, url: c.art_url, category: categoryName(c), active: true, sort_order: Number(c.number || i) }));
    const byCard = new Map((current || []).map((e) => [e.source_card_id, e]));
    const creates = desired.filter((e) => !byCard.has(e.source_card_id));
    const updates = desired.filter((e) => byCard.has(e.source_card_id)).map((e) => ({ id: byCard.get(e.source_card_id).id, ...e, active: byCard.get(e.source_card_id).active !== false }));
    if (creates.length) await base44.entities.ChatEmoji.bulkCreate(creates);
    if (updates.length) await base44.entities.ChatEmoji.bulkUpdate(updates);
    const valid = new Set(desired.map((e) => e.source_card_id));
    for (const old of (current || []).filter((e) => !valid.has(e.source_card_id))) await base44.entities.ChatEmoji.delete(old.id);
    await load();
    setSyncing(false);
  };
  return { emojis, syncing, sync, save };
}