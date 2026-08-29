import React, { useState } from 'react';
import { AI_LEVELS } from '@/components/admin/ai/aiLevels';

// Fila de una partida (GameLog) en el panel de aprendizaje: resumen, insignias
// de qué IAs ya la han analizado y botones para forzar que un nivel la aprenda.
export default function GameLogRow({ log, learningKey, onLearn, onLearnAll }) {
  const [open, setOpen] = useState(false);
  const analyzed = log.analyzed_by || [];
  const busyAny = String(learningKey || '').startsWith(`${log.id}:`);
  const date = log.created_date ? new Date(log.created_date).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
  const modeLabel = log.mode === 'ia' ? `vs IA${log.ai_level ? ` (${(AI_LEVELS.find(l => l.id === log.ai_level) || {}).name || log.ai_level})` : ''}` : log.mode === 'online' ? 'Online' : 'Local';

  return (
    <div className="rounded-2xl border border-[#ffd24a26] bg-black/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setOpen(!open)} className="text-left flex-1 min-w-[200px]">
          <div className="text-sm font-bold text-[#fff5dc]">
            {log.player_nick} <span className="text-[#9a8ba8]">vs</span> {log.opponent_nick || 'Rival'}
            <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-black ${log.player_won ? 'bg-[#2a4a2a] text-[#9dff9d]' : 'bg-[#4a2a2a] text-[#ff9d9d]'}`}>
              {log.player_won ? 'GANÓ JUGADOR' : 'GANÓ RIVAL/IA'}
            </span>
          </div>
          <div className="text-[11px] text-[#9a8ba8]">
            {date} · {modeLabel} · {log.turns_played || 0} turnos · {Math.round((log.duration_seconds || 0) / 60)} min · {(log.events || []).length} eventos {open ? '▲' : '▼'}
          </div>
        </button>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            disabled={busyAny}
            onClick={() => onLearnAll(log.id)}
            title="Que las 5 IAs analicen esta partida (5 créditos de integración)"
            className="flex items-center gap-1 rounded-lg border border-[#ffd24a] bg-[#ffd24a] px-2.5 py-1 text-[10px] font-black text-[#3a2600] transition-opacity hover:brightness-110 disabled:opacity-60"
          >
            {busyAny ? '⏳' : '⚡'} Las 5 IAs
          </button>
          <span className="text-[#ffd24a33]">|</span>
          {AI_LEVELS.map((lvl) => {
            const done = analyzed.includes(lvl.id);
            const busy = learningKey === `${log.id}:${lvl.id}`;
            return (
              <button
                key={lvl.id}
                disabled={busy}
                onClick={() => onLearn(log.id, lvl.id)}
                title={done ? `${lvl.name} ya aprendió esta partida (puede releerla)` : `Que ${lvl.name} aprenda de esta partida`}
                className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-black transition-opacity disabled:opacity-60"
                style={{ borderColor: lvl.color + (done ? '' : '55'), color: done ? '#0e0a16' : lvl.color, background: done ? lvl.color : 'transparent' }}
              >
                {busy ? '⏳' : done ? '✓' : '📖'} {lvl.name.replace('IA ', '')}
              </button>
            );
          })}
        </div>
      </div>
      {open && (
        <div className="mt-3 grid gap-3 border-t border-[#ffd24a1a] pt-3 text-[11px] text-[#cfc6dd] md:grid-cols-2">
          <div>
            <div className="font-black text-[#ffe49a]">Héroes jugador:</div>
            <div>{(log.player_heroes || []).map(h => `${h.name}${h.elite ? ' ★' : ''}${h.died ? ' ☠' : ''}`).join(', ') || '—'}</div>
            <div className="mt-1 font-black text-[#ffe49a]">Héroes rival:</div>
            <div>{(log.opponent_heroes || []).map(h => `${h.name}${h.elite ? ' ★' : ''}${h.died ? ' ☠' : ''}`).join(', ') || '—'}</div>
            {(log.items_bought || []).length > 0 && (
              <>
                <div className="mt-1 font-black text-[#ffe49a]">Compras:</div>
                <div>{log.items_bought.map(i => i.name).join(', ')}</div>
              </>
            )}
          </div>
          <div className="max-h-56 overflow-y-auto rounded-xl bg-black/40 p-2">
            {(log.events || []).length === 0 && <div className="italic text-[#9a8ba8]">Sin eventos registrados (partida anterior a la mejora del registro).</div>}
            {(log.events || []).map((ev, i) => (
              <div key={i} className="border-b border-white/5 py-0.5">
                <span className="text-[#9a8ba8]">T{ev.turn || 0}</span> {ev.detail || ev.type}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}