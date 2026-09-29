// Protección de nicks en el servidor: la verificación y la creación de
// contraseñas ocurren aquí y los hashes nunca salen al cliente.
//  - list:  devuelve solo los nicks protegidos (sin hashes)
//  - check: verifica la contraseña de un nick, o la crea si el nick es nuevo
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const MIN_LEN = 6;
const ITER = 100000;
// Freno básico de fuerza bruta por nick (por isolate).
const fails = new Map<string, { n: number; until: number }>();

const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = String(body.action || '');
    const creds = base44.asServiceRole.entities.NickCredential;

    if (action === 'list') {
      const rows = await creds.list('nick', 1000);
      return Response.json({ nicks: (rows || []).map((r: any) => r.nick) });
    }

    if (action === 'check') {
      const nick = String(body.nick || '').trim().toLowerCase().slice(0, 40);
      const password = String(body.password || '').slice(0, 200);
      if (!nick) return Response.json({ ok: false, error: 'empty' });
      const f = fails.get(nick);
      if (f && f.until > Date.now()) return Response.json({ ok: false, error: 'wrong_password' });

      const rows = await creds.filter({ nick }, '-created_date', 1);
      const existing = rows && rows[0];
      if (existing && existing.password) {
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
          const n = (f?.n || 0) + 1;
          fails.set(nick, { n, until: n >= 5 ? Date.now() + Math.min(300000, 2000 * 2 ** (n - 5)) : 0 });
          return Response.json({ ok: false, error: 'wrong_password' });
        }
        fails.delete(nick);
        return Response.json({ ok: true, mode: 'verified' });
      }
      if (password.length < MIN_LEN) return Response.json({ ok: false, error: 'too_short' });
      const hash = await hashNew(password);
      if (existing) await creds.update(existing.id, { password: hash });
      else await creds.create({ nick, password: hash });
      return Response.json({ ok: true, mode: 'set' });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
  }
});