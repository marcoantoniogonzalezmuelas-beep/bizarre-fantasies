// Reglas de REANUDACIÓN de partidas multijugador. Son funciones puras (sin BD) para poder
// testearlas a fondo; las usan gameRelay, gameLobby y relayProtocol.
//
// Problemas que resuelve este módulo (estaban en el diseño anterior):
//  - Una caída brusca (cerrar la pestaña, perder la red, móvil sin batería) NO hacía la sala
//    reanudable: `left_at` solo lo escribía la salida explícita o una rama de poll que el
//    cliente ya no usa (protocol 2). Ahora la ausencia se deduce de los latidos.
//  - Nadie marcaba nunca una partida como terminada, así que no se distinguía "interrumpida"
//    de "acabada". La marca es REVERSIBLE (match_over_at / match_started_at) porque la
//    revancha reutiliza la misma sala.
export const ABSENT_MS = 45_000;            // sin latido durante este tiempo = desconectado
export const FORFEIT_MS = 5 * 60_000;       // ausencia mínima del rival para poder reclamar victoria
export const RESUME_TTL_MS = 30 * 60_000;   // tiempo para reanudar desde el último latido
export const OVER_TTL_MS = 10 * 60_000;     // una partida terminada se limpia antes
export const IDLE_ROOM_TTL_MS = 10 * 60_000; // salas en espera / otros estados (como antes)

export type Seat = 'p' | 'g';
const num = (v: unknown): number => Number(v) || 0;

export function seatState(room: any, seat: Seat, now: number) {
  const s = (room && room.state) || {};
  const lastSeen = num(seat === 'p' ? s.host_last_seen : s.guest_last_seen);
  const leftAt = num(seat === 'p' ? s.host_left_at : s.guest_left_at);
  const stale = lastSeen > 0 && now - lastSeen > ABSENT_MS;
  const absent = leftAt > 0 || stale;
  const awayMs = leftAt > 0 ? Math.max(0, now - leftAt) : stale ? now - lastSeen : 0;
  return { lastSeen, leftAt, absent, awayMs };
}

// true = la partida que había en la sala ya terminó (y no se ha empezado otra con revancha).
export function matchIsOver(state: any): boolean {
  const over = num(state && state.match_over_at), started = num(state && state.match_started_at);
  return over > 0 && over >= started;
}

export function lastActivity(room: any): number {
  const s = (room && room.state) || {};
  return Math.max(num(s.host_last_seen), num(s.guest_last_seen), num(s.host_left_at), num(s.guest_left_at),
    num(s.match_over_at), Date.parse((room && room.created_date) || '') || 0);
}

const isPlaying = (room: any) => !!room && (room.status === 'playing' || room.status === 'resuming');
const gameStarted = (room: any) => !!(room && room.state && (room.state.guest_token || room.state.guest_nick));

// Veredicto para TERCEROS (lista del lobby): ¿hay una partida interrumpida que se pueda reanudar?
export function resumeInfo(room: any, now: number) {
  const base = { resumable: false, reason: '', absentSeats: [] as Seat[], expiresInMs: 0 };
  if (!isPlaying(room)) return { ...base, reason: 'not_playing' };
  if (!gameStarted(room)) return { ...base, reason: 'no_guest' };
  if (matchIsOver(room.state)) return { ...base, reason: 'over' };
  const absentSeats = (['p', 'g'] as Seat[]).filter((x) => seatState(room, x, now).absent);
  const idle = now - lastActivity(room);
  if (idle > RESUME_TTL_MS) return { ...base, reason: 'expired', absentSeats };
  if (!absentSeats.length) return { ...base, reason: 'in_progress' };
  return { resumable: true, reason: '', absentSeats, expiresInMs: RESUME_TTL_MS - idle };
}

// Veredicto para el DUEÑO de un asiento (ya demostró quién es con su token): ¿puede volver a
// entrar? No depende de los latidos: tras recargar, su asiento aún figura como "presente"
// durante 45 s, pero su sesión ya murió. Volver a entrar renueva su token (y expulsa a una
// sesión vieja si siguiera viva).
export function canRejoin(room: any, now: number) {
  if (!isPlaying(room)) return { ok: false, reason: 'not_playing' };
  if (!gameStarted(room)) return { ok: false, reason: 'no_guest' };
  if (matchIsOver(room.state)) return { ok: false, reason: 'over' };
  if (now - lastActivity(room) > RESUME_TTL_MS) return { ok: false, reason: 'expired' };
  return { ok: true, reason: '' };
}

export function roomTtl(room: any): number {
  if (isPlaying(room)) return matchIsOver(room.state) ? OVER_TTL_MS : RESUME_TTL_MS;
  return IDLE_ROOM_TTL_MS;
}
export function roomExpired(room: any, now: number): boolean {
  if (!room) return false;
  if (room.status === 'finished') return true;
  return now - lastActivity(room) > roomTtl(room);
}
