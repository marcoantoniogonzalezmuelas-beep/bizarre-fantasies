// Posición y escala del icono del chat respecto al botón de animaciones del juego
// (#bf-cine-toggle, dentro del iframe). Función pura para poder testearla.
//
// Reglas (lo que pidió el jugador tras probar en móvil):
//   - SIEMPRE a la derecha del botón de animaciones, sin tocarlo (margen proporcional a la escala);
//   - del MISMO tamaño que ese botón (misma altura en pantalla) => se encoge con el juego;
//   - si el botón de animaciones no está visible, va en la esquina superior izquierda, también
//     escalado con el juego (nunca a tamaño real: en el móvil salía enorme).
// OJO: #bf-cine-toggle es position:fixed, y un elemento fijo tiene offsetParent === null SIEMPRE.
// Comprobar offsetParent hacía creer que nunca era visible: el icono caía siempre en el rincón
// (10,10), encima del botón y a tamaño real. La visibilidad se decide con su rectángulo.
export const CHAT_ICON_NATURAL_HEIGHT = 28;
export const CHAT_ICON_GAP = 8;        // px a escala 1
export const CHAT_ICON_MIN_SCALE = 0.4;
export const CHAT_ICON_MAX_SCALE = 1.5;

const clamp = (v) => Math.min(CHAT_ICON_MAX_SCALE, Math.max(CHAT_ICON_MIN_SCALE, v));
export const rectVisible = (r) => !!r && r.width > 1 && r.height > 1;

export function chatIconAnchor(m) {
  const fallback = { left: 10, top: 10, height: CHAT_ICON_NATURAL_HEIGHT, scale: 1 };
  if (!m || !m.frameRect) return fallback;
  const fr = m.frameRect;
  let k = fr.width && m.innerWidth ? fr.width / m.innerWidth : 1;
  if (!Number.isFinite(k) || k <= 0) k = 1;
  const r = m.btnRect;
  if (!rectVisible(r)) {
    // Sin botón de animaciones a la vista: esquina superior izquierda del juego, a escala del juego.
    return { left: Math.round(fr.left + 10 * k), top: Math.round(fr.top + 10 * k), height: CHAT_ICON_NATURAL_HEIGHT, scale: Math.round(clamp(k) * 100) / 100 };
  }
  const btnH = r.height * k;
  const scale = clamp(btnH / CHAT_ICON_NATURAL_HEIGHT);   // misma altura que el botón de animaciones
  return {
    left: Math.round(fr.left + r.right * k + CHAT_ICON_GAP * scale),
    top: Math.round(fr.top + r.top * k + (btnH - CHAT_ICON_NATURAL_HEIGHT * scale) / 2),
    height: CHAT_ICON_NATURAL_HEIGHT,
    scale: Math.round(scale * 100) / 100,
  };
}
