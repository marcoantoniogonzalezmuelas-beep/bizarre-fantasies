// Parche inyectado en el iframe: DESATASCA la partida cuando el turno se queda
// colgado. Dos casos reales detectados en batalla:
//
// 1) Una cinemática (habilidad 3D, carta especial, muerte) se queda en pantalla
//    y su capa oscura tapa el panel de acciones: el jugador ve su turno "en
//    gris" y no puede pulsar nada. Este parche borra cualquier cinemática que
//    lleve más de 9 s en pantalla, limpia la clase bf-cine-active y repinta.
//
// 2) Un objetivo pendiente (pendTarget) que nunca se resolvió deja B.pending
//    fijado y el menú de acciones no vuelve. Tras 25 s sin que cambie el turno,
//    aparece un botón "🔓 Desbloquear turno" sobre el tablero que limpia el
//    estado pendiente y las cinemáticas colgadas y vuelve a pintar la batalla.
//
// No toca ninguna regla del juego: solo retira capas muertas y el pendiente.

export const TURN_UNSTICK_PATCH = `
<script>
(function(){
  if(window.__bfTurnUnstick)return;
  window.__bfTurnUnstick=true;

  var CINE_SEL='#bf-abil-anim,#bf-spec-cine,#bf-kill-ov,.bf-reveal';
  var STALE_MS=9000, STUCK_MS=25000;
  var lastTurnKey='', lastTurnAt=Date.now();

  function stamp(){
    document.querySelectorAll(CINE_SEL).forEach(function(el){
      if(!el.dataset.bfBorn)el.dataset.bfBorn=String(Date.now());
      // Ninguna cinemática debe capturar pulsaciones del panel de acciones.
      el.style.pointerEvents='none';
    });
  }

  // Borra cinemáticas caducadas. Devuelve true si limpió algo.
  function sweep(){
    var now=Date.now(), cleaned=false;
    document.querySelectorAll(CINE_SEL).forEach(function(el){
      var born=Number(el.dataset.bfBorn||0);
      if(born && now-born>STALE_MS){ if(el.parentNode)el.parentNode.removeChild(el); cleaned=true; }
    });
    if(!document.querySelector('#bf-abil-anim,#bf-spec-cine')&&document.body.classList.contains('bf-cine-active')){
      document.body.classList.remove('bf-cine-active');
      cleaned=true;
    }
    return cleaned;
  }

  function myTurn(){
    try{
      return !!(typeof B!=='undefined'&&B&&B.current&&!B.over&&typeof humanCtl==='function'&&humanCtl(B.current.side));
    }catch(e){ return false; }
  }

  function unstick(){
    document.querySelectorAll(CINE_SEL).forEach(function(el){ if(el.parentNode)el.parentNode.removeChild(el); });
    document.body.classList.remove('bf-cine-active');
    try{
      if(typeof B!=='undefined'&&B&&B.pending){
        if(typeof NET!=='undefined'&&NET.role==='client'&&typeof sendIntent==='function')sendIntent('cancel',{});
        else B.pending=null;
      }
    }catch(e){}
    lastTurnAt=Date.now();
    try{ if(typeof renderBattle==='function')renderBattle(); }catch(e){}
    var b=document.getElementById('bf-unstick-btn'); if(b)b.remove();
  }
  window.__bfUnstickTurn=unstick;

  function button(show){
    var b=document.getElementById('bf-unstick-btn');
    if(!show){ if(b)b.remove(); return; }
    if(b)return;
    b=document.createElement('button');
    b.id='bf-unstick-btn';
    b.textContent=(window.__bfLangEn?'🔓 Unblock turn':'🔓 Desbloquear turno');
    b.style.cssText='position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:100060;padding:10px 20px;border-radius:999px;border:2px solid #ffb0ad;background:linear-gradient(180deg,#ff6a6a,#c8201d);color:#fff;font-family:Cinzel,serif;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.6)';
    b.onclick=function(e){ e.stopPropagation(); unstick(); };
    document.body.appendChild(b);
  }

  setInterval(function(){
    var scr=document.getElementById('s-battle');
    if(!scr||!scr.classList.contains('active')){ button(false); return; }
    stamp();
    if(sweep()){ try{ if(typeof renderBattle==='function')renderBattle(); }catch(e){} }

    var key='';
    try{ key=(typeof B!=='undefined'&&B&&B.current)?(B.current.side+'_'+B.current.id+'_'+B.round):''; }catch(e){}
    if(key!==lastTurnKey){ lastTurnKey=key; lastTurnAt=Date.now(); button(false); return; }

    var stuck=Date.now()-lastTurnAt>STUCK_MS;
    // Solo se ofrece el botón si el turno es del jugador (o hay un pendiente
    // colgado): si es la IA/rival quien tarda, el juego ya se recupera solo.
    var pend=false; try{ pend=!!(typeof B!=='undefined'&&B&&B.pending); }catch(e){}
    button(stuck&&(myTurn()||pend));
  },1000);
})();
</script>
`;