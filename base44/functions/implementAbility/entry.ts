import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { VALID_ACTIONS, VALID_TARGETS, EFFECT_TYPES, checkSteps } from '../../shared/abilityCatalog.ts';

// Traduce el texto de una habilidad de héroe a una mecánica del catálogo del motor usando InvokeLLM. El cliente
// (backoffice) construye el prompt con el catálogo de efectos y envía el texto de la habilidad.
// Devuelve { effect_type, params, note }. Solo administradores.
// Las acciones, objetivos y la validación salen de base44/shared/abilityCatalog.ts, la MISMA fuente que usa el
// editor: antes esta función tenía su propia lista, se quedó vieja y la IA no podía usar las primitivas nuevas.

const STEP_SCHEMA = {
  type: 'object',
  properties: {
    action: { type: 'string', enum: VALID_ACTIONS },
    target: { type: 'string', enum: VALID_TARGETS },
    amount: { type: 'number' }, stat_mult: { type: 'number' }, stat: { type: 'string' }, scale_stat: { type: 'string' },
    bonus: { type: 'number' }, magic_base: { type: 'number' }, turns: { type: 'number' }, dtype: { type: 'string' },
    element: { type: 'string' }, pierce: { type: 'number' }, ignore_shield: { type: 'boolean' }, ignore_armor: { type: 'boolean' },
    hits: { type: 'array', items: { type: 'number' } }, double_below: { type: 'number' }, hp_pct: { type: 'number' },
    lifesteal: { type: 'number' }, heal_to: { type: 'string' }, split_allies: { type: 'number' },
    threshold: { type: 'number' }, else_mult: { type: 'number' }, mods: { type: 'object' },
    sides: { type: 'number' }, outcomes: { type: 'object' }, label: { type: 'string' }, note: { type: 'string' }, text: { type: 'string' },
  },
  required: ['action', 'target'],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const prompt = String(body?.prompt || '').trim();
    if (!prompt) return Response.json({ error: 'Falta el prompt' }, { status: 400 });
    if (prompt.length > 16000) return Response.json({ error: 'Prompt demasiado largo' }, { status: 400 });

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          effect_type: { type: 'string' },
          params: {
            type: 'object',
            properties: {
              amount: { type: 'number' }, bonus: { type: 'number' }, clan: { type: 'string' },
              all: { type: 'boolean' }, targets: { type: 'number' }, min: { type: 'number' }, max: { type: 'number' }, stat: { type: 'string' }, turns: { type: 'number' },
              steps: { type: 'array', items: STEP_SCHEMA },
            },
          },
          note: { type: 'string' },
        },
        required: ['effect_type', 'params', 'note'],
      },
    });
    const effectType = String(response?.effect_type || 'unsupported');
    const note = String(response?.note || '');
    if (effectType === 'unsupported') return Response.json({ effect_type: 'unsupported', params: {}, note: note || 'No automatizable con el catálogo actual.' });
    if (!EFFECT_TYPES.includes(effectType)) return Response.json({ effect_type: 'unsupported', params: {}, note: 'No automatizable: la IA propuso una mecánica desconocida (' + effectType + ').' });
    if (effectType === 'custom_steps') {
      const why = checkSteps(response?.params?.steps);
      if (why) return Response.json({ effect_type: 'unsupported', params: {}, note: 'No automatizable: ' + why + '.' + (note ? ' ' + note : '') });
    }
    return Response.json({ effect_type: effectType, params: response?.params || {}, note });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
