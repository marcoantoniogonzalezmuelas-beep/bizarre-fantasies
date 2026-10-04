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

  // MANÁ AL VOLVER A LA VIDA: un héroe que resucita o renace élite, por la vía que sea, vuelve con el maná que tenía
  // al caer (antes el motor se lo rellenaba entero). Al caer se guarda; renacer élite lo conserva; resucitar
  // (reviveHero o cualquier efecto que lo devuelva a la vida) lo repone en cuanto se pinta la batalla.
  function keepMana(){
    if(typeof window.handleDeath==='function'&&!window.handleDeath.__bfKeepMana){
      var hd=window.handleDeath;
      var w1=function(t){
        var m=t?Number(t.mana)||0:0;
        var r=hd.apply(this,arguments);
        try{ if(t){ if(t.alive)t.mana=Math.min(Number(t.maxMana)||m,m); else t._bfManaAtDeath=m; } }catch(e){}
        return r;
      };
      w1.__bfKeepMana=1;window.handleDeath=w1;
    }
    if(typeof window.reviveHero==='function'&&!window.reviveHero.__bfKeepMana){
      var rv=window.reviveHero;
      var w2=function(t){
        var r=rv.apply(this,arguments);
        try{ if(t&&t._bfManaAtDeath!=null){ t.mana=Math.min(Number(t.maxMana)||0,t._bfManaAtDeath); t._bfManaAtDeath=null; } }catch(e){}
        return r;
      };
      w2.__bfKeepMana=1;window.reviveHero=w2;
    }
    if(typeof window.renderBattle==='function'&&!window.renderBattle.__bfKeepMana){
      var rb=window.renderBattle;
      var w3=function(){
        try{
          if(typeof G!=='undefined'&&G&&G.team)['p','o'].forEach(function(sd){ (G.team[sd]||[]).forEach(function(h){
            if(h&&h.alive&&h._bfManaAtDeath!=null){ h.mana=Math.min(Number(h.maxMana)||0,h._bfManaAtDeath); h._bfManaAtDeath=null; }
          }); });
        }catch(e){}
        return rb.apply(this,arguments);
      };
      w3.__bfKeepMana=1;window.renderBattle=w3;
    }
  }
  keepMana();
  setInterval(keepMana,500);
})();
</script>
`;
