import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Plus, Pencil, Trash2, Power, ArrowLeft, Type } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Backoffice del cartel digital de "Actualidad" de la home + de los textos de
// la portada (bienvenida de Punkito y bloque "Contacta con los Bizarros").
export default function FlashNewsAdmin() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [textEn, setTextEn] = useState('');
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Textos de la home (HomeText)
  const [ht, setHt] = useState({ punkitoEs: '', punkitoEn: '', contactLabel: '', contactBody: '' });
  const [htIds, setHtIds] = useState({ punkito: null, contact_label: null, contact_body: null });
  const [savingHt, setSavingHt] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setChecking(false));
  }, []);
  useEffect(() => { if (user?.role === 'admin') load(); }, [user]);

  async function load() {
    const list = await base44.entities.FlashNews.list('order', 200);
    setItems(list || []);
    const tl = await base44.entities.HomeText.list('key', 50).catch(() => []);
    const map = {};
    (tl || []).forEach((t) => { map[t.key] = t; });
    setHt({
      punkitoEs: map.punkito?.value || '',
      punkitoEn: map.punkito?.value_en || '',
      contactLabel: map.contact_label?.value || '',
      contactBody: map.contact_body?.value || '',
    });
    setHtIds({ punkito: map.punkito?.id || null, contact_label: map.contact_label?.id || null, contact_body: map.contact_body?.id || null });
  }

  function reset() { setText(''); setTextEn(''); setActive(true); setOrder(0); setEditingId(null); }

  async function save() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await base44.entities.FlashNews.update(editingId, { text: text.trim(), text_en: textEn.trim(), active, order: Number(order) || 0 });
      } else {
        await base44.entities.FlashNews.create({ text: text.trim(), text_en: textEn.trim(), active, order: Number(order) || 0 });
      }
      await load();
      reset();
    } catch (err) {
      console.error(err);
      alert('No se pudo guardar la noticia.');
    } finally {
      setSaving(false);
    }
  }

  function edit(it) { setText(it.text); setTextEn(it.text_en || ''); setActive(it.active); setOrder(it.order || 0); setEditingId(it.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  async function remove(id) {
    if (!window.confirm('¿Borrar esta noticia del cartel?')) return;
    await base44.entities.FlashNews.delete(id);
    await load();
  }

  async function toggle(it) {
    await base44.entities.FlashNews.update(it.id, { active: !it.active });
    await load();
  }

  async function saveHt() {
    setSavingHt(true);
    try {
      if (htIds.punkito) {
        await base44.entities.HomeText.update(htIds.punkito, { value: ht.punkitoEs, value_en: ht.punkitoEn });
      } else {
        const c = await base44.entities.HomeText.create({ key: 'punkito', value: ht.punkitoEs, value_en: ht.punkitoEn });
        setHtIds((p) => ({ ...p, punkito: c.id }));
      }
      if (htIds.contact_label) {
        await base44.entities.HomeText.update(htIds.contact_label, { value: ht.contactLabel });
      } else {
        const c = await base44.entities.HomeText.create({ key: 'contact_label', value: ht.contactLabel });
        setHtIds((p) => ({ ...p, contact_label: c.id }));
      }
      if (htIds.contact_body) {
        await base44.entities.HomeText.update(htIds.contact_body, { value: ht.contactBody });
      } else {
        const c = await base44.entities.HomeText.create({ key: 'contact_body', value: ht.contactBody });
        setHtIds((p) => ({ ...p, contact_body: c.id }));
      }
      alert('Textos de la home guardados. Recarga el juego para verlos.');
    } catch (err) {
      console.error(err);
      alert('No se guardaron los textos.');
    } finally {
      setSavingHt(false);
    }
  }

  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando backoffice...</div>;
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]">
        <h1 className="font-heading text-3xl font-black">Backoffice · Actualidad</h1>
        <p className="mt-4 text-[#cfc6dd]">Esta zona sólo está disponible para administradores.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Volver al juego</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc] md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Megaphone className="h-7 w-7 text-[#ffd24a]" />
            <div>
              <h1 className="font-heading text-2xl font-black text-[#fff5dc]">Cartel de Actualidad</h1>
              <p className="text-sm text-[#cfc6dd]">Noticias y textos de la portada del juego.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/admin" className="inline-flex items-center gap-1 rounded-xl border border-[#ffd24a66] px-3 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]"><ArrowLeft className="h-4 w-4" /> Cartas</Link>
            <Link to="/" className="rounded-xl border border-[#ffd24a66] px-3 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Volver al juego</Link>
          </div>
        </div>

        {/* Textos de la home */}
        <section className="mb-6 rounded-2xl border border-[#c06bff33] bg-[#140d24]/90 p-5 shadow-2xl">
          <div className="mb-3 flex items-center gap-2">
            <Type className="h-5 w-5 text-[#e2b0ff]" />
            <h2 className="font-heading text-lg font-black text-[#e2b0ff]">Textos de la portada</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#b06cff]">Bienvenida de Punkito (español)</label>
              <textarea value={ht.punkitoEs} onChange={(e) => setHt({ ...ht, punkitoEs: e.target.value })} rows={3} className="w-full resize-none rounded-xl border border-[#c06bff33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#c06bff]" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#b06cff]">Bienvenida de Punkito (inglés)</label>
              <textarea value={ht.punkitoEn} onChange={(e) => setHt({ ...ht, punkitoEn: e.target.value })} rows={3} className="w-full resize-none rounded-xl border border-[#c06bff33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#c06bff]" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#b06cff]">Texto del botón "Contacta"</label>
              <input value={ht.contactLabel} onChange={(e) => setHt({ ...ht, contactLabel: e.target.value })} className="w-full rounded-xl border border-[#c06bff33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#c06bff]" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-[#b06bff]">Cuerpo del bloque "Contacta" (los correos se enlazan solos)</label>
              <textarea value={ht.contactBody} onChange={(e) => setHt({ ...ht, contactBody: e.target.value })} rows={3} className="w-full resize-none rounded-xl border border-[#c06bff33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#c06bff]" />
            </div>
            <div className="flex justify-end">
              <button onClick={saveHt} disabled={savingHt} className="rounded-xl bg-[#c06bff] px-5 py-2 text-sm font-black text-white disabled:opacity-50">{savingHt ? 'Guardando...' : 'Guardar textos'}</button>
            </div>
          </div>
        </section>

        {/* Noticias del cartel */}
        <section className="mb-6 rounded-2xl border border-[#ffd24a33] bg-[#140d24]/90 p-5 shadow-2xl">
          <h2 className="mb-3 font-heading text-lg font-black text-[#ffe49a]">{editingId ? 'Editar noticia' : 'Nueva noticia'}</h2>
          <div className="flex flex-col gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe el texto de la noticia que aparecerá en el cartel digital..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]"
            />
            <label className="mt-1 block text-[11px] font-black uppercase tracking-wider text-[#b06cff]">Traducción al inglés (opcional)</label>
            <textarea
              value={textEn}
              onChange={(e) => setTextEn(e.target.value)}
              placeholder="English version of the news (optional)..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#c06bff33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#c06bff]"
            />
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-[#cfc6dd]">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#ffd24a]" />
                Activa (visible en la home)
              </label>
              <label className="flex items-center gap-2 text-sm text-[#cfc6dd]">
                Orden
                <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-20 rounded-lg border border-[#ffd24a33] bg-black/45 px-2 py-1 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" />
              </label>
              <div className="ml-auto flex gap-2">
                {editingId && <button onClick={reset} className="rounded-xl border border-[#ffd24a44] px-4 py-2 text-sm font-black text-[#ffe49a]">Cancelar</button>}
                <button onClick={save} disabled={saving || !text.trim()} className="rounded-xl bg-[#ffd24a] px-5 py-2 text-sm font-black text-[#3a2600] disabled:opacity-50">{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Añadir'}</button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#ffd24a33] bg-[#140d24]/90 p-5 shadow-2xl">
          <h2 className="mb-3 font-heading text-lg font-black text-[#ffe49a]">Noticias · {items.length}</h2>
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#cfc6dd]">
              <Plus className="mx-auto mb-2 h-6 w-6 text-[#ffd24a66]" />
              No hay noticias todavía. Crea la primera arriba.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((it) => (
                <li key={it.id} className={`flex items-start gap-3 rounded-xl border p-3 ${it.active ? 'border-[#ffd24a33] bg-black/30' : 'border-[#3c3158] bg-black/10 opacity-60'}`}>
                  <div className="flex-1">
                    <p className="text-sm text-[#fff5dc]">{it.text}</p>
                    <p className="mt-1 text-[11px] text-[#8a7faa]">orden {it.order ?? 0} · {it.active ? 'activa' : 'oculta'}</p>
                  </div>
                  <button onClick={() => toggle(it)} title={it.active ? 'Ocultar' : 'Mostrar'} className="rounded-lg p-1.5 text-[#ffe49a] hover:bg-[#ffd24a22]"><Power className="h-4 w-4" /></button>
                  <button onClick={() => edit(it)} title="Editar" className="rounded-lg p-1.5 text-[#7ec8ff] hover:bg-[#3c9eff22]"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(it.id)} title="Borrar" className="rounded-lg p-1.5 text-[#ff9d9d] hover:bg-[#cc333322]"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}