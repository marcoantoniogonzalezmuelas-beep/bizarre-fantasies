// Sanea datos que el jugador controla antes de guardarlos o reenviarlos a otros.
// No altera comillas ni '&' (hay nicks legítimos con ellos): el escape al pintar
// lo hace el cliente. Aquí se quitan lo que no tiene uso legítimo en un nick:
// '<' '>', caracteres de control y los que invierten el sentido del texto (bidi).
export function cleanNick(v: unknown, max = 28): string {
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u001f\u007f<>\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .trim()
    .slice(0, max);
}

// Solo https:// o una ruta relativa, sin espacios, comillas, <, > ni contrabarras.
export function cleanAvatarUrl(v: unknown): string {
  const s = String(v == null ? '' : v).trim().slice(0, 600);
  if (/^https:\/\/[^\s"'<>`\\]+$/i.test(s)) return s;
  if (/^\/(?!\/)[^\s"'<>`\\]*$/.test(s)) return s;
  return '';
}

// Texto libre (chat, nombres de clan, etc.): sin caracteres de control ni de inversión
// de texto, sin '<' ni '>', espacios colapsados y con longitud máxima.
export function cleanText(v: unknown, max = 200): string {
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f<>\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, max);
}
