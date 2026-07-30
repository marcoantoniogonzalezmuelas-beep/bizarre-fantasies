import React, { useState } from 'react';
import BattlePreview from './BattlePreview';

// Sección de escenas de batalla (base + élite) en el editor del backoffice.
// Muestra las imágenes generadas y permite regenerarlas con IA.
// Incluye un campo de texto orientativo para guiar la generación.
// Solo se muestra para héroes y héroes bizarros.
export default function BattleArtSection({ form, onGenerate, generating }) {
  const [basePrompt, setBasePrompt] = useState('');
  const [elitePrompt, setElitePrompt] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  if (!['hero', 'bizarro'].includes(form.category)) return null;

  const isGeneratingBase = generating === 'battle_art_url';
  const isGeneratingElite = generating === 'elite_battle_art_url';

  return (
    <div className="mt-2 rounded-2xl border border-[#c05bff33] bg-[#1a0d2e]/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-black uppercase tracking-wider text-[#e2b0ff]">⚔️ Escenas de batalla</span>
        <span className="text-[11px] text-[#9d7fc4]">Arte dinámico que aparece en el recuadro de combate del juego</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Escena base */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Escena base</span>
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#ffd24a44] bg-black/45">
            {form.battle_art_url ? (
              <img src={form.battle_art_url} alt="Escena batalla" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#9d7fc4]">Sin escena generada</div>
            )}
          </div>
          <textarea
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="Texto orientativo para la IA: pose, expresión, fondo, efectos, ambiente…"
            rows={2}
            className="w-full resize-none rounded-lg border border-[#ffd24a22] bg-black/45 px-2 py-1.5 text-[10px] text-[#cfc6dd] outline-none placeholder:text-[#6b5a8a] focus:border-[#ffd24a55]"
          />
          <button
            type="button"
            onClick={() => onGenerate('battle_art_url', basePrompt)}
            disabled={generating || !form.name}
            className="rounded-xl bg-gradient-to-b from-[#ffd24a] to-[#c8901f] px-4 py-2 text-xs font-black text-[#3a2600] disabled:opacity-50"
          >
            {isGeneratingBase ? 'Generando...' : form.battle_art_url ? '🔄 Regenerar base' : '⚔️ Generar base'}
          </button>
          {form.battle_art_url && (
            <input
              type="text"
              value={form.battle_art_url}
              onChange={(e) => onGenerate('__set_battle_art_url', e.target.value)}
              className="w-full rounded-lg border border-[#ffd24a22] bg-black/45 px-2 py-1 text-[10px] text-[#cfc6dd] outline-none"
            />
          )}
        </div>
        {/* Escena élite */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#e2b0ff]">Escena élite</span>
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#c05bff44] bg-black/45">
            {form.elite_battle_art_url ? (
              <img src={form.elite_battle_art_url} alt="Escena batalla élite" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#9d7fc4]">Sin escena generada</div>
            )}
          </div>
          <textarea
            value={elitePrompt}
            onChange={(e) => setElitePrompt(e.target.value)}
            placeholder="Texto orientativo para la IA: aura dorada, pose frenética, poder máximo…"
            rows={2}
            className="w-full resize-none rounded-lg border border-[#c05bff22] bg-black/45 px-2 py-1.5 text-[10px] text-[#cfc6dd] outline-none placeholder:text-[#6b5a8a] focus:border-[#c05bff55]"
          />
          <button
            type="button"
            onClick={() => onGenerate('elite_battle_art_url', elitePrompt)}
            disabled={generating || !form.name}
            className="rounded-xl bg-gradient-to-b from-[#c05bff] to-[#7d2fd4] px-4 py-2 text-xs font-black text-white disabled:opacity-50"
          >
            {isGeneratingElite ? 'Generando...' : form.elite_battle_art_url ? '🔄 Regenerar élite' : '⚔️ Generar élite'}
          </button>
          {form.elite_battle_art_url && (
            <input
              type="text"
              value={form.elite_battle_art_url}
              onChange={(e) => onGenerate('__set_elite_battle_art_url', e.target.value)}
              className="w-full rounded-lg border border-[#c05bff22] bg-black/45 px-2 py-1 text-[10px] text-[#cfc6dd] outline-none"
            />
          )}
        </div>
      </div>

      {/* Vista previa del rectángulo de batalla */}
      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="mt-3 rounded-xl border border-[#ffd24a44] bg-[#1a0d2e]/60 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#ffd24a] hover:bg-[#2a1547]/60"
      >
        {showPreview ? '🔼 Ocultar vista previa' : '👁️ Ver cómo se verá en batalla'}
      </button>
      {showPreview && <BattlePreview form={form} />}
    </div>
  );
}