import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import CardFields from '@/components/admin/CardFields';
import CardPreviewModal from '@/components/admin/CardPreviewModal';
import CardList from '@/components/admin/CardList';
import BackupCardsButton from '@/components/admin/BackupCardsButton';
import BattleArtSection from '@/components/admin/BattleArtSection';
import AbilityAnimSection from '@/components/admin/AbilityAnimSection';
import ReferencePhotoSection from '@/components/admin/ReferencePhotoSection';
import { CLAN_COLORS } from '@/lib/cardData';

const emptyCard = { category: 'hero', card_id: '', number: '', name: '', title: '', clan: '', type: '', cost: '', cc: '', ad: '', he: '', hp: '', mana: '', power: '', ability_name: '', ability_text: '', elite_ability_name: '', elite_ability_text: '', elite_cc: '', elite_ad: '', elite_he: '', elite_hp: '', tag: '', description: '', art_url: '', elite_art_url: '', image_prompt: '', ability_anim_url: '', ability_anim_desc: '', elite_ability_anim_url: '', elite_ability_anim_desc: '', in_auction: true };
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
  const [clanFilter, setClanFilter] = useState('all');
  const [form, setForm] = useState(emptyCard);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [referencePhoto, setReferencePhoto] = useState('');
  const [useReferencePhoto, setUseReferencePhoto] = useState(false);
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
      if (name === 'category' && value === 'bizarro') {
        next.clan = 'Bizarros';
        next.clan_color = CLAN_COLORS.Bizarros;
        next.in_auction = false;
      } else if (name === 'category' && prev.category === 'bizarro' && value !== 'bizarro') {
        next.clan = '';
        next.clan_color = '';
        next.in_auction = true;
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
    // La imagen RELLENA todo el marco 7:10 de la carta (modo cover): se escala
    // hasta cubrir el lienzo completo y se recorta el sobrante centrado, de
    // forma que el arte ocupa toda la carta sin franjas ni fondos difuminados.
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
        let sx, sy, sw, sh;
        if (srcRatio > dstRatio) { sh = img.height; sw = img.height * dstRatio; sx = (img.width - sw) / 2; sy = 0; }
        else { sw = img.width; sh = img.width / dstRatio; sx = 0; sy = (img.height - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H);
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
    // Élite: si existe el arte normal, se usa como referencia obligatoria para
    // que sea EXACTAMENTE el mismo personaje, solo que más frenético y épico.
    const isElite = target === 'elite_art_url' && !!form.art_url;
    const eliteRule = isElite ? ` VERSIÓN ÉLITE — REGLA CRÍTICA: la imagen de referencia adjunta es la versión normal de este personaje. Debes representar EXACTAMENTE AL MISMO PERSONAJE: misma cara, mismo cuerpo, misma especie, mismos colores, misma ropa/armadura base y mismos rasgos reconocibles. PROHIBIDO cambiarlo por otro personaje o alterar su identidad. Solo evoluciona su aspecto: pose más frenética y dinámica, expresión más intensa, aura/energía épica, detalles más bizarros y espectaculares (grietas de poder, brillos, mejoras en su equipo), iluminación más dramática.` : '';
    const prompt = `Ilustración que RELLENA POR COMPLETO el lienzo entero de borde a borde y esquina a esquina, con cero relleno, cero márgenes y cero espacio de fondo visible en cualquier lado, ni siquiera una franja de 1 píxel. Prohibido absolutamente: marco, borde blanco/gris/de cualquier color, margen, passepartout, viñeta, fondo transparente, tarjeta o recuadro decorativo dentro de la imagen, texto o logos. ENCUADRE CON ZONA SEGURA: el personaje/objeto y todos los elementos importantes deben quedar cómodamente dentro de la zona central del lienzo, con amplio aire respecto a los cuatro bordes (nada importante pegado a los bordes), de forma que ningún recorte posterior corte cabeza, pies, manos ni la montura; la cara en el tercio superior-medio del lienzo. El fondo (paisaje, textura o ambiente) pintado hasta el último borde y las cuatro esquinas, sin ninguna zona vacía. Nombre: ${form.name || 'Carta nueva'}. Tipo: ${form.category}. Raza o clan: ${form.clan || 'sin raza'}. Estilo: arte digital épico, oscuro, colorido, carta coleccionable.${clanBg}${eliteRule} Indicaciones del admin: ${form.image_prompt}`;
    const refs = refImages(isElite ? [form.art_url] : []);
    const result = await base44.integrations.Core.GenerateImage(refs.length ? { prompt, existing_image_urls: refs } : { prompt });
    const rawUrl = result?.url;
    if (rawUrl) {
      const croppedUrl = await cropAndUpload(rawUrl);
      setForm(prev => ({ ...prev, [target]: croppedUrl }));
    }
    setGenerating(false);
  }

  async function generateBattleArt(target = 'battle_art_url', customPrompt = '') {
    if (!form.name) return;
    setGenerating(target);
    try {
      const isElite = target === 'elite_battle_art_url';
      const refUrl = isElite ? (form.elite_art_url || form.art_url) : form.art_url;
      const hint = customPrompt ? ` Additional art direction from the admin: ${customPrompt.trim()}.` : '';
      const prompt = isElite
        ? `Elite legendary battle scene of ${form.name}${form.title ? ', ' + form.title : ''} — a ${form.clan || 'dark fantasy'} hero in upgraded ultimate form. Glowing golden aura, enhanced ornate armor, fierce powerful combat stance, spectacular magical effects, battlefield background, anime-inspired dark fantasy art, premium golden legendary trading card game artwork.${hint}`
        : `Battle scene of ${form.name}${form.title ? ', ' + form.title : ''} — a ${form.clan || 'dark fantasy'} hero in the Bizarre Fantasies card game. Dynamic full-body combat pose, mid-action, dramatic cinematic lighting, battlefield background, anime-inspired dark fantasy illustration, intense atmosphere, detailed armor and magical effects, epic trading card game artwork.${hint}`;
      const refs = refImages(refUrl);
      const result = await base44.integrations.Core.GenerateImage(refs.length ? { prompt, existing_image_urls: refs } : { prompt });
      if (result?.url) {
        setForm(prev => ({ ...prev, [target]: result.url }));
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo generar la escena de batalla.');
    } finally {
      setGenerating(false);
    }
  }

  async function convertToEpic() {
    if (!['hero', 'bizarro'].includes(form.category)) return;
    const newCost = (Number(form.cost) || 0) + 20;
    setForm(prev => ({ ...prev, clan: 'Épicas', clan_color: CLAN_COLORS['Épicas'], cost: newCost }));
    if (editingId) {
      setSaving(true);
      await base44.entities.Card.update(editingId, { clan: 'Épicas', clan_color: CLAN_COLORS['Épicas'], cost: newCost });
      await loadCards();
      setSaving(false);
    }
  }

  async function levelUpHero() {
    if (!['hero', 'bizarro'].includes(form.category)) return;
    const bump = (v) => (v != null && v !== '' && !isNaN(Number(v))) ? Number(v) + 1 : v;
    const stats = { cc: bump(form.cc), ad: bump(form.ad), he: bump(form.he), hp: bump(form.hp), elite_cc: bump(form.elite_cc), elite_ad: bump(form.elite_ad), elite_he: bump(form.elite_he), elite_hp: bump(form.elite_hp) };
    const newCost = Math.round((Number(form.cost) || 0) * 1.1) + 1;
    setForm(prev => ({ ...prev, ...stats, cost: newCost }));
    if (editingId) {
      setSaving(true);
      await base44.entities.Card.update(editingId, { ...stats, cost: newCost });
      await loadCards();
      setSaving(false);
    }
  }

  function handleBattleArtAction(target, value) {
    if (target === '__set_battle_art_url') {
      setForm(prev => ({ ...prev, battle_art_url: value }));
    } else if (target === '__set_elite_battle_art_url') {
      setForm(prev => ({ ...prev, elite_battle_art_url: value }));
    } else {
      generateBattleArt(target, value);
    }
  }

  async function generateAbilityAnim(target = 'ability_anim_url', customPrompt = '') {
    if (!form.name) return;
    setGenerating(target);
    try {
      const isElite = target === 'elite_ability_anim_url';
      const refUrl = isElite ? (form.elite_art_url || form.art_url) : form.art_url;
      const abilityName = isElite ? (form.elite_ability_name || form.ability_name || form.name) : (form.ability_name || form.name);
      // Equipamiento (hechizos/armas/objetos…) no tiene ability_text: se usa la
      // descripción de la carta como contexto de la cinemática.
      const abilityDesc = isElite ? (form.elite_ability_text || form.ability_text || form.description) : (form.ability_text || form.description);
      const hint = customPrompt ? ` Additional art direction from the admin: ${customPrompt.trim()}.` : '';
      // El fondo debe ser NEGRO PURO y el personaje AISLADO para que el
      // recorte (canvas → transparente) deje sola la criatura sobre el
      // overlay, igual que las cinemáticas del Transformer/Tanque/Patitos.
      // La regla va PRIMERO y al FINAL para que la IA la priorice sobre la
      // escena que pudiera inferir de la descripción de la habilidad.
      // Para la versión ÉLITE se refuerza aún más: prohibido fondo claro/dorado.
      const BG_RULE = `CRITICAL — ABSOLUTE RULE (HIGHEST PRIORITY, OVERRIDES EVERYTHING ELSE): the ENTIRE background MUST be PURE SOLID BLACK (hex #000000), a flat black void, zero variation. The character/creature MUST appear ISOLATED and floating in this pure black void, like a figurine cut out. STRICTLY FORBIDDEN: any scene, battlefield, environment, landscape, sky, ground, floor, wall, horizon, background props, furniture, nature, smoke clouds behind the figure, text, logo, signature, watermark, frame, border, plaque, vignette, gradient background, colored background, white background, light background, golden background. Any non-character pixels MUST be pure #000000 black. Only the full-body character (with its magical effects and glowing aura) is visible, erupting against the pure black. THIS IS NON-NEGOTIABLE — if the background is not pure black the image is useless.`;
      const BG_TAIL = ` REMINDER: pure #000000 black void background, character isolated, no scene whatsoever, absolutely no white or light background.`;
      const prompt = isElite
        ? `${BG_RULE} Epic 3D cinematic illustration of ${form.name}${form.title ? ', ' + form.title : ''} casting their ELITE ability "${abilityName || ''}". ${abilityDesc || ''} Spectacular magical energy, glowing aura (NOT a bright/golden background, only the aura glows against pure black), enhanced ornate armor, fierce powerful combat pose, dramatic cinematic lighting, anime-inspired dark fantasy art, premium legendary trading card game ability artwork. The background stays pure black even with the elite glow.${hint}${BG_TAIL}`
        : `${BG_RULE} 3D cinematic illustration of ${form.name}${form.title ? ', ' + form.title : ''} casting their ability "${abilityName || ''}". ${abilityDesc || ''} Dynamic full-body action pose, mid-action, dramatic cinematic lighting, dark fantasy anime art style, epic trading card game ability artwork.${hint}${BG_TAIL}`;
      const refs = refImages(refUrl);
      const result = await base44.integrations.Core.GenerateImage(refs.length ? { prompt, existing_image_urls: refs } : { prompt });
      if (result?.url) {
        setForm(prev => ({ ...prev, [target]: result.url }));
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo generar el arte de la animación 3D.');
    } finally {
      setGenerating(false);
    }
  }

  function handleAbilityAnimAction(target, value) {
    if (target === '__set_ability_anim_url') {
      setForm(prev => ({ ...prev, ability_anim_url: value }));
    } else if (target === '__set_elite_ability_anim_url') {
      setForm(prev => ({ ...prev, elite_ability_anim_url: value }));
    } else {
      generateAbilityAnim(target, value);
    }
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

  async function uploadReferencePhoto(file) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result?.file_url) {
        setReferencePhoto(result.file_url);
        setUseReferencePhoto(true);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo subir la foto de referencia.');
    } finally {
      setUploading(false);
    }
  }

  // Construye la lista de existing_image_urls para una generación: añade la
  // foto de referencia subida por el admin cuando tiene la casilla activada.
  function refImages(base) {
    const arr = Array.isArray(base) ? base.filter(Boolean) : (base ? [base] : []);
    return useReferencePhoto && referencePhoto ? [...arr, referencePhoto] : arr;
  }

  const clans = useMemo(() => {
    const set = new Set();
    cards.forEach(c => { if (c.clan) set.add(c.clan); });
    return [...set].sort((a, b) => a.localeCompare(b, 'es'));
  }, [cards]);

  const filteredCards = useMemo(() => cards.filter(card => {
    const matchesCategory = category === 'all' || card.category === category;
    const matchesClan = clanFilter === 'all' || card.clan === clanFilter;
    const text = `${card.name || ''} ${card.title || ''} ${card.clan || ''} ${card.type || ''}`.toLowerCase();
    return matchesCategory && matchesClan && text.includes(query.toLowerCase());
  }), [cards, query, category, clanFilter]);

  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando backoffice...</div>;
  if (!user) return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Backoffice Admin</h1><p className="mt-4 text-[#cfc6dd]">Inicia sesión con tu cuenta de administrador para acceder.</p><Link to="/login" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Iniciar sesión</Link><div className="mt-4"><Link to="/" className="text-sm text-[#ffe49a] underline">Volver al juego</Link></div></div>;
  if (user.role !== 'admin') return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Backoffice Admin</h1><p className="mt-4 text-[#cfc6dd]">Esta zona sólo está disponible para administradores. Has iniciado sesión como {user.email}.</p><Link to="/" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Volver al juego</Link></div>;

  return <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc] md:px-8"><div className="mx-auto max-w-7xl"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-heading text-3xl font-black text-[#fff5dc]">Backoffice de cartas</h1><p className="mt-1 text-sm text-[#cfc6dd]">Crea cartas por tipo y raza, genera imágenes con IA y edita la base de datos actual.</p></div><Link to="/admin/news" className="rounded-xl border border-[#c06bff66] px-4 py-2 text-sm font-black text-[#e2b0ff] hover:bg-[#c06bff] hover:text-white">Cartel Actualidad</Link><Link to="/" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Volver al juego</Link></div><div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]"><section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 shadow-2xl md:p-6"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-heading text-xl font-black text-[#ffe49a]">{editingId ? 'Editar carta' : 'Crear carta nueva'}</h2>{editingId && <button onClick={startNew} className="rounded-lg border border-[#ffd24a44] px-3 py-1.5 text-xs font-black text-[#ffe49a]">Nueva carta</button>}</div><div className="mb-4 flex gap-4">
  {form.art_url && <div className="flex-1 max-w-[210px] aspect-[7/10] overflow-hidden rounded-2xl border border-[#ffd24a44] bg-black/45"><img src={form.art_url} alt="Principal" className="h-full w-full object-cover" /></div>}
  {form.elite_art_url && <div className="flex-1 max-w-[210px] aspect-[7/10] overflow-hidden rounded-2xl border border-[#c05bff44] bg-black/45"><img src={form.elite_art_url} alt="Élite" className="h-full w-full object-cover" /></div>}
</div><ReferencePhotoSection referencePhoto={referencePhoto} useReferencePhoto={useReferencePhoto} onToggleUse={setUseReferencePhoto} onUpload={uploadReferencePhoto} onClear={() => { setReferencePhoto(''); setUseReferencePhoto(false); }} uploading={uploading} /><CardFields form={{ ...form, onGenerateStats: generateStats, generatingStats }} onChange={onChange} onGenerate={generateImage} generating={generating} onUpload={uploadImage} uploading={uploading} onConvertEpic={convertToEpic} onLevelUp={levelUpHero} saving={saving} /><BattleArtSection form={form} onGenerate={handleBattleArtAction} generating={generating} /><AbilityAnimSection form={form} onChange={onChange} onGenerate={handleAbilityAnimAction} generating={generating} /><div className="mt-5 flex gap-3"><button onClick={() => setPreviewOpen(true)} disabled={!form.name} className="flex-1 rounded-2xl border-2 border-[#ffd24a] px-5 py-3 font-heading font-black text-[#ffe49a] disabled:opacity-50">Vista previa</button><button onClick={saveCard} disabled={saving || !form.name} className="flex-1 rounded-2xl bg-[#ffd24a] px-5 py-3 font-heading font-black text-[#3a2600] disabled:opacity-50">{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear carta'}</button></div>{canDelete && editingId && <button onClick={deleteCard} disabled={deleting} className="mt-3 w-full rounded-2xl border-2 border-[#cc3333] bg-[#cc333318] px-5 py-3 font-heading font-black text-[#ff9d9d] hover:bg-[#cc3333] hover:text-white disabled:opacity-50 transition-colors">{deleting ? 'Borrando...' : 'Borrar carta'}</button>}{previewOpen && <CardPreviewModal form={form} onClose={() => setPreviewOpen(false)} />}</section><section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 shadow-2xl md:p-6"><div className="flex items-center justify-between gap-3"><h2 className="font-heading text-xl font-black text-[#ffe49a]">BD actual · {filteredCards.length} cartas</h2><BackupCardsButton cards={cards} /></div><div className="my-4 grid gap-3 md:grid-cols-[1fr_160px_160px]"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, raza, tipo..." className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" /><select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]"><option value="all">Todos los tipos</option><option value="hero">Héroes</option><option value="spell">Hechizos</option><option value="melee_weapon">Armas CC</option><option value="ranged_weapon">Armas AD</option><option value="armor">Armaduras</option><option value="object">Objetos</option><option value="bonus">Bonus</option><option value="bizarro">Héroes bizarros</option><option value="race">Razas</option></select><select value={clanFilter} onChange={(e) => setClanFilter(e.target.value)} className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]"><option value="all">Todas las razas</option>{clans.map(clan => <option key={clan} value={clan}>{clan}</option>)}</select></div><CardList cards={filteredCards} onEdit={startEdit} /></section></div></div></div>;
}