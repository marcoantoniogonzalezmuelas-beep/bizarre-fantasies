import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Genera (o edita) una imagen con Nano Banana (Gemini 2.5 Flash Image de Google)
// y devuelve una URL ya subida al almacenamiento de la app.
// Si se envían reference_urls, se adjuntan como referencia visual (edición).
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

    const apiKey = secrets.get('GEMINI_API_KEY');
    if (!apiKey) return Response.json({ error: 'Falta la clave GEMINI_API_KEY' }, { status: 500 });

    const parts = [{ text: prompt }];
    for (const url of refs) {
      const r = await fetch(url);
      if (!r.ok) continue;
      const buf = new Uint8Array(await r.arrayBuffer());
      let binary = '';
      for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
      parts.push({ inline_data: { mime_type: r.headers.get('content-type') || 'image/png', data: btoa(binary) } });
    }

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent', {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    });
    const data = await res.json();
    if (!res.ok) {
      return Response.json({ error: data?.error?.message || 'Error de Gemini' }, { status: res.status });
    }
    const outParts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = outParts.find((p) => p?.inlineData?.data || p?.inline_data?.data);
    const b64 = imgPart?.inlineData?.data || imgPart?.inline_data?.data;
    if (!b64) return Response.json({ error: 'Nano Banana no devolvió imagen' }, { status: 502 });

    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const file = new File([bytes], 'gemini_art.png', { type: 'image/png' });
    const uploaded = await base44.integrations.Core.UploadFile({ file });
    return Response.json({ url: uploaded?.file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}