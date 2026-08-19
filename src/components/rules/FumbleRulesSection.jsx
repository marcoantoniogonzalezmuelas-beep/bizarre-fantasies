import React from 'react';
import { getLang } from '@/lib/i18n';

const L = (es, en) => (getLang() === 'en' ? en : es);

// Bloque de reglas de la tirada global de d30 (Pifia / Fallo Épico).
export default function FumbleRulesSection() {
  const ROWS = [
    { c: '#7ce287', i: '🎲', n: L('2-18 y 21-30', '2-18 and 21-30'), x: L('La acción se resuelve con normalidad.', 'The action resolves normally.') },
    { c: '#ff86d2', i: '💥', n: L('19 o 20 · PIFIA (≈7%)', '19 or 20 · FUMBLE (≈7%)'), x: L('La acción falla y no produce ningún efecto. El turno se gasta igual.', 'The action fails and has no effect. The turn is spent anyway.') },
    { c: '#ff5fc0', i: '💀', n: L('1 + 1 en d6 · FALLO ÉPICO (≈0,5%)', '1 + 1 on a d6 · EPIC FAIL (≈0.5%)'), x: L('Un 1 en el d30 se confirma con un d6: si sale 1, la acción falla y el efecto se vuelve contra su autor (daño real ≈60% de su stat principal). Si el d6 no lo confirma, queda en pifia normal.', 'A 1 on the d30 is confirmed with a d6: on a 1, the action fails and the effect backfires on its owner (true damage ≈60% of their main stat). If the d6 does not confirm it, it stays a normal fumble.') },
  ];

  const NOTES = [
    L('Solo se tira UN dado por acción, aunque la acción pase por varios pasos (elegir objetivo, habilidad que luego golpea…).', 'Only ONE die is rolled per action, even if the action goes through several steps (choosing a target, an ability that then strikes…).'),
    L('Habilidades permanentes (Juniana, KillerDucks, Daidoji, Batu élite, Edredon): solo tiran al activarse, nunca hay fallo épico y, si pifian, la habilidad queda gastada sin efecto.', 'Permanent abilities (Juniana, KillerDucks, Daidoji, elite Batu, Edredon): they only roll on activation, never suffer an epic fail and, on a fumble, the ability is spent with no effect.'),
    L('Invocaciones: con pifia no aparece nada; con fallo épico las criaturas invocadas se pasan al ejército rival.', 'Summons: on a fumble nothing appears; on an epic fail the summoned creatures switch to the rival army.'),
    L('Cada tirada se anota en el registro de batalla, y en las partidas online la resuelve el anfitrión y se sincroniza: los dos jugadores ven el mismo resultado.', 'Every roll is written in the battle log, and in online games the host resolves it and it is synced: both players see the same result.'),
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#2a0e26]/80 to-[#0c0714]/90 border-2 border-[#ff86d2]/45 p-5 mb-5 shadow-[0_0_24px_rgba(255,134,210,.12)]">
      <div className="font-heading font-black text-[#ff9ddd] text-lg mb-3">🎲 {L('Tirada de d30 · Pifia y Fallo Épico', 'd30 roll · Fumble and Epic Fail')}</div>
      <p className="text-[#d8d0e4] text-base leading-relaxed mb-4">
        {L('Antes de resolver cualquier acción (golpe cuerpo a cuerpo, disparo, hechizo, objeto o habilidad) se tira un d30. Nada es seguro en Bizarre Fantasies: incluso el golpe más letal puede irse al vacío.', 'Before resolving any action (melee strike, shot, spell, item or ability) a d30 is rolled. Nothing is certain in Bizarre Fantasies: even the deadliest blow can miss into the void.')}
      </p>
      <div className="space-y-2.5 mb-4">
        {ROWS.map((r) => (
          <div key={r.n} className="flex items-start gap-3 bg-gradient-to-b from-[#1a0a18]/85 to-[#0a050f]/95 rounded-xl p-3.5 border" style={{ borderColor: r.c + '88', boxShadow: `inset 0 0 18px -10px ${r.c}` }}>
            <span className="shrink-0 w-10 h-10 rounded-lg border-2 border-white/15 flex items-center justify-center text-xl" style={{ background: r.c, boxShadow: `0 0 14px ${r.c}cc` }} aria-hidden="true">{r.i}</span>
            <div className="flex-1 min-w-0">
              <div className="font-black text-base tracking-wide mb-1" style={{ color: r.c }}>{r.n}</div>
              <div className="text-[#e6dff2] text-sm leading-snug">{r.x}</div>
            </div>
          </div>
        ))}
      </div>
      <ul className="space-y-1.5 text-sm leading-relaxed text-[#d8d0e4] list-disc pl-5">
        {NOTES.map((n) => <li key={n}>{n}</li>)}
      </ul>
    </div>
  );
}