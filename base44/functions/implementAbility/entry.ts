import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Traduce el texto de una habilidad de héroe a una mecánica del catálogo del
// motor del juego usando InvokeLLM. El cliente (backoffice) construye el
// prompt con el catálogo de efectos y envía el texto de la habilidad.
// Devuelve { effect_type, params, note }. Solo administradores.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const prompt = body?.prompt;
    if (!prompt) return Response.json({ error: 'Falta el prompt' }, { status: 400 });

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          effect_type: { type: 'string' },
          params: { type: 'object' },
          note: { type: 'string' },
        },
      },
    });
    return Response.json(response || {});
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}