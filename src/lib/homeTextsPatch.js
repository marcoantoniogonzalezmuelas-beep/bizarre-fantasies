// Parche inyectado en el iframe: en la PORTADA renombra el botón
// "Cómo se juega" a "Reglas" y actualiza el texto de bienvenida de Punkito.
export const HOME_TEXTS_PATCH = `
<script>
(function(){
  if(window.__bfHomeTexts)return;
  window.__bfHomeTexts=true;
  var EN=!!window.__bfLangEn;
  var GUIDE=EN
    ? 'I\\'m <b>Punkito</b>. Press <b>Learn to Play</b> for a guided match between two AIs with tips, and <b>Rules</b> to learn more about how the game works. I hope you enjoy the experience.'
    : 'Soy <b>Punkito</b>. Pulsa <b>Aprende a jugar</b> para una partida guiada con tips de dos IAs y <b>Reglas</b> para conocer más el funcionamiento del juego. Espero disfrutes de la experiencia.';
  var LBL=EN?'Rules':'Reglas';

  function apply(){
    document.querySelectorAll('#s-title *').forEach(function(el){
      if(el.dataset.bfRules==='1')return;
      for(var i=0;i<el.children.length;i++){ if(el.children[i].tagName!=='BR')return; }
      var t=(el.innerHTML||'').replace(/<br\\s*\\/?>/gi,' ').replace(/\\s+/g,' ').trim();
      if(/^(C[óo]mo se juega|How to play)$/i.test(t)){ el.dataset.bfRules='1'; el.textContent=LBL; }
    });
    var g=document.querySelector('#bf-guide .bf-guide-text');
    if(g&&g.dataset.bfHome!=='1'){ g.dataset.bfHome='1'; g.innerHTML=GUIDE; }
  }
  apply();
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>
`;