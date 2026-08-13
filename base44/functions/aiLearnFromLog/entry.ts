import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Gestión del aprendizaje de las IAs (solo admin): hace que un nivel de IA
// concreto (novata, bersérker, estratega, némesis) "lea" una partida guardada
// (GameLog) y actualice su estrategia aprendida (AiLevelStrategy). Así el
// admin puede graduar el nivel de cada IA partida a partida.

const LEVEL_META = {
  novice: {
    name: 'IA Novata',
    persona: 'Debe seguir siendo FÁCIL de vencer: aprende un poco pero sin volverse dura. bidAggression entre 0.2 y 0.45, abilityUsage entre 0.2 y 0.5.',
    min: { bid: 0.2, ab: 0.2 }, max: { bid: 0.45, ab: 0.5 },
  },
  berserker: {
    name: 'IA Bersérker',
    persona: 'Ultra agresiva y salvaje: prioriza daño y presión constante. bidAggression entre 0.7 y 1.0, abilityUsage entre 0.7 y 1.0.',
    min: { bid: 0.7, ab: 0.7 }, max: { bid: 1.0, ab: 1.0 },
  },
  strategist: {
    name: 'IA Estratega',
    persona: 'Equilibrada y táctica: elige bien objetivos y tiempos. bidAggression entre 0.55 y 0.85, abilityUsage entre 0.55 y 0.9.',
    min: { bid: 0.55, ab: 0.55 }, max: { bid: 0.85, ab: 0.9 },
  },
  nemesis: {
    name: 'IA Némesis',
    persona: 'Casi perfecta: roba los mejores héroes al jugador y no comete errores. bidAggression entre 0.85 y 1.0, abilityUsage entre 0.85 y 1.0.',
    min: { bid: 0.85, ab: 0.85 }, max: { bid: 1.0, ab: 1.0 },
  },
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Solo administradores' }, { status: 403 });

    const { log_id, level_id } = await req.json();
    const meta = LEVEL_META[level_id];
    if (!log_id || !meta) return Response.json({ error: 'Parámetros inválidos' }, { status: 400 });

    const log = await base44.asServiceRole.entities.GameLog.get(log_id);
    if (!log) return Response.json({ error: 'Partida no encontrada' }, { status: 404 });

    const existing = await base44.asServiceRole.entities.AiLevelStrategy.filter({ level_id });
    const current = existing && existing[0];
    const currentStrategy = (current && current.strategy) || {};

    // Resumen compacto de la partida para el LLM.
    const matchSummary = {
      mode: log.mode,
      ai_level: log.ai_level || '',
      player_nick: log.player_nick,
      opponent_nick: log.opponent_nick,
      player_won: log.player_won,
      turns_played: log.turns_played,
      duration_seconds: log.duration_seconds,
      player_heroes: log.player_heroes || [],
      opponent_heroes: log.opponent_heroes || [],
      items_bought: (log.items_bought || []).slice(0, 40),
      events: (log.events || []).slice(0, 120),
    };

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        'Eres el motor de aprendizaje de la IA del juego de cartas "Bizarre Fantasies". ' +
        'La IA juega como "opponente"; player_won=false significa que la IA ganó.\n\n' +
        `Estás entrenando al nivel "${meta.name}" (${level_id}). Personalidad del nivel (OBLIGATORIA): ${meta.persona}\n\n` +
        'Estrategia actual aprendida por este nivel:\n' + JSON.stringify(currentStrategy) + '\n\n' +
        'Partida a analizar (eventos turno a turno, héroes, compras, resultado):\n' + JSON.stringify(matchSummary) + '\n\n' +
        'Analiza qué hizo bien y mal la IA en esta partida y AJUSTA la estrategia del nivel ' +
        '(mezcla lo ya aprendido con las lecciones nuevas de esta partida, sin descartarlo todo). Devuelve JSON:\n' +
        '- bidAggression (número, respeta el rango de la personalidad)\n' +
        '- abilityUsage (número, respeta el rango de la personalidad)\n' +
        '- targetPriority: "weakest" | "strongest" | "healer" | "balanced"\n' +
        '- purchaseTiming: "early" | "late" | "balanced"\n' +
        '- preferHeroes: héroes que la IA debe priorizar robar en subasta (máx 12)\n' +
        '- avoidHeroes: héroes que la IA debe evitar (máx 12)\n' +
        '- notes: resumen breve en español de lo aprendido de ESTA partida y la estrategia resultante.',
      response_json_schema: {
        type: 'object',
        properties: {
          bidAggression: { type: 'number' },
          abilityUsage: { type: 'number' },
          targetPriority: { type: 'string' },
          purchaseTiming: { type: 'string' },
          preferHeroes: { type: 'array', items: { type: 'string' } },
          avoidHeroes: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' },
        },
      },
    });

    const s = llm || {};
    const clamp = (v, min, max, dflt) => {
      const n = Number(v);
      if (isNaN(n)) return dflt;
      return Math.max(min, Math.min(max, n));
    };
    const validTarget = ['weakest', 'strongest', 'healer', 'balanced'];
    const validTiming = ['early', 'late', 'balanced'];
    const strategy = {
      bidAggression: clamp(s.bidAggression, meta.min.bid, meta.max.bid, (meta.min.bid + meta.max.bid) / 2),
      abilityUsage: clamp(s.abilityUsage, meta.min.ab, meta.max.ab, (meta.min.ab + meta.max.ab) / 2),
      targetPriority: validTarget.includes(s.targetPriority) ? s.targetPriority : (currentStrategy.targetPriority || 'balanced'),
      purchaseTiming: validTiming.includes(s.purchaseTiming) ? s.purchaseTiming : (currentStrategy.purchaseTiming || 'balanced'),
      preferHeroes: Array.isArray(s.preferHeroes) ? s.preferHeroes.slice(0, 12) : (currentStrategy.preferHeroes || []),
      avoidHeroes: Array.isArray(s.avoidHeroes) ? s.avoidHeroes.slice(0, 12) : (currentStrategy.avoidHeroes || []),
      notes: typeof s.notes === 'string' ? s.notes : '',
    };

    const learnedIds = Array.from(new Set([...(current?.learned_log_ids || []), log_id]));
    const payload = { level_id, strategy, learned_log_ids: learnedIds, games_learned: learnedIds.length, notes: strategy.notes };
    if (current) await base44.asServiceRole.entities.AiLevelStrategy.update(current.id, payload);
    else await base44.asServiceRole.entities.AiLevelStrategy.create(payload);

    const analyzedBy = Array.from(new Set([...(log.analyzed_by || []), level_id]));
    await base44.asServiceRole.entities.GameLog.update(log_id, { analyzed_by: analyzedBy });

    return Response.json({ ok: true, strategy, games_learned: learnedIds.length });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}