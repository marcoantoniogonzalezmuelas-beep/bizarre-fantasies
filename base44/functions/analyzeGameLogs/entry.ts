import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Analiza los logs de partidas guardados (GameLog) para detectar patrones y
// generar recomendaciones de mejora de dificultad de la IA. Solo admin.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const logs = await base44.asServiceRole.entities.GameLog.list('-created_date', 100);

    if (!logs || logs.length === 0) {
      return Response.json({
        stats: { total: 0 },
        analysis: { patrones: 'No hay partidas registradas aún.', recomendaciones: [], sugerencias_dificultad: [] },
      });
    }

    // Estadísticas agregadas
    let aiGames = 0, aiWins = 0;
    let totalDuration = 0, totalTurns = 0;
    const byMode: Record<string, number> = {};
    const clanPerf: Record<string, { wins: number; losses: number }> = {};
    const heroPickCount: Record<string, number> = {};

    for (const log of logs) {
      const mode = log.mode || 'ia';
      byMode[mode] = (byMode[mode] || 0) + 1;
      totalDuration += log.duration_seconds || 0;
      totalTurns += log.turns_played || 0;

      if (mode === 'ia') {
        aiGames++;
        if (!log.player_won) aiWins++;
      }

      const clan = log.player_clan || '';
      if (clan) {
        if (!clanPerf[clan]) clanPerf[clan] = { wins: 0, losses: 0 };
        if (log.player_won) clanPerf[clan].wins++;
        else clanPerf[clan].losses++;
      }

      for (const h of log.player_heroes || []) {
        if (h && h.name) heroPickCount[h.name] = (heroPickCount[h.name] || 0) + 1;
      }
    }

    const stats = {
      total: logs.length,
      byMode,
      aiWinRate: aiGames > 0 ? Math.round((aiWins / aiGames) * 100) : 0,
      avgDuration: logs.length > 0 ? Math.round(totalDuration / logs.length) : 0,
      avgTurns: logs.length > 0 ? Math.round(totalTurns / logs.length) : 0,
      clanPerf,
      topHeroes: Object.entries(heroPickCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count })),
    };

    // Resumen para el LLM
    const recentLogs = logs.slice(0, 30).map((l) => ({
      mode: l.mode,
      playerWon: l.player_won,
      clan: l.player_clan,
      oppClan: l.opponent_clan,
      heroes: (l.player_heroes || []).map((h: any) => h.name),
      oppHeroes: (l.opponent_heroes || []).map((h: any) => h.name),
      turns: l.turns_played,
      duration: l.duration_seconds,
      items: (l.items_bought || []).map((i: any) => i.name),
    }));

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        'Eres un analista táctico del juego de cartas "Bizarre Fantasies" (fantasía oscura, ' +
        'héroes de clanes: Guerreros, Druidas, No-muertos, Vaqueros). Analiza los logs para ' +
        'mejorar la dificultad de la IA. La IA juega como "opponente" (opponent). ' +
        'playerWon=false significa que la IA ganó.\n\n' +
        'Estadísticas: ' + JSON.stringify(stats) + '\n' +
        'Partidas recientes: ' + JSON.stringify(recentLogs) + '\n\n' +
        'Proporciona un análisis en español con:\n' +
        '1. Patrones: qué clanes/estrategias son más débiles contra la IA, qué hace predecible a la IA\n' +
        '2. Recomendaciones específicas (3-5) para hacer la IA más difícil y menos predecible\n' +
        '3. Sugerencias de ajuste de dificultad (agresividad de compra, uso de habilidades, selección de objetivos)\n' +
        'Responde en JSON.',
      response_json_schema: {
        type: 'object',
        properties: {
          patrones: { type: 'string' },
          recomendaciones: { type: 'array', items: { type: 'string' } },
          sugerencias_dificultad: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return Response.json({ stats, analysis: llmResponse });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}