import React, { useState } from 'react';
import { Swords, Crosshair, Sparkles, Star, Backpack, Shield, X } from 'lucide-react';
import { battleStat, spellbookOf, itemsOf } from '@/lib/game/combat';

const HE_REF = 18, AD_REF = 18;

// Menú de acción del héroe activo del jugador.
export default function BattleActionMenu({ B, hero, onAct }) {
  const [sub, setSub] = useState(null); // 'spell' | 'item'

  const hasRanged = !!hero.rwep;
  const hasSpell = (B.g.spellbook.p || []).length > 0 && hero.silence <= 0;
  const hasItem = (B.g.items.p || []).length > 0;
  const canAb = !hero.abilityUsed && hero.silence <= 0;
  const meleeDmg = battleStat(hero, 'cc');
  const rDmg = hasRanged ? Math.round(hero.rwep.power * battleStat(hero, 'ad') / AD_REF) : 0;

  if (sub === 'spell') {
    const spells = spellbookOf(B, 'p');
    return (
      <Panel title="🔮 Lanzar hechizo" subtitle={`Maná ${hero.mana}/${hero.maxMana}`} onBack={() => setSub(null)}>
        {spells.length ? spells.map((s, i) => {
          const ok = hero.mana >= s.mana;
          return (
            <Row key={i} disabled={!ok} onClick={() => { onAct('castSpell', s.id); setSub(null); }}
              title={<>{s.name} <span className="text-[9px] uppercase text-[#c79bff]">{s.element}</span></>}
              meta={`Maná ${s.mana} · ${s.txt}`} />
          );
        }) : <div className="text-xs text-[#564b6e] p-2">Sin hechizos en tu mano.</div>}
      </Panel>
    );
  }
  if (sub === 'item') {
    const items = itemsOf(B, 'p');
    return (
      <Panel title="🎒 Usar objeto" onBack={() => setSub(null)}>
        {items.length ? items.map((o, i) => (
          <Row key={i} onClick={() => { onAct('useItem', i); setSub(null); }} title={o.name} meta={o.txt} />
        )) : <div className="text-xs text-[#564b6e] p-2">Sin objetos.</div>}
      </Panel>
    );
  }

  const Btn = ({ icon: Icon, label, hint, enabled, onClick, color }) => (
    <button onClick={enabled ? onClick : undefined} disabled={!enabled}
      className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 transition ${enabled ? 'bg-[#1a1430] border-[#3c3158] hover:border-[#FFD24A] cursor-pointer' : 'bg-[#120d1d] border-[#241c38] opacity-40 cursor-not-allowed'}`}>
      <Icon size={20} style={{ color: enabled ? color : '#564b6e' }} />
      <span className="text-[11px] font-black text-white leading-none">{label}</span>
      {hint && <span className="text-[9px] text-[#a89fbb]">{hint}</span>}
    </button>
  );

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      <Btn icon={Swords} label="Cuerpo a cuerpo" hint={`${meleeDmg} dmg`} enabled color="#ff6b6b" onClick={() => onAct('melee')} />
      <Btn icon={Crosshair} label={hasRanged ? 'A distancia' : 'Sin arma'} hint={hasRanged ? `~${rDmg}` : '—'} enabled={hasRanged} color="#54e876" onClick={() => onAct('ranged')} />
      <Btn icon={Sparkles} label="Hechizo" hint={hasSpell ? `×${(battleStat(hero, 'he') / HE_REF).toFixed(1)}` : '—'} enabled={hasSpell} color="#b06cff" onClick={() => setSub('spell')} />
      <Btn icon={Star} label={hero.eliteMode ? hero.eAbility : hero.ability} hint={canAb ? '1×' : 'usada'} enabled={canAb} color="#FFD24A" onClick={() => onAct('ability')} />
      <Btn icon={Backpack} label="Objeto" hint={hasItem ? '' : 'vacío'} enabled={hasItem} color="#7fd4ff" onClick={() => setSub('item')} />
      <Btn icon={Shield} label="Defender" hint="½ daño" enabled color="#cbbfe0" onClick={() => onAct('defend')} />
    </div>
  );
}

function Panel({ title, subtitle, onBack, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-heading font-black text-[#FFD24A] text-sm">{title} {subtitle && <span className="text-[11px] text-[#a89fbb] font-normal">· {subtitle}</span>}</div>
        <button onClick={onBack} className="text-[#a89fbb] hover:text-white flex items-center gap-1 text-xs"><X size={14} /> Volver</button>
      </div>
      <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto no-scrollbar">{children}</div>
    </div>
  );
}
function Row({ title, meta, disabled, onClick }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      className={`text-left rounded-lg border px-3 py-2 ${disabled ? 'bg-[#120d1d] border-[#241c38] opacity-45 cursor-not-allowed' : 'bg-[#1a1430] border-[#3c3158] hover:border-[#FFD24A] cursor-pointer'}`}>
      <div className="text-[12px] font-black text-white">{title}</div>
      <div className="text-[10px] text-[#a89fbb] leading-snug">{meta}</div>
    </button>
  );
}