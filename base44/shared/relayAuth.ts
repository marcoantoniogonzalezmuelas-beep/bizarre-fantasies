// Autenticación de participantes del relay. Cada jugador presenta un token
// secreto de su sala: el anfitrión usa el owner_token (o el relay_host_token
// emitido al reanudar) y el invitado el guest_token emitido al unirse.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function relayTokenOk(state: any, side: string, token: unknown): boolean {
  const t = typeof token === 'string' ? token : '';
  if (!t || t.length > 80 || (side !== 'p' && side !== 'g')) return false;
  const valid = side === 'p' ? [state?.owner_token, state?.relay_host_token] : [state?.guest_token];
  return valid.some((v: unknown) => typeof v === 'string' && v.length > 0 && safeEqual(v, t));
}

export function newRelayToken(): string {
  return crypto.randomUUID();
}