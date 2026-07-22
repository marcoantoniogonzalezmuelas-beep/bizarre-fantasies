// Parche inyectado en el iframe: reconexión automática en partidas online.
// - Si se corta la conexión (cambio de pestaña, red móvil, error), la partida
//   NO se pierde: el cliente re-conecta a la sala y el host reenvía el estado
//   completo (snapshot), reanudando donde estaba.
// - Sustituye el modal fatal "Conexión perdida" por una superposición de
//   reconexión con opción de abandonar. Tras 2 minutos sin éxito, se rinde.
export const NET_RECONNECT_PATCH = `
<script>
(function(){
  if(window.__bfNetReconnect)return;
  window.__bfNetReconnect=true;
  var RETRY_MS=3000,MAX_WAIT=180000;
  var rec={active:false,until:0,timer:null,pendConn:null};

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
      if(i&&i.code&&Date.now()-(i.ts||0)<600000)return i;
    }catch(e){}
    return null;
  };
  setInterval(function(){
    if(typeof NET!=='undefined'&&typeof G!=='undefined'&&G.online&&!G._gameOver&&NET.role==='client'&&NET.code)saveResume();
  },4000);

  var style=document.createElement('style');
  style.textContent='#bf-reconnect{position:fixed;inset:0;z-index:100500;display:none;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at 50% 40%,rgba(20,12,34,.82),rgba(8,5,14,.94));backdrop-filter:blur(4px)}#bf-reconnect .bf-rec-box{text-align:center;max-width:340px;padding:26px 22px;border-radius:18px;background:linear-gradient(180deg,#1b1430,#120d22);border:2px solid rgba(255,210,74,.55);box-shadow:0 18px 50px rgba(0,0,0,.7)}#bf-reconnect .bf-rec-spin{width:44px;height:44px;margin:0 auto 14px;border-radius:50%;border:4px solid #3c3158;border-top-color:#FFD24A;animation:bfRecSpin 1s linear infinite}@keyframes bfRecSpin{to{transform:rotate(360deg)}}#bf-reconnect .bf-rec-msg{font-family:Cinzel,serif;font-weight:900;font-size:17px;color:#ffe49a}#bf-reconnect .bf-rec-sub{margin-top:8px;font-size:13px;line-height:1.4;color:#cfc6dd}#bf-reconnect .bf-rec-exit{margin-top:18px;padding:10px 20px;border-radius:11px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:#efe9dc;font-family:Cinzel,serif;font-weight:900;font-size:13px;cursor:pointer}';
  document.head.appendChild(style);

  function overlay(msg,sub){
    var el=document.getElementById('bf-reconnect');
    if(!el){
      el=document.createElement('div');el.id='bf-reconnect';
      el.innerHTML='<div class="bf-rec-box"><div class="bf-rec-spin"></div><div class="bf-rec-msg"></div><div class="bf-rec-sub"></div><button class="bf-rec-exit">Abandonar partida</button></div>';
      document.body.appendChild(el);
      el.querySelector('.bf-rec-exit').onclick=function(){location.reload();};
    }
    el.querySelector('.bf-rec-msg').textContent=msg;
    el.querySelector('.bf-rec-sub').textContent=sub||'';
    el.style.display='flex';
  }
  function hideOverlay(){var el=document.getElementById('bf-reconnect');if(el)el.style.display='none';}
  function currentScreen(){var a=document.querySelector('.screen.active');return a?a.id:'s-battle';}

  function resumed(){
    var was=rec.active;
    rec.active=false;rec.pendConn=null;clearTimeout(rec.timer);hideOverlay();
    if(was&&typeof notif==='function')notif('✔ Conexión restablecida. ¡La partida continúa!');
  }
  function giveUp(msg){
    rec.active=false;clearTimeout(rec.timer);hideOverlay();clearResume();
    if(typeof modal==='function')modal('<h3>Conexión perdida</h3><div class="modal-note" style="font-size:15px">'+(msg||'No se pudo recuperar la conexión con el otro jugador.')+'</div><div style="margin-top:16px;text-align:center"><button class="btn primary" onclick="location.reload()">Volver al inicio</button></div>');
  }

  function bindClientConn(conn){
    NET.conn=conn;
    conn.on('data',function(msg){
      if(!msg)return;
      if(msg.t==='reject'){giveUp(msg.reason||'Conexión rechazada.');return;}
      if(msg.t==='snap'){resumed();applySnapshot(msg);return;}
      if(msg.t==='end'){G._gameOver=true;hideOverlay();clearResume();showResult(msg.pWin===(NET.mySide==='p'));return;}
      if(msg.t==='welcome'){resumed();return;}
    });
    conn.on('close',function(){if(NET.conn===conn&&!G._gameOver)connLost();});
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
    if(rec.active||typeof G==='undefined'||G._gameOver)return;
    rec.active=true;rec.until=Date.now()+MAX_WAIT;
    if(NET.role==='client'){overlay('Conexión perdida','Reconectando con la sala… La partida se reanudará sola.');clientRetry();}
    else{overlay('El otro jugador se ha desconectado','Esperando a que vuelva… La partida se reanudará sola.');hostWait();}
  }
  window.__bfConnLost=connLost;

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
    rec.active=true;rec.until=Date.now()+MAX_WAIT;
    overlay('Esperando al otro jugador','La sala se ha reabierto. La partida se reanudará cuando vuelva a conectarse…');
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
        if(msg&&msg.t==='hello'){
          if(NET.pass&&msg.pass!==NET.pass){try{conn.send({t:'reject',reason:'Contraseña incorrecta.'});}catch(e){}return;}
          try{if(NET.conn&&NET.conn!==conn)NET.conn.close();}catch(e){}
          NET.conn=conn;
          resumed();
          if(typeof pushLog==='function')pushLog('li','🔌 '+(msg.name||'El rival')+' se ha reconectado a la partida.');
          setTimeout(function(){try{netSync(currentScreen());}catch(e){}},300);
        } else if(typeof handleIntent==='function')handleIntent(msg);
      });
      conn.on('close',function(){if(NET.conn===conn&&!G._gameOver)connLost();});
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
    if(c.open&&c.__bfLastSeen&&Date.now()-c.__bfLastSeen>90000){try{c.close();}catch(e){}return;}
    if(!c.open)connLost();
  },6000);
})();
</script>
`;