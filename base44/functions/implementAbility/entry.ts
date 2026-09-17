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
    const prompt = String(body?.prompt || '').trim();
    if (!prompt) return Response.json({ error: 'Falta el prompt' }, { status: 400 });
    if (prompt.length > 12000) return Response.json({ error: 'Prompt demasiado largo' }, { status: 400 });

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
              steps: { type: 'array', items: { type: 'object', properties: {
                action: { type: 'string', enum: ['damage','true_damage','drain','heal','heal_full','shield','cleanse','buff','debuff','debuff_all_stats','paralyze','skip_turn','sleep','silence','confuse','drunk','mark','evade','mana','lifesteal','recover_card','steal_card','disarm','fx'] },
                target: { type: 'string', enum: ['self','ally','all_allies','enemy','all_enemies','random_enemy','weakest_enemy','strongest_enemy'] },
                amount: { type: 'number' }, stat_mult: { type: 'number' }, stat: { type: 'string' }, turns: { type: 'number' }, pierce: { type: 'boolean' }, element: { type: 'string' }
              }, required: ['action','target'] } }
            }
          },
          note: { type: 'string' },
        },
        required: ['effect_type', 'params', 'note'],
      },
    });
    const allowedEffects = ['attack_bonus_per_ally','heal_allies_per_turn','heal_allies_now','damage_enemy','buff_self','shield_self','custom_steps','unsupported'];
    const allowedActions = ['damage','true_damage','drain','heal','heal_full','shield','cleanse','buff','debuff','debuff_all_stats','paralyze','skip_turn','sleep','silence','confuse','drunk','mark','evade','mana','lifesteal','recover_card','steal_card','disarm','fx'];
    const allowedTargets = ['self','ally','all_allies','enemy','all_enemies','random_enemy','weakest_enemy','strongest_enemy'];
    const effectType = String(response?.effect_type || 'unsupported');
    if (!allowedEffects.includes(effectType)) return Response.json({ effect_type:'unsupported', params:{}, note:'No automatizable: la IA propuso una mecánica desconocida.' });
    if (effectType === 'custom_steps') {
      const steps = response?.params?.steps;
      const valid = Array.isArray(steps) && steps.length > 0 && steps.every(step => step && allowedActions.includes(step.action) && allowedTargets.includes(step.target || 'enemy'));
      if (!valid) return Response.json({ effect_type:'unsupported', params:{}, note:'No automatizable: la IA no pudo expresarla con pasos válidos del motor.' });
    }
    return Response.json({ effect_type:effectType, params:response?.params || {}, note:String(response?.note || '') });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}