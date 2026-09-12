// Credenciales del servidor TURN para las partidas online.
//
// PUNTO CRÍTICO: en operadores con CGNAT / NAT simétrico (Vodafone, Orange,
// datos móviles en general) la conexión directa entre jugadores es IMPOSIBLE:
// el tráfico TIENE que pasar por un servidor TURN (relay). Por eso esta función
// nunca debe devolver un error: si no hay relay, la partida no arranca.
//
// - Timeout de 5s contra Metered (antes podía quedarse colgada indefinidamente).
// - Caché en memoria (5 min) para no agotar la cuota de la API con cada carga.
// - Respaldo público (openrelay) si Metered falla o agota su cuota mensual:
//   siempre se devuelve al menos un relay TCP/443 + TLS/443, que son los que
//   atraviesan cortafuegos y CGNAT de operadores móviles.

// Relay público de respaldo (proyecto OpenRelay de Metered, sin clave).
// Incluye TCP/443 y TLS/443: los puertos que ningún operador bloquea.
const FALLBACK_ICE = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
  { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turns:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443?transport=udp", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:numb.viagenie.ca:80", username: "webrtc@live.com", credential: "muazkh" },
  { urls: "turn:numb.viagenie.ca:3478", username: "webrtc@live.com", credential: "muazkh" },
  { urls: "turns:numb.viagenie.ca:443", username: "webrtc@live.com", credential: "muazkh" },
];

let cached: unknown[] | null = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

// ¿La lista trae al menos un relay (turn:/turns:)? Sin relay no hay partida
// posible en móvil, así que en ese caso se completa con el respaldo.
function hasRelay(list: unknown[]) {
  return (list || []).some((s: any) => {
    const u = Array.isArray(s?.urls) ? s.urls.join(" ") : String(s?.urls || "");
    return /^turns?:/i.test(u);
  });
}

async function fetchMetered() {
  const appName = Deno.env.get("METERED_TURN_APP_NAME");
  const apiKey = Deno.env.get("METERED_TURN_API_KEY");
  if (!appName || !apiKey) return null;

  const url = `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    const iceServers = await response.json();
    if (!Array.isArray(iceServers) || !iceServers.length) return null;
    return iceServers;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async () => {
  if (cached && Date.now() - cachedAt < CACHE_TTL) {
    return Response.json({ iceServers: cached, cached: true });
  }

  const metered = await fetchMetered();
  // Metered + respaldo siempre juntos: si el relay de Metered agota su cuota a
  // mitad de mes, el navegador sigue teniendo un relay válido que probar.
  const iceServers = metered ? [...metered, ...FALLBACK_ICE] : FALLBACK_ICE;
  // Solo se cachea una respuesta con relay real: si algo salió mal y no hay
  // relay, se reintenta en la siguiente carga en vez de servir 5 min sin TURN.
  const ok = hasRelay(iceServers);

  if (ok) { cached = iceServers; cachedAt = Date.now(); }
  return Response.json({ iceServers, source: metered ? "metered" : "fallback" });
});