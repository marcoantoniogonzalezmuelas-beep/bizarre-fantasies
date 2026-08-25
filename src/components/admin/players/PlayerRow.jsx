import React, { useState } from 'react';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');
const MODES = { online: 'Online', local: 'Local', ia: 'vs IA' };

export default function PlayerRow({ player, onReset }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function doReset() {
    setBusy(true);
    await onReset(player.nick);
    setBusy(false);
    setConfirming(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#ffd24a22] bg-black/35 px-3 py-2.5">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#ffd24a55] bg-[#1b1430]">
        {player.avatar ? <img src={player.avatar} alt={player.nick} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs font-black text-[#ffe49a]">{player.nick.slice(0, 2).toUpperCase()}</div>}
      </div>
      <div className="min-w-[130px] flex-1">
        <div className="font-heading text-base font-black text-[#fff5dc]">{player.nick}{player.isAi && <span className="ml-2 rounded-md bg-[#7ab8ff22] px-1.5 py-0.5 text-[10px] font-black text-[#a8d0ff]">IA</span>}</div>
        <div className="text-[11px] text-[#cfc6dd]">{player.games} partidas · {player.modes.map(m => MODES[m] || m).join(', ') || 'sin modo'}</div>
      </div>
      <div className="text-center">
        <div className="font-heading text-lg font-black text-[#7dffa8]">{player.wins}</div>
        <div className="text-[10px] text-[#cfc6dd]">victorias</div>
      </div>
      <div className="text-center">
        <div className="font-heading text-lg font-black text-[#ff9d9d]">{player.losses}</div>
        <div className="text-[10px] text-[#cfc6dd]">derrotas</div>
      </div>
      <div className="min-w-[150px] text-[11px] text-[#cfc6dd]">
        <div>Primera: <span className="text-[#ffe49a]">{fmt(player.first)}</span></div>
        <div>Última: <span className="text-[#ffe49a]">{fmt(player.last)}</span></div>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2">
          <button onClick={doReset} disabled={busy} className="rounded-lg bg-[#cc3333] px-3 py-1.5 text-xs font-black text-white disabled:opacity-50">{busy ? 'Borrando…' : 'Confirmar'}</button>
          <button onClick={() => setConfirming(false)} className="rounded-lg border border-[#ffd24a44] px-3 py-1.5 text-xs font-black text-[#ffe49a]">Cancelar</button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="rounded-lg border border-[#cc333388] px-3 py-1.5 text-xs font-black text-[#ff9d9d] hover:bg-[#cc3333] hover:text-white">Resetear resultados</button>
      )}
    </div>
  );
}