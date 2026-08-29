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
import ImageRetouchSection from '@/components/admin/ImageRetouchSection';
import { CLAN_COLORS } from '@/lib/cardData';
import { calcHeroMana } from '@/lib/heroMana';
import { balanceHeroStats } from '@/lib/heroStatBalance';

import { isSummonCard } from '@/lib/summonCards';

const emptyCard = { category: 'hero', card_id: '', number: '', name: '', title: '', clan: '', type: '', cost: '', cc: '', ad: '', he: '', hp: '', mana: '', power: '', velocidad: '', elite_velocidad: '', ability_name: '', ability_text: '', elite_ability_name: '', elite_ability_text: '', elite_cc: '', elite_ad: '', elite_he: '', elite_hp: '', tag: '', description: '', art_url: '', elite_art_url: '', image_prompt: '', ability_anim_url: '', ability_anim_desc: '', ability_anim_motion: 'auto', elite_ability_anim_url: '', elite_ability_anim_desc: '', elite_ability_anim_motion: 'auto', in_auction: true };
const numericFields = ['number', 'cost', 'cc', 'ad', 'he', 'hp', 'mana', 'power', 'velocidad', 'elite_cc', 'elite_ad', 'elite_he', 'elite_hp', 'elite_velocidad'];

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
  // Motor de IA para la generación de textos/stats (los modelos no estándar
  // consumen más créditos de integración).
  const [aiModel, setAiModel] = useState('automatic');
  // Motor de imagen: 'base44' (integrado de la plataforma) o 'openai'
  // (gpt-image-1, el generador de imágenes de ChatGPT, vía función backend).
  const [imageEngine, setImageEngine] = useState('base44');

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
      const role = form.type || '';
      const roleLine = role ? `Rol asignado por el admin: ${role === 'CC' ? 'Cuerpo a cuerpo' : role === 'AD' ? 'A distancia' : role === 'HE' ? 'Hechicero' : role}.` : 'Sin rol asignado. Decide el rol más coherente con el nombre y la raza y rellena "type" con CC, AD o HE.';
      const isBizarro = form.category === 'bizarro';
      const bizarroLine = isBizarro ? 'ES UN HÉROE BIZARRO: la habilidad debe ser RARA, absurda o surrealista, con humor negro o situaciones disparatadas, pero SIEMPRE encajando en una mecánica implementable del catálogo.' : '';
      const artLine = form.art_url ? `Imagen de referencia disponible (ya generada): mírala en el contexto y haz que la habilidad y el título reflejen lo que se ve en la ilustración.` : '';
      const prompt = `Actúa como diseñador del juego de cartas Bizarre Fantasies.
      Genera estadísticas y habilidades para esta carta:
      Nombre: ${form.name}
      Título/subtítulo actual: ${form.title || '(vacío — inventa uno corto y épico)'}
      Raza/Clan: ${form.clan}
      Categoría: ${form.category}
      ${roleLine}
      ${bizarroLine}
      ${artLine}

      REGLAS DE STATS — el stat PRIMARIO del rol debe ser el MÁS ALTO:
      - CC (Cuerpo a cuerpo): el stat "cc" debe ser el más alto de los tres (cc > ad, cc > he). Refleja fuerza bruta.
      - AD (A distancia): el stat "ad" debe ser el más alto (ad > cc, ad > he). Refleja puntería y disparos.
      - HE (Hechicero): el stat "he" debe ser el más alto (he > cc, he > ad). Refleja poder mágico.
      - Los otros dos stats secundarios deben ser claramente más bajos (1-2 puntos por debajo del primario).

      INFLUENCIA DE LA RAZA en los stats (ajusta dentro del rol):
      - Guerreros: cc alto, hp alto (tanques), velocidad media-baja. Coste alto.
      - Vaqueros: ad alto, velocidad alta (rápidos disparando), hp medio-bajo. Coste medio.
      - Elfos: ad o he alto, velocidad alta (ágiles), hp bajo. Coste medio.
      - Magos: he muy alto, hp bajo, velocidad baja (frágiles). Mana alto. Coste medio-alto.
      - Druidas: he medio-alto, hp medio, habilidades de curación/naturaleza. Coste medio.
      - No-muertos: stats equilibrados, hp medio-alto, habilidades siniestras. Coste medio.
      - Épicas: todos los stats más altos de lo normal, coste alto (suelen rondar 25-30).
      - Cotidianos: stats bajos (1-5), coste bajo (10-15), habilidades sencillas.
      - Bizarros: stats impredecibles y desequilibrados (puede tener un stat rarísimo), habilidades absurdas.

      Rangos de balance:
      - Stats (cc, ad, he, power): 1 a 10 (Épicas pueden llegar a 12).
      - Hp: 15 a 45 (tanques hasta 45, frágiles desde 15).
      - Cost: 10 a 30 (tokens o cotidianos pueden bajar a 8).
      - Mana: 8 a 15 (hechiceros alto, CC/AD bajo).

      HABILIDADES — DEBEN ser implementables por el motor del juego.
      Solo puedes usar UNA de estas mecánicas (elige la que mejor encaje con el nombre, raza, tipo e imagen):
      - attack_bonus_per_ally: al atacar inflige daño extra por cada aliado vivo. (Guerreros, líderes).
      - heal_allies_per_turn: cura X de vida a todo su equipo al inicio de cada ronda. (Druidas, sacerdotes).
      - heal_allies_now: al usar la habilidad cura X de vida a todo su equipo. (Druidas, No-muertos necromantes).
      - damage_enemy: inflige X de daño directo a un rival (o a todos si es área). (Magos, Vaqueros, No-muertos).
      - buff_self: sube un stat propio (cc, ad o he) al usar la habilidad. (Guerreros berserker, duelistas).
      - shield_self: se otorga un escudo de X puntos. (Tanques, protectores).
      - summon_token: invoca un token/criatura aliada. (Nigromantes, invocadores bizarros).
      - drenaje: inflige X de daño a un rival y el héroe se cura esa misma cantidad. (No-muertos, vampiros).
      - emborrachar: deja BORRACHO a un rival X turnos (-3 a sus atributos, algo de daño y 35% de fallar cada acción). (Bizarros, taberneros).
      - confundir: deja CONFUSO a un rival X turnos (50% de fallar cada acción). (Bizarros, ilusionistas).
      - dormir / paralizar / silenciar a un rival durante X turnos.
      - marcar: el rival marcado recibe +X de daño.
      - recuperar_carta: roba una carta de la pila de descartes y la devuelve a la mano. (Nigromantes, chatarreros).
      - penalizar: -X a los atributos de un rival (o de todos) durante X turnos.

      IMPORTANTE: el texto de la habilidad debe indicar los NÚMEROS concretos (daño, curación, turnos) para que el motor la ejecute tal cual.

      La habilidad (ability_name corto + ability_text descriptivo) debe tener SINERGIA con:
      - El NOMBRE del héroe (si se llama "Piromaníaco", la habilidad va de fuego → damage_enemy).
      - La RAZA (un druida cura o invoca; un guerrero golpea o se buffa; un no-muerto daña o invoca).
      - El TIPO/rol (un CC suele buff_self o shield_self; un AD suele damage_enemy; un HE suele damage_enemy o heal).
      - La IMAGEN si está disponible (describe lo que ves y haz que la habilidad lo refleje).
      ${isBizarro ? 'Al ser BIZARRO, la habilidad debe ser RARA/absurda PERO usando una de las mecánicas de arriba (ej: "Lanza gatos" = summon_token, "Risa contagiosa" = heal_allies_now, "Tirita un ojo" = damage_enemy).' : ''}

      Si es Héroe, genera su versión Élite (elite_cc, elite_ad, elite_he, elite_hp, elite_ability_name, elite_ability_text) aumentando stats (+1 a +3) y mejorando su habilidad (mismo efecto, más potente).

      IMPORTANTE: No devuelvas ningún texto extra, solo un JSON estricto con las siguientes claves (si no aplican usa null o vacío):
      "cost", "cc", "ad", "he", "hp", "mana", "power", "type", "ability_name", "ability_text", "elite_cc", "elite_ad", "elite_he", "elite_hp", "elite_ability_name", "elite_ability_text", "description", "title"`;
      
      const response = await base44.integrations.Core.InvokeLLM({ 
        prompt, 
        ...(aiModel !== 'automatic' ? { model: aiModel } : {}),
        response_json_schema: { 
          type: "object", 
          properties: {
            cost: { type: "number" }, cc: { type: "number" }, ad: { type: "number" }, he: { type: "number" }, hp: { type: "number" }, mana: { type: "number" }, power: { type: "number" }, type: { type: "string" }, ability_name: { type: "string" }, ability_text: { type: "string" }, elite_cc: { type: "number" }, elite_ad: { type: "number" }, elite_he: { type: "number" }, elite_hp: { type: "number" }, elite_ability_name: { type: "string" }, elite_ability_text: { type: "string" }, description: { type: "string" }, title: { type: "string" }
          }
        } 
      });
      
      // El rol del ADMIN manda: si eligió CC/AD/HE, los stats se balancean a
      // ESE rol (stat primario el más alto) y el campo "type" se respeta — la
      // IA no puede sobreescribirlo (antes lo cambiaba y "le quitaba el rol").
      // Si no eligió rol, decide la IA.
      const chosenRole = form.type || (response && response.type) || '';
      const resData = balanceHeroStats(response || {}, chosenRole);
      if (form.type) resData.type = form.type;
      else if (resData.type == null) resData.type = chosenRole || '';
      // Velocidad: refleja el stat primario (CC/AD/HE) del rol definitivo.
      const _v = resData.type === 'CC' ? resData.cc : resData.type === 'AD' ? resData.ad : resData.he;
      const _ev = resData.type === 'CC' ? resData.elite_cc : resData.type === 'AD' ? resData.elite_ad : resData.elite_he;
      // Maná: se calcula con la fórmula (MANA_BASE[tipo] + clan.manaBonus), no
      // lo genera la IA. Así la BD siempre es la fuente de verdad del maná.
      const _mana = calcHeroMana(resData.type || form.type, form.clan);
      setForm(prev => ({
        ...prev,
        ...resData,
        mana: _mana,
        velocidad: (_v != null && _v !== '' && !isNaN(Number(_v))) ? Number(_v) : prev.velocidad,
        elite_velocidad: (_ev != null && _ev !== '' && !isNaN(Number(_ev))) ? Number(_ev) : prev.elite_velocidad,
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
      // Velocidad: refleja automáticamente el stat primario (CC/AD/HE) del
      // héroe al cambiar sus stats manualmente o al cambiar el rol. Si el
      // admin edita la velocidad directamente (name === 'velocidad'), se
      // respeta su valor (no se sobreescribe).
      if (['hero', 'bizarro'].includes(next.category) && ['cc', 'ad', 'he', 'type'].includes(name)) {
        const primary = next.type === 'CC' ? next.cc : next.type === 'AD' ? next.ad : next.he;
        if (primary != null && primary !== '' && !isNaN(Number(primary))) next.velocidad = Number(primary);
      }
      if (['hero', 'bizarro'].includes(next.category) && ['elite_cc', 'elite_ad', 'elite_he', 'type'].includes(name)) {
        const ePrimary = next.type === 'CC' ? next.elite_cc : next.type === 'AD' ? next.elite_ad : next.elite_he;
        if (ePrimary != null && ePrimary !== '' && !isNaN(Number(ePrimary))) next.elite_velocidad = Number(ePrimary);
      }
      // Maná: se recalcula con la fórmula al cambiar el tipo o el clan (igual
      // que la velocidad con el stat primario). Si el admin edita el maná
      // directamente (name === 'mana'), se respeta su valor.
      if (['hero', 'bizarro'].includes(next.category) && ['type', 'clan'].includes(name)) {
        next.mana = calcHeroMana(next.type, next.clan);
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

  // Seguro anti-bloqueo: si la IA o la subida se quedan colgadas, el botón se
  // desbloquea con un error en vez de quedarse en "Creando…" para siempre.
  function withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado en ' + label)), ms)),
    ]);
  }

  // Genera con imágenes de referencia y, si la IA falla por culpa de alguna
  // referencia (URL que no puede leer), reintenta sin ellas para no dejar al
  // admin con el botón "Generando…" colgado para siempre.
  async function genImageWithFallback(prompt, refs) {
    if (imageEngine === 'gemini') {
      const res = await base44.functions.invoke('generateImageGemini', { prompt, reference_urls: refs });
      if (res?.data?.error) throw new Error(res.data.error);
      return res?.data;
    }
    if (imageEngine === 'openai') {
      const res = await base44.functions.invoke('generateImageOpenAI', { prompt, reference_urls: refs, size: '1024x1536' });
      if (res?.data?.error) throw new Error(res.data.error);
      return res?.data;
    }
    if (!refs.length) return base44.integrations.Core.GenerateImage({ prompt });
    try {
      return await base44.integrations.Core.GenerateImage({ prompt, existing_image_urls: refs });
    } catch (err) {
      console.error('Generación con referencia fallida, reintento sin referencia', err);
      return base44.integrations.Core.GenerateImage({ prompt });
    }
  }

  async function cropAndUpload(url) {
    // La imagen RELLENA todo el marco 7:10 de la carta (modo cover): se escala
    // hasta cubrir el lienzo completo y se recorta el sobrante centrado, de
    // forma que el arte ocupa toda la carta sin franjas ni fondos difuminados.
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      // Seguro anti-cuelgue: si la imagen no carga (CORS/red), se usa la URL original.
      const guard = setTimeout(() => resolve(url), 20000);
      img.onload = async () => {
        clearTimeout(guard);
        const TARGET_W = 700;
        const TARGET_H = 1000;
        const srcRatio = img.width / img.height;
        // Si la imagen ya viene en el formato 7:10 de la carta (retoques sobre
        // una imagen ya recortada), no se recorta nada: así no se pierden
        // elementos por los bordes.
        if (Math.abs(srcRatio - 0.7) < 0.02) { resolve(url); return; }
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
      img.onerror = () => { clearTimeout(guard); resolve(url); };
      img.src = url;
    });
  }

  async function generateImage(target = 'art_url') {
    if (!form.image_prompt) return;
    setGenerating(target);
    const clanColor = CLAN_COLORS[form.clan];
    const clanBg = clanColor ? ` FONDO OBLIGATORIO: el fondo debe ser un degradado atmosférico basado en el color ${clanColor} (color distintivo de la raza ${form.clan}), desde tonos oscuros de ese color en los bordes hacia tonos más luminosos y vibrantes del mismo color detrás del personaje, con ambiente y luz ambiental de ese color.` : '';
    // Élite: si existe el arte normal, se usa como referencia obligatoria para
    // que sea EXACTAMENTE el mismo personaje, solo que más frenético y épico.
    const isElite = target === 'elite_art_url' && !!form.art_url;
    const eliteRule = isElite ? ` VERSIÓN ÉLITE — REGLA CRÍTICA: la imagen de referencia adjunta es la versión NORMAL de este personaje y sirve SOLO para mantener su identidad: misma cara, misma especie, mismos colores base, misma ropa/armadura reconocible. PROHIBIDO cambiarlo por otro personaje. PROHIBIDO TAMBIÉN copiar o reproducir la referencia: la imagen élite debe ser CLARAMENTE DIFERENTE de ella, una EVOLUCIÓN mucho más poderosa. Cambia OBLIGATORIAMENTE: pose y encuadre nuevos y más frenéticos, expresión mucho más intensa y feroz, aura y energía épica desbordante, armadura/equipo mejorados y ornamentados, efectos de poder (grietas luminosas, chispas, partículas), iluminación mucho más dramática y contrastada. Si la imagen resultante se parece a la referencia, es incorrecta.` : '';
    const prompt = `Ilustración que RELLENA POR COMPLETO el lienzo entero de borde a borde y esquina a esquina, con cero relleno, cero márgenes y cero espacio de fondo visible en cualquier lado, ni siquiera una franja de 1 píxel. Prohibido absolutamente: marco, borde blanco/gris/de cualquier color, margen, passepartout, viñeta, fondo transparente, tarjeta o recuadro decorativo dentro de la imagen, texto o logos. ENCUADRE CON ZONA SEGURA: el personaje/objeto y todos los elementos importantes deben quedar cómodamente dentro de la zona central del lienzo, con amplio aire respecto a los cuatro bordes (nada importante pegado a los bordes), de forma que ningún recorte posterior corte cabeza, pies, manos ni la montura; la cara en el tercio superior-medio del lienzo. FORMATO FINAL VERTICAL 7:10 — MUY IMPORTANTE: la imagen se recortará después a un rectángulo VERTICAL centrado (proporción 7 de ancho por 10 de alto). Por tanto TODOS los elementos importantes (personaje completo, armas, accesorios, mascotas) deben caber dentro de la FRANJA VERTICAL CENTRAL del lienzo (el 60% central del ancho): nada importante en los laterales izquierdo o derecho, porque se perderán en el recorte. Composición vertical tipo retrato de cuerpo entero. El fondo (paisaje, textura o ambiente) pintado hasta el último borde y las cuatro esquinas, sin ninguna zona vacía. Nombre: ${form.name || 'Carta nueva'}. Tipo: ${form.category}. Raza o clan: ${form.clan || 'sin raza'}. Estilo: arte digital épico, oscuro, colorido, carta coleccionable.${clanBg}${eliteRule} Indicaciones del admin: ${form.image_prompt}`;
    // En la versión élite la ÚNICA referencia es el arte normal (identidad del
    // personaje). La foto de referencia del admin solo se usa en la normal:
    // mezclarlas hacía que la élite saliera casi idéntica a la normal.
    const refs = isElite ? [form.art_url] : refImages([]);
    try {
      const result = await withTimeout(genImageWithFallback(prompt, refs), 120000, 'la generación de la imagen');
      const rawUrl = result?.url;
      if (rawUrl) {
        const croppedUrl = await withTimeout(cropAndUpload(rawUrl), 60000, 'el recorte y subida de la imagen').catch(() => rawUrl);
        setForm(prev => ({ ...prev, [target]: croppedUrl }));
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo generar la imagen: ' + (err?.message || 'error desconocido') + '. Inténtalo de nuevo.');
    } finally {
      setGenerating(false);
    }
  }

  async function generateBattleArt(target = 'battle_art_url', customPrompt = '') {
    if (!form.name) return;
    setGenerating(target);
    try {
      const isElite = target === 'elite_battle_art_url';
      const refUrl = isElite ? (form.elite_art_url || form.art_url) : form.art_url;
      // El recuadro de batalla del juego es un rectángulo ancho y la imagen se
      // recorta a "cover": la escena debe ser panorámica, llegar hasta los
      // bordes y NO llevar marcos ni orlas pintadas (si los lleva, la escena
      // parece no ocupar todo el recuadro).
      const FRAME_RULE = ` COMPOSITION — MANDATORY: wide cinematic horizontal 16:9 panoramic composition, full-bleed edge-to-edge artwork that fills the whole image with scenery and action right up to all four edges. STRICTLY FORBIDDEN: any frame, border, ornate edge, card frame, plaque, passepartout, rounded corners, vignette, letterbox black bars, margins, empty padding, text, logo, watermark or signature.`;
      const hint = (customPrompt ? ` Additional art direction from the admin: ${customPrompt.trim()}.` : '') + FRAME_RULE;
      const prompt = isElite
        ? `Elite legendary battle scene of ${form.name}${form.title ? ', ' + form.title : ''} — a ${form.clan || 'dark fantasy'} hero in upgraded ultimate form. Glowing golden aura, enhanced ornate armor, fierce powerful combat stance, spectacular magical effects, battlefield background, anime-inspired dark fantasy art, premium golden legendary trading card game artwork.${hint}`
        : `Battle scene of ${form.name}${form.title ? ', ' + form.title : ''} — a ${form.clan || 'dark fantasy'} hero in the Bizarre Fantasies card game. Dynamic full-body combat pose, mid-action, dramatic cinematic lighting, battlefield background, anime-inspired dark fantasy illustration, intense atmosphere, detailed armor and magical effects, epic trading card game artwork.${hint}`;
      // La regla anti-marcos va TAMBIÉN al principio (máxima prioridad para el
      // motor de imagen): puesta solo al final, la IA seguía pintando orlas.
      const NO_FRAME_FIRST = `CRITICAL — ABSOLUTE RULE (HIGHEST PRIORITY, OVERRIDES EVERYTHING ELSE): NO FRAME AND NO BORDER OF ANY KIND. The illustration must be full-bleed, edge-to-edge, filling 100% of the image with scenery and action, with nothing drawn around it. STRICTLY FORBIDDEN: frames, borders, ornate edges, card frames, plaques, passepartout, rounded corners, vignettes, black bars, margins, padding, outlines around the image, text, logo, watermark, signature. THIS IS NON-NEGOTIABLE. `;
      const scenePrompt = NO_FRAME_FIRST + prompt;
      const refs = refImages(refUrl);
      // Si la referencia (arte de la carta) hace fallar al motor de imagen, se
      // reintenta sin referencia: así los tokens/bizarros con arte problemático
      // (p.ej. la Grulla) sí pueden generar su escena.
      let result;
      try {
        result = await withTimeout(genImageWithFallback(scenePrompt, refs), 120000, 'la generación de la imagen');
      } catch (e) {
        console.error('Escena con referencia fallida, reintento sin referencia', e);
        result = await withTimeout(genImageWithFallback(scenePrompt, []), 120000, 'la generación de la imagen');
      }
      if (result?.url) {
        setForm(prev => ({ ...prev, [target]: result.url }));
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo generar la escena de batalla: ' + (err?.message || 'error desconocido') + '. Inténtalo de nuevo.');
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
    const stats = { cc: bump(form.cc), ad: bump(form.ad), he: bump(form.he), hp: bump(form.hp), velocidad: bump(form.velocidad), elite_cc: bump(form.elite_cc), elite_ad: bump(form.elite_ad), elite_he: bump(form.elite_he), elite_hp: bump(form.elite_hp), elite_velocidad: bump(form.elite_velocidad) };
    const newCost = Math.round((Number(form.cost) || 0) * 1.1) + 1;
    setForm(prev => ({ ...prev, ...stats, cost: newCost }));
    if (editingId) {
      setSaving(true);
      await base44.entities.Card.update(editingId, { ...stats, cost: newCost });
      await loadCards();
      setSaving(false);
    }
  }

  // RETOQUE: parte de la imagen actual y pide a la IA que la reproduzca
  // idéntica cambiando SOLO lo indicado por el admin. La imagen actual es la
  // ÚNICA referencia (sin foto de referencia extra) para que no se reinvente.
  async function generateRetouch(target, instructions) {
    const src = form[target];
    if (!src || !instructions?.trim()) return;
    setGenerating('__retouch_' + target);
    try {
      const prompt = `TAREA DE EDICIÓN DE IMAGEN (no es una creación nueva): la imagen de referencia adjunta es la versión ACTUAL y DEFINITIVA de esta carta. Debes reproducirla de forma EXACTA: mismo personaje con la misma cara y expresión, misma pose, mismo encuadre y composición, mismos colores, misma iluminación, mismo fondo, mismo estilo artístico. PROHIBIDO regenerar, reinterpretar, cambiar la pose, el encuadre o el fondo. EL ÚNICO CAMBIO PERMITIDO es este: ${instructions.trim()}. Todo lo demás debe permanecer idéntico a la referencia. El cambio añadido debe integrarse con el mismo estilo e iluminación de la imagen y quedar COMPLETAMENTE dentro del encuadre, sin tocar los bordes. Mantén exactamente la misma relación de aspecto y el mismo encuadre que la referencia. Sin texto, sin logos, sin marcos.`;
      const result = await withTimeout(genImageWithFallback(prompt, [src]), 120000, 'el retoque de la imagen');
      if (result?.url) {
        const isCardArt = target === 'art_url' || target === 'elite_art_url';
        const finalUrl = isCardArt
          ? await withTimeout(cropAndUpload(result.url), 60000, 'el recorte de la imagen').catch(() => result.url)
          : result.url;
        setForm(prev => ({ ...prev, [target]: finalUrl }));
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo retocar la imagen: ' + (err?.message || 'error desconocido') + '. Inténtalo de nuevo.');
    } finally {
      setGenerating(false);
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
      const result = await withTimeout(genImageWithFallback(prompt, refs), 120000, 'la generación de la imagen');
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
    const matchesCategory = category === 'all'
      ? true
      : category === 'summon'
        ? isSummonCard(card)
        : card.category === category && !(category === 'bizarro' && isSummonCard(card));
    const matchesClan = clanFilter === 'all' || card.clan === clanFilter;
    const text = `${card.name || ''} ${card.title || ''} ${card.clan || ''} ${card.type || ''}`.toLowerCase();
    return matchesCategory && matchesClan && text.includes(query.toLowerCase());
  }), [cards, query, category, clanFilter]);

  if (checking) return <div className="min-h-screen bg-[#0e0a16] p-8 text-[#efe9dc]">Cargando backoffice...</div>;
  if (!user) return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Backoffice Admin</h1><p className="mt-4 text-[#cfc6dd]">Inicia sesión con tu cuenta de administrador para acceder.</p><Link to="/login" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Iniciar sesión</Link><div className="mt-4"><Link to="/" className="text-sm text-[#ffe49a] underline">Volver al juego</Link></div></div>;
  if (user.role !== 'admin') return <div className="min-h-screen bg-[#0e0a16] p-8 text-center text-[#efe9dc]"><h1 className="font-heading text-3xl font-black">Backoffice Admin</h1><p className="mt-4 text-[#cfc6dd]">Esta zona sólo está disponible para administradores. Has iniciado sesión como {user.email}.</p><Link to="/" className="mt-6 inline-block rounded-xl bg-[#ffd24a] px-5 py-3 font-black text-[#3a2600]">Volver al juego</Link></div>;

  return <div className="min-h-screen bg-[#0e0a16] px-4 py-6 text-[#efe9dc] md:px-8"><div className="mx-auto max-w-7xl"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-heading text-3xl font-black text-[#fff5dc]">Backoffice de cartas</h1><p className="mt-1 text-sm text-[#cfc6dd]">Crea cartas por tipo y raza, genera imágenes con IA y edita la base de datos actual.</p></div><Link to="/admin/ia" className="rounded-xl border border-[#7ab8ff66] px-4 py-2 text-sm font-black text-[#a8d0ff] hover:bg-[#7ab8ff] hover:text-[#0e1a2a]">Aprendizaje IA</Link><Link to="/admin/subastas" className="rounded-xl border border-[#66ffaa66] px-4 py-2 text-sm font-black text-[#9dffcf] hover:bg-[#66ffaa] hover:text-[#0a1f0e]">Control de subastas</Link><Link to="/admin/news" className="rounded-xl border border-[#c06bff66] px-4 py-2 text-sm font-black text-[#e2b0ff] hover:bg-[#c06bff] hover:text-white">Cartel Actualidad</Link><Link to="/admin/chat" className="rounded-xl border border-[#ff6b9d66] px-4 py-2 text-sm font-black text-[#ff9fbd] hover:bg-[#ff6b9d] hover:text-white">Chat y emojis</Link><Link to="/admin/jugadores" className="rounded-xl border border-[#ffb34a66] px-4 py-2 text-sm font-black text-[#ffcf8a] hover:bg-[#ffb34a] hover:text-[#3a2600]">Jugadores</Link><Link to="/" className="rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600]">Volver al juego</Link></div><div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]"><section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 shadow-2xl md:p-6"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-heading text-xl font-black text-[#ffe49a]">{editingId ? 'Editar carta' : 'Crear carta nueva'}</h2>{editingId && <button onClick={startNew} className="rounded-lg border border-[#ffd24a44] px-3 py-1.5 text-xs font-black text-[#ffe49a]">Nueva carta</button>}</div><div className="mb-4 flex gap-4">
  {form.art_url && <div className="flex-1 max-w-[210px] aspect-[7/10] overflow-hidden rounded-2xl border border-[#ffd24a44] bg-black/45"><img src={form.art_url} alt="Principal" className="h-full w-full object-cover" /></div>}
  {form.elite_art_url && <div className="flex-1 max-w-[210px] aspect-[7/10] overflow-hidden rounded-2xl border border-[#c05bff44] bg-black/45"><img src={form.elite_art_url} alt="Élite" className="h-full w-full object-cover" /></div>}
</div><ReferencePhotoSection referencePhoto={referencePhoto} useReferencePhoto={useReferencePhoto} onToggleUse={setUseReferencePhoto} onUpload={uploadReferencePhoto} onClear={() => { setReferencePhoto(''); setUseReferencePhoto(false); }} uploading={uploading} /><CardFields form={{ ...form, onGenerateStats: generateStats, generatingStats, aiModel, onAiModelChange: setAiModel, imageEngine, onImageEngineChange: setImageEngine }} onChange={onChange} onGenerate={generateImage} generating={generating} onUpload={uploadImage} uploading={uploading} onConvertEpic={convertToEpic} onLevelUp={levelUpHero} saving={saving} /><ImageRetouchSection form={form} onGenerate={generateRetouch} generating={generating} /><BattleArtSection form={form} onGenerate={handleBattleArtAction} generating={generating} /><AbilityAnimSection form={form} onChange={onChange} onGenerate={handleAbilityAnimAction} generating={generating} /><div className="mt-5 flex gap-3"><button onClick={() => setPreviewOpen(true)} disabled={!form.name} className="flex-1 rounded-2xl border-2 border-[#ffd24a] px-5 py-3 font-heading font-black text-[#ffe49a] disabled:opacity-50">Vista previa</button><button onClick={saveCard} disabled={saving || !form.name} className="flex-1 rounded-2xl bg-[#ffd24a] px-5 py-3 font-heading font-black text-[#3a2600] disabled:opacity-50">{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear carta'}</button></div>{canDelete && editingId && <button onClick={deleteCard} disabled={deleting} className="mt-3 w-full rounded-2xl border-2 border-[#cc3333] bg-[#cc333318] px-5 py-3 font-heading font-black text-[#ff9d9d] hover:bg-[#cc3333] hover:text-white disabled:opacity-50 transition-colors">{deleting ? 'Borrando...' : 'Borrar carta'}</button>}{previewOpen && <CardPreviewModal form={form} onClose={() => setPreviewOpen(false)} />}</section><section className="rounded-3xl border border-[#ffd24a33] bg-[#140d24]/90 p-4 shadow-2xl md:p-6"><div className="flex items-center justify-between gap-3"><h2 className="font-heading text-xl font-black text-[#ffe49a]">BD actual · {filteredCards.length} cartas</h2><BackupCardsButton cards={cards} /></div><div className="my-4 grid gap-3 md:grid-cols-[1fr_160px_160px]"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, raza, tipo..." className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]" /><select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]"><option value="all">Todos los tipos</option><option value="hero">Héroes</option><option value="spell">Hechizos</option><option value="melee_weapon">Armas CC</option><option value="ranged_weapon">Armas AD</option><option value="armor">Armaduras</option><option value="object">Objetos</option><option value="bonus">Bonus</option><option value="bizarro">Héroes bizarros</option><option value="summon">Invocaciones</option><option value="race">Razas</option></select><select value={clanFilter} onChange={(e) => setClanFilter(e.target.value)} className="rounded-xl border border-[#ffd24a33] bg-black/45 px-3 py-2 text-sm text-[#fff5dc] outline-none focus:border-[#ffd24a]"><option value="all">Todas las razas</option>{clans.map(clan => <option key={clan} value={clan}>{clan}</option>)}</select></div><CardList cards={filteredCards} onEdit={startEdit} /></section></div></div></div>;
}