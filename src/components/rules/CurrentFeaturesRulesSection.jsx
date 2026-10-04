import React from 'react';
import { getLang } from '@/lib/i18n';
const L = (es, en) => (getLang() === 'en' ? en : es);
const blocks = () => [
  { icon: '🏛️', title: L('Misiones: Club, Leyendas y Todos los Héroes', 'Missions: Club, Legends and All Heroes'), text: L('Campañas individuales de 5 niveles sin subasta. Compras tres héroes con presupuesto o abres un sobre aleatorio, siempre con 150 monedas de equipamiento. Las victorias se guardan por nick, desbloquean el siguiente nivel y cada final concede una celebración bizarra. También se juegan contra otro jugador, con sobre o con 100 monedas.', 'Five-level solo campaigns without an auction. Buy three heroes with a budget or open a random pack, always with 150 equipment coins. Wins are saved by nick, unlock the next level and every finale has a bizarre celebration. They can also be played against another player, with packs or with 100 coins.') },
  { icon: '🦆', title: L('Bizarros e invocaciones', 'Bizarros and summons'), text: L('Los Bizarros son héroes sorpresa completos. Las invocaciones —Patitos de Goma, Grulla, Unicornio Kamikaze y Pegaso— también combaten como héroes y usan sus habilidades implementadas. Si la invocación sufre un Fallo Épico, aparece en el ejército rival.', 'Bizarros are complete surprise heroes. Summons —Rubber Ducklings, Crane, Kamikaze Unicorn and Pegasus— also fight as heroes and use their implemented abilities. If summoning suffers an Epic Fail, the unit appears in the rival army.') },
  { icon: '🔗', title: L('Sinergias actuales', 'Current synergies'), text: L('Marca + ataques múltiples o de área; tanque + escudo + curación; penalizadores + ejecución; velocidad de equipo para alterar el orden; críticos y perforación contra armaduras; recuperación de maná para equipos mágicos; Reanimación Arcana para reutilizar equipo y objetos; invocaciones para sumar presión y objetivos.', 'Mark + multi-hit or area attacks; tank + shield + healing; penalties + execution; gear speed to alter turn order; criticals and piercing against armor; mana recovery for magic teams; Arcane Reanimation to reuse gear and items; summons to add pressure and targets.') },
];
export default function CurrentFeaturesRulesSection() {
  return <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border-2 border-[#ffd24a]/40 p-5 mb-5">
    <div className="font-heading font-black text-[#ffd24a] text-lg mb-3">📚 {L('Reglas y sistemas actuales', 'Current rules and systems')}</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">{blocks().map(b => <article key={b.title} className="rounded-xl border border-[#ffd24a]/25 bg-[#0a050f]/85 p-4">
      <h3 className="font-black text-[#ffe9a8] mb-2">{b.icon} {b.title}</h3><p className="text-sm leading-relaxed text-[#e6dff2]">{b.text}</p>
    </article>)}</div>
  </div>;
}