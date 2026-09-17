// Bermellus normal: the remote player chooses; humanCtl deliberately excludes
// the guest on the authoritative host, but that must not turn this into AI.
export const BERMELLUS_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfBermellusAbility) return;
  window.__bfBermellusAbility = true;
  function matches(h){
    return h && !h.eliteMode && String(h.cardId || h.card_id || h.id || '').replace(/_\\d{6,}$/, '') === 'tor';
  }
  function remoteTurn(side){ return typeof NET !== 'undefined' && NET.role === 'host' && side === 'o'; }
  function install(){
    if(typeof window.useAbility !== 'function') return false;
    var original = window.useAbility;
    window.useAbility = function(side, h, done){
      if(!matches(h)) return original.apply(this, arguments);
      // Only the authority applies effects. The client's normal action button
      // already sends an ability intent and receives the pending target in a snap.
      if(typeof NET !== 'undefined' && NET.role === 'client') return;
      function apply(target){
        if(!target || !target.alive || living(side).indexOf(target) < 0) return;
        target.shield = (target.shield || 0) + 14;
        h.abilityUsed = true;
        pushFx({k:'shieldup', toSide:side, toId:target.id});
        pushLog('lg', h.name + ' escuda 14 a ' + target.name + '.');
        renderBattle(); netSync('s-battle');
        if(typeof done === 'function') done(); else finishAct();
      }
      if(humanCtl(side) || remoteTurn(side)) pendTarget('Objetivo de ' + h.ability, side, apply);
      else apply(living(side).slice().sort(function(a,b){ return a.hp/a.maxHp - b.hp/b.maxHp; })[0]);
    };
    return true;
  }
  // A host's portrait click must not make the guest's choice. Network target
  // intents call pickTarget directly and continue through the native validator.
  document.addEventListener('click', function(e){
    if(typeof B === 'undefined' || !B || !B.pending || !B.current || !remoteTurn(B.current.side)) return;
    if(!matches(getHero(B.current.side, B.current.id))) return;
    if(e.target.closest && e.target.closest('.bhero')) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  var tries = 0, timer = setInterval(function(){ if(install() || ++tries > 160) clearInterval(timer); }, 150);
})();
</script>
`;