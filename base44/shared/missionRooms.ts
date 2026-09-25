export const MISSION_ROOM_TTL = 10 * 60 * 1000;
export function missionRoomExpiresAt(room) {
  return Number(room.state?.expires_at) || Number(room.state?.created_at) + MISSION_ROOM_TTL || Date.parse(room.created_date) + MISSION_ROOM_TTL;
}
export function missionRoomSummary(room) {
  return { id: room.id, code: room.room_code, host_nick: room.state.host_nick, mission: room.state.mission, modality: room.state.modality, is_private: !!room.state.is_private, expires_at: missionRoomExpiresAt(room) };
}
export function missionParticipant(room, token) {
  if (typeof token !== 'string' || !token) return null;
  if (token === room.state.owner_token) return 'host';
  if (token === room.state.guest_token) return 'guest';
  return null;
}
export async function hashMissionPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bytes = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100000 }, key, 256);
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
// This only removes mission staging rooms, never their separate live relay games.
export async function cleanupMissionRooms(base44, now = Date.now()) {
  const rooms = base44.asServiceRole.entities.GameRoom;
  let deleted = 0, offset = 0;
  while (true) {
    const page = await rooms.filter({ 'state.mp_mission': 'mp' }, 'created_date', 100, offset);
    let removed = 0;
    for (const room of page) {
      if (missionRoomExpiresAt(room) > now) continue;
      // Conditional deletion: a heartbeat/join that extended the expiry wins.
      await rooms.deleteMany({ id: room.id, 'state.mp_mission': 'mp', updated_date: room.updated_date });
      // The entity SDK does not guarantee a deleted_count field; check the row
      // so paging does not skip entries shifted by a successful deletion.
      const remains = await rooms.get(room.id).catch(() => null);
      if (!remains) { deleted++; removed++; }
    }
    if (page.length < 100) break;
    offset += page.length - removed;
  }
  return { ok: true, deleted };
}