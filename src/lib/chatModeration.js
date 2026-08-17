const BLOCKED_WORDS = new Set([
  'cono', 'polla', 'picha', 'joder', 'jodido', 'jodida', 'puta', 'puto', 'putas', 'putos',
  'mierda', 'cabron', 'cabrona', 'cabrones', 'gilipollas', 'follar', 'follada', 'follador',
  'zorra', 'zorron', 'maricon', 'marica', 'mariconazo', 'verga', 'chocho', 'cipote', 'pene',
  'culo', 'culos', 'tetas', 'cojones', 'cojon', 'subnormal', 'mongolo', 'mongola', 'retrasado',
  'retrasada', 'pendejo', 'pendeja', 'concha', 'hijoputa', 'hijaputa', 'malfollada',
  'malfollado', 'nazi', 'hitler', 'fuck', 'fucker', 'fucking', 'shit', 'bitch', 'cunt',
  'dick', 'pussy', 'asshole', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'porno',
  'pornografia', 'sexo', 'sexual', 'desnudo', 'desnuda', 'desnudos', 'desnudas', 'nude', 'nudes',
  'blowjob', 'handjob', 'sexting', 'violacion', 'violar', 'pedofilo', 'pedofila', 'incesto'
]);

const BLOCKED_COMPACT = [
  'hijodeputa', 'hijadeputa', 'conchatumadre', 'pichabrava', 'malfollada', 'malfollado'
];

function normalize(value) {
  let text = String(value || '').toLowerCase();
  try { text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { /* noop */ }
  return text
    .replace(/ñ/g, 'n')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4|@/g, 'a')
    .replace(/5|\$/g, 's')
    .replace(/7/g, 't');
}

export function isChatMessageBlocked(value) {
  const normalized = normalize(value);
  const words = normalized.split(/[^a-z]+/).filter(Boolean);
  if (words.some((word) => BLOCKED_WORDS.has(word) || BLOCKED_WORDS.has(word.replace(/(.)\1{2,}/g, '$1')))) return true;
  const compact = normalized.replace(/[^a-z]/g, '');
  return BLOCKED_COMPACT.some((phrase) => compact.includes(phrase));
}