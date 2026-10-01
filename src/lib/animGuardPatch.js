// PUERTA DE ACTIVACIÓN de habilidades (evita animaciones que se lanzan solas).
//
// abilityAnimPatch reproduce la animación de una habilidad cuando ve abilityUsed pasar de false a
// true. Pero ese flag también cambia SIN que nadie active nada:
//   - al renacer ÉLITE el motor lo pone a false; si luego la Pluma Fénix revive al héroe en forma
//     normal, abilityUsedMemoryPatch lo RESTAURA a true (para que el panel diga "Usada") y el escáner
//     lo tomaba por una activación: Batu lanzaba su habilidad normal al renacer;
//   - la primera vez que se ve un héroe (partida reanudada, snapshot del invitado) ya puede venir usado;
//   - en los instantes siguientes a una resurrección el estado del héroe se reescribe entero.
// Esta puerta es una función pura (testeable) con un único punto de decisión.
//   verdict: 'play' | 'idle' | 'awaiting' | 'baseline' | 'restored' | 'quiet'
export const ANIM_GUARD_PATCH = `
<script>
(function(){
  if(window.bfAbilityGate)return;
  window.bfNewAbilityMemo=function(){return {prev:{},known:{},alive:{},quiet:{},restored:{}};};
  window.bfResetAbilityMemo=function(m){for(var k in m){if(Object.prototype.hasOwnProperty.call(m,k)){var o=m[k];for(var x in o)delete o[x];}}};
  window.bfAbilityGate=function(m,key,h,now,awaiting){
    var used=!!h.abilityUsed,alive=h.alive!==false;
    if(!m.known[key]){m.known[key]=1;m.prev[key]=used;m.alive[key]=alive;return 'baseline';}   // 1ª vez que se ve: línea base
    if(m.alive[key]===false&&alive)m.quiet[key]=now+3500;                                       // acaba de renacer / ser revivido
    m.alive[key]=alive;
    var tok=h._bfAbRestoredAt;                                                                   // flag "Usada" restaurado tras revivir
    if(tok&&m.restored[key]!==tok){m.restored[key]=tok;if(used)m.prev[key]=true;return 'restored';}
    if(!used){m.prev[key]=false;return 'idle';}
    if(m.prev[key])return 'idle';
    if(awaiting)return 'awaiting';
    if(now<(m.quiet[key]||0)){m.prev[key]=true;return 'quiet';}
    return 'play';
  };
})();
</script>
`;
