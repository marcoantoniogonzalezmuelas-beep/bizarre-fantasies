// Ajuste de stats al ROL del héroe (CC / AD / HE).
//
// La IA a veces devuelve stats que no respetan el rol (un CC con el HE más
// alto, por ejemplo). Aquí se corrige de forma determinista: el stat primario
// del rol queda como el MÁS ALTO y los secundarios al menos 2 puntos por
// debajo, conservando los valores generados cuando ya son coherentes.

const KEY = { CC: 'cc', AD: 'ad', HE: 'he' };

function fix(stats, type, prefix = '') {
  const primary = KEY[type];
  if (!primary) return stats;
  const k = (s) => `${prefix}${s}`;
  const val = (s) => Number(stats[k(s)]);
  const others = ['cc', 'ad', 'he'].filter((s) => s !== primary);
  const nums = ['cc', 'ad', 'he'].map(val).filter((n) => !isNaN(n) && n > 0);
  if (!nums.length) return stats;
  const top = Math.max(...nums);
  const out = { ...stats };
  // El primario iguala al mejor valor generado (o lo sube si venía flojo).
  out[k(primary)] = Math.max(isNaN(val(primary)) ? 0 : val(primary), top);
  // Los secundarios bajan a 2 puntos por debajo del primario como máximo.
  const cap = Math.max(1, out[k(primary)] - 2);
  others.forEach((s) => {
    const v = val(s);
    if (!isNaN(v) && v > cap) out[k(s)] = cap;
  });
  return out;
}

// Aplica el ajuste a la versión normal y a la élite de la carta.
export function balanceHeroStats(data, type) {
  return fix(fix(data, type), type, 'elite_');
}