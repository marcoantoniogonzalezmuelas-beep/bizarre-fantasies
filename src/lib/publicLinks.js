// Enlaces públicos para invitar (siempre con la dirección pública del juego, no la interna de la plataforma).
export const PUBLIC_URL = 'https://bizarrefantasies.cronicasvetustas.com';
export const missionRoomLink = (code) => `${PUBLIC_URL}/?msala=${encodeURIComponent(code)}`;

// Comparte (móvil: menú de compartir, p. ej. WhatsApp) o copia el texto con el enlace (ordenador).
export async function shareInvite(text, url) {
  try { if (navigator.share) { await navigator.share({ title: 'Bizarre Fantasies', text, url }); return 'shared'; } } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  try { await navigator.clipboard.writeText(`${text} ${url}`); return 'copied'; } catch (e) { /* sin portapapeles */ }
  window.prompt('Copia el enlace:', url);
  return 'prompted';
}
