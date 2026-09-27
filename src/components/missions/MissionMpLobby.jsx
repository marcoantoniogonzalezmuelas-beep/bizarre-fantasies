import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Swords, LoaderCircle, Wifi } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MissionHero from '@/components/missions/MissionHero';
import MissionCardGrid from '@/components/missions/MissionCardGrid';
import MissionRoomSeats from '@/components/missions/MissionRoomSeats';
import MissionRoomDirectory from '@/components/missions/MissionRoomDirectory';
import MissionRoomOptions from '@/components/missions/MissionRoomOptions';
import MissionMpPacks from '@/components/missions/MissionMpPacks';
import useMissionRoomPoll from '@/components/missions/useMissionRoomPoll';
import { MP_MISSIONS, MP_MODALITIES, MP_EQUIP_COINS, MP_BUDGET, missionPool, valueOf, isEpic } from '@/components/missions/missionRules';

export default function MissionMpLobby({ cards, nick, onBack, onStart, starting, replay }) {
  const [missionId, setMissionId] = useState(replay?.mission || 'club');
  const [modality, setModality] = useState(replay?.modality || 'pack');
  const [step, setStep] = useState(replay ? 'prepare' : 'config');
  const [roomCode, setRoomCode] = useState(replay?.room_code || '');
  const [password, setPassword] = useState(replay?.password || '');
  const [isPrivate, setPrivate] = useState(false);
  const [roomPassword, setRoomPassword] = useState('');
  const [role, setRole] = useState('');
  const [team, setTeam] = useState([]);
  const [pack, setPack] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [oppNick, setOppNick] = useState(replay?.oppNick || '');
  const [oppTeam, setOppTeam] = useState(null);
  const [myReady, setMyReady] = useState(false);
  const [token, setToken] = useState(replay?.token || ''), [busy, setBusy] = useState(false);
  const [replayReady, setReplayReady] = useState(!replay);
  const launched = useRef(false), seat = useRef(replay ? { code: replay.room_code, token: replay.token } : null);
  const { room, error: pollError, expired } = useMissionRoomPoll(roomCode, role, token);
  useEffect(() => () => { if (seat.current && !launched.current) base44.functions.invoke('missionMp', { action: 'mp_leave', ...seat.current }).catch(() => {}); }, []);

  const mission = MP_MISSIONS.find(m => m.id === missionId);
  const packDescription = missionId === 'l5r' ? '1 sobre de 4 héroes por jugador · elige 3' : '3 sobres de 4 héroes por jugador · elige 3';
  const pool = missionPool(cards, missionId);
  const available = pool.filter(c => modality === 'pack' || missionId === 'todos' || !isEpic(c));
  const myTeam = modality === 'pack' ? (pack || []) : team;
  const total = valueOf(myTeam);
  const bothReady = myReady && oppTeam;

  async function prepareReplay() {
    setError(''); setBusy(true);
    try {
      const { data } = await base44.functions.invoke('missionMp', { action: 'mp_replay', code: replay.room_code, token: replay.token, run_id: replay.run_id });
      if (!data?.ok) throw new Error(data?.error || 'No se pudo preparar la revancha.');
      setReplayReady(true);
    } catch (e) { setError(e.response?.data?.error || e.message || 'No se pudo preparar la revancha.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { if (replay?.role === 'host') prepareReplay(); }, []);

  useEffect(() => {
    if (!room || !role) return;
    const other = role === 'host' ? 'guest' : 'host';
    if (replay && Number(room.replay_round || 0) > Number(replay.round || 0)) setReplayReady(true);
    if (room[other + '_nick']) { setOppNick(room[other + '_nick']); setStep('prepare'); }
    else { setOppNick(''); if (role === 'host') setStep('host_code'); }
    setOppTeam(room[other + '_ready'] && room[other + '_team']?.length === 3 ? room[other + '_team'] : null);
    if (role === 'guest' && room.game_code && myReady && !launched.current) {
      launched.current = true;
      onStart({ mission: missionId, modality, role, room_code: roomCode, game_code: room.game_code, run_id: room.run_id, password, token, round: room.replay_round || 0, nick, oppNick: room.host_nick, myTeam: myTeam.map(c => c.engineId), oppTeam: room.host_team });
    }
  }, [room, role, myReady, missionId, modality, password, token, nick, roomCode, myTeam, onStart]);

  useEffect(() => {
    if (!expired) return;
    seat.current = null; setRoomCode(''); setRole(''); setToken(''); setOppNick(''); setOppTeam(null);
    setMyReady(false); setTeam([]); setPack(null); setStep('config');
    setError('La sala ha caducado o se ha cerrado. Elige otra sala o crea una nueva.');
  }, [expired]);

  async function createRoom() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      if (isPrivate && (roomPassword.length < 4 || roomPassword.length > 64)) throw new Error('La contraseña debe tener entre 4 y 64 caracteres.');
      const res = await base44.functions.invoke('missionMp', { action: 'mp_create', nick, mission: missionId, modality, is_private: isPrivate, room_password: isPrivate ? roomPassword : '' });
      if (res.data?.error) throw new Error(res.data.error);
      seat.current = { code: res.data.code, token: res.data.token };
      setRoomCode(res.data.code);
      setPassword(res.data.password);
      setRole('host');
      setStep('host_code');
      setToken(res.data.token);
    } catch (e) { setError(e.response?.data?.error || e.message || 'No se pudo crear la sala.'); }
    finally { setBusy(false); }
  }

  async function joinRoom(code, privatePassword) {
    if (busy) return;
    setError(''); setBusy(true);
    try {
      const res = await base44.functions.invoke('missionMp', { action: 'mp_join', code, nick, room_password: privatePassword });
      if (res.data?.error) throw new Error(res.data.error);
      seat.current = { code, token: res.data.token };
      setRoomCode(code);
      setPassword(res.data.password);
      setRole('guest');
      setMissionId(res.data.mission || missionId);
      setModality(res.data.modality || modality);
      setOppNick(res.data.host_nick || '');
      setStep('prepare');
      setNotice('Te has unido. Prepara tu ejército.');
      setToken(res.data.token);
    } catch (e) { setError(e.response?.data?.error || e.message || 'No se pudo unir a la sala.'); }
    finally { setBusy(false); }
  }



  function toggle(card) { setError(''); setTeam(prev => prev.some(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : prev.length >= 3 || (isEpic(card) && prev.some(isEpic)) ? prev : [...prev, card]); }

  async function submitTeam() {
    if (busy || myReady) return;
    if (myTeam.length !== 3) { setError('Necesitas 3 héroes.'); return; }
    if (myTeam.filter(isEpic).length > 1) { setError('Máximo 1 héroe épico por ejército.'); return; }
    if (modality === 'budget' && total > MP_BUDGET) { setError('Te pasas de ' + MP_BUDGET + ' monedas.'); return; }
    setError(''); setBusy(true);
    const heroIds = myTeam.map(c => c.engineId);
    try {
      const { data } = await base44.functions.invoke('missionMp', { action: 'mp_set_team', code: roomCode, nick, role, token, team: heroIds });
      if (!data?.ok) throw new Error(data?.error || 'No se pudo guardar el ejército.');
      setMyReady(true);
      setNotice('¡Equipo enviado! Esperando al rival...');
    } catch (e) { setError(e.response?.data?.error || e.message || 'No se pudo enviar el equipo.'); }
    finally { setBusy(false); }
  }

  function launchGame() {
    if (!bothReady || starting || role !== 'host') return;
    launched.current = true;
    onStart({ mission: missionId, modality, role, room_code: roomCode, password, token, round: room?.replay_round || 0, nick, oppNick, myTeam: myTeam.map(c => c.engineId), oppTeam });
  }

  if (replay && !replayReady) return <section className="mp-waiting" role="status">
    <LoaderCircle className="animate-spin" /><p>{replay.role === 'host' ? 'Preparando otra partida…' : 'Esperando a que el anfitrión prepare otra partida…'}</p>
    {pollError && <p role="alert">{pollError}</p>}
    {error && <><p role="alert">{error}</p><button className="mission-button" onClick={prepareReplay} disabled={busy}>Reintentar</button></>}
  </section>;

  if (pool.length < 3) return <section className="space-y-6">
    <button className="mission-link" onClick={onBack}><ArrowLeft size={16} /> Volver</button>
    <p role="alert">Esta misión necesita al menos tres héroes etiquetados y disponibles.</p>
  </section>;

  return <section className="mp-lobby space-y-6">
    <button className="mission-link" onClick={onBack} disabled={starting}><ArrowLeft size={16} /> Volver</button>
    {roomCode && <MissionRoomSeats nick={nick} opponent={oppNick} ready={myReady} opponentReady={!!oppTeam} />}
    {pollError && <p role="alert">{pollError}</p>}

    {step === 'config' && <>
      <div><p className="mission-eyebrow">MULTIJUGADOR</p><h2 className="font-heading text-3xl">Misión especial</h2><p className="mt-2 opacity-80">Elige clan y modalidad para crear una sala, o entra directamente en una de las salas disponibles.</p></div>
      <div className="mp-section"><h3 className="font-heading text-lg">Clan</h3><div className="mp-tabs">{MP_MISSIONS.map(m => <button key={m.id} className={m.id === missionId ? 'active' : ''} onClick={() => setMissionId(m.id)}><span>{m.name}</span><span>{m.description}</span></button>)}</div></div>
      <div className="mp-section"><h3 className="font-heading text-lg">Modalidad</h3><div className="mp-tabs">{MP_MODALITIES.map(mo => <button key={mo.id} className={mo.id === modality ? 'active' : ''} onClick={() => setModality(mo.id)}><span>{mo.name}</span><span>{mo.description}</span></button>)}</div></div>
      <div className="mission-budget"><span>Equipamiento: {MP_EQUIP_COINS} monedas por jugador</span><strong>{modality === 'pack' ? packDescription : MP_BUDGET + ' monedas para comprar 3 héroes'}</strong></div>
      <MissionRoomOptions isPrivate={isPrivate} setPrivate={setPrivate} password={roomPassword} setPassword={setRoomPassword} disabled={busy} />
      <button className="mission-button primary" onClick={createRoom} disabled={busy}><Wifi size={18} /> {busy ? 'Creando sala…' : 'Crear sala'}</button>
      {error && <p role="alert">{error}</p>}
      <MissionRoomDirectory onJoin={joinRoom} busy={busy} roomCode={roomCode} />
    </>}

    {step === 'host_code' && <>
      <div><p className="mission-eyebrow">SALA CREADA · {mission.name} · {MP_MODALITIES.find(mo => mo.id === modality).name}</p><h2 className="font-heading text-3xl">Tu sala está publicada</h2><p className="mt-2 opacity-80">{isPrivate ? 'Solo entrarán quienes conozcan tu contraseña.' : 'Cualquier jugador puede entrar desde la lista, sin código.'}</p></div>
      {!oppNick ? <div className="mp-waiting"><LoaderCircle className="animate-spin" /><p>Esperando a que se una un rival…</p></div> : <div className="mp-status ready">¡{oppNick} se ha unido!</div>}
      <MissionRoomDirectory onJoin={joinRoom} busy={busy} roomCode={roomCode} />
      {error && <p role="alert">{error}</p>}
    </>}

    {step === 'prepare' && oppNick && <>
      <div><p className="mission-eyebrow">{mission.name} · {MP_MODALITIES.find(mo => mo.id === modality).name} · MULTIJUGADOR</p><h2 className="font-heading text-3xl">Prepara tu ejército</h2><p className="mt-2 opacity-80">Rival: {oppNick}. Equipamiento: {MP_EQUIP_COINS} monedas.</p></div>
      <div className="mission-budget"><span>{modality === 'pack' ? packDescription : 'Héroes: ' + total + ' / ' + MP_BUDGET + ' monedas · ' + team.length + '/3 elegidos'} · Máximo 1 épica por ejército</span><strong>Equipamiento: {MP_EQUIP_COINS} monedas</strong></div>
      {modality === 'pack' && !pack ? <MissionMpPacks key={roomCode} cards={cards} mission={mission} code={roomCode} token={token} onTeamSelected={setPack} />
        : <MissionCardGrid>{(modality === 'pack' ? myTeam : available).map(card => <MissionHero key={card.id} card={card} selected={myTeam.some(c => c.id === card.id)} disabled={myReady || (modality !== 'pack' && (!myTeam.some(c => c.id === card.id) && (team.length === 3 || total + Number(card.cost) > MP_BUDGET || (isEpic(card) && team.some(isEpic)))))} onSelect={modality === 'pack' ? undefined : () => toggle(card)} />)}</MissionCardGrid>}
      {!myReady && myTeam.length === 3 && <button className="mission-button primary" disabled={busy} onClick={submitTeam}><Swords size={18} /> Confirmar ejército</button>}
      {myReady && !oppTeam && <div className="mp-waiting"><LoaderCircle className="animate-spin" /><p>¡Equipo listo! Esperando al rival…</p></div>}
      {myReady && oppTeam && <div className="mp-opp-team space-y-4"><h3 className="font-heading text-xl">¡El rival está listo!</h3><p className="text-sm opacity-80">Tu rival ({oppNick}) ha confirmado su ejército. ¡A la batalla!</p>{role === 'host' ? <button className="mission-button primary" disabled={starting} onClick={launchGame}><Swords size={18} /> {starting ? 'Conectando partida…' : 'Ir a equipamiento'}</button> : <p role="status">{starting ? 'Conectando partida…' : 'Esperando a que el anfitrión inicie la partida…'}</p>}</div>}
      {notice && <p className="mission-notice" role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
    </>}

    {step === 'starting' && <div className="mp-waiting"><LoaderCircle className="animate-spin" /><p>Conectando partida multijugador…</p></div>}
  </section>;
}