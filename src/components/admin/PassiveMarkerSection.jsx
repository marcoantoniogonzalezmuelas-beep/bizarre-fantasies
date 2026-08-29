import React from 'react';
import PassiveMarkerVariant from './PassiveMarkerVariant';

// Sección del editor para los marcadores de habilidad pasiva. Un héroe puede
// tener un marcador para la habilidad NORMAL y otro distinto para la ÉLITE
// (cada uno con su flag, rótulo, color, duración e icono). El rótulo se
// muestra siempre sobre el héroe en batalla mientras la pasiva esté activa.
export default function PassiveMarkerSection({ form, onChange }) {
  if (!['hero', 'bizarro'].includes(form.category)) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <PassiveMarkerVariant variant="normal" value={form.passive_marker} onChange={(val) => onChange('passive_marker', val)} card={form} />
      <PassiveMarkerVariant variant="elite" value={form.passive_marker_elite} onChange={(val) => onChange('passive_marker_elite', val)} card={form} />
    </div>
  );
}