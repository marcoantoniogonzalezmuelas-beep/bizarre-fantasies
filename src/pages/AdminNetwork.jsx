import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import TurnStatus from '@/components/admin/network/TurnStatus';
import RoomRow from '@/components/admin/network/RoomRow';
import VisitorRow from '@/components/admin/network/VisitorRow';
import Diagnostics from '@/components/admin/network/Diagnostics';

export default function AdminNetwork() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [turn, setTurn] = useState(null);
  const [testing, setTesting] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [onlineMatches, setOnlineMatches] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setChecking(false));
  }, []);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [roomList, visitorList, matchList] = await Promise.all([
        base44.entities.GameRoom.list('-updated_date', 200).catch(() => []),
        base44.entities.BizarreVisitor.list('-created_date', 200).catch(() => []),
        base44.entities.MatchResult.list('-created_date', 50).catch(() => []),
      ]);
      setRooms(roomList || []);
      setVisitors(visitorList || []);
      setOnlineMatches((matchList || []).filter(m => m.mode === 'online'));
    } catch (e) {}
    setLoadingData(false);
  }, []);

  useEffect(() => { if (user?.role === 'admin') loadData(); }, [user, loadData]);

  // Reloj para refrescar los "hace X min" en tiempo real.
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(iv);
  }, []);

  const testTurn = useCallback(async () => {
    setTesting(true);
    const t0 = Date.now();
    try {
      await base44.functions.invoke('gameRelay', { action: 'poll', code: 'TEST00', side: 'p' });
      setTurn({ ok: true, ms: Date.now() - t0, source: 'relay' });
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('Room not found') || msg.includes('not found') || msg.includes('Code required')) {
        setTurn({ ok: true, ms: Date.now() - t0, source: 'relay' });
      } else {
        setTurn({ error: msg || 'No se pudo contactar con el servidor', ms: Date.now() - t0 });
      }
    }
    setTesting(false);
  }, []);

  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando…</div>;
  if (user?.role !== 'admin') return (
    <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]">
      <h1 className="font-heading text-3xl font-black">Red</h1>
      <p className="mt-4 text-[#cfc6dd]">Esta zona sólo está disponible para administradores.</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Volver al juego</Link>
    </div>
  );

  const playing = rooms.filter(r => r.status === 'playing').length;
  const waiting = rooms.filter(r => r.status === 'waiting').length;
  const resuming = rooms.filter(r => r.status === 'resuming').length;
  const liveVisitors = visitors.filter(v => now - (v.last_heartbeat || 0) < 40000).length;

  return (
    <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-black text-[#fff5dc]">Red y conectividad</h1>
            <p className="mt-1 text-sm text-[#cfc6dd]">Estado del servidor de relay, salas activas, visitantes en línea y diagnóstico de errores de conectividad.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Backoffice de cartas</Link>
            <Link to="/admin/jugadores" className="rounded-xl border border-[#ffb34a66] px-4 py-2 text-sm font-black text-[#ffcf8a] hover:bg-[#ffb34a] hover:text-[#3a2600]">Jugadores</Link>
            <Link to="/" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Volver al juego</Link>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-[#66ffaa33] bg-[#140d24]/90 p-3 text-center">
            <div className="text-2xl font-black text-[#9dffcf]">{playing}</div>
            <div className="text-xs text-[#cfc6dd]">En partida</div>
          </div>
          <div className="rounded-2xl border border-[#ffd24a33] bg-[#140d24]/90 p-3 text-center">
            <div className="text-2xl font-black text-[#ffe49a]">{waiting}</div>
            <div className="text-xs text-[#cfc6dd]">En espera</div>
          </div>
          <div className="rounded-2xl border border-[#7ab8ff33] bg-[#140d24]/90 p-3 text-center">
            <div className="text-2xl font-black text-[#a8d0ff]">{resuming}</div>
            <div className="text-xs text-[#cfc6dd]">Reanudando</div>
          </div>
          <div className="rounded-2xl border border-[#c06bff33] bg-[#140d24]/90 p-3 text-center">
            <div className="text-2xl font-black text-[#e2b0ff]">{liveVisitors}</div>
            <div className="text-xs text-[#cfc6dd]">En Habitación Bizarra</div>
          </div>
          <div className="rounded-2xl border border-[#ff6b9d33] bg-[#140d24]/90 p-3 text-center">
            <div className="text-2xl font-black text-[#ff9fbd]">{onlineMatches.length}</div>
            <div className="text-xs text-[#cfc6dd]">Partidas online (50 últ.)</div>
          </div>
        </div>

        <div className="grid gap-6">
          <TurnStatus turn={turn} testing={testing} onTest={testTurn} />

          <Diagnostics turn={turn} rooms={rooms} visitors={visitors} onlineMatches={onlineMatches} now={now} />

          {/* Salas activas */}
          <section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-xl font-black text-[#ffe49a]">Salas · {rooms.length}</h2>
              <button onClick={loadData} disabled={loadingData}
                className="rounded-lg border border-[#ffd24a44] px-3 py-1.5 text-xs font-black text-[#ffe49a] disabled:opacity-50">
                {loadingData ? 'Cargando…' : 'Actualizar'}
              </button>
            </div>
            {loadingData ? <p className="text-sm text-[#cfc6dd]">Cargando salas…</p> : (
              <div className="grid gap-2">
                {rooms.length === 0 && <p className="text-sm text-[#cfc6dd]">No hay salas en la base de datos.</p>}
                {rooms.map(r => <RoomRow key={r.id} room={r} now={now} />)}
              </div>
            )}
          </section>

          {/* Habitación Bizarra */}
          <section className="rounded-3xl border border-[#c06bff33] bg-[#140d24]/90 p-4 md:p-6">
            <h2 className="mb-3 font-heading text-xl font-black text-[#e2b0ff]">Habitación Bizarra · {visitors.length} visitante(s)</h2>
            {loadingData ? <p className="text-sm text-[#cfc6dd]">Cargando visitantes…</p> : (
              <div className="grid gap-2">
                {visitors.length === 0 && <p className="text-sm text-[#cfc6dd]">No hay visitantes activos.</p>}
                {visitors.map(v => <VisitorRow key={v.id} visitor={v} now={now} />)}
              </div>
            )}
          </section>

          {/* Partidas online recientes */}
          <section className="rounded-3xl border border-[#ff6b9d33] bg-[#140d24]/90 p-4 md:p-6">
            <h2 className="mb-3 font-heading text-xl font-black text-[#ff9fbd]">Partidas online recientes · {onlineMatches.length}</h2>
            {loadingData ? <p className="text-sm text-[#cfc6dd]">Cargando partidas…</p> : (
              <div className="grid gap-2">
                {onlineMatches.length === 0 && <p className="text-sm text-[#cfc6dd]">No se han registrado partidas online.</p>}
                {onlineMatches.map((m, i) => (
                  <div key={m.id || i} className="flex flex-wrap items-center gap-2 rounded-xl border border-[#ffffff0a] bg-black/20 px-3 py-2 text-xs">
                    <span className="font-black text-[#66ffaa]">GANó {m.winner_nick}</span>
                    <span className="text-[#cfc6dd]">vs</span>
                    <span className="font-black text-[#ff6b6b]">{m.loser_nick}</span>
                    {m.winner_is_ai && <span className="text-[#9a8fb5]">(IA ganó)</span>}
                    {m.loser_is_ai && <span className="text-[#9a8fb5]">(vs IA)</span>}
                    {m.winner_avatar && <img src={m.winner_avatar} alt="" className="h-5 w-5 rounded-full object-cover" />}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}