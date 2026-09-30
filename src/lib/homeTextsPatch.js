// Parche inyectado en el iframe: en la PORTADA renombra el botón
// "Cómo se juega" a "Reglas" y actualiza el texto de bienvenida de Punkito.
// El texto (ES/EN) lo configura el admin desde la entidad HomeText; si no hay,
// usa los valores por defecto.
const DEFAULT_ES = 'Soy <b>Punkito</b>. Pulsa <b>Aprende a jugar</b> para una partida guiada con tips de dos IAs y <b>Reglas</b> para conocer más el funcionamiento del juego. Si ya sabes jugar, ¡dale a <b>Comenzar</b>! Espero disfrutes de la experiencia.';
const DEFAULT_EN = 'I\'m <b>Punkito</b>. Press <b>Learn to Play</b> for a guided match between two AIs with tips, and <b>Rules</b> to learn more about how the game works. If you already know how to play, hit <b>Begin</b>! I hope you enjoy the experience.';

export function buildHomeTextsPatch(texts) {
  const es = (texts && texts.punkitoEs) || DEFAULT_ES;
  const en = (texts && texts.punkitoEn) || DEFAULT_EN;
  return `
<script>
(function(){
  if(window.__bfHomeTexts)return;
  window.__bfHomeTexts=true;
  var GUIDE_ES = ${JSON.stringify(es)};
  var GUIDE_EN = ${JSON.stringify(en)};

  function apply(){
    var EN=!!window.__bfLangEn;
    var GUIDE = EN ? GUIDE_EN : GUIDE_ES;
    var LBL = EN ? 'Rules' : 'Reglas';
    document.querySelectorAll('#s-title *').forEach(function(el){
      if(el.dataset.bfRules==='1')return;
      for(var i=0;i<el.children.length;i++){ if(el.children[i].tagName!=='BR')return; }
      var t=(el.innerHTML||'').replace(/<br\\s*\\/?>/gi,' ').replace(/\\s+/g,' ').trim();
      if(/^(C[óo]mo se juega|How to play)$/i.test(t)){ el.dataset.bfRules='1'; el.textContent=LBL; }
    });
    var onTitle=!!document.querySelector('#s-title.active');
    var g=document.querySelector('#bf-guide .bf-guide-text');
    if(onTitle&&g&&g.innerHTML!==GUIDE){ g.innerHTML=GUIDE; }
  }
  apply();
  (window.bfDom?window.bfDom.on(apply):new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true}));
})();
</script>
`;
}