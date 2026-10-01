// Parche inyectado en el iframe: MEMORIA DE HABILIDAD USADA tras renacer.
//
// El motor tiene un hueco: al usar la habilidad normal se marca abilityUsed,
// pero cuando el héroe muere y renace ÉLITE ese flag se resetea (a propósito,
// para conceder la habilidad élite). Si luego el héroe vuelve a morir y es
// revivido (Pluma Fénix / Ave Fénix), reviveHero lo devuelve a su forma NORMAL
// sin restaurar el flag: la habilidad normal —ya gastada— vuelve a aparecer
// como disponible en el panel en vez de "Usada".
//
// Solución: se recuerda por separado si el héroe gastó su habilidad en forma
// normal (h._bfAbUsedNorm) y en forma élite (h._bfAbUsedElite). Al revivir,
// se restaura abilityUsed según la forma a la que vuelve. Los flags viajan en
// G.team dentro del snapshot online, así que funciona también en multijugador.
export const ABILITY_USED_MEMORY_PATCH = `
<script>
(function(){
  if(window.__bfAbUsedMemory)return;
  window.__bfAbUsedMemory=true;

  // Escaneo: cuando abilityUsed pasa a true, se anota en qué forma se gastó.
  function scan(){
    if(typeof G==='undefined'||!G||!G.team)return;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.abilityUsed)return;
        if(h.eliteMode)h._bfAbUsedElite=true;
        else h._bfAbUsedNorm=true;
      });
    });
  }

  // reviveHero devuelve al héroe a su forma normal: si la habilidad normal ya
  // se gastó antes, se vuelve a marcar como usada (el panel mostrará "Usada").
  function hookRevive(){
    if(typeof window.reviveHero!=='function'||window.reviveHero.__bfAbMem)return false;
    var orig=window.reviveHero;
    window.reviveHero=function(t,frac){
      var r=orig.apply(this,arguments);
      try{
        if(t){
          var restored=false;
          if(!t.eliteMode&&t._bfAbUsedNorm){t.abilityUsed=true;restored=true;}
          if(t.eliteMode&&t._bfAbUsedElite){t.abilityUsed=true;restored=true;}
          // Marca de RESTAURACIÓN (viaja en el snapshot): el escáner de animaciones no debe tomar este
          // false->true por una activación (Batu lanzaba su habilidad al renacer con la Pluma Fénix).
          if(restored)t._bfAbRestoredAt=String(Date.now())+':'+Math.random().toString(36).slice(2,6);
        }
      }catch(e){}
      return r;
    };
    window.reviveHero.__bfAbMem=1;
    return true;
  }

  var tries=0,iv=setInterval(function(){
    scan();
    if(!window.__bfAbMemHooked){if(hookRevive())window.__bfAbMemHooked=1;}
    if(++tries>4000)clearInterval(iv);
  },150);
  hookRevive();
})();
</script>
`;