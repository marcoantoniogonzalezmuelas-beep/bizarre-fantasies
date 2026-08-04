import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, SkipForward, Play } from 'lucide-react';
import { startMusic, stopMusic, setMuted as setMusicMuted } from '@/lib/cinematicMusic';
import BattleClash from '@/components/cinematic/BattleClash';
import TeamVersus from '@/components/cinematic/TeamVersus';
import ExpansionSlide from '@/components/cinematic/ExpansionSlide';
import MetalLights from '@/components/cinematic/MetalLights';
import DrunkLights from '@/components/cinematic/DrunkLights';
import ComedyLights from '@/components/cinematic/ComedyLights';
import DroneLights from '@/components/cinematic/DroneLights';
import DecepticonLights from '@/components/cinematic/DecepticonLights';
import PhoenixLights from '@/components/cinematic/PhoenixLights';
import ArcadeLights from '@/components/cinematic/ArcadeLights';
import CraneLights from '@/components/cinematic/CraneLights';
import PunkitoLights from '@/components/cinematic/PunkitoLights';
import FlyLights from '@/components/cinematic/FlyLights';
import { INTRO_MUSIC_URL } from '@/lib/introMusicUrl';
import { t } from '@/lib/i18n';
import useStageZoom from '@/lib/useStageZoom';
import { preloadCutout } from '@/lib/useCutoutSrc';

// Móvil/tablet: la intro se renderiza a ancho de escritorio (1200px) dentro de
// un escenario escalado para caber en pantalla, con zoom de pellizco (igual que
// el juego). En escritorio se muestra a tamaño natural.
const UA = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
const IS_TABLET = /iPad/i.test(UA) || (/Macintosh|Mac OS/i.test(UA) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1) || (/Android/i.test(UA) && !/Mobile/i.test(UA));
const IS_MOBILE = IS_TABLET || /Android|iPhone|iPod|Mobile/i.test(UA);

// Animaciones 3D reales del juego (ability_anim de las cartas).
const XAB = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0940b8c4c_generated_image.png';   // Xabierus
const NAR = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/2f9aade2d_generated_image.png';     // Narbon
const NAR_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/9bbb781e5_generated_image.png'; // Narbon (Narbonizar · élite)
const REN = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/089e4218d_generated_image.png';    // Renhubero
const BOS = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c36cac946_generated_image.png';    // Boskimano
const KRU = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/22295a6ed_generated_image.png';   // KrunderKrak
const TANK = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/76149d71f_generated_image.png';   // Tanque (acción Tanquear)
const SYL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/21b96f7c7_generated_image.png';   // Sylvex
const GOR = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/2b21e2f69_generated_image.png';   // Gorvak
const SOL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/49afa7a4e_generated_image.png';   // Solenna
const SOL_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/da922ef68_generated_image.png'; // Solenna (Resurrección · élite)
const ZAR = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b158b0415_generated_image.png';   // Zarmandis
const COF = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0b6d418b1_generated_image.png';   // Coffetath
const TRA = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/48f0023ab_generated_image.png';    // Transformer
const KIL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c40fc88dd_generated_image.png';   // KillerDucks
const KIL_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/566c990fc_generated_image.png'; // Patito de Goma (élite)
const REA = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/41f320812_generated_image.png';   // Reanimación Arcana
const AVE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/caba9677e_generated_image.png';    // Ave Fénix
const PLUMA = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/cc96fe904_generated_image.png';   // Pluma Fénix (bebé fénix)
const BOSS = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/1330d6dbf_generated_image.png';     // Boss (Intimidación)
const HEAVY = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/104e2f355_generated_image.png';   // El Heavy (Headbang)
const XAB_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/77316ee6d_generated_image.png'; // Xabierus (Torbellino Supremo · élite)
const BOSS_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b0e64743b_generated_image.png'; // Boss (Terror Absoluto · élite)
const REN_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8bae49d7b_generated_image.png'; // Renhubero (Bosque Eterno · élite)
const BOS_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/194913656_generated_image.png'; // Boskimano (Árbol Eterno · élite)
const KRU_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/1a55dd69f_generated_image.png'; // KrunderKrak (Aniquilación · élite)
const HEAVY_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/cbcb45934_generated_image.png'; // El Heavy (Wall of Death · élite)
const SYL_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/83a4d6985_generated_image.png'; // Sylvex (Evolución Suprema · élite)
const GOR_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5a8fca625_generated_image.png'; // Gorvak (Devastación Orbital · élite)
const ZAR_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/69f6f049f_generated_image.png'; // Zarmandis (Divinidad · élite)
const COF_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ac1eef0ef_generated_image.png'; // Coffetath (Vacío Mental · élite)
const HIL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e90702da8_generated_image.png';      // Hildra (Furia Ciega)
const UND = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5487d7928_generated_image.png';     // Undertaker (Decapitación)
const HANNAI = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/70ab16a53_generated_image.png';   // Hannai Boa (Sigilo Cuántico)
const CLINT = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a7395b4ae_generated_image.png';    // Clint Tripud
const FUTBOLISTA = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/37644e0d0_generated_image.png'; // El Futbolista (Tiro Libre)
const GAMER = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/13266939b_generated_image.png';    // El Gamer
const ALFREDINHO = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/95146ea6f_generated_image.png'; // Alfredinho (Doble Disparo)
const BERM_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d60007ad8_generated_image.png'; // Bermellus (élite)
const AJEDRECISTA = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/6c3c2bc98_generated_image.png'; // El Ajedrecista (habilidad)
const RETROPOETA = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/2ca9bc580_generated_image.png'; // Retropoeta
const RETROPOETA_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e179830c9_generated_image.png'; // Retropoeta (versión élite)
const CHIVO = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0259c21e4_generated_image.png';     // Chivo
const BATU = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/e20f77c2e_generated_image.png';    // Batu
const NIX = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/16ec909b5_generated_image.png';   // Nixara
const REV_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/114c5e05f_generated_image.png'; // Reverendo Sapis (élite)
const ELD_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/15cedc23d_generated_image.png';  // Elderbar (élite)
const PATRON_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b27a3b9dd_generated_image.png'; // Patrón (Flecha Infalible · élite)
const BUTIFARRA_ELITE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/d556c5ef7_generated_image.png'; // La Butifarra (Gases Tóxicos · élite)

function buildScenes() {
  return [
    { clash: { left: BERM_ELITE, right: ALFREDINHO, accent: '#7cff5a', kind: 'clash', swap: false, motion: 'float', fx: 'comedy' }, kicker: t('Bizarre Fantasies'), title: t('Bienvenido al mundo de las fantasías bizarras'), text: t('El tiempo se ha roto. Aquí todas las épocas colisionan: el presente, el futuro, la Edad Media y la épica fantástica — medieval y espacial. Un solo mundo, infinitas eras.'), dur: 8 },
    { clash: { left: RETROPOETA_ELITE, right: HEAVY, accent: '#7c9cff', kind: 'sword', swap: true, motion: 'diagonal', fx: 'metal' }, kicker: t('Eras'), title: t('Todas las épocas a la vez'), text: t('Desde los días actuales hasta el lejano futuro, pasando por la Edad Media y la épica fantástica, medieval y espacial. En Bizarre Fantasies, ninguna era queda fuera del tablero.'), dur: 12 },
    { clash: { left: REV_ELITE, right: ELD_ELITE, accent: '#ffc24a', kind: 'chill', swap: false, motion: 'up', fx: 'drunk' }, kicker: t('Tregua bizarra'), title: t('Brindis en medio del caos'), text: t('Tras la batalla, el reverendo y el anciano elfo se reúnen junto al fuego: se curan las heridas, filosofan sobre el caos y brindan con la pipa y la cerveza espumando. «Salud», dice uno; «y muérdete la lengua», responde el otro — pero ambos ríen.'), dur: 12 },
    { clash: { left: GOR, right: SYL, accent: '#ff5a3c', kind: 'clash', swap: false, motion: 'rotate', fx: 'crane' }, kicker: t('Combates'), title: t('Batallas de RPG japonés'), text: t('Combates por turnos al estilo de los grandes RPG japoneses de los 90 y 2000: estratégicos, épicos y emocionantes. Cada turno, una decisión; cada carta, un destino.'), dur: 12 },
    { clash: { left: TRA, right: TANK, accent: '#29a3ff', kind: 'shoot', swap: true, motion: 'charge', fx: 'decepticon' }, kicker: t('Choque mecánico'), title: t('Transformer contra el Tanque'), text: t('El Transformer despliega sus engranajes, robot gigante tipo Optimus, y carga arcos eléctricos azules contra el Tanque. El Tanque planta las orugas, atrapa los golpes con el blindaje humeante y responde con una andanada de acero que hace tembrar el suelo. Mecánico contra blindaje — y el asfalto empieza a fundirse.'), dur: 13 },
    { clash: { left: AVE, right: HANNAI, accent: '#ff7a18', kind: 'fire', swap: false, motion: 'down', fx: 'phoenix' }, kicker: t('Choque épico'), title: t('Ave Fénix contra Hannai Boa'), text: t('El Ave Fénix arde desde las cenizas y se lanza en picado envuelta en llamas vivas. Hannai Boa despliega su Sigilo Cuántico y se funde con las sombras: el fuego pasa de largo, las llamas lamien el vacío. Fuego contra sombra — y el fénix, desconcertado, remonta.'), dur: 13 },
    { clash: { left: PLUMA, right: SOL_ELITE, accent: '#ffb347', kind: 'fire', swap: true, motion: 'spin', fx: 'punkito' }, kicker: t('Renacimiento'), title: t('Pluma Fénix renace'), text: t('De una sola pluma ardiente renace un fénix joven: pequeño, veloz, envuelto en brasas. Se cuela entre los pliegues del manto de Solenna y le picotea los tobillos con picotazos de fuego. Solenna sonríe, invoca su Resurrección y lo envuelve todo en una luz dorada — pero el fénix ya está en otro lado, y ríe con voz de cría.'), dur: 12 },
    { expansion: { ducks: [KIL, KIL_ELITE], others: [ZAR, COF], accent: '#b13bff' }, kicker: t('Expansiones'), title: t('Expansiones temáticas'), text: t('Nuevas eras y cartas que decidirá la comunidad. Cada expansión trae su temática, sus razas y sus héroes nuevos — y tú decides qué mundo llega después.'), dur: 12 },
    { versus: { left: [CLINT, FUTBOLISTA, GAMER], right: [HIL, AJEDRECISTA, NAR], accent: '#ffd24a', fx: 'arcade' }, kicker: t('Equipos'), title: t('Tres contra tres'), text: t('Cada equipo se compone de tres héroes: uno cuerpo a cuerpo, uno a distancia y uno mágico. Reúne al tuyo, enfréntalo al rival y que el bizarro caiga del lado contrario.'), dur: 11 },
    { clash: { left: PATRON_ELITE, right: BUTIFARRA_ELITE, accent: '#ffd24a', kind: 'clash', swap: false, motion: 'float', fx: 'drone' }, kicker: t('Bizarre Fantasies'), title: t('¿Te atreves a entrar?'), text: '', isEnd: true, dur: 9 },
  ];
}

export default function IntroCinematic({ onClose }) {
  const scenes = useMemo(() => buildScenes(), []);
  useEffect(() => {
    scenes.forEach((s) => {
      if (s.clash) { preloadCutout(s.clash.left); preloadCutout(s.clash.right); }
      if (s.versus) { [...s.versus.left, ...s.versus.right].forEach(preloadCutout); }
      if (s.expansion) { [...s.expansion.ducks, ...s.expansion.others].forEach(preloadCutout); }
    });
  }, [scenes]);
  const [i, setI] = useState(0);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);
  const stageRef = useStageZoom(1200);

  const audioRef = useRef(null);
  useEffect(() => {
    if (INTRO_MUSIC_URL) {
      const a = new Audio(INTRO_MUSIC_URL);
      a.loop = true; a.volume = 0.85;
      a.play().catch(() => {});
      audioRef.current = a;
      return () => { a.pause(); audioRef.current = null; };
    }
    startMusic();
    return () => stopMusic();
  }, []);

  useEffect(() => {
    if (finished) return;
    const cur = scenes[i];
    if (cur.isEnd) return;
    const id = setTimeout(() => {
      if (i < scenes.length - 1) setI(i + 1);
      else setFinished(true);
    }, cur.dur * 1000);
    return () => clearTimeout(id);
  }, [i, finished, scenes]);

  const toggleMute = () => {
    const m = !muted; setMuted(m);
    if (audioRef.current) audioRef.current.muted = m;
    setMusicMuted(m);
  };
  const close = () => { if (audioRef.current) audioRef.current.pause(); stopMusic(); onClose(); };

  const cur = scenes[i];

  return (
    <div className="fixed inset-0 z-[200000] bg-black overflow-hidden select-none">
      {/* Escenario de escritorio (1200px) escalado en móvil con zoom de pellizco.
          En escritorio rellena el overlay (absolute inset-0). */}
      <div ref={IS_MOBILE ? stageRef : null} className={IS_MOBILE ? 'absolute left-0 top-0 bg-black overflow-hidden' : 'absolute inset-0'} style={IS_MOBILE ? { willChange: 'transform', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' } : undefined}>
      {/* Choque bizarro entre animaciones 3D reales del juego (todas las escenas) */}
      {cur.clash && <BattleClash left={cur.clash.left} right={cur.clash.right} accent={cur.clash.accent} kind={cur.clash.kind} swap={cur.clash.swap} motion={cur.clash.motion} />}
      {cur.clash && cur.clash.fx === 'metal' && <MetalLights />}
      {cur.clash && cur.clash.fx === 'drunk' && <DrunkLights />}
      {cur.clash && cur.clash.fx === 'comedy' && <ComedyLights />}
      {cur.clash && cur.clash.fx === 'comedy' && <FlyLights />}
      {cur.clash && cur.clash.fx === 'drone' && <DroneLights />}
      {cur.clash && cur.clash.fx === 'phoenix' && <PhoenixLights />}
      {cur.clash && cur.clash.fx === 'crane' && <CraneLights />}
      {cur.clash && cur.clash.fx === 'punkito' && <PunkitoLights />}
{cur.clash && cur.clash.fx === 'decepticon' && <DecepticonLights />}
      {cur.versus && <TeamVersus left={cur.versus.left} right={cur.versus.right} accent={cur.versus.accent} />}
      {cur.versus && cur.versus.fx === 'arcade' && <ArcadeLights />}
      {cur.expansion && <ExpansionSlide ducks={cur.expansion.ducks} others={cur.expansion.others} accent={cur.expansion.accent} />}

      {/* Viñeta + legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/92 pointer-events-none" />

      {/* Contenido narrativo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            {cur.kicker && (
              <div className="font-heading tracking-[0.4em] text-[#ffd24a] text-sm mb-3 uppercase">{cur.kicker}</div>
            )}
            <h2 className="font-heading font-black text-[#fff5dc] text-5xl leading-tight mb-4" style={{ textShadow: '0 3px 18px #000, 0 0 28px rgba(255,210,74,.3)' }}>{cur.title}</h2>
            {cur.text && <p className="font-body text-[#e6dff2] text-xl leading-relaxed max-w-xl mx-auto" style={{ textShadow: '0 2px 8px #000' }}>{cur.text}</p>}
            {cur.isEnd && (
              <button
                onClick={close}
                className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-heading font-black text-[#2a1d05] text-lg bg-gradient-to-b from-[#ffe49a] via-[#FFD24A] to-[#d8a431] border border-[#ffe9a8] shadow-[0_10px_30px_rgba(255,210,74,.5)] hover:scale-[1.04] active:scale-95 transition-transform"
              >
                <Play size={20} /> {t('Entrar en Bizarre Fantasies')}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>

      {/* Barra de progreso por escena */}
      <div className="absolute left-0 right-0 bottom-0 px-6 pb-5">
        <div className="mx-auto max-w-xl">
          <div className="flex gap-1.5 mb-2">
            {scenes.map((_, k) => (
              <div key={k} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/15">
                {k === i && !finished && (
                  <motion.div className="h-full bg-[#FFD24A]" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: scenes[i].dur, ease: 'linear' }} />
                )}
                {k < i && <div className="h-full w-full bg-[#FFD24A]/70" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controles: saltar + silenciar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={toggleMute}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-black/55 border border-[#ffd24a]/55 text-[#ffe49a] hover:bg-black/75 active:scale-95 transition-all backdrop-blur-sm"
          aria-label={muted ? t('Activar música') : t('Silenciar música')}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button
          onClick={close}
          className="h-11 px-4 rounded-full flex items-center gap-2 bg-black/55 border border-[#ffd24a]/55 text-[#ffe49a] hover:bg-black/75 active:scale-95 transition-all backdrop-blur-sm font-heading font-bold text-sm"
        >
          <SkipForward size={18} /> {t('Saltar intro')}
        </button>
      </div>

      {/* Botón de cerrar (X) esquina */}
      <button onClick={close} className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-black/45 border border-white/20 text-white/80 hover:text-white hover:bg-black/70 active:scale-95 transition-all" aria-label={t('Cerrar')}>
        <X size={18} />
      </button>
    </div>
  );
}