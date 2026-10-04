// Textos de las cartas del oráculo: limpieza y tamaño ajustado a su longitud.
// - Las exportaciones y hojas de cálculo anteponen un apóstrofo a los textos que empiezan por + - = @ ("'+9 CC"):
//   se quita al mostrar.
// - El texto de la habilidad cambia de tamaño según lo largo que sea: los cortos se leen grandes y los largos
//   (Monkgeta, Doji Conpuri, Motomami élite...) se compactan para no agrandar el recuadro y tapar el arte.
export const cleanCardText = (s) => String(s == null ? '' : s).replace(/^'(?=[+\-=@])/, '').trim();

export function abilityTextClass(text) {
  const n = cleanCardText(text).length;
  if (n > 150) return 'text-[8px] sm:text-[9px] leading-[1.18]';
  if (n > 110) return 'text-[8.5px] sm:text-[9.5px] leading-tight';
  if (n > 70) return 'text-[9px] sm:text-[10px] leading-snug';
  return 'text-[9.5px] sm:text-[11px] leading-snug';
}

export function equipTextClass(text, fill) {
  const n = cleanCardText(text).length;
  if (fill) return n > 100 ? 'text-[12px] leading-snug' : 'text-[14px] leading-snug';
  return n > 100 ? 'text-[9.5px] leading-tight' : n > 70 ? 'text-[10px] leading-snug' : 'text-[11px] leading-snug';
}
