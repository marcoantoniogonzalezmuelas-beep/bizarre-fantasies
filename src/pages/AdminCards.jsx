import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import CardFields from '@/components/admin/CardFields';
import CardList from '@/components/admin/CardList';
import { CLAN_COLORS } from '@/lib/cardData';

const emptyCard = { category: 'hero', card_id: '', number: '', name: '', title: '', clan: '', type: '', cost: '', cc: '', ad: '', he: '', hp: '', mana: '', power: '', ability_name: '', ability_text: '', elite_ability_name: '', elite_ability_text: '', elite_cc: '', elite_ad: '', elite_he: '', elite_hp: '', tag: '', description: '', art_url: '', elite_art_url: '', image_prompt: '', in_auction: true };
const numericFields = ['number', 'cost', 'cc', 'ad', 'he', 'hp', 'mana', 'power', 'elite_cc', 'elite_ad', 'elite_he', 'elite_hp'];

function cleanPayload(form) {
  const payload = { ...form };
  delete payload.image_prompt;
  delete payload.id;
  delete payload.created_date;
  delete payload.updated_date;
  delete payload.created_by_id;
  numericFields.forEach((field) => { if (payload[field] === '' || payload[field] == null) delete payload[field]; else payload[field] = Number(payload[field]); });
  Object.keys(payload).forEach((key) => { if (payload[key] === '') delete payload[key]; });
  if (!payload.card_id && payload.name) payload.card_id = payload.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return payload;
}

export default function AdminCards() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [cards, setCards] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [form, setForm] = useState(emptyCard);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setChecking(false)); }, []);
  useEffect(() => { if (user?.role === 'admin') loadCards(); }, [user]);

  async function loadCards() {
    const list = await base44.entities.Card.list('number', 300);
    setCards(list || []);
    setForm(prev => {
      if (!prev.number && list && list.length > 0) {
        const maxNum = list.reduce((m, c) => Math.max(m, Number(c.number || 0)), 0);
        return { ...prev, number: maxNum + 1 };
      }
      return prev;
    });
  }
  const [generatingStats, setGeneratingStats] = useState(false);

  async function generateStats() {
    if (!form.name || !form.clan) return;
    setGeneratingStats(true);
    try {
      const prompt = `Actúa como diseñador del juego de cartas Bizarre Fantasies.
      Genera estadísticas y habilidades para esta carta:
      Nombre: ${form.name}
      Raza/Clan: ${form.clan}
      Categoría: ${form.category}
      
      Reglas de balance:
      - Media de stats (cc, ad, he, power) debe rondar de 1 a 10.
      - Hp de un héroe debe rondar entre 15 a 45.
      - Cost debe ser un valor de 10 a 30 (salvo tokens o similares).
      - Mana suele rondar entre 8 a 15 (si es héroe, el max mana).
      - Escribe habilidades originales y locas que tengan sinergia con su raza, con un nombre corto (ability_name) y la descripción (ability_text).
      - Si es Héroe, genera su versión Élite (elite_cc, elite_ad, elite_he, elite_hp, elite_ability_name, elite_ability_text) aumentando stats y mejorando su habilidad ligeramente.
      - El campo 'type' en héroes suele ser CC, AD o HE.
      
      IMPORTANTE: No devuelvas ningún texto extra, solo un JSON estricto con las siguientes claves (si no aplican usa null o vacío):
      "cost", "cc", "ad", "he", "hp", "mana", "power", "type", "ability_name", "ability_text", "elite_cc", "elite_ad", "elite_he", "elite_hp", "elite_ability_name", "elite_ability_text", "description", "title"`;
      
      const response = await base44.integrations.Core.InvokeLLM({ 
        prompt, 
        response_json_schema: { 
          type: "object", 
          properties: {
            cost: { type: "number" }, cc: { type: "number" }, ad: { type: "number" }, he: { type: "number" }, hp: { type: "number" }, mana: { type: "number" }, power: { type: "number" }, type: { type: "string" }, ability_name: { type: "string" }, ability_text: { type: "string" }, elite_cc: { type: "number" }, elite_ad: { type: "number" }, elite_he: { type: "number" }, elite_hp: { type: "number" }, elite_ability_name: { type: "string" }, elite_ability_text: { type: "string" }, description: { type: "string" }, title: { type: "string" }
          }
        } 
      });
      
      const resData = response || {};
      setForm(prev => ({
        ...prev,
        ...resData
      }));
    } catch (err) {
      console.error(err);
      alert("No se pudieron generar los stats.");
    } finally {
      setGeneratingStats(false);
    }
  }

  function onChange(name, value) {
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'name') {
        const oldDerived = prev.name ? prev.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') : '';
        if (!prev.card_id || prev.card_id === oldDerived) {
          next.card_id = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        }
      }
      if (name === 'clan' && CLAN_COLORS[value]) {
        next.clan_color = CLAN_COLORS[value];
      }
      return next;
    });
  }
  function startNew() {
    const maxNum = cards.reduce((max, c) => Math.max(max, Number(c.number || 0)), 0);
    setEditingId(null);
    setForm({ ...emptyCard, number: maxNum > 0 ? maxNum + 1 : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function startEdit(card) { setEditingId(card.id); setForm({ ...emptyCard, ...card, image_prompt: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  async function saveCard() {
    if (!form.name || !form.category) return;
    setSaving(true);
    const payload = cleanPayload(form);
    if (editingId) await base44.entities.Card.update(editingId, payload);
    else await base44.entities.Card.create(payload);
    await loadCards();
    setSaving(false);
    startNew();
  }

  async function cropAndUpload(url) {
    // Load image, draw cropped 7:10 version onto canvas, upload the result
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const TARGET_W = 700;
        const TARGET_H = 1000;
        const srcRatio = img.width / img.height;
        const dstRatio = TARGET_W / TARGET_H;
        let sx, sy, sw, sh;
        if (srcRatio > dstRatio) {
          // source wider than target → crop sides
          sh = img.height;
          sw = img.height * dstRatio;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          // source taller than target → crop top/bottom
          sw = img.width;
          sh = img.width / dstRatio;
          sx = 0;
          sy = (img.height - sh) / 2;
        }
        const canvas = document.createElement('canvas');
        canvas.width = TARGET_W;
        canvas.height = TARGET_H;
        canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H);
        canvas.toBlob(async (blob) => {
          const file = new File([blob], 'card_art.jpg', { type: 'image/jpeg' });
          const uploaded = await base44.integrations.Core.UploadFile({ file });
          resolve(uploaded?.file_url || url);
        }, 'image/jpeg', 0.92);
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  }

  async function generateImage(target = 'art_url') {
    if (!form.image_prompt) return;
    setGenerating(true);
    const prompt = `Ilustración FULL-BLEED de carta fantasy bizarra para un juego de cartas, ocupando el 100% del lienzo de borde a borde, esquina a esquina, sin ningún hueco. Prohibido absolutamente: marco, borde blanco o de cualquier color, margen, passepartout, viñeta, fondo transparente, tarjeta o recuadro dentro de la imagen, texto o logos. La ilustración debe extenderse por todo el encuadre sin ningún espacio vacío ni siquiera en las esquinas, con el personaje/objeto grande, centrado y el fondo (paisaje, textura o ambiente) también lleno hasta los bordes. Nombre: ${form.name || 'Carta nueva'}. Tipo: ${form.category}. Raza o clan: ${form.clan || 'sin raza'}. Estilo: arte digital épico, oscuro, colorido, carta coleccionable. Indicaciones del admin: ${form.image_prompt}`;
    const result = await base44.integrations.Core.GenerateImage({ prompt });
    const rawUrl = result?.url;
    if (rawUrl) {
      const croppedUrl = await cropAndUpload(rawUrl);
      setForm(prev => ({ ...prev, [target]: croppedUrl }));
    }
    setGenerating(false);
  }

  async function uploadImage(file, target = 'art_url') {
    if (!file) return;
    setUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, [target]: result?.file_url || prev[target] }));
    setUploading(false);
  }

  const filteredCards = useMemo(() => cards.filter(card => {
    const matchesCategory = category === 'all' || card.category === category;
    const text = `${card.name || ''} ${card.title || ''} ${card.clan || ''} ${card.type || ''}`.toLowerCase();
    return matchesCategory && text.includes(query.toLowerCase());
  }), [cards, query, category]);

  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando backoffice...</div>;
  if (user?.role !== 'admin') return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Backoffice Admin</h1><p className="mt-4 text-[#cfc6dd]">Esta zona sólo está disponible para administradores.</p><Link to="/" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Volver al juego</Link></div>;

  return <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc] md:px-8"><div className="mx-auto max-w-7xl"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-heading text-3xl font-black text-[#fff5dc]">Backoffice de cartas</h1><p className="mt-1 text-sm text-[#cfc6dd]">Crea cartas por tipo y raza, genera imágenes con IA y edita la base de datos actual.</p></div><Link to="/" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Volver al juego</Link></div><div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]"><section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 shadow-2xl md:p-6"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-heading text-xl font-black text-[#ffe49a]">{editingId ? 'Editar carta' : 'Crear carta nueva'}</h2>{editingId && <button onClick={startNew} className="rounded-lg border border-[#ffd24a44] px-3 py-1.5 text-xs font-black text-[#ffe49a]">Nueva carta</button>}</div><div className="mb-4 flex gap-4">
  {form.art_url && <div className="flex-1 flex h-72 w-full items-center justify-center rounded-2xl border border-[#ffd24a44] bg-black/45 p-3"><img src={form.art_url} alt="Principal" className="h-full w-full object-contain" /></div>}
  {form.elite_art_url && <div className="flex-1 flex h-72 w-full items-center justify-center rounded-2xl border border-[#c05bff44] bg-black/45 p-3"><img src={form.elite_art_url} alt="Élite" className="h-full w-full object-contain" /></div>}
</div><CardFields form={{ ...form, onGenerateStats: generateStats, generatingStats }} onChange={onChange} onGenerate={generateImage} generating={generating} onUpload={uploadImage} uploading={uploading} /><button onClick={saveCard} disabled={saving || !form.name} className="mt-5 w-full rounded-2xl bg-[#ffd24a] px-5 py-3 font-heading font-black text-[#3a2600] disabled:opacity-50">{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear carta'}</button></section><section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 shadow-2xl md:p-6"><h2 className="font-heading text-xl font-black text-[#ffe49a]">BD actual · {filteredCards.length} cartas</h2><div className="my-4 grid gap-3 md:grid-cols-[1fr_170px]"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, raza, tipo..." className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" /><select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]"><option value="all">Todas</option><option value="hero">Héroes</option><option value="spell">Hechizos</option><option value="melee_weapon">Armas CC</option><option value="ranged_weapon">Armas AD</option><option value="armor">Armaduras</option><option value="object">Objetos</option><option value="bonus">Bonus</option><option value="race">Razas</option></select></div><CardList cards={filteredCards} onEdit={startEdit} /></section></div></div></div>;
}