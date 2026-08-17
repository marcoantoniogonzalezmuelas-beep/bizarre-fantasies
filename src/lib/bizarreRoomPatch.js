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
#bf-bizarre-overlay .bf-biz-panel{position:relative;z-index:3;width:100%;max-width:720px;margin-left:auto;margin-right:auto;padding:18px 18px 24px;border-radius:0 0 26px 26px;background:linear-gradient(180deg,rgba(22,14,40,.9),rgba(10,6,20,.96));border-bottom:2px solid rgba(199,155,255,.5);box-shadow:0 16px 44px rgba(0,0,0,.6),inset 0 0 30px rgba(120,40,200,.12);backdrop-filter:blur(6px);max-height:62vh;overflow-y:auto}
#bf-bizarre-overlay .bf-biz-shelf{position:absolute;height:7px;left:5%;right:5%;background:linear-gradient(180deg,#4a3220 0%,#1a0e06 45%,#2a180e 100%);box-shadow:0 6px 14px rgba(0,0,0,.8),inset 0 1px 0 rgba(160,110,50,.4),inset 0 -1px 0 rgba(0,0,0,.5);border-radius:2px;z-index:0;pointer-events:none}
#bf-bizarre-overlay .bf-biz-portrait{position:absolute;padding:8px 8px 9px;border-radius:4px;background:linear-gradient(145deg,#d4a84a 0%,#8a6020 22%,#b8902a 48%,#6a4818 72%,#c9a44a 100%);box-shadow:0 18px 36px rgba(0,0,0,.9),0 6px 12px rgba(0,0,0,.6),inset 0 2px 3px rgba(255,230,160,.45),inset 0 -3px 6px rgba(0,0,0,.5),inset 2px 0 3px rgba(255,220,140,.25),inset -2px 0 3px rgba(0,0,0,.35),0 0 14px rgba(192,91,255,.1);pointer-events:none;animation:bfPortraitSway 6s ease-in-out infinite;transform-origin:top center;z-index:2}
#bf-bizarre-overlay .bf-biz-portrait-img{width:56px;height:72px;border-radius:1px;background:#1a1428;background-size:cover;background-position:center top;box-shadow:inset 0 0 0 3px #ece0c8,inset 0 0 0 4px rgba(0,0,0,.25),inset 0 -14px 22px rgba(0,0,0,.45),inset 0 0 18px rgba(0,0,0,.25);position:relative;overflow:hidden}
#bf-bizarre-overlay .bf-biz-portrait-img::after{content:'';position:absolute;inset:3px;background:linear-gradient(135deg,rgba(255,255,255,.16) 0%,transparent 35%,transparent 65%,rgba(255,255,255,.04) 100%);pointer-events:none;border-radius:1px}
#bf-bizarre-overlay .bf-biz-portrait::before{content:'';position:absolute;top:-26px;left:50%;width:1.5px;height:26px;background:linear-gradient(180deg,rgba(199,155,255,.55),rgba(199,155,255,.12));transform:translateX(-50%)}
#bf-bizarre-overlay .bf-biz-portrait::after{content:'';position:absolute;top:-29px;left:50%;width:7px;height:7px;border-radius:50%;background:#e2c46a;transform:translateX(-50%);box-shadow:0 0 8px rgba(226,196,106,.8),0 1px 2px #000}
@keyframes bfPortraitSway{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}
#bf-bizarre-overlay .bf-biz-torch{position:absolute;top:10%;width:14px;height:60px;pointer-events:none}
#bf-bizarre-overlay .bf-biz-torch.l{left:18px}#bf-bizarre-overlay .bf-biz-torch.r{right:18px}
#bf-bizarre-overlay .bf-biz-torch::before{content:'';position:absolute;left:50%;top:0;transform:translateX(-50%);width:12px;height:22px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 50% 70%,#fff6c0,#ffb24a 40%,#ff5a2a 75%,transparent 100%);box-shadow:0 0 16px rgba(255,150,40,.8),0 0 30px rgba(255,90,20,.5);animation:bfTorchFlick .45s ease-in-out infinite alternate}
#bf-bizarre-overlay .bf-biz-torch::after{content:'';position:absolute;left:50%;top:-10px;transform:translateX(-50%);width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,rgba(255,160,60,.35),transparent 70%)}
#bf-bizarre-overlay .bf-biz-rune{position:absolute;font-family:Cinzel,serif;font-size:26px;color:rgba(199,155,255,.3);text-shadow:0 0 12px rgba(192,91,255,.5);pointer-events:none;animation:bfRunePulse 3s ease-in-out infinite}
#bf-bizarre-overlay .bf-biz-ember{position:absolute;width:3px;height:3px;border-radius:50%;background:#ffb86a;box-shadow:0 0 6px rgba(255,150,60,.9);opacity:.7;animation:bfEmber 4s linear infinite;pointer-events:none}
#bf-bizarre-overlay .bf-biz-sparkle{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff5dc;box-shadow:0 0 6px rgba(255,210,74,.8),0 0 12px rgba(255,210,74,.4);opacity:0;animation:bfSparkle 3s ease-in-out infinite;pointer-events:none}
@keyframes bfSparkle{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:.9;transform:scale(1.2)}}
#bf-bizarre-overlay .bf-biz-duck{position:absolute;font-size:30px;pointer-events:none;filter:drop-shadow(0 0 8px rgba(255,210,74,.6));animation:bfDuckFloat 6s ease-in-out infinite}
#bf-bizarre-overlay .bf-biz-tentacle{position:absolute;font-size:44px;pointer-events:none;opacity:.55}
#bf-bizarre-overlay .bf-biz-eyeball{position:absolute;top:8%;left:50%;transform:translateX(-50%);font-size:22px;pointer-events:none;animation:bfEyeBlink 4s ease-in-out infinite;filter:drop-shadow(0 0 10px rgba(255,42,90,.8))}
#bf-bizarre-overlay .bf-biz-title{font-family:Cinzel,serif;font-weight:1000;font-size:22px;color:#e2b0ff;text-align:center;letter-spacing:1px;text-shadow:0 0 18px rgba(192,91,255,.6),0 2px 4px #000;margin-bottom:4px}
#bf-bizarre-overlay .bf-biz-sub{font-size:13px;color:#cfc6dd;text-align:center;line-height:1.4;margin-bottom:18px}
#bf-bizarre-overlay .bf-biz-ig{margin-bottom:14px}
#bf-bizarre-overlay .bf-biz-ig label{display:block;margin-bottom:6px;font-family:Cinzel,serif;font-weight:900;font-size:14px;color:#c79bff;letter-spacing:.3px}
#bf-bizarre-overlay .bf-biz-ig input{width:100%;box-sizing:border-box;padding:14px 16px;border-radius:13px;background:rgba(8,5,14,.6);border:2px solid rgba(199,155,255,.3);color:#fff5dc;font-size:17px;font-weight:600;outline:none;transition:border-color .14s ease}
#bf-bizarre-overlay .bf-biz-ig input:focus{border-color:#c06bff;box-shadow:0 0 0 3px rgba(192,91,255,.18)}
#bf-bizarre-overlay .bf-biz-avgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:10px;max-height:150px;overflow-y:auto;padding:8px;border-radius:12px;background:rgba(8,5,14,.4);border:1px solid rgba(199,155,255,.2)}
#bf-bizarre-overlay .bf-biz-av{width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.15);cursor:pointer;transition:transform .12s ease,border-color .12s ease}
#bf-bizarre-overlay .bf-biz-av:hover{transform:scale(1.1)}
#bf-bizarre-overlay .bf-biz-av.selected{border-color:#c06bff;box-shadow:0 0 14px rgba(192,91,255,.7)}
#bf-bizarre-overlay .bf-biz-btn{width:100%;padding:16px;border-radius:15px;border:none;font-family:Cinzel,serif;font-weight:1000;font-size:18px;cursor:pointer;transition:transform .12s ease,filter .12s ease;letter-spacing:.5px}
#bf-bizarre-overlay .bf-biz-btn:active{transform:scale(.96)}
#bf-bizarre-overlay .bf-biz-join{color:#fff;background:linear-gradient(180deg,#9d5df0,#c06bff 55%,#7a3df0);box-shadow:0 6px 18px rgba(160,80,255,.45)}
#bf-bizarre-overlay .bf-biz-join:hover{filter:brightness(1.1)}
#bf-bizarre-overlay .bf-biz-panic{color:#fff;padding:16px;font-size:18px;background:linear-gradient(180deg,#ff5a7a,#ff2a5a 50%,#a00f3a);box-shadow:0 8px 26px rgba(255,42,90,.65),inset 0 2px 0 rgba(255,255,255,.25),inset 0 -3px 8px rgba(0,0,0,.4);animation:bfPanicPulse 1.6s ease-in-out infinite;text-shadow:0 2px 4px #000;letter-spacing:1px}
#bf-bizarre-overlay .bf-biz-panic:hover{filter:brightness(1.12)}
#bf-bizarre-overlay .bf-biz-panic:disabled{opacity:.4;cursor:not-allowed;animation:none;box-shadow:none}
@keyframes bfPanicPulse{0%,100%{box-shadow:0 8px 26px rgba(255,42,90,.65),inset 0 2px 0 rgba(255,255,255,.25),inset 0 -3px 8px rgba(0,0,0,.4)}50%{box-shadow:0 8px 36px rgba(255,42,90,.95),0 0 40px rgba(255,42,90,.45),inset 0 2px 0 rgba(255,255,255,.3),inset 0 -3px 8px rgba(0,0,0,.4)}}
#bf-bizarre-overlay .bf-biz-leave{margin-top:12px;color:#cfc6dd;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);font-size:15px;padding:13px}
#bf-bizarre-overlay .bf-biz-list{margin:16px 0;max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}
#bf-bizarre-overlay .bf-biz-visitor{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:rgba(199,155,255,.08);border:1px solid rgba(199,155,255,.2)}
#bf-bizarre-overlay .bf-biz-visitor.me{border-color:#c06bff;background:rgba(192,91,255,.15)}
#bf-bizarre-overlay .bf-biz-vav{width:48px;height:48px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(199,155,255,.4);flex-shrink:0;background:#1a1428}
#bf-bizarre-overlay .bf-biz-vinfo{flex:1;min-width:0}
#bf-bizarre-overlay .bf-biz-vnick{font-family:Cinzel,serif;font-weight:900;font-size:17px;color:#fff5dc;text-shadow:0 1px 2px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bf-bizarre-overlay .bf-biz-vwins{font-size:13px;color:#ffe49a;font-weight:700}
#bf-bizarre-overlay .bf-biz-count{text-align:center;font-size:14px;color:#cfc6dd;margin-bottom:10px}
#bf-bizarre-overlay .bf-biz-count b{color:#e2b0ff}
#bf-bizarre-overlay .bf-biz-wait{margin-top:14px;padding:12px;border-radius:12px;background:rgba(255,42,90,.12);border:1px solid rgba(255,42,90,.4);text-align:center;color:#ffb0c0;font-size:13px;line-height:1.4}
#bf-bizarre-overlay .bf-biz-spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,42,90,.3);border-top-color:#ff2a5a;border-radius:50%;animation:bfBizSpin .8s linear infinite;vertical-align:middle;margin-right:6px}
/* Ruleta de la suerte */
#bf-biz-roulette{position:relative;width:clamp(220px,70vw,300px);height:clamp(220px,70vw,300px);margin:0 auto 12px}
.bf-biz-wheel{position:relative;width:100%;height:100%;border-radius:50%;border:4px solid #c06bff;background:radial-gradient(circle,rgba(30,15,50,.95),rgba(10,5,20,.98));box-shadow:0 0 30px rgba(192,91,255,.5),inset 0 0 30px rgba(120,40,200,.15);transition:transform 4s cubic-bezier(.15,.85,.25,1)}
.bf-biz-wheel-av{position:absolute;width:clamp(36px,10vw,48px);height:clamp(36px,10vw,48px);border-radius:50%;border:2px solid rgba(255,210,74,.4);object-fit:cover;background:#1a1428;transform:translate(-50%,-50%);box-shadow:0 2px 8px rgba(0,0,0,.5)}
.bf-biz-wheel-nick{position:absolute;font-size:clamp(7px,1.8vw,10px);color:#fff5dc;text-shadow:0 1px 3px #000;white-space:nowrap;transform:translate(-50%,0);pointer-events:none;font-weight:700}
.bf-biz-pointer{position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-size:28px;z-index:10;filter:drop-shadow(0 0 10px rgba(255,210,74,.9));animation:bfPtrBounce .6s ease-in-out infinite alternate}
@keyframes bfPtrBounce{0%{transform:translateX(-50%) translateY(0)}100%{transform:translateX(-50%) translateY(4px)}}
.bf-biz-roulette-label{text-align:center;font-family:Cinzel,serif;font-weight:900;font-size:15px;color:#e2b0ff;margin-bottom:8px;text-shadow:0 0 12px rgba(192,91,255,.6);letter-spacing:.5px}
.bf-biz-roulette-sub{text-align:center;font-size:12px;color:#ffe49a;margin-top:6px;font-weight:700;min-height:18px}
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
  var spinState=null; // {target_nick,target_avatar,visitors,isSpinner,match}
  var avatarCatalog=[];
  var selectedAvatar='';
  var joined=false;

  var playerAvatars={}; // nick → avatar_url (BD PlayerAvatar)
  window.addEventListener('message',function(e){
    if(e.data&&Array.isArray(e.data.bfAvatarCatalog)){
      avatarCatalog=(e.data.bfAvatarCatalog||[]).map(function(a){return a.url;}).filter(Boolean);
    }
    if(e.data&&e.data.bfPlayerAvatars&&typeof e.data.bfPlayerAvatars==='object'){
      playerAvatars=e.data.bfPlayerAvatars;
      var ni=document.getElementById('bf-biz-nick');
      if(ni)bizSyncAvatar(ni.value);
    }
  });
  // Sincroniza el avatar desde la BD (PlayerAvatar) según el nick escrito.
  // Si el nick tiene avatar en la BD → lo auto-selecciona en la grille.
  // Sincroniza el avatar desde la BD (PlayerAvatar) según el nick escrito.
  // Si el nick tiene avatar en la BD → lo muestra en el picker. Si es un nick
  // nuevo (sin avatar en la BD) → muestra el interrogante, igual que VS IA.
  function bizSyncAvatar(nick){
    nick=String(nick||'').trim();
    var pick=overlayEl().querySelector('#bf-biz-avpick');
    if(!pick)return;
    var avUrl=playerAvatars[nick]||playerAvatars[nick.toLowerCase()]||playerAvatars[nick.toUpperCase()];
    if(!avUrl){for(var k in playerAvatars){if(k.toLowerCase()===nick.toLowerCase()){avUrl=playerAvatars[k];break;}}}
    if(avUrl){
      window.bfMyAvatar={url:avUrl,name:''};
      try{localStorage.setItem('bfMyAvatar',JSON.stringify(window.bfMyAvatar));localStorage.setItem('bfMyAvatarUrl',avUrl);}catch(e){}
      pick.innerHTML='<img src="'+avUrl+'">';
      pick.classList.remove('bf-av-empty');
    }else if(nick){
      // Nick nuevo sin avatar en la BD: muestra el interrogante (pulsa para elegir).
      try{localStorage.removeItem('bfMyAvatar');localStorage.removeItem('bfMyAvatarUrl');}catch(e){}
      window.bfMyAvatar=null;
      pick.innerHTML='<span class="bf-av-ph">?</span>';
      pick.classList.add('bf-av-empty');
    }
  }
  // ---- RULETA DE LA SUERTE ----
  // Renderiza la ruleta con todos los visitantes y la anima hasta parar en
  // el objetivo. Todos los que estan en la habitacion la ven (sincronizada
  // por heartbeat: el backend devuelve spin con el par activo).
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function renderRouletteHtml(){
    if(!spinState) return '';
    var vis=spinState.visitors||[];
    if(!vis.length) return '';
    var targetNick=spinState.target_nick||'';
    var targetIdx=-1;
    for(var i=0;i<vis.length;i++){ if(vis[i].nick===targetNick){ targetIdx=i; break; } }
    if(targetIdx<0) targetIdx=0;
    var N=vis.length;
    // La ruleta escala según el nº de jugadores: hasta 20 avatares con nicks.
    var wheelSize,avSize,nickSize,R;
    if(N<=6){wheelSize=300;avSize=48;nickSize=10;R=118;}
    else if(N<=10){wheelSize=320;avSize=40;nickSize=9;R=128;}
    else if(N<=15){wheelSize=350;avSize=34;nickSize=8;R=142;}
    else {wheelSize=380;avSize=30;nickSize=7;R=152;}
    var angleStep=360/N;
    var html='';
    for(var j=0;j<N;j++){
      var angle=(j*angleStep)*Math.PI/180-Math.PI/2;
      var x=Math.round(R*Math.cos(angle));
      var y=Math.round(R*Math.sin(angle));
      var isTarget=j===targetIdx;
      var av=vis[j].avatar||'';
      var nick=esc(vis[j].nick||'');
      if(N>10&&nick.length>10)nick=nick.slice(0,9)+'…';
      var borderStyle=isTarget?';border-color:#FFD24A;box-shadow:0 0 14px rgba(255,210,74,.8)':'';
      html+='<img class="bf-biz-wheel-av" src="'+esc(av)+'" style="width:'+avSize+'px;height:'+avSize+'px;left:calc(50% + '+x+'px);top:calc(50% + '+y+'px)'+borderStyle+'" onerror="this.style.visibility=&quot;hidden&quot;">';
      html+='<div class="bf-biz-wheel-nick" style="left:calc(50% + '+x+'px);top:calc(50% + '+(y+Math.round(avSize/2)+3)+'px);font-size:'+nickSize+'px">'+nick+'</div>';
    }
    var label=spinState.isSpinner?L('🎡 ¡Ruleta de la Suerte!','🎡 Wheel of Fortune!'):L('🎡 '+esc(spinState.spinner_nick||'')+' pulsó el pánico…','🎡 '+esc(spinState.spinner_nick||'')+' hit panic…');
    return '<div class="bf-biz-roulette-label">'+label+'</div>'+
      '<div id="bf-biz-roulette" style="width:'+wheelSize+'px;height:'+wheelSize+'px"><div class="bf-biz-pointer">🔻</div><div class="bf-biz-wheel" id="bf-biz-wheel">'+html+'</div></div>'+
      '<div class="bf-biz-roulette-sub" id="bf-biz-roulette-sub"></div>';
  }
  function spinRoulette(){
    if(!spinState) return;
    var vis=spinState.visitors||[];
    if(!vis.length) return;
    var targetNick=spinState.target_nick||'';
    var targetIdx=-1;
    for(var i=0;i<vis.length;i++){ if(vis[i].nick===targetNick){ targetIdx=i; break; } }
    if(targetIdx<0) targetIdx=0;
    var N=vis.length;
    var angleStep=360/N;
    var turns=5;
    var finalAngle=turns*360+(360-targetIdx*angleStep);
    var wheel=overlayEl().querySelector('#bf-biz-wheel');
    if(wheel){
      void wheel.offsetWidth;
      wheel.style.transform='rotate('+finalAngle+'deg)';
    }
    var sub=overlayEl().querySelector('#bf-biz-roulette-sub');
    if(sub){
      sub.textContent=L('Girando…','Spinning…');
      setTimeout(function(){ if(sub) sub.textContent=L('Casi…','Almost…'); },2800);
      setTimeout(function(){ if(sub){ sub.textContent=L('¡Emparejado con '+esc(spinState.target_nick||'')+'!','Matched with '+esc(spinState.target_nick||'')+'!'); sub.style.color='#FFD24A'; } },3900);
    }
    if(spinState.isSpinner&&spinState.match){
      setTimeout(function(){
        if(spinState&&spinState.isSpinner) startMatchAsHost();
      },4200);
    }
  }
  function hideRoulette(){ spinState=null; }

  // Genera brasas y puntitos de luz dinámicos por toda la habitación.
  function spawnAmbient(){
    var c=document.getElementById('bf-biz-ambient');
    if(!c)return;
    c.innerHTML='';
    for(var i=0;i<28;i++){
      var e=document.createElement('div');
      e.className='bf-biz-ember';
      var sz=2+Math.floor(Math.random()*3);
      e.style.cssText='left:'+(Math.random()*100).toFixed(1)+'%;bottom:'+(Math.random()*50).toFixed(1)+'%;width:'+sz+'px;height:'+sz+'px;animation-delay:'+(Math.random()*4).toFixed(2)+'s;animation-duration:'+(3+Math.random()*3).toFixed(2)+'s';
      if(Math.random()<0.25){e.style.background='#c79bff';e.style.boxShadow='0 0 6px rgba(199,155,255,.9)';}
      c.appendChild(e);
    }
    for(var i=0;i<36;i++){
      var s=document.createElement('div');
      s.className='bf-biz-sparkle';
      var sz=2+Math.floor(Math.random()*4);
      s.style.cssText='left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*92).toFixed(1)+'%;width:'+sz+'px;height:'+sz+'px;animation-delay:'+(Math.random()*4).toFixed(2)+'s;animation-duration:'+(2+Math.random()*3).toFixed(2)+'s';
      c.appendChild(s);
    }
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
        '<div class="bf-biz-deco" id="bf-biz-ambient"></div>'+
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
    spawnAmbient();
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
    // Si la ruleta está girando, se muestra encima de todo
    if(spinState){
      body.innerHTML=renderRouletteHtml();
      return;
    }
    if(!joined){
      // Formulario de entrada: nick + contraseña + avatar
      var savedNick='';
      try{savedNick=localStorage.getItem('bfMyNick')||localStorage.getItem('bfNick')||'';}catch(e){}
      body.innerHTML='<div class="bf-biz-ig"><label>'+L('Nick','Nick')+'</label><div style="display:flex;align-items:center;gap:10px"><div class="bf-av-pick bf-av-empty" id="bf-biz-avpick" title="'+L('Elige tu avatar','Choose your avatar')+'"><span class="bf-av-ph">?</span></div><input id="bf-biz-nick" name="username" type="text" maxlength="28" autocomplete="username" placeholder="'+L('Tu nick','Your nick')+'" value="'+esc(savedNick)+'" style="flex:1"></div></div>'+
        '<div class="bf-biz-ig"><label>'+L('Contraseña','Password')+'</label><input id="bf-biz-pass" name="password" type="password" maxlength="60" autocomplete="current-password" placeholder="'+L('Contraseña de tu nick','Your nick password')+'">'+
        '<label style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:12px;color:#cfc6dd;font-family:Rubik,sans-serif;font-weight:600;cursor:pointer;user-select:none"><input id="bf-biz-rem" type="checkbox" style="width:15px;height:15px;accent-color:#c06bff;cursor:pointer;margin:0;flex:0 0 15px"><span>'+L('Recordar contraseña en este equipo','Remember password on this device')+'</span></label></div>'+
        '<button class="bf-biz-btn bf-biz-join" id="bf-biz-join-btn">'+L('Entrar en la habitación','Enter the room')+'</button>';
      // Avatar picker: abre el mismo modal de avatares que VS IA (catálogo +
      // héroes, 100+ avatares). Si el nick tiene avatar en la BD, se muestra;
      // si es un nick nuevo, muestra el interrogante (pulsa para elegir).
      var pickBtn=body.querySelector('#bf-biz-avpick');
      if(pickBtn){
        pickBtn.onclick=function(e){e.preventDefault();e.stopPropagation();if(window.__bfOpenAvatarModal)window.__bfOpenAvatarModal();};
        try{
          var savedAv=window.bfMyAvatar||(JSON.parse(localStorage.getItem('bfMyAvatar')||'null'));
          if(savedAv&&savedAv.url){pickBtn.innerHTML='<img src="'+savedAv.url+'">';pickBtn.classList.remove('bf-av-empty');}
        }catch(e){}
      }
      var nickI=body.querySelector('#bf-biz-nick');
      var passI=body.querySelector('#bf-biz-pass');
      var remI=body.querySelector('#bf-biz-rem');
      // Contraseña recordada en este equipo: autorrelleno según el nick escrito.
      function bizFillSaved(){
        if(!window.__bfGetSavedNickPass)return;
        var saved=window.__bfGetSavedNickPass(nickI.value);
        if(saved&&(!passI.value||passI._bfAuto)){passI.value=saved;passI._bfAuto=1;remI.checked=true;}
        else if(!saved&&passI._bfAuto){passI.value='';passI._bfAuto=0;remI.checked=false;}
      }
      nickI.addEventListener('input',function(){bizFillSaved();bizSyncAvatar(nickI.value);});
      passI.addEventListener('input',function(){passI._bfAuto=0;});
      remI.addEventListener('change',function(){if(!remI.checked&&window.__bfForgetNickPass)window.__bfForgetNickPass(nickI.value);});
      bizFillSaved();
      bizSyncAvatar(nickI.value);
      // Ojo de mostrar/ocultar contraseña
      addEyeToggle(passI);
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
      body.innerHTML='<div class="bf-biz-count">'+L('Visitantes en la habitación','Visitors in the room')+': <b>'+visitors.length+'/20</b> · '+L('Mínimo 3 para el botón de pánico','Min 3 for panic button')+'</div>'+
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
      img.onclick=function(){selectedAvatar=img.dataset.url;window.bfMyAvatar={url:selectedAvatar,name:''};try{localStorage.setItem('bfMyAvatar',JSON.stringify(window.bfMyAvatar));localStorage.setItem('bfMyAvatarUrl',selectedAvatar);}catch(e){}renderAvatarGrid();};
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
      // Guarda nick y avatar (y la contraseña si la casilla está marcada).
      // Usa los mismos claves que el resto del juego (bfMyNick / bfMyAvatar)
      // para que la identidad se recuerde en todas las pantallas.
      try{localStorage.setItem('bfMyNick',nick);localStorage.setItem('bfNick',nick);}catch(e){}
      try{
        var remCb=overlayEl().querySelector('#bf-biz-rem');
        if(remCb&&remCb.checked&&window.__bfSaveNickPass)window.__bfSaveNickPass(nick,pass);
        else if(remCb&&!remCb.checked&&window.__bfForgetNickPass)window.__bfForgetNickPass(nick);
      }catch(e){}
      var av=(window.bfMyAvatar&&window.bfMyAvatar.url)||(window.__bfAvatarMap&&window.__bfAvatarMap[nick])||'';
      req('bizarre_join',{nick:nick,avatar:av}).then(function(res){
        if(!res||!res.ok){
          if(btn){btn.disabled=false;btn.textContent=L('Entrar en la habitación','Enter the room');}
          var joinMsg=L('No se pudo entrar.','Could not enter.');
          if(res&&res.error==='room_full')joinMsg=L('Habitación llena (20/20). Inténtalo más tarde.','Room full (20/20). Try again later.');
          try{notif(joinMsg);}catch(e){}
          return;
        }
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
        // Si hay una ruleta girando y yo no la inicié, la muestro también
        if(res.spin&&!spinState){
          spinState={
            target_nick:res.spin.target_nick,
            target_avatar:res.spin.target_avatar,
            visitors:res.spin.visitors,
            isSpinner:false,
            spinner_nick:res.spin.spinner_nick,
            spinner_avatar:res.spin.spinner_avatar
          };
          renderBody();
          setTimeout(spinRoulette,100);
        }
        // Si la ruleta terminó (ya no hay spin) y yo no la inicié, limpio
        if(!res.spin&&spinState&&!spinState.isSpinner){
          hideRoulette();
        }
        // Match real (código confirmado): el target se une a la partida
        if(res.match&&!myMatch){
          myMatch=res.match;
          if(spinState){
            setTimeout(function(){ if(myMatch) onMatched(); }, 4200);
          } else {
            onMatched();
          }
        }
        renderBody();
      }).catch(function(){});
    }
    beat();
    hbTimer=setInterval(beat,3000);
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
        else if(res&&res.error==='spin_in_progress')msg=L('Ya hay una ruleta girando. Espera a que termine.','A roulette is already spinning. Wait for it to finish.');
        try{notif(msg);}catch(e){}
        return;
      }
      // La ruleta empieza a girar: se muestra en la habitación para todos
      spinState={
        target_nick:res.spin.target_nick,
        target_avatar:res.spin.target_avatar,
        visitors:res.spin.visitors,
        isSpinner:true,
        match:res.match
      };
      renderBody();
      setTimeout(spinRoulette,100);
    }).catch(function(){if(btn){btn.disabled=false;btn.textContent=L('🚨 BOTÓN DE PÁNICO','🚨 PANIC BUTTON');}try{notif(L('Error al emparejar.','Matchmaking error.'));}catch(e){}});
  }

  function startMatchAsHost(){
    var match=(spinState&&spinState.match)||myMatch;
    if(!match)return;
    // Marca la partida como venida de la Habitación Bizarra (para el botón de
    // volver al final de la partida).
    window.__bfBizarreMatch=true;
    // Rellena el formulario de host del juego y llama a hostCreate.
    try{
      var hname=document.getElementById('hname');if(hname)hname.value=session.nick;
      var hpass=document.getElementById('hpass');if(hpass)hpass.value=match.pass;
      // El juego generará su propio código; lo leemos de NET.code y lo reportamos.
      if(typeof window.hostCreate==='function'){
        window.hostCreate(session.nick,match.pass,L('Bizarra','Bizarre'));
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
    window.__bfBizarreMatch=true;
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
    // Si hay una ruleta en curso y yo la inicié, la cancelo en el backend
    if(spinState&&spinState.isSpinner){
      req('bizarre_cancel_spin',{session_token:session.token}).catch(function(){});
    }
    req('bizarre_leave',{session_token:session.token}).catch(function(){});
    stopHeartbeat();session=null;joined=false;myMatch=null;spinState=null;
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

  // Auto-apertura: si el jugador viene del botón "Volver a la Habitación
  // Bizarra" del final de partida, abre la habitación automáticamente.
  try{
    if(sessionStorage.getItem('bfBizarreReturn')==='1'){
      sessionStorage.removeItem('bfBizarreReturn');
      setTimeout(function(){ openOverlay(); }, 1200);
    }
  }catch(e){}
})();
</script>
`;