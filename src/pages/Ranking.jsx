import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import RankList from '@/components/ranking/RankList';
import RankingPrizeBanner from '@/components/ranking/RankingPrizeBanner';
import { t, getLang } from '@/lib/i18n';
import { makeNickDisplay } from '@/lib/nickCanon';
import { isMissionRow, buildMissionRanking } from '@/lib/rankingMissions';
import { useDesktopZoom } from '@/lib/useDesktopZoom';

const BG_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e6f0b7316_generated_image.png';
const ICON_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5f6dbe23d_generated_image.png';
// Iconos de ranking generados por IA (emblemas de fantasía oscura del juego).
const ICON_CHAMPIONS = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/647526d8d_generated_image.png';
const ICON_MONTHLY = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/bc9991940_generated_image.png';
const ICON_VICTORY = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d34a0365b_generated_image.png';
const ICON_DEFEAT = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/33e4e22fd_generated_image.png';
const ICON_FALLEN = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/89adeedea_generated_image.png';
const ICON_REBIRTH = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/19a275621_generated_image.png';
const ICON_KILLS = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c773db422_generated_image.png';
const MONTH_NAMES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MONTH_NAMES_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_NAMES = () => (getLang() === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_ES);
const M = (h) => 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/' + h;
// zoom: el arte de las IAs es un emblema circular con marco claro dentro de la
// imagen; se amplía para que el rostro llene el hueco y no se vea ese borde.
const AI_AVATARS = {
  'IA Novata': { art: M('ac6f97a53_generated_image.png'), color: '#7cff5a', zoom: 2.1 },
  'AI Novice': { art: M('ac6f97a53_generated_image.png'), color: '#7cff5a', zoom: 2.1 },
  'IA Bersérker': { art: M('274f7a3e2_generated_image.png'), color: '#ff5a3c', zoom: 2.1 },
  'AI Berserker': { art: M('274f7a3e2_generated_image.png'), color: '#ff5a3c', zoom: 2.1 },
  'IA Estratega': { art: M('88ab0dd62_generated_image.png'), color: '#7c9cff', zoom: 2.1 },
  'AI Strategist': { art: M('88ab0dd62_generated_image.png'), color: '#7c9cff', zoom: 2.1 },
  'IA Némesis': { art: M('fd6b3a75e_generated_image.png'), color: '#c06bff', zoom: 2.1 },
  'AI Nemesis': { art: M('fd6b3a75e_generated_image.png'), color: '#c06bff', zoom: 2.1 },
};

function top(map, n = 10, extraMap) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value, extra: extraMap ? extraMap(name) : undefined }));
}

export default function Ranking() {
  useDesktopZoom();
  const [results, setResults] = useState(null);
  const [missionRows, setMissionRows] = useState([]);
  const [missionVictories, setMissionVictories] = useState([]);
  const [artMap, setArtMap] = useState({});
  const [playerAvatars, setPlayerAvatars] = useState({});

  useEffect(() => {
    // Partidas generales (hasta 1000: las de misión van aparte y no desplazan a las demás)...
    base44.entities.MatchResult.list('-created_date', 1000).then(setResults);
    // ...y las de MISIÓN (solitario y multijugador) + las victorias de misión guardadas antes de esta sección.
    Promise.all([
      base44.entities.MatchResult.filter({ mode: 'mission' }, '-created_date', 500).catch(() => []),
      base44.entities.MatchResult.filter({ mode: 'mission_mp' }, '-created_date', 500).catch(() => []),
    ]).then(([a, b]) => setMissionRows([...(a || []), ...(b || [])]));
    base44.entities.MissionVictory.list('-created_date', 1000).then(v => setMissionVictories(v || [])).catch(() => {});
    // Avatares de jugadores asociados al nick en la BD: el más reciente por nick.
    base44.entities.PlayerAvatar.list('-created_date', 500).then(avatars => {
      const m = {};
      (avatars || []).forEach(a => {
        if (a.nick && a.avatar_url && !m[a.nick]) m[a.nick] = { art: a.avatar_url };
      });
      setPlayerAvatars(m);
    }).catch(() => {});
    // Arte de cada héroe (por nombre) para el podio ilustrado de los tops.
    base44.entities.Card.list('number', 300).then(cards => {
      const m = {};
      (cards || []).forEach(c => {
        if ((c.category === 'hero' || c.category === 'bizarro') && c.name && c.art_url) {
          m[c.name] = { art: c.art_url, color: c.clan_color || '#caa14a' };
        }
      });
      setArtMap(m);
    });
  }, []);

  // Nicks genéricos que el juego asigna por defecto: no cuentan para el ranking.
  const GENERIC = /^(tú|tu|rival|jugador\s*\d*|player\s*\d*|player|cpu|ia|bot|oponente|opponent)$/i;
  const isGeneric = (s) => !s || GENERIC.test(String(s).trim());
  // Tokens invocados en batalla (no son héroes): fuera de las listas de héroes.
  const SUMMON_TOKENS = ['Patito de Goma'];
  // IAs y jugadores comparten ranking: se cuentan todas las victorias y
  // derrotas sin filtrar por winner_is_ai / loser_is_ai.
  const wins = {}, losses = {}, heroWins = {}, heroLosses = {}, heroDeaths = {}, heroElites = {}, heroKills = {};
  // Mapa nick → avatar: se construye con el avatar MÁS RECIENTE de cada nick
  // (results viene ordenado por -created_date). Así, aunque un jugador cambie
  // de avatar entre partidas, el ranking muestra siempre el último que usó.
  // PlayerAvatar (BD) tiene prioridad; luego el avatar guardado en el propio
  // MatchResult; y por último el fallback de IAs para partidas antiguas.
  // Un jugador es el mismo aunque cambie las mayúsculas de su nick, y una IA es la misma aunque el
  // juego esté en inglés ("IA Novata" = "AI Novice"): antes contaban como jugadores distintos.
  // La primera grafía vista manda (los resultados vienen del más reciente al más antiguo).
  const nickDisplay = makeNickDisplay(getLang());
  const generalResults = (results || []).filter(r => !isMissionRow(r));
  generalResults.forEach(r => { nickDisplay(r.winner_nick); nickDisplay(r.loser_nick); });
  const playerArtMap = {};
  Object.keys(playerAvatars || {}).forEach(n => { const d = nickDisplay(n); if (!playerArtMap[d]) playerArtMap[d] = playerAvatars[n]; });
  generalResults.forEach(r => {
    if (isGeneric(r.winner_nick) || isGeneric(r.loser_nick)) return;
    const wn = nickDisplay(r.winner_nick), ln = nickDisplay(r.loser_nick);
    wins[wn] = (wins[wn] || 0) + 1;
    losses[ln] = (losses[ln] || 0) + 1;
    if (r.winner_avatar && !playerArtMap[wn]) playerArtMap[wn] = { art: r.winner_avatar };
    if (r.loser_avatar && !playerArtMap[ln]) playerArtMap[ln] = { art: r.loser_avatar };
    // Bajas (kills): cada héroe VIVO suma una baja por cada héroe caído del
    // bando contrario, gane o pierda la partida. Los héroes que caen no
    // reciben crédito de baja (no sobrevivieron para cobrarla).
    var wDead = 0, lDead = 0;
    (r.winner_heroes || []).forEach(h => { if (h && h.died && h.name && !SUMMON_TOKENS.includes(h.name)) wDead++; });
    (r.loser_heroes || []).forEach(h => { if (h && h.died && h.name && !SUMMON_TOKENS.includes(h.name)) lDead++; });
    (r.winner_heroes || []).forEach(h => {
      if (!h.name || SUMMON_TOKENS.includes(h.name)) return;
      heroWins[h.name] = (heroWins[h.name] || 0) + 1;
      if (h.died) heroDeaths[h.name] = (heroDeaths[h.name] || 0) + 1;
      else if (lDead) heroKills[h.name] = (heroKills[h.name] || 0) + lDead;
      if (h.elite) heroElites[h.name] = (heroElites[h.name] || 0) + 1;
    });
    (r.loser_heroes || []).forEach(h => {
      if (!h.name || SUMMON_TOKENS.includes(h.name)) return;
      heroLosses[h.name] = (heroLosses[h.name] || 0) + 1;
      if (h.died) heroDeaths[h.name] = (heroDeaths[h.name] || 0) + 1;
      else if (wDead) heroKills[h.name] = (heroKills[h.name] || 0) + wDead;
      if (h.elite) heroElites[h.name] = (heroElites[h.name] || 0) + 1;
    });
  });
  // Fallback de avatares para IAs cuyas partidas se registraron antes de que
  // se guardara el avatar en el resultado.
  // Las IAs SIEMPRE usan su emblema oficial: algunas partidas antiguas
  // guardaron una URL inválida en el resultado y el avatar salía en blanco.
  Object.keys(AI_AVATARS).forEach(k => { playerArtMap[k] = AI_AVATARS[k]; });
  const playerExtra = (nick) => {
    const w = wins[nick] || 0, l = losses[nick] || 0;
    return `${w + l} ${t('partidas')} · ${Math.round((w / Math.max(1, w + l)) * 100)}% ${t('victorias')}`;
  };

  // Ranking de MISIONES (aparte del general): victorias y derrotas por jugador.
  const missionRanking = buildMissionRanking(missionRows, missionVictories, nickDisplay);
  const missionExtra = (nick) => `${missionRanking.wins.all[nick] || 0} ${t('victorias')} · ${missionRanking.losses.all[nick] || 0} ${t('derrotas')}`;

  // Ranking mensual: solo partidas del mes en curso (mes a mes, ahora Agosto).
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();
  const monthLabel = MONTH_NAMES()[curMonth];
  const monthWins = {}, monthLosses = {}, monthHeroKills = {};
  generalResults.forEach(r => {
    if (isGeneric(r.winner_nick) || isGeneric(r.loser_nick)) return;
    const d = new Date(r.created_date);
    if (isNaN(d.getTime()) || d.getMonth() !== curMonth || d.getFullYear() !== curYear) return;
    const mwn = nickDisplay(r.winner_nick), mln = nickDisplay(r.loser_nick);
    monthWins[mwn] = (monthWins[mwn] || 0) + 1;
    monthLosses[mln] = (monthLosses[mln] || 0) + 1;
    if (r.winner_avatar && !playerArtMap[mwn]) playerArtMap[mwn] = { art: r.winner_avatar };
    if (r.loser_avatar && !playerArtMap[mln]) playerArtMap[mln] = { art: r.loser_avatar };
    // Bajas del mes: mismo criterio que el Top Kills global (héroes vivos
    // cobran una baja por cada héroe caído del bando contrario).
    var mwDead = 0, mlDead = 0;
    (r.winner_heroes || []).forEach(h => { if (h && h.died && h.name && !SUMMON_TOKENS.includes(h.name)) mwDead++; });
    (r.loser_heroes || []).forEach(h => { if (h && h.died && h.name && !SUMMON_TOKENS.includes(h.name)) mlDead++; });
    (r.winner_heroes || []).forEach(h => {
      if (!h || !h.name || SUMMON_TOKENS.includes(h.name) || h.died) return;
      if (mlDead) monthHeroKills[h.name] = (monthHeroKills[h.name] || 0) + mlDead;
    });
    (r.loser_heroes || []).forEach(h => {
      if (!h || !h.name || SUMMON_TOKENS.includes(h.name) || h.died) return;
      if (mwDead) monthHeroKills[h.name] = (monthHeroKills[h.name] || 0) + mwDead;
    });
  });
  const monthExtra = (nick) => {
    const w = monthWins[nick] || 0, l = monthLosses[nick] || 0;
    return `${w + l} ${t('partidas')} · ${Math.round((w / Math.max(1, w + l)) * 100)}% ${t('victorias')}`;
  };

  return (
    <div className="min-h-screen relative text-[#efe9dc]" style={{ background: '#0e0a16' }}>
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMG})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-[#0e0a16]/80 via-[#0e0a16]/70 to-[#0e0a16]/95" />

      <div className="relative max-w-5xl mx-auto px-4 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm font-bold text-[#cfc6dd] border border-[#3c3158] rounded-xl px-4 py-2 bg-[#161028]/80 hover:bg-[#221a3d] transition-colors">{t('← Volver al juego')}</Link>
        </div>

        <div className="text-center mb-10">
          <img src={ICON_IMG} alt="Top Ranking" className="w-24 h-24 mx-auto rounded-full border-2 border-[#FFD24A] shadow-[0_0_30px_rgba(255,210,74,.5)] object-cover mb-4" />
          <h1 className="font-heading font-black text-4xl md:text-5xl text-[#FFD24A] drop-shadow-[0_2px_12px_rgba(255,210,74,.35)] tracking-wide">Top Ranking</h1>
          <p className="text-[#cfc6dd] mt-2 text-sm">{t('El salón de la fama de Bizarre Fantasies')} · {results ? generalResults.length : '…'} {t('partidas registradas')}</p>
        </div>

        <div className="mb-8">
          <RankingPrizeBanner />
        </div>

        {!results ? (
          <div className="flex justify-center py-20">
            <div className="w-9 h-9 border-4 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <RankList title={t('Mejores jugadores')} iconImg={ICON_CHAMPIONS} rows={top(wins, 10, playerExtra)} valueLabel={t('victorias')} accent="#FFD24A" empty={t('Nadie ha ganado todavía. ¡Sé el primero en entrar en la leyenda!')} artMap={playerArtMap} />
            </div>
            <div className="md:col-span-2">
              <RankList title={t('Mejores de ') + monthLabel} iconImg={ICON_MONTHLY} rows={top(monthWins, 10, monthExtra)} valueLabel={t('victorias')} accent="#ff9a3c" empty={t('Nadie ha ganado todavía este mes. ¡Sé el primero en entrar en la leyenda!')} artMap={playerArtMap} />
            </div>
            {/* MISIONES: sección aparte (partidas en solitario y multijugador). */}
            <div className="md:col-span-2 mt-4">
              <h2 className="font-heading font-black text-2xl text-[#FFD24A] tracking-wide">{t('Misiones')}</h2>
              <p className="text-[#cfc6dd] text-xs mt-1">{missionRows.length} {t('partidas de misión registradas')}</p>
            </div>
            <div className="md:col-span-2">
              <RankList title={t('Mejores en misiones')} iconImg={ICON_VICTORY} rows={top(missionRanking.wins.all, 10, missionExtra)} valueLabel={t('victorias')} accent="#7ddf7d" empty={t('Nadie ha ganado una misión todavía')} artMap={playerArtMap} />
            </div>
            <RankList title={t('Misiones en solitario')} iconImg={ICON_VICTORY} rows={top(missionRanking.wins.solo, 8, missionExtra)} valueLabel={t('victorias')} accent="#7ddf7d" empty={t('Nadie ha ganado una misión todavía')} artMap={playerArtMap} />
            <RankList title={t('Misiones multijugador')} iconImg={ICON_VICTORY} rows={top(missionRanking.wins.mp, 8, missionExtra)} valueLabel={t('victorias')} accent="#7ddf7d" empty={t('Nadie ha ganado una misión todavía')} artMap={playerArtMap} />
            <div className="md:col-span-2">
              <div className="rounded-2xl p-[2px] shadow-[0_0_36px_-6px_rgba(255,59,59,.45)]" style={{ background: 'linear-gradient(135deg, rgba(255,59,59,.55), rgba(255,59,59,.08) 40%, rgba(255,59,59,.55))' }}>
                <RankList title={t('Top Kills')} iconImg={ICON_KILLS} rows={top(heroKills, 8)} valueLabel={t('bajas')} accent="#ff3b3b" empty={t('Ningún héroe ha causado baja todavía. ¡Derrama sangre en el campo de batalla!')} artMap={artMap} />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="rounded-2xl p-[2px] shadow-[0_0_36px_-6px_rgba(255,59,59,.45)]" style={{ background: 'linear-gradient(135deg, rgba(255,59,59,.55), rgba(255,59,59,.08) 40%, rgba(255,59,59,.55))' }}>
                <RankList title={t('Top Kills de ') + monthLabel} iconImg={ICON_KILLS} rows={top(monthHeroKills, 8)} valueLabel={t('bajas')} accent="#ff3b3b" empty={t('Ningún héroe ha causado baja todavía este mes. ¡Derrama sangre en el campo de batalla!')} artMap={artMap} />
              </div>
            </div>
            <RankList title={t('Héroes más victoriosos')} iconImg={ICON_VICTORY} rows={top(heroWins, 8)} valueLabel={t('batallas ganadas')} accent="#7ddf7d" artMap={artMap} />
            <RankList title={t('Héroes más derrotados')} iconImg={ICON_DEFEAT} rows={top(heroLosses, 8)} valueLabel={t('batallas perdidas')} accent="#ff7d7d" artMap={artMap} />
            <RankList title={t('Héroes más veces caídos')} iconImg={ICON_FALLEN} rows={top(heroDeaths, 8)} valueLabel={t('caídas')} accent="#c06bff" artMap={artMap} />
            <RankList title={t('Héroes más renacidos')} iconImg={ICON_REBIRTH} rows={top(heroElites, 8)} valueLabel={t('renacidos')} accent="#ffd24a" artMap={artMap} />
          </div>
        )}
      </div>
    </div>
  );
}