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

  // Vacia TODA la caché de estado del juego para que la nueva partida empiece
  // virgen. Sin esto, datos de la partida anterior (héroes transformados en
  // tokens, pujas sin resolver, bonificadores usados, mapas de arte mutados
  // por Transformer…) se filtran a la siguiente partida.
  function bfFullReset(){
    try{
      // Estado de partida
      G._gameOver=false; G._result=null; G._coachMsg='';
      G.team={p:[],o:[]};
      G.coins={p:0,o:0};
      G.equipCoins={p:0,o:0};
      G.equipReserve={p:0,o:0};
      G.bfEquipXfer={p:0,o:0};
      G.bids={}; G.bidsIn={};
      G.phaseNeeds={p:false,o:false};
      G.bonus={}; G.forceEpic={}; G.epicCands={};
      G.cands=[]; G.acq={p:[],o:[]};
      G.spellbook={p:[],o:[]}; G.items={p:[],o:[]};
      G.pendDebt={p:0,o:0};
      G.phaseResult=null;
      G.aIndex=0; G.subRound=0;
      G.__bfUsedBonus={};
      G.__bfAdWarnAck=false;
      G.pools=undefined;
      G.assign=null;
      G.eqSide='p';
      // Limpia también el estado de batalla residual
      G.turn=0; G.round=0; G.log=[];
      G.fxQueue=[]; G._fxPending=null;
    }catch(e){}

    // Reconstruye los mapas de arte desde los arrays originales. bfMorph
    // (hechizo Transformer) mutata ART_BY_ID[heroId] y ELITE_BY_ID[heroId]
    // para apuntar al arte del token. Sin esta reconstrucción, el héroe
    // original muestra el arte del token (p. ej. "Pez Espada") en la
    // siguiente partida.
    try{
      if(typeof HERO_ART!=='undefined' && typeof HERO_IDS!=='undefined'){
        HERO_IDS.forEach(function(id,i){
          if(HERO_ART[i]) ART_BY_ID[id]=HERO_ART[i];
          if(HERO_ELITE_ART && HERO_ELITE_ART[i]) ELITE_BY_ID[id]=HERO_ELITE_ART[i];
          else if(HERO_ART[i]) ELITE_BY_ID[id]=HERO_ART[i];
        });
      }
      if(typeof TOKENS!=='undefined' && typeof TOKEN_ART!=='undefined'){
        TOKENS.forEach(function(t,i){
          var u=TOKEN_ART[i], eu=(TOKEN_ELITE_ART && TOKEN_ELITE_ART[i])||u;
          if(u){ ART_BY_ID[t.id]=u; ELITE_BY_ID[t.id]=eu; }
        });
      }
    }catch(e){}

    // Limpia solo los flags de efecto/animación de la partida anterior (NO
    // los flags de parche: si se borran, los parches se re-aplican y
    // duplicarían héroes en HEROES o sumarían el coste épico dos veces).
    try{
      if(window.__bfEndCine) window.__bfEndCine=0;
      if(window.__bfKillAnim) window.__bfKillAnim=0;
      window.__bfResultSent=false;
      // Resetea los guardias de marcador para que la nueva partida sume la
      // victoria exactamente una vez. Sin esto, la revancha no actualizaba
      // el marcador porque los flags de "ya sumado" seguían a true.
      if(typeof G!=='undefined'){ G.__bfScoredOnce=false; G.__bfScored=false; }
    }catch(e){}
  }

  // Arranca una partida nueva con los MISMOS jugadores y el mismo modo.
  function startRematch(){
    if(typeof G==='undefined' || typeof initGame!=='function') return;
    cleanupEndFx();
    bfFullReset();
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
    // En online la pantalla de resultado ya trae su propio botón de revancha
    // ("Jugar otra vez" → bfMatchRematch). Ahí NO se convierte el botón de
    // "Terminar", que si no aparecían dos botones de volver a jugar.
    if(root.querySelector('[onclick*="bfMatchRematch"]')) return;
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