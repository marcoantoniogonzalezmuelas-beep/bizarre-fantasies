import React from 'react';
import { getLang, setLang } from '@/lib/i18n';

// Selector de idioma fijo (arriba a la derecha): 🇪🇸 ES / 🇬🇧 EN.
export default function LanguageSelector({ inline = false }) {
  const lang = getLang();
  const btn = (l, label) => (
    <button
      onClick={() => lang !== l && setLang(l)}
      className={`px-2 py-1 text-[10px] font-black tracking-wide transition-colors ${
        lang === l
          ? 'bg-gradient-to-b from-[#ffe27a] via-[#FFD24A] to-[#c8901f] text-[#3a2600]'
          : 'bg-[#120a1e]/90 text-[#e2cf9a] hover:bg-[#221838]'
      }`}
      aria-label={l === 'es' ? 'Español' : 'English'}
    >
      {label}
    </button>
  );
  return (
    <div className={`${inline ? '' : 'fixed top-2 right-2 z-[60] '}flex rounded-full overflow-hidden border border-[#ffd24a]/70 shadow-[0_4px_16px_rgba(0,0,0,.65),0_0_14px_rgba(255,210,74,.35)] backdrop-blur-sm`}>
      {btn('es', '🇪🇸 ES')}
      {btn('en', '🇬🇧 EN')}
    </div>
  );
}