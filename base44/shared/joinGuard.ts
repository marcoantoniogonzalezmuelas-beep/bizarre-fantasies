// Freno contra adivinar la contraseña de una sala. Las salas con contraseña aparecen
// en el lobby con su código, así que cualquiera podía probar contraseñas sin límite.
// Los intentos fallidos se guardan en la propia sala (state.join_fails / join_locked_until),
// por lo que el bloqueo vale para todas las instancias del servidor.
const MAX_FREE_FAILS = 5;

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isJoinLocked(state: any, now: number): boolean {
  return Number(state && state.join_locked_until || 0) > now;
}

// Devuelve si se permite el acceso y, si hay que actualizar el contador, el $set a aplicar.
export function checkRoomPassword(state: any, supplied: unknown, now: number): { allowed: boolean; reason?: 'locked' | 'wrong'; patch?: Record<string, unknown> } {
  const password = state && state.password;
  if (!password) return { allowed: true };
  if (isJoinLocked(state, now)) return { allowed: false, reason: 'locked' };
  if (safeEqual(String(supplied == null ? '' : supplied), String(password))) {
    const dirty = Number(state.join_fails || 0) > 0 || Number(state.join_locked_until || 0) > 0;
    return dirty ? { allowed: true, patch: { 'state.join_fails': 0, 'state.join_locked_until': 0 } } : { allowed: true };
  }
  const fails = Number(state.join_fails || 0) + 1;
  const lockedUntil = fails >= MAX_FREE_FAILS ? now + Math.min(300000, 2000 * 2 ** (fails - MAX_FREE_FAILS)) : 0;
  return { allowed: false, reason: 'wrong', patch: { 'state.join_fails': fails, 'state.join_locked_until': lockedUntil } };
}
