import React from 'react';
import { getLang } from '@/lib/i18n';

const L = (es, en) => (getLang() === 'en' ? en : es);

// Reglas: manos desplegables en móvil y tablet (interfaz de batalla).
export default function MobileHandRulesSection() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1c102e]/80 to-[#0c0714]/90 border border-[#6ec6ff]/40 p-5 mb-5">
      <div className="font-heading font-black text-[#9bd8ff] text-lg mb-3">📱 {L('Manos desplegables en móvil y tablet', 'Collapsible hands on mobile and tablet')}</div>
      <div className="space-y-2.5 text-base leading-relaxed text-[#e6dff2]">
        <p>{L('En móvil y tablet, TU MANO y la MANO DEL RIVAL aparecen recogidas bajo el panel de acciones para dejar el campo de batalla despejado. Cada una lleva su chapa de título: dorada la tuya, azul la del rival.', 'On mobile and tablet, YOUR HAND and the RIVAL HAND appear collapsed under the action panel to keep the battlefield clear. Each one has its title plate: gold for yours, blue for the rival.')}</p>
        <p>{L('Para verlas, pulsa el botón redondeado ▼ Ver cartas de su chapa (indica cuántas cartas hay). Mientras está recogida, el botón parpadea para avisar de que se puede desplegar; con ▲ Recoger cartas vuelve a cerrarse.', 'To see them, press the rounded ▼ See cards button on its plate (it shows how many cards there are). While collapsed, the button pulses to signal it can be opened; ▲ Collapse cards closes it again.')}</p>
        <p>{L('El estado de cada mano se recuerda durante la partida, así que puedes dejar tu mano abierta y la del rival cerrada. En PC las manos se muestran siempre abiertas.', 'The state of each hand is remembered during the match, so you can leave your hand open and the rival one closed. On PC hands are always shown open.')}</p>
      </div>
    </div>
  );
}