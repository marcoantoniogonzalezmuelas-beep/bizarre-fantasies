import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { cleanupMissionRooms } from '../../shared/missionRooms.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    return Response.json(await cleanupMissionRooms(base44));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}