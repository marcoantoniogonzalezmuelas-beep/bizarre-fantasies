import { base44 } from '@/api/base44Client';

// Guarda datos de juego a través de la función de servidor `gameRecord` (valida y
// limita lo que se escribe). Lanza un error con .status y .code si se rechaza.
//
// Transición: cuando la función no está disponible (no desplegada todavía, 404/5xx o
// sin red) los llamadores recurren a la escritura directa antigua. Un rechazo explícito
// (400-499 salvo 404: moderación, límite de frecuencia, datos inválidos) NO debe
// reintentarse por el camino antiguo: usa isRejection().
export async function recordGame(kind, payload) {
  try {
    const { data } = await base44.functions.invoke('gameRecord', { kind, ...payload });
    if (!data || !data.ok) { const e = new Error((data && data.error) || 'record_failed'); e.code = data && data.error; throw e; }
    return data;
  } catch (err) {
    const status = err && err.response && err.response.status;
    const code = (err && err.response && err.response.data && err.response.data.error) || err.code || 'record_failed';
    const e = new Error(code); e.status = status; e.code = code;
    throw e;
  }
}

// true = el servidor rechazó el dato a propósito (no sirve reintentar por otro camino).
export const isRejection = (e) => !!(e && e.status && e.status >= 400 && e.status < 500 && e.status !== 404);
