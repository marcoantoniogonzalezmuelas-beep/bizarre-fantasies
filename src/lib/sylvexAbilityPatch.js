// Sylvex — "Mutación" (habilidad normal): +4 a TODOS sus stats este combate.
//
// El motor del juego trata a Sylvex con la mecánica genérica "self-buff", que
// daba +6 (y +9 en élite), no los +4 que dice su carta. Este parche resuelve la
// habilidad normal de Sylvex con el valor correcto (+4 a CC, AD, HE y VEL) y
// deja intacta la versión élite y el resto de héroes.
export const SYLVEX_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfSylvexPatch) return;
  window.__bfSylvexPatch = true;

  var BONUS = 4;

  function isSylvexNormal(h){
    if(!h || h.eliteMode) return false;
    var id = String(h.cardId || h.card_id || h.id || '').replace(/_\\d{6,}$/, '');
    return id === 'syx';
  }

  function hook(){
    if(window.__bfSylvexHooked || typeof window.useAbility !== 'function') return false;
    window.__bfSylvexHooked = true;
    var orig = window.useAbility;
    window.useAbility = function(side, hero, done){
      if(!isSylvexNormal(hero)) return orig.apply(this, arguments);
      try{
        (hero._mods = hero._mods || []).push({ cc:BONUS, ad:BONUS, he:BONUS, vel:BONUS, turns:99 });
        if(typeof pushFx === 'function') pushFx({ k:'status', side:side, id:hero.id, txt:'\\u25b2' });
        if(typeof pushLog === 'function') pushLog('lg', hero.name + ' \\u2014 Mutaci\\u00f3n: +' + BONUS + ' a todos sus stats.');
        hero.abilityUsed = true;
        if(typeof window.__bfPlayAbilityAnim === 'function') window.__bfPlayAbilityAnim(side, hero);
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
        var complete = typeof done === 'function' ? done : function(){ if(typeof finishAct === 'function') finishAct(); };
        setTimeout(complete, 420);
        return;
      }catch(e){}
      return orig.apply(this, arguments);
    };
    return true;
  }

  var tries = 0, t = setInterval(function(){
    if(hook() || tries++ > 160) clearInterval(t);
  }, 150);
})();
</script>
`;