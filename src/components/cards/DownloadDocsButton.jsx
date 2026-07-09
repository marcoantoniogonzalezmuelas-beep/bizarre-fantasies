import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { GAME_RULES_DOC } from '@/lib/gameRulesDoc';
import { HERO_ART, SPELL_ART, MELEE_ART, RANGED_ART, ARMOR_ART, OBJECT_ART, BONUS_ART } from '@/lib/artUrls';

// Arte de cada carta: el guardado en la carta o, si falta, el del juego por número.
const artFor = (c) => {
  if (c.art_url) return c.art_url;
  const n = Number(c.number || 0);
  if (c.category === 'hero') return HERO_ART[n - 1];
  if (c.category === 'spell') return SPELL_ART[n - 46];
  if (c.category === 'melee_weapon') return MELEE_ART[n - 59];
  if (c.category === 'ranged_weapon') return RANGED_ART[n - 65];
  if (c.category === 'armor') return ARMOR_ART[n - 73];
  if (c.category === 'object') return OBJECT_ART[n - 83];
  if (c.category === 'bonus') return BONUS_ART[n - 92];
  return null;
};

const CAT_LABELS = { hero: 'Héroes', spell: 'Hechizos', melee_weapon: 'Armas cuerpo a cuerpo', ranged_weapon: 'Armas a distancia', armor: 'Armaduras', object: 'Objetos', bonus: 'Bonificadores' };
const CAT_ORDER = ['hero', 'spell', 'melee_weapon', 'ranged_weapon', 'armor', 'object', 'bonus'];

// Carga una imagen y devuelve una miniatura JPEG cuadrada (recorte centrado)
// como dataURL, para que el PDF no pese decenas de MB con el arte original.
const thumb = (url, px = 180) => new Promise((resolve) => {
  if (!url) return resolve(null);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const c = document.createElement('canvas');
      c.width = px; c.height = px;
      const s = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 4, s, s, 0, 0, px, px);
      resolve(c.toDataURL('image/jpeg', 0.78));
    } catch { resolve(null); }
  };
  img.onerror = () => resolve(null);
  img.src = url;
});

export default function DownloadDocsButton({ cards }) {
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      // Los Bizarros (fichas "tk_") no se mencionan en la documentación.
      const docCards = (cards || []).filter(c => !String(c.card_id || '').startsWith('tk_'));
      const heroes = docCards.filter(c => c.category === 'hero').sort((a, b) => (a.number || 0) - (b.number || 0));
      // Miniaturas: una por carta (héroes y equipamiento) y 3 grandes para la portada.
      const thumbs = {};
      await Promise.all(docCards.map(async c => { thumbs[c.id] = await thumb(artFor(c), 150); }));
      const coverArts = (await Promise.all(
        heroes.filter(h => artFor(h)).slice(0, 12).sort(() => Math.random() - 0.5).slice(0, 3).map(h => thumb(artFor(h), 420))
      )).filter(Boolean);

      const doc = new jsPDF();
      const GOLD = [184, 122, 20], INK = [45, 40, 55], SOFT = [110, 102, 125];
      let y = 0;

      // ---------- Portada ----------
      doc.setFillColor(18, 14, 28); doc.rect(0, 0, 210, 297, 'F');
      doc.setDrawColor(184, 122, 20); doc.setLineWidth(1); doc.rect(8, 8, 194, 281);
      doc.setLineWidth(0.3); doc.rect(11, 11, 188, 275);
      doc.setTextColor(255, 210, 74); doc.setFont('helvetica', 'bold');
      doc.setFontSize(34); doc.text('BIZARRE', 105, 52, { align: 'center' });
      doc.text('FANTASIES', 105, 66, { align: 'center' });
      doc.setFontSize(12); doc.setTextColor(200, 185, 220);
      doc.text('G U Í A   D E L   J U E G O   Y   C A R T A S', 105, 80, { align: 'center' });
      doc.setDrawColor(255, 210, 74); doc.setLineWidth(0.6); doc.line(60, 88, 150, 88);
      // Tres retratos de héroes enmarcados en oro
      const cw = 48, gap = 10, x0 = (210 - (coverArts.length * cw + (coverArts.length - 1) * gap)) / 2;
      coverArts.forEach((art, i) => {
        const x = x0 + i * (cw + gap);
        doc.setFillColor(255, 210, 74); doc.rect(x - 1.5, 118.5, cw + 3, cw + 3, 'F');
        doc.addImage(art, 'JPEG', x, 120, cw, cw);
      });
      doc.setFontSize(11); doc.setTextColor(255, 210, 74);
      doc.text('Base Set', 105, coverArts.length ? 186 : 130, { align: 'center' });
      doc.setFontSize(9); doc.setTextColor(150, 138, 170);
      doc.text('Subasta · Equipamiento · Combate por turnos', 105, coverArts.length ? 193 : 137, { align: 'center' });

      // ---------- Utilidades de texto (sangrías consistentes) ----------
      const pageBreak = (need = 10) => { if (y + need > 282) { doc.addPage(); y = 20; } };
      const line = (txt, size = 10, style = 'normal', color = INK, x = 20, width = 175) => {
        doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(color[0], color[1], color[2]);
        doc.splitTextToSize(String(txt || ''), width).forEach(r => {
          pageBreak(size * 0.5 + 2);
          doc.text(r, x, y); y += size * 0.5 + 1.6;
        });
      };
      const sectionTitle = (txt) => {
        pageBreak(16);
        doc.setFillColor(255, 210, 74); doc.rect(15, y - 4.2, 2.2, 6, 'F');
        line(txt, 13, 'bold', GOLD, 20, 175); y += 1.5;
      };
      const catHeader = (txt) => {
        pageBreak(18);
        doc.setFillColor(252, 243, 214); doc.rect(15, y - 5.2, 180, 8, 'F');
        doc.setFillColor(184, 122, 20); doc.rect(15, y - 5.2, 2.2, 8, 'F');
        line(txt, 12, 'bold', GOLD, 20, 175); y += 2.5;
      };

      // ---------- Reglas ----------
      doc.addPage(); y = 20;
      doc.setFillColor(18, 14, 28); doc.rect(0, 0, 210, 24, 'F');
      doc.setTextColor(255, 210, 74); doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
      doc.text('GUÍA DEL JUEGO', 15, 15);
      y = 34;
      GAME_RULES_DOC.forEach(([t, b]) => { sectionTitle(t); line(b, 10, 'normal', INK, 20, 175); y += 4; });

      // ---------- Índice de cartas ----------
      doc.addPage(); y = 20;
      doc.setFillColor(18, 14, 28); doc.rect(0, 0, 210, 24, 'F');
      doc.setTextColor(255, 210, 74); doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
      doc.text('ÍNDICE DE CARTAS · Base Set', 15, 15);
      y = 34;
      CAT_ORDER.forEach(cat => {
        const list = docCards.filter(c => c.category === cat).sort((a, b) => (a.number || 0) - (b.number || 0));
        if (!list.length) return;
        catHeader(CAT_LABELS[cat]);
        list.forEach(c => {
          const num = String(c.number || 0).padStart(3, '0');
          if (cat === 'hero') {
            pageBreak(26);
            const art = thumbs[c.id];
            const textX = art ? 40 : 20, textW = art ? 155 : 175;
            const yTop = y;
            if (art) {
              doc.setFillColor(184, 122, 20); doc.rect(19.4, yTop - 4.1, 17.2, 17.2, 'F');
              doc.addImage(art, 'JPEG', 20, yTop - 3.5, 16, 16);
            }
            line(`Nº ${num} · ${c.name}${c.title ? ' — ' + c.title : ''} (${c.clan || ''} · ${c.type || ''} · coste ${c.cost ?? '—'})`, 10, 'bold', INK, textX, textW);
            line(`Stats: CC ${c.cc} / AD ${c.ad} / HE ${c.he} / HP ${c.hp} · Élite: CC ${c.elite_cc} / AD ${c.elite_ad} / HE ${c.elite_he} / HP ${c.elite_hp}`, 9, 'normal', SOFT, textX, textW);
            if (c.ability_name) line(`Habilidad: ${c.ability_name} — ${c.ability_text || ''}`, 9, 'normal', INK, textX, textW);
            if (c.elite_ability_name) line(`Élite: ${c.elite_ability_name} — ${c.elite_ability_text || ''}`, 9, 'normal', INK, textX, textW);
            y = Math.max(y, yTop + 15) + 3;
          } else {
            pageBreak(20);
            const art = thumbs[c.id];
            const textX = art ? 38 : 20, textW = art ? 157 : 175;
            const yTop = y;
            if (art) {
              doc.setFillColor(184, 122, 20); doc.rect(19.4, yTop - 4.1, 14.2, 14.2, 'F');
              doc.addImage(art, 'JPEG', 20, yTop - 3.5, 13, 13);
            }
            line(`Nº ${num} · ${c.name}${c.cost != null ? ' (coste ' + c.cost + ')' : ''}${c.mana != null ? ' · maná ' + c.mana : ''}`, 10, 'bold', INK, textX, textW);
            if (c.description) line(c.description, 9, 'normal', SOFT, textX, textW);
            y = Math.max(y, yTop + 12) + 2.5;
          }
        });
        y += 3;
      });

      // ---------- Numeración de páginas ----------
      const pages = doc.getNumberOfPages();
      for (let i = 2; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(150, 138, 170);
        doc.text(`Bizarre Fantasies · ${i - 1}`, 105, 291, { align: 'center' });
      }
      doc.save('bizarre-fantasies-guia-y-cartas.pdf');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={generate} disabled={busy} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-[#b8902a] text-[#FFD24A] hover:bg-[#FFD24A18] active:scale-95 transition-all whitespace-nowrap disabled:opacity-60">
      {busy ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />} {busy ? 'Generando…' : 'PDF del juego'}
    </button>
  );
}