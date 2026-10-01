// Escritura SERVIDOR de todo lo que antes el cliente guardaba directamente en las
// entidades (resultados, ranking, progreso contra la IA, registros de partida,
// victorias de misión, avatares y chat). Con las entidades abiertas a escritura,
// cualquiera podía falsear el ranking, pisar el avatar de otro, envenenar los
// registros con los que aprende la IA o suplantar a otro jugador en el chat.
//
// Este módulo es puro (recibe las entidades ya autenticadas con el rol de servicio)
// para poder testearlo sin la plataforma. Qué garantiza:
//   - solo campos conocidos, con tipo, rango y tamaño validados; nicks y URLs saneados
//   - límites de frecuencia por jugador y deduplicación de envíos repetidos
//   - chat: el nick lo pone el SERVIDOR (token de sala o de visitante), no el cliente,
//     y la moderación se aplica aquí
// Qué NO puede garantizar: que el resultado de una partida sea cierto. El juego se
// calcula en el navegador del anfitrión; eso solo se evitaría simulando la partida
// en el servidor.
import { cleanNick, cleanAvatarUrl, cleanText } from './sanitize.ts';
import { isChatMessageBlocked } from './chatModeration.ts';
import { relayTokenOk } from './relayAuth.ts';
import { canonNick, nickKey, canonPairKey } from './nickCanon.ts';

const MODES = ['online', 'local', 'ia', 'mission', 'mission_mp'];
const MISSIONS = ['club', 'l5r', 'todos'];
const WINNERS = ['player', 'opponent', 'draw'];
// Cuánto puede subir el marcador de una pareja en un solo envío. Es un freno contra números absurdos,
// pero lo bastante holgado para que unas cuantas victorias perdidas por falta de red se recuperen
// (con +3 la base de datos se quedaba permanentemente por detrás del marcador local).
const SCORE_MAX_JUMP = 10;

export type Reply = { status: number; body: Record<string, unknown> };
const ok = (extra: Record<string, unknown> = {}): Reply => ({ status: 200, body: { ok: true, ...extra } });
const bad = (error: string, status = 400): Reply => ({ status, body: { ok: false, error } });

// ---- Limitador de frecuencia (por isolate; es un freno, no una garantía) ----
export function makeLimiter() {
  const hits = new Map<string, number[]>();
  return function allow(key: string, max: number, windowMs: number, now: number): boolean {
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) { hits.set(key, recent); return false; }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [k, v] of hits) { if (!v.length || now - v[v.length - 1] > 120000) hits.delete(k); }
    }
    return true;
  };
}
const defaultAllow = makeLimiter();

// ---- Validadores ----
const str = (v: unknown, max: number): string => cleanText(v, max);
const int = (v: unknown, min: number, max: number): number | null => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};
function heroes(v: unknown, withNumber = false): Record<string, unknown>[] {
  if (!Array.isArray(v)) return [];
  const out: Record<string, unknown>[] = [];
  for (const h of v.slice(0, 12)) {
    const name = str(h && h.name, 40);
    if (!name) continue;
    const item: Record<string, unknown> = { name, elite: !!(h && h.elite === true) };
    if (withNumber) { const n = int(h && h.number, 0, 9999); if (n !== null) item.number = n; }
    else item.died = !!(h && h.died === true);
    out.push(item);
  }
  return out;
}

async function upsertAvatar(E: any, nick: string, url: string) {
  if (!nick || !url) return;
  const rows = await E.PlayerAvatar.filter({ nick }, '-created_date', 1);
  if (rows && rows.length) { if (rows[0].avatar_url !== url) await E.PlayerAvatar.update(rows[0].id, { avatar_url: url }); }
  else await E.PlayerAvatar.create({ nick, avatar_url: url });
}

// ---- Resultado de partida (+ avatar de los jugadores + victoria contra la IA) ----
async function recordMatch(E: any, body: any, now: number, allow: any): Promise<Reply> {
  const r = (body && body.result) || {};
  const mode = MODES.includes(r.mode) ? r.mode : '';
  // Una IA es la misma aunque el juego esté en inglés ("AI Novice" = "IA Novata").
  const winner = canonNick(cleanNick(r.winner_nick)), loser = canonNick(cleanNick(r.loser_nick));
  if (!mode || !winner || !loser) return bad('invalid_result');
  const wAi = r.winner_is_ai === true, lAi = r.loser_is_ai === true;
  if (wAi && lAi) return bad('invalid_result');
  const aiLevel = str(r.ai_level, 40);
  // Partidas de MISIÓN (en solitario o multijugador): llevan misión, nivel y run_id, y cada run_id se
  // guarda UNA sola vez (en multijugador informan los dos jugadores).
  const isMission = mode === 'mission' || mode === 'mission_mp';
  let missionFields: Record<string, unknown> = {};
  if (isMission) {
    const runId = String(r.run_id || '');
    if (!MISSIONS.includes(r.mission) || !/^[A-Za-z0-9_-]{6,80}$/.test(runId)) return bad('invalid_result');
    const already = await E.MatchResult.filter({ run_id: runId }, '-created_date', 1);
    if (already && already.length) return ok({ duplicate: true });
    missionFields = { mission: r.mission, mission_level: int(r.mission_level, 0, 100) ?? 0, run_id: runId };
  }
  if (!allow('match:' + winner.toLowerCase(), 6, 60000, now)) return bad('rate_limited', 429);
  // Los dos clientes pueden informar del mismo resultado: solo se guarda uno.
  if (!allow(`dup:${mode}:${winner.toLowerCase()}:${loser.toLowerCase()}`, 1, 20000, now)) return ok({ duplicate: true });

  const winnerAvatar = wAi ? '' : cleanAvatarUrl(r.winner_avatar);
  const loserAvatar = lAi ? '' : cleanAvatarUrl(r.loser_avatar);
  await E.MatchResult.create({
    winner_nick: winner, loser_nick: loser, mode, ai_level: aiLevel,
    winner_is_ai: wAi, loser_is_ai: lAi, winner_avatar: winnerAvatar, loser_avatar: loserAvatar,
    winner_heroes: heroes(r.winner_heroes), loser_heroes: heroes(r.loser_heroes), ...missionFields,
  });
  if (!wAi) await upsertAvatar(E, winner, winnerAvatar);
  if (!lAi) await upsertAvatar(E, loser, loserAvatar);

  let aiWins: number | undefined;
  if (mode === 'ia' && !wAi && aiLevel) {
    const rows = await E.PlayerAiProgress.filter({ nick: winner, level_id: aiLevel }, '-created_date', 1);
    if (rows && rows.length) { aiWins = (rows[0].wins || 0) + 1; await E.PlayerAiProgress.update(rows[0].id, { wins: aiWins }); }
    else { aiWins = 1; await E.PlayerAiProgress.create({ nick: winner, level_id: aiLevel, wins: 1 }); }
  }
  return ok({ ai_wins: aiWins });
}

// ---- Marcador entre dos jugadores: solo puede subir poco a poco ----
async function recordScoreWin(E: any, body: any, now: number, allow: any): Promise<Reply> {
  const pair = canonPairKey(str(body.pair_key, 90)), nick = nickKey(cleanNick(body.nick)), wins = int(body.wins, 1, 100000);
  if (!pair || !nick || wins === null) return bad('invalid_score');
  if (!allow('score:' + pair + '|' + nick, 20, 60000, now)) return bad('rate_limited', 429);
  const rows = await E.HeadToHead.filter({ pair_key: pair, nick }, '-created_date', 1);
  if (rows && rows.length) {
    const cur = rows[0].wins || 0;
    // Los dos dispositivos guardan la misma victoria: se conserva el mayor, pero un
    // envío no puede disparar el marcador (antes se podía poner cualquier número).
    const next = Math.min(wins, cur + SCORE_MAX_JUMP);
    if (next > cur) await E.HeadToHead.update(rows[0].id, { wins: next });
    return ok({ wins: Math.max(cur, next) });
  }
  const first = Math.min(wins, SCORE_MAX_JUMP);
  await E.HeadToHead.create({ pair_key: pair, nick, wins: first });
  return ok({ wins: first });
}

async function recordAvatar(E: any, body: any, now: number, allow: any): Promise<Reply> {
  const nick = cleanNick(body.nick), url = cleanAvatarUrl(body.avatar_url);
  if (!nick || !url) return bad('invalid_avatar');
  if (!allow('avatar:' + nick.toLowerCase(), 6, 60000, now)) return bad('rate_limited', 429);
  await upsertAvatar(E, nick, url);
  return ok();
}

// ---- Registro de partida (lo usa la IA para aprender: solo campos conocidos) ----
async function recordGameLog(E: any, body: any, now: number, allow: any): Promise<Reply> {
  const L = (body && body.log) || {};
  const mode = MODES.includes(L.mode) ? L.mode : '';
  const player = cleanNick(L.player_nick);
  if (!mode || !player) return bad('invalid_log');
  if (!allow('log:' + player.toLowerCase(), 4, 60000, now)) return bad('rate_limited', 429);
  const events = (Array.isArray(L.events) ? L.events.slice(0, 300) : []).map((e: any) => ({
    turn: int(e && e.turn, 0, 5000) ?? 0, side: str(e && e.side, 8), type: str(e && e.type, 40),
    actor: str(e && e.actor, 60), target: str(e && e.target, 60), detail: str(e && e.detail, 200),
  }));
  const items = (Array.isArray(L.items_bought) ? L.items_bought.slice(0, 80) : [])
    .map((i: any) => ({ name: str(i && i.name, 60), side: str(i && i.side, 8) })).filter((i: any) => i.name);
  const clean: Record<string, unknown> = {
    room_code: str(L.room_code, 12), mode, player_nick: player, opponent_nick: cleanNick(L.opponent_nick),
    player_clan: str(L.player_clan, 40), opponent_clan: str(L.opponent_clan, 40), ai_level: str(L.ai_level, 40),
    player_heroes: heroes(L.player_heroes, true), opponent_heroes: heroes(L.opponent_heroes, true),
    turns_played: int(L.turns_played, 0, 5000) ?? 0, player_won: L.player_won === true,
    events, items_bought: items, duration_seconds: int(L.duration_seconds, 0, 86400) ?? 0,
    // analyzed_by lo controla el servidor: un cliente no puede marcar su log como ya analizado.
  };
  if (WINNERS.includes(L.winner)) clean.winner = L.winner;
  // El cliente envía como mucho 180 eventos de 180 caracteres (~45 KB); 150 KB es margen de sobra.
  if (JSON.stringify(clean).length > 150000) return bad('too_large', 413);
  await E.GameLog.create(clean);
  return ok();
}

async function recordMissionVictory(E: any, body: any, now: number, allow: any): Promise<Reply> {
  const nick = cleanNick(body.nick).toLowerCase(), level = int(body.level, 1, 100), runId = String(body.run_id || '');
  if (!nick || level === null || !MISSIONS.includes(body.mission) || !/^[A-Za-z0-9_-]{6,80}$/.test(runId)) return bad('invalid_victory');
  const existing = await E.MissionVictory.filter({ run_id: runId }, '-created_date', 1);
  if (existing && existing.length) return ok({ victory: existing[0] });
  if (!allow('mission:' + nick, 10, 60000, now)) return bad('rate_limited', 429);
  const victory = await E.MissionVictory.create({ nick, mission: body.mission, level, run_id: runId });
  return ok({ victory });
}

// ---- Chat: el servidor decide QUIÉN habla; el cliente solo aporta el texto ----
async function recordChat(E: any, body: any, now: number, allow: any): Promise<Reply> {
  const text = cleanText(body.text, 200);
  const emoji = String(body.emoji_id || '');
  if (emoji && !/^[A-Za-z0-9_:.\-]{1,64}$/.test(emoji)) return bad('invalid_message');
  if (!text && !emoji) return bad('invalid_message');
  if (text && isChatMessageBlocked(text)) return bad('blocked', 422);

  let code = '', nick = '', isHost = false;
  if (body.room_code === 'BIZARRE_ROOM') {
    code = 'BIZARRE_ROOM';
    const token = String(body.session_token || '').slice(0, 80);
    if (!token) return bad('unauthorized', 403);
    const rows = await E.BizarreVisitor.filter({ session_token: token }, '-created_date', 1);
    if (!rows || !rows[0]) return bad('unauthorized', 403);
    nick = cleanNick(rows[0].nick);
  } else {
    code = String(body.room_code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (!code) return bad('invalid_message');
    const rooms = await E.GameRoom.filter({ room_code: code }, '-updated_date', 1);
    const room = rooms && rooms[0];
    if (!room) return bad('room_not_found', 404);
    const side = String(body.side || '');
    if (!relayTokenOk(room.state || {}, side, body.token)) return bad('unauthorized', 403);
    isHost = side === 'p';
    nick = cleanNick(isHost ? (room.host_name || (room.state && room.state.room_name)) : (room.guest_name || (room.state && room.state.guest_nick)));
  }
  if (!nick) nick = 'Jugador';
  if (!allow(`chatgap:${code}:${nick}`, 1, 500, now) || !allow(`chat:${code}:${nick}`, 12, 10000, now)) return bad('rate_limited', 429);
  const message = await E.ChatMessage.create({ room_code: code, sender_nick: nick, sender_is_host: isHost, text, emoji_id: emoji });
  return ok({ message });
}

const KINDS: Record<string, (E: any, b: any, n: number, a: any) => Promise<Reply>> = {
  match: recordMatch, score_win: recordScoreWin, avatar: recordAvatar,
  game_log: recordGameLog, mission_victory: recordMissionVictory, chat: recordChat,
};

export async function handleRecord(E: any, body: any, now: number = Date.now(), allow: any = defaultAllow): Promise<Reply> {
  const fn = KINDS[String((body && body.kind) || '')];
  if (!fn) return bad('unknown_kind');
  return await fn(E, body, now, allow);
}
