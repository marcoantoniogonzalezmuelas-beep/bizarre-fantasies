// SECUENCIA FINAL EN ORDEN: 1) golpe final ("acción definitiva") sobre el TABLERO de batalla oscurecido;
// 2) al terminar, la animación de victoria/derrota con los héroes; 3) al terminar esa, la PANTALLA FINAL con los
// botones. Antes la pantalla final (con sus botones) aparecía nada más acabar la partida y se veía de fondo
// durante el golpe final. Mientras dura la secuencia, la pantalla de resultado sigue ACTIVA (la animación final la
// necesita) pero OCULTA, y se ve el tablero detrás. Tope de seguridad: 30 s.
export const END_SEQUENCE_PATCH = `
<script>
(function(){
  if(window.__bfEndSequence)return;
  window.__bfEndSequence=true;
  var css=document.createElement('style');
  css.textContent='body.bf-end-seq #s-result{display:none!important}'
    +'body.bf-end-seq #s-battle{display:block!important;filter:brightness(.42) saturate(.75);pointer-events:none}'
    +'body.bf-end-seq #bf-recap{background:rgba(4,3,8,.68)!important}';
  document.head.appendChild(css);
  var wasActive=false,on=false,startedAt=0,sawCine=false,recapGoneAt=0;
  function stop(){ on=false; document.body.classList.remove('bf-end-seq'); }
  function tick(){
    var res=document.getElementById('s-result'),active=!!(res&&res.classList.contains('active'));
    if(!active){ wasActive=false; if(on)stop(); return; }
    if(!wasActive){ wasActive=true; on=true; startedAt=Date.now(); sawCine=false; recapGoneAt=0; document.body.classList.add('bf-end-seq'); }
    if(!on)return;
    var recap=!!document.getElementById('bf-recap')||(typeof window.__bfRecapPending==='function'&&window.__bfRecapPending());
    var cine=!!document.getElementById('bf-end-cine');
    if(cine)sawCine=true;
    if(!recap&&!recapGoneAt)recapGoneAt=Date.now();
    var now=Date.now();
    if((sawCine&&!cine)||(window.__bfEndCineDoneAt&&window.__bfEndCineDoneAt>=startedAt)||(!sawCine&&recapGoneAt&&now-recapGoneAt>12000)||now-startedAt>30000)stop();
  }
  setInterval(tick,150);
  window.__bfEndSequenceOn=function(){ return on; };
})();
</script>
`;
