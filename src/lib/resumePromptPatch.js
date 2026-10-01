// REANUDAR PARTIDAS MULTIJUGADOR (cliente). Complementa a la lógica de servidor
// (base44/shared/resumePolicy.ts y resumeActions.ts). Hace cuatro cosas:
//
//  1. Recuerda la partida activa (localStorage: sala, lado y nick) para poder volver a ella
//     tras recargar, cerrar la pestaña, perder la red o que el navegador se cuelgue.
//  2. Al abrir el juego, si hay una partida interrumpida que se puede reanudar, lo ofrece
//     con UN clic (antes había que buscar la sala en el lobby, y solo aparecía si se había
//     salido limpiamente). El token de asiento que guarda el navegador basta: no hay que
//     volver a escribir la contraseña de la sala.
//  3. Si falta el token (otro dispositivo) pide la contraseña del nick o de la sala.
//  4. Si el rival lleva 5 minutos sin volver, permite reclamar la victoria (lo verifica el
//     servidor con sus propios latidos). También avisa al servidor cuando la partida termina,
//     para que una partida acabada no se ofrezca como reanudable.
//
// Los textos son literales cortos y separados del contenido dinámico para que el traductor
// del DOM (langEnPatch) los encuentre exactos.
export const RESUME_PROMPT_PATCH = `
<script>
(function(){
  if(window.__bfResumePrompt)return;
  window.__bfResumePrompt=true;

  // ---- 1) Partida activa ----
  var KEY='bfActiveMatch', MAX_AGE=30*60*1000;
  function readStore(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
  window.bfActiveMatch={
    save:function(m){try{localStorage.setItem(KEY,JSON.stringify({code:String(m.code||''),side:m.side,nick:String(m.nick||''),at:Date.now()}));}catch(e){}},
    clear:function(){try{localStorage.removeItem(KEY);}catch(e){}},
    get:function(){
      var m=readStore();
      if(!m||!m.code||(m.side!=='p'&&m.side!=='g'))return null;
      if(Date.now()-(m.at||0)>MAX_AGE){this.clear();return null;}
      return m;
    }
  };

  // ---- Interfaz ----
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
  function btn(label,cls,fn){var b=el('button','bf-rm-btn'+(cls?' '+cls:''),label);b.type='button';b.onclick=fn;return b;}
  function ensureCss(){
    if(document.getElementById('bf-resume-css'))return;
    var st=document.createElement('style');st.id='bf-resume-css';
    st.textContent=[
      '#bf-resume-modal{position:fixed;inset:0;z-index:100800;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(10,6,18,.78);font-family:Rubik,sans-serif}',
      '#bf-resume-modal .bf-rm-box{max-width:420px;width:100%;padding:20px 22px;border-radius:16px;background:linear-gradient(180deg,#1b1430,#120d22);border:1px solid rgba(255,210,74,.5);color:#efe9dc;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.6)}',
      '.bf-rm-t{font-family:Cinzel,serif;font-weight:900;font-size:19px;color:#ffe49a;margin-bottom:8px}',
      '.bf-rm-s{font-size:13.5px;line-height:1.5;color:#cfc6dd;margin-bottom:6px}',
      '.bf-rm-s b{color:#ffe49a}',
      '.bf-rm-row{display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap}',
      '.bf-rm-btn{padding:11px 20px;border-radius:11px;font-family:Cinzel,serif;font-weight:900;font-size:14px;cursor:pointer;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#efe9dc}',
      '.bf-rm-btn.bf-rm-go{border-color:rgba(255,240,180,.8);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600}',
      '.bf-rm-input{width:100%;box-sizing:border-box;margin-top:10px;padding:11px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;font-size:15px}',
      '#bf-forfeit-banner{position:fixed;z-index:100650;top:8px;left:50%;transform:translateX(-50%);max-width:min(440px,94vw);padding:12px 16px;border-radius:14px;background:linear-gradient(180deg,#1b1430,#120d22);border:1px solid rgba(255,210,74,.55);color:#efe9dc;text-align:center;font-family:Rubik,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.55)}',
      '#bf-forfeit-banner .bf-rm-row{margin-top:10px}'
    ].join('\\n');
    document.head.appendChild(st);
  }
  function removeById(id){var n=document.getElementById(id);if(n&&n.parentNode)n.parentNode.removeChild(n);}
  function modal(box){
    ensureCss();removeById('bf-resume-modal');
    var o=document.createElement('div');o.id='bf-resume-modal';
    var b=el('div','bf-rm-box');
    for(var i=0;i<box.length;i++)b.appendChild(box[i]);
    o.appendChild(b);document.body.appendChild(o);return o;
  }
  function say(t){try{if(typeof notif==='function')notif(t);}catch(e){}}
  function rq(action,data){
    return window.bfRelayRequest(action,data);
  }

  // ---- 2) Ofrecer reanudar al abrir el juego ----
  var asked=false,resolved=false;
  function showResume(m,r){
    var line=el('div','bf-rm-s');
    line.appendChild(document.createTextNode('Rival:'));
    line.appendChild(document.createTextNode(' '));
    var rival=m.side==='p'?(r.nicks&&r.nicks[1]):(r.nicks&&r.nicks[0]);
    var who=el('b',null,String(rival||'?'));line.appendChild(who);
    var parts=[el('div','bf-rm-t','Tienes una partida en curso'),el('div','bf-rm-s','Se interrumpió. Puedes volver a entrar justo donde la dejaste.'),line];
    if(r.opponent_absent)parts.push(el('div','bf-rm-s','Tu rival aún no ha vuelto: entrarás y esperarás a que regrese.'));
    var row=el('div','bf-rm-row');
    row.appendChild(btn('Reanudar partida','bf-rm-go',function(){
      removeById('bf-resume-modal');
      try{window.bfRelayResumeGame(m.code,'',m.nick,r.nicks||[],m.side);}catch(e){}
    }));
    row.appendChild(btn('Abandonar','',function(){
      removeById('bf-resume-modal');
      rq('leave',{code:m.code,side:m.side}).catch(function(){});
      window.bfActiveMatch.clear();
    }));
    parts.push(row);
    modal(parts);
  }
  function ask(){
    if(resolved||asked)return;
    var m=window.bfActiveMatch.get();
    if(!m){resolved=true;return;}
    if(typeof G==='undefined'||!document.body)return;
    if(G&&G.online){resolved=true;return;}             // ya hay una partida en marcha en esta carga
    if(!window.bfRelayRequest||!window.bfRelayResumeGame)return;
    asked=true;
    rq('resume_status',{code:m.code,side:m.side}).then(function(r){
      resolved=true;
      if(!r||!r.ok||!r.can_resume){window.bfActiveMatch.clear();return;}   // terminada o caducada
      showResume(m,r);
    }).catch(function(err){
      var msg=(err&&err.message)||'';
      if(/Room not found|Unauthorized|Match over|Room expired/i.test(msg)){resolved=true;window.bfActiveMatch.clear();return;}
      asked=false;                                      // sin red: el temporizador lo reintenta
    });
  }
  var tries=0,askTimer=setInterval(function(){
    try{ask();}catch(e){}
    if(resolved||tries++>60)clearInterval(askTimer);
  },1000);

  // ---- 3) Prueba de identidad (otro dispositivo, sin token) ----
  window.bfAskResumeProof=function(cb){
    var input=el('input','bf-rm-input');input.type='password';input.autocomplete='current-password';input.placeholder='Contraseña';
    var row=el('div','bf-rm-row');
    function go(){var v=String(input.value||'').trim();if(!v)return;removeById('bf-resume-modal');cb(v);}
    row.appendChild(btn('Continuar','bf-rm-go',go));
    row.appendChild(btn('Cancelar','',function(){removeById('bf-resume-modal');}));
    modal([el('div','bf-rm-t','Confirma que eres tú'),el('div','bf-rm-s','Escribe la contraseña de tu nick (o la de la sala) para volver a entrar.'),input,row]);
    try{input.addEventListener('keydown',function(e){if(e.key==='Enter')go();});input.focus();}catch(e){}
  };

  // ---- 4a) La partida terminó: que no se ofrezca como reanudable ----
  function hookResult(){
    if(typeof window.showResult!=='function'||window.showResult.__bfPhase)return false;
    var orig=window.showResult;
    window.showResult=function(){
      try{
        var i=window.bfRelayInfo&&window.bfRelayInfo();
        if(i&&i.code&&window.bfRelayRequest)rq('match_phase',{code:i.code,side:i.side,phase:'over'}).catch(function(){});
      }catch(e){}
      return orig.apply(this,arguments);
    };
    window.showResult.__bfPhase=1;
    return true;
  }
  var ht=0,hookTimer=setInterval(function(){if(hookResult()||ht++>100)clearInterval(hookTimer);},200);

  // ---- 4b) Rival ausente: reclamar la victoria ----
  var dismissedUntil=0,claiming=false;
  function hideBanner(){removeById('bf-forfeit-banner');}
  function claim(){
    if(claiming)return;claiming=true;
    var i=window.bfRelayInfo&&window.bfRelayInfo();
    if(!i||!i.code){claiming=false;return;}
    rq('claim_forfeit',{code:i.code,side:i.side}).then(function(r){
      claiming=false;
      if(!r||!r.ok){say('Aún no se puede reclamar la victoria.');return;}
      hideBanner();
      try{
        window.parent.postMessage({bfMatchResult:{winner_nick:r.winner_nick,loser_nick:r.loser_nick,mode:'online',winner_is_ai:false,loser_is_ai:false,
          winner_avatar:(window.bfMyAvatar&&window.bfMyAvatar.url)||'',loser_avatar:'',winner_heroes:[],loser_heroes:[],ai_level:''}},'*');
      }catch(e){}
      window.bfActiveMatch.clear();
      say('Victoria por abandono registrada.');
      setTimeout(function(){try{location.reload();}catch(e){}},1500);
    }).catch(function(){claiming=false;say('Aún no se puede reclamar la victoria.');});
  }
  window.bfOnRivalAway=function(awayMs,over,afterMs){
    if(over||!awayMs||awayMs<(afterMs||300000)){hideBanner();return;}
    if(Date.now()<dismissedUntil)return;
    var minutes=Math.floor(awayMs/60000);
    var b=document.getElementById('bf-forfeit-banner');
    if(b){var n=b.querySelector('.bf-fb-min');if(n)n.textContent=String(minutes);return;}
    ensureCss();
    b=document.createElement('div');b.id='bf-forfeit-banner';
    var line=el('div','bf-rm-s');
    line.appendChild(document.createTextNode('Tu rival lleva'));
    line.appendChild(document.createTextNode(' '));
    line.appendChild(el('b','bf-fb-min',String(minutes)));
    line.appendChild(document.createTextNode(' '));
    line.appendChild(document.createTextNode('min sin conectarse.'));
    var row=el('div','bf-rm-row');
    row.appendChild(btn('Seguir esperando','',function(){hideBanner();dismissedUntil=Date.now()+2*60000;}));
    row.appendChild(btn('Reclamar victoria','bf-rm-go',claim));
    b.appendChild(line);b.appendChild(row);document.body.appendChild(b);
  };
})();
</script>
`;
