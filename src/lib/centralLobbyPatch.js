export const CENTRAL_LOBBY_PATCH = `
<style id="bf-lobby-ready-css">
/* Al entrar en "Salas online" el juego pinta primero SU lista nativa y un
   instante después llega la lista central ya decorada (instrucciones,
   avatares, Habitación Bizarra…). Ese primer pintado se oculta para que solo
   se vea la pantalla definitiva. */
#s-lobby .setup-box{visibility:hidden}
#s-lobby.bf-lobby-ready .setup-box{visibility:visible}
</style>
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
  // Expone la función de petición al lobby para que el parche de relay pueda
  // registrar la sala como "partida en curso".
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
      // El icono de la sala (.room-ico) no tiene ancho/alto fijo: se ajusta al
      // contenido (el emoji 🏠). Si ponemos un <img> con width:100%, el
      // porcentaje se resuelve contra un padre "auto" y la imagen sale a su
      // tamaño natural (enorme). Por eso medimos el icono ANTES de vaciarlo
      // y fijamos ese tamaño en el <img> en píxeles.
      var w=iconEl.offsetWidth||40,h=iconEl.offsetHeight||40;
      iconEl.textContent='';
      iconEl.innerHTML='<img src="'+url+'" alt="" style="display:block;width:'+w+'px;height:'+h+'px;object-fit:cover;border-radius:50%">';
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
      var isFree=!NET.pass;
      own.style.border=isFree?'2px solid #6aa6ff':'2px solid #FFD24A';
      own.style.boxShadow=isFree?'0 0 20px rgba(90,150,255,.35)':'0 0 20px rgba(255,210,74,.35)';
      var icon=own.querySelector('.room-ico');if(icon)setAvatarIcon(icon,avatarFor(NET.names_self));
      var join=own.querySelector('button');if(join){join.textContent='Cancelar sala';join.className='btn sm';join.onclick=window.bfCancelHostedRoom;}
      var sub=own.querySelector('.room-sub');if(sub&&!sub.querySelector('.bf-own-room'))sub.insertAdjacentHTML('beforeend',' · <b class="bf-own-room" style="color:'+(isFree?'#a8c4ff':'#FFD24A')+'">TU SALA '+(isFree?'PÚBLICA':'PRIVADA')+'</b>');
    }
    Array.from(document.querySelectorAll('#s-lobby button')).forEach(function(button){if(/Crear sala/i.test(button.textContent)){button.disabled=true;button.textContent='🏠 Tu sala está activa';}});
  }
  function decorateRoomAvatars(){
    // Para cada tarjeta de sala visible, sustituye el icono genérico por el
    // avatar del creador. El avatar llega desde el backend (room.avatar), así
    // que lo ve TODO el mundo, no solo el creador. No toca la sala propia (la
    // pinta decorateHostedRoom) ni las de reanudación (las pinta
    // decorateResumeRooms). Las salas LIBRES (sin contraseña) se diferencian
    // por color azul; las privadas llevan el borde dorado habitual.
    var avByCode={};
    if(typeof LOBBY!=='undefined'&&LOBBY.rooms){
      LOBBY.rooms.forEach(function(r){if(r&&r.id&&r.avatar)avByCode[r.id]=r.avatar;});
    }
    var cards=document.querySelectorAll('.room-card');
    cards.forEach(function(card){
      if(card.dataset.bfAvatar==='1')return;
      if(card.style.border&&card.style.border.indexOf('FFD24A')!==-1)return; // sala propia
      if(card.dataset.bfResume==='1')return; // reanudación
      var codeEl=card.querySelector('.room-sub b');
      var code=codeEl?codeEl.textContent.trim():'';
      var url=avByCode[code]||'';
      if(!url){
        var nameEl=card.querySelector('.room-name');
        var nick=nameEl?nameEl.textContent.trim():'';
        url=avatarFor(nick);
      }
      if(url){
        var icon=card.querySelector('.room-ico');
        if(icon){setAvatarIcon(icon,url);card.dataset.bfAvatar='1';}
      }
      // Diferenciación por color: salas públicas (sin contraseña) en azul.
      var room=LOBBY.rooms&&LOBBY.rooms.find(function(r){return r&&r.id===code;});
      if(room&&!room.hasPass&&!room.isResume){
        card.style.border='2px solid #6aa6ff';
        card.style.boxShadow='0 0 16px rgba(90,150,255,.3)';
        if(!card.querySelector('.bf-free-badge')){
          var badge=document.createElement('span');
          badge.className='bf-free-badge';
          badge.style.cssText='position:absolute;top:6px;left:6px;font-size:9px;font-weight:900;letter-spacing:.5px;color:#a8c4ff;background:rgba(20,40,80,.7);border:1px solid rgba(90,150,255,.5);border-radius:6px;padding:2px 6px';
          badge.textContent='PÚBLICA';
          card.style.position=card.style.position||'relative';
          card.appendChild(badge);
        }
      }
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
      if(sub){var nicks=(r.nicks||[]).join(' vs ');sub.innerHTML='código <b>'+r.id+'</b> · '+(nicks||'')+(r.hasPass?' · 🔒':' · 🆓');}
      var btn=card.querySelector('button');
      if(btn){
        // Clonar el botón para eliminar cualquier listener nativo del juego que
        // pudiera interferir (p. ej. clientJoin) y colgarse del Reanudar.
        var clone=btn.cloneNode(true);
        clone.textContent='Reanudar';
        clone.className='btn primary sm';
        clone.onclick=function(){if(window.bfRelayResume)window.bfRelayResume(r.id,r.hasPass,r.nicks||[]);};
        btn.parentNode.replaceChild(clone,btn);
      }
      });
      }
  // Reanudar partida con relay por servidor: el estado está en el servidor,
  // así que reanudar = pedir la contraseña (si la hay) y llamar a
  // bfRelayResumeGame (que hace gameRelay.resume y recibe el estado actual).
  // Funciona para salas públicas y privadas, y para host e invitado.
  window.bfRelayResume=function(code,hasPass,nicks){
    var nick='';
    try{nick=localStorage.getItem('bfMyNick')||localStorage.getItem('bfNick')||'';}catch(e){}
    // Si el nick coincide con uno de los originales, usa esa grafía exacta.
    var matchNick=(nicks||[]).find(function(n){return String(n).toLowerCase()===String(nick).toLowerCase();});
    if(matchNick)nick=matchNick;
    function doResume(pass){
      if(window.bfRelayResumeGame)window.bfRelayResumeGame(code,pass,nick,nicks||[]);
      else if(typeof window.clientJoin==='function')window.clientJoin(code,pass,nick);
    }
    if(!hasPass){
      // Sala pública: reanudar directamente (sin contraseña).
      doResume('');
      return;
    }
    // Sala privada: pedir la contraseña.
    var el=document.getElementById('bf-resume-pass');
    if(!el){
      var st=document.createElement('style');
      st.textContent='#bf-resume-pass{position:fixed;inset:0;z-index:100700;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at 50% 40%,rgba(20,12,34,.85),rgba(8,5,14,.95));backdrop-filter:blur(4px)}#bf-resume-pass .bf-rp-box{max-width:340px;width:100%;padding:24px 22px;border-radius:18px;background:linear-gradient(180deg,#1b1430,#120d22);border:2px solid rgba(255,210,74,.55);box-shadow:0 18px 50px rgba(0,0,0,.7);text-align:center;font-family:Rubik,sans-serif}#bf-resume-pass .bf-rp-t{font-family:Cinzel,serif;font-weight:900;font-size:18px;color:#ffe49a}#bf-resume-pass .bf-rp-s{margin-top:8px;font-size:13px;color:#cfc6dd;line-height:1.45}#bf-resume-pass .bf-rp-err{display:none;margin-top:10px;padding:9px 11px;border-radius:10px;background:rgba(120,30,30,.4);border:1px solid rgba(255,120,100,.55);color:#ffb0a0;font-size:12.5px;font-weight:700}#bf-resume-pass .bf-rp-in{margin-top:14px;width:100%;box-sizing:border-box;padding:11px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#efe9dc;font-size:15px;text-align:center}#bf-resume-pass .bf-rp-btns{margin-top:16px;display:flex;gap:10px;justify-content:center}#bf-resume-pass .bf-rp-ok{padding:11px 20px;border-radius:11px;border:1px solid rgba(255,240,180,.8);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600;font-family:Cinzel,serif;font-weight:900;font-size:14px;cursor:pointer}#bf-resume-pass .bf-rp-no{padding:11px 20px;border-radius:11px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#efe9dc;font-family:Cinzel,serif;font-weight:900;font-size:14px;cursor:pointer}';
      document.head.appendChild(st);
      el=document.createElement('div');
      el.id='bf-resume-pass';
      el.innerHTML='<div class="bf-rp-box"><div class="bf-rp-t">Reanudar la partida</div><div class="bf-rp-s">Escribe la <b>contraseña de la sala</b> para volver a entrar. El estado de la partida está guardado en el servidor.</div><div class="bf-rp-err"></div><input class="bf-rp-in" type="password" autocomplete="off" placeholder="Contraseña de la sala"><div class="bf-rp-btns"><button class="bf-rp-ok">Reanudar</button><button class="bf-rp-no">Cancelar</button></div></div>';
      document.body.appendChild(el);
      var input=el.querySelector('.bf-rp-in');
      var go=function(){
        var pass=String(input.value||'').trim();
        if(!pass){el.querySelector('.bf-rp-err').style.display='block';el.querySelector('.bf-rp-err').textContent='⚠️ Escribe la contraseña de la sala.';return;}
        el.style.display='none';
        doResume(pass);
      };
      el.querySelector('.bf-rp-ok').onclick=go;
      input.addEventListener('keydown',function(e){if(e.key==='Enter')go();});
      el.querySelector('.bf-rp-no').onclick=function(){el.style.display='none';};
    }
    el.dataset.code=code;
    el.querySelector('.bf-rp-err').style.display='none';
    el.querySelector('.bf-rp-in').value='';
    el.style.display='flex';
    setTimeout(function(){try{el.querySelector('.bf-rp-in').focus();}catch(e){}},80);
  };
  function injectLobbyInstructions(){
    var box=document.querySelector('#s-lobby .setup-box');
    if(!box||document.getElementById('bf-lobby-info'))return;
    var div=document.createElement('div');
    div.id='bf-lobby-info';
    div.style.cssText='margin:10px 0 14px;padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,rgba(28,16,46,.75),rgba(12,7,20,.9));border:1px solid rgba(255,210,74,.32);font-family:Rubik,sans-serif;font-size:12.5px;line-height:1.55;color:#cfc6dd;box-shadow:0 4px 14px rgba(0,0,0,.3)';
    div.innerHTML=
      '<div style="font-family:Cinzel,serif;font-weight:900;color:#ffd24a;font-size:14px;margin-bottom:8px;letter-spacing:.3px">🎮 ¿Cómo jugar online?</div>'+
      '<div style="margin-bottom:10px">'+
        '<div style="font-weight:800;color:#ffe49a;margin-bottom:3px">🔒 Sala privada (con contraseña)</div>'+
        'Creas la sala con una <b style="color:#ffe49a">contraseña</b> y compartes el <b style="color:#ffe49a">código</b> con tu rival. Solo quien tenga la contraseña puede unirse.</div>'+
      '<div style="margin-bottom:10px">'+
        '<div style="font-weight:800;color:#a8c4ff;margin-bottom:3px">🆓 Sala pública (sin contraseña)</div>'+
        'Sala abierta <b style="color:#a8c4ff">sin contraseña</b>: cualquiera con el código puede entrar directamente.</div>'+
      '<div style="margin-bottom:10px">'+
        '<div style="font-weight:800;color:#9adf9a;margin-bottom:3px">🔌 Reanudar una partida</div>'+
        'Si se cae tu conexión, la sala sigue abierta como "Partida en curso" durante <b style="color:#ffe49a">10 minutos</b>. Busca tu sala y pulsa <b style="color:#ffe49a">Reanudar</b>. Funciona en <b>salas públicas y privadas</b>.</div>'+
      '<div style="margin-bottom:10px">'+
        '<div style="font-weight:800;color:#e2b0ff;margin-bottom:3px">🃏 Habitación Bizarra</div>'+
        'Entras con tu nick y pulsas el <b style="color:#e2b0ff">Botón de Pánico</b>: te empareja al azar con otro visitante. Mínimo <b style="color:#e2b0ff">3 jugadores</b> dentro.</div>'+
      '<div style="padding-top:8px;border-top:1px solid rgba(255,210,74,.18);font-size:11.5px;color:#b8aacb">'+
        '💡 También puedes jugar <b style="color:#ffe49a">Local</b> (2 jugadores en este dispositivo) o contra la <b style="color:#ffe49a">IA</b> (4 niveles) desde el menú principal.</div>';
    box.insertBefore(div,box.firstChild);
  }
  function revealLobby(){var s=document.getElementById('s-lobby');if(s)s.classList.add('bf-lobby-ready');}
  function renderCentralList(){
    if(typeof renderRoomList==='function'&&typeof isLobby==='function'&&isLobby()&&canShowList()){
      // Preserva el scroll del lobby al re-renderar la lista (cada 8 s):
      // renderRoomList() reemplaza el HTML y el scroll saltaba arriba.
      var box=document.querySelector('#s-lobby .setup-box');
      var savedScroll=box?box.scrollTop:0;
      var savedWindowScroll=window.pageYOffset||document.documentElement.scrollTop||0;
      renderRoomList();
      decorateHostedRoom();
      decorateRoomAvatars();
      decorateResumeRooms();
      injectLobbyInstructions();
      if(box)box.scrollTop=savedScroll;
      if(savedWindowScroll>0)window.scrollTo(0,savedWindowScroll);
    }
    revealLobby();
  }
  function centralList(){
    if(typeof LOBBY==='undefined')return;
    LOBBY.role='central';
    request('list').then(function(data){
      var rooms=data.rooms||[];
      // La sala del host SIEMPRE está en la lista, aunque el backend no la
      // devuelva (timing del registro, caída momentánea del servidor…).
      // Sin esto, al refrescar cada 8 s la tarjeta de "TU SALA" desaparecía.
      if(typeof NET!=='undefined'&&NET.role==='host'&&NET.code){
        var hasOwn=rooms.some(function(r){return r&&r.id===NET.code;});
        if(!hasOwn){
          rooms.unshift({id:NET.code,name:(NET.names_self||NET.name||''),hasPass:!!NET.pass,pass:NET.pass||'',avatar:avatarFor(NET.names_self),isOwn:true});
        }
      }
      LOBBY.rooms=rooms;
      renderCentralList();
    }).catch(renderCentralList);
  }

  function install(){
    if(typeof LOBBY==='undefined'||typeof window.hostCreate!=='function'||typeof window.renderRoomList!=='function')return false;
    // Envuelve renderRoomList para preservar el scroll en TODA llamada (la
    // nuestra vía centralList y las del juego nativo). Sin esto, al re-pintar
    // la lista de salas cada 8 s el scroll saltaba arriba — sobre todo cuando
    // el host tiene sala creada, porque canShowList()=true y se repinta.
    if(!window.__bfRenderRoomListWrapped){
      window.__bfRenderRoomListWrapped=true;
      var origRRL=window.renderRoomList;
      window.renderRoomList=function(){
        var lobby=document.getElementById('s-lobby');
        var box=lobby?lobby.querySelector('.setup-box'):null;
        var sLobby=lobby?lobby.scrollTop:0;
        var sBox=box?box.scrollTop:0;
        var sWin=window.pageYOffset||document.documentElement.scrollTop||0;
        var r=origRRL.apply(this,arguments);
        if(lobby)lobby.scrollTop=sLobby;
        if(box)box.scrollTop=sBox;
        if(sWin>0)window.scrollTo(0,sWin);
        return r;
      };
    }
    window.lobbyConnect=function(){
      // Oculta el primer pintado nativo hasta que la lista central esté lista.
      var s=document.getElementById('s-lobby');if(s)s.classList.remove('bf-lobby-ready');
      setTimeout(revealLobby,2500);
      LOBBY.role='central';centralList();
    };
    window.refreshList=centralList;
    window.dirRegister=function(code,name,hasPass){
      LOBBY._reg={code:code,name:name,hasPass:hasPass,confirmed:false};
      var attempts=0;
      // Avatar del creador: preferimos el avatar elegido localmente (bfMyAvatar,
      // del parche de avatar) y, si no, el asociado al nick en el mapa de la BD.
      // Se guarda en el backend para que TODOS los jugadores lo vean en la
      // tarjeta de la sala, no solo el creador.
      var avUrl='';
      try{if(window.bfMyAvatar&&window.bfMyAvatar.url)avUrl=window.bfMyAvatar.url;}catch(e){}
      if(!avUrl)avUrl=avatarFor(name);
      var registration = request('register',{code:code,name:name,hasPass:!!hasPass,pass:(typeof NET!=='undefined'&&NET.pass)||'',avatar:avUrl}).then(function(data){
        if(!data || data.ok !== true) throw new Error((data && data.error) || 'No se pudo crear la sala');
        if(LOBBY._reg && LOBBY._reg.code === code) LOBBY._reg.confirmed = true;
        return data;
      }).catch(function(error){
        if(typeof lobbyError === 'function') lobbyError('No se pudo crear la sala: ' + error.message);
        return {ok:false};
      });
      window.__bfRoomRegistration = { code: code, promise: registration };
      return registration;
    };
    window.dirUnregister=function(){
      var r=LOBBY._reg;if(!r)return Promise.resolve();
      // Si la partida YA ha empezado (el juego llama a dirUnregister desde
      // leaveLobbyForGame), NO borramos la sala del backend: debe quedar
      // registrada como "playing" (el parche de relay la marca) para que los
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

    // Contraseña obligatoria al crear sala PRIVADA: sin ella la reanudación no
    // puede identificar a los dos jugadores originales (los nicks no son fiables
    // sin registro). El juego nativo la hace opcional, así que la exigimos aquí
    // solo para salas privadas. Las salas LIBRES no llevan contraseña y no tienen
    // reanudación: si cualquiera se desconecta, la partida termina.
    if(!window.__bfHostCreateWrapped){
      window.__bfHostCreateWrapped=true;
      var origHostCreate=window.hostCreate;
      window.hostCreate=function(name,pass,roomName){
        if(window.__bfRoomMode==='free'){
          // Sala libre: sin contraseña. Nos aseguramos de que el campo vaya
          // vacío al juego nativo (podría tener texto residual).
          var lp=document.getElementById('hpass');if(lp)lp.value='';
          return origHostCreate.apply(this,[name,'',roomName]);
        }
        if(!pass||!String(pass).trim()){
          try{if(typeof notif==='function')notif('⚠️ La contraseña es obligatoria para crear una sala privada.');else alert('La contraseña es obligatoria para crear una sala privada.');}catch(e){alert('La contraseña es obligatoria para crear una sala privada.');}
          return;
        }
        return origHostCreate.apply(this,arguments);
      };
      var origRenderLobby=window.renderLobby;
      window.renderLobby=function(stage){
        var r=origRenderLobby.apply(this,arguments);
        if(stage==='host')setTimeout(bfSetupHostForm,0);
        return r;
      };
    }
    centralList();
    return true;
  }
  function bfGuardCreateButton(){
    // Doble seguro: además de envolver hostCreate, interceptamos el clic del
    // botón "Crear sala" del formulario de host (no el del menú que lo abre).
    // Si la contraseña está vacía en modo privado, frenamos el evento antes
    // de que el juego nativo haga nada.
    var lpEl=document.getElementById('hpass');
    if(!lpEl)return; // no hay formulario de host abierto todavía
    var box=lpEl.closest('.setup-box')||lpEl.closest('form')||document.querySelector('#s-lobby .setup-box');
    if(!box)return;
    var btns=box.querySelectorAll('button');
    btns.forEach(function(b){
      if(!/Crear sala/i.test(b.textContent||''))return;
      if(b.dataset.bfGuarded==='1')return;
      b.dataset.bfGuarded='1';
      b.addEventListener('click',function(e){
        if(window.__bfRoomMode==='free')return;
        var lp=document.getElementById('hpass');
        if(!lp||!String(lp.value||'').trim()){
          e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
          try{if(typeof notif==='function')notif('⚠️ La contraseña es obligatoria para crear una sala privada.');else alert('La contraseña es obligatoria para crear una sala privada.');}catch(x){alert('La contraseña es obligatoria para crear una sala privada.');}
          if(lp)lp.focus();
        }
      },true);
    });
  }
  function bfSetupHostForm(){
    var lp=document.getElementById('hpass');
    if(!lp||lp.dataset.bfReq==='1')return;
    lp.dataset.bfReq='1';
    var ig=lp.closest('.ig');
    if(ig){var lbl=ig.querySelector('label');if(lbl)lbl.textContent='Contraseña';}
    lp.placeholder='Contraseña de la sala';
    // Inyecta el selector de tipo de sala sobre el campo de contraseña.
    if(!document.getElementById('bf-room-mode')){
      var modeCss=document.createElement('style');
      modeCss.textContent='.bf-mode-pill{flex:1;padding:9px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);color:#cfc6dd;font-family:Rubik,sans-serif;font-size:12px;font-weight:700;cursor:pointer;text-align:center;transition:all .15s ease}.bf-mode-pill.active{border-color:#FFD24A;background:rgba(255,210,74,.18);color:#ffe49a}.bf-mode-pill[data-mode=free].active{border-color:#6aa6ff;background:rgba(90,150,255,.18);color:#a8c4ff}';
      document.head.appendChild(modeCss);
      var toggle=document.createElement('div');
      toggle.id='bf-room-mode';
      toggle.style.cssText='display:flex;gap:8px;margin:10px 0';
      toggle.innerHTML='<button type="button" data-mode="private" class="bf-mode-pill active">🔒 Privada (con contraseña)</button><button type="button" data-mode="free" class="bf-mode-pill">🆓 Pública (sin contraseña)</button>';
      ig.parentNode.insertBefore(toggle,ig);
      var freeNote=document.createElement('div');
      freeNote.id='bf-free-note';
      freeNote.style.cssText='display:none;margin:8px 0;padding:10px 12px;border-radius:10px;background:rgba(20,40,80,.4);border:1px solid rgba(90,150,255,.4);font-size:12px;color:#a8c4ff;line-height:1.4';
      freeNote.innerHTML='🆓 <b>Sala pública</b>: sin contraseña. Cualquiera con el código puede unirse. Si alguien se desconecta, la partida se puede <b>reanudar</b> en 10 minutos.';
      ig.parentNode.insertBefore(freeNote,ig);
      toggle.querySelectorAll('.bf-mode-pill').forEach(function(btn){
        btn.onclick=function(){
          toggle.querySelectorAll('.bf-mode-pill').forEach(function(b){b.classList.remove('active');});
          btn.classList.add('active');
          var mode=btn.dataset.mode;
          window.__bfRoomMode=mode;
          if(mode==='free'){ig.style.display='none';freeNote.style.display='block';}
          else{ig.style.display='';freeNote.style.display='none';}
        };
      });
      window.__bfRoomMode='private';
    }
    var note=document.querySelector('#s-lobby .setup-box .note-box');
    if(note&&note.innerHTML.indexOf('La <b>contraseña</b> es opcional')!==-1){
      note.innerHTML=note.innerHTML.replace('La <b>contraseña</b> es opcional (vacía = sala abierta).','La <b>contraseña</b> es <b>obligatoria</b> en salas privadas. Elige <b>Pública</b> arriba para una sala abierta sin contraseña.');
    }
    bfGuardCreateButton();
  }

  var tries=0,timer=setInterval(function(){if(install()||tries++>50)clearInterval(timer);},100);
  // Re-aplica la guarda del botón "Crear sala" si el juego re-renderiza el form.
  setInterval(function(){if(typeof isLobby==='function'&&isLobby())bfGuardCreateButton();},1500);
  // Seguro: si el lobby se muestra por otra vía y la lista central no llega,
  // se revela igualmente para no dejar la pantalla en blanco.
  var lobbyTicks=0;
  setInterval(function(){
    var s=document.getElementById('s-lobby');
    if(!s||!(typeof isLobby==='function'&&isLobby())){lobbyTicks=0;return;}
    if(s.classList.contains('bf-lobby-ready')){lobbyTicks=0;return;}
    if(++lobbyTicks>5)revealLobby();
  },500);
  // Refresco frecuente (3s) para que las salas nuevas aparezcan enseguida.
  var tick=0;
  setInterval(function(){
    tick++;
    if(tick%8===0&&typeof NET!=='undefined'&&NET.role==='host'&&NET.code&&NET.peer&&NET.peer.open&&!(NET.conn&&NET.conn.open))request('touch',{code:NET.code}).catch(function(){});
    if(typeof isLobby==='function'&&isLobby()&&canShowList())centralList();
  },3000);
})();
</script>
`;