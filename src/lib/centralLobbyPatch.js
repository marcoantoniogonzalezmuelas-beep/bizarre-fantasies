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

  // Mapa nick → avatar (lo envía la página padre desde la BD). Se usa para
  // mostrar el avatar del creador en la tarjeta de la sala en vez del icono 🏠.
  window.__bfAvatarMap=window.__bfAvatarMap||{};
  window.addEventListener('message',function(event){
    if(event.data&&event.data.bfPlayerAvatars)window.__bfAvatarMap=event.data.bfPlayerAvatars||{};
  });
  function avatarFor(nick){if(!nick)return'';var m=window.__bfAvatarMap||{};return m[nick]||m[String(nick).toLowerCase()]||'';}
  function setAvatarIcon(iconEl,url){
    if(!iconEl)return;
    if(url){
      iconEl.textContent='';
      iconEl.innerHTML='<img src="'+url+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
    }else{
      iconEl.textContent='🏠';
    }
  }

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
      var icon=own.querySelector('.room-ico');if(icon)setAvatarIcon(icon,avatarFor(NET.names_self));
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
  function decorateRoomAvatars(){
    // Para cada tarjeta de sala visible, sustituye el icono genérico por el
    // avatar del creador (si lo conocemos). No toca la sala propia (la pinta
    // decorateHostedRoom) ni las de reanudación (las pinta decorateResumeRooms).
    var cards=document.querySelectorAll('.room-card');
    cards.forEach(function(card){
      if(card.dataset.bfAvatar==='1')return;
      if(card.style.border&&card.style.border.indexOf('FFD24A')!==-1)return; // sala propia
      if(card.dataset.bfResume==='1')return; // reanudación
      var nameEl=card.querySelector('.room-name');
      var nick=nameEl?nameEl.textContent.trim():'';
      var url=avatarFor(nick);
      if(!url)return;
      var icon=card.querySelector('.room-ico');
      if(icon){setAvatarIcon(icon,url);card.dataset.bfAvatar='1';}
    });
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
      if(btn){
        // Clonar el botón para eliminar cualquier listener nativo del juego que
        // pudiera interferir (p. ej. clientJoin) y colgarse del Reanudar.
        var clone=btn.cloneNode(true);
        clone.textContent='Reanudar';
        clone.className='btn primary sm';
        clone.onclick=function(){if(window.bfRejoinResumeRoom)window.bfRejoinResumeRoom(r.id,r.hasPass);};
        btn.parentNode.replaceChild(clone,btn);
      }
      });
      }
  window.bfRejoinResumeRoom=function(code,hasPass){
    // Solo los jugadores originales pueden reanudar: verifican con el token
    // guardado en localStorage. Un jugador que no estaba en la partida no
    // tiene el token y no puede unirse a la sala "Partida en curso".
    var token='';
    try{token=localStorage.getItem('bfResumeToken_'+code)||'';}catch(e){}
    var ri=window.__bfGetResume&&window.__bfGetResume();
    if(ri&&ri.token)token=token||ri.token;
    if(!token){
      try{if(typeof notif==='function')notif('No puedes unirte: no eres un jugador de esta partida.');else alert('No puedes unirte: no eres un jugador de esta partida.');}catch(e){}
      return;
    }
    // Reanudación única: se reconecta a la sala (como host o cliente, según el
    // rol guardado) y el jugador que se quedó le copia el estado de la partida.
    var resumeInfo=window.__bfGetResume&&window.__bfGetResume();
    if(!resumeInfo||resumeInfo.code!==code){
      try{if(typeof notif==='function')notif('No tienes una partida guardada para reanudar en esta sala.');else alert('No tienes una partida guardada para reanudar en esta sala.');}catch(e){}
      return;
    }
    if(window.bfResumeMatch)window.bfResumeMatch();
  };
  function injectLobbyInstructions(){
    var box=document.querySelector('#s-lobby .setup-box');
    if(!box||document.getElementById('bf-lobby-info'))return;
    var div=document.createElement('div');
    div.id='bf-lobby-info';
    div.style.cssText='margin:10px 0 14px;padding:12px 14px;border-radius:12px;background:linear-gradient(135deg,rgba(28,16,46,.7),rgba(12,7,20,.85));border:1px solid rgba(255,210,74,.3);font-family:Rubik,sans-serif;font-size:12.5px;line-height:1.5;color:#cfc6dd;box-shadow:0 4px 14px rgba(0,0,0,.3)';
    div.innerHTML='<div style="font-family:Cinzel,serif;font-weight:900;color:#ffd24a;font-size:13px;margin-bottom:6px;letter-spacing:.3px">ℹ️ Reanudación de partidas</div>'+
      'Si se cae tu conexión o sales por error, la sala <b style="color:#ffe49a">sigue abierta</b> como "Partida en curso" durante <b style="color:#ffe49a">5 minutos</b>. '+
      'Solo los dos jugadores originales pueden reanudar: entra en <b style="color:#ffe49a">Salas online</b>, busca tu sala y pulsa <b style="color:#ffe49a">Reanudar</b>. '+
      'La sala se cierra al terminar la partida o si nadie vuelve en 5 minutos.';
    box.insertBefore(div,box.firstChild);
  }
  function renderCentralList(){
    if(typeof renderRoomList==='function'&&typeof isLobby==='function'&&isLobby()&&canShowList()){renderRoomList();decorateHostedRoom();decorateRoomAvatars();decorateResumeRooms();injectResumeCard();injectLobbyInstructions();}
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
      // Si la partida YA ha empezado (el juego llama a dirUnregister desde
      // leaveLobbyForGame), NO borramos la sala del backend: debe quedar
      // registrada como "playing" (netReconnectPatch la marca) para que los
      // dos jugadores puedan reanudarla si se cae la conexión.
      if(typeof G!=='undefined'&&G.online)return Promise.resolve();
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