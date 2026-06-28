import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const ORACLE_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab6da3724_generated_image.png';
const EXPECTED_PATCH_VERSION = 'bf-2026-06-28-punkito-v100';
const MAX_LOAD_ATTEMPTS = 3;

export default function Home() {
  const iframeRef = useRef(null);
  const [html, setHtml] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [dbCount, setDbCount] = useState(107);

  useEffect(() => {
    base44.entities.Card.list('number', 200).then(cards => {
      if (cards?.length) setDbCount(cards.length);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadGame = async (attempt = 1) => {
      try {
        if (cancelled) return;
        setError(false);
        setLoading(true);

        const res = await base44.functions.invoke('gameHtml', {
          version: EXPECTED_PATCH_VERSION,
          t: Date.now(),
          r: Math.random().toString(36).slice(2),
          attempt,
        });

        if (cancelled) return;
        const data = typeof res.data === 'string' ? res.data : String(res.data);
        if (!data || data.length < 1000) throw new Error('empty');
        // If the served HTML isn't the expected version, the response was cached — retry.
        if (data.indexOf(EXPECTED_PATCH_VERSION) === -1 && attempt < MAX_LOAD_ATTEMPTS) {
          loadGame(attempt + 1);
          return;
        }
        // Render the game through srcDoc — blob: URLs can be blocked inside the
        // embedded preview iframe, leaving the page blank. srcDoc is reliable.
        setHtml(data);
        setReloadKey((k) => k + 1);
        setLoading(false);
      } catch {
        if (cancelled) return;
        if (attempt < MAX_LOAD_ATTEMPTS) {
          loadGame(attempt + 1);
          return;
        }
        setError(true);
      }
    };

    loadGame();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0e0a16] text-[#efe9dc] p-6 text-center">
        No se pudo cargar el juego. Recarga la página para intentarlo de nuevo.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0e0a16]">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0e0a16] pointer-events-none">
          <div className="w-9 h-9 border-4 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin" />
        </div>
      )}
      {/* Oráculo Bizarro — acceso al catálogo */}
      <Link to="/cards" className="absolute bottom-5 right-4 z-20 flex items-center gap-2 group" style={{ filter: 'drop-shadow(0 0 14px rgba(192,91,255,0.55))' }}>
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#c06bff] shadow-[0_0_22px_rgba(192,91,255,0.55)] transition-transform group-hover:scale-110">
          <img src={ORACLE_IMG} alt="Oráculo" className="w-full h-full object-cover" />
        </div>
        <div className="bg-[#120a1e] border border-[#c06bff]/60 rounded-xl px-3 py-1.5 backdrop-blur-sm shadow-lg">
          <div className="font-heading font-black text-[13px] text-[#e2b0ff] leading-none tracking-wide">Oráculo Bizarro</div>
          <div className="text-[9px] text-[#b06cff] mt-0.5 font-bold tracking-wider">{dbCount} cartas · Base Set</div>
        </div>
      </Link>

      {html && (
        <iframe
          key={reloadKey}
          ref={iframeRef}
          title="Bizarre Fantasies v5"
          srcDoc={html}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; clipboard-read; clipboard-write"
        />
      )}
    </div>
  );
}