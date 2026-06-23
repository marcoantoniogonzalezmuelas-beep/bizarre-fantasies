import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { HEROES, SPELLS, MELEE_WEAPONS, RANGED_WEAPONS, ARMORS, OBJECTS } from '@/lib/cardData';
import HeroToken from './HeroToken';

const TYPES = ['CC', 'AD', 'HE'];
const START_COINS = 60;
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const roomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();

function makeHero(hero) {
  return { ...hero, maxHp: hero.hp, hpNow: hero.hp, weapon: null, armor: null, spell: null, object: null, alive: true };
}

function newGame(mode = 'ai') {
  const type = TYPES[0];
  return {
    mode,
    phase: mode === 'online' ? 'lobby' : 'auction',
    step: 0,
    coins: { p1: START_COINS, p2: START_COINS },
    teams: { p1: [], p2: [] },
    auction: { type, candidates: shuffle(HEROES.filter(h => h.type === type)).slice(0, 4), choices: { p1: null, p2: null }, log: [] },
    equipDone: { p1: false, p2: false },
    battle: null,
    winner: null,
    log: ['Bienvenido a Bizarre Fantasies. Recluta, equipa y derrota a los 3 héroes rivales.']
  };
}

function nextAuction(game) {
  const step = game.step + 1;
  if (step >= TYPES.length) return { ...game, phase: 'equip', step, auction: null, log: ['Subasta completada. Ahora equipa a tus héroes.', ...game.log] };
  const type = TYPES[step];
  return { ...game, step, auction: { type, candidates: shuffle(HEROES.filter(h => h.type === type)).slice(0, 4), choices: { p1: null, p2: null }, log: [] } };
}

function resolveAuction(game) {
  const { candidates, choices, type } = game.auction;
  const p1 = choices.p1;
  let p2 = choices.p2;
  if (game.mode === 'ai' && !p2) p2 = { heroId: rnd(candidates).id, bid: Math.min(game.coins.p2, 8 + Math.floor(Math.random() * 18)) };
  if (!p1 || !p2) return game;
  const h1 = candidates.find(h => h.id === p1.heroId) || candidates[0];
  const h2Picked = candidates.find(h => h.id === p2.heroId) || candidates[1] || candidates[0];
  const same = h1.id === h2Picked.id;
  const p1WinsSame = !same || p1.bid >= p2.bid;
  const p2WinsSame = !same || p2.bid > p1.bid;
  const fallbackForP2 = candidates.find(h => h.id !== h1.id) || h2Picked;
  const fallbackForP1 = candidates.find(h => h.id !== h2Picked.id) || h1;
  const gain1 = same ? (p1WinsSame ? h1 : fallbackForP1) : h1;
  const gain2 = same ? (p2WinsSame ? h2Picked : fallbackForP2) : h2Picked;
  const logLine = same
    ? `${type}: ambos querían a ${h1.name}. ${p1WinsSame ? 'Jugador 1' : 'Jugador 2'} gana la puja principal.`
    : `${type}: Jugador 1 recluta a ${h1.name}; Jugador 2 recluta a ${h2Picked.name}.`;

  return nextAuction({
    ...game,
    coins: { p1: Math.max(0, game.coins.p1 - p1.bid), p2: Math.max(0, game.coins.p2 - p2.bid) },
    teams: { p1: [...game.teams.p1, makeHero(gain1)], p2: [...game.teams.p2, makeHero(gain2)] },
    log: [logLine, ...game.log]
  });
}

function autoEquipTeam(team) {
  return team.map(h => {
    const weapon = h.type === 'CC' ? rnd(MELEE_WEAPONS) : h.type === 'AD' ? rnd(RANGED_WEAPONS) : null;
    const spell = h.type === 'HE' ? rnd(SPELLS) : null;
    const armor = rnd(ARMORS);
    return { ...h, weapon, spell, armor, object: rnd(OBJECTS), maxHp: h.hp + (armor?.hp || 0), hpNow: h.hp + (armor?.hp || 0) };
  });
}

function startBattle(game) {
  const p1Team = autoEquipTeam(game.teams.p1);
  const p2Team = game.mode === 'local' || game.mode === 'online' ? game.teams.p2 : autoEquipTeam(game.teams.p2);
  return { ...game, phase: 'battle', teams: { p1: p1Team, p2: p2Team }, battle: { turn: 'p1', selected: 0 }, log: ['¡Empieza el combate!', ...game.log] };
}

function aliveIndex(team) { return team.findIndex(h => (h.hpNow ?? 0) > 0); }
function sideName(side) { return side === 'p1' ? 'Jugador 1' : 'Jugador 2'; }

function calcDamage(hero, action) {
  if (action === 'CC') return Math.max(2, hero.cc + (hero.weapon?.cc || 0));
  if (action === 'AD') return Math.max(2, Math.round(hero.ad + ((hero.weapon?.power || 0) * hero.ad / 18)));
  if (action === 'HE') return Math.max(2, hero.he + Math.round((hero.spell?.mana || 0) / 2));
  return Math.max(4, Math.round(Math.max(hero.cc, hero.ad, hero.he) * 1.25));
}

function doAttack(game, side, action) {
  const enemy = side === 'p1' ? 'p2' : 'p1';
  const attackerIndex = aliveIndex(game.teams[side]);
  const targetIndex = aliveIndex(game.teams[enemy]);
  if (attackerIndex < 0 || targetIndex < 0) return game;
  const attacker = game.teams[side][attackerIndex];
  const target = game.teams[enemy][targetIndex];
  const raw = calcDamage(attacker, action);
  const block = target.armor ? Math.min(8, Math.round((target.armor.hp || 0) / 3)) : 0;
  const dmg = Math.max(1, raw - block);
  const nextTeams = JSON.parse(JSON.stringify(game.teams));
  nextTeams[enemy][targetIndex].hpNow = Math.max(0, target.hpNow - dmg);
  nextTeams[enemy][targetIndex].alive = nextTeams[enemy][targetIndex].hpNow > 0;
  const defeated = nextTeams[enemy][targetIndex].hpNow <= 0;
  const winner = aliveIndex(nextTeams[enemy]) < 0 ? side : null;
  return {
    ...game,
    teams: nextTeams,
    winner,
    phase: winner ? 'result' : 'battle',
    battle: { ...game.battle, turn: enemy },
    log: [`${sideName(side)}: ${attacker.name} usa ${action} contra ${target.name} y causa ${dmg} daño.${defeated ? ' ¡Cae derrotado!' : ''}`, ...game.log]
  };
}

function useOnlineRoom(room, setRoom, setGame, localSide) {
  useEffect(() => {
    if (!room?.id) return;
    const unsub = base44.entities.GameRoom.subscribe((event) => {
      if (event?.id === room.id || event?.data?.id === room.id) {
        const data = event.data;
        setRoom(data);
        if (data?.state) setGame(data.state);
      }
    });
    return unsub;
  }, [room?.id, setGame, setRoom, localSide]);
}

export default function GameShell() {
  const [game, setGame] = useState(newGame('ai'));
  const [screen, setScreen] = useState('title');
  const [name, setName] = useState('Jugador');
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState(null);
  const [localSide, setLocalSide] = useState('p1');
  const [bid, setBid] = useState(10);
  const [selectedHero, setSelectedHero] = useState(null);
  const [busy, setBusy] = useState(false);

  useOnlineRoom(room, setRoom, setGame, localSide);

  const currentSide = game.mode === 'local' ? (game.teams.p1.length <= game.teams.p2.length ? 'p1' : 'p2') : localSide;
  const canAct = game.mode !== 'online' || game.battle?.turn === localSide || game.phase !== 'battle';

  const sync = async (next) => {
    setGame(next);
    if (room?.id) await base44.entities.GameRoom.update(room.id, { state: next, status: next.phase === 'result' ? 'finished' : 'playing' });
  };

  const begin = (mode) => {
    const next = newGame(mode);
    setGame(next);
    setScreen('game');
    setLocalSide('p1');
  };

  const createRoom = async () => {
    setBusy(true);
    const state = newGame('online');
    const rec = await base44.entities.GameRoom.create({ room_code: roomCode(), status: 'waiting', host_name: name, state });
    setRoom(rec); setGame(state); setLocalSide('p1'); setScreen('game'); setBusy(false);
  };

  const joinRoom = async () => {
    setBusy(true);
    const found = await base44.entities.GameRoom.filter({ room_code: joinCode.toUpperCase() }, '-created_date', 1);
    if (found[0]) {
      const next = { ...found[0].state, phase: 'auction', mode: 'online', log: [`${name} se ha unido a la sala.`, ...found[0].state.log] };
      const updated = await base44.entities.GameRoom.update(found[0].id, { guest_name: name, status: 'playing', state: next });
      setRoom(updated); setGame(next); setLocalSide('p2'); setScreen('game');
    }
    setBusy(false);
  };

  const submitBid = async () => {
    if (!selectedHero) return;
    const side = game.mode === 'ai' ? 'p1' : currentSide;
    let next = { ...game, auction: { ...game.auction, choices: { ...game.auction.choices, [side]: { heroId: selectedHero.id, bid: Number(bid) } } } };
    if (game.mode === 'ai' || (next.auction.choices.p1 && next.auction.choices.p2)) next = resolveAuction(next);
    await sync(next);
    setSelectedHero(null); setBid(10);
  };

  const finishEquip = async () => {
    let next = { ...game, equipDone: { ...game.equipDone, [localSide]: true } };
    if (game.mode !== 'online' || next.equipDone.p1 && next.equipDone.p2) next = startBattle(next);
    await sync(next);
  };

  const attack = async (action) => {
    if (!canAct || game.phase !== 'battle') return;
    let next = doAttack(game, game.battle.turn, action);
    if (game.mode === 'ai' && next.phase === 'battle' && next.battle.turn === 'p2') {
      setTimeout(() => sync(doAttack(next, 'p2', rnd(['CC', 'AD', 'HE', 'HAB']))), 500);
    }
    await sync(next);
  };

  if (screen === 'title') return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(1000px 560px at 50% -10%, #2a2046, transparent 60%), linear-gradient(180deg,#15101f,#0e0a16)' }}>
      <div className="max-w-4xl w-full text-center">
        <div className="text-6xl mb-2">⚔️🏹🔮</div>
        <h1 className="font-heading font-extrabold text-5xl md:text-7xl tracking-wider" style={{ background: 'linear-gradient(180deg,#fff3c8,#FFD24A 55%,#b8902a)', WebkitBackgroundClip: 'text', color: 'transparent' }}>BIZARRE FANTASIES</h1>
        <p className="font-heading text-[#ffcf57] tracking-[8px] mt-2">EDICIÓN V5</p>
        <div className="mt-10 grid md:grid-cols-3 gap-3">
          <button onClick={() => begin('ai')} className="rounded-xl bg-[#FFD24A] text-[#2a1d05] font-black px-6 py-4 shadow-[0_4px_0_#8a6a18]">Jugar contra IA</button>
          <button onClick={() => begin('local')} className="rounded-xl bg-[#2b2244] border border-[#3c3158] text-[#efe9dc] font-bold px-6 py-4">Humano local</button>
          <button onClick={() => setScreen('online')} className="rounded-xl bg-[#2b2244] border border-[#3c3158] text-[#efe9dc] font-bold px-6 py-4">Multiplayer real</button>
        </div>
        <div className="mt-5 flex justify-center gap-2 flex-wrap">
          <Link to="/cards" className="rounded-lg bg-[#221a36] border border-[#3c3158] px-4 py-2 text-sm text-[#efe9dc]">📚 Base de datos secundaria</Link>
          <Link to="/races" className="rounded-lg bg-[#221a36] border border-[#3c3158] px-4 py-2 text-sm text-[#efe9dc]">🧬 Razas</Link>
        </div>
        <p className="mt-8 text-[#a89fbb] max-w-2xl mx-auto">Subasta 3 héroes, equípalos y pelea por turnos. El modo online crea una sala compartida sincronizada en tiempo real.</p>
      </div>
    </div>
  );

  if (screen === 'online') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0e0a16]">
      <div className="w-full max-w-md rounded-2xl border border-[#3c3158] bg-[#221a36] p-5">
        <h2 className="font-heading text-2xl text-[#FFD24A] mb-4">Multiplayer real</h2>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full mb-3 rounded-lg bg-[#120e1c] border border-[#3c3158] px-3 py-3 text-[#efe9dc]" placeholder="Tu nombre" />
        <button disabled={busy} onClick={createRoom} className="w-full rounded-xl bg-[#FFD24A] text-[#2a1d05] font-black py-3 mb-4">Crear sala</button>
        <div className="flex gap-2">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} className="flex-1 rounded-lg bg-[#120e1c] border border-[#3c3158] px-3 py-3 text-[#efe9dc]" placeholder="Código" />
          <button disabled={busy || !joinCode} onClick={joinRoom} className="rounded-lg bg-[#2b2244] border border-[#3c3158] px-4 font-bold">Unirse</button>
        </div>
        <button onClick={() => setScreen('title')} className="mt-4 text-sm text-[#a89fbb]">Volver</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(180deg,#15101f,#0e0a16)', color: '#efe9dc' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button onClick={() => { setScreen('title'); setRoom(null); }} className="rounded-lg bg-[#221a36] border border-[#3c3158] px-3 py-2">⌂ Salir</button>
          <div className="font-heading text-[#FFD24A] text-xl">BIZARRE FANTASIES</div>
          {room && <div className="rounded-lg bg-[#120e1c] border border-[#FFD24A] px-3 py-2 text-sm">Sala: <b>{room.room_code}</b></div>}
        </div>

        {game.phase === 'lobby' && <Panel title="Sala creada"><p>Código de sala: <b className="text-[#FFD24A] text-2xl">{room?.room_code}</b></p><p className="text-[#a89fbb] mt-2">Espera a que otro jugador se una para empezar la subasta.</p></Panel>}

        {game.phase === 'auction' && game.auction && (
          <Panel title={`Subasta · Recluta un héroe ${game.auction.type}`} right={`Monedas J1 ${game.coins.p1} · J2 ${game.coins.p2}`}>
            {game.mode === 'online' && game.auction.choices[localSide] && <p className="mb-3 text-[#ffcf57]">Puja enviada. Esperando al rival…</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {game.auction.candidates.map(h => <HeroToken key={h.id} hero={h} selected={selectedHero?.id === h.id} onClick={() => setSelectedHero(h)} />)}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <label className="text-sm text-[#a89fbb]">Puja secreta</label>
              <input type="range" min="0" max={game.coins[game.mode === 'ai' ? 'p1' : currentSide]} value={bid} onChange={e => setBid(e.target.value)} />
              <b className="text-[#FFD24A]">{bid}</b>
              <button onClick={submitBid} disabled={!selectedHero || (game.mode === 'online' && game.auction.choices[localSide])} className="rounded-xl bg-[#FFD24A] text-[#2a1d05] font-black px-5 py-2 disabled:opacity-40">Confirmar puja</button>
            </div>
          </Panel>
        )}

        {game.phase === 'equip' && (
          <Panel title="Equipamiento" right="Armas, armaduras, hechizos y objetos se asignan al entrar en combate">
            <div className="grid md:grid-cols-2 gap-5">
              <Team title="Jugador 1" team={game.teams.p1} />
              <Team title="Jugador 2" team={game.teams.p2} />
            </div>
            <button onClick={finishEquip} className="mt-5 rounded-xl bg-[#FFD24A] text-[#2a1d05] font-black px-6 py-3">Listo para combatir</button>
          </Panel>
        )}

        {game.phase === 'battle' && (
          <Panel title={`Combate · turno de ${sideName(game.battle.turn)}`} right={canAct ? 'Elige acción' : 'Esperando al rival'}>
            <div className="grid md:grid-cols-2 gap-5">
              <Team title="Jugador 1" team={game.teams.p1} battle />
              <Team title="Jugador 2" team={game.teams.p2} battle />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {['CC', 'AD', 'HE', 'HAB'].map(a => <button key={a} onClick={() => attack(a)} disabled={!canAct} className="rounded-xl bg-[#2b2244] border border-[#3c3158] px-5 py-3 font-black disabled:opacity-40 hover:border-[#FFD24A]">{a === 'HAB' ? 'Habilidad' : a}</button>)}
            </div>
          </Panel>
        )}

        {game.phase === 'result' && (
          <Panel title="Resultado"><div className="text-4xl font-heading text-[#FFD24A]">Gana {sideName(game.winner)}</div><button onClick={() => begin(game.mode)} className="mt-5 rounded-xl bg-[#FFD24A] text-[#2a1d05] font-black px-6 py-3">Nueva partida</button></Panel>
        )}

        <Panel title="Registro de partida"><div className="space-y-1 max-h-44 overflow-auto">{game.log.map((l, i) => <div key={i} className="text-sm text-[#cfc6df]">{l}</div>)}</div></Panel>
      </div>
    </div>
  );
}

function Panel({ title, right, children }) {
  return <section className="rounded-2xl border border-[#3c3158] bg-[#1a1430]/90 p-4 mb-4"><div className="flex justify-between gap-3 mb-4"><h2 className="font-heading text-2xl text-[#FFD24A]">{title}</h2>{right && <span className="text-sm text-[#a89fbb]">{right}</span>}</div>{children}</section>;
}

function Team({ title, team, battle }) {
  return <div><h3 className="font-bold text-[#ffcf57] mb-2">{title}</h3><div className="grid grid-cols-3 gap-2">{team.map((h, i) => <div key={`${h.id}-${i}`} className={(battle && (h.hpNow ?? 0) <= 0) ? 'opacity-35 grayscale' : ''}><HeroToken hero={h} compact={!battle} /></div>)}</div></div>;
}