import React from 'react';

export default function TurnStatus({ turn, testing, onTest }) {
  const ok = turn && !turn.error;
  const ms = turn?.ms;
  const source = turn?.source;
  const cached = turn?.cached;
  const servers = turn?.iceServers || [];

  let latencyColor = '#cfc6dd';
  let latencyLabel = '—';
  if (ms != null) {
    if (ms < 800) { latencyColor = '#66ffaa'; latencyLabel = 'Rápido'; }
    else if (ms < 2500) { latencyColor = '#ffd24a'; latencyLabel = 'Aceptable'; }
    else { latencyColor = '#ff6b6b'; latencyLabel = 'Lento'; }
  }

  const hasTurn = servers.some(s => {
    const u = Array.isArray(s?.urls) ? s.urls.join(' ') : String(s?.urls || '');
    return /^turns?:/i.test(u);
  });
  const hasStun = servers.some(s => {
    const u = Array.isArray(s?.urls) ? s.urls.join(' ') : String(s?.urls || '');
    return /^stun:/i.test(u);
  });

  return (
    <section className="rounded-3xl border border-[#7ab8ff33] bg-[#140d24]/90 p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-black text-[#a8d0ff]">Servidor TURN (relay WebRTC)</h2>
          <p className="mt-1 text-xs text-[#cfc6dd]">Proveedor: Metered (relay de paso para NAT/CGNAT). Sin relay no hay partida online en móvil.</p>
        </div>
        <button onClick={onTest} disabled={testing}
          className="rounded-xl border border-[#7ab8ff66] px-4 py-2 text-sm font-black text-[#a8d0ff] hover:bg-[#7ab8ff] hover:text-[#0e1a2a] disabled:opacity-50">
          {testing ? 'Probando…' : 'Probar TURN'}
        </button>
      </div>

      {!turn && !testing && <p className="text-sm text-[#cfc6dd]">Pulsa «Probar TURN» para medir la latencia y verificar los servidores.</p>}

      {testing && <div className="flex items-center gap-2 text-sm text-[#cfc6dd]"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#7ab8ff] border-t-transparent" /> Midiendo latencia contra Metered…</div>}

      {turn && (
        <div className="grid gap-3 md:grid-cols-4">
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
            <div className="text-xs font-bold uppercase tracking-wider text-[#9a8fb5]">Fuente</div>
            <div className="mt-1 text-lg font-black text-[#fff5dc]">
              {source === 'metered' ? 'Metered' : source === 'fallback' ? 'Respaldo' : cached ? 'Caché' : '—'}
              {cached && <span className="ml-1 text-xs text-[#9a8fb5]">(cache)</span>}
            </div>
          </div>

          <div className="rounded-2xl border border-[#ffffff14] bg-black/30 p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9a8fb5]">Relays</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-black">
              <span style={{ color: hasTurn ? '#66ffaa' : '#ff6b6b' }}>{hasTurn ? '✓ TURN' : '✗ TURN'}</span>
              <span style={{ color: hasStun ? '#66ffaa' : '#ff6b6b' }}>{hasStun ? '✓ STUN' : '✗ STUN'}</span>
            </div>
          </div>
        </div>
      )}

      {ok && servers.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#9a8fb5]">Servidores ICE ({servers.length})</div>
          <div className="grid gap-1.5">
            {servers.map((s, i) => {
              const urls = Array.isArray(s?.urls) ? s.urls : [s?.urls].filter(Boolean);
              const first = String(urls[0] || '');
              const isTurn = /^turns?:/i.test(first);
              const isStun = /^stun:/i.test(first);
              return (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-[#ffffff0a] bg-black/20 px-3 py-1.5 text-xs">
                  <span className="font-mono text-[#cfc6dd]">{first}</span>
                  {isTurn && <span className="rounded bg-[#7ab8ff22] px-1.5 py-0.5 text-[10px] font-black text-[#a8d0ff]">TURN</span>}
                  {isStun && <span className="rounded bg-[#66ffaa22] px-1.5 py-0.5 text-[10px] font-black text-[#9dffcf]">STUN</span>}
                  {s?.username && <span className="text-[#9a8fb5]">user: {s.username.slice(0, 12)}…</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}