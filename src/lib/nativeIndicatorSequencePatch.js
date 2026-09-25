// Native combat captions live inside transient portrait FX. Preserve only the
// caption, not the projectile/impact or gameplay callback, in the shared queue.
export const NATIVE_INDICATOR_SEQUENCE_PATCH = `
<script>
(function(){
  if(window.__bfNativeIndicators)return;
  window.__bfNativeIndicators=true;
  var selector='.bf-fx-float,.fx-status,.fx-word';
  function capture(node){
    if(node.dataset.bfIndicator==='1'||!node.isConnected)return;
    if(node.closest('#bf-abil-anim,#bf-spec-cine,#bf-epic-cine,#bf-kill-ov'))return;
    var card=node.closest('.bhero'),anchor=card&&card.id;
    var rect=node.getBoundingClientRect(),copy=node.cloneNode(true);
    copy.dataset.bfIndicator='1';
    node.remove();
    window.__bfQueueIndicator(function(){
      var current=anchor&&document.getElementById(anchor);
      var r=current?current.getBoundingClientRect():rect;
      copy.style.setProperty('position','fixed','important');
      copy.style.setProperty('left',(r.left+r.width/2)+'px','important');
      copy.style.setProperty('top',(r.top+r.height*(current?0.3:0.5))+'px','important');
      copy.style.zIndex='100006';copy.style.pointerEvents='none';
      window.__bfAppend(copy);
      return [copy];
    },1800);
  }
  new MutationObserver(function(records){
    records.forEach(function(record){record.addedNodes.forEach(function(node){
      if(node.nodeType!==1)return;
      if(node.matches(selector))capture(node);
      node.querySelectorAll(selector).forEach(capture);
    });});
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>
`;