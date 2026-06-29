import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const text = await Deno.readTextFile('./gameHtml.js');
    return new Response(text.substring(0, 100));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});