// MÓVIL: vibración corta al recibir daño y modo de efectos reducidos
// automático en dispositivos lentos (pocos núcleos o poca memoria).
// Se puede forzar con localStorage.bfLite = '1' (activar) o '0' (desactivar).
export const MOBILE_HAPTICS_LITE_PATCH = `
<script>
(function(){
  if(window.__bfHapticsLite) return;
  window.__bfHapticsLite = true;

  // 1) Vibración al aparecer el número de daño (solo si el navegador la soporta).
  var lastBuzz = 0;
  function buzz(){
    var now = Date.now();
    if(now - lastBuzz < 400 || !navigator.vibrate) return;
    lastBuzz = now;
    try{ navigator.vibrate(60); }catch(e){}
  }
  new MutationObserver(function(list){
    for(var i=0;i<list.length;i++){
      var added = list[i].addedNodes;
      for(var j=0;j<added.length;j++){
        var n = added[j];
        if(n.nodeType===1 && n.classList && n.classList.contains('bf-dmg-pop')){ buzz(); return; }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  // 2) Efectos reducidos en móviles lentos: sin desenfoques ni brillos animados.
  var forced = null;
  try{ forced = localStorage.getItem('bfLite'); }catch(e){}
  var slow = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  if(forced === '1' || (forced !== '0' && slow)){
    var st = document.createElement('style');
    st.textContent = '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'
      + '.bf-rainbow-border,.foil-shine,[class*="foil"]::after{animation:none!important}'
      + '[style*="mix-blend-mode"]{mix-blend-mode:normal!important}';
    document.head.appendChild(st);
  }
})();
</script>
`;