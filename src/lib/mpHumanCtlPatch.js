// Parche inyectado en el iframe: hace que el HOST reconozca al cliente
// remoto (side 'o') como un jugador humano en partidas online.
//
// PROBLEMA: la función nativa humanCtl(side) devuelve:
//   - host:  side === 'p'  (solo el host es humano)
//   - client: side === NET.mySide
// En multiplayer online, cuando el host procesa la habilidad del cliente
// (side 'o'), humanCtl('o') devuelve FALSE en el host → todos los parches
// de habilidad (nativo + abilityImplPatch, fastAbilityPatch, etc.) saltan
// pendTarget y auto-seleccionan el objetivo → el cliente JAMÁS puede elegir
// objetivo. Además, al no haber pendTarget, no hay snap con B.pending → el
// cliente no ve la interfaz de selección y la partida se "atasca" esperando.
//
// SOLUCIÓN: envolver humanCtl para que, en el host de una partida online,
// humanCtl('o') devuelva true. Así el host llama pendTarget → envía snap con
// B.pending → el cliente ve la UI de selección → el cliente elige objetivo →
// sendIntent('target') → el host aplica la habilidad con ese objetivo.
//
// Esto arregla de golpe:
//  1. Target no funciona para el cliente → ahora pendTarget se llama → el
//     cliente elige.
//  2. Delay del cliente → el host procesa la habilidad en cuanto recibe el
//     intent; no hay aplicación local en el cliente que el relay pise.
//  3. Panel de acciones no se recoge → el host aplica → finishAct →
//     netSync → el cliente recibe el snap con el nuevo turno.
export const MP_HUMAN_CTL_PATCH = `
<script>
(function(){
  if (window.__bfMpHumanCtl) return;
  window.__bfMpHumanCtl = true;

  function isOnline(){
    try { return typeof NET !== 'undefined' && NET && (NET.role === 'host' || NET.role === 'client'); }
    catch(e) { return false; }
  }

  function install() {
    if (typeof window.humanCtl !== 'function' || window.humanCtl.__bfMpHc) return false;
    var orig = window.humanCtl;
    window.humanCtl = function(side) {
      // En el host de una partida online, el lado 'o' (cliente remoto) es
      // un jugador humano, no la IA. Sin esto, el host auto-selecciona el
      // objetivo de las habilidades del cliente en vez de dejar que el
      // cliente lo elija.
      if (isOnline() && typeof NET !== 'undefined' && NET.role === 'host' && side === 'o') {
        return true;
      }
      return orig.apply(this, arguments);
    };
    window.humanCtl.__bfMpHc = 1;
    return true;
  }

  var tries = 0;
  var iv = setInterval(function() {
    if (install() || tries++ > 200) clearInterval(iv);
  }, 100);
})();
</script>
`;