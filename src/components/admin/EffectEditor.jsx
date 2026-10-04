import React, { useState } from 'react';
import { SPELL_KINDS, OBJECT_KINDS, BONUS_TYPES, ELEMENTS, SPELL_ELEMENTS, validateEffect, defaultEffect, stepsTemplate } from '@/lib/equipmentEffects';

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

// Cuadro de pasos (JSON) de un hechizo u objeto de tipo "bf_steps": el efecto se define aquí, sin código.
function StepsBox({ category, steps, onSteps }) {
  const [text, setText] = useState(JSON.stringify(steps && steps.length ? steps : stepsTemplate(category), null, 1));
  const [err, setErr] = useState('');
  return (
    <div className="col-span-2 md:col-span-4">
      <span className={label}>steps (pasos del efecto, JSON)</span>
      <textarea className={input + ' font-mono text-xs'} rows={7} value={text} spellCheck={false}
        onChange={(ev) => {
          setText(ev.target.value);
          try { const p = JSON.parse(ev.target.value); if (!Array.isArray(p)) throw new Error('debe ser una lista'); setErr(''); onSteps(p); } catch (x) { setErr('JSON no válido: ' + x.message); }
        }} />
      <p className="mt-1 text-[10px] text-[#cfc6dd]">Acciones: damage, heal, shield, buff, debuff, paralyze, silence, revive… Objetivos: enemy, all_enemies, ally, all_allies, self, other_enemy, dead_ally. En un hechizo, <b>magic_base</b> escala la cantidad con la Magia del lanzador.</p>
      {err ? <div className="text-[11px] text-[#ff8a5c]">{err}</div> : null}
    </div>
  );
}

export default function EffectEditor({ category, value, onChange }) {
  const e = value && typeof value === 'object' ? value : null;
  const set = (k, v) => onChange({ ...(e || defaultEffect(category)), [k]: v });
  // Al elegir "bf_steps" se rellena una plantilla de pasos para que el efecto sea válido desde el primer momento.
  const setKind = (k) => onChange({ ...(e || defaultEffect(category)), kind: k, ...(k === 'bf_steps' && !(e && e.steps) ? { steps: stepsTemplate(category) } : {}) });
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
          {category === 'ranged_weapon' || category === 'melee_weapon' ? (
            <>
              <Num name="spell_boost_pct" value={e.spell_boost_pct} onChange={set} />
              <Num name="weakness_bonus_pct" value={e.weakness_bonus_pct} onChange={set} />
              <Num name="toy_crit" value={e.toy_crit} onChange={set} />
              {category === 'melee_weapon' ? <><Num name="he_mult" value={e.he_mult} onChange={set} /><Num name="reach_pct" value={e.reach_pct} onChange={set} /></> : <Num name="shot_he" value={e.shot_he} onChange={set} />}
            </>
          ) : null}
          {category === 'armor' ? (
            <>
              <Num name="thorns" value={e.thorns} onChange={set} /><Num name="vel" value={e.vel} onChange={set} />
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
                <select className={input} value={e.kind || ''} onChange={(ev) => setKind(ev.target.value)}>
                  <option value="">(elige)</option>{Object.entries(SPELL_KINDS).map(([k, t]) => <option key={k} value={k}>{k} — {t}</option>)}</select></div>
              {e.kind !== 'bf_steps' ? <Num name="base" value={e.base} onChange={set} /> : null}
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
                <select className={input} value={e.kind || ''} onChange={(ev) => setKind(ev.target.value)}>
                  <option value="">(elige)</option>{Object.entries(OBJECT_KINDS).map(([k, t]) => <option key={k} value={k}>{k} — {t}</option>)}</select></div>
              {e.kind !== 'bf_steps' ? <Num name="val" value={e.val} onChange={set} /> : null}
            </>
          ) : null}
        </div>
      )}
      {e && e.kind === 'bf_steps' && (category === 'spell' || category === 'object') ? <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4"><StepsBox key={category + (e.kind || '')} category={category} steps={e.steps} onSteps={(p) => set('steps', p)} /></div> : null}
      {e && !check.ok ? <div className="mt-2 text-[11px] text-[#ff8a5c]">{check.errors.join(' ')}</div> : null}
    </div>
  );
}
