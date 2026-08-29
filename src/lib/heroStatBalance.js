// Ajuste de stats al ROL del héroe (CC / AD / HE).
//
// La IA a veces devuelve stats que no respetan el rol (un CC con el HE más
// alto, por ejemplo). Aquí se corrige de forma determinista: el stat primario
// del rol queda como el MÁS ALTO y los secundarios al menos 2 puntos por
// debajo, conservando los valores generados cuando ya son coherentes.

const KEY = { CC: 'cc', AD: 'ad', HE: 'he' };

// Suelo del stat primario por rol (percentil 25 de los héroes REALES en la BD).
// Garantiza que un héroe normal nunca salga con el primario ridículamente bajo
// (ej. HE=8) aunque la IA se equivoque de rango. Cotidianos y Bizarros se
// excluyen: sus stats son intencionadamente bajos / impredecibles.
const FLOOR = { CC: 14, AD: 13, HE: 14 };
const LOW_CLANS = { Cotidianos: 1, Bizarros: 1 };

function fix(stats, type, prefix = '', clan) {
  const primary = KEY[type];
  if (!primary) return stats;
  const k = (s) => `${prefix}${s}`;
  const val = (s) => Number(stats[k(s)]);
  const others = ['cc', 'ad', 'he'].filter((s) => s !== primary);
  const nums = ['cc', 'ad', 'he'].map(val).filter((n) => !isNaN(n) && n > 0);
  if (!nums.length) return stats;
  const top = Math.max(...nums);
  const out = { ...stats };
  const floor = clan && LOW_CLANS[clan] ? 0 : (FLOOR[type] || 0);
  // El primario iguala al mejor valor generado y nunca baja del suelo del rol.
  out[k(primary)] = Math.max(isNaN(val(primary)) ? 0 : val(primary), top, floor);
  // Los secundarios bajan a 2 puntos por debajo del primario como máximo.
  const cap = Math.max(1, out[k(primary)] - 2);
  others.forEach((s) => {
    const v = val(s);
    if (!isNaN(v) && v > cap) out[k(s)] = cap;
  });
  return out;
}

// Aplica el ajuste a la versión normal y a la élite de la carta.
export function balanceHeroStats(data, type, clan) {
  return fix(fix(data, type, '', clan), type, 'elite_', clan);
}