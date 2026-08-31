// Parche inyectado en el iframe: recuperación de partidas online tras una
// recarga del navegador o un cierre accidental de la ventana.
// - El ANFITRIÓN guarda en el dispositivo cada 3s una copia completa del
//   estado de la partida (equipos, monedas, subasta, batalla en curso…).
// - Al volver a abrir el juego, la portada muestra un aviso "Reanudar
//   partida": el anfitrión restaura su estado y vuelve a abrir la sala con el
//   MISMO código; el invitado se reconecta y recibe el estado por snapshot.
// - La copia caduca a los 10 minutos y se borra al terminar o abandonar.
export const MATCH_RECOVERY_PATCH = `
<script>
(function(){
  if(window.__bfMatchRecovery)return;
  window.__bfMatchRecovery=true;
  var KEY='bfSavedMatch',TTL=300000;
  // Campos de G que hay que conservar para que el anfitrión pueda retomar
  // la partida como autoridad (el snapshot online no incluye todos).
  var GF=['names','coins','equipReserve','equipCoins','bfEquipXfer','team','spellbook','items','bonus','eqReady','pendDebt','pools','curType','aIndex','cands','epicCands','bids','bidsIn','eqShop','eqSide','phaseResult','phaseNeeds','subRound'];

  function scr(){var a=document.querySelector('.screen.active');return a?a.id:'';}

  function save(){
    try{
      if(typeof G==='undefined'||typeof NET==='undefined')return;
      if(!G.online||G._gameOver||NET.role!=='host'||!NET.code||!NET.pass)return;
      var s=scr();
      if(s!=='s-recruit'&&s!=='s-equip'&&s!=='s-battle')return;
      var g={};GF.forEach(function(k){g[k]=G[k];});
      var b=null;
      if(typeof B!=='undefined'&&B)b={round:B.round,qi:B.qi,queue:B.queue,over:B.over,current:B.current,log:(B.log||[]).slice(-40),seq:B.seq};
      localStorage.setItem(KEY,JSON.stringify({code:NET.code,pass:NET.pass||'',name:NET.names_self||'',roomName:NET.roomName||'',screen:s,ts:Date.now(),G:g,B:b}));
    }catch(e){}
  }
  setInterval(save,3000);

  // Guarda el estado INMEDIATAMENTE tras cada cambio de turno: stepTurn arranca
  // el turno del héroe que apunta B.qi (B.current=B.queue[B.qi]); endTurn hace
  // B.qi++ para pasar al siguiente. El guardado periódico (cada 3 s) dejaba un
  // margen en el que B.qi podía estar anticuado y, al reanudar, el héroe cuyo
  // turno ya había terminado "repetía" su turno. Enganchando el guardado a
  // stepTurn y endTurn, B.qi/B.current siempre reflejan el turno exacto del
  // momento de la desconexión → la reanudación respetar a quién le tocaba.
  function hookIfReady(fnName){
    if(typeof window[fnName]!=='function')return false;
    if(window[fnName].__bfSaveHook)return true;
    var orig=window[fnName];
    window[fnName]=function(){var r=orig.apply(this,arguments);try{save();}catch(e){}return r;};
    window[fnName].__bfSaveHook=1;
    return true;
  }
  var _bfHsT=0;(function w(){
    var s=hookIfReady('stepTurn'), e=hookIfReady('endTurn');
    if((s&&e)||_bfHsT++>120)return;
    setTimeout(w,200);
  })();

  function getSave(){
    try{
      var d=JSON.parse(localStorage.getItem(KEY)||'null');
      if(d&&d.code&&Date.now()-(d.ts||0)<TTL)return d;
    }catch(e){}
    return null;
  }
  function clearSave(){try{localStorage.removeItem(KEY);}catch(e){}}
  window.__bfClearSave=clearSave;

  // Al terminar la partida se borra la copia (no hay nada que reanudar).
  setInterval(function(){try{if(typeof G!=='undefined'&&G._gameOver)clearSave();}catch(e){}},3000);

  // ---- Restauración del anfitrión tras recargar ----
  function restoreHost(d){
    try{
      NET.role='host';NET.mySide='p';NET.code=d.code;NET.pass=d.pass||'';
      NET.names_self=d.name||'Jugador 1';NET.roomName=d.roomName||'';
      G.online=true;G.mode='mp';G.oppHuman=true;G._gameOver=false;
      GF.forEach(function(k){if(d.G&&d.G[k]!==undefined)G[k]=d.G[k];});
      if(d.screen==='s-recruit'){
        // La puja de la carta actual se reinicia: ambos vuelven a pujar.
        G.bids={p:null,o:null};G.bidsIn={p:false,o:false};
      }
      if(d.B)B={round:d.B.round,qi:d.B.qi,queue:d.B.queue||[],over:!!d.B.over,current:d.B.current||null,log:d.B.log||[],wd:null,seq:d.B.seq||0,pending:null};
      else B=null;
      show(d.screen);
      if(d.screen==='s-recruit')renderRecruit('p');
      else if(d.screen==='s-equip')renderEquip('p');
      else if(d.screen==='s-battle')renderBattle();
      // Reabrir la sala con el mismo código y esperar al rival.
      if(window.bfAwaitRival)window.bfAwaitRival();
      // Cuando el rival vuelva a conectarse: sincronizar y, en batalla,
      // relanzar el turno en curso (el héroe actual repite su turno).
      var kicked=false;
      var iv=setInterval(function(){
        if(kicked||typeof NET==='undefined'||!NET.conn||!NET.conn.open)return;
        kicked=true;clearInterval(iv);
        setTimeout(function(){
          try{netSync(scr());}catch(e){}
          if(d.screen==='s-battle'&&B&&!B.over)setTimeout(function(){try{stepTurn();}catch(e){}},800);
        },500);
      },800);
    }catch(e){}
  }
  window.__bfRestoreHost=restoreHost;

  // ---- Aviso "Reanudar partida" en la portada ----
  // El jugador que salió por error (recarga, cierre accidental) ve SOLO la
  // opción de reanudar + un reloj de cuenta atrás de 5 minutos. Si no
  // reanuda en ese tiempo, los datos caducan y la opción desaparece.
  var st=document.createElement('style');
  st.textContent='#bf-resume{position:fixed;inset:0;z-index:100600;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at 50% 40%,rgba(20,12,34,.85),rgba(8,5,14,.95));backdrop-filter:blur(4px)}#bf-resume .bf-res-box{text-align:center;max-width:360px;padding:26px 22px;border-radius:18px;background:linear-gradient(180deg,#1b1430,#120d22);border:2px solid rgba(255,210,74,.6);box-shadow:0 18px 50px rgba(0,0,0,.7)}#bf-resume .bf-res-ico{font-size:40px;margin-bottom:8px}#bf-resume .bf-res-t{font-family:Cinzel,serif;font-weight:900;font-size:19px;color:#ffe49a}#bf-resume .bf-res-s{margin-top:8px;font-size:13px;line-height:1.45;color:#cfc6dd}#bf-resume .bf-res-clock{margin-top:16px;font-family:Cinzel,serif;font-weight:900;font-size:36px;color:#FFD24A;text-shadow:0 0 18px rgba(255,210,74,.5)}#bf-resume .bf-res-clock-lbl{margin-top:4px;font-size:11px;color:#9a8fb5;letter-spacing:.5px}#bf-resume .bf-res-go{margin-top:14px;font-family:Cinzel,serif;font-weight:900;font-size:15px;border-radius:12px;padding:13px 22px;cursor:pointer;border:1px solid rgba(255,240,180,.8);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600}'+
    '#bf-resume .bf-res-quit{margin-top:10px;width:100%;font-family:Cinzel,serif;font-weight:900;font-size:13px;border-radius:12px;padding:11px 18px;cursor:pointer;border:1px solid rgba(255,90,90,.6);background:linear-gradient(180deg,rgba(120,30,30,.55),rgba(80,16,16,.7));color:#ffb0a0;letter-spacing:.3px;transition:filter .14s ease,transform .12s ease}#bf-resume .bf-res-quit:hover{filter:brightness(1.12)}#bf-resume .bf-res-quit:active{transform:scale(.97)}';
  document.head.appendChild(st);

  function maybePrompt(){
    if(window.__bfResumeAsked)return;
    var title=document.getElementById('s-title');
    if(!title||!title.classList.contains('active'))return;
    if(typeof G==='undefined'||typeof NET==='undefined'||G.online)return;
    var host=getSave();
    var cli=host?null:((window.__bfGetResume&&window.__bfGetResume())||null);
    var d=host||cli;
    if(!d||!d.pass)return;
    window.__bfResumeAsked=true;
    var ov=document.createElement('div');
    ov.id='bf-resume';
    ov.innerHTML='<div class="bf-res-box"><div class="bf-res-ico">⚔️</div><div class="bf-res-t">Reanudar partida</div><div class="bf-res-s">Tienes una partida online sin terminar.<br>Puedes reanudarla donde estaba.</div><div class="bf-res-clock">5:00</div><div class="bf-res-clock-lbl">TIEMPO RESTANTE</div><button class="bf-res-go">Reanudar partida</button><button class="bf-res-quit">Salir definitivamente de la partida</button></div>';
    document.body.appendChild(ov);
    // Reloj de cuenta atrás de 5 minutos: cuando llega a 0, el aviso se cierra
    // (los datos ya han caducado, el rival ya no estará esperando).
    var tEl=ov.querySelector('.bf-res-clock');
    var t0=(d.ts||Date.now()),end=t0+TTL;
    var tickIv=setInterval(function(){
      if(!ov.parentNode){clearInterval(tickIv);return;}
      var rem=Math.max(0,Math.ceil((end-Date.now())/1000));
      var m=Math.floor(rem/60),s=rem%60;
      tEl.textContent=m+':'+(s<10?'0':'')+s;
      if(rem<=0){clearInterval(tickIv);ov.remove();}
    },500);
    ov.querySelector('.bf-res-go').onclick=function(){
      clearInterval(tickIv);
      ov.remove();
      if(host)restoreHost(host);
      else if(window.bfResumeMatch)window.bfResumeMatch();
    };
    // "Salir definitivamente": borra la sala del backend, borra las copias
    // locales de reanudación (host y cliente) y vuelve a la portada. La
    // partida ya no se puede reanudar: la sala desaparece del lobby y los
    // datos guardados se eliminan del dispositivo.
    ov.querySelector('.bf-res-quit').onclick=function(){
      clearInterval(tickIv);
      if(d.code&&window.bfLobbyRequest){
        window.bfLobbyRequest('unregister',{code:d.code,password:d.pass||'',resume_token:d.token||''}).catch(function(){});
      }
      if(window.__bfClearSave)window.__bfClearSave();
      try{localStorage.removeItem('bfResumeMatch');}catch(e){}
      ov.remove();
      setTimeout(function(){try{location.reload();}catch(e){}},250);
    };
  }
  setInterval(maybePrompt,1000);
})();
</script>
`;