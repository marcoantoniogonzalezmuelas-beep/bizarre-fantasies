import React, { useState } from 'react';

export default function ChatEmojiRow({ emoji, onSave }) {
  const [name, setName] = useState(emoji.name);
  const [category, setCategory] = useState(emoji.category || 'Cartas');
  return <div className="grid grid-cols-[52px_1fr_150px_auto] items-center gap-3 rounded-2xl border border-[#c06bff33] bg-black/35 p-3">
    <img src={emoji.url} alt={emoji.name} className="h-12 w-12 rounded-full object-cover" />
    <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-[#c06bff33] bg-black/50 px-3 py-2 text-sm text-[#fff5dc]" />
    <input value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-[#c06bff33] bg-black/50 px-3 py-2 text-sm text-[#fff5dc]" />
    <div className="flex gap-2"><button onClick={() => onSave(emoji.id, { name, category })} className="rounded-lg bg-[#c06bff] px-3 py-2 text-xs font-black text-white">Guardar</button><button onClick={() => onSave(emoji.id, { active: !emoji.active })} className="rounded-lg border border-[#ffd24a55] px-3 py-2 text-xs font-black text-[#ffe49a]">{emoji.active ? 'Desactivar' : 'Activar'}</button></div>
  </div>;
}