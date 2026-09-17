// Decision ownership, distinct from humanCtl (which owns local UI panels).
export const ABILITY_TARGET_POLICY_PATCH = `
<script>
(function(){
  window.bfAbilityHuman = function(side){
    if(typeof G !== 'undefined' && G.demo) return false;
    if(typeof NET !== 'undefined' && NET.role === 'host') return side === 'p' || side === 'o';
    return typeof humanCtl === 'function' && humanCtl(side);
  };
  window.bfChooseAbilityTarget = function(side, label, validSide, cb, opts){
    opts = opts || {};
    var pool = (G.team[validSide] || []).filter(function(h){
      return h && (opts.allowDead ? !h.alive : h.alive) && (!opts.allowedIds || opts.allowedIds.indexOf(h.id) >= 0);
    });
    if(!pool.length){ if(window.bfReleaseAbility) window.bfReleaseAbility(); return; }
    if(window.bfAbilityHuman(side)) return pendTarget(label, validSide, cb, opts);
    pool.sort(function(a,b){ return validSide === side ? a.hp/a.maxHp - b.hp/b.maxHp : a.hp - b.hp; });
    cb(pool[0]);
  };
  window.bfChooseAbilityTargets = function(side, validSide, count, label, cb){
    var selected = [], total = Math.min(count, living(validSide).length);
    function next(){
      var ids = living(validSide).filter(function(h){return selected.indexOf(h) < 0;}).map(function(h){return h.id;});
      if(selected.length >= total || !ids.length) return cb(selected);
      window.bfChooseAbilityTarget(side, label + (total > 1 ? ' (' + (selected.length + 1) + '/' + total + ')' : ''), validSide, function(h){ selected.push(h); next(); }, {allowedIds:ids});
    }
    next();
  };
  window.bfValidTargetIntent = function(msg){
    return !!(B && !B.over && B.current && B.current.side === 'o' && B.pending && msg.requestId === B.pending.requestId);
  };
  // The host may observe, never choose or cancel the guest's pending target.
  document.addEventListener('click', function(e){
    if(typeof NET === 'undefined' || NET.role !== 'host' || typeof B === 'undefined' || !B || !B.pending || !B.current || B.current.side !== 'o') return;
    if(e.target.closest && e.target.closest('.bhero,[onclick*="cancelPending"]')) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
})();
</script>
`;