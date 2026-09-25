import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MissionRoomCard from '@/components/missions/MissionRoomCard';
export default function MissionRoomDirectory({ onJoin, busy, roomCode }) {
  const [rooms, setRooms] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const mounted = useRef(false), inFlight = useRef(false);
  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try { const { data } = await base44.functions.invoke('missionMp', { action: 'mp_list' }); if (!data?.ok) throw new Error(data?.error || 'No se pudieron cargar las salas.'); if (mounted.current) { setRooms(data.rooms || []); setError(''); } }
    catch (e) { if (mounted.current) setError(e.response?.data?.error || e.message); }
    finally { inFlight.current = false; if (mounted.current) setLoading(false); }
  }, []);
  useEffect(() => { mounted.current = true; refresh(); const timer = setInterval(refresh, 5000); return () => { mounted.current = false; clearInterval(timer); }; }, [refresh, roomCode]);
  const available = rooms.filter(r => r.expires_at > Date.now());
  return <section className="space-y-4" aria-label="Salas de misiones disponibles">
    <div className="mission-section-heading"><h3 className="font-heading text-xl">Salas disponibles</h3><button type="button" className="mission-button" onClick={refresh} disabled={loading}><RefreshCw size={16} /> Actualizar salas</button></div>
    {loading && <p role="status">Buscando salas…</p>}{error && <p role="alert">{error}</p>}
    {!loading && !error && !available.length && <p>No hay salas esperando rival. ¡Crea la primera!</p>}
    {available.map(room => <MissionRoomCard key={room.id} room={room} onJoin={onJoin} busy={busy} own={room.code === roomCode} occupied={!!roomCode} />)}
    <p className="text-sm opacity-70">La lista se actualiza automáticamente cada 5 segundos.</p>
  </section>;
}