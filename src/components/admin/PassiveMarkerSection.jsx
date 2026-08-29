import React from 'react';

// Sección del editor de cartas para configurar el marcador de habilidad
// pasiva que se muestra sobre el héroe en batalla. Solo aplica a héroes y
// bizarros. El "flag" es el nombre del estado interno del juego (ej:
// _bfRefract para Juniana) que se activa al usar la habilidad pasiva.
//
// "tipo" distingue entre pasivas condicionales (el marcador se quita al
// dispararse la condición, p.ej. Doji Conpuri) y permanentes (activas toda
// la partida, p.ej. la refracción de Juniana).
const SUGGESTED_ICONS = ['✦', '⚠', '🛡️', '🧿', '☠', '🌟', '🌀', '🔮', '🩸', '❄', '⚡', '😇', '🥀', '🪦', '🧨', '♾️'];

export default function PassiveMarkerSection({ form, onChange }) {
  if (!['hero', 'bizarro'].includes(form.category)) return null;
  const pm = form.passive_marker || {};
  const enabled = !!(pm && pm.flag);

  const toggle = (e) => {
    if (e.target.checked) {
      onChange('passive_marker', {
        flag: '_bf' + (form.card_id || form.name || 'passive'),
        icon: '✦',
        color: '#c79bff',
        label: form.ability_name || 'Pasiva',
        tipo: 'conditional',
      });
    } else {
      onChange('passive_marker', null);
    }
  };

  const update = (field, value) => {
    onChange('passive_marker', { ...pm, [field]: value });
  };

  const inputCls = 'w-full rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]';

  return (
    <div className="rounded-xl border border-[#c79bff44] bg-[#1a0d2e]/60 p-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={enabled} onChange={toggle} className="w-5 h-5 accent-[#c79bff]" />
        <div>
          <span className="text-sm font-black text-[#e2b0ff]">Marcador de habilidad pasiva</span>
          <span className="block text-[11px] text-[#cfc6dd]">Muestra un badge sobre el héroe en batalla y en su panel de acción mientras la pasiva esté activa.</span>
        </div>
      </label>
      {enabled && (
        <div className="mt-3 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Flag del juego</span>
              <input className={inputCls} value={pm.flag || ''} onChange={(e) => update('flag', e.target.value)} placeholder="_bfRefract" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Etiqueta</span>
              <input className={inputCls} value={pm.label || ''} onChange={(e) => update('label', e.target.value)} placeholder="Refracción" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Color</span>
              <input type="color" className="w-full h-10 rounded-xl border border-[#ffd24a33] bg-black/45 px-2 py-1 outline-none" value={pm.color || '#c79bff'} onChange={(e) => update('color', e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Duración</span>
              <select className={inputCls} value={pm.tipo || 'conditional'} onChange={(e) => update('tipo', e.target.value)}>
                <option value="conditional">Condicional · hasta que se dispara</option>
                <option value="permanent">Permanente · toda la partida</option>
              </select>
            </label>
          </div>
          <div className="block">
            <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#ffe49a]">Icono</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {SUGGESTED_ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => update('icon', ic)} className={`h-8 w-8 rounded-lg border text-base leading-none transition ${pm.icon === ic ? 'border-[#c79bff] bg-[#c79bff33]' : 'border-[#ffd24a33] bg-black/45 hover:border-[#ffd24a]'}`}>{ic}</button>
              ))}
              <input className={`${inputCls} max-w-[7rem]`} value={pm.icon || ''} onChange={(e) => update('icon', e.target.value)} placeholder="✦" />
            </div>
            <span className="mt-1 block text-[10px] text-[#cfc6dd]">Elige un icono sugerido o escribe el tuyo (emoji o carácter).</span>
          </div>
        </div>
      )}
    </div>
  );
}