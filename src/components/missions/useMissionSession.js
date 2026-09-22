import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loadVictories, saveVictory } from '@/components/missions/missionPersistence';
export default function useMissionSession(iframeRef) {
  const [session, setSession] = useState(null), [cards, setCards] = useState([]), [victories, setVictories] = useState([]);
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [starting, setStarting] = useState(false), [notice, setNotice] = useState('');
  const [celebration, setCelebration] = useState(null);
  const pendingCelebration = useRef(null);
  const run = useRef(null), pending = useRef(null), timer = useRef(null), saving = useRef(false), loadId = useRef(0);
  const send = data => iframeRef.current?.contentWindow?.postMessage(data, '*');
  const persist = useCallback(async () => {
    if (!pending.current || saving.current) return;
    saving.current = true;
    try { const row = await saveVictory(pending.current); setVictories(prev => [...prev.filter(r => r.run_id !== row.run_id), row]); pending.current = null; setError(''); setNotice('Victoria guardada. Tu progreso está actualizado.'); }
    catch { setError('No se pudo guardar la victoria. Pulsa Reintentar guardado antes de salir.'); }
    finally { saving.current = false; }
  }, []);
  useEffect(() => {
    async function onMessage(event) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const d = event.data || {};
      if (d.bfMissionOpen) {
        if (pendingCelebration.current) { const pc = pendingCelebration.current; pendingCelebration.current = null; setCelebration(pc); }
        const id = ++loadId.current; setSession(d.bfMissionOpen); setLoading(true); setCards([]); setVictories([]); if (!pending.current) setError('');
        try { const [all, wins] = await Promise.all([base44.entities.Card.list('number', 500), loadVictories(d.bfMissionOpen.nick)]); if (id !== loadId.current) return; setCards(all.map(c => ({ ...c, engineId: d.bfMissionOpen.heroes.find(h => h.id === c.card_id || Number(h.number) === Number(c.number))?.id })).filter(c => c.engineId)); setVictories(prev => [...wins, ...prev.filter(r => r.nick === d.bfMissionOpen.nick.toLowerCase() && !wins.some(w => w.run_id === r.run_id))]); }
        catch { setError('No se pudieron cargar las misiones. Vuelve a intentarlo.'); }
        finally { if (id === loadId.current) setLoading(false); }
      }
      if (d.bfMissionStarted && d.bfMissionStarted === run.current?.run_id) { clearTimeout(timer.current); setStarting(false); setSession(null); }
      if (d.bfMissionStartError) { clearTimeout(timer.current); setStarting(false); setError(d.bfMissionStartError); }
      if (d.bfMissionResult?.run_id === run.current?.run_id && run.current && !run.current.finished) {
        run.current.finished = true;
        if (d.bfMissionResult.won) { pending.current = { ...run.current }; pendingCelebration.current = { mission: run.current.mission, level: run.current.level }; setNotice('Guardando victoria…'); await persist(); }
        else setNotice('Esta vez no ha podido ser. Tus victorias anteriores se conservan.');
      }
    }
    window.addEventListener('message', onMessage); return () => { window.removeEventListener('message', onMessage); clearTimeout(timer.current); };
  }, [iframeRef, persist]);
  function start(mission, level, player, rival, opts = {}) {
    if (starting || pending.current) return;
    const current = { nick: session.nick, mission: mission.id, level: level.id, run_id: crypto.randomUUID(), ai: level.ai, mode: opts.mode || 'ai', p2name: opts.p2name || '' };
    run.current = current; setError(''); setNotice(''); setStarting(true); send({ bfMissionStart: { ...current, player: player.map(c => c.engineId), rival: rival.map(c => c.engineId) } });
    timer.current = setTimeout(() => { setStarting(false); setError('La preparación no respondió. Puedes intentarlo de nuevo.'); }, 10000);
  }
  function close() { if (pending.current) { setError('Guarda la victoria pendiente antes de salir.'); return; } if (pendingCelebration.current) { const pc = pendingCelebration.current; pendingCelebration.current = null; setCelebration(pc); } ++loadId.current; setSession(null); send({ bfMissionClose: true }); }
  return { session, cards, victories, loading, error, starting, notice, celebration, dismissCelebration: () => setCelebration(null), start, close, persist, hasPending: !!pending.current };
}