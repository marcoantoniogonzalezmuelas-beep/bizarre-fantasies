export const CENTRAL_LOBBY_PATCH = `
<script>
(function(){
  if(window.__bfCentralLobby)return;
  window.__bfCentralLobby=true;
  var pending={},seq=0,ownerToken='bf-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),retryCount=0;

  function request(action,data){
    return new Promise(function(resolve,reject){
      var requestId='lobby-'+(++seq);pending[requestId]={resolve:resolve,reject:reject};
      var payload=Object.assign({action:action,token:ownerToken},data||{});
      window.parent.postMessage({bfLobby:{requestId:requestId,payload:payload}},'*');
      setTimeout(function(){if(!pending[requestId])return;delete pending[requestId];reject(new Error('timeout'));},8000);
    });
  }
  window.addEventListener('message',function(event){
    var result=event.data&&event.data.bfLobbyResult;if(!result||!pending[result.requestId])return;
    var task=pending[result.requestId];delete pending[result.requestId];
    if(result.error)task.reject(new Error(result.error));else task.resolve(result.data||{});
  });
  // Expone la función de petición al lobby para que otros parches (p. ej.
  // netReconnectPatch) puedan registrar la sala como "partida en curso".
  window.bfLobbyRequest=request;

  function inBrowseView(){
    // Solo se puede redibujar la lista si el lobby muestra la lista de salas.
    // Si hay un formulario abierto (crear sala, local, unirse), un re-render
    // lo borraría mientras el jugador escribe.
    var h=document.querySelector('#s-lobby h2');
    return !h||/Salas online/i.test(h.textContent);
  }
  function canShowList(){
    if(!inBrowseView())return false;
    if(typeof NET==='undefined')return false;
    if(!NET.role)return true;
    if(NET.role==='host')return !!(LOBBY._reg&&LOBBY._reg.confirmed);
    // Cliente sin conexión activa (p. ej. intento de unión fallido): la lista
    // debe seguir viéndose; antes quedaba en blanco para siempre.
    return !(NET.conn&&NET.conn.open);
  }
  function decorateHostedRoom(){
    if(typeof NET==='undefined'||NET.role!=='host'||!NET.code)return;
    var cards=document.querySelectorAll('.room-card'),own=null;
    cards.forEach(function(card){var code=card.querySelector('.room-sub b');if(code&&code.textContent.trim()===NET.code)own=card;});
    if(own){
      own.style.border='2px solid #FFD24A';own.style.boxShadow='0 0 20px rgba(255,210,74,.35)';
      var icon=own.querySelector('.room-ico');if(icon)icon.textContent='🏠';
      var join=own.querySelector('button');if(join){join.textContent='Cancelar sala';join.className='btn sm';join.onclick=window.bfCancelHostedRoom;}
      var sub=own.querySelector('.room-sub');if(sub&&!sub.querySelector('.bf-own-room'))sub.insertAdjacentHTML('beforeend',' · <b class="bf-own-room" style="color:#FFD24A">TU SALA</b>');
    }
    Array.from(document.querySelectorAll('#s-lobby button')).forEach(function(button){if(/Crear sala/i.test(button.textContent)){button.disabled=true;button.textContent='🏠 Tu sala está activa';}});
  }
  function injectResumeCard(){
    // Si hay una partida en curso guardada en este dispositivo, mostrar una
    // tarjeta destacada para volver a entrar y retomarla.
    var info=window.__bfGetResume&&window.__bfGetResume();
    if(!info||document.getElementById('bf-resume-card'))return;
    if(typeof NET!=='undefined'&&NET.role)return;
    var box=document.querySelector('#s-lobby .setup-box');if(!box)return;
    var html='<div id="bf-resume-card" class="room-card" style="border:2px solid #7ddf7d;box-shadow:0 0 18px rgba(90,220,120,.35)"><div class="room-ico">🔌</div><div class="room-info"><div class="room-name">Tienes una partida en curso</div><div class="room-sub">código <b>'+info.code+'</b> · puedes volver a entrar y continuar</div></div><button class="btn primary sm" onclick="bfResumeMatch()">Reconectar</button></div>';
    var first=box.querySelector('.room-card');
    if(first)first.insertAdjacentHTML('beforebegin',html);
    else box.insertAdjacentHTML('beforeend',html);
  }
  function decorateResumeRooms(){
    if(typeof LOBBY==='undefined'||!LOBBY.rooms)return;
    LOBBY.rooms.forEach(function(r){
      if(!r.isResume)return;
      var cards=document.querySelectorAll('.room-card');
      var card=null;
      cards.forEach(function(c){var codeEl=c.querySelector('.room-sub b');if(codeEl&&codeEl.textContent.trim()===r.id)card=c;});
      if(!card||card.dataset.bfResume==='1')return;
      card.dataset.bfResume='1';
      card.style.border='2px solid #7ddf7d';
      card.style.boxShadow='0 0 18px rgba(90,220,120,.35)';
      var ico=card.querySelector('.room-ico');if(ico)ico.textContent='🔄';
      var name=card.querySelector('.room-name');if(name)name.textContent='Partida en curso';
      var sub=card.querySelector('.room-sub');
      if(sub){var nicks=(r.nicks||[]).join(' vs ');sub.innerHTML='código <b>'+r.id+'</b> · '+(nicks||'')+(r.hasPass?' · 🔒':'');}
      var btn=card.querySelector('button');
      if(btn){btn.textContent='Reanudar';btn.className='btn primary sm';btn.setAttribute('onclick','bfRejoinResumeRoom(\''+r.id+'\','+(r.hasPass?1:0)+')');}
    });
  }
  window.bfRejoinResumeRoom=function(code,hasPass){
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
  function renderCentralList(){
    if(typeof renderRoomList==='function'&&typeof isLobby==='function'&&isLobby()&&canShowList()){renderRoomList();decorateHostedRoom();decorateResumeRooms();injectResumeCard();}
  }
  function centralList(){
    if(typeof LOBBY==='undefined')return;
    LOBBY.role='central';
    request('list').then(function(data){LOBBY.rooms=data.rooms||[];renderCentralList();}).catch(renderCentralList);
  }

  function install(){
    if(typeof LOBBY==='undefined'||typeof window.hostCreate!=='function'||typeof window.renderRoomList!=='function')return false;
    window.lobbyConnect=function(){LOBBY.role='central';centralList();};
    window.refreshList=centralList;
    window.dirRegister=function(code,name,hasPass){
      LOBBY._reg={code:code,name:name,hasPass:hasPass,confirmed:false};
      var attempts=0;
      return new Promise(function(resolve,reject){
        function register(){
          attempts+=1;
          request('register',{code:code,name:name,hasPass:!!hasPass}).then(function(data){
            if(!data||data.ok!==true)throw new Error('register rejected');
            return request('list');
          }).then(function(data){
            LOBBY.rooms=data.rooms||[];
            var visible=LOBBY.rooms.some(function(room){return room.id===code;});
            if(!visible)throw new Error('room not visible');
            if(LOBBY._reg&&LOBBY._reg.code===code)LOBBY._reg.confirmed=true;
            resolve({ok:true});
          }).catch(function(error){
            if(attempts<3){setTimeout(register,800*attempts);return;}
            if(LOBBY._reg&&LOBBY._reg.code===code)LOBBY._reg=null;
            reject(error);
          });
        }
        register();
      });
    };
    window.dirUnregister=function(){
      var r=LOBBY._reg;if(!r)return Promise.resolve();
      LOBBY._reg=null;return request('unregister',{code:r.code}).catch(function(){});
    };
    window.bfCancelHostedRoom=function(){
      var code=NET.code;
      Promise.resolve(window.dirUnregister()).then(function(){
        if(NET.conn){try{NET.conn.close();}catch(e){}}if(NET.peer){try{NET.peer.destroy();}catch(e){}}
        NET.conn=null;NET.peer=null;NET.role=null;NET.code='';
        centralList();
      });
    };

    centralList();
    return true;
  }

  var tries=0,timer=setInterval(function(){if(install()||tries++>50)clearInterval(timer);},100);
  // Refresco frecuente (8s) para que las salas nuevas aparezcan enseguida;
  // el "toque" del host mantiene su sala visible en el servidor cada ~24s.
  var tick=0;
  setInterval(function(){
    tick++;
    if(tick%3===0&&typeof NET!=='undefined'&&NET.role==='host'&&NET.code&&NET.peer&&NET.peer.open&&!(NET.conn&&NET.conn.open))request('touch',{code:NET.code}).catch(function(){});
    if(typeof isLobby==='function'&&isLobby()&&canShowList())centralList();
  },8000);
})();
</script>
`;