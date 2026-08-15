// Parche SOLO móvil/tablet: al actuar un héroe en batalla, la vista sube al
// borde SUPERIOR de la pantalla para que se vea todo el campo de batalla.
//
// NO cambia el nivel de zoom: se respeta el acercamiento/alejamiento que el
// jugador haya puesto con el pellizco; solo se corrige el desplazamiento
// vertical (y el scroll) para que nada quede fuera por arriba.
export const BATTLE_FOCUS_ZOOM_PATCH = `
<script>
(function(){
  if(window.__bfFocusZoom)return;
  window.__bfFocusZoom=true;

  var MANUAL_PAUSE=2500; // ms de respeto tras un pellizco manual
  var lastManual=0,lastTop=0;

  document.addEventListener('touchstart',function(e){
    if(e.touches&&e.touches.length>=2)lastManual=Date.now();
  },{capture:true,passive:true});

  function inBattle(){
    var a=document.querySelector('.screen.active');
    return !!(a&&a.id==='s-battle');
  }

  function toTop(){
    if(typeof window.__bfPinchTop!=='function')return;
    if(!inBattle())return;
    var now=Date.now();
    if(now-lastManual<MANUAL_PAUSE)return;
    if(window.__bfPinchBusy&&window.__bfPinchBusy())return;
    if(document.querySelector('#modalRoot .mo'))return; // no mover con un modal abierto
    if(now-lastTop<800)return;
    lastTop=now;
    window.__bfPinchTop(380);
  }
  window.__bfBattleTop=toTop;

  // Turno activo: cada vez que le toca a otro héroe, la vista sube arriba.
  var lastTurn='';
  function scanTurn(){
    try{
      if(typeof B==='undefined'||!B||!B.current)return;
      var k=B.current.side+'_'+B.current.id;
      if(k===lastTurn)return;
      lastTurn=k;
      toTop();
    }catch(e){}
  }

  // Efectos (ataques, hechizos, habilidades): asegura que la acción se vea.
  function hookFx(){
    if(typeof window.flushFx!=='function'||window.flushFx.__bfFocusZoom)return false;
    var orig=window.flushFx;
    window.flushFx=function(list){
      try{ if(list&&list.length)toTop(); }catch(e){}
      return orig.apply(this,arguments);
    };
    window.flushFx.__bfFocusZoom=1;
    return true;
  }

  setInterval(scanTurn,250);
  var tries=0,t=setInterval(function(){ if(hookFx()||tries++>200)clearInterval(t); },200);
})();
</script>
`;