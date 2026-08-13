import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AiLevelStrategyPanel from '@/components/admin/ai/AiLevelStrategyPanel';
import GameLogRow from '@/components/admin/ai/GameLogRow';

// Backoffice: gestión del aprendizaje de las IAs. Lista todos los logs de
// partidas, muestra qué niveles de IA ya los han analizado y permite forzar
// que cualquier nivel (Novata, Bersérker, Estratega, Némesis) aprenda de una
// partida concreta para graduar su nivel de juego.
export default function AdminAiLogs() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [logs, setLogs] = useState([]);
  const [strategies, setStrategies] = useState({});
  const [learningKey, setLearningKey] = useState('');
  const [message, setMessage] = useState('');
  const [modeFilter, setModeFilter] = useState('all');

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setChecking(false)); }, []);
  useEffect(() => { if (user?.role === 'admin') loadAll(); }, [user]);

  async function loadAll() {
    const [logList, stratList] = await Promise.all([
      base44.entities.GameLog.list('-created_date', 200).catch(() => []),
      base44.entities.AiLevelStrategy.list('-updated_date', 20).catch(() => []),
    ]);
    setLogs(logList || []);
    const m = {};
    (stratList || []).forEach(r => { if (r.level_id) m[r.level_id] = r; });
    setStrategies(m);
  }

  async function learn(logId, levelId) {
    setLearningKey(`${logId}:${levelId}`);
    setMessage('');
    try {
      const res = await base44.functions.invoke('aiLearnFromLog', { log_id: logId, level_id: levelId });
      if (res.data?.error) throw new Error(res.data.error);
      setMessage(`✓ Aprendizaje completado (${res.data?.games_learned || '?'} partidas aprendidas por ese nivel).`);
      await loadAll();
    } catch (e) {
      setMessage(`⚠ No se pudo completar el aprendizaje: ${e.message}`);
    }
    setLearningKey('');
  }

  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando...</div>;
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]">
        <h1 className="font-heading text-3xl font-black">Aprendizaje de las IAs</h1>
        <p className="mt-4 text-[#cfc6dd]">Zona solo para administradores.</p>
        <Link to="/admin" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Ir al backoffice</Link>
      </div>
    );
  }

  const filtered = logs.filter(l => modeFilter === 'all' || l.mode === modeFilter);

  return (
    <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-black text-[#fff5dc]">Aprendizaje de las IAs</h1>
            <p className="mt-1 text-sm text-[#cfc6dd]">Logs de partidas y estrategia aprendida por cada nivel. Pulsa un nivel en una partida para que la lea y aprenda.</p>
          </div>
          <Link to="/admin" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">← Backoffice</Link>
        </div>

        <AiLevelStrategyPanel strategies={strategies} />

        {message && <div className="mt-4 rounded-xl border border-[#ffd24a44] bg-[#140d24] px-4 py-2 text-sm text-[#ffe49a]">{message}</div>}

        <div className="mt-5 flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-black text-[#ffe49a]">Partidas registradas · {filtered.length}</h2>
          <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]">
            <option value="all">Todos los modos</option>
            <option value="ia">vs IA</option>
            <option value="online">Online</option>
            <option value="local">Local</option>
          </select>
        </div>

        <div className="mt-3 space-y-2">
          {filtered.length === 0 && <div className="rounded-2xl border border-[#ffd24a26] bg-black/30 p-6 text-center text-sm text-[#9a8ba8]">Aún no hay partidas registradas. Juega una partida completa (no demo) y aparecerá aquí.</div>}
          {filtered.map(log => <GameLogRow key={log.id} log={log} learningKey={learningKey} onLearn={learn} />)}
        </div>
      </div>
    </div>
  );
}