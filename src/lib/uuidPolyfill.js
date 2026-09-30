// crypto.randomUUID no existe en Safari < 15.4 (iPhone/iPad con iOS <= 15.3).
// El multijugador lo usa (cola de salida del relay, id de partida, canal en
// tiempo real), así que sin esto fallaba al enviar el primer mensaje.
// Dos formas: installUuidPolyfill() para la página padre (React) y
// UUID_POLYFILL, un <script> para inyectar PRIMERO en el iframe del juego
// (su objeto crypto es distinto del de la página padre).
export function installUuidPolyfill(w) {
  try {
    const c = (w || window).crypto;
    if (!c || typeof c.randomUUID === 'function' || typeof c.getRandomValues !== 'function') return;
    c.randomUUID = function () {
      const b = new Uint8Array(16);
      c.getRandomValues(b);
      b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
      const h = Array.prototype.map.call(b, (x) => (x + 256).toString(16).slice(1));
      return h.slice(0, 4).join('') + '-' + h.slice(4, 6).join('') + '-' + h.slice(6, 8).join('') + '-' + h.slice(8, 10).join('') + '-' + h.slice(10).join('');
    };
  } catch (e) { /* sin crypto: no hay nada que hacer */ }
}

export const UUID_POLYFILL = `
<script>
(function(){try{var c=window.crypto;if(!c||typeof c.randomUUID==='function'||typeof c.getRandomValues!=='function')return;
c.randomUUID=function(){var b=new Uint8Array(16);c.getRandomValues(b);b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;
var h=Array.prototype.map.call(b,function(x){return (x+256).toString(16).slice(1);});
return h.slice(0,4).join('')+'-'+h.slice(4,6).join('')+'-'+h.slice(6,8).join('')+'-'+h.slice(8,10).join('')+'-'+h.slice(10).join('');};}catch(e){}})();
</script>
`;
