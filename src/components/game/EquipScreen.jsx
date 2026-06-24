import React, { useState } from 'react';
import { Coins, Hammer, ArrowRight, Wand2, Package, X, AlertTriangle } from 'lucide-react';
import { useGame } from '@/lib/game/GameContext';
import { SHOP_TABS, SPELLS, MELEE_WEAPONS, RANGED_WEAPONS, ARMORS, OBJECTS } from '@/lib/game/engine';
import EquipShopCard from '@/components/game/EquipShopCard';
import EquipHeroCard from '@/components/game/EquipHeroCard';
import QuickShopModal from '@/components/game/QuickShopModal';
import { equipArt } from '@/lib/game/equipArt';

const SHOP_DATA = { spell: SPELLS, melee: MELEE_WEAPONS, ranged: RANGED_WEAPONS, armor: ARMORS, object: OBJECTS };

// Avisos de equipamiento incompleto antes de batalla.
function equipWarnings(team) {
  const w = [];
  team.forEach((h) => {
    if (h.type === 'AD' && !h.rwep) w.push(`${h.name} (sin arma a distancia)`);
    else if (!h.mwep && !h.rwep) w.push(`${h.name} (sin arma)`);
    if (!h.armor) w.push(`${h.name} (sin armadura)`);
  });
  return w;
}

export default function EquipScreen() {
  const { game, eqBuySpell, eqBuyObject, eqRemoveSpell, eqRemoveItem, eqAssign, eqUnequip, eqSetShop, eqFinish } = useGame();
  const [quick, setQuick] = useState(null); // { heroId, slot }
  const [warn, setWarn] = useState(null);

  if (!game) return null;
  const side = 'p';
  const tab = game.eqShop;
  const coins = game.equipCoins[side];
  const team = game.team[side];

  const handleBuy = (id) => { if (tab === 'spell') eqBuySpell(side, id); else if (tab === 'object') eqBuyObject(side, id); };
  const openQuick = (heroId, slot) => setQuick({ heroId, slot });
  const handlePick = (kind, id) => { eqAssign(side, quick.heroId, kind, id); setQuick(null); };

  const goBattle = () => {
    const w = equipWarnings(team);
    if (w.length) { setWarn(w); return; }
    eqFinish();
  };

  const isShopGrid = tab === 'spell' || tab === 'object';
  const shopList = SHOP_DATA[tab] || [];

  return (
    <div className="min-h-screen px-4 py-5" style={{ background: 'linear-gradient(180deg,#0d0a14,#0a0810)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 font-heading font-black text-xl text-[#FFD24A]"><Hammer size={22} /> Equipamiento</div>
          <span className="text-sm text-[#a89fbb]">Equipa a tus 3 héroes con arma y armadura. Compra hechizos y objetos para tu mano.</span>
          <div className="ml-auto flex items-center gap-2 bg-[#1a1430] border border-[#3c3158] rounded-full px-4 py-1.5">
            <Coins size={16} className="text-[#FFD24A]" /><span className="font-black text-[#FFD24A]">{coins}</span><span className="text-xs text-[#a89fbb]">monedas</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-4">
          {/* Tienda */}
          <div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SHOP_TABS.map(([key, label]) => (
                <button key={key} onClick={() => eqSetShop(key)} className={`px-3 py-1.5 rounded-lg text-xs font-black border transition ${tab === key ? 'bg-[#FFD24A] text-[#2a1d05] border-[#FFD24A]' : 'bg-[#15101f] text-[#a89fbb] border-[#3c3158] hover:text-white'}`}>{label}</button>
              ))}
            </div>

            {isShopGrid ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {shopList.map((it) => <EquipShopCard key={it.id} item={it} kind={tab} affordable={it.cost <= coins} onBuy={handleBuy} />)}
              </div>
            ) : (
              <div className="bg-[#15101f] border border-[#3c3158] rounded-xl p-3 text-sm text-[#a89fbb]">
                Las armas y armaduras se compran directamente sobre cada héroe. Usa el botón <b className="text-[#ffe49a]">Comprar</b> en el panel de la derecha, o desde aquí pulsa un héroe.
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                  {shopList.map((it) => (
                    <div key={it.id} className="relative rounded-xl overflow-hidden border border-[#3c3158] bg-[#07050b]" style={{ minHeight: 130, paddingTop: 96 }}>
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${equipArt(it.id)}")` }} />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,0) 30%,rgba(0,0,0,.85) 70%)' }} />
                      <div className="absolute top-1.5 left-1.5 z-10 text-[10px] font-black text-[#FFD24A] bg-black/60 rounded-full px-2 py-0.5">{it.cost}🪙</div>
                      <div className="relative z-10 p-2"><div className="font-heading font-black text-[#fff5dc] text-[12px] leading-tight">{it.name}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mano: hechizos y objetos comprados */}
            <div className="mt-4 bg-[#15101f] border border-[#3c3158] rounded-xl p-3">
              <div className="text-xs font-black text-[#a89fbb] mb-2">TU MANO</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#c79bff] mb-1.5"><Wand2 size={13} /> Hechizos ({game.spellbook[side].length})</div>
                  {game.spellbook[side].length ? (
                    <div className="flex flex-col gap-1">
                      {game.spellbook[side].map((id, i) => {
                        const s = SPELLS.find((x) => x.id === id);
                        return (
                          <div key={i} className="flex items-center gap-2 bg-[#1a1430] border border-[#3c3158] rounded-lg px-2 py-1">
                            <div className="w-7 h-7 rounded bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${equipArt(id)}")` }} />
                            <span className="text-[11px] font-bold text-white flex-1 truncate">{s?.name}</span>
                            <button onClick={() => eqRemoveSpell(side, i)} className="text-[#a89fbb] hover:text-[#ff7a7a]"><X size={13} /></button>
                          </div>
                        );
                      })}
                    </div>
                  ) : <div className="text-[11px] text-[#564b6e]">Sin hechizos.</div>}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7fd4ff] mb-1.5"><Package size={13} /> Objetos ({game.items[side].length})</div>
                  {game.items[side].length ? (
                    <div className="flex flex-col gap-1">
                      {game.items[side].map((o, i) => (
                        <div key={i} className="flex items-center gap-2 bg-[#1a1430] border border-[#3c3158] rounded-lg px-2 py-1">
                          <div className="w-7 h-7 rounded bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${equipArt(o.id)}")` }} />
                          <span className="text-[11px] font-bold text-white flex-1 truncate">{o.name}</span>
                          <button onClick={() => eqRemoveItem(side, i)} className="text-[#a89fbb] hover:text-[#ff7a7a]"><X size={13} /></button>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-[11px] text-[#564b6e]">Sin objetos.</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Equipo */}
          <div className="flex flex-col gap-3">
            {team.map((h) => (
              <EquipHeroCard
                key={h.id}
                hero={h}
                onClear={(slot) => eqUnequip(side, h.id, slot)}
                onBuyWeapon={() => openQuick(h.id, 'weapon')}
                onBuyArmor={() => openQuick(h.id, 'armor')}
              />
            ))}
            <button onClick={goBattle} className="w-full flex items-center justify-center gap-2 mt-1 px-6 py-3.5 rounded-2xl font-heading font-black text-[#2a1d05]" style={{ background: 'linear-gradient(180deg,#ffe49a,#FFD24A 55%,#d8a431)' }}>
              ¡A la batalla! <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {quick && (
        <QuickShopModal
          hero={team.find((h) => h.id === quick.heroId)}
          slot={quick.slot}
          coins={coins}
          onPick={handlePick}
          onClose={() => setQuick(null)}
        />
      )}

      {warn && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setWarn(null)}>
          <div className="w-full max-w-sm rounded-2xl border-2 border-[#FFD24A66] bg-[#120d22] p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <AlertTriangle size={32} className="mx-auto text-[#FFD24A]" />
            <div className="font-heading font-black text-white text-lg mt-2">Equipamiento incompleto</div>
            <div className="text-sm text-[#cbbfe0] mt-2">Hay héroes sin equipamiento completo:</div>
            <div className="text-[12px] text-[#ffaa66] mt-2 leading-relaxed">{warn.map((w, i) => <div key={i}>{w}</div>)}</div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setWarn(null)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-[#efe9dc] bg-white/5 border border-white/15">Volver a equipar</button>
              <button onClick={() => { setWarn(null); eqFinish(); }} className="flex-1 px-4 py-2.5 rounded-xl font-heading font-black text-[#2a1d05]" style={{ background: 'linear-gradient(180deg,#ffe49a,#FFD24A 55%,#d8a431)' }}>Entrar igual</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}