import React from 'react';

export const CARD_CATEGORIES = [
  ['hero', 'Héroe'], ['spell', 'Hechizo'], ['ranged_weapon', 'Arma a distancia'],
  ['melee_weapon', 'Arma cuerpo a cuerpo'], ['armor', 'Armadura'], ['object', 'Objeto'],
  ['bonus', 'Bonus'], ['bizarro', 'Héroe bizarro'], ['race', 'Raza']
];

export const CARD_RACES = ['Guerreros', 'Druidas', 'No-muertos', 'Vaqueros', 'Elfos', 'Magos', 'Épicas', 'Cotidianos', 'Bizarros'];

const numberFields = ['number', 'cost', 'cc', 'ad', 'he', 'hp', 'mana', 'power', 'elite_cc', 'elite_ad', 'elite_he', 'elite_hp'];

function Field({ label, name, value, onChange, type = 'text', textarea = false }) {
  const base = 'w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]';
  return <label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">{label}</span>{textarea ? <textarea className={`${base} min-h-[86px]`} value={value || ''} onChange={(e) => onChange(name, e.target.value)} /> : <input className={base} type={type} value={value || ''} onChange={(e) => onChange(name, e.target.value)} />}</label>;
}

export default function CardFields({ form, onChange, onGenerate, generating, onUpload, uploading, onConvertEpic, onLevelUp, saving }) {
  return <div className="grid gap-4"><div className="grid gap-3 md:grid-cols-3"><Field label="Número" name="number" type="number" value={form.number} onChange={onChange} /><Field label="ID carta" name="card_id" value={form.card_id} onChange={onChange} /><label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Tipo de carta</span><select className="w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" value={form.category || 'hero'} onChange={(e) => onChange('category', e.target.value)}>{CARD_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label></div><div className="grid gap-3 md:grid-cols-3"><Field label="Nombre" name="name" value={form.name} onChange={onChange} /><Field label="Título / subtítulo" name="title" value={form.title} onChange={onChange} /><label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Raza / clan</span><select className="w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" value={form.clan || ''} onChange={(e) => onChange('clan', e.target.value)}><option value="">Sin raza</option>{CARD_RACES.map(r => <option key={r} value={r}>{r}</option>)}</select></label></div><div className="grid gap-3 md:grid-cols-3">{['hero', 'bizarro'].includes(form.category) ? <label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Rol</span><select className="w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" value={form.type || ''} onChange={(e) => onChange('type', e.target.value)}><option value="">Sin rol</option><option value="CC">CC (Cuerpo a cuerpo)</option><option value="AD">AD (A distancia)</option><option value="HE">HE (Hechizos)</option></select></label> : form.category === 'spell' ? <label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Elemento</span><select className="w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" value={form.type || ''} onChange={(e) => onChange('type', e.target.value)}><option value="">Sin elemento</option><option value="fuego">Fuego</option><option value="hielo">Hielo</option><option value="rayo">Rayo</option><option value="agua">Agua</option><option value="curacion">Curación</option><option value="proteccion">Protección</option><option value="arcano">Arcano</option><option value="estado">Estado</option></select></label> : <Field label="Rol / elemento" name="type" value={form.type} onChange={onChange} />}<Field label="Etiqueta" name="tag" value={form.tag} onChange={onChange} /><Field label="Color raza" name="clan_color" value={form.clan_color} onChange={onChange} /></div>
  
  <div className="my-2 flex flex-wrap items-center justify-between gap-2 border-y border-[#ffd24a22] py-3">
    <div className="text-xs text-[#cfc6dd]">Rellena Nombre y Raza primero para generar todos los stats automáticamente:</div>
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#7ad6ff]">Motor IA</span>
        <select value={form.aiModel || 'automatic'} onChange={(e) => form.onAiModelChange?.(e.target.value)} className="rounded-xl border border-[#7ad6ff44] bg-black/45 px-2 py-2 text-xs text-[#fff5dc] outline-none focus:border-[#7ad6ff]">
          <option value="automatic">Automático</option>
          <option value="gpt_5_mini">GPT 5 Mini (rápido)</option>
          <option value="gemini_3_flash">Gemini 3 Flash</option>
          <option value="gemini_3_1_pro">Gemini 3.1 Pro</option>
          <option value="claude_sonnet_4_6">Claude Sonnet 4.6</option>
          <option value="claude_opus_4_6">Claude Opus 4.6 (máx. calidad)</option>
        </select>
      </label>
      <button type="button" onClick={form.onGenerateStats} disabled={form.generatingStats || !form.name || !form.clan} className="rounded-xl bg-gradient-to-b from-[#7ad6ff] to-[#3a8bff] px-5 py-2 text-xs font-black text-white shadow-lg disabled:opacity-50">
        {form.generatingStats ? 'Generando Stats...' : '✨ Autocompletar Stats IA'}
      </button>
    </div>
  </div>

  {['hero', 'bizarro'].includes(form.category) && (
    <div className="mb-2 flex items-center justify-between rounded-xl border border-[#cc88ff44] bg-[#1a0d2e]/60 px-3 py-2.5">
      <div className="text-xs text-[#cfc6dd]">💎 Convierte este héroe a la raza <span className="font-black text-[#cc88ff]">Épicas</span> (+20 al coste de oro). El cambio se propaga al juego automáticamente.</div>
      <button type="button" onClick={onConvertEpic} disabled={saving || !form.name} className="shrink-0 rounded-xl bg-gradient-to-b from-[#cc88ff] to-[#7d2fd4] px-5 py-2 text-xs font-black text-white shadow-lg disabled:opacity-50">
        {saving ? 'Convirtiendo...' : '💎 Convertir a Épica'}
      </button>
    </div>
  )}

  {['hero', 'bizarro'].includes(form.category) && (
    <div className="mb-2 flex items-center justify-between rounded-xl border border-[#66ffaa33] bg-[#0d2e1a]/60 px-3 py-2.5">
      <div className="text-xs text-[#cfc6dd]">⬆ Sube +1 a cada stat (CC, AD, HE, HP, velocidad y versiones élite) y aumenta el coste de oro proporcionalmente. Se propaga al juego automáticamente.</div>
      <button type="button" onClick={onLevelUp} disabled={saving || !form.name} className="shrink-0 rounded-xl bg-gradient-to-b from-[#66ffaa] to-[#2aa84f] px-5 py-2 text-xs font-black text-[#0a1f0e] shadow-lg disabled:opacity-50">
        {saving ? 'Subiendo...' : '⬆ Subir de nivel'}
      </button>
    </div>
  )}

  <div className="grid gap-3 md:grid-cols-6">{numberFields.slice(1, 8).map(f => <Field key={f} label={f.toUpperCase()} name={f} type="number" value={form[f]} onChange={onChange} />)}<Field label="⚡ Velocidad" name="velocidad" type="number" value={form.velocidad} onChange={onChange} /></div><div className="grid gap-3 md:grid-cols-4">{numberFields.slice(8).map(f => <Field key={f} label={f.replace('elite_', 'Élite ').toUpperCase()} name={f} type="number" value={form[f]} onChange={onChange} />)}<Field label="⚡ Élite Velocidad" name="elite_velocidad" type="number" value={form.elite_velocidad} onChange={onChange} /></div><div className="grid gap-3 md:grid-cols-2"><Field label="Habilidad" name="ability_name" value={form.ability_name} onChange={onChange} /><Field label="Habilidad élite" name="elite_ability_name" value={form.elite_ability_name} onChange={onChange} /></div><div className="grid gap-3 md:grid-cols-2"><Field label="Texto habilidad" name="ability_text" value={form.ability_text} onChange={onChange} textarea /><Field label="Texto habilidad élite" name="elite_ability_text" value={form.elite_ability_text} onChange={onChange} textarea /></div><Field label="Descripción / efecto" name="description" value={form.description} onChange={onChange} textarea /><label className="flex flex-wrap items-center gap-2 rounded-xl border border-[#ff9d5c44] bg-[#2e1a0d]/60 px-3 py-2.5">
    <span className="text-[11px] font-black uppercase tracking-wider text-[#ffb07a]">🎨 Motor de imagen</span>
    <select value={form.imageEngine || 'base44'} onChange={(e) => form.onImageEngineChange?.(e.target.value)} className="rounded-xl border border-[#ff9d5c44] bg-black/45 px-2 py-2 text-xs text-[#fff5dc] outline-none focus:border-[#ff9d5c]">
      <option value="base44">Integrado (créditos de la plataforma)</option>
      <option value="openai">ChatGPT · gpt-image-1 (tu clave OpenAI)</option>
    </select>
    <span className="text-[11px] text-[#cfc6dd]">Se aplica al arte de carta, escenas de batalla, animaciones 3D y retoques.</span>
  </label>
  <div className="grid gap-3 md:grid-cols-[1fr_auto]"><Field label="Prompt para imagen IA" name="image_prompt" value={form.image_prompt} onChange={onChange} textarea /><div className="flex flex-col gap-2 self-end pb-1"><button type="button" onClick={() => onGenerate('art_url')} disabled={generating || !form.image_prompt} className="rounded-xl bg-[#ffd24a] px-5 py-2 text-xs font-black text-[#3a2600] disabled:opacity-50">{generating ? 'Creando...' : 'IA Normal'}</button>{['hero', 'bizarro'].includes(form.category) && <button type="button" onClick={() => onGenerate('elite_art_url')} disabled={generating || !form.image_prompt} className="rounded-xl bg-[#c05bff] px-5 py-2 text-xs font-black text-white disabled:opacity-50">{generating ? 'Creando...' : 'IA Élite'}</button>}</div></div><div className="grid gap-3 md:grid-cols-2"><label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Subir imagen normal</span><input type="file" accept="image/*" disabled={uploading} onChange={(e) => onUpload?.(e.target.files?.[0], 'art_url')} className="w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] file:mr-3 file:rounded-lg file:border-0 file:bg-[#ffd24a] file:px-3 file:py-1.5 file:font-black file:text-[#3a2600] disabled:opacity-50" /></label>{['hero', 'bizarro'].includes(form.category) && <label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#c05bff]">Subir imagen Élite</span><input type="file" accept="image/*" disabled={uploading} onChange={(e) => onUpload?.(e.target.files?.[0], 'elite_art_url')} className="w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] file:mr-3 file:rounded-lg file:border-0 file:bg-[#c05bff] file:px-3 file:py-1.5 file:font-black file:text-white disabled:opacity-50" /></label>}</div><div className="grid gap-3 md:grid-cols-2"><Field label="URL imagen principal" name="art_url" value={form.art_url} onChange={onChange} /><Field label="URL imagen élite" name="elite_art_url" value={form.elite_art_url} onChange={onChange} /></div>
  
  {['hero', 'bizarro'].includes(form.category) && (
    <label className="mt-2 flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#ffd24a33] bg-black/45 hover:border-[#ffd24a]">
      <input type="checkbox" checked={form.in_auction !== false} onChange={(e) => onChange('in_auction', e.target.checked)} className="w-5 h-5 accent-[#ffd24a]" />
      <div className="flex flex-col">
        <span className="text-sm font-black text-[#ffe49a]">Mostrar en subastas</span>
        <span className="text-[11px] text-[#cfc6dd]">Si se desmarca, este héroe solo será un token o saldrá mediante cartas especiales.</span>
      </div>
    </label>
  )}

  <div className="grid gap-3 md:grid-cols-3">
    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#ffd24a33] bg-black/45 hover:border-[#ffd24a]">
      <input type="checkbox" checked={form.foil === true} onChange={(e) => onChange('foil', e.target.checked)} className="w-5 h-5 accent-[#ffd24a]" />
      <div className="flex flex-col">
        <span className="text-sm font-black text-[#ffe49a]">✦ Carta Foil (holográfica)</span>
        <span className="text-[11px] text-[#cfc6dd]">Añade el brillo holográfico animado sobre la ilustración.</span>
      </div>
    </label>
    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#ffd24a33] bg-black/45 hover:border-[#ffd24a]">
      <input type="checkbox" checked={form.gold_border === true} onChange={(e) => onChange('gold_border', e.target.checked)} className="w-5 h-5 accent-[#ffd24a]" />
      <div className="flex flex-col">
        <span className="text-sm font-black text-[#ffe49a]">▣ Borde dorado grueso</span>
        <span className="text-[11px] text-[#cfc6dd]">Marco dorado premium alrededor de la carta (estilo TCG).</span>
      </div>
    </label>
    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#ffd24a33] bg-black/45 hover:border-[#ffd24a]">
      <input type="checkbox" checked={form.rainbow_border === true} onChange={(e) => onChange('rainbow_border', e.target.checked)} className="w-5 h-5 accent-[#ffd24a]" />
      <div className="flex flex-col">
        <span className="text-sm font-black text-[#ffe49a]">🌈 Borde multicolor</span>
        <span className="text-[11px] text-[#cfc6dd]">Marco grueso arcoíris animado alrededor de la carta.</span>
      </div>
    </label>
  </div>
  </div>;
}