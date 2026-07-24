import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Traduce automáticamente al inglés los textos de una carta (campo `en`).
// Lo invoca el flujo "Auto-translate Cards" cada vez que se crea una carta o
// se editan sus textos en español.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    if (!(await base44.auth.isAuthenticated())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { card_id } = await req.json();
    if (!card_id) return Response.json({ error: 'card_id required' }, { status: 400 });

    const card = await base44.asServiceRole.entities.Card.get(card_id);
    if (!card) return Response.json({ error: 'Card not found' }, { status: 404 });

    const FIELDS = ['title', 'ability_name', 'ability_text', 'elite_ability_name', 'elite_ability_text', 'description', 'tag'];
    const source = {};
    for (const f of FIELDS) if (card[f]) source[f] = card[f];
    if (Object.keys(source).length === 0) {
      return Response.json({ status: 'skipped', reason: 'no translatable text' });
    }

    const props = {};
    for (const f of Object.keys(source)) props[f] = { type: 'string' };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the official localizer of "Bizarre Fantasies", a humorous dark-fantasy card game. Translate the following Spanish card texts to English. Keep the tone: epic, punchy and slightly absurd. Keep game terms consistent: CC = Melee, AD = Ranged, HE = Sorcery, maná = mana, Élite = Elite, héroe = hero, escudo = shield, daño = damage, renacer = rebirth. Do NOT translate proper names of characters. Keep numbers, symbols and formatting intact. Return ONLY the translations.

Card name (do not translate, context only): ${card.name}

Texts to translate (JSON):
${JSON.stringify(source, null, 2)}`,
      response_json_schema: { type: 'object', properties: props, required: Object.keys(source) },
    });

    const en = { ...(card.en || {}) };
    for (const f of Object.keys(source)) if (result[f]) en[f] = result[f];

    await base44.asServiceRole.entities.Card.update(card_id, { en });
    return Response.json({ status: 'translated', fields: Object.keys(source) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});