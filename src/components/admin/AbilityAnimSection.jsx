import React, { useState } from 'react';
import AbilityAnimPreview from './AbilityAnimPreview';

// Sección del editor de backoffice para crear animaciones 3D cinemáticas de
// las habilidades de los héroes (normal y élite). El admin escribe una
// descripción que guía a la IA para generar el arte de la animación, lo
// previsualiza en 3D (igual que se verá en el juego) y guarda la URL en la
// carta. Solo se muestra para héroes y héroes bizarros.
export default function AbilityAnimSection({ form, onChange, onGenerate, generating }) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewElite, setPreviewElite] = useState(false);

  if (!['hero', 'bizarro'].includes(form.category)) return null;

  const isGeneratingBase = generating === 'ability_anim_url';
  const isGeneratingElite = generating === 'elite_ability_anim_url';

  const previewUrl = previewElite
    ? (form.elite_ability_anim_url || form.ability_anim_url || '')
    : (form.ability_anim_url || '');
  const previewName = previewElite
    ? (form.elite_ability_name || form.ability_name || form.name)
    : (form.ability_name || form.name);

  return (
    <div className="mt-2 rounded-2xl border border-[#3c9eff33] bg-[#0d1a2e]/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-black uppercase tracking-wider text-[#7ec8ff]">🎬 Animaciones 3D de habilidad</span>
        <span className="text-[11px] text-[#5a8ab8]">Cinemática que irrumpe al usar la habilidad en combate</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Habilidad normal */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">
            ⚔️ Habilidad {form.ability_name ? `· ${form.ability_name}` : '(base)'}
          </span>
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#3c9eff44] bg-black/45">
            {form.ability_anim_url ? (
              <img src={form.ability_anim_url} alt="Anim 3D base" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-center text-xs text-[#5a8ab8]">Sin arte de animación.<br />Escribe una descripción y genera el arte 3D.</div>
            )}
          </div>
          <textarea
            value={form.ability_anim_desc || ''}
            onChange={(e) => onChange('ability_anim_desc', e.target.value)}
            placeholder="Describe la cinemática 3D: el personaje lanzando su habilidad, pose dinámica, efectos mágicos, aura, color, ambiente…"
            rows={2}
            className="w-full resize-none rounded-lg border border-[#3c9eff22] bg-black/45 px-2 py-1.5 text-[10px] text-[#cfc6dd] outline-none placeholder:text-[#4a6a8a] focus:border-[#3c9eff55]"
          />
          <button
            type="button"
            onClick={() => onGenerate('ability_anim_url', form.ability_anim_desc || '')}
            disabled={generating || !form.name}
            className="rounded-xl bg-gradient-to-b from-[#3c9eff] to-[#1a6fd4] px-4 py-2 text-xs font-black text-white disabled:opacity-50"
          >
            {isGeneratingBase ? 'Generando 3D…' : form.ability_anim_url ? '🔄 Regenerar animación' : '🎬 Generar animación 3D'}
          </button>
          {form.ability_anim_url && (
            <input
              type="text"
              value={form.ability_anim_url}
              onChange={(e) => onGenerate('__set_ability_anim_url', e.target.value)}
              className="w-full rounded-lg border border-[#3c9eff22] bg-black/45 px-2 py-1 text-[10px] text-[#cfc6dd] outline-none"
            />
          )}
        </div>
        {/* Habilidad élite */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#e2b0ff]">
            ⭐ Habilidad élite {form.elite_ability_name ? `· ${form.elite_ability_name}` : ''}
          </span>
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#c05bff44] bg-black/45">
            {form.elite_ability_anim_url ? (
              <img src={form.elite_ability_anim_url} alt="Anim 3D élite" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-center text-xs text-[#7d5ab8]">Sin arte de animación.<br />Versión épica de la cinemática.</div>
            )}
          </div>
          <textarea
            value={form.elite_ability_anim_desc || ''}
            onChange={(e) => onChange('elite_ability_anim_desc', e.target.value)}
            placeholder="Versión épica de la cinemática: aura dorada, poder máximo, pose frenética, efectos espectaculares…"
            rows={2}
            className="w-full resize-none rounded-lg border border-[#c05bff22] bg-black/45 px-2 py-1.5 text-[10px] text-[#cfc6dd] outline-none placeholder:text-[#6b4a8a] focus:border-[#c05bff55]"
          />
          <button
            type="button"
            onClick={() => onGenerate('elite_ability_anim_url', form.elite_ability_anim_desc || '')}
            disabled={generating || !form.name}
            className="rounded-xl bg-gradient-to-b from-[#c05bff] to-[#7d2fd4] px-4 py-2 text-xs font-black text-white disabled:opacity-50"
          >
            {isGeneratingElite ? 'Generando 3D…' : form.elite_ability_anim_url ? '🔄 Regenerar animación élite' : '🎬 Generar animación 3D élite'}
          </button>
          {form.elite_ability_anim_url && (
            <input
              type="text"
              value={form.elite_ability_anim_url}
              onChange={(e) => onGenerate('__set_elite_ability_anim_url', e.target.value)}
              className="w-full rounded-lg border border-[#c05bff22] bg-black/45 px-2 py-1 text-[10px] text-[#cfc6dd] outline-none"
            />
          )}
        </div>
      </div>

      {/* Vista previa de la cinemática 3D */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          disabled={!form.ability_anim_url && !form.elite_ability_anim_url}
          className="rounded-xl border border-[#3c9eff44] bg-[#0d1a2e]/60 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#7ec8ff] hover:bg-[#152a4a]/60 disabled:opacity-40"
        >
          {showPreview ? '🔼 Ocultar cinemática' : '▶️ Previsualizar cinemática 3D'}
        </button>
        {(form.ability_anim_url && form.elite_ability_anim_url) ? (
          <button
            type="button"
            onClick={() => setPreviewElite(!previewElite)}
            className="rounded-lg border border-[#c05bff66] bg-[#1a0d2e] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#e2b0ff] hover:bg-[#2a1547]"
          >
            {previewElite ? '⭐ Élite' : 'Base'}
          </button>
        ) : null}
      </div>
      {showPreview && previewUrl && (
        <AbilityAnimPreview
          artUrl={previewUrl}
          abilityName={previewName}
          clanColor={form.clan_color}
          elite={previewElite}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}