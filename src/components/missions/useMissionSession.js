import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { saveMatchResult } from '@/lib/resultPipeline';
import { missionResult } from '@/lib/resultSaver';
import { loadVictories, saveVictory } from '@/components/missions/missionPersistence';
import { readPendingVictory, rememberPendingVictory, clearPendingVictory } from '@/components/missions/missionPendingVictory';
export default function useMissionSession(iframeRef) {
  const [session, setSession] = useState(null), [cards, setCards] = useState([]), [victories, setVictories] = useState([]);
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [starting, setStarting] = useState(false), [notice, setNotice] = useState('');
  const [celebration, setCelebration] = useState(null);
  const pendingCelebration = useRef(null), celebrationReady = useRef(null), openNick = useRef(null);
  const run = useRef(null), pending = useRef(null), timer = useRef(null), saving = useRef(false), loadId = useRef(0);
  const send = data => iframeRef.current?.contentWindow?.postMessage(data, '*');
  const persist = useCallback(async () => {
    if (!pending.current || saving.current) return;
    saving.current = true;
    const victory = pending.current;
    try {
      const row = await saveVictory(victory);
      setVictories(prev => [...prev.filter(r => r.run_id !== row.run_id), row]);
      clearPendingVictory(victory.run_id); pending.current = null; setError(''); setNotice('Victoria guardada. Tu progreso está actualizado.');
      pendingCelebration.current = { mission: victory.mission, level: victory.level };
      if (celebrationReady.current === victory.run_id || openNick.current?.toLowerCase() === victory.nick.toLowerCase()) { setCelebration(pendingCelebration.current); pendingCelebration.current = null; }
    }
    catch { setError('No se pudo guardar la victoria. Pulsa Reintentar guardado antes de salir.'); iframeRef.current?.contentWindow?.postMessage({ bfMissionSaveFailed: victory.run_id }, '*'); }
    finally { saving.current = false; }
  }, [iframeRef]);
  useEffect(() => { pending.current = readPendingVictory(); if (pending.current) persist(); }, [persist]);
  useEffect(() => {
    async function onMessage(event) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const d = event.data || {};
      if (d.bfMissionOpen) {
        openNick.current = d.bfMissionOpen.nick;
        if (pendingCelebration.current) { const pc = pendingCelebration.current; pendingCelebration.current = null; setCelebration(pc); }
        const id = ++loadId.current; setSession(d.bfMissionOpen); setLoading(true); setCards([]); setVictories([]); if (!pending.current) setError('');
        try { const [all, wins] = await Promise.all([base44.entities.Card.list('number', 500), loadVictories(d.bfMissionOpen.nick)]); if (id !== loadId.current) return; setCards(all.map(c => ({ ...c, engineId: d.bfMissionOpen.heroes.find(h => h.id === c.card_id || Number(h.number) === Number(c.number))?.id })).filter(c => c.engineId)); setVictories(prev => [...wins, ...prev.filter(r => r.nick === d.bfMissionOpen.nick.toLowerCase() && !wins.some(w => w.run_id === r.run_id))]); }
        catch { setError('No se pudieron cargar las misiones. Vuelve a intentarlo.'); }
        finally { if (id === loadId.current) setLoading(false); }
      }
      if (d.bfMissionMpHosted && d.bfMissionMpHosted.run_id === run.current?.run_id) {
        try {
          const { data } = await base44.functions.invoke('missionMp', { action: 'mp_hosted', code: run.current.room_code, token: run.current.token, game_code: d.bfMissionMpHosted.game_code, run_id: run.current.run_id });
          if (!data?.ok) throw new Error(data?.error || 'No se pudo anunciar la partida.');
        } catch (e) { clearTimeout(timer.current); setStarting(false); setError(e.message); }
      }
      if (d.bfMissionStarted && d.bfMissionStarted === run.current?.run_id) { clearTimeout(timer.current); openNick.current = null; setStarting(false); setSession(null); }
      if (d.bfMissionStartError) { clearTimeout(timer.current); setStarting(false); setError(d.bfMissionStartError); }
      if (d.bfMissionCelebrationReady && d.bfMissionCelebrationReady === run.current?.run_id) {
        celebrationReady.current = d.bfMissionCelebrationReady;
        if (pendingCelebration.current) { setCelebration(pendingCelebration.current); pendingCelebration.current = null; }
      }
      if (run.current && d.bfMissionResult?.run_id === run.current.run_id && typeof d.bfMissionResult.won === 'boolean') {
        if (run.current.finished) { send({ bfMissionResultAck: run.current.run_id }); return; }
        run.current.finished = true;
        // TODAS las partidas de misión (ganadas o perdidas, en solitario o multijugador) pasan al ranking de
        // misiones. En multijugador informan los dos jugadores: el servidor guarda una sola por run_id.
        try { saveMatchResult(missionResult(run.current, d.bfMissionResult.won)); } catch (e) { /* no debe bloquear la misión */ }
        if (d.bfMissionResult.won && run.current.level) {
          pending.current = rememberPendingVictory(run.current); setNotice('Guardando victoria…');
          send({ bfMissionResultAck: run.current.run_id }); await persist();
        } else {
          send({ bfMissionResultAck: run.current.run_id });
          setNotice(d.bfMissionResult.won ? '¡Victoria en la misión multijugador!' : 'Esta vez no ha podido ser. Tus victorias anteriores se conservan.');
        }
      }
    }
    window.addEventListener('message', onMessage); return () => { window.removeEventListener('message', onMessage); clearTimeout(timer.current); };
  }, [iframeRef, persist]);
  function start(mission, level, player, rival) {
    if (starting || pending.current) return;
    const current = { nick: session.nick, mission: mission.id, level: level.id, run_id: crypto.randomUUID(), ai: level.ai };
    run.current = current; setError(''); setNotice(''); setStarting(true); send({ bfMissionStart: { ...current, player: player.map(c => c.engineId), rival: rival.map(c => c.engineId) } });
    timer.current = setTimeout(() => { setStarting(false); setError('La preparación no respondió. Puedes intentarlo de nuevo.'); }, 10000);
  }
  function startMp(cfg) {
    if (starting || pending.current) return;
    const current = { nick: session.nick, mission: cfg.mission, modality: cfg.modality, room_code: cfg.room_code, token: cfg.token, run_id: cfg.run_id || crypto.randomUUID(), oppNick: cfg.oppNick, role: cfg.role };
    run.current = current; setError(''); setNotice(''); setStarting(true);
    send({ bfMissionMpConnect: { run_id: current.run_id, mission: cfg.mission, modality: cfg.modality, role: cfg.role, room_code: cfg.room_code, game_code: cfg.game_code, password: cfg.password, nick: cfg.nick, oppNick: cfg.oppNick, round: cfg.round || 0, token: cfg.token, myTeam: cfg.myTeam, oppTeam: cfg.oppTeam } });
    timer.current = setTimeout(() => { setStarting(false); setError('La preparación no respondió. Puedes intentarlo de nuevo.'); }, 15000);
  }
  function close() { if (pending.current) { setError('Guarda la victoria pendiente antes de salir.'); return; } if (pendingCelebration.current) { const pc = pendingCelebration.current; pendingCelebration.current = null; setCelebration(pc); } ++loadId.current; openNick.current = null; setSession(null); send({ bfMissionClose: true }); }
  return { session, cards, victories, loading, error, starting, notice, celebration, dismissCelebration: () => { setCelebration(null); send({ bfMissionReopen: true }); }, start, startMp, close, persist, hasPending: !!pending.current };
}