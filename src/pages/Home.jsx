import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    base44.functions
      .invoke('gameHtml', {})
      .then((res) => setHtml(typeof res.data === 'string' ? res.data : String(res.data)))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0e0a16] text-[#efe9dc] p-6 text-center">
        No se pudo cargar el juego. Recarga la página para intentarlo de nuevo.
      </div>
    );
  }

  if (!html) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0e0a16]">
        <div className="w-9 h-9 border-4 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0e0a16]">
      <iframe
        title="Bizarre Fantasies v5"
        srcDoc={html}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; clipboard-read; clipboard-write"
      />
    </div>
  );
}