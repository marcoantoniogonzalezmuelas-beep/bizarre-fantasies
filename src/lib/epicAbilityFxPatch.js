// Parche inyectado en el iframe: cinemáticas a pantalla completa para las
// habilidades de los héroes épicos y de Solenna. Mismo estilo que las del
// Fénix/Transformer (specialCardCinematicPatch): overlay a pantalla completa,
// imagen grande del héroe con entrada 3D, partículas temáticas y título.
// Funciona en AMBOS jugadores online: G.team viaja en el snapshot, así que
// el escaneo de abilityUsed corre en host y cliente.
export const EPIC_ABILITY_FX_PATCH = `
<script>
(function(){
  if(window.__bfEpicCine) return;
  window.__bfEpicCine = true;

  var css = ''+
  '#bf-epic-cine{position:fixed;inset:0;z-index:100006;pointer-events:none;overflow:hidden;perspective:900px;animation:bfEcIn .3s ease-out}'+
  '#bf-epic-cine.bf-ec-out{transition:opacity .4s;opacity:0}'+
  '@keyframes bfEcIn{from{opacity:0}to{opacity:1}}'+
  // Imagen del héroe — grande, a la derecha, con entrada 3D
  '#bf-epic-cine .bf-ec-glow-bg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:80%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,var(--ec-flash) 0%,transparent 60%);opacity:0;animation:bfEcGlowBg 2.4s ease-out forwards;pointer-events:none}'+
  '@keyframes bfEcGlowBg{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}20%{opacity:.5}100%{opacity:0;transform:translate(-50%,-50%) scale(1.8)}}'+
  '#bf-epic-cine .bf-ec-img{position:absolute;top:50%;left:50%;transform-origin:center;width:min(68vmin,560px);height:min(72vmin,600px);object-fit:cover;border-radius:14px;transform-style:preserve-3d;margin:calc(min(72vmin,600px)/-2) 0 0 calc(min(68vmin,560px)/-2);filter:saturate(1.4) brightness(1.15) drop-shadow(0 14px 38px rgba(0,0,0,.7));animation:bfEcImg 3.2s cubic-bezier(.2,.85,.3,1) forwards;border:2px solid var(--ec-color);box-shadow:0 10px 34px rgba(0,0,0,.8)}'+
  '@media(max-width:900px){#bf-epic-cine .bf-ec-img{width:min(54vmin,400px);height:min(58vmin,440px);margin:calc(min(58vmin,440px)/-2) 0 0 calc(min(54vmin,400px)/-2)}}'+
  '@keyframes bfEcImg{0%{transform:rotateY(-90deg) rotateX(15deg) translateZ(-900px) scale(.15);opacity:0}12%{opacity:1}28%{transform:rotateY(35deg) rotateX(-8deg) translateZ(-250px) scale(.7) translateY(10vh)}42%{transform:rotateY(-22deg) rotateX(5deg) translateZ(0) scale(1.2) translateY(-2vh)}54%{transform:rotateY(18deg) rotateX(-3deg) scale(1.1) translateY(0)}66%{transform:rotateY(-10deg) rotateX(2deg) scale(1.15)}78%{transform:rotateY(6deg) scale(1.2)}100%{transform:rotateY(0) translateZ(0) scale(1.25) translateY(-8vh);opacity:1}}'+
  // Título
  '#bf-epic-cine .bf-ec-ttl{position:absolute;top:8%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(24px,5.5vw,52px);letter-spacing:4px;white-space:nowrap;opacity:0;animation:bfEcTtl 2.9s ease-out .3s forwards;color:var(--ec-color);text-shadow:0 0 28px var(--ec-glow),0 4px 12px #000}'+
  '@keyframes bfEcTtl{0%{opacity:0;transform:translateX(-50%) scale(2)}15%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0;transform:translateX(-50%) scale(1.1)}}'+
  // Flash
  '#bf-epic-cine .bf-ec-flash{position:absolute;inset:0;background:radial-gradient(circle,var(--ec-flash),transparent 65%);animation:bfEcFlash .7s ease-out .25s both}'+
  '@keyframes bfEcFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}'+
  // Velo de fondo (scrim)
  '#bf-epic-cine .bf-ec-veil{position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(0,0,0,.4),transparent);animation:bfEcVeil 2s ease-out forwards}'+
  '@keyframes bfEcVeil{0%{opacity:0}30%{opacity:.6}100%{opacity:0}}'+
  // Partículas: fuego
  '.bf-ec-ember{position:absolute;bottom:-4%;width:9px;height:9px;border-radius:50%;background:var(--ec-color);box-shadow:0 0 12px var(--ec-glow);animation:bfEcEmber 1.6s ease-out infinite}'+
  '@keyframes bfEcEmber{0%{opacity:0;transform:translateY(0) scale(1)}20%{opacity:1}100%{opacity:0;transform:translateY(-78vh) translateX(var(--dx,0px)) scale(.3)}}'+
  // Partículas: notas musicales
  '.bf-ec-note{position:absolute;font-size:22px;opacity:0;animation:bfEcNote 1.8s ease-in forwards;filter:drop-shadow(0 0 8px var(--ec-glow))}'+
  '@keyframes bfEcNote{0%{opacity:0;transform:translateY(-20px) scale(.4) rotate(-15deg)}20%{opacity:1;transform:translateY(0) scale(1.1) rotate(10deg)}100%{opacity:0;transform:translateY(70vh) scale(.7) rotate(360deg)}}'+
  // Partículas: ADN
  '.bf-ec-dna{position:absolute;font-size:20px;opacity:0;animation:bfEcDna 2s ease-out forwards;filter:drop-shadow(0 0 8px var(--ec-glow))}'+
  '@keyframes bfEcDna{0%{opacity:0;transform:scale(.3) rotate(0)}20%{opacity:1}100%{opacity:0;transform:scale(1.5) rotate(360deg)}}'+
  // Partículas: estrellas
  '.bf-ec-star{position:absolute;font-size:22px;opacity:0;animation:bfEcStar 1.8s ease-out forwards;filter:drop-shadow(0 0 10px var(--ec-glow))}'+
  '@keyframes bfEcStar{0%{opacity:0;transform:scale(0) rotate(0)}30%{opacity:1;transform:scale(1.3) rotate(180deg)}100%{opacity:0;transform:scale(1.6) rotate(360deg)}}'+
  // Anillos concéntricos
  '.bf-ec-ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;border:3px solid var(--ec-color);box-shadow:0 0 20px var(--ec-glow);opacity:0;animation:bfEcRing 1.5s ease-out forwards}'+
  '@keyframes bfEcRing{0%{width:10%;height:10%;opacity:1;border-width:4px}100%{width:250%;height:250%;opacity:0;border-width:1px}}'+
  // Anillo orbital dorado
  '.bf-ec-orbit{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:60%;aspect-ratio:1;border-radius:50%;border:2px solid var(--ec-color);box-shadow:0 0 24px var(--ec-glow);opacity:0;animation:bfEcOrbit 2s ease-out forwards}'+
  '@keyframes bfEcOrbit{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(0)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.8) rotate(360deg)}}'+
  // Proyectiles
  '.bf-ec-proj{position:absolute;font-size:22px;opacity:0;animation:bfEcProj 1.4s ease-out forwards;text-shadow:0 0 10px var(--ec-glow)}'+
  '@keyframes bfEcProj{0%{opacity:0;transform:scale(.3) translate(0,0)}25%{opacity:1;transform:scale(1.2) translate(var(--tx,40px),var(--ty,-30px))}100%{opacity:0;transform:scale(.6) translate(calc(var(--tx,40px)*2.5),calc(var(--ty,-30px)*2.5))}}'+
  // Rayos de luz
  '.bf-ec-ray{position:absolute;left:50%;top:50%;width:4px;height:80px;background:linear-gradient(180deg,transparent,var(--ec-color),transparent);transform-origin:bottom center;opacity:0;animation:bfEcRay 1.5s ease-out forwards}'+
  '@keyframes bfEcRay{0%{opacity:0;transform:translate(-50%,-100%) rotate(var(--rot,0deg)) scaleY(0)}30%{opacity:1;transform:translate(-50%,-100%) rotate(var(--rot,0deg)) scaleY(1.2)}100%{opacity:0;transform:translate(-50%,-100%) rotate(var(--rot,0deg)) scaleY(1.5)}}'+
  // Halo dorado
  '.bf-ec-halo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:120%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,var(--ec-flash) 0%,transparent 70%);opacity:0;animation:bfEcHalo 2s ease-out forwards}'+
  '@keyframes bfEcHalo{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.6)}}'+
  // Chispas celestiales blancas
  '.bf-ec-spark{position:absolute;bottom:10%;width:4px;height:4px;border-radius:50%;background:#fff;box-shadow:0 0 8px #fff,0 0 14px var(--ec-glow);opacity:0;animation:bfEcSpark 2s ease-out forwards}'+
  '@keyframes bfEcSpark{0%{opacity:0;transform:translateY(0) scale(.3)}15%{opacity:1}100%{opacity:0;transform:translateY(-90vh) scale(1.4) translateX(var(--dx,0px))}}'+
  // Haz de luz vertical
  '.bf-ec-beam{position:absolute;left:50%;top:-30%;width:60%;height:140%;transform:translateX(-50%);background:linear-gradient(180deg,transparent 0%,var(--ec-flash) 45%,var(--ec-flash) 55%,transparent 100%);filter:blur(6px);opacity:0;animation:bfEcBeam 2.6s ease-out forwards}'+
  '@keyframes bfEcBeam{0%{opacity:0;transform:translateX(-50%) scaleY(0)}20%{opacity:1;transform:translateX(-50%) scaleY(1)}75%{opacity:.85}100%{opacity:0;transform:translateX(-50%) scaleY(1.1)}}'+
  // Futbolín (mesa de foosball) — mueble rojo con varillas, muñecos y palancas
  '.bf-ec-foo{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);width:min(68vmin,480px);height:min(38vmin,280px);opacity:0;animation:bfEcFoo 2.8s cubic-bezier(.2,.85,.3,1) forwards}'+
  '@keyframes bfEcFoo{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotateX(30deg) rotateY(-15deg)}20%{opacity:1}45%{transform:translate(-50%,-50%) scale(1.12) rotateX(-8deg) rotateY(10deg)}65%{transform:translate(-50%,-50%) scale(1) rotateX(3deg) rotateY(-3deg)}100%{opacity:1;transform:translate(-50%,-50%) scale(1.05) rotateX(0) rotateY(0)}}'+
  '.bf-ec-foo-cabinet{width:100%;height:100%;background:linear-gradient(180deg,#b82828 0%,#a02020 45%,#7a1818 100%);border-radius:10px;border:3px solid #5a1010;box-shadow:0 14px 44px rgba(0,0,0,.85),0 0 50px var(--ec-glow),inset 0 3px 0 rgba(255,255,255,.18);position:relative;overflow:hidden}'+
  '.bf-ec-foo-field{position:absolute;top:10%;left:6%;right:6%;bottom:20%;background:linear-gradient(180deg,#1a1208,#0a0804);border-radius:5px;border:2px solid #3a1a0a;overflow:hidden}'+
  '.bf-ec-foo-rod{position:absolute;left:10%;right:10%;height:4px;background:linear-gradient(180deg,#e8e8e8,#999,#e8e8e8);border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,.7),0 0 6px rgba(200,200,200,.25)}'+
  '.bf-ec-foo-fig{position:absolute;width:14px;height:14px;border-radius:50%;background:linear-gradient(180deg,#f0e0c0,#c0a080);border:1.5px solid #5a3a1a;box-shadow:0 1px 4px rgba(0,0,0,.6)}'+
  '.bf-ec-foo-handle{position:absolute;width:11px;height:11px;border-radius:50%;background:linear-gradient(180deg,#d4a574,#8b6940);border:1.5px solid #5a3a1a;box-shadow:0 1px 3px rgba(0,0,0,.5)}'+
  '.bf-ec-foo-coin{position:absolute;right:3%;top:12%;width:14px;height:22px;background:linear-gradient(180deg,#666,#2a2a2a);border-radius:2px;border:1px solid #000;box-shadow:inset 0 0 4px rgba(0,0,0,.9),0 1px 2px rgba(0,0,0,.5)}'+
  '.bf-ec-foo-coin::before{content:"";position:absolute;left:50%;top:2px;transform:translateX(-50%);width:7px;height:18px;background:#0a0a0a;border-radius:1px}'+
  '.bf-ec-foo-drawer{position:absolute;bottom:4%;left:8%;right:8%;height:11%;background:linear-gradient(180deg,#8b1818,#5a1010);border-radius:3px;border:1px solid #3a0808;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 1px 2px rgba(0,0,0,.4)}'+
  '.bf-ec-foo-ball{position:absolute;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#ccc 55%,#777);border:1px solid #333;box-shadow:0 1px 5px rgba(0,0,0,.7);opacity:0;animation:bfEcFooBall 1.4s ease-in-out infinite}'+
  '@keyframes bfEcFooBall{0%{opacity:0;transform:translateY(0) scale(.4)}15%{opacity:1;transform:translateY(-18px) scale(1.1)}50%{transform:translateY(2px) scale(1)}85%{opacity:.8}100%{opacity:0;transform:translateY(-18px) scale(.5)}}'+
  '.bf-ec-foo-label{position:absolute;left:50%;bottom:5%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:900;font-size:13px;letter-spacing:2px;color:#ffd24a;text-shadow:0 0 8px rgba(255,210,74,.8),0 1px 2px #000;opacity:0;animation:bfEcFooLabel 2.8s ease-out .4s forwards}'+
  '@keyframes bfEcFooLabel{0%{opacity:0;transform:translateX(-50%) translateY(8px)}20%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-4px)}}'+
  // Chess knight (horse)
  '.bf-ec-knight{position:absolute;left:50%;top:50%;font-size:140px;opacity:0;animation:bfEcKnight 2.8s cubic-bezier(.2,.85,.3,1) forwards;filter:drop-shadow(0 0 40px var(--ec-glow));transform:translate(-50%,-50%)}'+
  '@keyframes bfEcKnight{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(-30deg) translateY(40vh)}20%{opacity:1}40%{transform:translate(-50%,-50%) scale(1.3) rotate(10deg)}60%{transform:translate(-50%,-50%) scale(1) rotate(-5deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.1) rotate(0) translateY(-10vh)}}'+
  // Glue drips
  '.bf-ec-glue{position:absolute;font-size:18px;opacity:0;animation:bfEcGlue 1.6s ease-out forwards;filter:drop-shadow(0 0 8px var(--ec-glow))}'+
  '@keyframes bfEcGlue{0%{opacity:0;transform:translateY(0) scale(.3)}20%{opacity:1;transform:translateY(-20px) scale(1)}100%{opacity:0;transform:translateY(-60vh) scale(.7) rotate(180deg)}}'+
  // Chains
  '.bf-ec-chain{position:absolute;font-size:22px;opacity:0;animation:bfEcChain 1.8s ease-out forwards;filter:drop-shadow(0 0 8px var(--ec-glow))}'+
  '@keyframes bfEcChain{0%{opacity:0;transform:scale(.3) rotate(0)}25%{opacity:1;transform:scale(1.2) rotate(45deg)}100%{opacity:0;transform:scale(1.5) rotate(360deg)}}'+
  // Chess board squares
  '.bf-ec-square{position:absolute;font-size:24px;opacity:0;animation:bfEcSquare 2s ease-out forwards}'+
  '@keyframes bfEcSquare{0%{opacity:0;transform:scale(.3) rotate(0)}30%{opacity:.7;transform:scale(1.1) rotate(45deg)}100%{opacity:0;transform:scale(1.3) rotate(180deg)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // Mapa de arte de batalla recibido del padre (postMessage bfBattleArt).
  var battleArtMap={};
  window.addEventListener('message',function(e){
    if(e.data&&e.data.bfBattleArt&&typeof e.data.bfBattleCart==='object')battleArtMap=e.data.bfBattleArt;
    if(e.data&&e.data.bfBattleArt&&typeof e.data.bfBattleArt==='object')battleArtMap=e.data.bfBattleArt;
  });

  // Obtiene la imagen del héroe desde el DOM o el mapa de batalla.
  function getHeroArt(side,hero){
    var card=document.getElementById('b_'+side+'_'+(hero&&hero.id));
    if(card){
      var bg=card.querySelector('.bf-bhero-bgart');
      if(bg){
        var s=getComputedStyle(bg).backgroundImage;
        if(s&&s!=='none'){var m=s.match(/url\\(["']?(.+?)["']?\\)/);if(m)return m[1];}
      }
      var img=card.querySelector('img');
      if(img&&img.src&&img.src.indexOf('data:')!==0)return img.src;
    }
    var cid=hero&&(hero.cid||hero.card_id||hero.id);
    if(cid&&battleArtMap[cid]){
      return hero.eliteMode?battleArtMap[cid].elite:battleArtMap[cid].base;
    }
    return null;
  }

  var THEMES={
    'kre':{
      normal:{color:'#ff6a44',glow:'rgba(255,80,40,.85)',flash:'rgba(255,100,40,.7)',particles:'fire'},
      elite:{color:'#ff3333',glow:'rgba(255,30,30,.9)',flash:'rgba(255,50,50,.8)',particles:'fire'}
    },
    'hev':{
      normal:{color:'#ffaa44',glow:'rgba(255,160,60,.85)',flash:'rgba(255,180,80,.7)',particles:'musical'},
      elite:{color:'#ff4444',glow:'rgba(255,60,60,.9)',flash:'rgba(255,80,80,.8)',particles:'fire'}
    },
    'syx':{
      normal:{color:'#44ddff',glow:'rgba(60,180,255,.85)',flash:'rgba(80,200,255,.7)',particles:'dna'},
      elite:{color:'#ffd24a',glow:'rgba(255,210,74,.9)',flash:'rgba(255,220,100,.8)',particles:'stars'}
    },
    'gor':{
      normal:{color:'#ffcc44',glow:'rgba(255,200,60,.85)',flash:'rgba(255,220,80,.7)',particles:'rings'},
      elite:{color:'#ffaa00',glow:'rgba(255,170,0,.9)',flash:'rgba(255,180,20,.8)',particles:'orbits'}
    },
    'zer':{
      normal:{color:'#ffe88a',glow:'rgba(255,215,100,.85)',flash:'rgba(255,230,150,.7)',particles:'rays'},
      elite:{color:'#ffd700',glow:'rgba(255,215,0,.9)',flash:'rgba(255,230,50,.8)',particles:'halo'}
    },
    'sol':{
      normal:{color:'#ffffff',glow:'rgba(255,255,255,.9)',flash:'rgba(255,255,255,.7)',particles:'celestial'},
      elite:{color:'#fff5dc',glow:'rgba(255,250,220,.95)',flash:'rgba(255,255,240,.85)',particles:'celestial'}
    },
    'nar':{
      normal:{color:'#4ade80',glow:'rgba(74,222,128,.85)',flash:'rgba(120,255,160,.7)',particles:'football'},
      elite:{color:'#d4a574',glow:'rgba(212,165,116,.9)',flash:'rgba(255,200,140,.8)',particles:'chess_glue'}
    }
  };

  // Matching por ID (card_id de la BD) — los nombres pueden cambiar en el
  // Oráculo y el matching por nombre se rompería. Los IDs son estables.
  var HERO_IDS={'kre':1,'hev':1,'syx':1,'gor':1,'zer':1,'sol':1,'nar':1};

  function buildParticles(kind,theme){
    var html='';
    if(kind==='fire'){
      for(var i=0;i<18;i++)html+='<span class="bf-ec-ember" style="left:'+(4+Math.random()*92)+'%;--dx:'+((Math.random()*120-60).toFixed(0))+'px;animation-delay:'+(Math.random()*1.4).toFixed(2)+'s;width:'+(5+Math.random()*8)+'px;height:'+(5+Math.random()*8)+'px"></span>';
    }else if(kind==='musical'){
      var notes=['🎵','🎶','♪','♫'];
      for(var i=0;i<12;i++)html+='<span class="bf-ec-note" style="left:'+(8+Math.random()*84)+'%;top:-5%;animation-delay:'+(Math.random()*1.2).toFixed(2)+'s">'+notes[i%4]+'</span>';
    }else if(kind==='dna'){
      for(var i=0;i<14;i++)html+='<span class="bf-ec-dna" style="left:'+(6+Math.random()*88)+'%;top:'+(10+Math.random()*75)+'%;animation-delay:'+(Math.random()*1).toFixed(2)+'s">🧬</span>';
    }else if(kind==='stars'){
      for(var i=0;i<14;i++)html+='<span class="bf-ec-star" style="left:'+(6+Math.random()*88)+'%;top:'+(10+Math.random()*75)+'%;animation-delay:'+(Math.random()*1).toFixed(2)+'s">⭐</span>';
    }else if(kind==='rings'){
      for(var i=0;i<4;i++)html+='<div class="bf-ec-ring" style="animation-delay:'+(i*0.25).toFixed(2)+'s"></div>';
    }else if(kind==='orbits'){
      html+='<div class="bf-ec-orbit"></div>';
      for(var i=0;i<8;i++){
        var ang=(i/8)*360,tx=Math.cos(ang*Math.PI/180)*50,ty=Math.sin(ang*Math.PI/180)*50;
        html+='<span class="bf-ec-proj" style="left:50%;top:50%;--tx:'+tx.toFixed(0)+'px;--ty:'+ty.toFixed(0)+'px;animation-delay:'+(i*0.1).toFixed(2)+'s">➤</span>';
      }
    }else if(kind==='rays'){
      for(var i=0;i<8;i++){var rot=(i/8)*360;html+='<div class="bf-ec-ray" style="--rot:'+rot.toFixed(0)+'deg;animation-delay:'+(i*0.08).toFixed(2)+'s"></div>';}
      for(var i=0;i<6;i++)html+='<span class="bf-ec-star" style="left:'+(8+Math.random()*84)+'%;top:'+(10+Math.random()*70)+'%;animation-delay:'+(Math.random()*0.8).toFixed(2)+'s">✦</span>';
    }else if(kind==='halo'){
      html+='<div class="bf-ec-halo"></div>';
      for(var i=0;i<10;i++){var rot=(i/10)*360;html+='<div class="bf-ec-ray" style="--rot:'+rot.toFixed(0)+'deg;animation-delay:'+(i*0.06).toFixed(2)+'s"></div>';}
      for(var i=0;i<6;i++)html+='<span class="bf-ec-star" style="left:'+(8+Math.random()*84)+'%;top:'+(10+Math.random()*70)+'%;animation-delay:'+(Math.random()*0.8).toFixed(2)+'s">✨</span>';
    }else if(kind==='celestial'){
      html+='<div class="bf-ec-beam"></div>';
      html+='<div class="bf-ec-halo"></div>';
      for(var i=0;i<16;i++)html+='<span class="bf-ec-spark" style="left:'+(4+Math.random()*92)+'%;--dx:'+((Math.random()*100-50).toFixed(0))+'px;animation-delay:'+(Math.random()*1.2).toFixed(2)+'s"></span>';
    }else if(kind==='football'){
      html+='<div class="bf-ec-foo"><div class="bf-ec-foo-cabinet"><div class="bf-ec-foo-coin"></div><div class="bf-ec-foo-field">';
      for(var ri=0;ri<4;ri++){
        var ry=18+ri*20;
        html+='<div class="bf-ec-foo-rod" style="top:'+ry+'%"></div>';
        html+='<span class="bf-ec-foo-handle" style="left:2%;top:'+(ry-1)+'%"></span>';
        html+='<span class="bf-ec-foo-handle" style="right:2%;top:'+(ry-1)+'%"></span>';
        for(var fi=0;fi<3;fi++)html+='<span class="bf-ec-foo-fig" style="left:'+(18+fi*30)+'%;top:'+(ry-2)+'%"></span>';
      }
      html+='</div><div class="bf-ec-foo-drawer"></div><div class="bf-ec-foo-label">SOLTAITO</div></div></div>';
      html+='<span class="bf-ec-foo-ball" style="left:35%;top:25%;animation-duration:1.2s"></span>';
      html+='<span class="bf-ec-foo-ball" style="left:55%;top:30%;animation-delay:.4s;animation-duration:1.5s"></span>';
    }else if(kind==='chess_glue'){
      html+='<div class="bf-ec-knight">♞</div>';
      for(var i=0;i<12;i++)html+='<span class="bf-ec-glue" style="left:'+(8+Math.random()*84)+'%;bottom:-5%;animation-delay:'+(Math.random()*1.5).toFixed(2)+'s">🩪</span>';
      for(var i=0;i<8;i++)html+='<span class="bf-ec-chain" style="left:'+(10+Math.random()*80)+'%;top:'+(15+Math.random()*70)+'%;animation-delay:'+(Math.random()*1).toFixed(2)+'s">⛓</span>';
      for(var i=0;i<6;i++)html+='<span class="bf-ec-square" style="left:'+(15+Math.random()*70)+'%;top:'+(20+Math.random()*60)+'%;animation-delay:'+(Math.random()*0.8).toFixed(2)+'s">⬛</span>';
    }
    return html;
  }

  var lastCine=0;
  function playCine(side,hero){
    if(!hero||!HERO_IDS[hero.id])return;
    var themeSet=THEMES[hero.id];
    if(!themeSet)return;
    var isElite=!!hero.eliteMode;
    var theme=isElite?themeSet.elite:themeSet.normal;
    var ability=isElite?(hero.eAbility||hero.ability||hero.name):(hero.ability||hero.name);
    var artUrl=getHeroArt(side,hero);

    // Anti-duplicado: si ya hay un overlay o se reprodujo hace poco, no hacerlo.
    var now=Date.now();
    if(document.getElementById('bf-epic-cine')||now-lastCine<3200)return;
    lastCine=now;

    var ov=document.createElement('div');
    ov.id='bf-epic-cine';
    ov.style.setProperty('--ec-color',theme.color);
    ov.style.setProperty('--ec-glow',theme.glow);
    ov.style.setProperty('--ec-flash',theme.flash);

    var html='<div class="bf-ec-veil"></div><div class="bf-ec-flash"></div>';
    html+=buildParticles(theme.particles,theme);
    if(artUrl){
      html+='<img class="bf-ec-img" src="'+artUrl+'" alt="">';
    }
    html+='<div class="bf-ec-ttl">'+String(ability).toUpperCase()+'</div>';
    ov.innerHTML=html;
    (window.__bfAppend||function(n){document.body.appendChild(n);})(ov);

    setTimeout(function(){ov.classList.add('bf-ec-out');},2700);
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},3200);

    // Remate anime del sistema.
    var A=window.__bfAnime;
    if(A){
      var r=ov.getBoundingClientRect(),c={x:r.left+r.width/2,y:r.top+r.height/2};
      A.speedLines(c);
    }
  }

  // Expone playCine para que otros parches (narbonElitePatch) puedan
  // disparar la cinemática directamente sin esperar al escaneo.
  window.__bfPlayEpicCine = playCine;

  // Deduplicación entre el hook de useAbility y el escaneo.
  var lastFx={};
  function tryPlay(side,hero){
    if(!hero||!HERO_IDS[hero.id])return;
    if(window.__bfAbilityAnimMap){var _aak=hero.id||hero.cid||hero.card_id;if(_aak&&window.__bfAbilityAnimMap[_aak])return;}
    var key=side+'_'+hero.id;
    var now=Date.now();
    if(lastFx[key]&&now-lastFx[key]<1200)return;
    lastFx[key]=now;
    try{playCine(side,hero);}catch(e){}
  }

  // Hook directo: feedback inmediato en el host.
  function install(){
    if(typeof window.useAbility!=='function'||window.__bfEpicCineHooked)return false;
    window.__bfEpicCineHooked=true;
    var orig=window.useAbility;
    window.useAbility=function(side,hero){
      try{tryPlay(side,hero);}catch(e){}
      return orig.apply(this,arguments);
    };
    return true;
  }

  // Escaneo periódico: detecta cuando abilityUsed pasa de false a true.
  // Funciona en AMBOS jugadores (host y cliente).
  var prevUsed={};
  function scanAbilities(){
    if(typeof G==='undefined'||!G||!G.team)return;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.id)return;
        var key=side+'_'+h.id;
        var used=!!h.abilityUsed;
        if(used&&!prevUsed[key]){
          tryPlay(side,h);
        }
        prevUsed[key]=used;
      });
    });
  }

  var tries=0,t=setInterval(function(){
    scanAbilities();
    if(!window.__bfEpicCineHooked){
      if(install()||tries++>100)clearInterval(t);
    }
  },150);
})();
</script>
`;