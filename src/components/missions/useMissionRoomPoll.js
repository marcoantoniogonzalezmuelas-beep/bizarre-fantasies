import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
export default function useMissionRoomPoll(code, role, token) {
  const [room, setRoom] = useState(null), [error, setError] = useState(''), [expired, setExpired] = useState(false);
  useEffect(() => {
    if (!code || !role || !token) return;
    let cancelled = false, timer, stopped = false;
    async function poll() {
      try {
        const { data } = await base44.functions.invoke('missionMp', { action: 'mp_poll', code, token });
        if (!data?.ok) throw new Error(data?.error || 'No se pudo actualizar la sala.');
        if (!cancelled) { setRoom(data); setError(''); setExpired(false); }
      } catch (e) { if (!cancelled) { setError(e.response?.data?.error || e.message); if ([403, 404].includes(e.response?.status)) { stopped = true; setRoom(null); setExpired(true); } } }
      finally { if (!cancelled && !stopped) timer = setTimeout(poll, 800); }
    }
    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [code, role, token]);
  return { room, error, expired };
}