import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Menú de secciones del backoffice, agrupadas (antes eran siete botones sueltos en la cabecera).
const GROUPS = [
  { title: 'Cartas', links: [{ to: '/admin', label: '🃏 Cartas y Oráculo' }] },
  { title: 'Partidas', links: [{ to: '/admin/subastas', label: '🔨 Control de subastas' }, { to: '/admin/estadisticas-heroes', label: '📊 Stats héroes' }, { to: '/admin/ia', label: '🤖 Aprendizaje IA' }] },
  { title: 'Comunidad', links: [{ to: '/admin/jugadores', label: '👥 Jugadores' }, { to: '/admin/chat', label: '💬 Chat y emojis' }, { to: '/admin/news', label: '📰 Cartel de actualidad' }] },
  { title: 'Técnico', links: [{ to: '/admin/red', label: '📡 Red (diagnósticos)' }] },
];

export default function AdminNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={ref}>
        <button type="button" onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-[#7ab8ff66] px-4 py-2 text-sm font-black text-[#a8d0ff] hover:bg-[#7ab8ff] hover:text-[#0e1a2a]">
          ☰ Secciones
        </button>
        {open ? (
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-[#ffd24a33] bg-[#140d24] p-3 shadow-2xl">
            {GROUPS.map((g) => (
              <div key={g.title} className="mb-2 last:mb-0">
                <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-[#8f86a3]">{g.title}</div>
                {g.links.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-1.5 text-sm font-bold text-[#efe9dc] hover:bg-white/10">{l.label}</Link>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <Link to="/" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Volver al juego</Link>
    </div>
  );
}
