// Escribe en la base de datos todo lo que antes guardaba el cliente directamente
// (resultados, ranking, avatares, registros, misiones, chat). La lógica y las
// validaciones están en ../../shared/gameRecord.ts (testeado de forma aislada).
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { handleRecord } from '../../shared/gameRecord.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const reply = await handleRecord(base44.asServiceRole.entities, body);
    return Response.json(reply.body, { status: reply.status });
  } catch (error: any) {
    console.error('gameRecord failed:', error && error.message);
    return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
  }
}
