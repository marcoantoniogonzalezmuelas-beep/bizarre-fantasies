import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const iframeRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    base44.functions
      .invoke('gameHtml', { version: 'bf-2026-06-23-cards-bonus-v1', t: Date.now() })
      .then((res) => {
        if (cancelled) return;
        const html = typeof res.data === 'string' ? res.data : String(res.data);
        const iframe = iframeRef.current;
        if (!iframe) return;
        // Write the HTML into the iframe document directly. Unlike srcDoc,
        // document.write produces a real same-origin document where inline
        // <script> tags execute reliably.
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
          setError(true);
          return;
        }
        doc.open();
        doc.write(html);
        doc.close();
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

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
      <iframe
        ref={iframeRef}
        title="Bizarre Fantasies v5"
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; clipboard-read; clipboard-write"
      />
    </div>
  );
}