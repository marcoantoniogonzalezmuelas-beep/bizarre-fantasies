// Parche SOLO móvil/tablet: enfoque automático de la acción en batalla.
//
// Cada vez que un héroe actúa (empieza su turno o lanza un efecto), la vista se
// acerca suavemente hacia ESE héroe para que la acción se vea clara y no pase
// desapercibida cuando la IA juega varios turnos seguidos. Al terminar la
// batalla (o al salir de la pantalla de batalla) la vista vuelve a x1.
//
// Respeta el gesto del jugador: si acaba de pellizcar a mano, el enfoque
// automático se pausa unos segundos para no pelearse con él.
export const BATTLE_FOCUS_ZOOM_PATCH = `
<script>
(function(){
  if(window.__bfFocusZoom)return;
  window.__bfFocusZoom=true;

  var FOCUS_Z=1.45;      // acercamiento del enfoque automático
  var MANUAL_PAUSE=6000; // ms de respeto tras un pellizco manual
  var lastManual=0,lastFocus=0,lastKey='';

  document.addEventListener('touchstart',function(e){
    if(e.touches&&e.touches.length>=2)lastManual=Date.now();
  },{capture:true,passive:true});

  function inBattle(){
    var a=document.querySelector('.screen.active');
    return !!(a&&a.id==='s-battle');
  }

  function focusHero(side,id,key){
    if(typeof window.__bfPinchFocus!=='function')return;
    if(!inBattle())return;
    var now=Date.now();
    if(now-lastManual<MANUAL_PAUSE)return;
    if(window.__bfPinchBusy&&window.__bfPinchBusy())return;
    if(key&&key===lastKey&&now-lastFocus<900)return;
    if(now-lastFocus<420)return;
    var el=document.getElementById('b_'+side+'_'+id);
    if(!el)return;
    var r=el.getBoundingClientRect();
    if(!r.width)return;
    lastFocus=now;lastKey=key||'';
    window.__bfPinchFocus(r.left+r.width/2,r.top+r.height/2,FOCUS_Z,420);
  }
  window.__bfFocusHero=focusHero;

  // 1) Turno activo: al cambiar de héroe en turno, la vista va hacia él.
  var lastTurn='';
  function scanTurn(){
    try{
      if(typeof B==='undefined'||!B||!B.current)return;
      var k=B.current.side+'_'+B.current.id;
      if(k===lastTurn)return;
      lastTurn=k;
      focusHero(B.current.side,B.current.id,'turn_'+k);
    }catch(e){}
  }

  // 2) Efectos: ataques, hechizos y habilidades enfocan al héroe que actúa
  // (o, si no viene el actor, al objetivo del efecto).
  function hookFx(){
    if(typeof window.flushFx!=='function'||window.flushFx.__bfFocusZoom)return false;
    var orig=window.flushFx;
    window.flushFx=function(list){
      try{
        (list||[]).forEach(function(ev){
          if(!ev)return;
          if(ev.fromSide&&ev.fromId)focusHero(ev.fromSide,ev.fromId,'fx_'+ev.fromSide+ev.fromId);
          else if(ev.side&&ev.id&&ev.k!=='death')focusHero(ev.side,ev.id,'fx_'+ev.side+ev.id);
        });
      }catch(e){}
      return orig.apply(this,arguments);
    };
    window.flushFx.__bfFocusZoom=1;
    return true;
  }

  // 3) Al salir de la batalla, vuelve a x1.
  var wasBattle=false;
  function scanScreen(){
    var now=inBattle();
    if(wasBattle&&!now&&typeof window.__bfPinchReset==='function')window.__bfPinchReset();
    wasBattle=now;
  }

  setInterval(function(){ scanTurn(); scanScreen(); },250);
  var tries=0,t=setInterval(function(){ if(hookFx()||tries++>200)clearInterval(t); },200);
})();
</script>
`;