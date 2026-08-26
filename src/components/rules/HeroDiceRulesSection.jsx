import React from 'react';
import { getLang } from '@/lib/i18n';

const L = (es, en) => (getLang() === 'en' ? en : es);

// Tiradas de dado DE HÉROE (habilidades) y qué significa un golpe CRÍTICO.
// No confundir con la tirada de d30 de pifia/fallo épico, que se explica en
// FumbleRulesSection.
export default function HeroDiceRulesSection() {
  const rows = [
    {
      c: '#ffd24a',
      i: '🎲',
      n: L('Tirada de habilidad (d20)', 'Ability roll (d20)'),
      x: L('Algunas habilidades tiran su propio dado además del d30 de pifia. El Rolero («Tirada Crítica») lanza un d20 y su conjuro multiplica su HE según el resultado: de ×0,9 con un 1 hasta ×2 con un 20. El número que sale queda escrito en el registro de batalla y se muestra en la cinemática 3D de la habilidad.', 'Some abilities roll their own die on top of the d30 fumble roll. El Rolero ("Critical Roll") rolls a d20 and its spell multiplies its HE based on the result: from ×0.9 on a 1 up to ×2 on a 20. The number rolled is written in the battle log and shown in the ability\'s 3D cinematic.'),
    },
    {
      c: '#ff5252',
      i: '💥',
      n: L('¿Qué es un CRÍTICO?', 'What is a CRITICAL?'),
      x: L('Un crítico no es un porcentaje que pueda salir en cualquier ataque: solo lo producen cartas concretas y significa daño con potencia máxima que además ATRAVIESA LA DEFENSA (ignora escudo y/o armadura del objetivo).', 'A critical is not a chance that can happen on any attack: only specific cards produce it, and it means maximum-power damage that also PIERCES DEFENSE (ignores the target\'s shield and/or armor).'),
    },
    {
      c: '#c9b6ff',
      i: '🎯',
      n: L('El Rolero — «Dado Cargado» (Élite)', 'El Rolero — "Loaded Die" (Elite)'),
      x: L('En forma Élite el dado sale siempre 20: multiplicador máximo, +6 de daño y el conjuro atraviesa la defensa. Por eso el registro escribe «¡CRÍTICO!».', 'In Elite form the die always rolls 20: maximum multiplier, +6 damage and the spell pierces defense. That is why the log writes "CRITICAL!".'),
    },
    {
      c: '#8fe6ff',
      i: '🔫',
      n: L('Otros críticos de carta', 'Other card criticals'),
      x: L('El Gamer (Headshot / Aimbot) y Dixie Plasma disparan «críticos» que ignoran la armadura o todo el equipo del rival; la versión Élite de Dixie golpea directamente al 50% de la vida del objetivo.', 'El Gamer (Headshot / Aimbot) and Dixie Plasma fire "criticals" that ignore armor or the rival\'s whole gear; Dixie\'s Elite version hits directly for 50% of the target\'s health.'),
    },
    {
      c: '#7ce287',
      i: '📜',
      n: L('Todo queda en el registro', 'Everything is logged'),
      x: L('Cada tirada de héroe se anota aparte de la tirada de pifia: se indica el dado usado, el número obtenido, el multiplicador resultante y si el golpe fue crítico y atravesó la defensa. En partidas online la resuelve el anfitrión, así que los dos jugadores ven el mismo resultado.', 'Each hero roll is logged separately from the fumble roll: it states the die used, the number rolled, the resulting multiplier and whether the hit was critical and pierced defense. In online games the host resolves it, so both players see the same result.'),
    },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border-2 border-[#ff5252]/40 p-5 mb-5 shadow-[0_0_24px_rgba(255,82,82,.12)]">
      <div className="font-heading font-black text-[#ffb0b0] text-lg mb-3">🎲 {L('Tiradas de dado del héroe y golpes CRÍTICOS', 'Hero dice rolls and CRITICAL hits')}</div>
      <p className="text-[#d8d0e4] text-base leading-relaxed mb-4">
        {L('Aparte de la tirada de d30 de pifia y fallo épico (que se aplica a todas las acciones), algunos héroes tiran su propio dado dentro de su habilidad. Es lo que puede convertir un golpe en CRÍTICO.', 'Apart from the d30 fumble / epic fail roll (which applies to every action), some heroes roll their own die inside their ability. That is what can turn a hit into a CRITICAL.')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {rows.map((s) => (
          <div key={s.n} className="flex items-start gap-3 bg-gradient-to-b from-[#140a23]/85 to-[#0a050f]/95 rounded-xl p-3.5 border" style={{ borderColor: s.c + '88', boxShadow: `inset 0 0 18px -10px ${s.c}` }}>
            <span className="shrink-0 w-10 h-10 rounded-lg border-2 border-white/15 flex items-center justify-center text-xl" style={{ background: s.c, boxShadow: `0 0 14px ${s.c}cc` }} aria-hidden="true">{s.i}</span>
            <div className="flex-1 min-w-0">
              <div className="font-black text-base tracking-wide mb-1" style={{ color: s.c }}>{s.n}</div>
              <div className="text-[#e6dff2] text-sm leading-snug">{s.x}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}