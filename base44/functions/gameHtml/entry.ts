Deno.serve(async (req) => {
  try {
    const SRC = 'https://media.base44.com/files/public/6a39c9aee54efe3a86d6d69a/2b855b7c8_bizarre_fantasies_v5-4.html';
    const upstream = await fetch(SRC);
    const html = await upstream.text();
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return new Response('<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;color:#fff;background:#0e0a16;padding:24px">Error cargando el juego: ' + (error?.message || error) + '</body>', {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
});