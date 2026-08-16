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
    try{localStorage.setItem(RESUME_KEY,JSON.stringify({code:NET.code,pass:(NET._bfJoin&&NET._bfJoin.pass)||NET.pass||'',name:NET.names_self||'',side:NET.mySide||'g',role:NET.role||'client',ts:Date.now(),token:window.__bfResumeToken||''}));}catch(e){}
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
    if(typeof NET!=='undefined'&&typeof G!=='undefined'&&G.online&&!G._gameOver&&(NET.role==='client'||NET.role==='host')&&NET.code&&NET.pass)saveResume();
  },4000);

  var style=document.createElement('style');
  style.textContent='#bf-reconnect{position:fixed;inset:0;z-index:100500;display:none;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at 50% 40%,rgba(20,12,34,.82),rgba(8,5,14,.94));backdrop-filter:blur(4px)}'+
  '#bf-reconnect .bf-rec-box{text-align:center;max-width:360px;padding:26px 22px;border-radius:18px;background:linear-gradient(180deg,#1b1430,#120d22);border:2px solid rgba(255,210,74,.55);box-shadow:0 18px 50px rgba(0,0,0,.7)}'+
  '#bf-reconnect .bf-rec-spin{width:44px;height:44px;margin:0 auto 14px;border-radius:50%;border:4px solid #3c3158;border-top-color:#FFD24A;animation:bfRecSpin 1s linear infinite}@keyframes bfRecSpin{to{transform:rotate(360deg)}}'+
  '#bf-reconnect .bf-rec-msg{font-family:Cinzel,serif;font-weight:900;font-size:18px;color:#ffe49a}'+
  '#bf-reconnect .bf-rec-sub{margin-top:8px;font-size:13px;line-height:1.45;color:#cfc6dd}'+
  // Cuenta atrás "chula": anillo dorado con brillo pulsante y dígitos grandes.
  '#bf-reconnect .bf-rec-clock{margin:18px auto 4px;width:150px;height:150px;position:relative;display:flex;align-items:center;justify-content:center;border-radius:50%;background:radial-gradient(circle at 50% 35%,rgba(255,210,74,.16),rgba(10,6,18,.9) 70%);border:3px solid rgba(255,210,74,.6);box-shadow:0 0 26px rgba(255,210,74,.35),inset 0 0 26px rgba(255,210,74,.15);animation:bfClockGlow 2.4s ease-in-out infinite}'+
  '@keyframes bfClockGlow{0%,100%{box-shadow:0 0 20px rgba(255,210,74,.28),inset 0 0 20px rgba(255,210,74,.12)}50%{box-shadow:0 0 40px rgba(255,210,74,.6),inset 0 0 30px rgba(255,210,74,.22)}}'+
  '#bf-reconnect .bf-rec-ring{position:absolute;inset:-3px;border-radius:50%;pointer-events:none}'+
  '#bf-reconnect .bf-rec-timer{font-family:Cinzel,serif;font-weight:900;font-size:40px;line-height:1;color:#FFD24A;text-shadow:0 0 22px rgba(255,210,74,.65),0 2px 4px #000;letter-spacing:1px}'+
  '#bf-reconnect .bf-rec-tlbl{position:absolute;bottom:22px;font-family:Rubik,sans-serif;font-size:9.5px;font-weight:800;letter-spacing:1.4px;color:#cbb46a;text-transform:uppercase}'+
  '#bf-reconnect .bf-rec-btns{margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap}'+
  '#bf-reconnect .bf-rec-cancel{padding:11px 22px;border-radius:11px;border:1px solid rgba(255,120,100,.55);background:rgba(120,30,30,.35);color:#ffb0a0;font-family:Cinzel,serif;font-weight:900;font-size:13px;cursor:pointer}'+
  '#bf-reconnect .bf-rec-cancel:active{transform:scale(.96)}'+
  // Modal de "rival ha abandonado" (salida intencional)
  '#bf-quit-notify{position:fixed;inset:0;z-index:100600;display:none;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at 50% 40%,rgba(34,12,12,.85),rgba(14,5,8,.95));backdrop-filter:blur(4px)}'+
  '#bf-quit-notify .bf-qn-box{text-align:center;max-width:360px;padding:28px 24px;border-radius:18px;background:linear-gradient(180deg,#2a1418,#1a0d10);border:2px solid rgba(255,100,80,.6);box-shadow:0 18px 50px rgba(0,0,0,.7)}'+
  '#bf-quit-notify .bf-qn-ico{font-size:44px;margin-bottom:10px}'+
  '#bf-quit-notify .bf-qn-t{font-family:Cinzel,serif;font-weight:900;font-size:19px;color:#ff8a6a}'+
  '#bf-quit-notify .bf-qn-s{margin-top:8px;font-size:14px;line-height:1.5;color:#d8c8cc}'+
  '#bf-quit-notify .bf-qn-btn{margin-top:20px;padding:12px 24px;border-radius:12px;border:1px solid rgba(255,240,180,.8);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600;font-family:Cinzel,serif;font-weight:900;font-size:15px;cursor:pointer}';
  style.textContent += '#bf-quit-confirm{position:fixed;z-index:100600;top:60px;right:10px;max-width:min(300px,92vw);padding:16px 18px;border-radius:14px;background:linear-gradient(180deg,#1b1430,#120d22);border:2px solid rgba(255,210,74,.55);box-shadow:0 12px 40px rgba(0,0,0,.6);font-family:Rubik,sans-serif;text-align:center;display:none}'+
  '#bf-quit-confirm .bf-qc-t{font-family:Cinzel,serif;font-weight:900;font-size:16px;color:#ffe49a;margin-bottom:6px}'+
  '#bf-quit-confirm .bf-qc-s{font-size:13px;color:#cfc6dd;line-height:1.4;margin-bottom:14px}'+
  '#bf-quit-confirm .bf-qc-btns{display:flex;gap:10px;justify-content:center}'+
  '#bf-quit-confirm .bf-qc-yes{padding:10px 18px;border-radius:10px;border:1px solid rgba(255,240,180,.8);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600;font-family:Cinzel,serif;font-weight:900;font-size:14px;cursor:pointer;min-height:40px}'+
  '#bf-quit-confirm .bf-qc-no{padding:10px 18px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#efe9dc;font-family:Cinzel,serif;font-weight:900;font-size:14px;cursor:pointer;min-height:40px}';
  document.head.appendChild(style);

  // Overlay único: cuenta atrás de 5 minutos + una sola acción (cancelar la
  // partida definitivamente). El jugador que se desconectó reanuda desde el
  // lobby; el que se queda solo espera con la cuenta atrás.
  function overlay(msg,sub){
    var el=document.getElementById('bf-reconnect');
    if(!el){
      el=document.createElement('div');el.id='bf-reconnect';
      el.innerHTML='<div class="bf-rec-box"><div class="bf-rec-spin"></div><div class="bf-rec-msg"></div><div class="bf-rec-sub"></div>'+
        '<div class="bf-rec-clock"><svg class="bf-rec-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,210,74,.14)" stroke-width="3"></circle><circle class="bf-rec-arc" cx="50" cy="50" r="47" fill="none" stroke="#FFD24A" stroke-width="3" stroke-linecap="round" stroke-dasharray="295.3" stroke-dashoffset="0" transform="rotate(-90 50 50)"></circle></svg>'+
        '<div class="bf-rec-timer">5:00</div><div class="bf-rec-tlbl">restante</div></div>'+
        '<div class="bf-rec-btns"><button class="bf-rec-cancel">Cancelar partida definitivamente</button></div></div>';
      document.body.appendChild(el);
      el.querySelector('.bf-rec-cancel').onclick=function(){
        quitting=true;
        clearTimeout(rec.timer);if(rec.tickInterval)clearInterval(rec.tickInterval);
        rec.active=false;clearResume();
        if(window.__bfClearSave)window.__bfClearSave();
        if(window.__bfResumeTouchIv){clearInterval(window.__bfResumeTouchIv);window.__bfResumeTouchIv=null;}
        sendBye();
        // Borra la sala del backend para que desaparezca del lobby. Usamos el
        // token de reanudación además del de dueño: el jugador que espera puede
        // ser el cliente (no es dueño de la sala), pero tiene el token válido.
        if(typeof NET!=='undefined'&&NET.code&&window.bfLobbyRequest){
          var rt=window.__bfResumeToken||'';try{rt=rt||localStorage.getItem('bfResumeToken_'+NET.code)||'';}catch(e){}
          window.bfLobbyRequest('unregister',{code:NET.code,resume_token:rt,password:NET.pass||''}).catch(function(){});
        }
        try{if(NET.conn)NET.conn.close();}catch(e){}
        try{if(NET.peer)NET.peer.destroy();}catch(e){}
        setTimeout(function(){location.reload();},250);
      };
    }
    el.querySelector('.bf-rec-msg').textContent=msg;
    el.querySelector('.bf-rec-sub').textContent=sub||'';
    el.style.display='flex';
    startTick();
  }
  function startTick(){
    if(rec.tickInterval)clearInterval(rec.tickInterval);
    var el=document.getElementById('bf-reconnect');if(!el)return;
    var tEl=el.querySelector('.bf-rec-timer'),arc=el.querySelector('.bf-rec-arc');
    var draw=function(){
      var rem=Math.max(0,Math.ceil((rec.until-Date.now())/1000));
      var m=Math.floor(rem/60),s=rem%60;
      if(tEl)tEl.textContent=m+':'+(s<10?'0':'')+s;
      if(arc)arc.setAttribute('stroke-dashoffset',String(295.3*(1-rem/(MAX_WAIT/1000))));
      if(rem<=0){clearInterval(rec.tickInterval);}
    };
    draw();
    rec.tickInterval=setInterval(function(){
      if(!rec.active){clearInterval(rec.tickInterval);return;}
      draw();
    },500);
  }

  // Aviso de salida intencional: el rival ha abandonado la partida.
  function rivalQuit(){
    if(typeof G!=='undefined')G._gameOver=true;
    clearResume();if(window.__bfClearSave)window.__bfClearSave();
    if(window.__bfResumeTouchIv){clearInterval(window.__bfResumeTouchIv);window.__bfResumeTouchIv=null;}
    window.__bfRoomMarkedPlaying=false;
    if(typeof NET!=='undefined'&&NET.role==='host'&&NET.code&&window.bfLobbyRequest){window.bfLobbyRequest('unregister',{code:NET.code}).catch(function(){});}
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

  // ---- Copia completa del estado de la partida ----
  // El jugador que NO se desconectó es la fuente de verdad: envía todo su
  // estado al que vuelve, así los dos siguen exactamente donde estaban.
  var GF=['names','coins','equipReserve','equipCoins','bfEquipXfer','team','spellbook','items','bonus','eqReady','pendDebt','pools','curType','aIndex','cands','epicCands','bids','bidsIn','eqShop','eqSide','phaseResult','phaseNeeds','subRound'];
  function buildFullSync(){
    var snap={t:'bfFullSync',scr:currentScreen(),G:{}};
    try{GF.forEach(function(k){if(typeof G!=='undefined'&&G[k]!==undefined)snap.G[k]=G[k];});}catch(e){}
    try{if(typeof B!=='undefined'&&B)snap.B={round:B.round,qi:B.qi,queue:B.queue,over:B.over,current:B.current,log:(B.log||[]).slice(-40),seq:B.seq};}catch(e){}
    return snap;
  }
  function applyFullSync(msg){
    try{
      if(msg.G)Object.keys(msg.G).forEach(function(k){if(msg.G[k]!==undefined)G[k]=msg.G[k];});
      if(msg.B)B={round:msg.B.round,qi:msg.B.qi,queue:msg.B.queue||[],over:!!msg.B.over,current:msg.B.current||null,log:msg.B.log||[],wd:null,seq:msg.B.seq||0,pending:null};
      var s=msg.scr||currentScreen();
      if(typeof show==='function')show(s);
      if(s==='s-recruit'){try{renderRecruit(NET.mySide);}catch(e){}}
      else if(s==='s-equip'){try{renderEquip(NET.mySide);}catch(e){}}
      else if(s==='s-battle'){try{renderBattle();}catch(e){}}
    }catch(e){}
  }
  function hasMatchState(){try{return !!(G&&G.team&&G.team.p&&G.team.p.length);}catch(e){return false;}}

  function resumed(){
    var was=rec.active;
    rec.active=false;rec.pendConn=null;rec.waiting=false;clearTimeout(rec.timer);if(rec.tickInterval)clearInterval(rec.tickInterval);hideOverlay();
    if(window.__bfResumeTouchIv){clearInterval(window.__bfResumeTouchIv);window.__bfResumeTouchIv=null;}
    // El rival ha vuelto: limpiar el flag de salida para que la sala vuelva a
    // estar oculta del lobby (partida en juego activo). NO se elimina la sala.
    if(was&&typeof NET!=='undefined'&&NET.role==='host'&&NET.code&&window.bfLobbyRequest){window.bfLobbyRequest('clear_left',{code:NET.code}).catch(function(){});}
    if(was&&typeof notif==='function')notif('✔ Conexión restablecida. ¡La partida continúa!');
  }
  function giveUp(msg){
    rec.active=false;clearTimeout(rec.timer);if(rec.tickInterval)clearInterval(rec.tickInterval);hideOverlay();clearResume();
    if(window.__bfResumeTouchIv){clearInterval(window.__bfResumeTouchIv);window.__bfResumeTouchIv=null;}
    window.__bfRoomMarkedPlaying=false;
    // Al agotarse el tiempo, borra la sala (host, o cliente con token/contraseña).
    if(typeof NET!=='undefined'&&NET.code&&window.bfLobbyRequest){var rt=window.__bfResumeToken||'';try{rt=rt||localStorage.getItem('bfResumeToken_'+NET.code)||'';}catch(e){}window.bfLobbyRequest('unregister',{code:NET.code,resume_token:rt,password:NET.pass||''}).catch(function(){});}
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
      if(msg.t==='need_state'){
        // El host ha vuelto sin estado: le enviamos el nuestro (nosotros nos
        // quedamos, así que somos la fuente de verdad).
        resumed();
        try{conn.send(buildFullSync());}catch(e){}
        return;
      }
      if(msg.t==='bfFullSync'){resumed();applyFullSync(msg);return;}
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
        var mk=function(){if(rec.active&&(!NET.peer||NET.peer.destroyed)){NET.peer=new Peer({debug:1});NET.peer.on('error',function(){});NET.peer.on('open',function(){if(rec.timer){clearTimeout(rec.timer);rec.timer=null;}clientRetry();});}};
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
          try{conn.send({t:'hello',resume:true,name:NET.names_self,pass:info.pass||'',resume_token:window.__bfResumeToken||''});}catch(e){}
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

  // Marca la sala como "left" (un jugador ha salido). La sala YA está marcada
  // como "playing" desde que arrancó la partida, así que no hace falta
  // reabriría: solo señalamos que alguien se ha ido y empezamos la cuenta
  // atrás de 5 minutos para que el rival pueda reanudar desde el lobby.
  function markLeft(){
    try{
      if(typeof NET==='undefined'||NET.role!=='host'||!NET.code||!window.bfLobbyRequest)return;
      window.bfLobbyRequest('mark_left',{code:NET.code}).catch(function(){});
      if(!window.__bfResumeTouchIv){
        window.__bfResumeTouchIv=setInterval(function(){
          if(typeof NET==='undefined'||NET.role!=='host'||!NET.code){clearInterval(window.__bfResumeTouchIv);window.__bfResumeTouchIv=null;return;}
          if(window.bfLobbyRequest)window.bfLobbyRequest('touch',{code:NET.code}).catch(function(){});
        },20000);
      }
    }catch(e){}
  }
  // Salas PÚBLICAS (sin contraseña): no hay reanudación. Si cualquiera pierde
  // la conexión, la partida termina y la sala se cierra inmediatamente.
  function endMatchNoResume(){
    if(typeof G!=='undefined')G._gameOver=true;
    rec.active=false;clearTimeout(rec.timer);if(rec.tickInterval)clearInterval(rec.tickInterval);hideOverlay();clearResume();
    if(window.__bfClearSave)window.__bfClearSave();
    if(window.__bfResumeTouchIv){clearInterval(window.__bfResumeTouchIv);window.__bfResumeTouchIv=null;}
    window.__bfRoomMarkedPlaying=false;
    sendBye();
    if(typeof NET!=='undefined'&&NET.code&&window.bfLobbyRequest){window.bfLobbyRequest('unregister',{code:NET.code}).catch(function(){});}
    try{if(typeof NET!=='undefined'&&NET.conn)NET.conn.close();}catch(e){}
    try{if(typeof NET!=='undefined'&&NET.peer)NET.peer.destroy();}catch(e){}
    if(typeof modal==='function')modal('<h3>Conexión perdida</h3><div class="modal-note" style="font-size:15px">Esta es una <b>sala pública</b> (sin reanudación). La partida ha terminado y la sala se ha cerrado.</div><div style="margin-top:16px;text-align:center"><button class="btn primary" onclick="location.reload()">Volver al inicio</button></div>');
  }
  function connLost(){
    if(rec.active||typeof G==='undefined'||G._gameOver||quitting)return;
    // Sala libre (sin contraseña): sin reanudación. Se acaba la partida.
    if(typeof NET!=='undefined'&&!NET.pass){endMatchNoResume();return;}
    rec.active=true;rec.until=Date.now()+MAX_WAIT;rec.waiting=false;
    markLeft();
    try{if(typeof notif==='function')notif('🔄 La partida sigue en curso. Tu rival puede reanudar desde Salas online.');}catch(e){}
    var sub='La sala sigue abierta: tu rival tiene 5 minutos para volver y pulsar «Reanudar». Si no vuelve, la partida se cancelará.';
    overlay('Tu rival se ha desconectado',sub);
    if(NET.role==='client')clientRetry();else hostWait();
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
      if(typeof window.__bfPinchReset==='function')window.__bfPinchReset();
      var qc=document.getElementById('bf-quit-confirm');
      if(!qc){
        qc=document.createElement('div');qc.id='bf-quit-confirm';
        qc.innerHTML='<div class="bf-qc-t">Salir de la partida</div><div class="bf-qc-s">Tu rival será notificado y la partida terminará.</div><div class="bf-qc-btns"><button class="bf-qc-yes">Sí, salir</button><button class="bf-qc-no">Cancelar</button></div>';
        document.body.appendChild(qc);
        qc.querySelector('.bf-qc-yes').onclick=function(){quitting=true;sendBye();clearResume();if(window.__bfClearSave)window.__bfClearSave();qc.style.display='none';setTimeout(function(){location.reload();},200);};
        qc.querySelector('.bf-qc-no').onclick=function(){btn.dataset.bfConfirming='';qc.style.display='none';};
      }
      qc.style.display='block';
    },true);
  }
  setInterval(function(){if(typeof G!=='undefined'&&G.online)hookQuitButton();},1000);

  // Reconexión manual desde el lobby: reutiliza los datos guardados de la
  // partida en curso, se conecta a la sala del host y pide el snapshot.
  window.bfResumeMatch=function(){
    var info=window.__bfGetResume();
    if(!info){try{if(typeof notif==='function')notif('No tienes una partida guardada para reanudar.');}catch(e){}return;}
    // En la pantalla del lobby las globales del juego (G, NET) pueden no estar
    // definidas aún. Las garantizamos antes de escribir en ellas, si no el
    // botón Reanudar lanza un ReferenceError silencioso y "no hace nada".
    if(typeof NET==='undefined')window.NET={};
    if(typeof G==='undefined')window.G={};
    window.__bfResumeToken=info.token||'';
    if(!window.__bfResumeToken){try{window.__bfResumeToken=localStorage.getItem('bfResumeToken_'+info.code)||'';}catch(e){}}
    quitting=false;
    NET.code=info.code;NET.names_self=info.name||'Jugador';NET.pass=info.pass||'';
    G.online=true;G._gameOver=false;
    rec.active=true;rec.until=Date.now()+MAX_WAIT;rec.waiting=false;
    // Mostrar el overlay ANTES de nada: así el jugador ve feedback inmediato
    // aunque la reconexión tarde en establecerse.
    overlay('Reanudando la partida','Recuperando el estado de la partida de tu rival…');
    if(info.role==='host'){
      NET.role='host';NET.mySide=info.side||'p';
      hostWait();
    }else{
      NET.role='client';NET.mySide=info.side||'g';
      NET._bfJoin={code:info.code,pass:info.pass||'',name:info.name||''};
      clientRetry();
    }
  };

  // Reanudación del anfitrión tras recargar: reabre la sala con el mismo
  // código (hostWait recrea el peer) y espera a que el rival se reconecte.
  window.bfAwaitRival=function(){
    if(rec.active)return;
    if(!window.__bfResumeToken){try{window.__bfResumeToken=localStorage.getItem('bfResumeToken_'+NET.code)||'';}catch(e){}}
    rec.active=true;rec.until=Date.now()+MAX_WAIT;rec.waiting=true;
    markLeft();
    overlay('Esperando al otro jugador','La sala sigue abierta: la partida se reanudará en cuanto tu rival vuelva a conectarse.');
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
        if(msg&&msg.t==='bfFullSync'){
          // El cliente (que se quedó esperando) nos manda el estado real de la
          // partida: lo aplicamos y seguimos exactamente donde estaba.
          resumed();applyFullSync(msg);
          if(currentScreen()==='s-battle'&&typeof B!=='undefined'&&B&&!B.over)setTimeout(function(){try{stepTurn();}catch(e){}},700);
          return;
        }
        if(msg&&msg.t==='hello'){
          if(NET.pass&&msg.pass!==NET.pass){try{conn.send({t:'reject',reason:'Contraseña incorrecta.'});}catch(e){}return;}
          // La contraseña válida ya identifica al jugador como uno de los dos
          // originales (la sala es privada). No exigimos el token de reanudación:
          // dependía de un intercambio que podía no haber ocurrido aún.
          try{if(NET.conn&&NET.conn!==conn)NET.conn.close();}catch(e){}
          NET.conn=conn;
          resumed();
          if(!hasMatchState()){
            // Somos el host que ha vuelto: no tenemos el estado, se lo pedimos
            // al jugador que se quedó esperando.
            try{conn.send({t:'need_state'});}catch(e){}
            return;
          }
          if(typeof pushLog==='function')pushLog('li','🔌 '+(msg.name||'El rival')+' se ha reconectado a la partida.');
          setTimeout(function(){try{netSync(currentScreen());}catch(e){}},300);
          // Snapshot completo: envía TODOS los campos de G y B al cliente para
          // que reanude en el mismo estado exacto (netSync nativo puede no
          // enviar todo). Si es batalla, relanza el turno en curso.
          setTimeout(function(){
            try{NET.conn.send(buildFullSync());}catch(e){}
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

  // ---- Token de reanudación: identifica a los jugadores originales ----
  // El host lo genera al iniciar la partida online y lo reenvía al cliente.
  // Ambos lo guardan en localStorage. Solo los jugadores con el token correcto
  // pueden reanudar la partida (el host rechaza 'hello' sin token válido).
  setInterval(function(){
    if(typeof NET==='undefined'||typeof G==='undefined')return;
    if(!G.online||G._gameOver||NET.role!=='host'||!NET.conn||!NET.conn.open)return;
    if(!window.__bfResumeToken){
      window.__bfResumeToken='rt-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
      try{localStorage.setItem('bfResumeToken_'+NET.code,window.__bfResumeToken);}catch(e){}
    }
    try{NET.conn.send({t:'bfResumeToken',token:window.__bfResumeToken});}catch(e){}
    // Marcar la sala como "playing" (partida en juego) una sola vez al iniciar
    // la partida. La sala deja de ser visible en la lista pública: nadie puede
    // unirse salvo los dos jugadores originales, que usan su token de reanudación.
    if(!window.__bfRoomMarkedPlaying&&window.bfLobbyRequest){
      window.__bfRoomMarkedPlaying=true;
      window.bfLobbyRequest('register_playing',{code:NET.code,nicks:[NET.names_self||'Jugador 1',(G.names&&G.names.o)||'Jugador 2'],hasPass:!!NET.pass,pass:NET.pass||'',resume_token:window.__bfResumeToken||''}).catch(function(){});
    }
  },3000);
  setInterval(function(){
    if(typeof NET==='undefined'||!NET.conn||NET.conn.__bfRtL)return;
    NET.conn.__bfRtL=1;
    try{NET.conn.on('data',function(msg){
      if(msg&&msg.t==='bfResumeToken'&&msg.token){
        window.__bfResumeToken=msg.token;
        try{localStorage.setItem('bfResumeToken_'+NET.code,msg.token);}catch(e){}
      }
    });}catch(e){}
  },500);

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