import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Analiza los logs de partidas guardados (GameLog) y genera una estrategia
// concreta para que la IA juegue mejor. Aprendizaje continuo: cuantas más
// partidas se registran, más precisa es la estrategia.
//
// No requiere admin: cualquier usuario autenticado puede llamarlo (se usa al
// cargar el juego para inyectar la estrategia en el iframe).
//
// Devuelve: { strategy: { bidAggression, abilityUsage, targetPriority,
// purchaseTiming, preferHeroes, avoidHeroes, notes }, stats }
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const logs = await base44.asServiceRole.entities.GameLog.list('-created_date', 200);

    if (!logs || logs.length === 0) {
      // Sin logs: usamos heurísticas basadas en el meta del juego.
      // Héroes fuertes que la IA debería priorizar robar en la subasta
      // (héroes con buenas stats/habilidades que suelen ganar partidas).
      return Response.json({
        strategy: {
          bidAggression: 0.65,
          abilityUsage: 0.75,
          targetPriority: 'balanced',
          purchaseTiming: 'balanced',
          preferHeroes: [
            'Batu', 'Serafis', 'Morthex', 'Vorn', 'Gorvak',
            'Narbon', 'Hildra', 'Alfredinho', 'Sylvara', 'Aelion'
          ],
          avoidHeroes: [],
          notes: 'Sin partidas registradas aún. Estrategia heurística: la IA prioriza robar héroes fuertes del meta (Batu, Serafis, Morthex…) y usa habilidades con frecuencia. Se ajustará automáticamente cuando haya partidas registradas.',
        },
        stats: { total: 0, aiGames: 0, aiWinRate: 0 },
      });
    }

    // Estadísticas de partidas vs IA (la IA es el "opponente").
    let aiGames = 0, aiWins = 0;
    let totalTurns = 0, totalDuration = 0;
    const heroWins: Record<string, number> = {};
    const heroLosses: Record<string, number> = {};
    const heroWhenAiWins: Record<string, number> = {}; // héroes del jugador cuando la IA gana
    const itemWhenAiWins: Record<string, number> = {};
    const itemWhenAiLoses: Record<string, number> = {};
    const clanPerf: Record<string, { wins: number; losses: number }> = {};

    for (const log of logs) {
      if (log.mode === 'ia') {
        aiGames++;
        if (!log.player_won) aiWins++; // player_won=false → la IA ganó
        totalTurns += log.turns_played || 0;
        totalDuration += log.duration_seconds || 0;

        // Héroes que el jugador usa cuando la IA gana (debilidad de la IA ante ellos al revés:
        // si la IA gana mucho contra ciertos héroes, la IA es fuerte contra ellos).
        for (const h of (log.player_heroes || [])) {
          if (!h || !h.name) continue;
          if (log.player_won) {
            heroWins[h.name] = (heroWins[h.name] || 0) + 1;
          } else {
            heroLosses[h.name] = (heroLosses[h.name] || 0) + 1;
            heroWhenAiWins[h.name] = (heroWhenAiWins[h.name] || 0) + 1;
          }
        }

        // Objetos comprados según si la IA ganó o perdió.
        for (const item of (log.items_bought || [])) {
          if (!item || !item.name) continue;
          if (log.player_won) {
            itemWhenAiLoses[item.name] = (itemWhenAiLoses[item.name] || 0) + 1;
          } else {
            itemWhenAiWins[item.name] = (itemWhenAiWins[item.name] || 0) + 1;
          }
        }

        const clan = log.player_clan || '';
        if (clan) {
          if (!clanPerf[clan]) clanPerf[clan] = { wins: 0, losses: 0 };
          if (log.player_won) clanPerf[clan].wins++;
          else clanPerf[clan].losses++;
        }
      }
    }

    const aiWinRate = aiGames > 0 ? Math.round((aiWins / aiGames) * 100) : 0;

    // Héroes contra los que la IA pierde más (el jugador gana con ellos → la IA
    // debería priorizarlos en la subasta para quitárselos).
    const heroesThatBeatAi = Object.entries(heroWins)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, w]) => ({ name, wins: w, losses: heroLosses[name] || 0 }));

    const topItemsWin = Object.entries(itemWhenAiWins)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const stats = {
      total: logs.length,
      aiGames,
      aiWinRate,
      avgTurns: aiGames > 0 ? Math.round(totalTurns / aiGames) : 0,
      avgDuration: aiGames > 0 ? Math.round(totalDuration / aiGames) : 0,
      heroesThatBeatAi,
      topItemsWin,
      clanPerf,
    };

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        'Eres el motor de estrategia de la IA del juego de cartas "Bizarre Fantasies" (fantasía oscura, ' +
        'héroes de clanes: Guerreros, Místicos, No-muertos, Vaqueros). La IA juega como "opponente".\n' +
        'player_won=false significa que la IA ganó esa partida.\n\n' +
        'Estadísticas agregadas: ' + JSON.stringify(stats) + '\n' +
        'HeroesThatBeatAi = héroes con los que los jugadores ganan más a la IA (la IA debería robarlos en la subasta).\n' +
        'topItemsWin = objetos que compran los jugadores que ganan a la IA.\n\n' +
        'Genera una estrategia CONCRETA para que la IA juegue mejor, en JSON:\n' +
        '- bidAggression (0.0-1.0): cuánto pujar (1.0 = pujar al máximo, 0.3 = pujar bajo). Si la IA gana poco, subir.\n' +
        '- abilityUsage (0.0-1.0): frecuencia de uso de habilidades (1.0 = siempre que pueda, 0.3 = conservador).\n' +
        '- targetPriority: "weakest" | "strongest" | "healer" | "balanced" (a quién atacar primero).\n' +
        '- purchaseTiming: "early" | "late" | "balanced" (cuándo comprar objetos).\n' +
        '- preferHeroes: lista de nombres de héroes que la IA debería priorizar robar en la subasta (de heroesThatBeatAi).\n' +
        '- avoidHeroes: héroes que la IA no debe elegir (los que le van mal).\n' +
        '- notes: explicación breve en español de la estrategia.\n' +
        'Responde en JSON.',
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

    // Sanitizar y aplicar defaults razonables.
    const s = llmResponse || {};
    const clamp = (v: any, dflt: number) => {
      const n = Number(v);
      if (isNaN(n)) return dflt;
      return Math.max(0, Math.min(1, n));
    };
    const validTarget = ['weakest', 'strongest', 'healer', 'balanced'];
    const validTiming = ['early', 'late', 'balanced'];

    const strategy = {
      bidAggression: clamp(s.bidAggression, 0.55),
      abilityUsage: clamp(s.abilityUsage, 0.6),
      targetPriority: validTarget.includes(s.targetPriority) ? s.targetPriority : 'balanced',
      purchaseTiming: validTiming.includes(s.purchaseTiming) ? s.purchaseTiming : 'balanced',
      preferHeroes: Array.isArray(s.preferHeroes) ? s.preferHeroes.slice(0, 12) : [],
      avoidHeroes: Array.isArray(s.avoidHeroes) ? s.avoidHeroes.slice(0, 12) : [],
      notes: typeof s.notes === 'string' ? s.notes : '',
    };

    return Response.json({ strategy, stats });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}