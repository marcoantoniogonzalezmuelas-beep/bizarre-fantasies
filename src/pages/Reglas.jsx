import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Target } from 'lucide-react';
import { t, getLang } from '@/lib/i18n';
import { useDesktopZoom } from '@/lib/useDesktopZoom';
import FumbleRulesSection from '@/components/rules/FumbleRulesSection';

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

// Helper de traducción local (ES/EN). Lee el idioma en cada llamada para que
// reaccione al cambio de idioma sin recargar el módulo.
const L = (es, en) => (getLang() === 'en' ? en : es);

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

  // Los bloques de contenido se construyen dentro del componente para que
  // L() lea el idioma actual en cada render (no al cargar el módulo).
  const STEPS = [
    {
      n: '1',
      title: L('Subasta · 3 fases', 'Auction · 3 phases'),
      body: (
        <>
          {L(<>Una fase por tipo de héroe: <Em img={CC_EMB} /> <b>cuerpo a cuerpo (CC)</b>, <Em img={AD_EMB} /> <b>distancia (AD)</b> y <Em img={HE_EMB} /> <b>magia (HE)</b>. En cada fase salen <b>6 héroes, uno por raza</b> (cada raza con su color y símbolo). Elige uno, escribe tu puja con <b>− / +</b> y pulsa <b>Pujar</b>: la puja es <b>sellada</b> (a ciegas) y gana quien ofrezca más. Si los dos pujáis por el <b>mismo héroe</b>, se abre una nueva tanda de pujas. Cada ronda trae un <b>bonificador único</b> (no se repite en la partida): más monedas, ventajas… o un castigo al rival.</>, <>One phase per hero type: <Em img={CC_EMB} /> <b>melee (CC)</b>, <Em img={AD_EMB} /> <b>ranged (AD)</b> and <Em img={HE_EMB} /> <b>magic (HE)</b>. Each phase brings <b>6 heroes, one per race</b> (each race with its own color and symbol). Pick one, enter your bid with <b>− / +</b> and press <b>Bid</b>: the bid is <b>sealed</b> (blind) and the highest offer wins. If both of you bid for the <b>same hero</b>, a new bidding round opens. Each round brings a <b>unique booster</b> (never repeats in the match): more coins, perks… or a penalty for your rival.</>)}
        </>
      ),
    },
    {
      n: '2',
      title: L('Equipamiento', 'Equipment'),
      body: (
        <>
          {L(<>Con tu presupuesto equipas a cada héroe con <b>1 arma</b> (cuerpo a cuerpo <i>o</i> distancia) y <b>1 armadura</b>: verás cómo cambian sus stats al momento. Los <b>hechizos</b> (carta única, gastan maná) y los <b>objetos</b> (hasta 3 copias) van a tu <b>mano</b> para usarlos en batalla. Puedes quitar una carta comprada (×) y recuperar sus monedas.</>, <>With your budget you equip each hero with <b>1 weapon</b> (melee <i>or</i> ranged) and <b>1 armor</b>: you'll see their stats change instantly. <b>Spells</b> (a single card, spend mana) and <b>items</b> (up to 3 copies) go to your <b>hand</b> to use in battle. You can remove a bought card (×) and recover its coins.</>)}
        </>
      ),
    },
    {
      n: '3',
      title: L('Combate por rondas', 'Round-based combat'),
      body: (
        <>
          {L(<>Orden de turnos: <b>distancia → hechizos → cuerpo a cuerpo</b> (si empatan, va antes quien tenga más velocidad). En cada carta: barra <Swatch c="#7ce287" /> <b style={{ color: '#7ce287' }}>verde = vida</b> y barra <Swatch c="#6ec6ff" /> <b style={{ color: '#6ec6ff' }}>azul = maná</b>.</>, <>Turn order: <b>ranged → spells → melee</b> (on a tie, the one with more speed goes first). On each card: <Swatch c="#7ce287" /> <b style={{ color: '#7ce287' }}>green bar = health</b> and <Swatch c="#6ec6ff" /> <b style={{ color: '#6ec6ff' }}>blue bar = mana</b>.</>)}
        </>
      ),
    },
  ];

  const COINS = [
    { icon: '🪙', title: L('Monedas', 'Coins'), text: L('Empiezas con 100 de subasta y 100 de equipamiento. Si te quedas corto pujando, puedes transferir monedas del equipamiento a la subasta de 10 en 10. Al acabar toda la subasta, las monedas de subasta que te sobren se suman a tu presupuesto de equipamiento, junto con los bonificadores positivos de equipamiento que te hayan salido durante la subasta.', 'You start with 100 for the auction and 100 for equipment. If you run short while bidding, you can transfer coins from equipment to the auction 10 at a time. Once the whole auction ends, your leftover auction coins are added to your equipment budget, along with any positive equipment boosters that came up during the auction.') },
    { icon: '✦', title: L('Cartas Épicas', 'Epic Cards'), text: L('Las más poderosas: cuestan +20 monedas. No salen normalmente; ciertos bonificadores hacen que tú (o tu rival) recibáis una oferta Épica extra.', 'The most powerful: they cost +20 coins. They don\'t normally appear; certain boosters make you (or your rival) receive an extra Epic offer.') },
    { icon: '🏦', title: L('¿Sin monedas de subasta?', 'Out of auction coins?'), text: L('Si te quedas sin monedas para pujar, pulsa Transferir monedas de equipamiento: pasas monedas de tu bolsa de equipamiento a la de subasta (de 10 en 10) y sigues pujando. Sin deudas — lo que transfieras sale de tu presupuesto de equipamiento, así que gástalo con cabeza.', 'If you run out of coins to bid, press Transfer equipment coins: you move coins from your equipment purse to the auction one (10 at a time) and keep bidding. No debt — what you transfer comes out of your equipment budget, so spend it wisely.') },
  ];

  const ACTIONS = [
    { img: ACT_MELEE, title: L('Cuerpo a cuerpo', 'Melee'), text: L('Golpe melé: daño = tu CC + arma.', 'Melee strike: damage = your CC + weapon.') },
    { img: ACT_SHOT, title: L('Disparo', 'Shoot'), text: L('Necesita arma a distancia; daño por potencia × tu AD.', 'Needs a ranged weapon; damage = power × your AD.') },
    { img: ACT_SPELL, title: L('Hechizo', 'Spell'), text: L('Usa HE y gasta maná 🔵.', 'Uses HE and spends mana 🔵.') },
    { img: HE_EMB, title: L('Habilidad del héroe', "Hero's ability"), text: L('El poder especial propio de ese héroe (cada uno el suyo). Se lee en la franja dorada del panel; en forma Élite mejora.', "That hero's special power (each has its own). Read on the golden strip of the panel; it improves in Elite form."), wide: true },
    { img: ACT_OBJ, title: L('Objeto', 'Item'), text: L('Juega un objeto de tu mano (poción, maná…).', 'Play an item from your hand (potion, mana…).') },
    { img: ACT_DEF, title: L('Defender', 'Defend'), text: L('Te cubres: recibes menos daño este turno.', 'You take cover: take less damage this turn.') },
    { img: ACT_TANK, title: L('Tanquear', 'Tank'), text: L('Atraes los ataques rivales para proteger al equipo.', 'Draw the rival\'s attacks to protect the team.') },
  ];

  const MODES = [
    { icon: '🤖', c: '#9adf9a', title: L('Contra la IA', 'vs AI'), text: L('4 niveles de dificultad: Novato, Berserker, Estratega y Némesis. La IA aprende de cada partida y se vuelve más fuerte. Juega sin conexión y practica estrategias.', '4 difficulty levels: Novice, Berserker, Strategist and Nemesis. The AI learns from each game and gets stronger. Play offline and practice strategies.') },
    { icon: '📱', c: '#6ec6ff', title: L('Local', 'Local'), text: L('2 jugadores en el mismo dispositivo. Cada uno escribe su nick y contraseña. Ideal para partidas rápidas cara a cara.', '2 players on the same device. Each enters their nick and password. Great for quick face-to-face games.') },
    { icon: '🏠', c: '#FFD24A', title: L('Sala privada online', 'Private online room'), text: L('Creas una sala con contraseña y compartes el código con tu rival. Solo quien tenga la contraseña puede unirse. Si alguien se desconecta, la partida se puede reanudar en 5 minutos.', 'You create a room with a password and share the code with your rival. Only those with the password can join. If someone disconnects, the game can be resumed within 5 minutes.') },
    { icon: '🆓', c: '#6aa6ff', title: L('Sala pública online', 'Public online room'), text: L('Sala sin contraseña: cualquiera con el código puede entrar. Si alguien pierde la conexión, la partida termina (sin reanudación).', 'Room without password: anyone with the code can join. If someone loses connection, the game ends (no resume).') },
    { icon: '🃏', c: '#c06bff', title: L('Habitación Bizarra', 'Bizarre Room'), text: L('Entras con tu nick y pulsas el Botón de Pánico: te empareja al azar con otro visitante y arranca una partida. Mínimo 3 jugadores dentro. La partida lleva contraseña interna para reanudación.', 'You join with your nick and hit the Panic Button: it matches you randomly with another visitor and starts a game. Minimum 3 players inside. The game has an internal password for resuming.') },
  ];

  const STATES = [
    { c: '#9b8cff', i: '💤', n: L('Dormido', 'Asleep'), x: L('Pierde su próximo turno.', 'Loses their next turn.') },
    { c: '#ffe14a', i: '⚡', n: L('Paralizado', 'Paralyzed'), x: L('Pierde su próximo turno.', 'Loses their next turn.') },
    { c: '#6ec6ff', i: '❄️', n: L('Congelado', 'Frozen'), x: L('Actúa con velocidad reducida (va más tarde).', 'Acts with reduced speed (goes later).') },
    { c: '#b05cff', i: '☠️', n: L('Maldito', 'Cursed'), x: L('Reducción temporal de sus atributos.', 'Temporary reduction of their attributes.') },
    { c: '#ffd24a', i: '✦', n: L('Bendito', 'Blessed'), x: L('Aumento temporal de sus atributos.', 'Temporary boost of their attributes.') },
    { c: '#7ce287', i: '🛡', n: L('Tanqueando', 'Tanking'), x: L('Intercepta los ataques a sus aliados hasta su próximo turno.', 'Intercepts attacks aimed at allies until their next turn.') },
    { c: '#ff9c40', i: '★', n: L('Confuso', 'Confused'), x: L('2 turnos (3 en Élite): 50% de perder cada acción.', '2 turns (3 in Elite): 50% chance to lose each action.') },
    { c: '#ff7ad9', i: '🍺', n: L('Borracho', 'Drunk'), x: L('Recibe 3 de daño, −3 CC/AD/HE durante 2 turnos (3 en Élite) y 35% de fallar cada acción.', 'Takes 3 damage, −3 CC/AD/HE for 2 turns (3 in Elite) and 35% chance to fail each action.') },
    { c: '#8fe3d9', i: '💫', n: L('Mareado', 'Dizzy'), x: L('−4 CC/AD/HE durante 2 turnos (3 con Gases Tóxicos Élite).', '−4 CC/AD/HE for 2 turns (3 with Toxic Gas Elite).') },
  ];

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
          <img src={ICON_IMG} alt={L('Reglas', 'Rules')} className="w-24 h-24 mx-auto rounded-full border-2 border-[#FFD24A] shadow-[0_0_30px_rgba(255,210,74,.5)] object-cover mb-4" />
          <h1 className="font-heading font-black text-4xl md:text-6xl text-[#FFD24A] drop-shadow-[0_2px_12px_rgba(255,210,74,.35)] tracking-wide">{L('Reglas', 'Rules')}</h1>
          <p className="text-[#cfc6dd] mt-3 text-base max-w-2xl mx-auto">{L('Todo lo que necesitas saber para dominar Bizarre Fantasies', 'Everything you need to know to master Bizarre Fantasies')}</p>
        </div>

        <div className="rounded-2xl bg-[#0c0714]/70 border border-[#ffd24a]/25 p-5 md:p-7 mb-5 shadow-[0_10px_30px_rgba(0,0,0,.5)]">
          <p className="text-lg mb-5">
            <b className="text-[#ffe9a8] inline-flex items-center gap-2"><span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[radial-gradient(circle_at_34%_28%,#fff0ae,#FFD24A_45%,#b77614)] border-2 border-[#7c5410] shadow-[0_0_10px_rgba(255,210,74,.5)]"><Target size={15} className="text-[#4a2e03]" /></span> {L('Objetivo:', 'Objective:')}</b> {L(<>arma un equipo de <b>3 héroes</b>, equípalos bien y derrota a los 3 héroes del rival en un combate por turnos.</>, <>build a team of <b>3 heroes</b>, equip them well and defeat the rival's 3 heroes in a turn-based battle.</>)}
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
          <div className="text-center text-xs text-[#b8aacb] italic mb-5">{L('Así se ve el panel del héroe activo en batalla. Cada acción gasta el turno.', "This is the active hero's panel in battle. Each action spends the turn.")}</div>

          <div className="space-y-2.5 mb-5 text-sm leading-relaxed">
            <p><b className="text-[#ffe9a8]">⚡ {L('Maná', 'Mana')}:</b> {L('es una reserva fija para toda la batalla que no se regenera. Recupéralo con el Cristal o el Orbe de Maná.', "it's a fixed reserve for the whole battle that doesn't regenerate. Recover it with a Mana Crystal or Orb.")}</p>
            <p><b className="text-[#ffe9a8]">🛡️ {L('Armaduras', 'Armors')}:</b> {L('reducen el daño de golpes, disparos y hechizos. Las elementales anulan por completo su elemento contrario (agua↔fuego, rayo↔agua, hielo↔rayo, fuego↔hielo). La Barrera Arcana protege del daño mágico.', "reduce damage from strikes, shots and spells. Elemental ones fully negate their opposing element (water↔fire, lightning↔water, ice↔lightning, fire↔ice). The Arcane Barrier protects from magic damage.")}</p>
            <p><b style={{ color: '#ffaa00' }}>⭐ {L('Forma Élite', 'Elite Form')}:</b> {L('cuando un héroe cae por primera vez, renace en Élite con parte de su vida y stats mejorados según su raza. Al revivir renace limpio: sin estados negativos y sin arma ni armadura (van a la pila de descartes). Si vuelve a caer, muere de verdad — salvo Pluma Fénix o Ave Fénix.', 'when a hero falls for the first time, it is reborn in Elite with part of its health and improved stats based on its race. On reviving it comes back clean: no negative states and no weapon or armor (they go to the discard pile). If it falls again, it truly dies — unless Phoenix Feather or Phoenix Bird.')}</p>
            <p><b style={{ color: '#ffd24a' }}>🔑 {L('Regla de oro de habilidades', 'Golden rule of abilities')}:</b> {L('cada héroe puede usar su habilidad normal y su habilidad élite una sola vez por batalla (se cuentan por separado). Una vez jugada, no se puede volver a usar en esa batalla, ni siquiera tras revivir.', 'each hero can use its normal ability and its elite ability once per battle (counted separately). Once played, it can\'t be used again in that battle, even after reviving.')}</p>
            <p><b style={{ color: '#a06bff' }}>♻️ {L('Pila de descartes', 'Discard pile')}:</b> {L('cuando un héroe cae, su arma y armadura van a tu pila de descartes; los objetos consumidos también. Con Reanimación Arcana recuperas una carta aleatoria de la pila: los objetos vuelven a ser jugables y las armas/armaduras se equipan gratis al jugarlas desde la mano.', 'when a hero falls, its weapon and armor go to your discard pile; consumed items do too. With Arcane Reanimation you recover a random card from the pile: items become playable again and weapons/armor equip for free when played from the hand.')}</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border border-[#ffd24a]/35 p-5 mb-5">
            <div className="font-heading font-black text-[#ffd24a] text-lg mb-3">⚡ {L('Velocidad y orden de turnos', 'Speed and turn order')}</div>
            <div className="space-y-2.5 text-base leading-relaxed">
              <p><b className="text-[#ffe9a8]">{L('Cada ronda:', 'Each round:')}</b> {L('los héroes que puedan actuar lo hacen por tipo de acción — primero los de distancia (AD), luego los hechizos y por último los de cuerpo a cuerpo (CC): el arquero dispara antes de que llegue el melé.', 'heroes that can act do so by action type — first ranged (AD), then spells and lastly melee (CC): the archer shoots before the melee reaches them.')}</p>
              <p><b className="text-[#ffe9a8]">{L('Desempate por velocidad:', 'Speed tiebreak:')}</b> {L('dentro del mismo tipo, actúa antes el héroe con más velocidad. Cada héroe parte de una velocidad base según su raza, y algunas armas y armaduras la aumentan: tu equipo sí puede cambiar cuándo te toca actuar.', 'within the same type, the hero with more speed acts first. Each hero starts from a base speed based on its race, and some weapons and armor increase it: your team can change when it gets to act.')}</p>
              <p><b className="text-[#ffe9a8]">⚡ {L('Marcador de velocidad:', 'Speed marker:')}</b> {L(<>cada héroe lleva <b className="text-[#fff5dc]">⚡ + un número</b> con su velocidad base, arriba en la carta. Los más veloces (≥21) brillan en</>, <>each hero carries <b className="text-[#fff5dc]">⚡ + a number</b> with its base speed, at the top of the card. The fastest (≥21) glow in</>)} <Swatch c="#FFD24A" /> <b style={{ color: '#FFD24A' }}>{L('dorado con el sello RÁPIDO', 'gold with the RÁPIDO badge')}</b>{L(': de un vistazo ves quién vuela al ficharlo y al ordenar los turnos.', ': at a glance you see who flies when drafting and when ordering turns.')}</p>
              <p><b className="text-[#ffe9a8]">{L('Estados que sí mueven tu turno:', 'States that do move your turn:')}</b> {L('Congelado actúa con velocidad reducida (va más tarde); Dormido y Paralizado pierden su próximo turno. El resto de estados cambian tus stats o tu daño, no cuándo te toca actuar.', 'Frozen acts with reduced speed (goes later); Asleep and Paralyzed lose their next turn. The rest of states change your stats or your damage, not when you act.')}</p>
              <p><b className="text-[#ffe9a8]">{L('¿Y en la subasta?', 'And in the auction?')}</b> {L(<>el tipo de héroe (CC/AD/HE) ya marca su banda de turno y lo ves al elegir. Cada héroe lleva arriba el marcador <b className="text-[#fff5dc]">⚡ + su velocidad</b>; los más veloces (≥21) brillan en</>, <>the hero type (CC/AD/HE) already marks its turn band and you see it when picking. Each hero carries at the top the marker <b className="text-[#fff5dc]">⚡ + its speed</b>; the fastest (≥21) glow in</>)} <Swatch c="#FFD24A" /> <b style={{ color: '#FFD24A' }}>{L('dorado con RÁPIDO', 'gold with RÁPIDO')}</b>{L('. Así sabes de un vistazo quién es más rápido al planear tu equipo; al equiparlo, algunas armas y armaduras lo suben.', ". So at a glance you know who's faster when planning your team; on equipping, some weapons and armor raise it.")}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border border-[#ffd24a]/35 p-5 mb-5">
            <div className="font-heading font-black text-[#ffd24a] text-lg mb-3">☠️ {L('Muerte y reanimación de héroes', 'Hero death and reanimation')}</div>
            <div className="space-y-2.5 text-base leading-relaxed">
              <p><b className="text-[#ff7a6a]">{L('Caer a 0 de vida:', 'Reaching 0 health:')}</b> {L('el héroe queda fuera de combate. Su arma y su armadura se van a tu pila de descartes, igual que los objetos que hubiera consumido.', 'the hero is out of combat. Its weapon and armor go to your discard pile, just like any items it had consumed.')}</p>
              <p><b style={{ color: '#ffaa00' }}>{L('Primera caída → renace en Élite:', 'First fall → reborn in Elite:')}</b> {L('vuelve con parte de su vida y stats mejorados según su raza. Renace limpio: sin estados negativos y sin arma ni armadura (están en la pila de descartes).', 'it returns with part of its health and improved stats based on its race. It comes back clean: no negative states and no weapon or armor (they\'re in the discard pile).')}</p>
              <p><b className="text-[#ff5252]">{L('Segunda caída → muerte definitiva:', 'Second fall → permanent death:')}</b> {L('el héroe queda eliminado permanentemente de la batalla… salvo que jugues Pluma Fénix o Ave Fénix, que lo traen de vuelta una vez más.', 'the hero is permanently removed from the battle… unless you play Phoenix Feather or Phoenix Bird, which bring it back once more.')}</p>
              <p><b style={{ color: '#a06bff' }}>♻️ {L('Reanimación Arcana', 'Arcane Reanimation')}:</b> {L('recuperas una carta aleatoria de tu pila de descartes: los objetos vuelven a ser jugables y las armas/armaduras se equipan gratis al jugarlas desde la mano.', 'you recover a random card from your discard pile: items become playable again and weapons/armor equip for free when played from the hand.')}</p>
              <p><b style={{ color: '#ffd24a' }}>🔑 {L('Habilidades:', 'Abilities:')}</b> {L('cada héroe puede usar su habilidad normal y su habilidad élite una sola vez por batalla (se cuentan por separado). Al revivir no recupera una habilidad ya gastada.', "each hero can use its normal ability and its elite ability once per battle (counted separately). On reviving it doesn't recover an already-spent ability.")}</p>
            </div>
          </div>

          <FumbleRulesSection />

          <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border border-[#ffd24a]/35 p-5 mb-5">
            <div className="font-heading font-black text-[#ffd24a] text-lg mb-3">🎮 {L('Modos de juego', 'Game modes')}</div>
            <p className="text-[#d8d0e4] text-base leading-relaxed mb-4">{L('Bizarre Fantasies se puede jugar de varias maneras. Elige la que mejor se adapte a lo que buscas:', 'Bizarre Fantasies can be played in several ways. Choose the one that best fits what you\'re looking for:')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODES.map((m) => (
                <div key={m.title} className="flex items-start gap-3 bg-gradient-to-b from-[#140a23]/85 to-[#0a050f]/95 rounded-xl p-4 border" style={{ borderColor: m.c + '88', boxShadow: `inset 0 0 18px -10px ${m.c}` }}>
                  <span className="shrink-0 w-10 h-10 rounded-lg border-2 border-white/15 flex items-center justify-center text-xl" style={{ background: m.c, boxShadow: `0 0 14px ${m.c}cc` }} aria-hidden="true">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-base tracking-wide mb-1" style={{ color: m.c }}>{m.title}</div>
                    <div className="text-[#e6dff2] text-sm leading-snug">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border-2 border-[#c06bff]/45 p-5 mb-5 shadow-[0_0_24px_rgba(192,91,255,.12)]">
            <div className="font-heading font-black text-[#e2b0ff] text-lg mb-3">🃏 {L('Habitación Bizarra', 'Bizarre Room')}</div>
            <p className="text-[#d8d0e4] text-base leading-relaxed mb-4">{L('La Habitación Bizarra es un lobby público donde entras con tu nick y contraseña, ves quién hay dentro y puedes pulsar el Botón de Pánico para una partida al azar contra otro visitante.', 'The Bizarre Room is a public lobby where you join with your nick and password, see who is inside and can hit the Panic Button for a random match against another visitor.')}</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-gradient-to-b from-[#1a0d2e]/85 to-[#0a0518]/95 rounded-xl p-3.5 border border-[#c06bff]/35">
                <span className="shrink-0 w-10 h-10 rounded-lg border-2 border-[#c06bff]/50 flex items-center justify-center text-xl" style={{ background: '#c06bff', boxShadow: '0 0 14px #c06bffcc' }}>🚪</span>
                <div className="flex-1">
                  <div className="font-black text-base tracking-wide mb-1" style={{ color: '#e2b0ff' }}>{L('Entrar', 'Enter')}</div>
                  <div className="text-[#e6dff2] text-sm leading-snug">{L('Entras con tu nick y contraseña. Verás el listado de visitantes con su avatar y victorias totales. Máximo 20 visitantes a la vez.', 'You join with your nick and password. You\'ll see the visitor list with their avatar and total wins. Maximum 20 visitors at once.')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gradient-to-b from-[#1a0d2e]/85 to-[#0a0518]/95 rounded-xl p-3.5 border border-[#ff2a5a]/45">
                <span className="shrink-0 w-10 h-10 rounded-lg border-2 border-[#ff2a5a]/50 flex items-center justify-center text-xl" style={{ background: '#ff2a5a', boxShadow: '0 0 14px #ff2a5acc' }}>🚨</span>
                <div className="flex-1">
                  <div className="font-black text-base tracking-wide mb-1" style={{ color: '#ff7a9a' }}>{L('Botón de Pánico', 'Panic Button')}</div>
                  <div className="text-[#e6dff2] text-sm leading-snug">{L('Necesita mínimo 3 visitantes para activarse. Al pulsarlo aparece una Ruleta de la Suerte que gira entre todos los visitantes y se detiene en tu rival: la partida arranca sola.', 'Needs at least 3 visitors to activate. When pressed, a Wheel of Fortune spins among all visitors and stops on your rival: the game starts automatically.')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gradient-to-b from-[#1a0d2e]/85 to-[#0a0518]/95 rounded-xl p-3.5 border border-[#c06bff]/35">
                <span className="shrink-0 w-10 h-10 rounded-lg border-2 border-[#c06bff]/50 flex items-center justify-center text-xl" style={{ background: '#9d5df0', boxShadow: '0 0 14px #9d5df0cc' }}>🔄</span>
                <div className="flex-1">
                  <div className="font-black text-base tracking-wide mb-1" style={{ color: '#e2b0ff' }}>{L('Reanudación y regreso', 'Resuming and return')}</div>
                  <div className="text-[#e6dff2] text-sm leading-snug">{L('La partida lleva contraseña interna para reanudar si se cae la conexión. Al terminar, un botón te devuelve a la Habitación Bizarra sin pasar por el menú.', 'The game has an internal password to resume if the connection drops. When finished, a button takes you back to the Bizarre Room without going through the menu.')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gradient-to-b from-[#1a0d2e]/85 to-[#0a0518]/95 rounded-xl p-3.5 border border-[#ffd24a]/35">
                <span className="shrink-0 w-10 h-10 rounded-lg border-2 border-[#ffd24a]/50 flex items-center justify-center text-xl" style={{ background: '#FFD24A', boxShadow: '0 0 14px #FFD24Acc' }}>💬</span>
                <div className="flex-1">
                  <div className="font-black text-base tracking-wide mb-1" style={{ color: '#FFD24A' }}>{L('Chat de sala', 'Room chat')}</div>
                  <div className="text-[#e6dff2] text-sm leading-snug">{L('Durante las partidas multijugador puedes abrir el chat desde el icono del borde derecho. Mensajes en tiempo real y emojis de héroes. Los insultos y contenido inapropiado se bloquean automáticamente.', 'During multiplayer games you can open the chat from the right edge icon. Real-time messages and hero emojis. Insults and inappropriate content are blocked automatically.')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border border-[#ffd24a]/35 p-5">
            <div className="font-heading font-black text-[#ffd24a] text-lg mb-3">✨ {L('Estados de combate', 'Combat states')}</div>
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