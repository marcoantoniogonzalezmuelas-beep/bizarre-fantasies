// Posición y escala del icono del chat respecto al botón de animaciones del juego
// (#bf-cine-toggle, dentro del iframe). Función pura para poder testearla.
//
// - Se coloca a la DERECHA del botón con un margen proporcional a la escala (antes 8 px fijos:
//   en el móvil, con el juego encogido, el icono invadía el botón y se solapaban).
// - Su escala es la del juego (ancho del iframe en pantalla / ancho interno), así que se
//   encoge y crece igual que el resto de elementos. Antes iba siempre a tamaño real.
export const CHAT_ICON_NATURAL_HEIGHT = 28;
export const CHAT_ICON_GAP = 16;       // px a escala 1
export const CHAT_ICON_MIN_SCALE = 0.45;
export const CHAT_ICON_MAX_SCALE = 1.4;

export function chatIconAnchor(m) {
  const fallback = { left: 10, top: 10, height: CHAT_ICON_NATURAL_HEIGHT, scale: 1 };
  if (!m || !m.frameRect || !m.btnRect) return fallback;
  const { frameRect: fr, btnRect: r } = m;
  let k = fr.width && m.innerWidth ? fr.width / m.innerWidth : 1;
  if (!Number.isFinite(k) || k <= 0) k = 1;
  const scale = Math.min(CHAT_ICON_MAX_SCALE, Math.max(CHAT_ICON_MIN_SCALE, k));
  const btnH = Math.max(1, r.height * k);
  return {
    left: Math.round(fr.left + r.right * k + CHAT_ICON_GAP * scale),
    // Centrado verticalmente con el botón de animaciones.
    top: Math.round(fr.top + r.top * k + (btnH - CHAT_ICON_NATURAL_HEIGHT * scale) / 2),
    height: CHAT_ICON_NATURAL_HEIGHT,
    scale: Math.round(scale * 100) / 100,
  };
}
