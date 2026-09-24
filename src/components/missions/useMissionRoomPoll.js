import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
export default function useMissionRoomPoll(code, role) {
  const [room, setRoom] = useState(null), [error, setError] = useState('');
  useEffect(() => {
    if (!code || !role) return;
    let cancelled = false, timer;
    async function poll() {
      try {
        const { data } = await base44.functions.invoke('missionMp', { action: 'mp_poll', code });
        if (!data?.ok) throw new Error(data?.error || 'No se pudo actualizar la sala.');
        if (!cancelled) { setRoom(data); setError(''); }
      } catch (e) { if (!cancelled) setError(e.response?.data?.error || e.message); }
      finally { if (!cancelled) timer = setTimeout(poll, 800); }
    }
    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [code, role]);
  return { room, error };
}