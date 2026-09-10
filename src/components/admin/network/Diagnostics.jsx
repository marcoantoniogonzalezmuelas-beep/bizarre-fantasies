import React from 'react';

export default function Diagnostics({ turn, rooms, visitors, onlineMatches, now }) {
  const issues = [];

  // TURN
  if (turn?.error) {
    issues.push({ sev: 'high', area: 'TURN', msg: `Error del proveedor: ${turn.error}`, hint: 'El relay de Metered no responde. Las partidas online en móvil pueden no arrancar (CGNAT sin relay).' });
  } else if (turn?.ms != null && turn.ms > 2500) {
    issues.push({ sev: 'medium', area: 'TURN', msg: `Latencia alta: ${turn.ms} ms`, hint: 'Metered responde pero tarde. La negociación WebRTC tarda más y la conexión puede degradarse.' });
  } else if (turn && !turn.iceServers?.some(s => /^turns?:/i.test(Array.isArray(s.urls) ? s.urls.join(' ') : s.urls || ''))) {
    issues.push({ sev: 'high', area: 'TURN', msg: 'No hay relay TURN en la lista', hint: 'Sin TURN no hay partida en NAT simétrico/CGNAT. Revisa la cuota de Metered o las credenciales.' });
  } else if (turn?.source === 'fallback') {
    issues.push({ sev: 'medium', area: 'TURN', msg: 'Usando relay de respaldo (OpenRelay)', hint: 'Metered no respondió o agotó cuota. Funciona, pero el respaldo público es menos fiable.' });
  }

  // Salas atascadas
  const staleRooms = rooms.filter(r => r.status === 'playing' && (now - Date.parse(r.updated_date || r.created_date || 0)) > 120000);
  if (staleRooms.length) {
    issues.push({ sev: 'medium', area: 'Salas', msg: `${staleRooms.length} sala(s) en partida sin latido > 2 min`, hint: 'Posible desconexión no notificada. Se auto-limpian tras 3 h, pero pueden confundir al emparejamiento.' });
  }
  const leftExpired = rooms.filter(r => (r.left_at || r.state?.left_at) && now - (r.left_at || r.state.left_at) > 300000);
  if (leftExpired.length) {
    issues.push({ sev: 'low', area: 'Salas', msg: `${leftExpired.length} sala(s) con abandono caducado (> 5 min)`, hint: 'Un jugador salió y nadie reanudó. La BD las borrará en el siguiente ciclo de limpieza.' });
  }

  // Visitantes
  const deadVisitors = visitors.filter(v => (now - (v.last_heartbeat || 0)) > 40000);
  if (deadVisitors.length) {
    issues.push({ sev: 'low', area: 'Habitación Bizarra', msg: `${deadVisitors.length} visitante(s) sin latido (> 40 s)`, hint: 'Se eliminarán automáticamente, pero si se acumulan puede indicar que los clientes no cierran sesión correctamente.' });
  }

  // Partidas online
  if (onlineMatches.length === 0) {
    issues.push({ sev: 'info', area: 'Partidas online', msg: 'Sin partidas online registradas', hint: 'No hay datos de conectividad recientes. Juega una partida online para generar métricas.' });
  }

  const sevColor = { high: '#ff6b6b', medium: '#ffd24a', low: '#7ab8ff', info: '#9a8fb5' };
  const sevLabel = { high: 'Crítico', medium: 'Aviso', low: 'Menor', info: 'Info' };

  if (!issues.length) {
    return (
      <section className="rounded-3xl border border-[#66ffaa33] bg-[#140d24]/90 p-4 md:p-6">
        <h2 className="mb-3 font-heading text-xl font-black text-[#9dffcf]">Diagnóstico</h2>
        <div className="flex items-center gap-2 text-sm text-[#66ffaa]">
          <span className="text-lg">✓</span> No se han detectado problemas de conectividad.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 md:p-6">
      <h2 className="mb-3 font-heading text-xl font-black text-[#ffe49a]">Diagnóstico · {issues.length} hallazgo(s)</h2>
      <div className="grid gap-2">
        {issues.map((iss, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-[#ffffff0a] bg-black/20 px-3 py-2.5">
            <span className="mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-black" style={{ background: sevColor[iss.sev] + '22', color: sevColor[iss.sev] }}>
              {sevLabel[iss.sev]}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#fff5dc]"><span className="text-[#9a8fb5]">[{iss.area}]</span> {iss.msg}</div>
              <div className="mt-0.5 text-xs text-[#cfc6dd]">{iss.hint}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}