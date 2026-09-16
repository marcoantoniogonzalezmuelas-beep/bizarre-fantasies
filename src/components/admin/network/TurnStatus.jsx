import React from 'react';

export default function TurnStatus({ turn, testing, onTest }) {
  const ok = turn && !turn.error;
  const ms = turn?.ms;

  let latencyColor = '#cfc6dd';
  let latencyLabel = '—';
  if (ms != null) {
    if (ms < 800) { latencyColor = '#66ffaa'; latencyLabel = 'Rápido'; }
    else if (ms < 2500) { latencyColor = '#ffd24a'; latencyLabel = 'Aceptable'; }
    else { latencyColor = '#ff6b6b'; latencyLabel = 'Lento'; }
  }

  return (
    <section className="rounded-3xl border border-[#7ab8ff33] bg-[#140d24]/90 p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-black text-[#a8d0ff]">Servidor de Relay</h2>
          <p className="mt-1 text-xs text-[#cfc6dd]">Relay por servidor Base44 (sin WebRTC/P2P/TURN). El estado de la partida vive en el servidor; ambos jugadores hacen polling.</p>
        </div>
        <button onClick={onTest} disabled={testing}
          className="rounded-xl border border-[#7ab8ff66] px-4 py-2 text-sm font-black text-[#a8d0ff] hover:bg-[#7ab8ff] hover:text-[#0e1a2a] disabled:opacity-50">
          {testing ? 'Probando…' : 'Probar relay'}
        </button>
      </div>

      {!turn && !testing && <p className="text-sm text-[#cfc6dd]">Pulsa «Probar relay» para medir la latencia contra el servidor.</p>}

      {testing && <div className="flex items-center gap-2 text-sm text-[#cfc6dd]"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#7ab8ff] border-t-transparent" /> Midiendo latencia contra el servidor de relay…</div>}

      {turn && (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[#ffffff14] bg-black/30 p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9a8fb5]">Estado</div>
            <div className="mt-1 text-lg font-black" style={{ color: ok ? '#66ffaa' : '#ff6b6b' }}>
              {ok ? '✓ Operativo' : '✗ Error'}
            </div>
            {turn.error && <div className="mt-1 text-xs text-[#ff9d9d]">{turn.error}</div>}
          </div>

          <div className="rounded-2xl border border-[#ffffff14] bg-black/30 p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9a8fb5]">Latencia</div>
            <div className="mt-1 text-lg font-black" style={{ color: latencyColor }}>
              {ms != null ? `${ms} ms` : '—'} {latencyLabel !== '—' && <span className="text-xs">· {latencyLabel}</span>}
            </div>
          </div>

          <div className="rounded-2xl border border-[#ffffff14] bg-black/30 p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9a8fb5]">Tipo</div>
            <div className="mt-1 text-lg font-black text-[#fff5dc]">
              Relay Base44
            </div>
          </div>
        </div>
      )}
    </section>
  );
}