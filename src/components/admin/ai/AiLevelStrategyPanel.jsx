import React from 'react';
import { AI_LEVELS } from '@/components/admin/ai/aiLevels';
import AiLevelAvatar from '@/components/admin/ai/AiLevelAvatar';

// Panel con la estrategia aprendida por cada nivel de IA.
export default function AiLevelStrategyPanel({ strategies }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {AI_LEVELS.map((lvl) => {
        const rec = strategies[lvl.id];
        const s = rec?.strategy || {};
        return (
          <div key={lvl.id} className="rounded-2xl border p-3" style={{ borderColor: lvl.color + '66', background: '#140d24e6' }}>
            <div className="flex items-center gap-2.5">
              <AiLevelAvatar src={lvl.avatar} alt={lvl.name} color={lvl.color} size={52} />
              <div>
                <div className="font-heading text-sm font-black" style={{ color: lvl.color }}>{lvl.name}</div>
                <div className="text-[11px] text-[#cfc6dd]">{rec ? `${rec.games_learned || 0} partida(s) aprendida(s)` : 'Sin aprendizaje aún'}</div>
              </div>
            </div>
            {rec && (
              <div className="mt-2 space-y-1 text-[11px] text-[#cfc6dd]">
                <div>Puja: <b className="text-[#ffe49a]">{Math.round((s.bidAggression || 0) * 100)}%</b> · Habilidades: <b className="text-[#ffe49a]">{Math.round((s.abilityUsage || 0) * 100)}%</b></div>
                <div>Objetivo: <b className="text-[#ffe49a]">{s.targetPriority || '—'}</b> · Compras: <b className="text-[#ffe49a]">{s.purchaseTiming || '—'}</b></div>
                {s.preferHeroes?.length > 0 && <div>Prioriza: {s.preferHeroes.slice(0, 5).join(', ')}</div>}
                {s.notes && <div className="mt-1 italic text-[#9a8ba8] line-clamp-4">{s.notes}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}