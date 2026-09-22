import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Package, Swords, LoaderCircle, Copy, Check, Wifi } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MissionHero from '@/components/missions/MissionHero';
import { MP_MISSIONS, MP_MODALITIES, MP_EQUIP_COINS, MP_BUDGET, missionPool, drawPack, valueOf, isEpic } from '@/components/missions/missionRules';

export default function MissionMpLobby({ cards, nick, onBack, onStart }) {
  const [missionId, setMissionId] = useState('club');
  const [modality, setModality] = useState('pack');
  const [step, setStep] = useState('config');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [team, setTeam] = useState([]);
  const [pack, setPack] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [oppNick, setOppNick] = useState('');
  const [oppTeam, setOppTeam] = useState(null);
  const [myReady, setMyReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  const mission = MP_MISSIONS.find(m => m.id === missionId);
  const pool = missionPool(cards, missionId);
  const available = pool.filter(c => modality === 'pack' || !isEpic(c));
  const myTeam = modality === 'pack' ? (pack || []) : team;
  const total = valueOf(myTeam);
  const bothReady = myReady && oppTeam;

  useEffect(() => () => clearInterval(pollRef.current), []);

  async function createRoom() {
    setError('');
    try {
      const res = await base44.functions.invoke('missionMp', { action: 'mp_create', nick, mission: missionId, modality });
      if (res.data?.error) throw new Error(res.data.error);
      setRoomCode(res.data.code);
      setPassword(res.data.password);
      setRole('host');
      setStep('host_code');
      startPolling(res.data.code);
    } catch (e) { setError(e.message || 'No se pudo crear la sala.'); }
  }

  async function joinRoom() {
    setError('');
    const code = joinCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (code.length < 4) { setError('Introduce un código válido.'); return; }
    try {
      const res = await base44.functions.invoke('missionMp', { action: 'mp_join', code, nick });
      if (res.data?.error) throw new Error(res.data.error);
      setRoomCode(code);
      setPassword(res.data.password);
      setRole('guest');
      setMissionId(res.data.mission || missionId);
      setModality(res.data.modality || modality);
      setOppNick(res.data.host_nick || '');
      setStep('prepare');
      setNotice('Te has unido. Prepara tu ejército.');
      startPolling(code);
    } catch (e) { setError(e.message || 'No se pudo unir a la sala.'); }
  }

  function startPolling(code) {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await base44.functions.invoke('missionMp', { action: 'mp_poll', code });
        if (res.data?.error) return;
        const d = res.data;
        if (role === 'host' && d.guest_nick && !oppNick) { setOppNick(d.guest_nick); setStep('prepare'); setNotice('¡' + d.guest_nick + ' se ha unido! Prepara tu ejército.'); }
        if (role === 'guest' && d.host_nick && !oppNick) setOppNick(d.host_nick);
        if (role === 'guest' && d.host_ready && d.host_team) setOppTeam(d.host_team);
        if (role === 'host' && d.guest_ready && d.guest_team) setOppTeam(d.guest_team);
      } catch (e) {}
    }, 2000);
  }

  function toggle(card) { setError(''); setTeam(prev => prev.some(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : [...prev, card]); }
  function openPack() { try { setError(''); setPack(drawPack(pool, { pack: true, epics: 1 })); } catch (e) { setError(e.message); } }

  async function submitTeam() {
    if (myTeam.length !== 3) { setError('Necesitas 3 héroes.'); return; }
    if (modality === 'budget' && total > MP_BUDGET) { setError('Te pasas de ' + MP_BUDGET + ' monedas.'); return; }
    setError('');
    const heroIds = myTeam.map(c => c.engineId);
    try {
      await base44.functions.invoke('missionMp', { action: 'mp_set_team', code: roomCode, nick, role, team: heroIds });
      setMyReady(true);
      setNotice('¡Equipo enviado! Esperando al rival...');
    } catch (e) { setError(e.message || 'No se pudo enviar el equipo.'); }
  }

  function launchGame() {
    clearInterval(pollRef.current);
    onStart({ mission: missionId, modality, role, room_code: roomCode, password, nick, oppNick, myTeam: myTeam.map(c => c.engineId), oppTeam });
  }

  function copyCode() { navigator.clipboard?.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  if (pool.length < 3) return <section className="space-y-6">
    <button className="mission-link" onClick={onBack}><ArrowLeft size={16} /> Volver</button>
    <p role="alert">Esta misión necesita al menos tres héroes etiquetados y disponibles.</p>
  </section>;

  return <section className="mp-lobby space-y-6">
    <button className="mission-link" onClick={onBack}><ArrowLeft size={16} /> Volver</button>

    {step === 'config' && <>
      <div><p className="mission-eyebrow">MULTIJUGADOR</p><h2 className="font-heading text-3xl">Misión especial</h2><p className="mt-2 opacity-80">Elige clan y modalidad. Luego crea una sala o únete con un código.</p></div>
      <div className="mp-section"><h3 className="font-heading text-lg">Clan</h3><div className="mp-tabs">{MP_MISSIONS.map(m => <button key={m.id} className={m.id === missionId ? 'active' : ''} onClick={() => setMissionId(m.id)}><span>{m.name}</span><span>{m.description}</span></button>)}</div></div>
      <div className="mp-section"><h3 className="font-heading text-lg">Modalidad</h3><div className="mp-tabs">{MP_MODALITIES.map(mo => <button key={mo.id} className={mo.id === modality ? 'active' : ''} onClick={() => setModality(mo.id)}><span>{mo.name}</span><span>{mo.description}</span></button>)}</div></div>
      <div className="mission-budget"><span>Equipamiento: {MP_EQUIP_COINS} monedas por jugador</span><strong>{modality === 'pack' ? 'Sobre de 3 héroes' : MP_BUDGET + ' monedas para comprar 3 héroes'}</strong></div>
      <div className="mp-role"><button className="primary mission-button" onClick={createRoom}><Wifi size={18} /> Crear sala</button><button className="mission-button" onClick={() => setStep('guest_join')}><Wifi size={18} /> Unirse con código</button></div>
      {error && <p role="alert">{error}</p>}
    </>}

    {step === 'guest_join' && <>
      <div><p className="mission-eyebrow">UNIRSE A SALA</p><h2 className="font-heading text-3xl">Introduce el código</h2></div>
      <input className="mp-input" placeholder="CÓDIGO" value={joinCode} onChange={e => setJoinCode(e.target.value)} maxLength={6} />
      <div className="flex gap-3"><button className="mission-button primary" onClick={joinRoom}><Wifi size={18} /> Unirse</button><button className="mission-link" onClick={() => setStep('config')}><ArrowLeft size={16} /> Volver</button></div>
      {error && <p role="alert">{error}</p>}
    </>}

    {step === 'host_code' && <>
      <div><p className="mission-eyebrow">SALA CREADA · {mission.name} · {MP_MODALITIES.find(mo => mo.id === modality).name}</p><h2 className="font-heading text-3xl">Comparte este código</h2></div>
      <div className="mp-code-box"><code>{roomCode}</code><button onClick={copyCode}>{copied ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}</button></div>
      {!oppNick ? <div className="mp-waiting"><LoaderCircle className="animate-spin" /><p>Esperando a que se una un rival…</p></div> : <div className="mp-status ready">¡{oppNick} se ha unido!</div>}
      {error && <p role="alert">{error}</p>}
    </>}

    {(step === 'prepare' || step === 'host_code' && oppNick) && oppNick && <>
      {step === 'host_code' && setStep('prepare')}
      <div><p className="mission-eyebrow">{mission.name} · {MP_MODALITIES.find(mo => mo.id === modality).name} · MULTIJUGADOR</p><h2 className="font-heading text-3xl">Prepara tu ejército</h2><p className="mt-2 opacity-80">Rival: {oppNick}. Equipamiento: {MP_EQUIP_COINS} monedas.</p></div>
      <div className="mission-budget"><span>{modality === 'pack' ? 'Sobre de 3 héroes' : 'Héroes: ' + total + ' / ' + MP_BUDGET + ' monedas · ' + team.length + '/3 elegidos'}</span><strong>Equipamiento: {MP_EQUIP_COINS} monedas</strong></div>
      {modality === 'pack' && !pack ? <div className="mission-pack"><Package size={62} /><h3 className="font-heading text-2xl">Abre tu sobre</h3><p>Tres héroes de {mission.name}, sin repetidos. Hasta una épica.</p><button className="mission-button primary" onClick={openPack}>Abrir sobre</button></div>
        : <div className="mission-heroes">{(modality === 'pack' ? myTeam : available).map(card => <MissionHero key={card.id} card={card} selected={myTeam.some(c => c.id === card.id)} disabled={modality !== 'pack' && (!myTeam.some(c => c.id === card.id) && (team.length === 3 || total + Number(card.cost) > MP_BUDGET))} onSelect={modality === 'pack' ? undefined : () => toggle(card)} />)}</div>}
      {!myReady && myTeam.length === 3 && <button className="mission-button primary" onClick={submitTeam}><Swords size={18} /> Confirmar ejército</button>}
      {myReady && !oppTeam && <div className="mp-waiting"><LoaderCircle className="animate-spin" /><p>¡Equipo listo! Esperando al rival…</p></div>}
      {myReady && oppTeam && <div className="mp-opp-team space-y-4"><h3 className="font-heading text-xl">¡El rival está listo!</h3><p className="text-sm opacity-80">Tu rival ({oppNick}) ha confirmado su ejército. ¡A la batalla!</p><button className="mission-button primary" onClick={launchGame}><Swords size={18} /> Ir a equipamiento</button></div>}
      {notice && <p className="mission-notice" role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
    </>}

    {step === 'starting' && <div className="mp-waiting"><LoaderCircle className="animate-spin" /><p>Conectando partida multijugador…</p></div>}
  </section>;
}