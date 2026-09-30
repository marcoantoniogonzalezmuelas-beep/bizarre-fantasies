// Verificación/creación de la contraseña de un nick (la usa la función nickAuth).
// El bloqueo por intentos fallidos ahora se guarda en la fila del nick (fail_count,
// locked_until): antes era un Map en memoria por isolate, que se reinicia y no se
// comparte entre instancias, así que no frenaba un ataque real.
const MIN_LEN = 3;
const ITER = 100000;
const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');

async function pbkdf2(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: ITER }, key, 256));
}
async function sha256(text: string): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function hashNew(password: string): Promise<string> {
  const salt = crypto.randomUUID();
  return 'pbkdf2$' + salt + '$' + await pbkdf2(password, salt);
}

export type FailMap = Map<string, { n: number; until: number }>;
export const defaultFails: FailMap = new Map();
const lockFor = (n: number, now: number) => (n >= 5 ? now + Math.min(300000, 2000 * 2 ** (n - 5)) : 0);

export async function checkNick(creds: any, rawNick: unknown, rawPassword: unknown, now: number = Date.now(), fails: FailMap = defaultFails): Promise<Record<string, unknown>> {
  const nick = String(rawNick || '').trim().toLowerCase().slice(0, 40);
  const password = String(rawPassword || '').slice(0, 200);
  if (!nick) return { ok: false, error: 'empty' };
  const f = fails.get(nick);
  if (f && f.until > now) return { ok: false, error: 'wrong_password' };

  const rows = await creds.filter({ nick }, '-created_date', 1);
  const existing = rows && rows[0];
  if (existing && existing.password) {
    if (Number(existing.locked_until || 0) > now) return { ok: false, error: 'wrong_password' };
    const stored = String(existing.password);
    let ok = false;
    if (stored.startsWith('pbkdf2$')) {
      const [, salt, h] = stored.split('$');
      ok = safeEqual(h || '', await pbkdf2(password, salt || ''));
    } else {
      // Hash antiguo SHA-256 sin sal: se acepta una vez y se migra a PBKDF2.
      ok = safeEqual(stored, await sha256(password));
      if (ok) await creds.update(existing.id, { password: await hashNew(password) });
    }
    if (!ok) {
      const n = Math.max(f ? f.n : 0, Number(existing.fail_count || 0)) + 1;
      const until = lockFor(n, now);
      fails.set(nick, { n, until });
      try { await creds.update(existing.id, { fail_count: n, locked_until: until }); } catch (_e) { /* el freno en memoria sigue activo */ }
      return { ok: false, error: 'wrong_password' };
    }
    fails.delete(nick);
    if (Number(existing.fail_count || 0) > 0 || Number(existing.locked_until || 0) > 0) {
      try { await creds.update(existing.id, { fail_count: 0, locked_until: 0 }); } catch (_e) { /* no crítico */ }
    }
    return { ok: true, mode: 'verified' };
  }
  if (password.length < MIN_LEN) return { ok: false, error: 'too_short' };
  const hash = await hashNew(password);
  if (existing) await creds.update(existing.id, { password: hash });
  else await creds.create({ nick, password: hash });
  return { ok: true, mode: 'set' };
}
