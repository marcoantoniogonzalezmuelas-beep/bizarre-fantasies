import React from 'react';

// Sección por tipo de carta: icono, título, descripción y las cartas de
// ejemplo que se pasen como children.
export default function CardTypeSection({ icon, title, desc, accent = '#FFD24A', children }) {
  return (
    <section className="rounded-2xl border border-[#3c3158]/70 bg-gradient-to-b from-[#15102a]/80 to-[#0b0813]/90 p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,.4)]">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex-none w-11 h-11 rounded-xl flex items-center justify-center text-xl border" style={{ background: `${accent}22`, borderColor: `${accent}77`, color: accent }}>{icon}</span>
        <h3 className="font-heading font-black text-xl md:text-2xl text-[#ffe9a8] tracking-wide" style={{ textShadow: '0 2px 6px #000' }}>{title}</h3>
      </div>
      <p className="text-[14px] md:text-[15px] leading-relaxed text-[#e6dff2] mb-5 max-w-3xl">{desc}</p>
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">{children}</div>
    </section>
  );
}