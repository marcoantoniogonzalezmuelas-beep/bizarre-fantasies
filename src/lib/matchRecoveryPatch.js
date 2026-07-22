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
  var KEY='bfSavedMatch',TTL=600000;
  // Campos de G que hay que conservar para que el anfitrión pueda retomar
  // la partida como autoridad (el snapshot online no incluye todos).
  var GF=['names','coins','equipReserve','equipCoins','bfEquipXfer','team','spellbook','items','bonus','eqReady','pendDebt','pools','curType','aIndex','cands','epicCands','bids','bidsIn','eqShop','eqSide','phaseResult','phaseNeeds','subRound'];

  function scr(){var a=document.querySelector('.screen.active');return a?a.id:'';}

  function save(){
    try{
      if(typeof G==='undefined'||typeof NET==='undefined')return;
      if(!G.online||G._gameOver||NET.role!=='host'||!NET.code)return;
      var s=scr();
      if(s!=='s-recruit'&&s!=='s-equip'&&s!=='s-battle')return;
      var g={};GF.forEach(function(k){g[k]=G[k];});
      var b=null;
      if(typeof B!=='undefined'&&B)b={round:B.round,qi:B.qi,queue:B.queue,over:B.over,current:B.current,log:(B.log||[]).slice(-40),seq:B.seq};
      localStorage.setItem(KEY,JSON.stringify({code:NET.code,pass:NET.pass||'',name:NET.names_self||'',roomName:NET.roomName||'',screen:s,ts:Date.now(),G:g,B:b}));
    }catch(e){}
  }
  setInterval(save,3000);

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

  // ---- Aviso "Reanudar partida" en la portada ----
  var st=document.createElement('style');
  st.textContent='#bf-resume{position:fixed;inset:0;z-index:100600;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at 50% 40%,rgba(20,12,34,.85),rgba(8,5,14,.95));backdrop-filter:blur(4px)}#bf-resume .bf-res-box{text-align:center;max-width:360px;padding:26px 22px;border-radius:18px;background:linear-gradient(180deg,#1b1430,#120d22);border:2px solid rgba(255,210,74,.6);box-shadow:0 18px 50px rgba(0,0,0,.7)}#bf-resume .bf-res-ico{font-size:40px;margin-bottom:8px}#bf-resume .bf-res-t{font-family:Cinzel,serif;font-weight:900;font-size:19px;color:#ffe49a}#bf-resume .bf-res-s{margin-top:8px;font-size:13px;line-height:1.45;color:#cfc6dd}#bf-resume button{font-family:Cinzel,serif;font-weight:900;font-size:14px;border-radius:11px;padding:11px 18px;cursor:pointer;margin:6px}#bf-resume .bf-res-go{border:1px solid rgba(255,240,180,.8);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600}#bf-resume .bf-res-no{border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:#efe9dc}';
  document.head.appendChild(st);

  function maybePrompt(){
    if(window.__bfResumeAsked)return;
    var title=document.getElementById('s-title');
    if(!title||!title.classList.contains('active'))return;
    if(typeof G==='undefined'||typeof NET==='undefined'||G.online)return;
    var host=getSave();
    var cli=host?null:((window.__bfGetResume&&window.__bfGetResume())||null);
    var d=host||cli;
    if(!d)return;
    window.__bfResumeAsked=true;
    var min=Math.max(1,Math.round((Date.now()-(d.ts||0))/60000));
    var ov=document.createElement('div');
    ov.id='bf-resume';
    ov.innerHTML='<div class="bf-res-box"><div class="bf-res-ico">⚔️</div><div class="bf-res-t">Partida online en curso</div><div class="bf-res-s">Tienes una partida online sin terminar (hace '+min+' min, sala '+(d.code||'')+').<br>¿Quieres reanudarla donde estaba?</div><div style="margin-top:14px"><button class="bf-res-go">Reanudar partida</button><button class="bf-res-no">Descartar</button></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('.bf-res-go').onclick=function(){
      ov.remove();
      if(host)restoreHost(host);
      else if(window.bfResumeMatch)window.bfResumeMatch();
    };
    ov.querySelector('.bf-res-no').onclick=function(){
      clearSave();
      try{localStorage.removeItem('bfResumeMatch');}catch(e){}
      ov.remove();
    };
  }
  setInterval(maybePrompt,1000);
})();
</script>
`;