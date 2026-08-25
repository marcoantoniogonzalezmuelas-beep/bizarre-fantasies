import React, { useState } from 'react';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');

export default function PairRow({ pair, onReset }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function doReset() {
    setBusy(true);
    await onReset(pair);
    setBusy(false);
    setConfirming(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#ffd24a22] bg-black/35 px-3 py-2.5">
      <div className="flex min-w-[220px] flex-1 items-center gap-3">
        <span className="font-heading text-sm font-black text-[#fff5dc] capitalize">{pair.a}</span>
        <span className="font-heading text-lg font-black text-[#FFD24A]">{pair.aWins} · {pair.bWins}</span>
        <span className="font-heading text-sm font-black text-[#fff5dc] capitalize">{pair.b}</span>
      </div>
      <div className="text-[11px] text-[#cfc6dd]">Último cambio: <span className="text-[#ffe49a]">{fmt(pair.updated)}</span></div>
      {confirming ? (
        <div className="flex items-center gap-2">
          <button onClick={doReset} disabled={busy} className="rounded-lg bg-[#cc3333] px-3 py-1.5 text-xs font-black text-white disabled:opacity-50">{busy ? 'Borrando…' : 'Confirmar'}</button>
          <button onClick={() => setConfirming(false)} className="rounded-lg border border-[#ffd24a44] px-3 py-1.5 text-xs font-black text-[#ffe49a]">Cancelar</button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="rounded-lg border border-[#cc333388] px-3 py-1.5 text-xs font-black text-[#ff9d9d] hover:bg-[#cc3333] hover:text-white">Resetear marcador</button>
      )}
    </div>
  );
}