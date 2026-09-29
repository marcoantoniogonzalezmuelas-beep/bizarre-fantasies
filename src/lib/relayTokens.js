// Tokens secretos de asiento para el relay (uno por sala y lado). Se guardan
// en localStorage para poder reanudar tras recargar en el mismo navegador.
const clean = code => String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
const key = (code, side) => `bfRelayToken:${clean(code)}:${side}`;

export function getRelayToken(code, side) {
  try { return localStorage.getItem(key(code, side)) || ''; } catch { return ''; }
}

export function setRelayToken(code, side, token) {
  if (!clean(code) || !['p', 'g'].includes(side) || !token) return;
  try { localStorage.setItem(key(code, side), String(token)); } catch { /* sin almacenamiento */ }
}