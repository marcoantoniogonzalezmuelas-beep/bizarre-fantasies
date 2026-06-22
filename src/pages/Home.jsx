import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HEROES, CATEGORIES, CLAN_COLORS, CLAN_SYMBOLS } from '@/lib/cardData';

const FEATURED = HEROES.filter(h => h.art).slice(0, 6);

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(1100px 560px at 50% -8%, rgba(120,60,170,.20), transparent 60%), radial-gradient(900px 520px at 100% 110%, rgba(60,90,170,.16), transparent 55%), linear-gradient(180deg, #0d0a14, #0a0810)' }}>
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-12 pb-20 px-4">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(600px 400px at 50% 30%, #FFD24A22, transparent)' }} />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl mb-4">
            ⚔️🏹🔮
          </motion.div>
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="font-heading font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-wider" style={{ background: 'linear-gradient(180deg, #fff3c8, #FFD24A 55%, #b8902a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 4px 30px rgba(255,210,74,.25)' }}>
            BIZARRE FANTASIES
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-heading text-[#ffcf57] tracking-[8px] text-sm md:text-lg mt-2 opacity-90">
            EDICIÓN V5 · BASE SET
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-[#a89fbb] mt-4 text-sm md:text-base max-w-xl mx-auto">
            45 héroes · 13 hechizos · 8 armas a distancia · 6 armas cuerpo a cuerpo · 10 armaduras · 9 objetos · 12 bonificadores · 8 razas
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/cards" className="font-semibold text-[#2a1d05] bg-gradient-to-b from-[#ffe49a] via-[#FFD24A] to-[#d8a431] border border-[#ffe9a8] rounded-xl px-8 py-3.5 text-lg shadow-[0_4px_0_#8a6a18] hover:brightness-105 transition-all">
              Ver catálogo completo
            </Link>
            <Link to="/races" className="font-semibold text-[#efe9dc] bg-gradient-to-b from-[#332a4f] to-[#221a36] border border-[#3c3158] rounded-xl px-6 py-3.5 hover:border-[#b8902a] transition-colors">
              🧬 Razas
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Featured Heroes */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="font-heading font-extrabold text-2xl text-[#FFD24A] mb-6 tracking-wide">Héroes destacados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED.map((hero, i) => (
            <motion.div key={hero.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <Link to={`/cards?hero=${hero.id}`} className="block">
                <div className="rounded-2xl overflow-hidden border-2 shadow-lg hover:-translate-y-2 transition-transform" style={{ borderColor: CLAN_COLORS[hero.clan], background: '#0e0b16' }}>
                  <div className="relative aspect-[3/4]">
                    <img src={hero.art} alt={hero.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="font-heading font-bold text-sm text-white">{hero.name}</div>
                      <div className="text-[10px] text-[#ffe6a8]">{hero.title}</div>
                    </div>
                    <div className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-[#5a3d06]" style={{ background: 'radial-gradient(circle at 34% 30%, #ffeaa6, #FFD24A 46%, #a9771f)' }}>
                      {hero.cost}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="font-heading font-extrabold text-2xl text-[#FFD24A] mb-6 tracking-wide">Categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.key} to={`/cards?tab=${cat.key}`} className="block rounded-xl p-4 border border-[#3c3158] hover:border-[#b8902a] transition-all hover:-translate-y-1" style={{ background: 'linear-gradient(180deg, #2b2244, #221a36)' }}>
              <div className="font-bold text-[#efe9dc] text-lg">{cat.label}</div>
              <div className="text-sm text-[#a89fbb] mt-1">{cat.count} cartas</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#3c3158] py-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="font-heading font-extrabold text-lg text-[#FFD24A] border border-[#a9771f] rounded px-2 tracking-widest" style={{ background: 'linear-gradient(180deg, #2a2010, #16100a)' }}>BF</span>
          <span className="text-xs text-[#9a8f7a]">Base Set · Bizarre Fantasies · 103 cartas</span>
        </div>
      </footer>
    </div>
  );
}