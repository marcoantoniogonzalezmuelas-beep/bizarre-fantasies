// Parche inyectado en el iframe: VOLVER A JUGAR = revancha real.
//
// Antes el botón del final de partida hacía location.reload(), que devolvía al
// jugador a la portada (y en online rompía la conexión). Ahora inicia una
// PARTIDA NUEVA con los mismos jugadores (mismos nombres, mismo modo), desde la
// fase de subasta.
//
// En multijugador online:
//   · Si le da el anfitrión, arranca la nueva partida y el snapshot lleva al
//     invitado a la nueva subasta automáticamente.
//   · Si le da el invitado, envía la petición al anfitrión (intent bfRematch),
//     que avisa y arranca la revancha para los dos.
export const REMATCH_PATCH = `
<script>
(function(){
  if(window.__bfRematchPatch) return;
  window.__bfRematchPatch = true;

  function isOnline(){ try{ return typeof online==='function' ? !!online() : false; }catch(e){ return false; } }
  function say(msg){ try{ if(typeof notif==='function') notif(msg); }catch(e){} }

  function cleanupEndFx(){
    ['bf-end-heroes','bf-end-cine'].forEach(function(id){
      var n=document.getElementById(id); if(n&&n.parentNode) n.parentNode.removeChild(n);
    });
    // El resultado de la partida anterior ya se registró: se rearma el aviso
    // para que la siguiente también se guarde en el ranking.
    window.__bfResultSent = false;
  }

  // Arranca una partida nueva con los MISMOS jugadores y el mismo modo.
  function startRematch(){
    if(typeof G==='undefined' || typeof initGame!=='function') return;
    cleanupEndFx();
    G._gameOver=false; G._result=null;
    var p1, p2;
    if(isOnline() && typeof NET!=='undefined'){
      p1 = NET.names_self || G.names.p; p2 = NET.names_opp || G.names.o;
      if(NET.role==='client'){ p1 = NET.names_opp || G.names.o; p2 = NET.names_self || G.names.p; }
      G.online = true;
      initGame(p1, p2, true);
    } else {
      initGame(G.names.p, G.names.o, !!G.oppHuman);
    }
  }
  window.__bfStartRematch = startRematch;

  window.bfRematch = function(){
    try{
      if(typeof G!=='undefined' && G.demo){ location.reload(); return; }
      if(isOnline() && typeof NET!=='undefined' && NET.role==='client'){
        if(typeof sendIntent==='function') sendIntent('bfRematch',{});
        say('⏳ Revancha pedida. Esperando al anfitrión…');
        var b=document.getElementById('bf-rematch-btn'); if(b){ b.disabled=true; b.textContent='Esperando al rival…'; }
        return;
      }
      if(isOnline()) say('🔁 Nueva partida: avisando al rival…');
      startRematch();
    }catch(e){ location.reload(); }
  };

  // Sustituye el botón "Jugar otra vez" (location.reload) por la revancha.
  function swapButton(){
    var root=document.getElementById('s-result'); if(!root) return;
    root.querySelectorAll('button').forEach(function(b){
      var oc=b.getAttribute('onclick')||'';
      if(oc.indexOf('location.reload')===-1) return;
      if(typeof G!=='undefined' && G.demo) return;
      b.id='bf-rematch-btn';
      b.setAttribute('onclick','bfRematch()');
      b.textContent='🔁 Volver a jugar';
    });
  }

  function hookShowResult(){
    if(typeof window.showResult!=='function' || window.showResult.__bfRematch) return false;
    var orig=window.showResult;
    window.showResult=function(){
      var r=orig.apply(this,arguments);
      setTimeout(swapButton,0);
      return r;
    };
    window.showResult.__bfRematch=1;
    return true;
  }

  // Anfitrión: atiende la petición de revancha del invitado.
  function hookIntent(){
    if(typeof window.handleIntent!=='function' || window.handleIntent.__bfRematch) return false;
    var orig=window.handleIntent;
    window.handleIntent=function(msg){
      if(msg && msg.t==='intent' && msg.op==='bfRematch'){
        say('🔁 Tu rival quiere la revancha. ¡Nueva partida!');
        startRematch();
        return;
      }
      return orig.apply(this,arguments);
    };
    window.handleIntent.__bfRematch=1;
    return true;
  }

  // Invitado: cuando el anfitrión arranca la revancha, el snapshot ya no es la
  // pantalla de resultado — se limpia el estado de "partida terminada" y se avisa.
  function hookSnapshot(){
    if(typeof window.applySnapshot!=='function' || window.applySnapshot.__bfRematch) return false;
    var orig=window.applySnapshot;
    window.applySnapshot=function(snap){
      var wasOver = (typeof G!=='undefined') && G._gameOver;
      var r=orig.apply(this,arguments);
      try{
        if(snap && snap.screen && snap.screen!=='s-result'){
          if(wasOver){ cleanupEndFx(); say('🔁 ¡Nueva partida! Empieza la subasta.'); }
          G._gameOver=false; G._result=null;
        }
      }catch(e){}
      return r;
    };
    window.applySnapshot.__bfRematch=1;
    return true;
  }

  var tries=0, t=setInterval(function(){
    var a=hookShowResult(), b=hookIntent(), c=hookSnapshot();
    if((a||window.showResult&&window.showResult.__bfRematch) && (b||window.handleIntent&&window.handleIntent.__bfRematch) && (c||window.applySnapshot&&window.applySnapshot.__bfRematch)) clearInterval(t);
    if(tries++>150) clearInterval(t);
  },200);

  // Red de seguridad: si otro parche repinta la pantalla de resultado, el botón
  // se vuelve a convertir en revancha.
  setInterval(function(){
    var r=document.getElementById('s-result');
    if(r && r.classList.contains('active')) swapButton();
  },600);
})();
</script>
`;