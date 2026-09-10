import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Traduce un texto de noticia del cartel de Actualidad al inglés usando
// InvokeLLM. El cliente (backoffice de noticias) envía el texto en español
// y recibe la traducción en inglés. Solo administradores.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const text = body?.text;
    if (!text) return Response.json({ error: 'Falta el texto' }, { status: 400 });

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a professional English translator for the dark-fantasy card game "Bizarre Fantasies".
Translate the following Spanish news headline into natural, punchy English game-marketing copy.
Preserve proper nouns (hero/card names stay as-is). Return ONLY the English translation, nothing else.

${text}`,
    });
    const en = (typeof response === 'string' ? response : (response?.translation || response?.text || '')).trim();
    return Response.json({ en });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}