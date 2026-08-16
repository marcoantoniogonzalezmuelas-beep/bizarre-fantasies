// Parche INDEPENDIENTE y robusto: garantiza que el ciclo de vida de las salas
// en el backend central (gameLobby) funcione siempre, aunque CENTRAL_LOBBY_PATCH
// no llegue a ejecutarse.
//
// El juego nativo tiene su propio directorio P2P (PeerJS) y llama a
// dirUnregister() al empezar la partida (leaveLobbyForGame), lo que elimina
// la sala del directorio. Sin este parche, la sala nunca se registra en el
// backend central, así que nadie puede reanudarla tras una desconexión.
//
// Este parche:
// 1. Define bfLobbyRequest (postMessage → parent → gameLobby backend).
// 2. Envuelve dirRegister para registrar ALSO la sala en el backend central.
// 3. Envuelve dirUnregister: NO elimina del backend central si la partida ya
//    empezó (G.online) — la sala debe quedar como "playing" para reanudar.
//    Sí la elimina si el anfitrión cancela antes de empezar (G.online false).
// 4. Sustituye refreshList por una versión que obtiene las salas del backend
//    central (incluidas las "Partida en curso" con botón Reanudar).
// 5. Inyecta el cartel informativo de reanudación en el lobby.
//
// Todos con guards: si CENTRAL_LOBBY_PATCH ya definió algo, no se duplica.
export const LOBBY_INFO_PATCH = `
<script>
(function(){
  if(window.__bfLobbyCorePatch)return;
  window.__bfLobbyCorePatch=true;

  // ---- 1. Sistema de petición al backend (postMessage → parent → gameLobby) ----
  if(!window.bfLobbyRequest){
    var pending={},seq=0;
    var ownerToken='bf-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
    window.__bfLobbyOwnerToken=ownerToken;
    window.bfLobbyRequest=function(action,data){
      return new Promise(function(resolve,reject){
        var requestId='lobby-'+(++seq);pending[requestId]={resolve:resolve,reject:reject};
        var payload=Object.assign({action:action,token:ownerToken},data||{});
        window.parent.postMessage({bfLobby:{requestId:requestId,payload:payload}},'*');
        setTimeout(function(){if(!pending[requestId])return;delete pending[requestId];reject(new Error('timeout'));},8000);
      });
    };
    window.addEventListener('message',function(event){
      var result=event.data&&event.data.bfLobbyResult;if(!result||!pending[result.requestId])return;
      var task=pending[result.requestId];delete pending[result.requestId];
      if(result.error)task.reject(new Error(result.error));else task.resolve(result.data||{});
    });
  }

  // ---- 2. Envolver dirRegister para registrar también en el backend central ----
  // El juego nativo llama a dirRegister(code, name, hasPass) cuando el peer del
  // host abre. Lo envolvemos para que, además del directorio P2P nativo, registre
  // la sala en el backend central (gameLobby). Así refreshList puede mostrarla.
  function wrapDirRegister(){
    if(window.__bfDirRegWrapped||typeof window.dirRegister!=='function')return;
    window.__bfDirRegWrapped=true;
    var orig=window.dirRegister;
    window.dirRegister=function(code,name,hasPass){
      try{
        if(window.bfLobbyRequest){
          window.bfLobbyRequest('register',{code:code,name:name,hasPass:!!hasPass}).catch(function(){});
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
  }

  // ---- 3. Envolver dirUnregister: NO eliminar del backend si la partida empezó ----
  // leaveLobbyForGame() llama a dirUnregister() al empezar la partida. Si eliminamos
  // la sala del backend central en ese momento, nadie puede reanudar. Así que
  // solo eliminamos del backend central si la partida NO ha empezado (G.online
  // es false, p. ej. el anfitrión cancela la sala antes de que nadie se una).
  function wrapDirUnregister(){
    if(window.__bfDirUnregWrapped||typeof window.dirUnregister!=='function')return;
    window.__bfDirUnregWrapped=true;
    var orig=window.dirUnregister;
    window.dirUnregister=function(){
      try{
        var gameStarted=(typeof G!=='undefined'&&G.online);
        if(!gameStarted){
          var rid=(typeof NET!=='undefined'&&NET.code)?NET.code:(typeof LOBBY!=='undefined'?LOBBY.rid:'');
          if(rid&&window.bfLobbyRequest)window.bfLobbyRequest('unregister',{code:rid}).catch(function(){});
        }
        // Si la partida ya empezó, NO eliminamos del backend central: la sala
        // debe quedar como "playing" para que el rival pueda reanudar.
      }catch(e){}
      return orig.apply(this,arguments);
    };
  }

  // ---- 4. refreshList: obtener salas del backend central ----
  // Sustituye refreshList por una versión que obtiene las salas del backend
  // central (gameLobby), que incluye tanto las "waiting" como las "playing"
  // con left_at ("Partida en curso" reanudable). Si CENTRAL_LOBBY_PATCH ya
  // sustituyó refreshList, no lo pisamos.
  function setupRefreshList(){
    if(window.__bfRefreshListWrapped)return;
    if(typeof window.renderRoomList!=='function'||typeof window.isLobby!=='function')return;
    if(typeof LOBBY==='undefined')return;
    // Si CENTRAL_LOBBY_PATCH ya sustituyó refreshList, no lo pisamos.
    if(window.refreshList&&window.refreshList.__bfCentral)return;
    window.__bfRefreshListWrapped=true;
    window.refreshList=function(){
      try{
        LOBBY.role='central';
        window.bfLobbyRequest('list',{}).then(function(data){
          LOBBY.rooms=data.rooms||[];
          if(typeof isLobby==='function'&&isLobby()){
            renderRoomList();
            decorateResumeRooms();
            injectInfo();
          }
        }).catch(function(){});
      }catch(e){}
    };
    window.refreshList.__bfCentral=true;
    // lobbyConnect: el juego nativo lo llama al entrar en "Salas online".
    if(typeof window.lobbyConnect==='function'&&!window.lobbyConnect.__bfCentral){
      var origLC=window.lobbyConnect;
      window.lobbyConnect=function(){window.refreshList();};
      window.lobbyConnect.__bfCentral=true;
    }
  }

  // ---- Decorar salas "Partida en curso" con botón Reanudar ----
  function decorateResumeRooms(){
    try{
      if(typeof LOBBY==='undefined'||!LOBBY.rooms)return;
      LOBBY.rooms.forEach(function(r){
        if(!r.isResume)return;
        var cards=document.querySelectorAll('.room-card');
        cards.forEach(function(c){
          var codeEl=c.querySelector('.room-sub b');
          if(!codeEl||codeEl.textContent.trim()!==r.id)return;
          if(c.dataset.bfResume==='1')return;
          c.dataset.bfResume='1';
          c.style.border='2px solid #7ddf7d';
          c.style.boxShadow='0 0 18px rgba(90,220,120,.35)';
          var ico=c.querySelector('.room-ico');if(ico)ico.textContent='🔄';
          var name=c.querySelector('.room-name');if(name)name.textContent='Partida en curso';
          var sub=c.querySelector('.room-sub');
          if(sub){var nicks=(r.nicks||[]).join(' vs ');sub.innerHTML='código <b>'+r.id+'</b> · '+(nicks||'')+(r.hasPass?' · 🔒':'');}
          var btn=c.querySelector('button');
          if(btn){btn.textContent='Reanudar';btn.className='btn primary sm';btn.setAttribute('onclick','bfRejoinResumeRoom(\\''+r.id+'\\','+(r.hasPass?1:0)+')');}
        });
      });
    }catch(e){}
  }
  window.bfRejoinResumeRoom=function(code,hasPass){
    var token='';
    try{token=localStorage.getItem('bfResumeToken_'+code)||'';}catch(e){}
    var ri=window.__bfGetResume&&window.__bfGetResume();
    if(ri&&ri.token)token=token||ri.token;
    if(!token){
      try{if(typeof notif==='function')notif('No puedes unirte: no eres un jugador de esta partida.');else alert('No puedes unirte: no eres un jugador de esta partida.');}catch(e){}
      return;
    }
    var savedHost=null;
    try{savedHost=JSON.parse(localStorage.getItem('bfSavedMatch')||'null');}catch(e){}
    if(savedHost&&savedHost.code===code&&window.__bfRestoreHost){window.__bfRestoreHost(savedHost);return;}
    if(typeof NET!=='undefined'&&NET.role==='host'&&NET.code===code&&window.bfAwaitRival){window.bfAwaitRival();return;}
    var resumeInfo=window.__bfGetResume&&window.__bfGetResume();
    if(!resumeInfo||resumeInfo.code!==code){
      try{if(typeof notif==='function')notif('No tienes una partida guardada para reanudar en esta sala.');else alert('No tienes una partida guardada para reanudar en esta sala.');}catch(e){}
      return;
    }
    if(window.bfResumeMatch)window.bfResumeMatch();
  };

  // ---- 5. Cartel informativo de reanudación ----
  var INFO_HTML =
    '<div style="font-family:Cinzel,serif;font-weight:900;color:#ffd24a;font-size:13px;margin-bottom:6px;letter-spacing:.3px">ℹ️ Reanudación de partidas</div>'+
    'Si se cae tu conexión o sales por error, la sala <b style="color:#ffe49a">sigue abierta</b> como "Partida en curso" durante <b style="color:#ffe49a">5 minutos</b>. '+
    'Solo los dos jugadores originales pueden reanudar: entra en <b style="color:#ffe49a">Salas online</b>, busca tu sala y pulsa <b style="color:#ffe49a">Reanudar</b>. '+
    'La sala se cierra al terminar la partida o si nadie vuelve en 5 minutos.';
  function injectInfo(){
    try{
      var box=document.querySelector('#s-lobby .setup-box');
      if(!box)return;
      if(document.getElementById('bf-lobby-info'))return;
      var h=box.querySelector('h2');
      if(h&&!/Salas online/i.test(h.textContent))return;
      var div=document.createElement('div');
      div.id='bf-lobby-info';
      div.style.cssText='margin:10px 0 14px;padding:12px 14px;border-radius:12px;background:linear-gradient(135deg,rgba(28,16,46,.7),rgba(12,7,20,.85));border:1px solid rgba(255,210,74,.3);font-family:Rubik,sans-serif;font-size:12.5px;line-height:1.5;color:#cfc6dd;box-shadow:0 4px 14px rgba(0,0,0,.3)';
      div.innerHTML=INFO_HTML;
      box.insertBefore(div,box.firstChild);
    }catch(e){}
  }

  // ---- Inicialización: envolver funciones nativas cuando existan ----
  var tries=0;
  var iv=setInterval(function(){
    wrapDirRegister();
    wrapDirUnregister();
    setupRefreshList();
    injectInfo();
    tries++;
    if(tries>80)clearInterval(iv);
  },200);
  // Intento inmediato
  wrapDirRegister();wrapDirUnregister();setupRefreshList();injectInfo();
})();
</script>
`;