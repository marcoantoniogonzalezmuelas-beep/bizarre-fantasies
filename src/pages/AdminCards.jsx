import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import CardFields from '@/components/admin/CardFields';
import CardPreviewModal from '@/components/admin/CardPreviewModal';
import CardList from '@/components/admin/CardList';
import BackupCardsButton from '@/components/admin/BackupCardsButton';
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
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
    if (editingId) {
      await base44.entities.Card.update(editingId, payload);
    } else {
      const created = await base44.entities.Card.create(payload);
      setEditingId(created.id);
    }
    await loadCards();
    setSaving(false);
  }

  const canDelete = user?.email === 'marcoantoniogonzalezmuelas@gmail.com';

  async function deleteCard() {
    if (!editingId || !canDelete) return;
    if (!window.confirm(`¿Borrar definitivamente la carta "${form.name}"? Desaparecerá de la base de datos y del juego.`)) return;
    setDeleting(true);
    await base44.entities.Card.delete(editingId);
    await loadCards();
    setDeleting(false);
    startNew();
  }

  async function cropAndUpload(url) {
    // Encaja la imagen COMPLETA en el formato 7:10 de la carta sin recortar
    // nada: la imagen entera se escala para caber (contain) y los huecos que
    // queden se rellenan con un fondo difuminado de la propia imagen, para
    // mantener el aspecto full-bleed sin perder ningún elemento del arte.
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const TARGET_W = 700;
        const TARGET_H = 1000;
        const srcRatio = img.width / img.height;
        const dstRatio = TARGET_W / TARGET_H;
        const canvas = document.createElement('canvas');
        canvas.width = TARGET_W;
        canvas.height = TARGET_H;
        const ctx = canvas.getContext('2d');
        // 1) Fondo: la imagen recortada en modo cover, muy difuminada
        let sx, sy, sw, sh;
        if (srcRatio > dstRatio) { sh = img.height; sw = img.height * dstRatio; sx = (img.width - sw) / 2; sy = 0; }
        else { sw = img.width; sh = img.width / dstRatio; sx = 0; sy = (img.height - sh) / 2; }
        ctx.filter = 'blur(30px)';
        // Overscan del fondo para que el desenfoque no deje bordes claros
        ctx.drawImage(img, sx, sy, sw, sh, -40, -40, TARGET_W + 80, TARGET_H + 80);
        ctx.filter = 'none';
        // 2) Imagen completa centrada en modo contain (sin recortar nada)
        const scale = Math.min(TARGET_W / img.width, TARGET_H / img.height);
        const dw = img.width * scale, dh = img.height * scale;
        ctx.drawImage(img, 0, 0, img.width, img.height, (TARGET_W - dw) / 2, (TARGET_H - dh) / 2, dw, dh);
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
    const clanColor = CLAN_COLORS[form.clan];
    const clanBg = clanColor ? ` FONDO OBLIGATORIO: el fondo debe ser un degradado atmosférico basado en el color ${clanColor} (color distintivo de la raza ${form.clan}), desde tonos oscuros de ese color en los bordes hacia tonos más luminosos y vibrantes del mismo color detrás del personaje, con ambiente y luz ambiental de ese color.` : '';
    const prompt = `Ilustración que RELLENA POR COMPLETO el lienzo entero de borde a borde y esquina a esquina, con cero relleno, cero márgenes y cero espacio de fondo visible en cualquier lado, ni siquiera una franja de 1 píxel. Prohibido absolutamente: marco, borde blanco/gris/de cualquier color, margen, passepartout, viñeta, fondo transparente, tarjeta o recuadro decorativo dentro de la imagen, texto o logos. ENCUADRE CON ZONA SEGURA: el personaje/objeto y todos los elementos importantes deben quedar cómodamente dentro de la zona central del lienzo, con amplio aire respecto a los cuatro bordes (nada importante pegado a los bordes), de forma que ningún recorte posterior corte cabeza, pies, manos ni la montura; la cara en el tercio superior-medio del lienzo. El fondo (paisaje, textura o ambiente) pintado hasta el último borde y las cuatro esquinas, sin ninguna zona vacía. Nombre: ${form.name || 'Carta nueva'}. Tipo: ${form.category}. Raza o clan: ${form.clan || 'sin raza'}. Estilo: arte digital épico, oscuro, colorido, carta coleccionable.${clanBg} Indicaciones del admin: ${form.image_prompt}`;
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
    // Recorta la subida al formato 7:10 de la carta para que encaje en el marco
    const fitted = result?.file_url ? await cropAndUpload(result.file_url) : null;
    setForm(prev => ({ ...prev, [target]: fitted || result?.file_url || prev[target] }));
    setUploading(false);
  }

  const filteredCards = useMemo(() => cards.filter(card => {
    const matchesCategory = category === 'all' || card.category === category;
    const text = `${card.name || ''} ${card.title || ''} ${card.clan || ''} ${card.type || ''}`.toLowerCase();
    return matchesCategory && text.includes(query.toLowerCase());
  }), [cards, query, category]);

  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando backoffice...</div>;
  if (!user) return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Backoffice Admin</h1><p className="mt-4 text-[#cfc6dd]">Inicia sesión con tu cuenta de administrador para acceder.</p><Link to="/login" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Iniciar sesión</Link><div className="mt-4"><Link to="/" className="text-sm text-[#ffe49a] underline">Volver al juego</Link></div></div>;
  if (user.role !== 'admin') return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Backoffice Admin</h1><p className="mt-4 text-[#cfc6dd]">Esta zona sólo está disponible para administradores. Has iniciado sesión como {user.email}.</p><Link to="/" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Volver al juego</Link></div>;

  return <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc] md:px-8"><div className="mx-auto max-w-7xl"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-heading text-3xl font-black text-[#fff5dc]">Backoffice de cartas</h1><p className="mt-1 text-sm text-[#cfc6dd]">Crea cartas por tipo y raza, genera imágenes con IA y edita la base de datos actual.</p></div><Link to="/" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Volver al juego</Link></div><div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]"><section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 shadow-2xl md:p-6"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-heading text-xl font-black text-[#ffe49a]">{editingId ? 'Editar carta' : 'Crear carta nueva'}</h2>{editingId && <button onClick={startNew} className="rounded-lg border border-[#ffd24a44] px-3 py-1.5 text-xs font-black text-[#ffe49a]">Nueva carta</button>}</div><div className="mb-4 flex gap-4">
  {form.art_url && <div className="flex-1 flex h-72 w-full items-center justify-center rounded-2xl border border-[#ffd24a44] bg-black/45 p-3"><img src={form.art_url} alt="Principal" className="h-full w-full object-contain" /></div>}
  {form.elite_art_url && <div className="flex-1 flex h-72 w-full items-center justify-center rounded-2xl border border-[#c05bff44] bg-black/45 p-3"><img src={form.elite_art_url} alt="Élite" className="h-full w-full object-contain" /></div>}
</div><CardFields form={{ ...form, onGenerateStats: generateStats, generatingStats }} onChange={onChange} onGenerate={generateImage} generating={generating} onUpload={uploadImage} uploading={uploading} /><div className="mt-5 flex gap-3"><button onClick={() => setPreviewOpen(true)} disabled={!form.name} className="flex-1 rounded-2xl border-2 border-[#ffd24a] px-5 py-3 font-heading font-black text-[#ffe49a] disabled:opacity-50">Vista previa</button><button onClick={saveCard} disabled={saving || !form.name} className="flex-1 rounded-2xl bg-[#ffd24a] px-5 py-3 font-heading font-black text-[#3a2600] disabled:opacity-50">{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear carta'}</button></div>{canDelete && editingId && <button onClick={deleteCard} disabled={deleting} className="mt-3 w-full rounded-2xl border-2 border-[#cc3333] bg-[#cc333318] px-5 py-3 font-heading font-black text-[#ff9d9d] hover:bg-[#cc3333] hover:text-white disabled:opacity-50 transition-colors">{deleting ? 'Borrando...' : 'Borrar carta'}</button>}{previewOpen && <CardPreviewModal form={form} onClose={() => setPreviewOpen(false)} />}</section><section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 shadow-2xl md:p-6"><div className="flex items-center justify-between gap-3"><h2 className="font-heading text-xl font-black text-[#ffe49a]">BD actual · {filteredCards.length} cartas</h2><BackupCardsButton cards={cards} /></div><div className="my-4 grid gap-3 md:grid-cols-[1fr_170px]"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, raza, tipo..." className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" /><select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]"><option value="all">Todas</option><option value="hero">Héroes</option><option value="spell">Hechizos</option><option value="melee_weapon">Armas CC</option><option value="ranged_weapon">Armas AD</option><option value="armor">Armaduras</option><option value="object">Objetos</option><option value="bonus">Bonus</option><option value="race">Razas</option></select></div><CardList cards={filteredCards} onEdit={startEdit} /></section></div></div></div>;
}