// Parche inyectado en el iframe: CONTRASEÑA OBLIGATORIA para proteger el nick.
//
// Junto a cada campo de nick (IA, local, online) se inyecta un campo de
// contraseña. Al arrancar la partida:
//   · Si el nick NO tiene contraseña en la BD → es nuevo (o aún sin
//     proteger): se pide crear una contraseña y se guarda en la BD.
//   · Si el nick YA tiene contraseña → se pide escribirla y se verifica.
//     Si no coincide, no se puede jugar con ese nick (nadie puede usarlo).
//
// La verificación la hace el padre (Home.jsx) contra la entidad
// NickCredential vía postMessage (bfCheckNick → bfNickCredentialResult),
// porque el iframe no tiene acceso directo a la BD.
export const NICK_PASSWORD_PATCH = `
<style id="bf-nick-pass-css">
.bf-pass-wrap{margin-top:6px;display:flex;flex-direction:column;gap:2px;width:100%;flex-basis:100%}
.bf-pass-row{position:relative;display:flex;align-items:center}
.bf-pass-row input{width:100%;box-sizing:border-box;padding-right:38px}
.bf-pass-eye{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;cursor:pointer;color:#cbb46a;font-size:18px;line-height:1;padding:0;opacity:.85}
.bf-pass-eye:active{transform:translateY(-50%) scale(.9)}
.bf-pass-hint{font-size:10px;line-height:1.3;color:#cbb46a;font-family:Rubik,sans-serif;font-weight:600;letter-spacing:.2px}
.bf-pass-rem{display:flex!important;flex-direction:row!important;align-items:center!important;gap:6px;margin:3px 0 0!important;font-size:11px!important;color:#cfc6dd!important;font-family:Rubik,sans-serif!important;font-weight:600!important;letter-spacing:.3px!important;text-transform:none!important;cursor:pointer;user-select:none}
.bf-pass-rem input{width:15px!important;height:15px!important;accent-color:#FFD24A;cursor:pointer;margin:0!important;flex:0 0 15px}
.bf-pass-hint.bad{color:#ff8a6a}
.bf-pass-bad{border-color:#ff5a5a!important;box-shadow:0 0 0 2px rgba(255,90,90,.45)!important;animation:bfPassShake .3s}
@keyframes bfPassShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
</style>
<script>
(function(){
  if(window.__bfNickPass)return;
  window.__bfNickPass=true;

  var isEn=function(){try{return localStorage.getItem('bfLang')==='en';}catch(e){return false;}};
  var L=function(es,en){return isEn()?en:es;};

  // Nicks que ya tienen contraseña en la BD (para mostrar "escribir" vs "crear").
  var creds={};
  window.addEventListener('message',function(e){
    if(e.data&&Array.isArray(e.data.bfNickCreds)){
      var m={};(e.data.bfNickCreds||[]).forEach(function(n){if(n)m[String(n).toLowerCase()]=1;});
      creds=m;
      // Re-etiqueta los campos ya visibles.
      ['p1name','p2name','hname','jname','jlname'].forEach(function(id){var i=document.getElementById(id);if(i&&i._bfPass)labelPass(i);});
    }
  });

  function hasCred(nick){return !!creds[String(nick||'').toLowerCase()];}

  // ---- Recordar contraseña en este equipo ----
  // Se guarda por nick en localStorage (solo en este dispositivo) para que
  // el jugador la escriba una sola vez.
  var REM_KEY='bfNickPassSaved';
  function loadSaved(){try{return JSON.parse(localStorage.getItem(REM_KEY)||'{}')||{};}catch(e){return{};}}
  function getSavedPass(nick){return loadSaved()[String(nick||'').toLowerCase().trim()]||'';}
  function savePass(nick,pass){var k=String(nick||'').toLowerCase().trim();if(!k)return;var m=loadSaved();m[k]=pass;try{localStorage.setItem(REM_KEY,JSON.stringify(m));}catch(e){}}
  function forgetPass(nick){var k=String(nick||'').toLowerCase().trim();if(!k)return;var m=loadSaved();if(m[k]===undefined)return;delete m[k];try{localStorage.setItem(REM_KEY,JSON.stringify(m));}catch(e){}}
  window.__bfGetSavedNickPass=getSavedPass;
  window.__bfSaveNickPass=savePass;
  window.__bfForgetNickPass=forgetPass;

  function labelPass(input){
    var pass=input._bfPass;if(!pass)return;
    var nick=String(input.value||'').trim();
    var hint=input._bfPassHint;
    if(!nick){
      pass.placeholder=L('Contraseña','Password');
      if(hint)hint.textContent='';
      return;
    }
    if(hasCred(nick)){
      pass.placeholder=L('Contraseña de tu nick','Your nick password');
      if(hint)hint.textContent=L('Escribe la contraseña de este nick','Enter this nick\\'s password');
    }else{
      pass.placeholder=L('Crea una contraseña','Create a password');
      if(hint)hint.textContent=L('Elige una contraseña para proteger tu nick','Choose a password to protect your nick');
    }
    // Autorrelleno: si la contraseña de este nick está recordada en este
    // equipo, se rellena sola y se marca la casilla. Si el jugador cambia a
    // un nick sin contraseña recordada, se limpia el autorrelleno.
    var saved=getSavedPass(nick);
    var rem=input._bfPassRem;
    if(saved&&(!pass.value||pass._bfAuto)){
      pass.value=saved;pass._bfAuto=1;
      if(rem)rem.checked=true;
      if(hint)hint.textContent=L('Contraseña recordada en este equipo','Password remembered on this device');
    }else if(!saved&&pass._bfAuto){
      pass.value='';pass._bfAuto=0;
      if(rem)rem.checked=false;
    }
  }

  function injectPass(){
    ['p1name','p2name','hname','jname','jlname'].forEach(function(id){
      var input=document.getElementById(id);
      if(!input||input.dataset.bfPass==='1')return;
      input.dataset.bfPass='1';
      var row=input.closest('.ig')||input.parentNode;
      if(!row)return;
      // Evita duplicar si el row ya tiene un wrap de contraseña (varios inputs
      // en el mismo contenedor): asociamos el wrap al propio input.
      var wrap=document.createElement('div');
      wrap.className='bf-pass-wrap';
      var rowEl=document.createElement('div');
      rowEl.className='bf-pass-row';
      var pass=document.createElement('input');
      pass.type='password';
      pass.className=input.className||'';
      pass.autocomplete='current-password';
      pass.name='bf-pass-'+id;
      pass.maxLength=60;
      // Permite que el gestor de contraseñas del navegador asocie nick+password.
      try{input.setAttribute('autocomplete','username');if(!input.name)input.name='bf-nick-'+id;}catch(e){}
      pass.placeholder=L('Contraseña','Password');
      pass.style.cssText='display:block';
      var eye=document.createElement('button');
      eye.type='button';
      eye.className='bf-pass-eye';
      eye.setAttribute('aria-label',L('Mostrar contraseña','Show password'));
      eye.innerHTML='👁';
      eye.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        var show=pass.type==='password';
        pass.type=show?'text':'password';
        eye.innerHTML=show?'🙈':'👁';
        eye.setAttribute('aria-label',show?L('Ocultar contraseña','Hide password'):L('Mostrar contraseña','Show password'));
        try{pass.focus();}catch(x){}
      });
      rowEl.appendChild(pass);
      rowEl.appendChild(eye);
      var hint=document.createElement('div');
      hint.className='bf-pass-hint';
      // Casilla "Recordar contraseña en este equipo".
      var remLbl=document.createElement('label');
      remLbl.className='bf-pass-rem';
      // Estilos en línea con prioridad: el CSS del juego para "label" dentro
      // de .ig (dorado, mayúsculas, bloque) tiene más especificidad y partía
      // la casilla en dos líneas.
      ['display:flex','flex-direction:row','align-items:center','gap:6px','margin:4px 0 0','font-size:11px','color:#cfc6dd','font-family:Rubik,sans-serif','font-weight:600','letter-spacing:.3px','text-transform:none','cursor:pointer'].forEach(function(s){var p=s.split(':');try{remLbl.style.setProperty(p[0],p[1],'important');}catch(e){}});
      var remCb=document.createElement('input');
      remCb.type='checkbox';
      var remTxt=document.createElement('span');
      remTxt.textContent=L('Recordar contraseña en este equipo','Remember password on this device');
      remLbl.appendChild(remCb);
      remLbl.appendChild(remTxt);
      wrap.appendChild(rowEl);
      wrap.appendChild(hint);
      wrap.appendChild(remLbl);
      // Si el jugador escribe a mano, deja de ser autorrelleno; si desmarca
      // la casilla, se olvida la contraseña guardada de ese nick.
      pass.addEventListener('input',function(){pass._bfAuto=0;});
      remCb.addEventListener('change',function(){if(!remCb.checked)forgetPass(input.value);});
      input._bfPassRem=remCb;
      // Inserta el campo de contraseña JUSTO DEBAJO del input de nick, no
      // después de todo el .ig (que puede incluir avatar picker u otros
      // campos). Así queda pegado al nick en cualquier layout.
      input.parentNode.insertBefore(wrap,input.nextSibling);
      input._bfPass=pass;
      input._bfPassHint=hint;
      input.addEventListener('input',function(){labelPass(input);});
      labelPass(input);
    });
  }
  (window.bfDom?window.bfDom.on(injectPass):new MutationObserver(injectPass).observe(document.documentElement,{childList:true,subtree:true}));
  setInterval(injectPass,600);
  injectPass();
  // Re-etiqueta los campos cuando el nick se rellena programáticamente
  // (el juego precarga el último nick desde localStorage sin disparar el
  // evento 'input', así que sin este polling el autorrelleno de la contraseña
  // recordada no aparecería hasta que el jugador teclee algo en el nick).
  setInterval(function(){
    ['p1name','p2name','hname','jname','jlname'].forEach(function(id){
      var i=document.getElementById(id);
      if(i&&i._bfPass)labelPass(i);
    });
  },500);

  function warn(msg,input){
    try{if(typeof notif==='function')notif(msg);else alert(msg);}catch(e){}
    if(input){input.classList.add('bf-pass-bad');try{input.focus();}catch(e){}setTimeout(function(){input.classList.remove('bf-pass-bad');},1600);}
  }

  // Pide al padre que verifique/creé la contraseña del nick. Devuelve una
  // Promise que resuelve {ok,mode,error}.
  var seq=0;
  function checkNick(nick,password){
    return new Promise(function(resolve){
      var requestId='np-'+(++seq)+'-'+Date.now();
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

  function errMsg(r){
    if(r.error==='wrong_password')return L('La contraseña no coincide con la de este nick.','Wrong password for this nick.');
    if(r.error==='too_short')return L('La contraseña debe tener al menos 3 caracteres.','Password must be at least 3 characters.');
    if(r.error==='empty')return L('Escribe la contraseña de tu nick.','Enter your nick password.');
    if(r.error==='timeout')return L('No se pudo verificar la contraseña. Inténtalo otra vez.','Could not verify the password. Try again.');
    return L('No se pudo verificar el nick. Inténtalo otra vez.','Could not verify the nick. Try again.');
  }

  // Envuelve una función de arranque (startVsAI, localStart, hostCreate,
  // clientJoin, doJoinFromList). getInputs(args) devuelve la lista de pares
  // {nickInput,passInput} que validar. La validación es asíncrona (consulta a
  // la BD): si todo ok, se llama al original; si no, se avisa y se bloquea.
  // Registro global: cada función se envuelve UNA sola vez, aunque otros
  // parches (nick obligatorio, avatar) envuelvan por encima y oculten el flag
  // de la propia función. Sin esto, los tres parches se re-envolvían entre sí
  // en bucle (decenas de capas) y el multiplayer no llegaba a arrancar.
  window.__bfNickPassWrapped=window.__bfNickPassWrapped||{};
  function wrap(name,getInputs){
    if(typeof window[name]!=='function'||window.__bfNickPassWrapped[name])return false;
    window.__bfNickPassWrapped[name]=1;
    var orig=window[name];
    window[name]=function(){
      if(window.__bfNickPassChecking)return;
      var args=arguments;
      var inputs=getInputs(args);
      var pairs=[];
      (inputs||[]).forEach(function(it){
        var ni=it.nickInput,pi=it.passInput;
        if(!ni)return;
        pairs.push({nick:String(ni.value||'').trim(),pass:pi?String(pi.value||''):'',nickInput:ni,passInput:pi});
      });
      if(!pairs.length)return orig.apply(this,args);
      window.__bfNickPassChecking=true;
      try{if(typeof notif==='function')notif(L('Verificando nick…','Verifying nick…'));}catch(e){}
      Promise.all(pairs.map(function(p){return checkNick(p.nick,p.pass);})).then(function(results){
        window.__bfNickPassChecking=false;
        var bad=null;
        for(var i=0;i<results.length;i++){
          if(!results[i].ok){bad={r:results[i],p:pairs[i]};break;}
        }
        if(!bad){
          // Verificación correcta: recuerda u olvida la contraseña según la casilla.
          pairs.forEach(function(p){
            var cb=p.nickInput&&p.nickInput._bfPassRem;
            if(cb&&cb.checked&&p.pass)savePass(p.nick,p.pass);
            else if(cb&&!cb.checked)forgetPass(p.nick);
          });
          orig.apply(this,args);return;
        }
        warn(errMsg(bad.r),bad.p.passInput||bad.p.nickInput);
      });
    };
    window[name].__bfNickPass=1;
    return true;
  }

  function hookAll(){
    wrap('startVsAI',function(){return [{nickInput:document.getElementById('p1name'),passInput:document.getElementById('p1name')&&document.getElementById('p1name')._bfPass}];});
    wrap('localStart',function(){var p1=document.getElementById('p1name'),p2=document.getElementById('p2name');return [{nickInput:p1,passInput:p1&&p1._bfPass},{nickInput:p2,passInput:p2&&p2._bfPass}];});
    wrap('hostCreate',function(a){return [{nickInput:document.getElementById('hname')||document.querySelector('#s-lobby input[id*="name" i]'),passInput:(document.getElementById('hname')||document.querySelector('#s-lobby input[id*="name" i]'))&&((document.getElementById('hname')||document.querySelector('#s-lobby input[id*="name" i]'))._bfPass)}];});
    wrap('clientJoin',function(a){var j=document.getElementById('jname')||document.getElementById('jlname')||document.querySelector('#s-lobby input[id*="name" i]');return [{nickInput:j,passInput:j&&j._bfPass}];});
    wrap('doJoinFromList',function(){var j=document.getElementById('jlname');return [{nickInput:j,passInput:j&&j._bfPass}];});
  }
  hookAll();
  var tries=0,iv=setInterval(function(){hookAll();if(tries++>100)clearInterval(iv);},200);
})();
</script>
`;