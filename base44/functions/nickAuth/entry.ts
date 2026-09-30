// Protección de nicks en el servidor: la verificación y la creación de
// contraseñas ocurren aquí y los hashes nunca salen al cliente.
//  - list:  devuelve solo los nicks protegidos (sin hashes)
//  - check: verifica la contraseña de un nick, o la crea si el nick es nuevo
// La lógica (y el bloqueo persistente por intentos fallidos) está en
// ../../shared/nickAuthCore.ts, que se testea de forma aislada.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { checkNick } from '../../shared/nickAuthCore.ts';

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
      return Response.json(await checkNick(creds, body.nick, body.password));
    }
    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
  }
});
