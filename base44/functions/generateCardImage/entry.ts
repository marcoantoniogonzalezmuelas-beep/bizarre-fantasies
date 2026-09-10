import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Genera (o edita) una imagen con el motor integrado de la plataforma
// (Core.GenerateImage) y devuelve la URL. Se usa desde el backoffice de
// cartas para el arte de carta y los iconos de marcadores pasivos.
// Solo administradores.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const prompt = body?.prompt;
    if (!prompt) return Response.json({ error: 'Falta el prompt' }, { status: 400 });
    const refs = Array.isArray(body?.reference_urls) ? body.reference_urls.filter(Boolean).slice(0, 4) : [];

    const args = { prompt };
    if (refs.length) args.existing_image_urls = refs;
    const res = await base44.asServiceRole.integrations.Core.GenerateImage(args);
    return Response.json({ url: res?.url || '' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}