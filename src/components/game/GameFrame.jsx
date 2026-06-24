import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Carga el juego completo de Bizarre Fantasies (todos los modos: IA vs IA tutorial,
// vs IA, y multijugador online con salas) servido por la función gameHtml, con toda
// la estética, fondos y arte de héroes originales.
function buildGameUrl() {
  const cfg = base44.getConfig ? base44.getConfig() : {};
  const serverUrl = (cfg.serverUrl || 'https://base44.app').replace(/\/$/, '');
  const appId = cfg.appId;
  // Cache-bust para asegurar siempre la última versión parcheada del juego.
  return `${serverUrl}/api/apps/${appId}/functions/gameHtml?bf=${Date.now()}`;
}

export default function GameFrame() {
  const [loading, setLoading] = useState(true);
  const [src] = useState(buildGameUrl);

  return (
    <div className="fixed inset-0 bg-[#0a0810]">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4" style={{ background: 'radial-gradient(1200px 600px at 50% -10%, #2a2046 0%, rgba(42,32,70,0) 60%), linear-gradient(180deg,#15101f 0%, #0e0a16 100%)' }}>
          <Loader2 className="w-10 h-10 text-[#FFD24A] animate-spin" />
          <div className="font-heading font-black text-[#FFD24A] tracking-[6px] text-sm">CARGANDO ARENA…</div>
        </div>
      )}

      <iframe
        title="Bizarre Fantasies"
        src={src}
        onLoad={() => setLoading(false)}
        className="w-full h-full border-0 block"
        allow="autoplay; clipboard-read; clipboard-write"
      />

      <Link
        to="/cards"
        className="fixed bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-black text-sm text-[#2a1d05] shadow-[0_8px_24px_rgba(255,210,74,0.35)] transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(180deg,#ffe49a,#FFD24A 55%,#d8a431)' }}
      >
        <BookOpen size={16} /> Catálogo
      </Link>
    </div>
  );
}