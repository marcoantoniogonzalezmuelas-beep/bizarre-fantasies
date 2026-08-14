import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Genera (o edita) una imagen con el motor de imágenes de OpenAI (ChatGPT,
// modelo gpt-image-1) y devuelve una URL ya subida al almacenamiento de la app.
// - Sin reference_urls -> generación desde cero (/images/generations)
// - Con reference_urls -> edición/referencia visual (/images/edits)
// Solo administradores (se usa desde el backoffice de cartas).
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
    const size = body?.size || '1024x1536';

    const apiKey = secrets.get('OPENAI_API_KEY');
    if (!apiKey) return Response.json({ error: 'Falta la clave OPENAI_API_KEY' }, { status: 500 });

    let openaiRes;
    if (refs.length) {
      const form = new FormData();
      form.append('model', 'gpt-image-1');
      form.append('prompt', prompt);
      form.append('size', size);
      for (let i = 0; i < refs.length; i++) {
        const r = await fetch(refs[i]);
        if (!r.ok) continue;
        const blob = await r.blob();
        form.append('image[]', new File([blob], 'ref' + i + '.png', { type: blob.type || 'image/png' }));
      }
      openaiRes = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + apiKey },
        body: form,
      });
    } else {
      openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-image-1', prompt, size, n: 1 }),
      });
    }

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      return Response.json({ error: data?.error?.message || 'Error de OpenAI' }, { status: openaiRes.status });
    }
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return Response.json({ error: 'OpenAI no devolvió imagen' }, { status: 502 });

    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const file = new File([bytes], 'openai_art.png', { type: 'image/png' });
    const uploaded = await base44.integrations.Core.UploadFile({ file });
    return Response.json({ url: uploaded?.file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}