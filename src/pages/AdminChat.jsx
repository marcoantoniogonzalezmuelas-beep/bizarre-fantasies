import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ChatEmojiRow from '@/components/admin/chat/ChatEmojiRow';
import useChatEmojiAdmin from '@/hooks/useChatEmojiAdmin';

export default function AdminChat() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setChecking(false)); }, []);
  const admin = user?.role === 'admin';
  const { emojis, syncing, sync, save } = useChatEmojiAdmin(admin);
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const visible = term ? emojis.filter((e) => `${e.name} ${e.category}`.toLowerCase().includes(term)) : emojis;
  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando backoffice...</div>;
  if (!admin) return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Administración de chat</h1><p className="mt-4">Acceso exclusivo para administradores.</p><Link to="/" className="mt-6 inline-block text-[#ffe49a] underline">Volver al juego</Link></div>;
  return <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc]"><div className="mx-auto max-w-5xl"><header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-heading text-3xl font-black text-[#fff5dc]">Chat y emojis</h1><p className="mt-1 text-sm text-[#cfc6dd]">Gestiona los emojis compartidos por el chat multiplayer y la Habitación Bizarra.</p></div><div className="flex gap-2"><button onClick={sync} disabled={syncing} className="rounded-xl bg-[#c06bff] px-4 py-2 text-sm font-black text-white disabled:opacity-50">{syncing ? 'Sincronizando...' : 'Sincronizar todas las cartas'}</button><Link to="/admin" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a]">Volver al backoffice</Link></div></header><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar carta…" className="mb-3 w-full rounded-xl border border-[#3c3158] bg-[#150f22] px-4 py-2.5 text-sm text-[#efe9dc] outline-none focus:border-[#ffd24a66]" /><div className="mb-3 text-sm text-[#cfc6dd]">{emojis.filter((e) => e.active).length} activos · {emojis.length} totales{term ? ` · ${visible.length} encontrados` : ''}</div><div className="grid gap-3">{visible.map((emoji) => <ChatEmojiRow key={emoji.id} emoji={emoji} onSave={save} />)}</div></div></div>;
}