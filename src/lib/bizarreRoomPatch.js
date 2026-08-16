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
#bf-bizarre-overlay{position:fixed;inset:0;z-index:100400;display:none;flex-direction:column;background:url('https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/a841f7b0e_generated_image.png') center/cover no-repeat;overflow:hidden}
#bf-bizarre-overlay .bf-biz-room-bg{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,4,14,.6) 0%,rgba(8,4,14,.35) 35%,rgba(8,4,14,.85) 78%,rgba(8,4,14,.96) 100%);pointer-events:none;z-index:0}
#bf-bizarre-overlay .bf-biz-deco{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
#bf-bizarre-overlay .bf-biz-topbar{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:12px 14px;gap:10px}
#bf-bizarre-overlay .bf-biz-titlebar{font-family:Cinzel,serif;font-weight:1000;font-size:17px;color:#e2b0ff;letter-spacing:1px;text-shadow:0 0 16px rgba(192,91,255,.8),0 2px 5px #000;text-align:center;flex:1}
#bf-bizarre-overlay .bf-biz-x{width:38px;height:38px;border-radius:50%;border:1px solid rgba(199,155,255,.45);background:rgba(18,13,34,.72);color:#e2b0ff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);flex-shrink:0}
#bf-bizarre-overlay .bf-biz-x:hover{background:rgba(40,24,64,.88);color:#fff}
#bf-bizarre-overlay .bf-biz-panel{position:relative;z-index:3;margin-top:auto;width:100%;max-width:560px;margin-left:auto;margin-right:auto;padding:16px 16px 22px;border-radius:24px 24px 0 0;background:linear-gradient(180deg,rgba(20,12,38,.82),rgba(10,6,20,.95));border-top:2px solid rgba(199,155,255,.5);box-shadow:0 -12px 44px rgba(0,0,0,.6),inset 0 0 30px rgba(120,40,200,.12);backdrop-filter:blur(6px);max-height:60vh;overflow-y:auto}
#bf-bizarre-overlay .bf-biz-portrait{position:absolute;width:58px;height:74px;border-radius:8px;border:2px solid rgba(199,155,255,.5);box-shadow:0 6px 18px rgba(0,0,0,.6),0 0 12px rgba(192,91,255,.3),inset 0 -18px 28px rgba(8,4,14,.6);background:#1a1428;background-size:cover;background-position:center top;pointer-events:none;animation:bfPortraitGlow 4s ease-in-out infinite}
@keyframes bfPortraitGlow{0%,100%{box-shadow:0 6px 18px rgba(0,0,0,.6),0 0 12px rgba(192,91,255,.3),inset 0 -18px 28px rgba(8,4,14,.6)}50%{box-shadow:0 6px 18px rgba(0,0,0,.6),0 0 22px rgba(192,91,255,.6),inset 0 -18px 28px rgba(8,4,14,.6)}}
#bf-bizarre-overlay .bf-biz-torch{position:absolute;top:10%;width:14px;height:60px;pointer-events:none}
#bf-bizarre-overlay .bf-biz-torch.l{left:18px}#bf-bizarre-overlay .bf-biz-torch.r{right:18px}
#bf-bizarre-overlay .bf-biz-torch::before{content:'';position:absolute;left:50%;top:0;transform:translateX(-50%);width:12px;height:22px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 50% 70%,#fff6c0,#ffb24a 40%,#ff5a2a 75%,transparent 100%);box-shadow:0 0 16px rgba(255,150,40,.8),0 0 30px rgba(255,90,20,.5);animation:bfTorchFlick .45s ease-in-out infinite alternate}
#bf-bizarre-overlay .bf-biz-torch::after{content:'';position:absolute;left:50%;top:-10px;transform:translateX(-50%);width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,rgba(255,160,60,.35),transparent 70%)}
#bf-bizarre-overlay .bf-biz-rune{position:absolute;font-family:Cinzel,serif;font-size:26px;color:rgba(199,155,255,.3);text-shadow:0 0 12px rgba(192,91,255,.5);pointer-events:none;animation:bfRunePulse 3s ease-in-out infinite}
#bf-bizarre-overlay .bf-biz-ember{position:absolute;bottom:10%;width:3px;height:3px;border-radius:50%;background:#ffb86a;box-shadow:0 0 6px rgba(255,150,60,.9);opacity:.7;animation:bfEmber 4s linear infinite;pointer-events:none}
#bf-bizarre-overlay .bf-biz-duck{position:absolute;font-size:30px;pointer-events:none;filter:drop-shadow(0 0 8px rgba(255,210,74,.6));animation:bfDuckFloat 6s ease-in-out infinite}
#bf-bizarre-overlay .bf-biz-tentacle{position:absolute;font-size:44px;pointer-events:none;opacity:.55}
#bf-bizarre-overlay .bf-biz-eyeball{position:absolute;top:8%;left:50%;transform:translateX(-50%);font-size:22px;pointer-events:none;animation:bfEyeBlink 4s ease-in-out infinite;filter:drop-shadow(0 0 10px rgba(255,42,90,.8))}
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
#bf-bizarre-overlay .bf-biz-panic{color:#fff;padding:16px;font-size:18px;background:linear-gradient(180deg,#ff5a7a,#ff2a5a 50%,#a00f3a);box-shadow:0 8px 26px rgba(255,42,90,.65),inset 0 2px 0 rgba(255,255,255,.25),inset 0 -3px 8px rgba(0,0,0,.4);animation:bfPanicPulse 1.6s ease-in-out infinite;text-shadow:0 2px 4px #000;letter-spacing:1px}
#bf-bizarre-overlay .bf-biz-panic:hover{filter:brightness(1.12)}
#bf-bizarre-overlay .bf-biz-panic:disabled{opacity:.4;cursor:not-allowed;animation:none;box-shadow:none}
@keyframes bfPanicPulse{0%,100%{box-shadow:0 8px 26px rgba(255,42,90,.65),inset 0 2px 0 rgba(255,255,255,.25),inset 0 -3px 8px rgba(0,0,0,.4)}50%{box-shadow:0 8px 36px rgba(255,42,90,.95),0 0 40px rgba(255,42,90,.45),inset 0 2px 0 rgba(255,255,255,.3),inset 0 -3px 8px rgba(0,0,0,.4)}}
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
/* bf-biz-x y wrap movidos a la topbar */
.bf-bizarre-room{position:relative;margin:18px 0 6px;padding:0;border-radius:18px;overflow:hidden;border:2px solid rgba(192,91,255,.5);box-shadow:0 12px 34px rgba(0,0,0,.6),inset 0 0 40px rgba(120,40,200,.18);background:linear-gradient(180deg,rgba(20,10,34,0) 0%,rgba(8,4,14,.55) 100%),radial-gradient(ellipse at 50% 120%,rgba(192,91,255,.25),transparent 60%),linear-gradient(160deg,#241438 0%,#160c26 55%,#0c0718 100%)}
.bf-bizarre-room::before{content:'';position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(180deg,transparent 0%,rgba(60,30,90,.35) 40%,rgba(30,12,50,.6) 100%);transform:perspective(420px) rotateX(48deg);transform-origin:bottom center;pointer-events:none}
.bf-bizarre-arch{position:absolute;top:0;left:0;right:0;height:46%;background:radial-gradient(ellipse at 50% 100%,rgba(40,20,70,.5),transparent 70%);pointer-events:none}
.bf-bizarre-torch{position:absolute;top:16%;width:14px;height:60px;pointer-events:none;z-index:1}
.bf-bizarre-torch.l{left:10px}.bf-bizarre-torch.r{right:10px}
.bf-bizarre-torch::before{content:'';position:absolute;left:50%;top:0;transform:translateX(-50%);width:12px;height:22px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 50% 70%,#fff6c0,#ffb24a 40%,#ff5a2a 75%,transparent 100%);box-shadow:0 0 16px rgba(255,150,40,.8),0 0 30px rgba(255,90,20,.5);animation:bfTorchFlick .45s ease-in-out infinite alternate}
.bf-bizarre-torch::after{content:'';position:absolute;left:50%;top:-10px;transform:translateX(-50%);width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,rgba(255,160,60,.35),transparent 70%)}
@keyframes bfTorchFlick{0%{transform:translateX(-50%) scaleY(1) scaleX(1);opacity:.9}100%{transform:translateX(-50%) scaleY(1.18) scaleX(.85);opacity:1}}
.bf-bizarre-ember{position:absolute;bottom:20%;width:3px;height:3px;border-radius:50%;background:#ffb86a;box-shadow:0 0 6px rgba(255,150,60,.9);opacity:.7;animation:bfEmber 4s linear infinite;pointer-events:none;z-index:1}
@keyframes bfEmber{0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:.8}100%{transform:translateY(-120px) translateX(8px);opacity:0}}
.bf-bizarre-rune{position:absolute;font-family:Cinzel,serif;font-size:22px;color:rgba(199,155,255,.28);text-shadow:0 0 10px rgba(192,91,255,.4);pointer-events:none;animation:bfRunePulse 3s ease-in-out infinite;z-index:1}
@keyframes bfRunePulse{0%,100%{opacity:.2}50%{opacity:.55}}
.bf-bizarre-content{position:relative;z-index:2;padding:18px 18px 16px}
.bf-bizarre-header{position:relative;display:flex;align-items:center;gap:12px;margin-bottom:10px}
.bf-bizarre-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;background:linear-gradient(135deg,rgba(192,91,255,.35),rgba(120,40,200,.2));border:2px solid rgba(199,155,255,.6);box-shadow:0 0 18px rgba(192,91,255,.45),inset 0 0 12px rgba(192,91,255,.3);flex-shrink:0}
.bf-bizarre-titles{flex:1;min-width:0}
.bf-bizarre-name{font-family:Cinzel,serif;font-weight:1000;font-size:18px;color:#e2b0ff;letter-spacing:.5px;text-shadow:0 0 14px rgba(192,91,255,.55),0 1px 3px #000;line-height:1.1}
.bf-bizarre-tag{font-size:11px;color:#c79bff;font-weight:700;letter-spacing:.3px;margin-top:2px}
.bf-bizarre-desc{position:relative;font-size:12.5px;line-height:1.5;color:#d4cce4;font-family:Rubik,sans-serif;margin-bottom:6px}
.bf-bizarre-desc b{color:#e2b0ff}
.bf-bizarre-portal{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin:14px 0 0;padding:14px 16px;border-radius:14px;border:2px solid rgba(199,155,255,.6);background:linear-gradient(180deg,rgba(120,60,200,.45),rgba(60,20,120,.6));color:#f3e6ff;font-family:Cinzel,serif;font-weight:1000;font-size:15px;letter-spacing:.4px;cursor:pointer;text-shadow:0 2px 4px #000;box-shadow:0 0 22px rgba(192,91,255,.4),inset 0 0 18px rgba(192,91,255,.25);transition:transform .14s ease,box-shadow .14s ease;overflow:hidden}
.bf-bizarre-portal:hover{transform:translateY(-2px);box-shadow:0 0 34px rgba(192,91,255,.65),inset 0 0 24px rgba(192,91,255,.4)}
.bf-bizarre-portal::before{content:'';position:absolute;inset:0;background:conic-gradient(from 0deg,rgba(192,91,255,0),rgba(192,91,255,.35),rgba(255,42,90,.25),rgba(192,91,255,0));animation:bfPortalSpin 6s linear infinite;opacity:.6}
@keyframes bfPortalSpin{to{transform:rotate(360deg)}}
.bf-bizarre-portal>span{position:relative;z-index:1}
.bf-bizarre-portal .bf-bizarre-ico{font-size:20px;filter:drop-shadow(0 0 8px rgba(192,91,255,.8))}
.bf-bizarre-duck{position:absolute;font-size:26px;pointer-events:none;z-index:1;filter:drop-shadow(0 0 8px rgba(255,210,74,.6));animation:bfDuckFloat 6s ease-in-out infinite}
.bf-bizarre-duck.d1{top:14%;left:30%;animation-delay:0s}
.bf-bizarre-duck.d2{bottom:18%;right:28%;animation-delay:2s;font-size:22px}
.bf-bizarre-duck.d3{top:40%;right:12%;animation-delay:4s;font-size:20px}
@keyframes bfDuckFloat{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-10px) rotate(6deg)}}
.bf-bizarre-tentacle{position:absolute;pointer-events:none;z-index:1;opacity:.5}
.bf-bizarre-tentacle.t1{bottom:-8px;left:8%;font-size:40px;color:#9d5df0;transform:rotate(-15deg);animation:bfTentWave 5s ease-in-out infinite}
.bf-bizarre-tentacle.t2{bottom:-8px;right:8%;font-size:40px;color:#c06bff;transform:rotate(15deg) scaleX(-1);animation:bfTentWave 5s ease-in-out infinite reverse}
@keyframes bfTentWave{0%,100%{transform:rotate(-15deg) translateY(0)}50%{transform:rotate(-8deg) translateY(-6px)}}
.bf-bizarre-eye{position:absolute;top:10%;left:50%;transform:translateX(-50%);font-size:18px;pointer-events:none;z-index:1;animation:bfEyeBlink 4s ease-in-out infinite;filter:drop-shadow(0 0 8px rgba(255,42,90,.7))}
@keyframes bfEyeBlink{0%,90%,100%{opacity:.6}93%,97%{opacity:0}}
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

  var cardArt={};
  window.addEventListener('message',function(e){
    if(e.data&&Array.isArray(e.data.bfAvatarCatalog)){
      avatarCatalog=(e.data.bfAvatarCatalog||[]).map(function(a){return a.url;}).filter(Boolean);
    }
    if(e.data&&e.data.bfCardArt){
      cardArt=e.data.bfCardArt||{};
      renderHeroPortraits();
    }
  });
  // Pinta retratos de héroes/bizarros del Oráculo (BD) en los marcos de la
  // habitación, como cuadros colgados en las paredes.
  function renderHeroPortraits(){
    var el=document.getElementById('bf-bizarre-overlay');
    if(!el||el.style.display==='none')return;
    var frames=el.querySelectorAll('.bf-biz-portrait');
    if(!frames.length)return;
    var urls=[];
    Object.keys(cardArt).forEach(function(k){var a=cardArt[k];if(a&&a.base)urls.push(a.base);});
    for(var i=urls.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=urls[i];urls[i]=urls[j];urls[j]=t;}
    if(!urls.length)return;
    frames.forEach(function(f,i){if(urls[i])f.style.backgroundImage="url('"+String(urls[i]).replace(/'/g,'')+"')";});
  }

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
    if(document.getElementById('bf-bizarre-section'))return;
    var sec=document.createElement('div');
    sec.id='bf-bizarre-section';
    sec.className='bf-bizarre-room';
    sec.innerHTML=
      '<div class="bf-bizarre-arch"></div>'+
      '<div class="bf-bizarre-eye">👁</div>'+
      '<div class="bf-bizarre-torch l"></div>'+
      '<div class="bf-bizarre-torch r"></div>'+
      '<div class="bf-bizarre-duck d1">🦆</div>'+
      '<div class="bf-bizarre-duck d2">🦆</div>'+
      '<div class="bf-bizarre-duck d3">🦆</div>'+
      '<div class="bf-bizarre-tentacle t1">🐙</div>'+
      '<div class="bf-bizarre-tentacle t2">🐙</div>'+
      '<div class="bf-bizarre-rune" style="top:28%;left:16%">⛧</div>'+
      '<div class="bf-bizarre-rune" style="top:22%;right:18%;animation-delay:1s">✦</div>'+
      '<div class="bf-bizarre-rune" style="bottom:32%;left:22%;animation-delay:.5s">⚜</div>'+
      '<div class="bf-bizarre-rune" style="bottom:28%;right:24%;animation-delay:1.5s">✧</div>'+
      '<div class="bf-bizarre-ember" style="left:20%;animation-delay:0s"></div>'+
      '<div class="bf-bizarre-ember" style="left:48%;animation-delay:1.3s"></div>'+
      '<div class="bf-bizarre-ember" style="left:74%;animation-delay:2.6s"></div>'+
      '<div class="bf-bizarre-content">'+
        '<div class="bf-bizarre-header">'+
          '<div class="bf-bizarre-icon">🃏</div>'+
          '<div class="bf-bizarre-titles">'+
            '<div class="bf-bizarre-name">'+L('Habitación Bizarra','Bizarre Room')+'</div>'+
            '<div class="bf-bizarre-tag">'+L('Partidas públicas al azar','Random public matches')+'</div>'+
          '</div>'+
        '</div>'+
        '<div class="bf-bizarre-desc">'+L(
          'Entra con tu nick, mira quién hay dentro y pulsa el <b>Botón de Pánico</b>: te empareja al azar con otro visitante y arranca una partida online. Se necesita un mínimo de <b>3 visitantes</b> para activarlo.',
          'Join with your nick, see who is inside and hit the <b>Panic Button</b>: it matches you randomly with another visitor and starts an online game. A minimum of <b>3 visitors</b> is needed to activate it.'
        )+'</div>'+
        '<button class="bf-bizarre-portal" id="bf-bizarre-entry">'+
          '<span class="bf-bizarre-ico">🚪</span><span>'+L('Entrar en la habitación','Enter the room')+'</span>'+
        '</button>'+
      '</div>';
    sec.querySelector('#bf-bizarre-entry').onclick=function(e){e.preventDefault();e.stopPropagation();openOverlay();};
    // Inserta la sección al PRINCIPIO del setup-box (justo después de la
    // ayuda del lobby si existe), para que sea lo primero que se vea al
    // entrar al lobby sin necesidad de hacer scroll.
    var lobbyInfo=box.querySelector('#bf-lobby-info');
    if(lobbyInfo)lobbyInfo.insertAdjacentElement('afterend',sec);
    else box.insertBefore(sec,box.firstChild);
  }

  function overlayEl(){
    var el=document.getElementById('bf-bizarre-overlay');
    if(!el){
      el=document.createElement('div');
      el.id='bf-bizarre-overlay';
      el.innerHTML='<div class="bf-biz-room-bg"></div>'+
        '<div class="bf-biz-deco">'+
        '<div class="bf-biz-eyeball">👁</div>'+
        '<div class="bf-biz-torch l"></div><div class="bf-biz-torch r"></div>'+
        '<div class="bf-biz-rune" style="top:15%;left:14%">⛧</div>'+
        '<div class="bf-biz-rune" style="top:12%;right:16%;animation-delay:1s">✦</div>'+
        '<div class="bf-biz-rune" style="top:30%;left:6%;animation-delay:.5s">⚜</div>'+
        '<div class="bf-biz-rune" style="top:26%;right:8%;animation-delay:1.5s">✧</div>'+
        '<div class="bf-biz-ember" style="left:20%;animation-delay:0s"></div>'+
        '<div class="bf-biz-ember" style="left:50%;animation-delay:1.3s"></div>'+
        '<div class="bf-biz-ember" style="left:80%;animation-delay:2.6s"></div>'+
        '<div class="bf-biz-duck" style="top:16%;left:32%;animation-delay:0s">🦆</div>'+
        '<div class="bf-biz-duck" style="top:22%;right:30%;animation-delay:2s;font-size:26px">🦆</div>'+
        '<div class="bf-biz-duck" style="top:38%;left:20%;animation-delay:4s;font-size:22px">🦆</div>'+
        '<div class="bf-biz-portrait" style="top:64px;left:8px"></div>'+
        '<div class="bf-biz-portrait" style="top:64px;right:8px"></div>'+
        '<div class="bf-biz-portrait" style="top:148px;left:4px;animation-delay:1.5s"></div>'+
        '<div class="bf-biz-portrait" style="top:148px;right:4px;animation-delay:.8s"></div>'+
        '<div class="bf-biz-tentacle" style="bottom:-10px;left:4%;color:#9d5df0;transform:rotate(-15deg);animation:bfTentWave 5s ease-in-out infinite">🐙</div>'+
        '<div class="bf-biz-tentacle" style="bottom:-10px;right:4%;color:#c06bff;transform:rotate(15deg) scaleX(-1);animation:bfTentWave 5s ease-in-out infinite reverse">🐙</div>'+
        '</div>'+
        '<div class="bf-biz-topbar"><div style="width:38px"></div><div class="bf-biz-titlebar">🃏 '+L('Habitación Bizarra','Bizarre Room')+'</div><button class="bf-biz-x">✕</button></div>'+
        '<div class="bf-biz-panel"><div class="bf-biz-sub">'+L('Entra, mira quién hay y pulsa el botón de pánico para una partida al azar.','Join, see who is here and hit the panic button for a random match.')+'</div><div class="bf-biz-body"></div></div>';
      document.body.appendChild(el);
      el.querySelector('.bf-biz-x').onclick=function(){closeOverlay();};
    }
    return el;
  }

  function openOverlay(){
    var el=overlayEl();
    el.style.display='flex';
    renderBody();
    renderHeroPortraits();
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
        return '<div class="bf-biz-visitor'+(isMe?' me':'')+'"><img class="bf-biz-vav" src="'+esc(v.avatar||'')+'" alt="" onerror="this.style.display=&quot;none&quot;"><div class="bf-biz-vinfo"><div class="bf-biz-vnick">'+esc(v.nick)+(isMe?' ('+L('tú','you')+')':'')+'</div><div class="bf-biz-vwins">🏆 '+L('Victorias','Wins')+': '+Number(v.total_wins||0)+'</div></div></div>';
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

  // Botón en el lobby. El juego re-renderiza el setup-box (renderRoomList)
  // y borra la sección; sin re-inyección inmediata, "parpadea" hasta el
  // próximo intervalo. El MutationObserver la reinyecta en la misma microtask
  // (antes del pintado) para que no se vea ningún parpadeo.
  function installObserver(){
    var lobby=document.getElementById('s-lobby');
    if(!lobby||window.__bfBizarreObs)return;
    var box=lobby.querySelector('.setup-box')||lobby;
    window.__bfBizarreObs=true;
    new MutationObserver(function(){if(!document.getElementById('bf-bizarre-section'))injectButton();}).observe(box,{childList:true,subtree:true});
  }
  setInterval(function(){injectButton();installObserver();},800);
  injectButton();installObserver();

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