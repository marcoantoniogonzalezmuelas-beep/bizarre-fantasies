// Parche SOLO móvil/tablet: al actuar un héroe en batalla, la vista sube al
// borde SUPERIOR de la pantalla para que se vea todo el campo de batalla.
//
// NO cambia el nivel de zoom: se respeta el acercamiento/alejamiento que el
// jugador haya puesto con el pellizco; solo se corrige el desplazamiento
// vertical (y el scroll) para que nada quede fuera por arriba.
//
// IMPORTANTE: los FX de hechizos/ataques YA NO fuerzan el reencuadre. Antes,
// cada hechizo llamaba a toTop() y eso saltaba el scroll del usuario a ty=0
// aunque hubiera pellizcado para acercarse a la acción: la pantalla se
// "descuadraba" y aparecía una zona negra. Ahora solo se reencuadra al
// CAMBIAR DE TURNO (y solo si el usuario no está pellizcando ni tiene zoom
// manual activo), para que las animaciones de hechizos respeten la posición
// del jugador.
export const BATTLE_FOCUS_ZOOM_PATCH = `
<script>
(function(){
  if(window.__bfFocusZoom)return;
  window.__bfFocusZoom=true;

  var MANUAL_PAUSE=4000; // ms de respeto tras un pellizco manual
  var lastManual=0,lastTop=0;

  document.addEventListener('touchstart',function(e){
    if(e.touches&&e.touches.length>=2)lastManual=Date.now();
  },{capture:true,passive:true});

  function inBattle(){
    var a=document.querySelector('.screen.active');
    return !!(a&&a.id==='s-battle');
  }

  // Solo reencuadra si NO hay zoom manual activo. Si el usuario pellizcó para
  // acercarse (z>1), respetamos su posición y no saltamos el scroll.
  function userHasZoom(){
    try{
      if(typeof window.__bfPinchZ==='function')return window.__bfPinchZ()>1.02;
    }catch(e){}
    return false;
  }

  function toTop(){
    if(typeof window.__bfPinchTop!=='function')return;
    if(!inBattle())return;
    var now=Date.now();
    if(now-lastManual<MANUAL_PAUSE)return;
    if(window.__bfPinchBusy&&window.__bfPinchBusy())return;
    if(userHasZoom())return; // no mover si el usuario tiene zoom manual
    if(document.querySelector('#modalRoot .mo'))return; // no mover con un modal abierto
    if(now-lastTop<800)return;
    lastTop=now;
    window.__bfPinchTop(380);
  }
  window.__bfBattleTop=toTop;

  // Turno activo: cada vez que le toca a otro héroe, la vista sube arriba.
  // Solo si el usuario no tiene zoom manual (respeta su pellizco).
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

  // Los FX (ataques, hechizos, habilidades) YA NO fuerzan toTop: antes esto
  // saltaba el scroll a ty=0 en cada hechizo y descuadraba la pantalla del
  // usuario que había pellizcado para acercarse a la acción. Las animaciones
  // ahora respetan la posición del jugador. El hook se mantiene vacío para
  // no romper la cadena de flushFx de otros parches que esperan este envoltorio.

  // Hechizos: al lanzar un hechizo, la vista sube al campo de batalla para que
  // se vea toda la acción. Usa las MISMAS guardas que el cambio de turno: si el
  // jugador ha pellizcado para acercarse, se respeta su encuadre y no se mueve.
  function hookSpell(){
    if(typeof window.castSpell!=='function'||window.castSpell.__bfFocus)return false;
    var orig=window.castSpell;
    window.castSpell=function(){
      var r=orig.apply(this,arguments);
      try{ setTimeout(toTop,60); }catch(e){}
      return r;
    };
    window.castSpell.__bfFocus=1;
    return true;
  }
  var st=0,ht=setInterval(function(){ if(hookSpell()||st++>120)clearInterval(ht); },200);
  hookSpell();

  setInterval(scanTurn,250);
})();
</script>
`;