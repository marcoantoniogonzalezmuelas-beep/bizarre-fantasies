// Parche inyectado en el iframe: redirige el botón nativo "Reglas" de la
// portada a una pantalla aparte de la app (/reglas) en vez de abrir el modal
// reducido dentro del juego. Mismo patrón que rankingButtonPatch (Top Ranking).
export const RULES_BUTTON_PATCH = `
<script>
(function(){
  if(window.__bfRulesBtnPatch)return;
  window.__bfRulesBtnPatch=true;

  var NAV_TO='/reglas';
  function isRulesBtn(btn){
    if(!btn)return false;
    var txt=(btn.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase();
    if(!txt)return false;
    if(/reglas/.test(txt)||/^rules$/.test(txt))return true;
    if(/c[óo]mo se juega/.test(txt)||/how to play/.test(txt))return true;
    return false;
  }

  function install(){
    var links=document.querySelector('#s-title .title-links');
    if(!links)return;
    var done=false;
    links.querySelectorAll('button,.btn,[onclick]').forEach(function(btn){
      if(done||btn.id==='bf-ranking-btn')return;
      if(!isRulesBtn(btn))return;
      if(btn.dataset.bfRulesNav==='1')return;
      btn.dataset.bfRulesNav='1';
      // Clona sin listeners (addEventListener) y sobreescribe el onclick
      // inline para que NO abra el modal nativo, solo navegue a la app.
      var clone=btn.cloneNode(true);
      clone.onclick=function(){try{window.parent.postMessage({bfNavigate:NAV_TO},'*');}catch(e){}};
      clone.removeAttribute('onclick');
      btn.replaceWith(clone);
      done=true;
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>
`;