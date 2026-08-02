// Parche inyectado en el iframe: reconexión y notificación de salida en partidas online.
// - SALIDA INTENCIONAL (botón Salir): envía 'bye' al rival, que ve un aviso
//   claro "Tu rival ha abandonado" y vuelve al inicio. La partida termina.
// - SALIDA ACCIDENTAL (recarga, cierre de pestaña, corte de red): el rival
//   ve "Tu rival se ha desconectado, esperando a que vuelva" con opción de
//   esperar o abandonar. El jugador que salió puede reanudar al volver.
// - Si se corta la conexión, el cliente re-conecta a la sala y el host
//   reenvía el estado completo (snapshot), reanudando donde estaba.
export const NET_RECONNECT_PATCH = `
<script>
(function(){
  if(window.__bfNetReconnect)return;
  window.__bfNetReconnect=true;
  var RETRY_MS=3000,MAX_WAIT=300000;
  var rec={active:false,until:0,timer:null,pendConn:null,tickInterval:null,waiting:false};
  // Flag: el jugador local ha salido intencionalmente (no hay que reconectar).
  var quitting=false;

  // Datos de la partida en curso guardados en el dispositivo: si el jugador
  // se desconecta (timeout, recarga…), podrá volver desde el lobby con el
  // botón "Reconectar" y retomar la partida donde estaba.
  var RESUME_KEY='bfResumeMatch';
  function saveResume(){
    try{localStorage.setItem(RESUME_KEY,JSON.stringify({code:NET.code,pass:(NET._bfJoin&&NET._bfJoin.pass)||NET.pass||'',name:NET.names_self||'',side:NET.mySide||'g',ts:Date.now()}));}catch(e){}
  }
  function clearResume(){try{localStorage.removeItem(RESUME_KEY);localStorage.removeItem('bfSavedMatch');}catch(e){}}
  window.__bfGetResume=function(){
    try{
      var i=JSON.parse(localStorage.getItem(RESUME_KEY)||'null');
      if(i&&i.code&&Date.now()-(i.ts||0)<300000)return i;
    }catch(e){}
    return null;
  };
  setInterval(function(){
    if(typeof NET!=='undefined'&&typeof G!=='undefined'&&G.online&&!G._gameOver&&NET.role==='client'&&NET.code)saveResume();
  },4000);

  var style=document.createElement('style');
  style.textContent='#bf-reconnect{position:fixed;inset:0;z-index:100500;display:none;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at 50% 40%,rgba(20,12,34,.82),rgba(8,5,14,.94));backdrop-filter:blur(4px)}'+
  '#bf-reconnect .bf-rec-box{text-align:center;max-width:360px;padding:26px 22px;border-radius:18px;background:linear-gradient(180deg,#1b1430,#120d22);border:2px solid rgba(255,210,74,.55);box-shadow:0 18px 50px rgba(0,0,0,.7)}'+
  '#bf-reconnect .bf-rec-spin{width:44px;height:44px;margin:0 auto 14px;border-radius:50%;border:4px solid #3c3158;border-top-color:#FFD24A;animation:bfRecSpin 1s linear infinite}@keyframes bfRecSpin{to{transform:rotate(360deg)}}'+
  '#bf-reconnect .bf-rec-msg{font-family:Cinzel,serif;font-weight:900;font-size:18px;color:#ffe49a}'+
  '#bf-reconnect .bf-rec-sub{margin-top:8px;font-size:13px;line-height:1.45;color:#cfc6dd}'+
  '#bf-reconnect .bf-rec-timer{margin-top:14px;font-family:Cinzel,serif;font-weight:900;font-size:34px;color:#FFD24A;text-shadow:0 0 18px rgba(255,210,74,.5);display:none}'+
  '#bf-reconnect .bf-rec-btns{margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap}'+
  '#bf-reconnect .bf-rec-exit{padding:10px 20px;border-radius:11px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:#efe9dc;font-family:Cinzel,serif;font-weight:900;font-size:13px;cursor:pointer}'+
  '#bf-reconnect .bf-rec-wait{padding:10px 20px;border-radius:11px;border:1px solid rgba(125,223,125,.6);background:rgba(90,200,120,.15);color:#9be26b;font-family:Cinzel,serif;font-weight:900;font-size:13px;cursor:pointer}'+
  // Modal de "rival ha abandonado" (salida intencional)
  '#bf-quit-notify{position:fixed;inset:0;z-index:100600;display:none;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at 50% 40%,rgba(34,12,12,.85),rgba(14,5,8,.95));backdrop-filter:blur(4px)}'+
  '#bf-quit-notify .bf-qn-box{text-align:center;max-width:360px;padding:28px 24px;border-radius:18px;background:linear-gradient(180deg,#2a1418,#1a0d10);border:2px solid rgba(255,100,80,.6);box-shadow:0 18px 50px rgba(0,0,0,.7)}'+
  '#bf-quit-notify .bf-qn-ico{font-size:44px;margin-bottom:10px}'+
  '#bf-quit-notify .bf-qn-t{font-family:Cinzel,serif;font-weight:900;font-size:19px;color:#ff8a6a}'+
  '#bf-quit-notify .bf-qn-s{margin-top:8px;font-size:14px;line-height:1.5;color:#d8c8cc}'+
  '#bf-quit-notify .bf-qn-btn{margin-top:20px;padding:12px 24px;border-radius:12px;border:1px solid rgba(255,240,180,.8);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600;font-family:Cinzel,serif;font-weight:900;font-size:15px;cursor:pointer}';
  document.head.appendChild(style);

  function overlay(msg,sub){
    var el=document.getElementById('bf-reconnect');
    if(!el){
      el=document.createElement('div');el.id='bf-reconnect';
      el.innerHTML='<div class="bf-rec-box"><div class="bf-rec-spin"></div><div class="bf-rec-msg"></div><div class="bf-rec-sub"></div><div class="bf-rec-timer"></div><div class="bf-rec-btns"><button class="bf-rec-wait">Esperar 5 minutos</button><button class="bf-rec-exit">Volver al inicio</button></div></div>';
      document.body.appendChild(el);
      el.querySelector('.bf-rec-exit').onclick=function(){
        quitting=true;clearResume();clearTimeout(rec.timer);if(rec.tickInterval)clearInterval(rec.tickInterval);
        try{if(NET.conn)NET.conn.close();}catch(e){}
        try{if(NET.peer)NET.peer.destroy();}catch(e){}
        location.reload();
      };
      el.querySelector('.bf-rec-wait').onclick=function(){
        // Empieza la cuenta atrás de 5 minutos visible para el jugador.
        rec.until=Date.now()+MAX_WAIT;rec.waiting=true;
        el.querySelector('.bf-rec-wait').style.display='none';
        el.querySelector('.bf-rec-timer').style.display='block';
        startTick();
      };
    }
    el.querySelector('.bf-rec-msg').textContent=msg;
    el.querySelector('.bf-rec-sub').textContent=sub||'';
    el.style.display='flex';
  }
  function startTick(){
    if(rec.tickInterval)clearInterval(rec.tickInterval);
    var el=document.getElementById('bf-reconnect');if(!el)return;
    var tEl=el.querySelector('.bf-rec-timer');
    rec.tickInterval=setInterval(function(){
      if(!rec.active){clearInterval(rec.tickInterval);return;}
      var rem=Math.max(0,Math.ceil((rec.until-Date.now())/1000));
      var m=Math.floor(rem/60),s=rem%60;
      if(tEl)tEl.textContent=m+':'+(s<10?'0':'')+s;
      if(rem<=0){clearInterval(rec.tickInterval);}
    },500);
  }

  // Aviso de salida intencional: el rival ha abandonado la partida.
  function rivalQuit(){
    if(typeof G!=='undefined')G._gameOver=true;
    clearResume();if(window.__bfClearSave)window.__bfClearSave();
    hideOverlay();
    var el=document.getElementById('bf-quit-notify');
    if(!el){
      el=document.createElement('div');el.id='bf-quit-notify';
      el.innerHTML='<div class="bf-qn-box"><div class="bf-qn-ico">🏳️</div><div class="bf-qn-t">Tu rival ha abandonado la partida</div><div class="bf-qn-s">El otro jugador ha salido voluntariamente. La partida ha terminado.</div><button class="bf-qn-btn">Volver al inicio</button></div>';
      document.body.appendChild(el);
      el.querySelector('.bf-qn-btn').onclick=function(){
        quitting=true;
        try{if(typeof NET!=='undefined'&&NET.conn)NET.conn.close();}catch(e){}
        try{if(typeof NET!=='undefined'&&NET.peer)NET.peer.destroy();}catch(e){}
        location.reload();
      };
    }
    el.style.display='flex';
  }
  window.__bfRivalQuit=rivalQuit;
  function hideOverlay(){var el=document.getElementById('bf-reconnect');if(el)el.style.display='none';}
  function currentScreen(){var a=document.querySelector('.screen.active');return a?a.id:'s-battle';}

  function resumed(){
    var was=rec.active;
    rec.active=false;rec.pendConn=null;rec.waiting=false;clearTimeout(rec.timer);if(rec.tickInterval)clearInterval(rec.tickInterval);hideOverlay();
    if(was&&typeof notif==='function')notif('✔ Conexión restablecida. ¡La partida continúa!');
  }
  function giveUp(msg){
    rec.active=false;clearTimeout(rec.timer);if(rec.tickInterval)clearInterval(rec.tickInterval);hideOverlay();clearResume();
    if(typeof modal==='function')modal('<h3>Tiempo de espera agotado</h3><div class="modal-note" style="font-size:15px">'+(msg||'Tu rival no ha vuelto en 5 minutos. La partida no se puede reanudar.')+'</div><div style="margin-top:16px;text-align:center"><button class="btn primary" onclick="location.reload()">Volver al inicio</button></div>');
  }

  function sendBye(){
    // Envía 'bye' al rival antes de salir, para que sepa que fue intencional.
    try{if(typeof NET!=='undefined'&&NET.conn&&NET.conn.open)NET.conn.send({t:'bye'});}catch(e){}
  }
  window.__bfSendBye=sendBye;

  function bindClientConn(conn){
    NET.conn=conn;
    conn.on('data',function(msg){
      if(!msg)return;
      if(msg.t==='reject'){giveUp(msg.reason||'Conexión rechazada.');return;}
      if(msg.t==='bye'){rivalQuit();return;}
      if(msg.t==='snap'){resumed();applySnapshot(msg);return;}
      if(msg.t==='bfFullSync'){
        // Snapshot completo enviado por el host al reanudar: restaura TODOS los
        // campos de G y B para que el cliente siga en el mismo estado exacto.
        resumed();
        try{
          if(msg.G){Object.keys(msg.G).forEach(function(k){if(msg.G[k]!==undefined)G[k]=msg.G[k];});}
          if(msg.B){B={round:msg.B.round,qi:msg.B.qi,queue:msg.B.queue||[],over:!!msg.B.over,current:msg.B.current||null,log:msg.B.log||[],wd:null,seq:msg.B.seq||0,pending:null};}
          var s=currentScreen();
          if(s==='s-recruit'){try{renderRecruit(NET.mySide);}catch(e){}}
          else if(s==='s-equip'){try{renderEquip(NET.mySide);}catch(e){}}
          else if(s==='s-battle'){try{renderBattle();}catch(e){}}
        }catch(e){}
        return;
      }
      if(msg.t==='end'){G._gameOver=true;hideOverlay();clearResume();showResult(msg.pWin===(NET.mySide==='p'));return;}
      if(msg.t==='welcome'){resumed();return;}
    });
    conn.on('close',function(){
      if(quitting)return;
      if(NET.conn===conn&&!G._gameOver)connLost();
    });
    conn.on('error',function(){});
  }

  function clientRetry(){
    if(!rec.active)return;
    if(Date.now()>rec.until){giveUp();return;}
    var info=NET._bfJoin||{},code=info.code||NET.code||'';
    if(!code){giveUp();return;}
    try{
      if(!NET.peer||NET.peer.destroyed){
        // Renovar credenciales TURN antes de crear el peer nuevo: las viejas
        // pueden haber caducado y bloquear la reconexión en redes móviles.
        var mk=function(){if(rec.active&&(!NET.peer||NET.peer.destroyed)){NET.peer=new Peer({debug:1});NET.peer.on('error',function(){});}};
        if(window.__bfFreshIce)window.__bfFreshIce().catch(function(){}).then(mk);
        else mk();
      }
      else if(NET.peer.disconnected){try{NET.peer.reconnect();}catch(e){}}
      if(NET.peer&&NET.peer.open&&!(NET.conn&&NET.conn.open)){
        // Cerrar intentos anteriores que se quedaron colgados sin abrir.
        if(rec.pendConn&&rec.pendConn!==NET.conn){try{rec.pendConn.close();}catch(e){}}
        var conn=NET.peer.connect('bizfan-'+code,{reliable:true});
        rec.pendConn=conn;
        conn.on('open',function(){
          if(!rec.active){try{conn.close();}catch(e){}return;}
          bindClientConn(conn);
          try{conn.send({t:'hello',resume:true,name:NET.names_self,pass:info.pass||''});}catch(e){}
        });
        conn.on('error',function(){});
      }
      // Red de seguridad: si ya hay una conexión abierta pero seguimos en
      // modo reconexión (el host no respondió a nuestro hello), reenviar el
      // hello cada ciclo para que la partida reanude aunque se perdiera el
      // primer mensaje.
      if(NET.conn&&NET.conn.open&&rec.active){try{NET.conn.send({t:'hello',resume:true,name:NET.names_self,pass:info.pass||''});}catch(e){}}
    }catch(e){}
    rec.timer=setTimeout(clientRetry,RETRY_MS);
  }

  function hostWait(){
    if(!rec.active)return;
    if(Date.now()>rec.until){giveUp();return;}
    try{
      if(!NET.peer||NET.peer.destroyed){
        // El peer del host murió del todo: recrearlo con el MISMO código de
        // sala para que el rival pueda volver a conectarse y retomar.
        var mk=function(){
          if(!rec.active||(NET.peer&&!NET.peer.destroyed))return;
          var peer=new Peer('bizfan-'+NET.code,{debug:1,host:'0.peerjs.com',port:443,path:'/',secure:true});
          NET.peer=peer;
          peer.on('connection',function(conn){if(typeof onHostConn==='function')onHostConn(conn);});
          peer.on('error',function(){});
        };
        if(window.__bfFreshIce)window.__bfFreshIce().catch(function(){}).then(mk);
        else mk();
      }
      else if(NET.peer.disconnected){try{NET.peer.reconnect();}catch(e){}}
    }catch(e){}
    rec.timer=setTimeout(hostWait,RETRY_MS);
  }

  function connLost(){
    if(rec.active||typeof G==='undefined'||G._gameOver||quitting)return;
    rec.active=true;rec.until=Date.now()+MAX_WAIT;rec.waiting=false;
    if(NET.role==='client'){overlay('Tu rival se ha desconectado','Puedes volver al inicio o esperar 5 minutos a que vuelva para reanudar la partida.');clientRetry();}
    else{overlay('Tu rival se ha desconectado','Puedes volver al inicio o esperar 5 minutos a que vuelva para reanudar la partida.');hostWait();}
  }
  window.__bfConnLost=connLost;

  // Engancha el botón "Salir" (homeBtn) para enviar 'bye' al rival antes de
  // salir de la partida online. Así el rival sabe que fue intencional.
  function hookQuitButton(){
    if(window.__bfQuitHooked)return;
    var btn=document.getElementById('homeBtn');
    if(!btn)return;
    window.__bfQuitHooked=true;
    // Botón "Salir" = salida INTENCIONAL: se envía 'bye' para que el rival
    // reciba "ha abandonado" con opción de volver al inicio (sin esperarl.
    // Se borra la copia de reanudación: el que sale a propósito no reanuda.
    btn.addEventListener('click',function(e){
      if(typeof G==='undefined'||!G.online||G._gameOver)return;
      if(typeof NET==='undefined'||!NET.role)return;
      if(btn.dataset.bfConfirming==='1'){btn.dataset.bfConfirming='';return;}
      e.preventDefault();e.stopPropagation();
      btn.dataset.bfConfirming='1';
      if(typeof modal==='function'){
        modal('<h3>Salir de la partida</h3><div class="modal-note" style="font-size:15px">Si sales, tu rival será notificado y la partida terminará.</div><div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center"><button class="btn primary" id="bf-quit-yes">Sí, salir</button><button class="btn" id="bf-quit-no">Cancelar</button></div>');
        setTimeout(function(){
          var yes=document.getElementById('bf-quit-yes'),no=document.getElementById('bf-quit-no');
          if(yes)yes.onclick=function(){quitting=true;sendBye();clearResume();if(window.__bfClearSave)window.__bfClearSave();setTimeout(function(){location.reload();},200);};
          if(no)no.onclick=function(){btn.dataset.bfConfirming='';};
        },50);
      } else {
        if(confirm('¿Salir de la partida? Tu rival será notificado.')){quitting=true;sendBye();clearResume();if(window.__bfClearSave)window.__bfClearSave();setTimeout(function(){location.reload();},200);}
        else btn.dataset.bfConfirming='';
      }
    },true);
  }
  setInterval(function(){if(typeof G!=='undefined'&&G.online)hookQuitButton();},1000);

  // Reconexión manual desde el lobby: reutiliza los datos guardados de la
  // partida en curso, se conecta a la sala del host y pide el snapshot.
  window.bfResumeMatch=function(){
    var info=window.__bfGetResume();
    if(!info)return;
    NET.role='client';NET.mySide=info.side||'g';NET.code=info.code;
    NET.names_self=info.name||'Jugador 2';NET.pass=info.pass||'';
    NET._bfJoin={code:info.code,pass:info.pass||'',name:info.name||''};
    G.online=true;
    rec.active=true;rec.until=Date.now()+MAX_WAIT;
    overlay('Reconectando con la partida','Recuperando el estado de la partida…');
    clientRetry();
  };

  // Reanudación del anfitrión tras recargar: reabre la sala con el mismo
  // código (hostWait recrea el peer) y espera a que el rival se reconecte.
  window.bfAwaitRival=function(){
    if(rec.active)return;
    rec.active=true;rec.until=Date.now()+MAX_WAIT;rec.waiting=true;
    overlay('Esperando al otro jugador','La sala se ha reabierto. La partida se reanudará cuando tu rival vuelva a conectarse.');
    var el=document.getElementById('bf-reconnect');
    if(el){
      el.querySelector('.bf-rec-wait').style.display='none';
      el.querySelector('.bf-rec-timer').style.display='block';
    }
    startTick();
    hostWait();
  };

  // El host acepta reconexiones a mitad de partida: valida la contraseña,
  // adopta la nueva conexión y reenvía el estado completo de la pantalla actual.
  function installHost(){
    if(typeof window.onHostConn!=='function'||window.onHostConn.__bfResume)return false;
    var orig=window.onHostConn;
    window.onHostConn=function(conn){
      var inGame=typeof G!=='undefined'&&G.online&&!G._gameOver;
      if(!inGame)return orig.apply(this,arguments);
      conn.on('data',function(msg){
        if(msg&&msg.t==='bye'){rivalQuit();return;}
        if(msg&&msg.t==='hello'){
          if(NET.pass&&msg.pass!==NET.pass){try{conn.send({t:'reject',reason:'Contraseña incorrecta.'});}catch(e){}return;}
          try{if(NET.conn&&NET.conn!==conn)NET.conn.close();}catch(e){}
          NET.conn=conn;
          resumed();
          if(typeof pushLog==='function')pushLog('li','🔌 '+(msg.name||'El rival')+' se ha reconectado a la partida.');
          setTimeout(function(){try{netSync(currentScreen());}catch(e){}},300);
          // Snapshot completo: envía TODOS los campos de G y B al cliente para
          // que reanude en el mismo estado exacto (netSync nativo puede no
          // enviar todo). Si es batalla, relanza el turno en curso.
          setTimeout(function(){
            try{
              var GF=['names','coins','equipReserve','equipCoins','bfEquipXfer','team','spellbook','items','bonus','eqReady','pendDebt','pools','curType','aIndex','cands','epicCands','bids','bidsIn','eqShop','eqSide','phaseResult','phaseNeeds','subRound'];
              var snap={t:'bfFullSync',G:{}};
              GF.forEach(function(k){if(typeof G!=='undefined'&&G[k]!==undefined)snap.G[k]=G[k];});
              if(typeof B!=='undefined'&&B)snap.B={round:B.round,qi:B.qi,queue:B.queue,over:B.over,current:B.current,log:(B.log||[]).slice(-40),seq:B.seq};
              NET.conn.send(snap);
            }catch(e){}
            if(currentScreen()==='s-battle'&&typeof B!=='undefined'&&B&&!B.over)setTimeout(function(){try{stepTurn();}catch(e){}},600);
          },600);
        } else if(typeof handleIntent==='function')handleIntent(msg);
      });
      conn.on('close',function(){
        if(quitting)return;
        if(NET.conn===conn&&!G._gameOver)connLost();
      });
      conn.on('error',function(){});
    };
    window.onHostConn.__bfResume=1;
    return true;
  }

  // El modal fatal solo aparece si la reconexión es imposible: en partida
  // online se intenta recuperar la conexión en vez de expulsar al jugador.
  function installDrop(){
    if(typeof window.netDropped!=='function'||window.netDropped.__bfResume)return false;
    var orig=window.netDropped;
    window.netDropped=function(){
      if(typeof G!=='undefined'&&G._gameOver)return;
      if(typeof G!=='undefined'&&G.online&&typeof NET!=='undefined'&&(NET.role==='host'||NET.role==='client')){connLost();return;}
      return orig.apply(this,arguments);
    };
    window.netDropped.__bfResume=1;
    return true;
  }

  var tries=0,inst=setInterval(function(){
    var a=installHost(),b=installDrop();
    if((a&&b)||tries++>100)clearInterval(inst);
  },200);

  // Al volver a la pestaña, comprobar la conexión y recuperarla si hace falta.
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState!=='visible')return;
    if(typeof NET==='undefined'||typeof G==='undefined')return;
    if(NET.peer&&NET.peer.disconnected&&!NET.peer.destroyed){try{NET.peer.reconnect();}catch(e){}}
    if(G.online&&!G._gameOver&&!rec.active&&!(NET.conn&&NET.conn.open))connLost();
  });

  // Vigilante: detecta conexiones "zombi" (abiertas pero mudas >90s, margen
  // amplio para pestañas en segundo plano) y las cierra para forzar la
  // reconexión en lugar de dejar la partida colgada.
  setInterval(function(){
    if(typeof NET==='undefined'||typeof G==='undefined'||!G.online||G._gameOver||rec.active)return;
    var c=NET.conn;
    if(!c){connLost();return;}
    if(c.open&&c.__bfLastSeen&&Date.now()-c.__bfLastSeen>15000){try{c.close();}catch(e){}return;}
    if(!c.open)connLost();
  },6000);
})();
</script>
`;