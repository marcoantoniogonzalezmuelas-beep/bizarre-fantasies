// Un héroe que MUERE Y RENACE ÉLITE DURANTE SU PROPIA HABILIDAD (el Picotazo del Patito golpea a Juniana y su reflejo
// lo mata; el dado de Doji; la represalia de los patitos...) quedaba con la habilidad ÉLITE gastada: el renacer la
// dejaba disponible, pero al cerrarse la acción normal se marcaba "usada" ya en élite y salía en gris. Aquí, si el
// héroe era normal al empezar la habilidad y es élite al terminarla, su habilidad élite queda disponible.
// (No toca eliteUsed: esa marca dice que ya gastó su renacimiento.) Si quien llama no pasa función de cierre, se
// cierra la acción con finishAct en vez de fallar y dejar el turno colgado.
export const REBIRTH_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfRebirthAbility)return;
  window.__bfRebirthAbility=true;
  function hook(){
    var cur=window.useAbility;
    if(typeof cur!=='function'||cur.__bfRebirthKeep)return;
    var w=function(side,h,done){
      var wasElite=!!(h&&h.eliteMode);
      var close=function(){
        try{
          if(h&&!wasElite&&h.eliteMode&&h.alive){
            h.abilityUsed=false;h._bfAbUsedElite=false;h._bfEliteUsed=false;
            if(typeof renderBattle==='function')renderBattle();
          }
        }catch(e){}
        if(typeof done==='function')return done.apply(this,arguments);
        if(typeof finishAct==='function')finishAct();
      };
      return cur.call(this,side,h,close);
    };
    w.__bfRebirthKeep=1;
    window.useAbility=w;
  }
  hook();
  setInterval(hook,500);
})();
</script>
`;
