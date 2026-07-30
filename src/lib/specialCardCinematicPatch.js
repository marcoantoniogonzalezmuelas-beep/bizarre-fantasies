// Parche inyectado en el iframe: cinemáticas especiales en 3D al jugar cartas
// legendarias. "Ave/Pluma de Fénix" → un fénix en llamas irrumpe en pantalla
// girando en 3D con brasas ascendentes; "Transformer" → un robot gigante tipo
// Optimus entra con sacudida mecánica, arcos eléctricos y destello azul.
// Se engancha a la revelación de carta (__bfShowCardReveal), así se ve en
// ambos jugadores también en partidas online.
export const SPECIAL_CARD_CINEMATIC_PATCH = `
<script>
(function(){
  if(window.__bfSpecCine)return;
  window.__bfSpecCine=true;

  var PHOENIX_PLUMA_IMG='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4581afaa7_generated_image.png';
  var PHOENIX_AVE_IMG='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/caba9677e_generated_image.png';
  var ROBOT_IMG='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/48f0023ab_generated_image.png';
  var DUCK_IMG='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c40fc88dd_generated_image.png';
  var TANK_IMG='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/76149d71f_generated_image.png';
  // Recorte del fondo: las imágenes vienen sobre negro puro; se convierte el
  // negro en transparente con un canvas para que solo quede la criatura.
  var CUT={};
  function cutout(url){
    if(CUT[url])return;
    var img=new Image();img.crossOrigin='anonymous';
    img.onload=function(){
      try{
        var c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
        var x=c.getContext('2d');x.drawImage(img,0,0);
        var d=x.getImageData(0,0,c.width,c.height),p=d.data;
        for(var i=0;i<p.length;i+=4){
          var m=Math.max(p[i],p[i+1],p[i+2]);
          if(m<32)p[i+3]=0;
          else if(m<90)p[i+3]=Math.round(p[i+3]*(m-32)/58);
        }
        x.putImageData(d,0,0);
        CUT[url]=c.toDataURL('image/png');
      }catch(e){CUT[url]=url;}
    };
    img.onerror=function(){CUT[url]=url;};
    img.src=url;
  }
  [PHOENIX_PLUMA_IMG,PHOENIX_AVE_IMG,ROBOT_IMG,DUCK_IMG,TANK_IMG].forEach(cutout);

  var css=''+
  '#bf-spec-cine{position:fixed;inset:0;z-index:100006;pointer-events:none;overflow:hidden;perspective:900px;animation:bfScIn .3s ease-out}'+
  '#bf-spec-cine.bf-sc-out{transition:opacity .4s;opacity:0}'+
  '#bf-spec-cine .bf-sc-bg{display:none}'+
  // Criatura a la derecha de la pantalla, sin fondo, para no tapar la carta
  // revelada (que aparece centrada).
  '#bf-spec-cine .bf-sc-img{position:absolute;top:50%;left:75%;transform-origin:center;width:min(56vmin,480px);height:min(56vmin,480px);object-fit:contain;transform-style:preserve-3d;margin:calc(min(56vmin,480px)/-2) 0 0 calc(min(56vmin,480px)/-2)}'+
  '@media(max-width:900px){#bf-spec-cine .bf-sc-img{left:78%;width:min(46vmin,340px);height:min(46vmin,340px);margin:calc(min(46vmin,340px)/-2) 0 0 calc(min(46vmin,340px)/-2)}}'+
  '#bf-spec-cine.bf-sc-phoenix .bf-sc-img{filter:drop-shadow(0 0 60px rgba(255,120,20,.8)) saturate(1.25);animation:bfScPhoenix 3s cubic-bezier(.2,.85,.3,1) forwards}'+
  '@keyframes bfScPhoenix{0%{transform:rotateY(-55deg) rotateX(10deg) translateY(30vh) scale(.2);opacity:0}18%{opacity:1}38%{transform:rotateY(22deg) rotateX(-4deg) translateY(-2vh) scale(1.12)}56%{transform:rotateY(-14deg) rotateX(2deg) translateY(0) scale(1)}74%{transform:rotateY(8deg) scale(1.05)}100%{transform:rotateY(0) translateY(-6vh) scale(1.12);opacity:1}}'+
  '#bf-spec-cine.bf-sc-phoenix-ave .bf-sc-img{width:min(75vmin,640px);height:min(75vmin,640px);left:50%;top:45%;margin:calc(min(75vmin,640px)/-2) 0 0 calc(min(75vmin,640px)/-2);filter:drop-shadow(0 0 70px rgba(255,140,30,.9)) saturate(1.4) brightness(1.15);animation:bfScPhoenixAve 3.4s cubic-bezier(.2,.85,.3,1) forwards}'+
  '@media(max-width:900px){#bf-spec-cine.bf-sc-phoenix-ave .bf-sc-img{left:50%;width:min(60vmin,460px);height:min(60vmin,460px);margin:calc(min(60vmin,460px)/-2) 0 0 calc(min(60vmin,460px)/-2)}}'+
  '@keyframes bfScPhoenixAve{0%{transform:rotateY(-90deg) rotateX(15deg) translateZ(-900px) scale(.15);opacity:0}12%{opacity:1}28%{transform:rotateY(35deg) rotateX(-8deg) translateZ(-250px) scale(.7) translateY(10vh)}42%{transform:rotateY(-22deg) rotateX(5deg) translateZ(0) scale(1.2) translateY(-2vh)}54%{transform:rotateY(18deg) rotateX(-3deg) scale(1.1) translateY(0)}66%{transform:rotateY(-10deg) rotateX(2deg) scale(1.15)}78%{transform:rotateY(6deg) scale(1.2)}100%{transform:rotateY(0) translateZ(0) scale(1.25) translateY(-8vh);opacity:1}}'+
  '#bf-spec-cine.bf-sc-phoenix-ave .bf-sc-ttl{color:#ffb347;text-shadow:0 0 32px rgba(255,120,20,1),0 4px 12px #000}'+
  '.bf-sc-feather{position:absolute;font-size:24px;opacity:0;animation:bfScFeather 1.8s ease-out forwards;filter:drop-shadow(0 0 10px rgba(255,140,30,.9))}'+
  '@keyframes bfScFeather{0%{opacity:0;transform:scale(.3) rotate(0)}15%{opacity:1;transform:scale(1.2) rotate(60deg)}100%{opacity:0;transform:translate(var(--fx,60px),var(--fy,-60px)) scale(.4) rotate(360deg)}}'+
  '.bf-sc-flame{position:absolute;font-size:28px;opacity:0;animation:bfScFlame 1.4s ease-out forwards;filter:drop-shadow(0 0 12px rgba(255,100,20,.9))}'+
  '@keyframes bfScFlame{0%{opacity:0;transform:translate(0,0) scale(.3) rotate(-10deg)}20%{opacity:1;transform:translate(calc(var(--fx,0px)*.4),calc(var(--fy,0px)*.4)) scale(1.3) rotate(20deg)}100%{opacity:0;transform:translate(var(--fx,0px),var(--fy,0px)) scale(.5) rotate(180deg)}}'+
  '#bf-spec-cine.bf-sc-robot .bf-sc-img{filter:drop-shadow(0 0 50px rgba(60,160,255,.85)) saturate(1.2);animation:bfScRobot 3s cubic-bezier(.2,.9,.3,1) forwards}'+
  '@keyframes bfScRobot{0%{transform:rotateY(90deg) translateZ(-500px) scale(.3);opacity:0}16%{opacity:1}34%{transform:rotateY(-18deg) translateZ(0) scale(1.1)}44%{transform:rotateY(-14deg) translateX(-8px) scale(1.08)}50%{transform:rotateY(-16deg) translateX(8px) scale(1.1)}56%{transform:rotateY(-15deg) translateX(-5px) scale(1.09)}72%{transform:rotateY(10deg) scale(1)}100%{transform:rotateY(0) scale(1.06);opacity:1}}'+
  '#bf-spec-cine.bf-sc-duck .bf-sc-img{filter:drop-shadow(0 0 55px rgba(255,220,60,.9)) saturate(1.3);animation:bfScDuck 3s cubic-bezier(.2,.9,.3,1) forwards}'+
  '@keyframes bfScDuck{0%{transform:rotateY(-80deg) translateY(40vh) scale(.25);opacity:0}14%{opacity:1}30%{transform:rotateY(14deg) translateY(-2vh) scale(1.1)}40%{transform:rotateY(10deg) translateX(-7px) scale(1.08)}46%{transform:rotateY(12deg) translateX(7px) scale(1.1)}52%{transform:rotateY(11deg) translateX(-5px) scale(1.09)}58%{transform:rotateY(12deg) translateX(5px) scale(1.1)}74%{transform:rotateY(-6deg) scale(1)}100%{transform:rotateY(0) scale(1.08);opacity:1}}'+
  '#bf-spec-cine.bf-sc-duck .bf-sc-ttl{color:#ffe14a;text-shadow:0 0 28px rgba(255,220,60,.95),0 4px 12px #000}'+
  '#bf-spec-cine.bf-sc-tank .bf-sc-img{filter:drop-shadow(0 0 50px rgba(120,180,80,.85)) saturate(1.2);animation:bfScTank 3s cubic-bezier(.2,.9,.3,1) forwards}'+
  '@keyframes bfScTank{0%{transform:translateX(-70vw) rotate(-2deg) scale(.65);opacity:0}10%{opacity:1}28%{transform:translateX(0) rotate(0) scale(1.08)}34%{transform:translateX(-7px) rotate(-1.2deg) scale(1.08)}40%{transform:translateX(5px) rotate(1deg) scale(1.09)}46%{transform:translateX(-5px) rotate(-.6deg) scale(1.08)}52%{transform:translateX(3px) scale(1.07)}68%{transform:translateX(0) scale(1.05)}84%{transform:translateX(0) scale(1.03)}100%{transform:translateX(0) scale(1.07);opacity:1}}'+
  '#bf-spec-cine.bf-sc-tank .bf-sc-ttl{color:#c7e86a;text-shadow:0 0 28px rgba(120,180,80,.95),0 4px 12px #000}'+
  '.bf-sc-smoke{position:absolute;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle,#b0b0b0,transparent 70%);opacity:0;animation:bfScSmoke 1.3s ease-out infinite}'+
  '@keyframes bfScSmoke{0%{opacity:0;transform:translate(0,0) scale(.4)}18%{opacity:.7}100%{opacity:0;transform:translate(var(--dx,40px),-30vh) scale(2.2)}}'+
  '.bf-sc-cannon{position:absolute;font-size:42px;opacity:0;animation:bfScCannon .5s ease-out infinite;filter:drop-shadow(0 0 14px rgba(255,200,60,.95))}'+
  '@keyframes bfScCannon{0%,100%{opacity:0;transform:scale(.3)}40%{opacity:1;transform:scale(1.3)}}'+
  '.bf-sc-tread{position:absolute;bottom:16%;width:12px;height:7px;border-radius:2px;background:#4a4022;opacity:0;animation:bfScTread .8s linear infinite}'+
  '@keyframes bfScTread{0%{opacity:.8;transform:translateX(0)}100%{opacity:0;transform:translateX(-50px)}}'+
  '.bf-sc-shell{position:absolute;width:7px;height:12px;border-radius:3px;background:linear-gradient(180deg,#ffe27a,#c8901f);box-shadow:0 0 8px rgba(255,200,60,.8);animation:bfScShell 1.1s ease-in infinite}'+
  '@keyframes bfScShell{0%{opacity:0;transform:translate(0,0) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx,-60px),55vh) rotate(520deg)}}'+
  '.bf-sc-boom{position:absolute;font-size:34px;opacity:0;animation:bfScBoom .8s ease-out infinite;filter:drop-shadow(0 0 10px rgba(255,180,40,.9))}'+
  '@keyframes bfScBoom{0%,100%{opacity:0;transform:scale(.4)}35%{opacity:1;transform:scale(1.15)}}'+
  '#bf-spec-cine .bf-sc-ttl{position:absolute;top:9%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(26px,6vw,58px);letter-spacing:4px;white-space:nowrap;opacity:0;animation:bfScTtl 2.9s ease-out .3s forwards}'+
  '#bf-spec-cine.bf-sc-phoenix .bf-sc-ttl{color:#ffb347;text-shadow:0 0 28px rgba(255,120,20,.95),0 4px 12px #000}'+
  '#bf-spec-cine.bf-sc-robot .bf-sc-ttl{color:#6ec6ff;text-shadow:0 0 28px rgba(60,160,255,.95),0 4px 12px #000}'+
  '@keyframes bfScTtl{0%{opacity:0;transform:translateX(-50%) scale(2)}15%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0}}'+
  '#bf-spec-cine .bf-sc-flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,255,255,.9),transparent 65%);animation:bfScFlash .7s ease-out .25s both}'+
  '@keyframes bfScFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}'+
  '@keyframes bfScIn{from{opacity:0}to{opacity:1}}'+
  '.bf-sc-ember{position:absolute;bottom:-4%;width:9px;height:9px;border-radius:50%;background:#ffc14a;box-shadow:0 0 12px #ff7a14;animation:bfScEmber 1.6s ease-out infinite}'+
  '@keyframes bfScEmber{0%{opacity:0;transform:translateY(0) scale(1)}20%{opacity:1}100%{opacity:0;transform:translateY(-78vh) translateX(var(--dx,0px)) scale(.3)}}'+
  '.bf-sc-arc{position:absolute;width:4px;background:linear-gradient(180deg,#fff,#5ab8ff);box-shadow:0 0 12px #5ab8ff;clip-path:polygon(60% 0,85% 25%,40% 50%,70% 78%,30% 100%,22% 78%,55% 50%,25% 25%);animation:bfScArc .55s ease-out infinite}'+
  '@keyframes bfScArc{0%,100%{opacity:0}45%{opacity:1}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var lastCine=0;
  function playCine(kind){
    // Anti-duplicado: si la cinemática llega dos veces (revelación de carta +
    // efecto sincronizado del rival), solo se reproduce una en ~3s.
    var now=Date.now();
    if(document.getElementById('bf-spec-cine')||now-lastCine<3200)return;
    lastCine=now;
    var ov=document.createElement('div');
    ov.id='bf-spec-cine';
    ov.className=kind==='phoenix_ave'?'bf-sc-phoenix-ave':(kind==='phoenix'?'bf-sc-phoenix':(kind==='duck'?'bf-sc-duck':(kind==='tank'?'bf-sc-tank':'bf-sc-robot')));
    var html='<div class="bf-sc-bg"></div><div class="bf-sc-flash"></div>';
    if(kind==='phoenix'||kind==='phoenix_ave'){
      var _n=kind==='phoenix_ave'?20:16;
      for(var i=0;i<_n;i++)html+='<span class="bf-sc-ember" style="left:'+(6+Math.random()*88)+'%;--dx:'+((Math.random()*120-60).toFixed(0))+'px;animation-delay:'+(Math.random()*1.4).toFixed(2)+'s;width:'+(5+Math.random()*8)+'px;height:'+(5+Math.random()*8)+'px"></span>';
      if(kind==='phoenix_ave'){
        for(var f=0;f<14;f++){var ang=(f/14)*Math.PI*2,fx=Math.cos(ang)*(100+Math.random()*80),fy=Math.sin(ang)*(100+Math.random()*80);
          html+='<span class="bf-sc-feather" style="left:50%;top:45%;--fx:'+fx.toFixed(0)+'px;--fy:'+fy.toFixed(0)+'px;animation-delay:'+(0.4+Math.random()*1).toFixed(2)+'s">🪅</span>';
        }
        for(var fl=0;fl<8;fl++){var fa=(fl/8)*Math.PI*2,flx=Math.cos(fa)*(140+Math.random()*100),fly=Math.sin(fa)*(140+Math.random()*100);
          html+='<span class="bf-sc-flame" style="left:50%;top:45%;--fx:'+flx.toFixed(0)+'px;--fy:'+fly.toFixed(0)+'px;animation-delay:'+(0.6+Math.random()*1.2).toFixed(2)+'s">🔥</span>';
        }
      }
    }else if(kind==='duck'){
      // Casquillos de bala cayendo y fogonazos alrededor del patito.
      for(var d=0;d<14;d++)html+='<span class="bf-sc-shell" style="left:'+(55+Math.random()*38)+'%;top:'+(30+Math.random()*30)+'%;--dx:'+((-40-Math.random()*120).toFixed(0))+'px;animation-delay:'+(Math.random()*1).toFixed(2)+'s"></span>';
      for(var k2=0;k2<5;k2++)html+='<span class="bf-sc-boom" style="left:'+(10+Math.random()*45)+'%;top:'+(20+Math.random()*55)+'%;animation-delay:'+(Math.random()*0.8).toFixed(2)+'s">💥</span>';
    }else if(kind==='tank'){
      // Humo del escape, fogonazos del cañón y esquirlas de oruga.
      for(var t=0;t<10;t++)html+='<span class="bf-sc-smoke" style="left:'+(58+Math.random()*30)+'%;top:'+(52+Math.random()*26)+'%;--dx:'+((Math.random()*80-20).toFixed(0))+'px;animation-delay:'+(Math.random()*1.2).toFixed(2)+'s;width:'+(16+Math.random()*18)+'px;height:'+(16+Math.random()*18)+'px"></span>';
      for(var c=0;c<5;c++)html+='<span class="bf-sc-cannon" style="left:'+(68+Math.random()*14)+'%;top:'+(38+Math.random()*22)+'%;animation-delay:'+(0.3+Math.random()*0.8).toFixed(2)+'s">💥</span>';
      for(var tr=0;tr<8;tr++)html+='<span class="bf-sc-tread" style="left:'+(56+Math.random()*22)+'%;animation-delay:'+(Math.random()*0.8).toFixed(2)+'s"></span>';
    }else{
      for(var j=0;j<8;j++)html+='<span class="bf-sc-arc" style="left:'+(12+Math.random()*76)+'%;top:'+(15+Math.random()*60)+'%;height:'+(50+Math.random()*90)+'px;animation-delay:'+(Math.random()*0.5).toFixed(2)+'s"></span>';
    }
    var src=kind==='phoenix_ave'?PHOENIX_AVE_IMG:(kind==='phoenix'?PHOENIX_PLUMA_IMG:(kind==='duck'?DUCK_IMG:(kind==='tank'?TANK_IMG:ROBOT_IMG)));
    html+='<img class="bf-sc-img" src="'+(CUT[src]||src)+'" alt="">';
    html+='<div class="bf-sc-ttl">'+(kind==='phoenix_ave'?'¡EL AVE FÉNIX RESUCITA!':(kind==='phoenix'?'¡RENACE EL FÉNIX!':(kind==='duck'?'¡KILLERDUCKS AL ATAQUE!':(kind==='tank'?'¡TANQUE EN POSICIÓN!':'¡TRANSFORMACIÓN!'))))+'</div>';
    ov.innerHTML=html;
    document.body.appendChild(ov);
    setTimeout(function(){ov.classList.add('bf-sc-out');},2700);
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},3150);
  }
  window.__bfPlaySpecCine=playCine;

  // Se engancha a la revelación de carta jugada: detecta el fénix y Transformer.
  function hook(){
    if(typeof window.__bfShowCardReveal!=='function'||window.__bfShowCardReveal.__bfSpec)return false;
    var orig=window.__bfShowCardReveal;
    window.__bfShowCardReveal=function(ev){
      try{
        var n=ev&&ev.name?String(ev.name):'';
        if(/ave.*f[eé]nix|f[eé]nix.*ave/i.test(n))playCine('phoenix_ave');
        else if(/f[eé]nix/i.test(n))playCine('phoenix');
        else if(/transformer/i.test(n))playCine('robot');
      }catch(e){}
      return orig.apply(this,arguments);
    };
    window.__bfShowCardReveal.__bfSpec=1;
    return true;
  }
  // El Transformer no siempre pasa por la revelación de carta (su castSpell es
  // especial), pero SIEMPRE emite el efecto {k:'transform'} por flushFx, que
  // además viaja a ambos jugadores online: la cinemática se engancha ahí.
  function hookFlush(){
    if(typeof window.flushFx!=='function'||window.flushFx.__bfSpecCineFx)return false;
    var orig=window.flushFx;
    window.flushFx=function(list){
      // Los fx viajan en el snapshot online: esto corre en AMBOS jugadores,
      // así que la cinemática se ve igual en tu pantalla y en la del rival.
      try{(list||[]).forEach(function(ev){
        if(!ev)return;
        if(ev.k==='transform')playCine('robot');
        else if(ev.k==='bfcard'&&ev.name){
          var n=String(ev.name);
          if(/ave.*f[eé]nix|f[eé]nix.*ave/i.test(n))playCine('phoenix_ave');
          else if(/f[eé]nix/i.test(n))playCine('phoenix');
          else if(/transformer/i.test(n))playCine('robot');
        }
      });}catch(e){}
      return orig.apply(this,arguments);
    };
    window.flushFx.__bfSpecCineFx=1;
    return true;
  }

  // Invocaciones de los Killerducks: cuando aparece un patito nuevo en el
  // tablero (G.team viaja en el snapshot online, así que ambos jugadores lo
  // ven a la vez), irrumpe el patito de goma con metralleta.
  var seenDuck={},duckScanned=false;
  function scanDucks(){
    if(typeof G==='undefined'||!G||!G.team)return;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.id)return;
        var key=side+'_'+h.id;
        if(seenDuck[key])return;
        var card=document.getElementById('b_'+side+'_'+h.id);
        if(!card)return;
        seenDuck[key]=1;
        // La primera pasada solo registra lo que ya está en el tablero.
        if(!duckScanned)return;
        var isDuck=h._bfDuck||/duck|patito/i.test(String(h.id)+' '+String(h.name||''));
        if(isDuck&&(h._token||h._bfDuck)&&h.alive)try{playCine('duck');}catch(e){}
      });
    });
    duckScanned=true;
  }
  // Detección del estado "Tanquear": la cinemática SOLO se lanza el turno en
  // que la habilidad se activa (o se reactiva tras haberla soltado), nunca en
  // cada turno que el héroe sigue tanqueando. Para ello se vigila el FLAG
  // h._bfTank en G.team (no la clase DOM, que decorate() quita y repone en
  // cada repintado y haría saltar el flanco de subida constantemente).
  // G.team viaja en el snapshot online, así que esto corre en AMBOS jugadores.
  var seenTank={},tankReady=false;
  function scanTanks(){
    if(typeof G==='undefined'||!G||!G.team)return;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.id)return;
        var key=side+'_'+h.id;
        var now=!!(h._bfTank&&h.alive);
        var was=!!seenTank[key];
        seenTank[key]=now;
        // La primera pasada solo registra lo que ya está en el tablero.
        if(!tankReady)return;
        if(now&&!was)try{playCine('tank');}catch(e){}
      });
    });
    tankReady=true;
  }
  new MutationObserver(function(){scanDucks();scanTanks();}).observe(document.documentElement,{childList:true,subtree:true});

  var tries=0,iv=setInterval(function(){var a=hook(),b=hookFlush();if((a||window.__bfShowCardReveal&&window.__bfShowCardReveal.__bfSpec)&&(b||window.flushFx&&window.flushFx.__bfSpecCineFx)||tries++>120)clearInterval(iv);},200);
})();
</script>
`;