import React from 'react';

export default function Diagnostics({ turn, rooms, visitors, onlineMatches, now }) {
  const issues = [];

  // Relay
  if (turn?.error) {
    issues.push({ sev: 'high', area: 'Relay', msg: `Error del servidor: ${turn.error}`, hint: 'El servidor de relay no responde. Las partidas online no funcionarán hasta que se recupere.' });
  } else if (turn?.ms != null && turn.ms > 2500) {
    issues.push({ sev: 'medium', area: 'Relay', msg: `Latencia alta: ${turn.ms} ms`, hint: 'El servidor responde pero tarde. El polling puede tardar más y la partida se sentirá lenta.' });
  }

  // Salas atascadas
  const staleRooms = rooms.filter(r => r.status === 'playing' && (now - Date.parse(r.updated_date || r.created_date || 0)) > 120000);
  if (staleRooms.length) {
    issues.push({ sev: 'medium', area: 'Salas', msg: `${staleRooms.length} sala(s) en partida sin latido > 2 min`, hint: 'Posible desconexión no notificada. El relay las auto-limpia tras 10 min de inactividad.' });
  }
  const leftExpired = rooms.filter(r => (r.left_at || r.state?.left_at) && now - (r.left_at || r.state.left_at) > 600000);
  if (leftExpired.length) {
    issues.push({ sev: 'low', area: 'Salas', msg: `${leftExpired.length} sala(s) con abandono caducado (> 10 min)`, hint: 'Un jugador salió y nadie reanudó. La BD las borrará en el siguiente ciclo de limpieza.' });
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