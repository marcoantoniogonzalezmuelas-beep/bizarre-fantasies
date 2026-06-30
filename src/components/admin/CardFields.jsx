import React from 'react';

export const CARD_CATEGORIES = [
  ['hero', 'Héroe'], ['spell', 'Hechizo'], ['ranged_weapon', 'Arma a distancia'],
  ['melee_weapon', 'Arma cuerpo a cuerpo'], ['armor', 'Armadura'], ['object', 'Objeto'],
  ['bonus', 'Bonus'], ['race', 'Raza']
];

export const CARD_RACES = ['Guerreros', 'Druidas', 'No-muertos', 'Vaqueros', 'Elfos', 'Magos', 'Épicas', 'Cotidianos'];

const numberFields = ['number', 'cost', 'cc', 'ad', 'he', 'hp', 'mana', 'power', 'elite_cc', 'elite_ad', 'elite_he', 'elite_hp'];

function Field({ label, name, value, onChange, type = 'text', textarea = false }) {
  const base = 'w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]';
  return <label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">{label}</span>{textarea ? <textarea className={`${base} min-h-[86px]`} value={value || ''} onChange={(e) => onChange(name, e.target.value)} /> : <input className={base} type={type} value={value || ''} onChange={(e) => onChange(name, e.target.value)} />}</label>;
}

export default function CardFields({ form, onChange, onGenerate, generating, onUpload, uploading }) {
  return <div className="grid gap-4"><div className="grid gap-3 md:grid-cols-3"><Field label="Número" name="number" type="number" value={form.number} onChange={onChange} /><Field label="ID carta" name="card_id" value={form.card_id} onChange={onChange} /><label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Tipo de carta</span><select className="w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" value={form.category || 'hero'} onChange={(e) => onChange('category', e.target.value)}>{CARD_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label></div><div className="grid gap-3 md:grid-cols-3"><Field label="Nombre" name="name" value={form.name} onChange={onChange} /><Field label="Título / subtítulo" name="title" value={form.title} onChange={onChange} /><label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Raza / clan</span><select className="w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" value={form.clan || ''} onChange={(e) => onChange('clan', e.target.value)}><option value="">Sin raza</option>{CARD_RACES.map(r => <option key={r} value={r}>{r}</option>)}</select></label></div><div className="grid gap-3 md:grid-cols-3"><Field label="Rol / elemento" name="type" value={form.type} onChange={onChange} /><Field label="Etiqueta" name="tag" value={form.tag} onChange={onChange} /><Field label="Color raza" name="clan_color" value={form.clan_color} onChange={onChange} /></div>
  
  <div className="my-2 flex items-center justify-between border-y border-[#ffd24a22] py-3">
    <div className="text-xs text-[#cfc6dd]">Rellena Nombre y Raza primero para generar todos los stats automáticamente:</div>
    <button type="button" onClick={form.onGenerateStats} disabled={form.generatingStats || !form.name || !form.clan} className="rounded-xl bg-gradient-to-b from-[#7ad6ff] to-[#3a8bff] px-5 py-2 text-xs font-black text-white shadow-lg disabled:opacity-50">
      {form.generatingStats ? 'Generando Stats...' : '✨ Autocompletar Stats IA'}
    </button>
  </div>

  <div className="grid gap-3 md:grid-cols-6">{numberFields.slice(1, 8).map(f => <Field key={f} label={f.toUpperCase()} name={f} type="number" value={form[f]} onChange={onChange} />)}</div><div className="grid gap-3 md:grid-cols-4">{numberFields.slice(8).map(f => <Field key={f} label={f.replace('elite_', 'Élite ').toUpperCase()} name={f} type="number" value={form[f]} onChange={onChange} />)}</div><div className="grid gap-3 md:grid-cols-2"><Field label="Habilidad" name="ability_name" value={form.ability_name} onChange={onChange} /><Field label="Habilidad élite" name="elite_ability_name" value={form.elite_ability_name} onChange={onChange} /></div><div className="grid gap-3 md:grid-cols-2"><Field label="Texto habilidad" name="ability_text" value={form.ability_text} onChange={onChange} textarea /><Field label="Texto habilidad élite" name="elite_ability_text" value={form.elite_ability_text} onChange={onChange} textarea /></div><Field label="Descripción / efecto" name="description" value={form.description} onChange={onChange} textarea /><div className="grid gap-3 md:grid-cols-[1fr_auto]"><Field label="Prompt para imagen IA" name="image_prompt" value={form.image_prompt} onChange={onChange} textarea /><div className="flex flex-col gap-2 self-end pb-1"><button type="button" onClick={() => onGenerate('art_url')} disabled={generating || !form.image_prompt} className="rounded-xl bg-[#ffd24a] px-5 py-2 text-xs font-black text-[#3a2600] disabled:opacity-50">{generating ? 'Creando...' : 'IA Normal'}</button>{form.category === 'hero' && <button type="button" onClick={() => onGenerate('elite_art_url')} disabled={generating || !form.image_prompt} className="rounded-xl bg-[#c05bff] px-5 py-2 text-xs font-black text-white disabled:opacity-50">{generating ? 'Creando...' : 'IA Élite'}</button>}</div></div><div className="grid gap-3 md:grid-cols-2"><label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Subir imagen normal</span><input type="file" accept="image/*" disabled={uploading} onChange={(e) => onUpload?.(e.target.files?.[0], 'art_url')} className="w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] file:mr-3 file:rounded-lg file:border-0 file:bg-[#ffd24a] file:px-3 file:py-1.5 file:font-black file:text-[#3a2600] disabled:opacity-50" /></label>{form.category === 'hero' && <label className="block"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#c05bff]">Subir imagen Élite</span><input type="file" accept="image/*" disabled={uploading} onChange={(e) => onUpload?.(e.target.files?.[0], 'elite_art_url')} className="w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] file:mr-3 file:rounded-lg file:border-0 file:bg-[#c05bff] file:px-3 file:py-1.5 file:font-black file:text-white disabled:opacity-50" /></label>}</div><div className="grid gap-3 md:grid-cols-2"><Field label="URL imagen principal" name="art_url" value={form.art_url} onChange={onChange} /><Field label="URL imagen élite" name="elite_art_url" value={form.elite_art_url} onChange={onChange} /></div>
  
  {form.category === 'hero' && (
    <label className="mt-2 flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#ffd24a33] bg-black/45 hover:border-[#ffd24a]">
      <input type="checkbox" checked={form.in_auction !== false} onChange={(e) => onChange('in_auction', e.target.checked)} className="w-5 h-5 accent-[#ffd24a]" />
      <div className="flex flex-col">
        <span className="text-sm font-black text-[#ffe49a]">Mostrar en subastas</span>
        <span className="text-[11px] text-[#cfc6dd]">Si se desmarca, este héroe solo será un token o saldrá mediante cartas especiales.</span>
      </div>
    </label>
  )}
  </div>;
}