import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, SkipForward, Play } from 'lucide-react';
import { COVER_BG, HERO_ART, HERO_ELITE_ART } from '@/lib/artUrls';
import { startMusic, stopMusic, setMuted as setMusicMuted } from '@/lib/cinematicMusic';
import BattleClash from '@/components/cinematic/BattleClash';
import { INTRO_MUSIC_URL } from '@/lib/introMusicUrl';
import { t } from '@/lib/i18n';

const cover = (url) => ({ backgroundImage: `linear-gradient(rgba(6,4,12,.5),rgba(6,4,12,.78)), url("${url}")` });

// Animaciones 3D reales del juego (ability_anim / battle_art de las cartas).
const RENHUBERO = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/089e4218d_generated_image.png';
const RENHUBERO_E = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8bae49d7b_generated_image.png';
const BOSKIMANO = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c36cac946_generated_image.png';
const VAP_ROGERS = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/3601207f1_generated_image.png';
const XABIERUS = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/0940b8c4c_generated_image.png';
const KRUNDER = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/22295a6ed_generated_image.png';
const PATITO = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/f920d0819_generated_image.png';
const MORTHEX = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/9e800cc3f_generated_image.png';

function buildScenes() {
  return [
    { bg: COVER_BG, kicker: t('Bizarre Fantasies'), title: t('Bienvenido al mundo de las fantasías bizarras'), text: t('El tiempo se ha roto. Un mundo donde todas las épocas del tiempo colisionan: el presente, el futuro, la Edad Media y la fantasía épica — medieval y espacial.'), dur: 8 },
    { bg: HERO_ART[2], kicker: t('Eras'), title: t('Todas las épocas a la vez'), text: t('Desde los días actuales hasta el futuro, pasando por la Edad Media y la épica fantástica medieval y espacial. Todo cabe en Bizarre Fantasies.'), dur: 18 },
    { bg: HERO_ART[0], kicker: t('Base Set'), title: t('Héroes de cada era'), text: t('Retropoeta, Patrón, Xabierus, Narbon, Zarmandis, Chivo… los protagonistas del Base Set. Y muchos más por llegar en cada expansión.'), dur: 18 },
    { clash: { left: RENHUBERO, right: VAP_ROGERS, accent: '#ff5a3c', kind: 'shoot' }, kicker: t('Duelo bizarro'), title: t('Renhubero contra Vap Rogers'), text: t('Renhubero, comiendo pipas, saca la pistola; Vap Rogers, el vaquero, responde con su revólver. Se disparan a quemarropa en un duelo de eras.'), dur: 16 },
    { clash: { left: RENHUBERO_E, right: BOSKIMANO, accent: '#ffc24a', kind: 'chill' }, kicker: t('Descanso bizarro'), title: t('Brindis en medio del caos'), text: t('Renhubero brinda con una cerveza, escopeta al hombro; Boskimano se cura fumándose un pitillo. Beben y descansan juntos antes de la siguiente batalla.'), dur: 16 },
    { clash: { left: XABIERUS, right: KRUNDER, accent: '#7c9cff', kind: 'sword' }, kicker: t('Choque bizarro'), title: t('Xabierus contra KrunderKrak'), text: t('Xabierus, el guerrero, hunde su espada; KrunderKrak, el maestro infulero, recibe el golpe imbloqueable. Acero contra furia épica.'), dur: 16 },
    { bg: HERO_ART[27], kicker: t('Combates'), title: t('Batallas de RPG japonés'), text: t('Combates por turnos al estilo de los grandes RPG japoneses de los 90 y 2000: estratégicos, épicos y emocionantes.'), dur: 16 },
    { clash: { left: PATITO, right: MORTHEX, accent: '#7cff5a', kind: 'clash' }, kicker: t('Choque bizarro'), title: t('Patito de goma contra Morthex'), text: t('El Patito de Goma, bloqueador de baño, se estampa contra Morthex, el no-muerto. Goma contra muerte en una colisión imposible.'), dur: 16 },
    { bg: HERO_ART[15], kicker: t('Expansiones'), title: t('Expansiones temáticas'), text: t('Nuevas eras y cartas que decidirá la comunidad. Cada expansión trae su temática, sus razas y sus héroes nuevos.'), dur: 16 },
    { bg: HERO_ART[40], kicker: t('Competición'), title: t('Rankings por temporadas'), text: t('Sube de nivel, cambia de raza y compite. Rankings dinámicos que rotan cada temporada.'), dur: 16 },
    { bg: HERO_ART[33], kicker: t('Espíritu'), title: t('Bizarro, excéntrico, con humor'), text: t('Un toque absurdamente divertido: el único objetivo es pasarlo bien y entretenerse. Bienvenido al caos.'), dur: 16 },
    { bg: HERO_ELITE_ART[0], kicker: t('Bizarre Fantasies'), title: t('¿Te atreves a entrar?'), text: '', isEnd: true, dur: 8 },
  ];
}

export default function IntroCinematic({ onClose }) {
  const scenes = useMemo(() => buildScenes(), []);
  const [i, setI] = useState(0);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);

  const audioRef = useRef(null);
  useEffect(() => {
    // Si hay una banda sonora propia (vídeo del usuario), se reproduce en bucle;
    // si no, cae a la música procedural.
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
    if (cur.isEnd) return; // la carta final espera al usuario
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
    <div className="fixed inset-0 z-[200000] bg-[#050308] overflow-hidden select-none">
      {/* Choque bizarro entre cinemáticas reales del juego */}
      {cur.clash && <BattleClash left={cur.clash.left} right={cur.clash.right} accent={cur.clash.accent} kind={cur.clash.kind} />}

      {/* Fondo con Ken Burns por escena (solo en escenas con imagen) */}
      {cur.bg && (
      <AnimatePresence mode="popLayout">
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.6 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ ...cover(cur.bg), filter: 'saturate(1.12) contrast(1.08)' }}
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            initial={{ scale: 1.12, x: '2%' }}
            animate={{ scale: 1.22, x: '-2%' }}
            transition={{ duration: cur.dur || 8, ease: 'linear' }}
            style={{ backgroundImage: `url("${cur.bg}")`, filter: 'saturate(1.18) contrast(1.1) brightness(.9)' }}
          />
        </motion.div>
      </AnimatePresence>
      )}

      {/* Viñeta + legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050308]/70 via-transparent to-[#050308]/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_30%,#050308_110%)]" />

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
              <div className="font-heading tracking-[0.4em] text-[#ffd24a] text-xs md:text-sm mb-3 uppercase">{cur.kicker}</div>
            )}
            <h2 className="font-heading font-black text-[#fff5dc] text-3xl md:text-5xl leading-tight mb-4" style={{ textShadow: '0 3px 18px #000, 0 0 28px rgba(255,210,74,.3)' }}>{cur.title}</h2>
            {cur.text && <p className="font-body text-[#e6dff2] text-base md:text-xl leading-relaxed max-w-xl mx-auto" style={{ textShadow: '0 2px 8px #000' }}>{cur.text}</p>}
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