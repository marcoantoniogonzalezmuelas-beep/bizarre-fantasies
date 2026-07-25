// Parche inyectado en el iframe: cuando un héroe ejecuta su acción (habilidad,
// ataque o hechizo), la vista se desplaza automáticamente para centrar la
// carta implicada en pantalla. Así los efectos visuales siempre se ven aunque
// el jugador tuviera el scroll abajo (mirando su mano o el panel de acciones).
export const ACTION_FOCUS_PATCH = `
<script>
(function(){
  if(window.__bfActionFocus)return;
  window.__bfActionFocus=true;

  function cardEl(side,id){ return document.getElementById('b_'+side+'_'+id); }

  // Al ejecutarse una acción, la vista salta arriba del todo para que el campo
  // de batalla (los dos ejércitos) quede siempre visible y las animaciones se
  // vean claramente. Instantáneo: los proyectiles calculan sus coordenadas en
  // ese mismo instante. Si la carta implicada aún quedara fuera, se centra.
  function focusCard(side,id,smooth){
    // Móvil: si hay zoom de pellizco activo, se reencuadra a pantalla completa
    // para que la batalla se vea entera, igual que en escritorio.
    try{ if(window.__bfPinchReset)window.__bfPinchReset(); }catch(e){}
    try{ window.scrollTo({top:0,left:0,behavior:'auto'}); }catch(e){ window.scrollTo(0,0); }
    // En móvil el scroll táctil puede vivir en el body/documento y no en window.
    try{
      var se=document.scrollingElement||document.documentElement;
      se.scrollTop=0; se.scrollLeft=0;
      document.body.scrollTop=0; document.body.scrollLeft=0;
    }catch(e){}
    var el=cardEl(side,id); if(!el)return;
    // Sube también cualquier contenedor con scroll propio que envuelva el tablero.
    var p=el.parentElement;
    while(p&&p!==document.body){ if(p.scrollTop>0)p.scrollTop=0; p=p.parentElement; }
    var r=el.getBoundingClientRect();
    var vh=window.innerHeight||document.documentElement.clientHeight;
    if(r.top>=0&&r.bottom<=vh)return; // ya se ve entera: no mover
    try{ el.scrollIntoView({block:'center',behavior:'auto'}); }catch(e){ el.scrollIntoView(); }
  }
  window.__bfFocusCard=focusCard;

  // 1) Habilidades: centrar al héroe que la usa justo antes de la animación.
  function hookAbility(){
    if(typeof window.useAbility!=='function'||window.useAbility.__bfFocus)return;
    var orig=window.useAbility;
    window.useAbility=function(side,hero){
      if(hero)try{focusCard(side,hero.id,false);}catch(e){}
      return orig.apply(this,arguments);
    };
    window.useAbility.__bfFocus=1;
  }

  // 2) Ataques y hechizos: centrar en el objetivo antes de que los parches de
  // efectos dibujen proyectiles/olas (calculan posiciones al ejecutarse, por lo
  // que este envoltorio debe quedar POR FUERA: se instala solo cuando los
  // parches de efectos ya han envuelto flushFx).
  function hookFlush(){
    if(window.__bfFocusFlushInstalled)return;
    if(typeof window.flushFx!=='function')return;
    // Espera a que los parches de efectos Y el de carta revelada (el último en
    // envolver flushFx) estén instalados, para quedar como capa más externa.
    if(!(window.__bfAttackFxPatch&&window.__bfSpellFxPatch))return;
    if(!(window.__bfRevHooks&&window.__bfRevHooks.flush))return;
    window.__bfFocusFlushInstalled=1;
    var orig=window.flushFx;
    window.flushFx=function(list){
      try{
        if(list&&list.length){
          var ev=null;
          for(var i=0;i<list.length;i++){
            var e=list[i];
            if(e&&(e.k==='arrow'||e.k==='slash'||e.k==='spell')&&e.toSide!=null){ev=e;break;}
          }
          if(ev)focusCard(ev.toSide,ev.toId,false);
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
    // Conservar las marcas de los otros parches para que no vuelvan a envolver.
    window.flushFx.__bfAfx=1;
    window.flushFx.__bfSpellFx=1;
    window.flushFx.__bfShield=1;
    window.flushFx.__bfFocus=1;
  }

  function hook(){ hookAbility(); hookFlush(); }
  var iv=setInterval(function(){
    hook();
    if(window.useAbility&&window.useAbility.__bfFocus&&window.__bfFocusFlushInstalled)clearInterval(iv);
  },200);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook); else hook();
})();
</script>
`;