import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import HeroPickGrid from '@/components/admin/auction/HeroPickGrid';
import AuctionRules from '@/components/admin/auction/AuctionRules';
import AuctionDirectFilters from '@/components/admin/auction/AuctionDirectFilters';
import AuctionPhaseTypes from '@/components/admin/auction/AuctionPhaseTypes';

const emptyCfg = { active: false, mode: 'direct', hero_ids: [], phase_types: ['', '', ''], rules: [], note: '' };

export default function AdminAuctions() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [heroes, setHeroes] = useState([]);
  const [cfg, setCfg] = useState(emptyCfg);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setChecking(false)); }, []);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    base44.entities.Card.list('number', 300).then(list => {
      // Todos los héroes del set (incluidas las Épicas nuevas), sin importar
      // si tienen el rol CC/AD/HE bien puesto: así cualquier héroe que se añada
      // aparece siempre en el control de subastas.
      setHeroes((list || []).filter(c => c.category === 'hero' && c.clan !== 'Bizarros'));
    });
    base44.entities.AuctionConfig.list('-updated_date', 1).then(rows => {
      if (rows && rows.length) {
        setRecordId(rows[0].id);
        setCfg({ ...emptyCfg, ...rows[0], hero_ids: rows[0].hero_ids || [], phase_types: rows[0].phase_types || ['', '', ''], rules: rows[0].rules || [] });
      }
    }).catch(() => {});
  }, [user]);

  const upd = (patch) => { setCfg(prev => ({ ...prev, ...patch })); setSaved(false); };

  const matchCount = (r) => heroes.filter(h => {
    if (r.clan && (h.clan || '') !== r.clan) return false;
    if (r.type && (h.type || '') !== r.type) return false;
    const c = Number(h.cost || 0);
    if (r.cost_min !== '' && r.cost_min != null && c < Number(r.cost_min)) return false;
    if (r.cost_max !== '' && r.cost_max != null && c > Number(r.cost_max)) return false;
    return true;
  }).length;

  const summary = useMemo(() => {
    if (cfg.mode === 'direct') return `${(cfg.hero_ids || []).length} héroes garantizados en subasta (el resto, aleatorio)`;
    const inAny = heroes.filter(h => (cfg.rules || []).some(r => matchCount(r) && [h].every(() => true) && (!r.clan || r.clan === h.clan) && (!r.type || r.type === h.type) && (r.cost_min === '' || r.cost_min == null || Number(h.cost || 0) >= Number(r.cost_min)) && (r.cost_max === '' || r.cost_max == null || Number(h.cost || 0) <= Number(r.cost_max)) && (Number(r.percent) || 0) > 0));
    return `${inAny.length} héroes pueden salir con estos grupos`;
  }, [cfg, heroes]);

  async function save() {
    setSaving(true);
    const payload = {
      active: !!cfg.active,
      mode: cfg.mode,
      hero_ids: cfg.hero_ids || [],
      phase_types: cfg.phase_types || ['', '', ''],
      rules: (cfg.rules || []).map(r => ({
        label: r.label || '', clan: r.clan || '', type: r.type || '',
        ...(r.cost_min === '' || r.cost_min == null ? {} : { cost_min: Number(r.cost_min) }),
        ...(r.cost_max === '' || r.cost_max == null ? {} : { cost_max: Number(r.cost_max) }),
        percent: Number(r.percent) || 0,
      })),
      note: cfg.note || '',
    };
    if (recordId) await base44.entities.AuctionConfig.update(recordId, payload);
    else { const created = await base44.entities.AuctionConfig.create(payload); setRecordId(created.id); }
    setSaving(false);
    setSaved(true);
  }

  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando control de subastas…</div>;
  if (user?.role !== 'admin') return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Control de subastas</h1><p className="mt-4 text-[#cfc6dd]">Sólo para administradores.</p><Link to="/" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Volver al juego</Link></div>;

  return (
    <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-black text-[#fff5dc]">Control de subastas</h1>
            <p className="mt-1 text-sm text-[#cfc6dd]">En elección directa, los héroes que marques saldrán seguro en la subasta y el resto se sortea con normalidad. En probabilidades, mandan los porcentajes por raza, rol o coste.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a]">Cartas</Link>
            <Link to="/" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a]">Volver al juego</Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 shadow-2xl md:p-6">
          <label className="flex items-center gap-3 rounded-xl border border-[#ffd24a33] bg-black/45 p-3">
            <input type="checkbox" checked={!!cfg.active} onChange={e => upd({ active: e.target.checked })} className="h-5 w-5 accent-[#ffd24a]" />
            <span>
              <span className="block text-sm font-black text-[#ffe49a]">Control de subastas activo</span>
              <span className="block text-[11px] text-[#cfc6dd]">Si está desactivado, las subastas usan todos los héroes como siempre.</span>
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            {[['direct', '🎯 Elección directa'], ['weights', '🎲 Por probabilidades']].map(([m, l]) => (
              <button key={m} onClick={() => upd({ mode: m })} className={`rounded-xl border px-4 py-2 text-xs font-black ${cfg.mode === m ? 'border-[#ffd24a] bg-[#ffd24a] text-[#3a2600]' : 'border-[#ffd24a55] text-[#ffe49a]'}`}>{l}</button>
            ))}
            <span className="self-center text-[11px] text-[#9dffcf]">{summary}</span>
          </div>

          <AuctionPhaseTypes value={cfg.phase_types} onChange={phase_types => upd({ phase_types })} />

          {cfg.mode === 'direct'
            ? <>
              <AuctionDirectFilters heroes={heroes} onApply={(ids, on) => upd({ hero_ids: on ? [...new Set([...(cfg.hero_ids || []), ...ids])] : (cfg.hero_ids || []).filter(x => !ids.includes(x)) })} />
              <HeroPickGrid heroes={heroes} selected={cfg.hero_ids || []} onToggle={id => upd({ hero_ids: (cfg.hero_ids || []).includes(id) ? cfg.hero_ids.filter(x => x !== id) : [...(cfg.hero_ids || []), id] })} onBulk={(ids, on) => upd({ hero_ids: on ? [...new Set([...(cfg.hero_ids || []), ...ids])] : (cfg.hero_ids || []).filter(x => !ids.includes(x)) })} />
            </>
            : <AuctionRules rules={cfg.rules || []} onChange={rules => upd({ rules })} matchCount={matchCount} />}

          <textarea value={cfg.note || ''} onChange={e => upd({ note: e.target.value })} placeholder="Notas: para qué sirve esta configuración (ej. misión de héroes de coste menor a 20)" className="min-h-[70px] rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" />

          <button onClick={save} disabled={saving} className="rounded-2xl bg-[#ffd24a] px-5 py-3 font-heading font-black text-[#3a2600] disabled:opacity-50">
            {saving ? 'Guardando…' : saved ? '✓ Guardado — se aplica en la próxima partida' : 'Guardar configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}