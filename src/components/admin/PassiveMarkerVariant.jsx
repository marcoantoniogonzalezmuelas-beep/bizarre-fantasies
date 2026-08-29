import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

// Una variante (normal o élite) del marcador de habilidad pasiva. Permite
// fijar flag, rótulo, color, duración y un icono: emoji rápido o icono
// generado por IA a partir de un prompt adaptado a la habilidad concreta.
const SUGGESTED_ICONS = ['✦', '⚠', '🛡️', '🧿', '☠', '🌟', '🌀', '🔮', '🩸', '❄', '⚡', '😇', '🥀', '🪦', '🧨', '♾️'];

export default function PassiveMarkerVariant({ variant, value, onChange, card }) {
  const v = value || {};
  const enabled = !!(v && v.flag);
  const [genIcon, setGenIcon] = useState(false);
  const accent = variant === 'elite' ? '#c05bff' : '#66ffaa';
  const accentText = variant === 'elite' ? '#e2b0ff' : '#9dffc4';

  const toggle = (e) => {
    if (e.target.checked) {
      onChange({
        flag: '_bf' + (card.card_id || card.name || 'passive') + (variant === 'elite' ? 'E' : ''),
        icon: '✦',
        color: variant === 'elite' ? '#c05bff' : '#c79bff',
        label: variant === 'elite' ? (card.elite_ability_name || 'Pasiva élite') : (card.ability_name || 'Pasiva'),
        tipo: 'conditional',
      });
    } else {
      onChange(null);
    }
  };

  const update = (field, val) => onChange({ ...v, [field]: val });

  const inputCls = 'w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]';

  async function generateIcon() {
    if (!card.name) return;
    setGenIcon(true);
    try {
      const abilityName = variant === 'elite' ? (card.elite_ability_name || '') : (card.ability_name || '');
      const abilityText = variant === 'elite' ? (card.elite_ability_text || '') : (card.ability_text || '');
      const clanColor = card.clan_color || '#c79bff';
      const prompt = `Icono de habilidad para el juego de cartas Bizarre Fantasies. Héroe "${card.name}" (${card.clan || ''}), habilidad ${variant === 'elite' ? 'ÉLITE' : 'normal'} "${abilityName}". Descripción: ${abilityText}. ${v.icon_prompt ? 'Indicaciones del admin: ' + v.icon_prompt + '.' : ''} Estilo: icono cuadrado centrado, símbolo mágico brillante y detallado sobre fondo NEGRO PURO (#000000), color dominante ${v.color || clanColor}, sin texto ni letras, apto para recortar como badge circular. Estilo dark fantasy, marcado, con brillo y aura del color dominante.`;
      const res = await base44.integrations.Core.GenerateImage({ prompt });
      if (res?.url) update('icon_url', res.url);
    } catch (err) {
      console.error(err);
      alert('No se pudo generar el icono: ' + (err?.message || 'error'));
    } finally {
      setGenIcon(false);
    }
  }

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: accent + '44', background: (variant === 'elite' ? '#1a0d2e' : '#0d2e1a') + '60' }}>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={enabled} onChange={toggle} className="w-5 h-5" style={{ accentColor: accent }} />
        <div>
          <span className="text-sm font-black" style={{ color: accentText }}>{variant === 'elite' ? 'Marcador pasiva ÉLITE' : 'Marcador pasiva NORMAL'}</span>
          <span className="block text-[11px] text-[#cfc6dd]">Badge sobre el héroe en batalla mientras la pasiva esté activa.</span>
        </div>
      </label>
      {enabled && (
        <div className="mt-3 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Flag del juego</span>
              <input className={inputCls} value={v.flag || ''} onChange={(e) => update('flag', e.target.value)} placeholder="_bfRefract" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Rótulo</span>
              <input className={inputCls} value={v.label || ''} onChange={(e) => update('label', e.target.value)} placeholder="Refracción" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Color</span>
              <input type="color" className="w-full h-10 rounded-xl border border-[#ffd24a33] bg-black/45 px-2 py-1 outline-none" value={v.color || '#c79bff'} onChange={(e) => update('color', e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Duración</span>
              <select className={inputCls} value={v.tipo || 'conditional'} onChange={(e) => update('tipo', e.target.value)}>
                <option value="conditional">Condicional · hasta que se dispara</option>
                <option value="permanent">Permanente · toda la partida</option>
              </select>
            </label>
          </div>
          <div className="block">
            <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Icono</span>
            <div className="flex flex-wrap items-center gap-2">
              {v.icon_url && (
                <div className="relative h-12 w-12 overflow-hidden rounded-full border-2" style={{ borderColor: v.color || '#c79bff', boxShadow: '0 0 12px ' + (v.color || '#c79bff') }}>
                  <img src={v.icon_url} alt="icono" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                {SUGGESTED_ICONS.map((ic) => (
                  <button key={ic} type="button" onClick={() => update('icon', ic)} className={`h-9 w-9 rounded-lg border text-lg leading-none transition ${v.icon === ic ? 'border-[#c79bff] bg-[#c79bff33]' : 'border-[#ffd24a33] bg-black/45 hover:border-[#ffd24a]'}`}>{ic}</button>
                ))}
              </div>
              {v.icon_url && (
                <button type="button" onClick={() => update('icon_url', '')} className="rounded-lg border border-[#ff8a5c55] px-2.5 py-1 text-[10px] font-black text-[#ffc9ab]">Quitar icono IA</button>
              )}
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Prompt para el icono (IA)</span>
            <div className="flex gap-2">
              <input className={inputCls} value={v.icon_prompt || ''} onChange={(e) => update('icon_prompt', e.target.value)} placeholder="ej: un escudo de cristal con runas arcanas" />
              <button type="button" onClick={generateIcon} disabled={genIcon || !card.name} className="shrink-0 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider disabled:opacity-40" style={{ border: '1.5px solid ' + accent, color: accentText, background: accent + '18' }}>
                {genIcon ? 'Generando…' : v.icon_url ? '↻ Regenerar' : '✨ Generar icono'}
              </button>
            </div>
            <span className="mt-1 block text-[10px] text-[#cfc6dd]">Genera un icono cuadrado adaptado a la habilidad. Se recorta como badge circular sobre el retrato.</span>
          </label>
        </div>
      )}
    </div>
  );
}