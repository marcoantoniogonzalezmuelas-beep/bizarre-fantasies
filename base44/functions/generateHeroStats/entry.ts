import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Genera estadísticas y habilidades para una carta de héroe usando InvokeLLM.
// El cliente (backoffice de cartas) construye el prompt y envía el modelo IA
// opcional. Devuelve el JSON con los stats. Solo administradores.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const prompt = body?.prompt;
    if (!prompt) return Response.json({ error: 'Falta el prompt' }, { status: 400 });
    const model = body?.model || undefined;

    const args = {
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          cost: { type: 'number' }, cc: { type: 'number' }, ad: { type: 'number' }, he: { type: 'number' }, hp: { type: 'number' }, mana: { type: 'number' }, power: { type: 'number' }, type: { type: 'string' }, ability_name: { type: 'string' }, ability_text: { type: 'string' }, elite_cc: { type: 'number' }, elite_ad: { type: 'number' }, elite_he: { type: 'number' }, elite_hp: { type: 'number' }, elite_ability_name: { type: 'string' }, elite_ability_text: { type: 'string' }, description: { type: 'string' }, title: { type: 'string' },
        },
      },
    };
    if (model) args.model = model;
    const response = await base44.asServiceRole.integrations.Core.InvokeLLM(args);
    return Response.json(response || {});
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}