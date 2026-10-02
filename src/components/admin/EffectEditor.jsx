import React from 'react';
import { SPELL_KINDS, OBJECT_KINDS, BONUS_TYPES, ELEMENTS, SPELL_ELEMENTS, validateEffect, defaultEffect } from '@/lib/equipmentEffects';

// Parámetros del MOTOR de una carta de equipo (Card.effect). La base de datos es la única fuente del juego: aquí
// se define cómo funciona la carta (tipo de efecto y números) y el juego la aplica sin tocar código.
const input = 'w-full rounded-lg border border-[#3c3158] bg-[#120a1e] px-2 py-1.5 text-sm text-[#efe9dc]';
const label = 'mb-1 block text-[11px] font-black uppercase tracking-wider text-[#cfc6dd]';

function Num({ name, value, onChange }) {
  return (
    <div><span className={label}>{name}</span>
      <input type="number" className={input} value={value ?? ''} onChange={(e) => onChange(name, e.target.value === '' ? '' : Number(e.target.value))} /></div>
  );
}

export default function EffectEditor({ category, value, onChange }) {
  const e = value && typeof value === 'object' ? value : null;
  const set = (k, v) => onChange({ ...(e || defaultEffect(category)), [k]: v });
  const check = e ? validateEffect(category, e) : { ok: false, errors: ['Faltan los parámetros del motor.'] };
  return (
    <div className="mt-5 rounded-2xl border border-[#66ffaa44] bg-[#0d1a14] p-4">
      <div className="mb-2 font-heading text-sm font-black text-[#9dffcf]">⚙️ Parámetros del motor</div>
      <p className="mb-3 text-[11px] text-[#cfc6dd]">Cómo funciona esta carta en el juego. Se guarda en la base de datos y el juego la usa tal cual.</p>
      {!e ? (
        <button type="button" onClick={() => onChange(defaultEffect(category))} className="rounded-xl border border-[#66ffaa66] px-3 py-1.5 text-xs font-black text-[#9dffcf]">Usar valores por defecto</button>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {category === 'ranged_weapon' ? <Num name="hits" value={e.hits} onChange={set} /> : null}
          {category === 'armor' ? (
            <>
              <Num name="redM" value={e.redM} onChange={set} /><Num name="redA" value={e.redA} onChange={set} />
              <Num name="redH" value={e.redH} onChange={set} /><Num name="regen" value={e.regen} onChange={set} />
              <div><span className={label}>element</span>
                <select className={input} value={e.element || ''} onChange={(ev) => set('element', ev.target.value || null)}>
                  <option value="">(ninguno)</option>{ELEMENTS.map((x) => <option key={x} value={x}>{x}</option>)}</select></div>
            </>
          ) : null}
          {category === 'spell' ? (
            <>
              <div className="col-span-2"><span className={label}>kind (tipo de efecto)</span>
                <select className={input} value={e.kind || ''} onChange={(ev) => set('kind', ev.target.value)}>
                  <option value="">(elige)</option>{Object.entries(SPELL_KINDS).map(([k, t]) => <option key={k} value={k}>{k} — {t}</option>)}</select></div>
              <Num name="base" value={e.base} onChange={set} />
              <div><span className={label}>element</span>
                <select className={input} value={e.element || ''} onChange={(ev) => set('element', ev.target.value)}>
                  <option value="">(ninguno)</option>{SPELL_ELEMENTS.map((x) => <option key={x} value={x}>{x}</option>)}</select></div>
            </>
          ) : null}
          {category === 'bonus' ? (
            <>
              <div className="col-span-2"><span className={label}>type (tipo de bonus)</span>
                <select className={input} value={e.type || ''} onChange={(ev) => set('type', ev.target.value)}>
                  <option value="">(elige)</option>{Object.entries(BONUS_TYPES).map(([k, t]) => <option key={k} value={k}>{k} — {t}</option>)}</select></div>
              <Num name="effect" value={e.effect} onChange={set} />
              <Num name="debt" value={e.debt} onChange={set} />
              <div><span className={label}>target (solo PERM)</span>
                <select className={input} value={e.target || ''} onChange={(ev) => set('target', ev.target.value || undefined)}>
                  <option value="">(ninguno)</option><option value="self">self (tú)</option><option value="rival">rival</option></select></div>
            </>
          ) : null}
          {category === 'object' ? (
            <>
              <div className="col-span-2"><span className={label}>kind (tipo de efecto)</span>
                <select className={input} value={e.kind || ''} onChange={(ev) => set('kind', ev.target.value)}>
                  <option value="">(elige)</option>{Object.entries(OBJECT_KINDS).map(([k, t]) => <option key={k} value={k}>{k} — {t}</option>)}</select></div>
              <Num name="val" value={e.val} onChange={set} />
            </>
          ) : null}
        </div>
      )}
      {e && !check.ok ? <div className="mt-2 text-[11px] text-[#ff8a5c]">{check.errors.join(' ')}</div> : null}
    </div>
  );
}
