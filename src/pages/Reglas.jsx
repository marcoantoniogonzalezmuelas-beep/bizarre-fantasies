import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Target } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useDesktopZoom } from '@/lib/useDesktopZoom';

const BG_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/f2d5fe441_generated_image.png';
const ICON_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab147bafb_generated_image.png';

const CC_EMB = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab147bafb_generated_image.png';
const AD_EMB = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fd388871c_generated_image.png';
const HE_EMB = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/cfd5e317c_generated_image.png';
const ACT_MELEE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fefda0ace_generated_image.png';
const ACT_SHOT = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/210f89d43_generated_image.png';
const ACT_SPELL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/7c59e1ff7_generated_image.png';
const ACT_OBJ = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/90ff926d5_generated_image.png';
const ACT_DEF = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/1d9e5fb8f_generated_image.png';
const ACT_TANK = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b5ca5c078_generated_image.png';

const STEPS = [
  {
    n: '1',
    title: 'Subasta · 3 fases',
    body: (
      <>
        Una fase por tipo de héroe: <Em img={CC_EMB} /> <b>cuerpo a cuerpo (CC)</b>, <Em img={AD_EMB} /> <b>distancia (AD)</b> y <Em img={HE_EMB} /> <b>magia (HE)</b>. En cada fase salen <b>6 héroes, uno por raza</b> (cada raza con su color y símbolo). Elige uno, escribe tu puja con <b>− / +</b> y pulsa <b>Pujar</b>: la puja es <b>sellada</b> (a ciegas) y gana quien ofrezca más. Si los dos pujáis por el <b>mismo héroe</b>, se abre una nueva tanda de pujas. Cada ronda trae un <b>bonificador único</b> (no se repite en la partida): más monedas, ventajas… o un castigo al rival.
      </>
    ),
  },
  {
    n: '2',
    title: 'Equipamiento',
    body: (
      <>
        Con tu presupuesto equipas a cada héroe con <b>1 arma</b> (cuerpo a cuerpo <i>o</i> distancia) y <b>1 armadura</b>: verás cómo cambian sus stats al momento. Los <b>hechizos</b> (carta única, gastan maná) y los <b>objetos</b> (hasta 3 copias) van a tu <b>mano</b> para usarlos en batalla. Puedes quitar una carta comprada (×) y recuperar sus monedas.
      </>
    ),
  },
  {
    n: '3',
    title: 'Combate por rondas',
    body: (
      <>
        Orden de turnos: <b>distancia → hechizos → cuerpo a cuerpo</b> (si empatan, va antes quien tenga más velocidad). En cada carta: barra <Swatch c="#7ce287" /> <b style={{ color: '#7ce287' }}>verde = vida</b> y barra <Swatch c="#6ec6ff" /> <b style={{ color: '#6ec6ff' }}>azul = maná</b>.
      </>
    ),
  },
];

const COINS = [
  { icon: '🪙', title: 'Monedas', text: 'Empiezas con 100 de subasta y 100 de equipamiento. Si te quedas corto pujando, puedes transferir monedas del equipamiento a la subasta de 10 en 10. Al acabar toda la subasta, las monedas de subasta que te sobren se suman a tu presupuesto de equipamiento, junto con los bonificadores positivos de equipamiento que te hayan salido durante la subasta.' },
  { icon: '✦', title: 'Cartas Épicas', text: 'Las más poderosas: cuestan +20 monedas. No salen normalmente; ciertos bonificadores hacen que tú (o tu rival) recibáis una oferta Épica extra.' },
  { icon: '🏦', title: '¿Sin monedas de subasta?', text: 'Si te quedas sin monedas para pujar, pulsa Transferir monedas de equipamiento: pasas monedas de tu bolsa de equipamiento a la de subasta (de 10 en 10) y sigues pujando. Sin deudas — lo que transfieras sale de tu presupuesto de equipamiento, así que gástalo con cabeza.' },
];

const ACTIONS = [
  { img: ACT_MELEE, title: 'Cuerpo a cuerpo', text: 'Golpe melé: daño = tu CC + arma.' },
  { img: ACT_SHOT, title: 'Disparo', text: 'Necesita arma a distancia; daño por potencia × tu AD.' },
  { img: ACT_SPELL, title: 'Hechizo', text: 'Usa HE y gasta maná 🔵.' },
  { img: HE_EMB, title: 'Habilidad del héroe', text: 'El poder especial propio de ese héroe (cada uno el suyo). Se lee en la franja dorada del panel; en forma Élite mejora.', wide: true },
  { img: ACT_OBJ, title: 'Objeto', text: 'Juega un objeto de tu mano (poción, maná…).' },
  { img: ACT_DEF, title: 'Defender', text: 'Te cubres: recibes menos daño este turno.' },
  { img: ACT_TANK, title: 'Tanquear', text: 'Atraes los ataques rivales para proteger al equipo.' },
];

const STATES = [
  { c: '#9b8cff', i: '💤', n: 'Dormido', x: 'Pierde su próximo turno.' },
  { c: '#ffe14a', i: '⚡', n: 'Paralizado', x: 'Pierde su próximo turno.' },
  { c: '#6ec6ff', i: '❄️', n: 'Congelado', x: 'Actúa con velocidad reducida (va más tarde).' },
  { c: '#b05cff', i: '☠️', n: 'Maldito', x: 'Reducción temporal de sus atributos.' },
  { c: '#ffd24a', i: '✦', n: 'Bendito', x: 'Aumento temporal de sus atributos.' },
  { c: '#7ce287', i: '🛡', n: 'Tanqueando', x: 'Intercepta los ataques a sus aliados hasta su próximo turno.' },
  { c: '#ff9c40', i: '★', n: 'Confuso', x: '2 turnos (3 en Élite): 50% de perder cada acción.' },
  { c: '#ff7ad9', i: '🍺', n: 'Borracho', x: 'Recibe 3 de daño, −3 CC/AD/HE durante 2 turnos (3 en Élite) y 35% de fallar cada acción.' },
  { c: '#8fe3d9', i: '💫', n: 'Mareado', x: '−4 CC/AD/HE durante 2 turnos (3 con Gases Tóxicos Élite).' },
];

function Em({ img }) {
  return (
    <span className="inline-flex items-center justify-center align-middle w-8 h-8 rounded-full overflow-hidden border border-[#ffd24a]/60 shadow-[0_0_8px_rgba(255,210,74,.4)] bg-[radial-gradient(circle_at_40%_30%,#1a0a00,#0a0500)]">
      <img src={img} alt="" className="w-full h-full object-cover" />
    </span>
  );
}

// Muestra el color real como ejemplo visual (cuadrado relleno) junto al
// nombre del color que ya aparece en el texto; sin mostrar el código hex.
function Swatch({ c }) {
  return (
    <span className="inline-flex align-middle w-4 h-4 rounded-[4px] border border-white/25 mx-0.5" style={{ background: c, boxShadow: `0 0 8px ${c}cc` }} aria-hidden="true" />
  );
}

function Step({ n, title, body }) {
  return (
    <div className="flex gap-3.5 items-start bg-gradient-to-br from-[#1c102e]/70 to-[#0c0714]/85 border border-[#ffd24a]/28 rounded-2xl p-4 shadow-[0_6px_16px_rgba(0,0,0,.4)]">
      <div className="flex-0 w-10 h-10 rounded-full flex items-center justify-center font-heading font-black text-base text-[#3a2600] bg-[radial-gradient(circle_at_35%_30%,#ffeaa6,#FFD24A_50%,#a9771f)] border-2 border-[#7c5410] shadow-[0_2px_8px_rgba(0,0,0,.5)]">{n}</div>
      <div className="flex-1">
        <div className="font-heading font-black text-[#ffd24a] tracking-wide mb-1 text-lg">{title}</div>
        <div className="text-[#efe9dc] text-base leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

export default function Reglas() {
  useDesktopZoom();
  return (
    <div className="min-h-screen relative text-[#efe9dc]" style={{ background: '#0e0a16' }}>
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMG})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-[#0e0a16]/85 via-[#0e0a16]/72 to-[#0e0a16]/96" />

      <div className="relative max-w-5xl mx-auto px-4 py-8 pb-20">
        <div className="flex items-center justify-between mb-8 gap-3">
          <Link to="/" className="text-sm font-bold text-[#cfc6dd] border border-[#3c3158] rounded-xl px-4 py-2 bg-[#161028]/80 hover:bg-[#221a3d] transition-colors">{t('← Volver al juego')}</Link>
          <Link to="/guiacartas" className="flex items-center gap-2 text-sm font-bold text-[#ffe9a8] border border-[#ffd24a]/55 rounded-xl px-4 py-2 bg-[#161028]/80 hover:bg-[#221a3d] transition-colors shadow-[0_0_14px_rgba(255,210,74,.18)]">
            <BookOpen size={16} /> {t('Conocer las Cartas')}
          </Link>
        </div>

        <div className="text-center mb-10">
          <img src={ICON_IMG} alt="Reglas" className="w-24 h-24 mx-auto rounded-full border-2 border-[#FFD24A] shadow-[0_0_30px_rgba(255,210,74,.5)] object-cover mb-4" />
          <h1 className="font-heading font-black text-4xl md:text-6xl text-[#FFD24A] drop-shadow-[0_2px_12px_rgba(255,210,74,.35)] tracking-wide">{t('Reglas')}</h1>
          <p className="text-[#cfc6dd] mt-3 text-base max-w-2xl mx-auto">{t('Todo lo que necesitas saber para dominar Bizarre Fantasies')}</p>
        </div>

        <div className="rounded-2xl bg-[#0c0714]/70 border border-[#ffd24a]/25 p-5 md:p-7 mb-5 shadow-[0_10px_30px_rgba(0,0,0,.5)]">
          <p className="text-lg mb-5">
            <b className="text-[#ffe9a8] inline-flex items-center gap-2"><span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[radial-gradient(circle_at_34%_28%,#fff0ae,#FFD24A_45%,#b77614)] border-2 border-[#7c5410] shadow-[0_0_10px_rgba(255,210,74,.5)]"><Target size={15} className="text-[#4a2e03]" /></span> Objetivo:</b> {t('arma un equipo de ')}
            <b>3 héroes</b>, {t('equípalos bien y derrota a los 3 héroes del rival en un combate por turnos.')}.
          </p>

          <div className="space-y-3.5 mb-5">
            {STEPS.map((s) => <Step key={s.n} {...s} />)}
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-5">
            {COINS.map((c) => (
              <div key={c.title} className="bg-gradient-to-b from-[#140a23]/85 to-[#0a050f]/95 border border-[#ffd24a]/40 rounded-2xl p-4">
                <div className="font-heading font-black text-[#ffd24a] text-base mb-1">{c.icon} {c.title}</div>
                <div className="text-[#d8d0e4] text-base leading-relaxed">{c.text}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {ACTIONS.map((a) => (
              <div key={a.title} className={`flex flex-col items-center gap-2 text-center bg-gradient-to-b from-[#140a23]/85 to-[#0a050f]/95 border border-[#ffd24a]/40 rounded-2xl p-3 ${a.wide ? 'col-span-2 md:col-span-3 md:flex-row md:text-left md:gap-3 md:border-[#ffd24a]/70' : ''}`}>
                <div className="w-12 h-12 rounded-full border-2 border-[#ffd24a]/60 shadow-[0_0_10px_rgba(255,210,74,.5)] overflow-hidden bg-[radial-gradient(circle_at_40%_30%,#1a0a00,#0a0500)] flex-shrink-0">
                  <img src={a.img} alt="" className="w-full h-full object-cover" />
                </div>
                <div className={a.wide ? 'flex-1' : ''}>
                  <div className="font-heading font-black text-[#ffd24a] text-base">{a.title}</div>
                  <div className="text-[#d8d0e4] text-sm leading-snug">{a.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-[#b8aacb] italic mb-5">{t('Así se ve el panel del héroe activo en batalla. Cada acción gasta el turno.')}</div>

          <div className="space-y-2.5 mb-5 text-sm leading-relaxed">
            <p><b className="text-[#ffe9a8]">⚡ Maná:</b> {t('es una reserva fija para toda la batalla que no se regenera. Recupéralo con el Cristal o el Orbe de Maná.')}</p>
            <p><b className="text-[#ffe9a8]">🛡️ Armaduras:</b> {t('reducen el daño de golpes, disparos y hechizos. Las elementales anulan por completo su elemento contrario (agua↔fuego, rayo↔agua, hielo↔rayo, fuego↔hielo). La Barrera Arcana protege del daño mágico.')}</p>
            <p><b style={{ color: '#ffaa00' }}>⭐ Forma Élite:</b> {t('cuando un héroe cae por primera vez, renace en Élite con parte de su vida y stats mejorados según su raza. Al revivir renace limpio: sin estados negativos y sin arma ni armadura (van a la pila de descartes). Si vuelve a caer, muere de verdad — salvo Pluma Fénix o Ave Fénix.')}</p>
            <p><b style={{ color: '#ffd24a' }}>🔑 Regla de oro de habilidades:</b> {t('cada héroe puede usar su habilidad normal y su habilidad élite una sola vez por batalla (se cuentan por separado). Una vez jugada, no se puede volver a usar en esa batalla, ni siquiera tras revivir.')}</p>
            <p><b style={{ color: '#a06bff' }}>♻️ Pila de descartes:</b> {t('cuando un héroe cae, su arma y armadura van a tu pila de descartes; los objetos consumidos también. Con Reanimación Arcana recuperas una carta aleatoria de la pila: los objetos vuelven a ser jugables y las armas/armaduras se equipan gratis al jugarlas desde la mano.')}</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border border-[#ffd24a]/35 p-5 mb-5">
            <div className="font-heading font-black text-[#ffd24a] text-lg mb-3">⚡ {t('Velocidad y orden de turnos')}</div>
            <div className="space-y-2.5 text-base leading-relaxed">
              <p><b className="text-[#ffe9a8]">Cada ronda:</b> {t('los héroes que puedan actuar lo hacen por tipo de acción — primero los de distancia (AD), luego los hechizos y por último los de cuerpo a cuerpo (CC): el arquero dispara antes de que llegue el melé.')}</p>
              <p><b className="text-[#ffe9a8]">Desempate por velocidad:</b> {t('dentro del mismo tipo, actúa antes el héroe con más velocidad. Cada héroe parte de una velocidad base según su raza, y algunas armas y armaduras la aumentan: tu equipo sí puede cambiar cuándo te toca actuar.')}</p>
              <p><b className="text-[#ffe9a8]">⚡ Marcador de velocidad:</b> {t('cada héroe lleva')} <b className="text-[#fff5dc]">⚡ + un número</b> {t('con su velocidad base, arriba en la carta. Los más veloces (≥21) brillan en')} <Swatch c="#FFD24A" /> <b style={{ color: '#FFD24A' }}>{t('dorado con el sello RÁPIDO')}</b>{t(': de un vistazo ves quién vuela al ficharlo y al ordenar los turnos.')}</p>
              <p><b className="text-[#ffe9a8]">Estados que sí mueven tu turno:</b> {t('Congelado actúa con velocidad reducida (va más tarde); Dormido y Paralizado pierden su próximo turno. El resto de estados cambian tus stats o tu daño, no cuándo te toca actuar.')}</p>
              <p><b className="text-[#ffe9a8]">¿Y en la subasta?</b> {t('el tipo de héroe (CC/AD/HE) ya marca su banda de turno y lo ves al elegir. Cada héroe lleva arriba el marcador')} <b className="text-[#fff5dc]">⚡ + su velocidad</b>{t('; los más veloces (≥21) brillan en')} <Swatch c="#FFD24A" /> <b style={{ color: '#FFD24A' }}>{t('dorado con RÁPIDO')}</b>{t('. Así sabes de un vistazo quién es más rápido al planear tu equipo; al equiparlo, algunas armas y armaduras lo suben.')}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border border-[#ffd24a]/35 p-5 mb-5">
            <div className="font-heading font-black text-[#ffd24a] text-lg mb-3">☠️ {t('Muerte y reanimación de héroes')}</div>
            <div className="space-y-2.5 text-base leading-relaxed">
              <p><b className="text-[#ff7a6a]">Caer a 0 de vida:</b> {t('el héroe queda fuera de combate. Su arma y su armadura se van a tu pila de descartes, igual que los objetos que hubiera consumido.')}</p>
              <p><b style={{ color: '#ffaa00' }}>Primera caída → renace en Élite:</b> {t('vuelve con parte de su vida y stats mejorados según su raza. Renace limpio: sin estados negativos y sin arma ni armadura (están en la pila de descartes).')}</p>
              <p><b className="text-[#ff5252]">Segunda caída → muerte definitiva:</b> {t('el héroe queda eliminado permanentemente de la batalla… salvo que jugues Pluma Fénix o Ave Fénix, que lo traen de vuelta una vez más.')}</p>
              <p><b style={{ color: '#a06bff' }}>♻️ Reanimación Arcana:</b> {t('recuperas una carta aleatoria de tu pila de descartes: los objetos vuelven a ser jugables y las armas/armaduras se equipan gratis al jugarlas desde la mano.')}</p>
              <p><b style={{ color: '#ffd24a' }}>🔑 Habilidades:</b> {t('cada héroe puede usar su habilidad normal y su habilidad élite una sola vez por batalla (se cuentan por separado). Al revivir no recupera una habilidad ya gastada.')}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border border-[#ffd24a]/35 p-5">
            <div className="font-heading font-black text-[#ffd24a] text-lg mb-3">✨ {t('Estados de combate')}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {STATES.map((s) => (
                <div key={s.n} className="flex items-start gap-3 bg-gradient-to-b from-[#140a23]/85 to-[#0a050f]/95 rounded-xl p-3 border" style={{ borderColor: s.c + '88', boxShadow: `inset 0 0 18px -10px ${s.c}` }}>
                  <span className="shrink-0 w-9 h-9 rounded-lg border-2 border-white/15" style={{ background: s.c, boxShadow: `0 0 14px ${s.c}cc` }} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">{s.i}</span>
                      <span className="font-black text-base tracking-wide" style={{ color: s.c }}>{s.n}</span>
                    </div>
                    <div className="text-[#e6dff2] text-sm leading-snug mt-1">{s.x}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}