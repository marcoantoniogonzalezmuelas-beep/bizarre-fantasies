import React from 'react';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { GAME_RULES_DOC } from '@/lib/gameRulesDoc';

const CAT_LABELS = { hero: 'Héroes', spell: 'Hechizos', melee_weapon: 'Armas cuerpo a cuerpo', ranged_weapon: 'Armas a distancia', armor: 'Armaduras', object: 'Objetos', bonus: 'Bonificadores' };
const CAT_ORDER = ['hero', 'spell', 'melee_weapon', 'ranged_weapon', 'armor', 'object', 'bonus'];

export default function DownloadDocsButton({ cards }) {
  const generate = () => {
    const doc = new jsPDF();
    let y = 40;
    const line = (txt, size = 10, style = 'normal', color = [45, 40, 55]) => {
      doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(color[0], color[1], color[2]);
      doc.splitTextToSize(String(txt || ''), 180).forEach(r => {
        if (y > 282) { doc.addPage(); y = 18; }
        doc.text(r, 15, y); y += size * 0.5 + 1.6;
      });
    };
    doc.setFillColor(18, 14, 28); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 210, 74); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text('BIZARRE FANTASIES · Guía del juego y cartas', 15, 19);
    GAME_RULES_DOC.forEach(([t, b]) => { line(t, 13, 'bold', [184, 122, 20]); line(b, 10); y += 3; });
    doc.addPage(); y = 18;
    line('ÍNDICE DE CARTAS · Base Set', 16, 'bold', [184, 122, 20]); y += 2;
    CAT_ORDER.forEach(cat => {
      const list = (cards || []).filter(c => c.category === cat).sort((a, b) => (a.number || 0) - (b.number || 0));
      if (!list.length) return;
      y += 3; line(CAT_LABELS[cat], 13, 'bold', [184, 122, 20]);
      list.forEach(c => {
        const num = String(c.number || 0).padStart(3, '0');
        if (cat === 'hero') {
          line(`Nº ${num} · ${c.name}${c.title ? ' — ' + c.title : ''} (${c.clan || ''} · ${c.type || ''} · coste ${c.cost ?? '—'})`, 10, 'bold');
          line(`Stats: CC ${c.cc} / AD ${c.ad} / HE ${c.he} / HP ${c.hp} · Élite: CC ${c.elite_cc} / AD ${c.elite_ad} / HE ${c.elite_he} / HP ${c.elite_hp}`, 9);
          if (c.ability_name) line(`Habilidad: ${c.ability_name} — ${c.ability_text || ''}`, 9);
          if (c.elite_ability_name) line(`Élite: ${c.elite_ability_name} — ${c.elite_ability_text || ''}`, 9);
          y += 1.5;
        } else {
          line(`Nº ${num} · ${c.name}${c.cost != null ? ' (coste ' + c.cost + ')' : ''}${c.mana != null ? ' · maná ' + c.mana : ''}`, 10, 'bold');
          if (c.description) line(c.description, 9);
          y += 1;
        }
      });
    });
    doc.save('bizarre-fantasies-guia-y-cartas.pdf');
  };
  return (
    <button onClick={generate} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-[#b8902a] text-[#FFD24A] hover:bg-[#FFD24A18] active:scale-95 transition-all whitespace-nowrap">
      <FileDown size={15} /> PDF del juego
    </button>
  );
}