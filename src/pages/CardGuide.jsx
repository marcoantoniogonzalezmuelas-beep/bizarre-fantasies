import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { HEROES, SPELLS, RANGED_WEAPONS, MELEE_WEAPONS, ARMORS, OBJECTS, BONUSES } from '@/lib/cardData';
import { HERO_ART, HERO_ELITE_ART, SPELL_ART, MELEE_ART, RANGED_ART, ARMOR_ART, OBJECT_ART, BONUS_ART } from '@/lib/artUrls';
import HeroCard from '@/components/cards/HeroCard';
import EquipCard from '@/components/cards/EquipCard';
import CardPartsDiagram from '@/components/guide/CardPartsDiagram';
import EquipPartsDiagram from '@/components/guide/EquipPartsDiagram';
import CardTypeSection from '@/components/guide/CardTypeSection';
import StatGlossary from '@/components/guide/StatGlossary';
import { t } from '@/lib/i18n';
import { useDesktopZoom } from '@/lib/useDesktopZoom';

const freshArt = (card, url) => {
  if (!url) return undefined;
  const stamp = encodeURIComponent(card.updated_date || card.created_date || 'current');
  return `${url}${url.includes('?') ? '&' : '?'}bfart=${stamp}`;
};
const gameArtFor = (category, number) => {
  const n = Number(number || 0);
  if (category === 'spell') return SPELL_ART[n - 46];
  if (category === 'melee_weapon') return MELEE_ART[n - 59];
  if (category === 'ranged_weapon') return RANGED_ART[n - 65];
  if (category === 'armor') return ARMOR_ART[n - 73];
  if (category === 'object') return OBJECT_ART[n - 83];
  if (category === 'bonus') return BONUS_ART[n - 92];
  return undefined;
};
const normalizeHero = (c) => ({ ...c, id: c.card_id, num: c.number, title: c.title, eCc: c.elite_cc, eAd: c.elite_ad, eHe: c.elite_he, eHp: c.elite_hp, ability: c.ability_name, abilityTxt: c.ability_text, eAbility: c.elite_ability_name, eTxt: c.elite_ability_text, description: c.description, art: freshArt(c, c.art_url) || HERO_ART[Number(c.number || 0) - 1], eliteArt: freshArt(c, c.elite_art_url || c.art_url) || HERO_ELITE_ART[Number(c.number || 0) - 1] });
const normalizeItem = (c) => ({ ...c, id: c.card_id, num: c.number, txt: c.description, tag_en: c.en?.tag, art: freshArt(c, c.art_url) || gameArtFor(c.category, c.number), element: c.category === 'spell' ? c.type : undefined, tag: c.category === 'spell' ? c.tag : (c.tag || c.type) });

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay },
});

export default function CardGuide() {
  useDesktopZoom();
  const [cards, setCards] = useState([]);
  useEffect(() => { base44.entities.Card.list('number', 300).then(c => setCards(c || [])).catch(() => setCards([])); }, []);
  const isToken = (c) => String(c.card_id || '').startsWith('tk_');
  const hasDb = cards.length > 0;

  const ex = useMemo(() => {
    const by = (cat) => hasDb ? cards.filter(c => c.category === cat) : [];
    const hero = (type) => (hasDb ? cards.filter(c => c.category === 'hero' && !isToken(c) && c.type === type) : HEROES.filter(h => h.type === type)).map(normalizeHero)[0];
    return {
      cc: hero('CC'), ad: hero('AD'), he: hero('HE'),
      spell: (hasDb ? by('spell') : SPELLS).map(normalizeItem)[0],
      ranged: (hasDb ? by('ranged_weapon') : RANGED_WEAPONS).map(normalizeItem)[0],
      melee: (hasDb ? by('melee_weapon') : MELEE_WEAPONS).map(normalizeItem)[0],
      armor: (hasDb ? by('armor') : ARMORS).map(normalizeItem)[0],
      object: (hasDb ? by('object') : OBJECTS).map(normalizeItem)[0],
      bonus: (hasDb ? by('bonus') : BONUSES).map(normalizeItem)[0],
      token: (hasDb ? cards.filter(c => c.category === 'bizarro' || isToken(c)) : []).map(normalizeHero)[0],
    };
  }, [cards, hasDb]);

  const card = (item, type) => <div key={item?.id || type} className="w-[160px] sm:w-[180px]"><EquipCard item={item} type={type} /></div>;
  const hero = (h) => h ? <div key={h.id} className="w-[160px] sm:w-[180px]"><HeroCard hero={h} /></div> : null;
  const labeledCard = (item, type, label) => item ? (
    <div key={item.id || type} className="flex flex-col items-center gap-1.5">
      <div className="w-[150px] sm:w-[168px]"><EquipCard item={item} type={type} /></div>
      <span className="text-[11px] font-bold text-[#bdae87]">{label}</span>
    </div>
  ) : null;

  return (
    <div className="min-h-screen relative bg-[#050308] bg-cover bg-center bg-fixed text-[#efe9dc]" style={{ backgroundImage: 'url("https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4c66c24cd_generated_image.png")' }}>
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#06040acc]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0a0812dd] via-[#070512bb] to-[#050308ee]" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <div className="sticky top-0 z-20 -mx-4 mb-6 px-4 py-3 flex items-center gap-3 border-b border-[#3c3158]" style={{ background: 'linear-gradient(180deg,#1a1430ee,#120e1cee)', backdropFilter: 'blur(12px)' }}>
          <Link to="/cards" className="-ml-1 p-2 rounded-lg text-[#a89fbb] hover:text-[#FFD24A] hover:bg-white/5"><ArrowLeft size={22} /></Link>
          <BookOpen className="text-[#FFD24A]" size={22} />
          <h1 className="font-heading font-extrabold text-xl md:text-2xl text-[#FFD24A] tracking-wider">{t('Conocer las Cartas')}</h1>
        </div>

        <motion.p {...fade()} className="text-[15px] md:text-[17px] leading-relaxed text-[#e6dff2] mb-8 max-w-3xl">
          {t('En Bizarre Fantasies cada carta es un héroe, un hechizo, un arma, una armadura, un objeto o un bonificador. Esta guía explica qué es cada tipo, qué hace en el juego y qué significa cada stat. Empieza por las partes de una carta:')}
        </motion.p>

        <motion.div {...fade(0.04)} className="mb-8 flex items-start gap-3 rounded-xl border border-[#c06bff]/40 bg-[#1a0d2a]/60 px-4 py-3 max-w-3xl">
          <span className="text-xl mt-0.5 shrink-0">👆</span>
          <p className="text-[14px] text-[#e6dff2] leading-relaxed">
            <b className="text-[#FFD24A]">{t('Cómo usar esta guía:')}</b> {t('pasa el ratón (o toca en el móvil) sobre cada marcador de la carta para ver qué es: el coste de oro, la vida (HP), CC, AD, HE, el maná y la habilidad. También puedes pasar el ratón por la lista de la derecha y se señalará lo mismo en la carta.')}
          </p>
        </motion.div>

        <motion.div {...fade(0.05)} className="mb-10"><CardPartsDiagram hero={ex.cc} /></motion.div>

        <motion.div {...fade(0.08)} className="mb-10">
          <h2 className="font-heading font-black text-lg md:text-xl text-[#FFD24A] mb-1 tracking-wide">{t('Partes de una carta de equipamiento')}</h2>
          <p className="text-[14px] text-[#e6dff2] mb-4 max-w-3xl">{t('Hechizos, armas, armaduras y objetos comparten el mismo diseño: el coste de oro arriba a la izquierda, el texto de la habilidad abajo y, solo en los hechizos, el orbe azul de maná arriba a la derecha. Aquí tienes un hechizo de ejemplo:')}</p>
          <EquipPartsDiagram item={ex.spell} type="spell" />
          <div className="mt-8">
            <div className="font-heading font-bold text-[14px] text-[#ffe9a8] mb-3">{t('Ejemplos de cada tipo:')}</div>
            <div className="flex flex-wrap gap-4 justify-center">
              {labeledCard(ex.spell, 'spell', t('Hechizo'))}
              {labeledCard(ex.ranged, 'ranged', t('Arma a distancia'))}
              {labeledCard(ex.melee, 'melee', t('Arma C/C'))}
              {labeledCard(ex.armor, 'armor', t('Armadura'))}
              {labeledCard(ex.object, 'object', t('Objeto'))}
            </div>
          </div>
        </motion.div>

        <div className="space-y-7">
          <motion.div {...fade(0.1)}><CardTypeSection icon="🦸" title={t('Héroes')} accent="#FFD24A" desc={t('Tus combatientes. Formas un equipo de 3 héroes, uno de cada tipo: CC (cuerpo a cuerpo), AD (a distancia) y HE (magia). Cada uno tiene sus stats, una habilidad propia y una forma Élite que renace al caer. Aquí tienes un ejemplo de cada tipo:')}>
            <div className="flex flex-wrap gap-4 justify-center">{hero(ex.cc)}{hero(ex.ad)}{hero(ex.he)}</div>
          </CardTypeSection></motion.div>

          <motion.div {...fade(0.1)}><CardTypeSection icon="🎲" title={t('Héroes bizarros')} accent="#c06bff" desc={t('Héroes especiales e impredecibles. No salen en subasta: aparecen en plena batalla de forma sorpresiva. Cada uno rompe las reglas a su manera.')}>
            <div className="flex flex-wrap gap-4 justify-center">{hero(ex.token)}</div>
          </CardTypeSection></motion.div>

          <motion.div {...fade(0.1)}><CardTypeSection icon="🔮" title={t('Hechizos')} accent="#8b6bff" desc={t('Cartas únicas (1 sola copia) que gastan maná 🔵 para lanzarse. Van a tu mano. Los hay de fuego, hielo, rayo, agua, curación, protección, arcano y estado. El coste de maná va en el orbe azul arriba a la derecha.')}>
            {card(ex.spell, 'spell')}
          </CardTypeSection></motion.div>

          <motion.div {...fade(0.1)}><CardTypeSection icon="🏹" title={t('Armas a distancia')} accent="#3fb56a" desc={t('Potencian el disparo: el daño de un héroe AD es la potencia del arma × su AD. Solo los héroes AD pueden equiparlas y disparar.')}>
            {card(ex.ranged, 'ranged')}
          </CardTypeSection></motion.div>

          <motion.div {...fade(0.1)}><CardTypeSection icon="⚔️" title={t('Armas C/C')} accent="#e0653f" desc={t('Potencian el golpe cuerpo a cuerpo: el daño melé es tu CC + el arma. Solo los héroes CC las equipan.')}>
            {card(ex.melee, 'melee')}
          </CardTypeSection></motion.div>

          <motion.div {...fade(0.1)}><CardTypeSection icon="🛡️" title={t('Armaduras')} accent="#5a8fd6" desc={t('Reducen el daño recibido. Las elementales anulan por completo su elemento contrario (agua↔fuego, rayo↔agua, hielo↔rayo, fuego↔hielo). La Barrera Arcana protege del daño mágico.')}>
            {card(ex.armor, 'armor')}
          </CardTypeSection></motion.div>

          <motion.div {...fade(0.1)}><CardTypeSection icon="🧪" title={t('Objetos')} accent="#d6b13f" desc={t('Consumibles que van a tu mano (hasta 3 copias de cada): pociones de vida, cristales de maná, orbes… Se usan en batalla y van al descarte al consumirse.')}>
            {card(ex.object, 'object')}
          </CardTypeSection></motion.div>

          <motion.div {...fade(0.1)}><CardTypeSection icon="✨" title={t('Bonificadores')} accent="#d39b22" desc={t('Cartas que modifican la partida: más monedas, ventajas para ti o castigos al rival. Cada ronda de subasta trae uno único que no se repite.')}>
            {card({ ...ex.bonus, cost: '—' }, 'bonus')}
          </CardTypeSection></motion.div>

          <motion.div {...fade(0.1)}><StatGlossary /></motion.div>
        </div>

        <div className="text-center mt-12">
          <Link to="/cards" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-[#2a1d05] bg-gradient-to-b from-[#ffe49a] via-[#FFD24A] to-[#d8a431] border border-[#ffe9a8] shadow-[0_8px_24px_rgba(255,210,74,.4)] hover:scale-[1.03] active:scale-95 transition-transform">
            <BookOpen size={18} /> {t('Explorar el Oráculo completo')}
          </Link>
        </div>
      </div>
    </div>
  );
}