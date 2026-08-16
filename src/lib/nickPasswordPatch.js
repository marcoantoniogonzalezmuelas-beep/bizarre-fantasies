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
      pass.autocomplete='off';
      pass.maxLength=60;
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
      wrap.appendChild(rowEl);
      wrap.appendChild(hint);
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
  new MutationObserver(injectPass).observe(document.documentElement,{childList:true,subtree:true});
  setInterval(injectPass,600);
  injectPass();

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
        if(!bad){orig.apply(this,args);return;}
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