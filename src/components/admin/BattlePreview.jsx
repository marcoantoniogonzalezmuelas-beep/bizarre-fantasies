import React, { useState } from 'react';

// Réplica fiel del rectángulo de batalla (.bhero) del juego.
// Muestra el retrato del héroe a la izquierda y la escena de batalla
// difuminada a la derecha, con los mismos degradados, blur y bordes que
// se ven en combate, para que el admin sepa exactamente cómo quedará.
export default function BattlePreview({ form }) {
  const [elite, setElite] = useState(false);

  const artUrl = form.art_url || '';
  const battleUrl = elite ? (form.elite_battle_art_url || form.battle_art_url || '') : (form.battle_art_url || '');

  return (
    <div className="mt-3 rounded-2xl border border-[#ffd24a33] bg-[#0e0816]/80 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#ffd24a]">👁️ Vista previa del rectángulo de batalla</span>
        {form.elite_battle_art_url && (
          <button
            type="button"
            onClick={() => setElite(!elite)}
            className="rounded-lg border border-[#c05bff66] bg-[#1a0d2e] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#e2b0ff] hover:bg-[#2a1547]"
          >
            {elite ? '⭐ Élite' : 'Base'}
          </button>
        )}
      </div>

      {/* Réplica .bhero del juego */}
      <div
        className="relative mx-auto overflow-hidden rounded-[14px] border border-[#ffd24a3a] bg-[#1a0d2e] shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
        style={{ maxWidth: 420, minHeight: 188, paddingLeft: 172 }}
      >
        {/* Escena de batalla difuminada (.bf-bhero-bgart) */}
        {battleUrl ? (
          <div
            className="absolute inset-y-0 right-0 z-[1] pointer-events-none"
            style={{
              left: 122,
              backgroundImage: `url("${battleUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 18%',
              backgroundRepeat: 'no-repeat',
              filter: 'saturate(1.15)',
            }}
          >
            {/* Solo el fundido lateral izquierdo, para que el retrato se una a
                la escena igual que en la batalla real (sin velo oscuro). */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg,rgba(14,9,22,.75) 0%,rgba(14,9,22,0) 22%)',
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-y-0 right-0 z-[1] flex items-center justify-center text-[10px] text-[#6b5a8a]" style={{ left: 122 }}>
            Sin escena
          </div>
        )}

        {/* Retrato del héroe (.bf-battle-art) */}
        {artUrl ? (
          <div
            className="absolute z-[1] overflow-hidden"
            style={{
              left: -22,
              top: -18,
              bottom: -18,
              width: 216,
              backgroundImage: `url("${artUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 10%',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#0a0710',
              filter: 'saturate(1.14) contrast(1.1)',
            }}
          >
            {/* Degradado de fundido a la derecha */}
            <div
              className="absolute inset-0 z-[2] pointer-events-none"
              style={{
                background: 'linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.04) 48%,rgba(21,16,31,.95) 100%)',
              }}
            />
          </div>
        ) : (
          <div className="absolute z-[1] flex items-center justify-center text-[10px] text-[#6b5a8a]" style={{ left: -22, top: -18, bottom: -18, width: 216 }}>
            Sin retrato
          </div>
        )}

        {/* Contenido simulado del panel de batalla */}
        <div className="relative z-[2] flex h-full flex-col justify-center gap-1 pt-3" style={{ minHeight: 188 }}>
          <div className="font-heading text-sm font-black tracking-wide text-[#ffe49a]" style={{ textShadow: '0 2px 6px #000, 0 0 14px rgba(255,210,74,.4)' }}>
            {form.name || 'Héroe'}
          </div>
          {form.title && <div className="text-[10px] font-bold text-[#cfc6dd]">{form.title}</div>}
          <div className="mt-1 flex flex-wrap gap-1">
            {form.cc != null && <span className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-black text-[#ff6a4a]">CC {form.cc}</span>}
            {form.ad != null && <span className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-black text-[#ffc84a]">AD {form.ad}</span>}
            {form.he != null && <span className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-black text-[#b06cff]">HE {form.he}</span>}
            {form.hp != null && <span className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-black text-[#7dff9a]">HP {form.hp}</span>}
          </div>
          {elite && form.elite_ability_name && (
            <div className="mt-1 text-[9px] font-bold text-[#e2b0ff]">⭐ {form.elite_ability_name}</div>
          )}
          {!elite && form.ability_name && (
            <div className="mt-1 text-[9px] font-bold text-[#cfc6dd]">⚔ {form.ability_name}</div>
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-[9px] text-[#6b5a8a]">
        Así es como se verá el recuadro de combate en la batalla real {elite ? '(versión élite)' : '(versión base)'}
      </p>
    </div>
  );
}