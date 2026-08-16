// Parche inyectado en el iframe: HABITACIÓN BIZARRA.
// Nueva sección en el lobby online donde cualquier jugador entra con nick +
// contraseña + avatar, aparece como visitante, ve el listado de todos los
// que están dentro (nick, avatar, victorias totales) y puede pulsar el
// BOTÓN DE PÁNICO: empareja al jugador con otro visitante al azar y arranca
// una partida online. El botón solo se activa con mínimo 3 visitantes en
// total (2 más aparte del propio). Al emparejar, ambos salen de la habitación.
//
// Las partidas son PÚBLICAS (sin contraseña visible) pero internamente llevan
// una contraseña autogenerada que permite la reanudación si se cae la
// conexión: el jugador la recibe del emparejamiento, no tiene que escribirla.
export const BIZARRE_ROOM_PATCH = `
<style id="bf-bizarre-css">
#bf-bizarre-overlay{position:fixed;inset:0;z-index:100400;display:none;align-items:center;justify-content:center;padding:16px;background:radial-gradient(circle at 50% 38%,rgba(20,12,34,.85),rgba(8,5,14,.95));backdrop-filter:blur(5px);overflow-y:auto}
#bf-bizarre-overlay .bf-biz-box{width:min(440px,94vw);max-height:92vh;overflow-y:auto;padding:22px 20px 20px;border-radius:20px;background:linear-gradient(180deg,#1b1430,#120d22);border:2px solid rgba(199,155,255,.55);box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 30px rgba(192,91,255,.2)}
#bf-bizarre-overlay .bf-biz-title{font-family:Cinzel,serif;font-weight:1000;font-size:22px;color:#e2b0ff;text-align:center;letter-spacing:1px;text-shadow:0 0 18px rgba(192,91,255,.6),0 2px 4px #000;margin-bottom:4px}
#bf-bizarre-overlay .bf-biz-sub{font-size:12px;color:#cfc6dd;text-align:center;line-height:1.4;margin-bottom:16px}
#bf-bizarre-overlay .bf-biz-ig{margin-bottom:12px}
#bf-bizarre-overlay .bf-biz-ig label{display:block;margin-bottom:5px;font-family:Cinzel,serif;font-weight:900;font-size:12px;color:#c79bff;letter-spacing:.3px}
#bf-bizarre-overlay .bf-biz-ig input{width:100%;box-sizing:border-box;padding:11px 13px;border-radius:11px;background:rgba(8,5,14,.6);border:2px solid rgba(199,155,255,.3);color:#fff5dc;font-size:15px;font-weight:600;outline:none;transition:border-color .14s ease}
#bf-bizarre-overlay .bf-biz-ig input:focus{border-color:#c06bff;box-shadow:0 0 0 3px rgba(192,91,255,.18)}
#bf-bizarre-overlay .bf-biz-avgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:8px;max-height:120px;overflow-y:auto;padding:6px;border-radius:10px;background:rgba(8,5,14,.4);border:1px solid rgba(199,155,255,.2)}
#bf-bizarre-overlay .bf-biz-av{width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.15);cursor:pointer;transition:transform .12s ease,border-color .12s ease}
#bf-bizarre-overlay .bf-biz-av:hover{transform:scale(1.1)}
#bf-bizarre-overlay .bf-biz-av.selected{border-color:#c06bff;box-shadow:0 0 14px rgba(192,91,255,.7)}
#bf-bizarre-overlay .bf-biz-btn{width:100%;padding:13px;border-radius:13px;border:none;font-family:Cinzel,serif;font-weight:1000;font-size:16px;cursor:pointer;transition:transform .12s ease,filter .12s ease;letter-spacing:.5px}
#bf-bizarre-overlay .bf-biz-btn:active{transform:scale(.96)}
#bf-bizarre-overlay .bf-biz-join{color:#fff;background:linear-gradient(180deg,#9d5df0,#c06bff 55%,#7a3df0);box-shadow:0 6px 18px rgba(160,80,255,.45)}
#bf-bizarre-overlay .bf-biz-join:hover{filter:brightness(1.1)}
#bf-bizarre-overlay .bf-biz-panic{color:#fff;background:linear-gradient(180deg,#ff4b6e,#ff2a5a 55%,#c01040);box-shadow:0 6px 18px rgba(255,42,90,.5);animation:bfPanicPulse 1.6s ease-in-out infinite}
#bf-bizarre-overlay .bf-biz-panic:hover{filter:brightness(1.12)}
#bf-bizarre-overlay .bf-biz-panic:disabled{opacity:.4;cursor:not-allowed;animation:none;box-shadow:none}
@keyframes bfPanicPulse{0%,100%{box-shadow:0 6px 18px rgba(255,42,90,.5)}50%{box-shadow:0 6px 28px rgba(255,42,90,.9),0 0 40px rgba(255,42,90,.4)}}
#bf-bizarre-overlay .bf-biz-leave{margin-top:10px;color:#cfc6dd;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);font-size:13px;padding:10px}
#bf-bizarre-overlay .bf-biz-list{margin:14px 0;max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:8px}
#bf-bizarre-overlay .bf-biz-visitor{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:rgba(199,155,255,.08);border:1px solid rgba(199,155,255,.2)}
#bf-bizarre-overlay .bf-biz-visitor.me{border-color:#c06bff;background:rgba(192,91,255,.15)}
#bf-bizarre-overlay .bf-biz-vav{width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(199,155,255,.4);flex-shrink:0;background:#1a1428}
#bf-bizarre-overlay .bf-biz-vinfo{flex:1;min-width:0}
#bf-bizarre-overlay .bf-biz-vnick{font-family:Cinzel,serif;font-weight:900;font-size:14px;color:#fff5dc;text-shadow:0 1px 2px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bf-bizarre-overlay .bf-biz-vwins{font-size:11px;color:#ffe49a;font-weight:700}
#bf-bizarre-overlay .bf-biz-count{text-align:center;font-size:12px;color:#cfc6dd;margin-bottom:8px}
#bf-bizarre-overlay .bf-biz-count b{color:#e2b0ff}
#bf-bizarre-overlay .bf-biz-wait{margin-top:14px;padding:12px;border-radius:12px;background:rgba(255,42,90,.12);border:1px solid rgba(255,42,90,.4);text-align:center;color:#ffb0c0;font-size:13px;line-height:1.4}
#bf-bizarre-overlay .bf-biz-spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,42,90,.3);border-top-color:#ff2a5a;border-radius:50%;animation:bfBizSpin .8s linear infinite;vertical-align:middle;margin-right:6px}
@keyframes bfBizSpin{to{transform:rotate(360deg)}}
#bf-bizarre-overlay .bf-biz-x{position:absolute;top:14px;right:16px;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#cfc6dd;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center}
#bf-bizarre-overlay .bf-biz-x:hover{background:rgba(255,255,255,.18);color:#fff}
#bf-bizarre-overlay .bf-biz-wrap{position:relative}
.bf-bizarre-btn{position:relative;display:flex;align-items:center;gap:10px;width:100%;margin:10px 0 0;padding:14px 16px;border-radius:14px;border:2px solid rgba(199,155,255,.5);background:linear-gradient(135deg,rgba(120,60,200,.25),rgba(192,91,255,.15));color:#e2b0ff;font-family:Cinzel,serif;font-weight:1000;font-size:15px;letter-spacing:.4px;cursor:pointer;transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease;text-shadow:0 2px 4px #000;box-shadow:0 6px 18px rgba(0,0,0,.4)}
.bf-bizarre-btn:hover{transform:translateY(-2px);border-color:#c06bff;box-shadow:0 10px 26px rgba(0,0,0,.5),0 0 22px rgba(192,91,255,.35)}
.bf-bizarre-btn .bf-bizarre-ico{font-size:22px;filter:drop-shadow(0 0 8px rgba(192,91,255,.7))}
</style>
<script>
(function(){
  if(window.__bfBizarreRoom)return;
  window.__bfBizarreRoom=true;

  var isEn=function(){try{return localStorage.getItem('bfLang')==='en';}catch(e){return false;}};
  var L=function(es,en){return isEn()?en:es;};

  var session=null; // {token,nick,avatar}
  var hbTimer=null;
  var visitors=[];
  var myMatch=null;
  var avatarCatalog=[];
  var selectedAvatar='';
  var joined=false;

  window.addEventListener('message',function(e){
    if(e.data&&Array.isArray(e.data.bfAvatarCatalog)){
      avatarCatalog=(e.data.bfAvatarCatalog||[]).map(function(a){return a.url;}).filter(Boolean);
    }
  });

  function req(action,data){
    return new Promise(function(resolve,reject){
      if(!window.bfLobbyRequest){reject(new Error('no lobby bridge'));return;}
      window.bfLobbyRequest(action,data||{}).then(resolve).catch(reject);
    });
  }

  // Verifica/crea la contraseña del nick contra la BD (igual que nickPasswordPatch).
  var nickSeq=0;
  function checkNick(nick,password){
    return new Promise(function(resolve){
      var requestId='bz-'+(++nickSeq)+'-'+Date.now();
      var handler=function(e){
        if(e.data&&e.data.bfNickCredentialResult&&e.data.bfNickCredentialResult.requestId===requestId){
          window.removeEventListener('message',handler);
          resolve(e.data.bfNickCredentialResult);
        }
      };
      window.addEventListener('message',handler);
      try{parent.postMessage({bfCheckNick:{nick:nick,password:password,requestId:requestId}},'*');}catch(e){window.removeEventListener('message',handler);resolve({ok:false,error:'no_parent'});}
      setTimeout(function(){window.removeEventListener('message',handler);resolve({ok:false,error:'timeout'});},9000);
    });
  }

  function injectButton(){
    var lobby=document.getElementById('s-lobby');
    if(!lobby)return;
    var box=lobby.querySelector('.setup-box');
    if(!box)return;
    if(document.getElementById('bf-bizarre-entry'))return;
    var btn=document.createElement('button');
    btn.id='bf-bizarre-entry';
    btn.className='bf-bizarre-btn';
    btn.innerHTML='<span class="bf-bizarre-ico">🃏</span><span>'+L('Habitación Bizarra','Bizarre Room')+'</span>';
    btn.onclick=function(e){e.preventDefault();e.stopPropagation();openOverlay();};
    box.appendChild(btn);
  }

  function overlayEl(){
    var el=document.getElementById('bf-bizarre-overlay');
    if(!el){
      el=document.createElement('div');
      el.id='bf-bizarre-overlay';
      el.innerHTML='<div class="bf-biz-wrap"><div class="bf-biz-box"><div class="bf-biz-x">✕</div><div class="bf-biz-title">🃏 '+L('Habitación Bizarra','Bizarre Room')+'</div><div class="bf-biz-sub">'+L('Entra, mira quién hay y pulsa el botón de pánico para una partida al azar.','Join, see who\'s here and hit the panic button for a random match.')+'</div><div class="bf-biz-body"></div></div></div>';
      document.body.appendChild(el);
      el.querySelector('.bf-biz-x').onclick=function(){closeOverlay();};
    }
    return el;
  }

  function openOverlay(){
    var el=overlayEl();
    el.style.display='flex';
    renderBody();
  }
  function closeOverlay(){
    var el=document.getElementById('bf-bizarre-overlay');
    if(el)el.style.display='none';
  }
  window.__bfBizarreClose=closeOverlay;

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c];});}

  function renderBody(){
    var body=overlayEl().querySelector('.bf-biz-body');
    if(!body)return;
    if(!joined){
      // Formulario de entrada: nick + contraseña + avatar
      var avHtml='<div class="bf-biz-ig"><label>'+L('Avatar','Avatar')+'</label><div class="bf-biz-avgrid" id="bf-biz-avgrid"></div></div>';
      body.innerHTML='<div class="bf-biz-ig"><label>'+L('Nick','Nick')+'</label><input id="bf-biz-nick" type="text" maxlength="28" placeholder="'+L('Tu nick','Your nick')+'" value="'+esc(localStorage.getItem('bfNick')||'')+'"></div>'+
        '<div class="bf-biz-ig"><label>'+L('Contraseña','Password')+'</label><input id="bf-biz-pass" type="password" maxlength="60" placeholder="'+L('Contraseña de tu nick','Your nick password')+'"></div>'+
        avHtml+
        '<button class="bf-biz-btn bf-biz-join" id="bf-biz-join-btn">'+L('Entrar en la habitación','Enter the room')+'</button>';
      renderAvatarGrid();
      var nickI=body.querySelector('#bf-biz-nick');
      var passI=body.querySelector('#bf-biz-pass');
      // Ojo de mostrar/ocultar contraseña
      addEyeToggle(passI);
      // Auto-selecciona avatar guardado
      try{var saved=localStorage.getItem('bfMyAvatarUrl');if(saved){selectedAvatar=saved;renderAvatarGrid();}}catch(e){}
      body.querySelector('#bf-biz-join-btn').onclick=function(){doJoin(nickI,passI);};
      nickI.addEventListener('keydown',function(e){if(e.key==='Enter')passI.focus();});
      passI.addEventListener('keydown',function(e){if(e.key==='Enter')doJoin(nickI,passI);});
      setTimeout(function(){try{nickI.focus();}catch(e){}},80);
    }else{
      // Listado de visitantes + botón de pánico
      var listHtml=visitors.map(function(v){
        var isMe=session&&String(v.nick).toLowerCase()===String(session.nick).toLowerCase();
        return '<div class="bf-biz-visitor'+(isMe?' me':'')+'"><img class="bf-biz-vav" src="'+esc(v.avatar||'')+'" alt="" onerror="this.style.display=\'none\'"><div class="bf-biz-vinfo"><div class="bf-biz-vnick">'+esc(v.nick)+(isMe?' ('+L('tú','you')+')':'')+'</div><div class="bf-biz-vwins">🏆 '+L('Victorias','Wins')+': '+Number(v.total_wins||0)+'</div></div></div>';
      }).join('');
      if(!listHtml)listHtml='<div style="text-align:center;color:#cfc6dd;font-size:13px;padding:14px">'+L('Aún no hay otros visitantes.','No other visitors yet.')+'</div>';
      var canPanic=visitors.length>=3;
      body.innerHTML='<div class="bf-biz-count">'+L('Visitantes en la habitación','Visitors in the room')+': <b>'+visitors.length+'</b> · '+L('Mínimo 3 para el botón de pánico','Min 3 for panic button')+'</div>'+
        '<div class="bf-biz-list">'+listHtml+'</div>'+
        '<button class="bf-biz-btn bf-biz-panic" id="bf-biz-panic-btn"'+(canPanic?'':'disabled')+'>'+L('🚨 BOTÓN DE PÁNICO','🚨 PANIC BUTTON')+'</button>'+
        '<button class="bf-biz-btn bf-biz-leave" id="bf-biz-leave-btn">'+L('Salir de la habitación','Leave the room')+'</button>';
      body.querySelector('#bf-biz-panic-btn').onclick=function(){doPanic();};
      body.querySelector('#bf-biz-leave-btn').onclick=function(){doLeave();};
      if(myMatch){
        var wait=body.querySelector('.bf-biz-wait');
        if(!wait){wait=document.createElement('div');wait.className='bf-biz-wait';body.appendChild(wait);}
        wait.innerHTML='<span class="bf-biz-spinner"></span>'+L('¡Emparejado! Iniciando partida…','Matched! Starting game…')+'<br><small style="color:#cfc6dd">'+L('Rival','Opponent')+': '+esc(myMatch.opponent||'?')+'</small>';
      }
    }
  }

  function addEyeToggle(input){
    var wrap=input.parentNode;
    if(wrap.querySelector('.bf-biz-eye'))return;
    input.style.paddingRight='40px';
    var eye=document.createElement('button');
    eye.type='button';
    eye.className='bf-biz-eye';
    eye.style.cssText='position:absolute;right:8px;margin-top:4px;width:30px;height:30px;border:none;background:transparent;cursor:pointer;color:#cbb46a;font-size:18px;padding:0;opacity:.85';
    eye.innerHTML='👁';
    // El input no está en posición relative; lo envolvemos si hace falta.
    if(getComputedStyle(wrap).position==='static')wrap.style.position='relative';
    eye.style.top=(input.offsetTop+4)+'px';
    eye.onclick=function(e){e.preventDefault();e.stopPropagation();var show=input.type==='password';input.type=show?'text':'password';eye.innerHTML=show?'🙈':'👁';try{input.focus();}catch(x){}};
    wrap.appendChild(eye);
  }

  function renderAvatarGrid(){
    var grid=overlayEl().querySelector('#bf-biz-avgrid');
    if(!grid)return;
    var avatars=avatarCatalog.slice(0,24);
    if(!avatars.length){
      grid.innerHTML='<div style="grid-column:1/-1;text-align:center;color:#cfc6dd;font-size:11px;padding:8px">'+L('Cargando avatares…','Loading avatars…')+'</div>';
      return;
    }
    grid.innerHTML=avatars.map(function(url){
      var sel=selectedAvatar===url?' selected':'';
      return '<img class="bf-biz-av'+sel+'" src="'+esc(url)+'" alt="" data-url="'+esc(url)+'">';
    }).join('');
    grid.querySelectorAll('.bf-biz-av').forEach(function(img){
      img.onclick=function(){selectedAvatar=img.dataset.url;renderAvatarGrid();};
    });
  }

  function doJoin(nickI,passI){
    var nick=String(nickI.value||'').trim();
    var pass=String(passI.value||'');
    if(!nick){try{notif(L('Escribe tu nick','Enter your nick'));}catch(e){}nickI.focus();return;}
    if(!pass){try{notif(L('Escribe la contraseña de tu nick','Enter your nick password'));}catch(e){}passI.focus();return;}
    var btn=overlayEl().querySelector('#bf-biz-join-btn');
    if(btn){btn.disabled=true;btn.textContent=L('Verificando…','Verifying…');}
    checkNick(nick,pass).then(function(r){
      if(!r.ok){
        if(btn){btn.disabled=false;btn.textContent=L('Entrar en la habitación','Enter the room');}
        var msg=L('No se pudo verificar el nick.','Could not verify nick.');
        if(r.error==='wrong_password')msg=L('La contraseña no coincide.','Wrong password.');
        else if(r.error==='too_short')msg=L('La contraseña debe tener al menos 3 caracteres.','Password must be at least 3 characters.');
        try{notif(msg);}catch(e){}
        passI.focus();
        return;
      }
      // Guarda nick y avatar
      try{localStorage.setItem('bfNick',nick);}catch(e){}
      if(selectedAvatar){try{localStorage.setItem('bfMyAvatarUrl',selectedAvatar);}catch(e){}if(window.bfMyAvatar)window.bfMyAvatar.url=selectedAvatar;}
      var av=selectedAvatar||(window.__bfAvatarMap&&window.__bfAvatarMap[nick])||'';
      req('bizarre_join',{nick:nick,avatar:av}).then(function(res){
        if(!res||!res.ok){if(btn){btn.disabled=false;btn.textContent=L('Entrar en la habitación','Enter the room');}try{notif(L('No se pudo entrar.','Could not enter.'));}catch(e){}return;}
        session={token:res.session_token,nick:nick,avatar:av};
        joined=true;
        try{localStorage.setItem('bfBizarreSession',JSON.stringify(session));}catch(e){}
        startHeartbeat();
        renderBody();
      }).catch(function(){if(btn){btn.disabled=false;btn.textContent=L('Entrar en la habitación','Enter the room');}try{notif(L('No se pudo entrar.','Could not enter.'));}catch(e){}});
    });
  }

  function startHeartbeat(){
    if(hbTimer)clearInterval(hbTimer);
    function beat(){
      if(!session)return;
      req('bizarre_heartbeat',{session_token:session.token}).then(function(res){
        if(!res||!res.ok||res.error==='session_expired'){
          // Sesión caducada: volver al formulario
          stopHeartbeat();session=null;joined=false;renderBody();
          try{notif(L('Tu sesión en la habitación expiró.','Your room session expired.'));}catch(e){}
          return;
        }
        visitors=res.visitors||[];
        if(res.match&&!myMatch){
          myMatch=res.match;
          onMatched();
        }
        renderBody();
      }).catch(function(){});
    }
    beat();
    hbTimer=setInterval(beat,5000);
  }
  function stopHeartbeat(){if(hbTimer){clearInterval(hbTimer);hbTimer=null;}}

  function doPanic(){
    if(!session)return;
    var btn=overlayEl().querySelector('#bf-biz-panic-btn');
    if(btn){btn.disabled=true;btn.textContent=L('Buscando rival…','Finding opponent…');}
    req('bizarre_panic',{session_token:session.token}).then(function(res){
      if(!res||!res.ok){
        if(btn){btn.disabled=false;btn.textContent=L('🚨 BOTÓN DE PÁNICO','🚨 PANIC BUTTON');}
        var msg=L('No hay rivales suficientes.','Not enough opponents.');
        if(res&&res.error==='need_3_total')msg=L('Necesitas mínimo 3 visitantes en total (2 además de ti).','Need at least 3 visitors total (2 besides you).');
        else if(res&&res.error==='already_matched')msg=L('Ya estás emparejado.','Already matched.');
        try{notif(msg);}catch(e){}
        return;
      }
      myMatch=res.match;
      myMatch.opponent=res.match.opponent||'';
      renderBody();
      // El host (pulsador) crea la sala con la contraseña autogenerada.
      startMatchAsHost();
    }).catch(function(){if(btn){btn.disabled=false;btn.textContent=L('🚨 BOTÓN DE PÁNICO','🚨 PANIC BUTTON');}try{notif(L('Error al emparejar.','Matchmaking error.'));}catch(e){}});
  }

  function startMatchAsHost(){
    if(!myMatch)return;
    // Rellena el formulario de host del juego y llama a hostCreate.
    try{
      var hname=document.getElementById('hname');if(hname)hname.value=session.nick;
      var hpass=document.getElementById('hpass');if(hpass)hpass.value=myMatch.pass;
      // El juego generará su propio código; lo leemos de NET.code y lo reportamos.
      if(typeof window.hostCreate==='function'){
        window.hostCreate(session.nick,myMatch.pass,L('Bizarra','Bizarre'));
        // Espera a que NET.code esté disponible y lo reporta al backend.
        var attempts=0;
        var iv=setInterval(function(){
          attempts++;
          if(typeof NET!=='undefined'&&NET.code){
            clearInterval(iv);
            req('bizarre_report_code',{session_token:session.token,code:NET.code}).catch(function(){});
            stopHeartbeat();
            closeOverlay();
          }else if(attempts>30){clearInterval(iv);}
        },200);
      }
    }catch(e){try{notif(L('No se pudo iniciar la partida.','Could not start the game.'));}catch(x){}}
  }

  function onMatched(){
    if(!myMatch)return;
    if(myMatch.role==='host'){
      startMatchAsHost();
    }else{
      // Cliente: espera a que el host reporte el código real, luego se une.
      var attempts=0;
      var iv=setInterval(function(){
        attempts++;
        if(myMatch&&myMatch.code&&myMatch.code.length>=3){
          clearInterval(iv);
          joinAsClient();
        }else if(attempts>40){clearInterval(iv);try{notif(L('El rival no respondió a tiempo.','Opponent did not respond in time.'));}catch(e){}}
      },300);
    }
  }

  function joinAsClient(){
    if(!myMatch||!myMatch.code)return;
    try{
      var jname=document.getElementById('jname')||document.getElementById('jlname');
      if(jname)jname.value=session.nick;
      if(typeof window.clientJoin==='function'){
        window.clientJoin(myMatch.code,session.nick,myMatch.pass);
      }else if(typeof window.doJoinFromList==='function'){
        // Fallback: rellenar y llamar doJoinFromList
        if(window.doJoinFromList)window.doJoinFromList();
      }
      stopHeartbeat();
      closeOverlay();
    }catch(e){try{notif(L('No se pudo unir a la partida.','Could not join the game.'));}catch(x){}}
  }

  function doLeave(){
    if(!session)return;
    req('bizarre_leave',{session_token:session.token}).catch(function(){});
    stopHeartbeat();session=null;joined=false;myMatch=null;
    try{localStorage.removeItem('bfBizarreSession');}catch(e){}
    renderBody();
  }

  // Botón en el lobby
  setInterval(injectButton,800);
  injectButton();

  // Reanuda sesión si existe (tras recarga dentro del lobby)
  try{
    var saved=JSON.parse(localStorage.getItem('bfBizarreSession')||'null');
    if(saved&&saved.token&&saved.nick){
      session=saved;joined=true;selectedAvatar=saved.avatar||'';
      // Verifica que la sesión sigue activa
      req('bizarre_heartbeat',{session_token:session.token}).then(function(res){
        if(!res||!res.ok){session=null;joined=false;localStorage.removeItem('bfBizarreSession');return;}
        visitors=res.visitors||[];if(res.match)myMatch=res.match;
        startHeartbeat();
      }).catch(function(){session=null;joined=false;localStorage.removeItem('bfBizarreSession');});
    }
  }catch(e){}
})();
</script>
`;