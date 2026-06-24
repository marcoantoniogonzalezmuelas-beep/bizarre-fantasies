import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, BookOpen } from 'lucide-react';

const ICON_CC = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/119c5390a_generated_image.png';
const ICON_AD = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/93cdad509_generated_image.png';
const ICON_HE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ccdd4a1ec_generated_image.png';

export default function TitleScreen({ onPlay }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(1200px 600px at 50% -10%, #2a2046 0%, rgba(42,32,70,0) 60%), linear-gradient(180deg,#15101f 0%, #0e0a16 100%)' }} />

      <div className="flex gap-4 mb-6">
        {[ICON_CC, ICON_AD, ICON_HE].map((src, i) => (
          <div key={i} className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#ffd24a88] shadow-[0_0_22px_rgba(255,210,74,0.38)] animate-bounce" style={{ animationDelay: `${i * 0.2}s`, animationDuration: '3s' }}>
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <h1 className="font-heading font-black text-center leading-none tracking-wider" style={{ fontSize: 'clamp(40px,9vw,80px)', background: 'linear-gradient(180deg,#fff3c8,#FFD24A 55%,#b8902a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textShadow: '0 4px 30px rgba(255,210,74,.25)' }}>
        BIZARRE<br />FANTASIES
      </h1>
      <p className="font-heading text-[#ffcf57] tracking-[8px] mt-3 text-sm md:text-base">JUEGO DE CARTAS</p>

      <button onClick={onPlay} className="mt-10 flex items-center gap-3 px-10 py-4 rounded-2xl font-heading font-black text-lg text-[#2a1d05] shadow-[0_8px_24px_rgba(255,210,74,0.35)] transition-transform hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(180deg,#ffe49a,#FFD24A 55%,#d8a431)' }}>
        <Swords size={22} /> JUGAR
      </button>

      <Link to="/cards" className="mt-5 flex items-center gap-2 text-[#b06cff] hover:text-[#e2b0ff] transition-colors font-bold text-sm">
        <BookOpen size={16} /> Ver catálogo de cartas (103)
      </Link>
    </div>
  );
}