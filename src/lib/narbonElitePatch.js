// Parche inyectado en el iframe: implementa la habilidad élite de Narbón
// ("Narbonizar"): paraliza a los 3 héroes del rival durante 2 turnos.
// Se inyecta desde Home.jsx igual que el resto de parches visuales.
export const NARBON_ELITE_PATCH = `
<script>
(function(){
  if(window.__bfNarbonElitePatch) return;
  window.__bfNarbonElitePatch = true;

  function patchNarbonElite(){
    if(typeof window.useAbility !== 'function' || typeof G === 'undefined') return false;
    if(window.__bfNarbonEliteHooked) return true;
    window.__bfNarbonEliteHooked = true;
    var originalUseAbility = window.useAbility;
    window.useAbility = function(side, hero, done){
      if(hero && hero.id === 'nar' && hero.eliteMode && !hero.abilityUsed){
        // La cinemática de Narbón la gestiona epicAbilityFxPatch vía escaneo
        // de abilityUsed, pero también la disparamos aquí para feedback
        // inmediato en el host (igual que los demás héroes épicos).
        try{ if(typeof window.__bfPlayEpicCine==='function') window.__bfPlayEpicCine(side,hero); }catch(e){}
        var foeSide = side === 'p' ? 'o' : 'p';
        var foes = typeof living === 'function' ? living(foeSide) : (G.team[foeSide] || []).filter(function(h){return h&&h.alive;});
        foes.forEach(function(t){
          t.para = Math.max(t.para || 0, 2);
          if(typeof pushFx === 'function') pushFx({k:'status', side: foeSide, id: t.id, txt:'⚡'});
        });
        hero.abilityUsed = true;
        if(typeof pushLog === 'function') pushLog('lg', hero.name + ' paraliza a todos los héroes rivales durante 2 turnos.');
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
        var complete = typeof done === 'function' ? done : function(){ if(typeof finishAct === 'function') finishAct(); };
        setTimeout(complete, 500);
        return;
      }
      return originalUseAbility.apply(this, arguments);
    };
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    if(patchNarbonElite() || tries++ > 100) clearInterval(timer);
  }, 150);
  patchNarbonElite();
})();
</script>
`;