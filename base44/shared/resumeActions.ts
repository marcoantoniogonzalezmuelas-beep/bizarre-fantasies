// Acciones de reanudación (puras, testeables). gameRelay las conecta con la BD.
import { relayTokenOk } from './relayAuth.ts';
import { checkRoomPassword } from './joinGuard.ts';
import { cleanNick } from './sanitize.ts';
import { canRejoin, seatState, matchIsOver, FORFEIT_MS, type Seat } from './resumePolicy.ts';

export function seatNick(room: any, seat: Seat): string {
  const s = (room && room.state) || {};
  const resume = Array.isArray(s.resume_nicks) ? s.resume_nicks : [];
  return String(seat === 'p'
    ? (room.host_name || resume[0] || s.room_name || '')
    : (room.guest_name || s.guest_nick || resume[1] || ''));
}

// Estado de MI partida (se exige el token del asiento antes de llamar).
export function resumeStatus(room: any, side: Seat, now: number) {
  const can = canRejoin(room, now);
  const other: Seat = side === 'p' ? 'g' : 'p';
  const theirs = seatState(room, other, now);
  return {
    ok: true, can_resume: can.ok, reason: can.reason,
    nicks: [seatNick(room, 'p'), seatNick(room, 'g')],
    has_pass: !!(room && room.state && room.state.password),
    opponent_absent: theirs.absent, opponent_away_ms: theirs.absent ? theirs.awayMs : 0,
    forfeit_after_ms: FORFEIT_MS,
  };
}

export function matchPhasePatch(phase: unknown, side: Seat, now: number): Record<string, unknown> | null {
  if (phase === 'over') return { 'state.match_over_at': now, 'state.over_by': side };
  if (phase === 'playing') return { 'state.match_started_at': now };
  return null;
}

// Salir a propósito ("Sí, salir"): el aviso dice que la partida termina, así que ya no es reanudable.
export function leavePatch(side: Seat, now: number): Record<string, unknown> {
  return { left_at: now, [side === 'p' ? 'state.host_left_at' : 'state.guest_left_at']: now,
    'state.match_over_at': now, 'state.abandoned_by': side };
}

// Reclamar la victoria cuando el rival lleva ausente FORFEIT_MS. El servidor lo comprueba con
// SUS latidos: el reclamante no puede falsearlo.
export function forfeitDecision(room: any, side: Seat, now: number) {
  if (!room || (room.status !== 'playing' && room.status !== 'resuming')) return { ok: false, status: 409, error: 'not_playing' };
  if (matchIsOver(room.state)) return { ok: false, status: 409, error: 'already_over' };
  const other: Seat = side === 'p' ? 'g' : 'p';
  const mine = seatState(room, side, now), theirs = seatState(room, other, now);
  if (mine.absent) return { ok: false, status: 409, error: 'you_are_away' };
  if (!theirs.absent || theirs.awayMs < FORFEIT_MS) return { ok: false, status: 409, error: 'too_early', wait_ms: Math.max(0, FORFEIT_MS - theirs.awayMs) };
  return { ok: true, status: 200,
    patch: { 'state.match_over_at': now, 'state.forfeit_by': other, 'state.forfeit_at': now },
    winner_nick: seatNick(room, side), loser_nick: seatNick(room, other) };
}

// ¿Quién eres? Sirve (1) el token del asiento, (2) la contraseña de la sala, (3) la contraseña
// de TU nick (para reanudar desde otro dispositivo, donde no está el token). Antes la contraseña
// de sala se exigía siempre, aunque el navegador ya tuviera el token.
export async function authorizeResume(a: {
  room: any; side: Seat; body: any; now: number;
  verifyNick: (nick: string, password: string) => Promise<{ ok?: boolean; mode?: string } | null>;
}) {
  const { room, side, body, now } = a;
  const state = (room && room.state) || {};
  if (relayTokenOk(state, side, body && body.token)) return { allowed: true, via: 'token' };
  let patch: Record<string, unknown> | undefined;
  if (state.password) {
    const g = checkRoomPassword(state, body && body.password, now);
    if (g.patch) patch = g.patch;
    if (g.allowed) return { allowed: true, via: 'password', patch };
    if (g.reason === 'locked') return { allowed: false, status: 429, error: 'Too many attempts', patch };
  }
  const nick = cleanNick(body && body.nick);
  const proof = String((body && body.nick_password) || '');
  if (proof && nick && nick.toLowerCase() === seatNick(room, side).toLowerCase()) {
    const r = await a.verifyNick(nick, proof);
    // Solo vale una credencial que YA existía: nunca se crea una nueva para "demostrar" nada.
    if (r && r.ok && r.mode === 'verified') return { allowed: true, via: 'nick' };
  }
  return { allowed: false, status: 403, error: state.password ? 'Wrong password' : 'Unauthorized', patch };
}
