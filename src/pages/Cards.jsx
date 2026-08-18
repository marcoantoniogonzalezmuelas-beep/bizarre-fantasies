import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import HeroCard from '@/components/cards/HeroCard';
import EquipCard from '@/components/cards/EquipCard';
import RaceCard from '@/components/cards/RaceCard';
import { HEROES, SPELLS, MELEE_WEAPONS, RANGED_WEAPONS, ARMORS, OBJECTS, BONUSES, RACES } from '@/lib/cardData';
import ClanSigil from '@/components/cards/ClanSigil';
import DownloadDocsButton from '@/components/cards/DownloadDocsButton';
import { HERO_ART, HERO_ELITE_ART, SPELL_ART, MELEE_ART, RANGED_ART, ARMOR_ART, OBJECT_ART, BONUS_ART } from '@/lib/artUrls';
import { getLang, t } from '@/lib/i18n';

const TABS = [
  { key: 'heroes', label: 'Héroes' },
  { key: 'spells', label: 'Hechizos' },
  { key: 'ranged', label: 'Armas Dist.' },
  { key: 'melee', label: 'Armas C/C' },
  { key: 'armors', label: 'Armaduras' },
  { key: 'objects', label: 'Objetos' },
  { key: 'tokens', label: 'Héroes bizarros' },
  { key: 'bonuses', label: 'Bonificadores' },
  { key: 'races', label: 'Razas' },
];

const HERO_CLANS = ['Todos', 'Guerreros', 'Druidas', 'No-muertos', 'Vaqueros', 'Elfos', 'Magos', 'Épicas', 'Cotidianos'];
const HERO_TYPES = ['Todos', 'CC', 'AD', 'HE'];

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

// Con el idioma en inglés, los textos traducidos (guardados en la carta bajo
// "en") sustituyen a los originales; los nombres propios no se traducen.
const enOf = (card) => (getLang() === 'en' ? (card.en || {}) : {});

const normalizeHero = (card) => {
  const en = enOf(card);
  return {
    ...card,
    id: card.card_id,
    num: card.number,
    name: en.name || card.name,
    title: en.title || card.title,
    eCc: card.elite_cc,
    eAd: card.elite_ad,
    eHe: card.elite_he,
    eHp: card.elite_hp,
    ability: en.ability_name || card.ability_name,
    abilityTxt: en.ability_text || card.ability_text,
    eAbility: en.elite_ability_name || card.elite_ability_name,
    eTxt: en.elite_ability_text || card.elite_ability_text,
    description: en.description || card.description,
    art: freshArt(card, card.art_url) || HERO_ART[Number(card.number || 0) - 1],
    eliteArt: freshArt(card, card.elite_art_url || card.art_url) || HERO_ELITE_ART[Number(card.number || 0) - 1],
  };
};

const normalizeItem = (card) => {
  const en = enOf(card);
  return {
    ...card,
    id: card.card_id,
    num: card.number,
    name: en.name || card.name,
    txt: en.description || card.description,
    tag_en: en.tag,
    art: freshArt(card, card.art_url) || gameArtFor(card.category, card.number),
    element: card.category === 'spell' ? card.type : undefined,
    tag: card.category === 'spell' ? card.tag : (card.tag || card.type),
  };
};

export default function Cards() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const initialTab = params.get('tab') || 'heroes';

  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [clanFilter, setClanFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [selectedHero, setSelectedHero] = useState(null);
  const [dbCards, setDbCards] = useState([]);

  useEffect(() => {
    let active = true;
    base44.entities.Card.list('number', 300).then((cards) => {
      if (active) setDbCards(cards || []);
    });
    const unsubscribe = base44.entities.Card.subscribe((event) => {
      if (!active) return;
      setDbCards((current) => {
        if (event.type === 'delete') return current.filter((card) => card.id !== event.id);
        if (!event.data) return current;
        const exists = current.some((card) => card.id === event.data.id);
        const next = exists
          ? current.map((card) => card.id === event.data.id ? event.data : card)
          : [...current, event.data];
        return next.sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
      });
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const isToken = (c) => String(c.card_id || '').startsWith('tk_');
  const hasDbCards = dbCards.length > 0;
  const heroes = useMemo(() => hasDbCards ? dbCards.filter(c => c.category === 'hero' && !isToken(c)).map(normalizeHero) : HEROES, [dbCards, hasDbCards]);
  const tokens = useMemo(() => hasDbCards ? dbCards.filter(c => c.category === 'bizarro' || isToken(c)).map(normalizeHero) : [], [dbCards, hasDbCards]);
  const spells = useMemo(() => hasDbCards ? dbCards.filter(c => c.category === 'spell').map(normalizeItem) : SPELLS, [dbCards, hasDbCards]);
  const ranged = useMemo(() => hasDbCards ? dbCards.filter(c => c.category === 'ranged_weapon').map(normalizeItem) : RANGED_WEAPONS, [dbCards, hasDbCards]);
  const melee = useMemo(() => hasDbCards ? dbCards.filter(c => c.category === 'melee_weapon').map(normalizeItem) : MELEE_WEAPONS, [dbCards, hasDbCards]);
  const armors = useMemo(() => hasDbCards ? dbCards.filter(c => c.category === 'armor').map(normalizeItem) : ARMORS, [dbCards, hasDbCards]);
  const objects = useMemo(() => hasDbCards ? dbCards.filter(c => c.category === 'object').map(normalizeItem) : OBJECTS, [dbCards, hasDbCards]);
  const bonuses = useMemo(() => hasDbCards ? dbCards.filter(c => c.category === 'bonus').map(normalizeItem) : BONUSES, [dbCards, hasDbCards]);

  const filteredHeroes = useMemo(() => {
    return heroes.filter(h => {
      if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (clanFilter !== 'Todos' && h.clan !== clanFilter) return false;
      if (typeFilter !== 'Todos' && h.type !== typeFilter) return false;
      return true;
    });
  }, [heroes, search, clanFilter, typeFilter]);

  return (
    <div
      className="min-h-screen relative bg-[#050308] bg-cover bg-center"
      style={{ backgroundImage: 'url("https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/9b034fe3c_generated_image.png")' }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0d0a14aa] via-[#0a081055] to-[#050308dd]" />

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-[#3c3158]" style={{ background: 'linear-gradient(180deg, #1a1430ee, #120e1cee)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Link to="/" className="-ml-2 p-2.5 rounded-lg text-[#a89fbb] hover:text-[#FFD24A] hover:bg-[#ffffff10] active:scale-95 transition-all" aria-label="Volver"><ArrowLeft size={24} /></Link>
          <h1 className="font-heading font-extrabold text-xl text-[#FFD24A] tracking-wider">{t('ORÁCULO BIZARRO')}</h1>
          <span className="text-xs text-[#a89fbb] hidden md:inline">{hasDbCards ? dbCards.length : 103} {t('cartas · Base Set')}</span>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <Link to="/guiacartas" className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-[#b8902a] text-[#FFD24A] bg-[#FFD24A11] hover:bg-[#FFD24A22] active:scale-95 transition-all">
              <BookOpen size={15} /> {t('Conocer las Cartas')}
            </Link>
            <DownloadDocsButton cards={dbCards} />
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map(tb => (
            <button key={tb.key} onClick={() => { setTab(tb.key); setSearch(''); setClanFilter('Todos'); setTypeFilter('Todos'); }}
              className={`flex-shrink-0 text-sm font-semibold px-3 py-2 rounded-lg transition-all ${tab === tb.key ? 'bg-gradient-to-b from-[#ffe49a] via-[#FFD24A] to-[#d8a431] text-[#2a1d05] border-[#ffe9a8]' : 'bg-[#221a36] text-[#efe9dc] border-[#3c3158] hover:border-[#b8902a]'} border`}>
              {t(tb.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Filters for heroes */}
        {tab === 'heroes' && (
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8099]" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('Buscar héroe...')} className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#15101f] border border-[#3c3158] rounded-lg text-[#efe9dc] focus:outline-none focus:border-[#b8902a]" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {HERO_CLANS.map(c => {
                const CLAN_COLORS_MAP = { Guerreros:'#cc3333', Druidas:'#33aa44', 'No-muertos':'#7a2a8a', Vaqueros:'#C9A227', Elfos:'#33aa66', Magos:'#6644cc', Épicas:'#cc88ff', Cotidianos:'#e0498b' };
                const col = CLAN_COLORS_MAP[c];
                return (
                  <button key={c} onClick={() => setClanFilter(c)} className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 rounded-lg border transition-all ${clanFilter === c ? 'border-[#FFD24A] text-[#FFD24A] bg-[#FFD24A11]' : 'border-[#3c3158] text-[#a89fbb] hover:border-[#b8902a]'}`}>
                    {c !== 'Todos' && (
                      <span className="rounded-full flex items-center justify-center shrink-0" style={{ width: 22, height: 22, background: col ? `${col}33` : 'transparent', border: col ? `1.5px solid ${col}` : 'none' }}>
                        <ClanSigil clan={c} size={13} />
                      </span>
                    )}
                    {t(c)}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1">
              {HERO_TYPES.map(ty => (
                <button key={ty} onClick={() => setTypeFilter(ty)} className={`text-xs font-bold px-3 py-2 rounded-lg border transition-all ${typeFilter === ty ? 'border-[#FFD24A] text-[#FFD24A] bg-[#FFD24A11]' : 'border-[#3c3158] text-[#a89fbb] hover:border-[#b8902a]'}`}>
                  {ty === 'Todos' ? t('Todos') : ty === 'CC' ? '⚔️ CC' : ty === 'AD' ? '🏹 AD' : '🔮 HE'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {tab === 'heroes' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredHeroes.map(hero => (
              <HeroCard key={hero.id} hero={hero} onClick={h => setSelectedHero(h)} />
            ))}
          </div>
        )}
        {tab === 'spells' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 gap-3">
            {spells.map(s => <EquipCard key={s.id} item={s} type="spell" />)}
          </div>
        )}
        {tab === 'ranged' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 gap-3">
            {ranged.map(w => <EquipCard key={w.id} item={w} type="ranged" />)}
          </div>
        )}
        {tab === 'melee' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 gap-3">
            {melee.map(w => <EquipCard key={w.id} item={w} type="melee" />)}
          </div>
        )}
        {tab === 'armors' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 gap-3">
            {armors.map(a => <EquipCard key={a.id} item={a} type="armor" />)}
          </div>
        )}
        {tab === 'objects' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 gap-3">
            {objects.map(o => <EquipCard key={o.id} item={o} type="object" />)}
          </div>
        )}
        {tab === 'tokens' && (
          <>
            <div className="mb-6 rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2" style={{ background: '#caa14a18', border: '1px solid #caa14a55', color: '#ffe49a' }}>
              <span className="text-lg">🎲</span>
              {getLang() === 'en'
                ? <span>The <strong>Bizarros</strong> never appear at auction. They only emerge mid-battle, sudden and unpredictable.</span>
                : <span>Los <strong>Bizarros</strong> no salen en subasta. Solo aparecen en plena batalla de forma sorpresiva e impredecible.</span>}
            </div>
            {tokens.length === 0 ? (
              <div className="text-center py-16 text-[#a89fbb]">{t('Aún no hay Bizarros en el catálogo.')}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 gap-4">
                {tokens.map(token => <HeroCard key={token.id} hero={token} onClick={h => setSelectedHero(h)} />)}
              </div>
            )}
          </>
        )}
        {tab === 'bonuses' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 gap-3">
            {bonuses.map(b => <EquipCard key={b.id} item={{ ...b, cost: '—' }} type="bonus" />)}
          </div>
        )}
        {tab === 'races' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RACES.map(r => <RaceCard key={r.name} race={r} />)}
          </div>
        )}

        {tab === 'heroes' && filteredHeroes.length === 0 && (
          <div className="text-center py-16 text-[#a89fbb]">{t('No se encontraron héroes con esos filtros.')}</div>
        )}
      </div>
    </div>
  );
}