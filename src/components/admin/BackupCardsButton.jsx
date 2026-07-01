import React from 'react';
import { Download } from 'lucide-react';

// Downloads a local JSON backup with every card record (stats + image URLs).
export default function BackupCardsButton({ cards }) {
  function handleDownload() {
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `bizarre-fantasies-cartas-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button onClick={handleDownload} disabled={!cards?.length} className="flex items-center gap-2 rounded-xl border border-[#ffd24a66] px-4 py-2 text-sm font-black text-[#ffe49a] hover:bg-[#ffd24a] hover:text-[#3a2600] disabled:opacity-40">
      <Download className="h-4 w-4" /> Descargar copia
    </button>
  );
}