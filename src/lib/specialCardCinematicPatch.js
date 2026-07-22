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

  var PHOENIX_IMG='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fbf0ca083_generated_image.png';
  var ROBOT_IMG='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b4b50e620_generated_image.png';
  [PHOENIX_IMG,ROBOT_IMG].forEach(function(u){var i=new Image();i.src=u;});

  var css=''+
  '#bf-spec-cine{position:fixed;inset:0;z-index:100006;pointer-events:none;overflow:hidden;display:flex;align-items:center;justify-content:center;perspective:900px;animation:bfScIn .3s ease-out}'+
  '#bf-spec-cine.bf-sc-out{transition:opacity .4s;opacity:0}'+
  '#bf-spec-cine .bf-sc-bg{position:absolute;inset:0}'+
  '#bf-spec-cine.bf-sc-phoenix .bf-sc-bg{background:radial-gradient(circle at 50% 55%,rgba(120,30,0,.55),rgba(6,2,10,.9))}'+
  '#bf-spec-cine.bf-sc-robot .bf-sc-bg{background:radial-gradient(circle at 50% 55%,rgba(10,40,90,.55),rgba(4,4,12,.9))}'+
  '#bf-spec-cine .bf-sc-img{position:relative;width:min(78vmin,640px);height:min(78vmin,640px);object-fit:contain;mix-blend-mode:screen;transform-style:preserve-3d}'+
  '#bf-spec-cine.bf-sc-phoenix .bf-sc-img{filter:drop-shadow(0 0 60px rgba(255,120,20,.8)) saturate(1.25);animation:bfScPhoenix 3s cubic-bezier(.2,.85,.3,1) forwards}'+
  '@keyframes bfScPhoenix{0%{transform:rotateY(-55deg) rotateX(10deg) translateY(30vh) scale(.2);opacity:0}18%{opacity:1}38%{transform:rotateY(22deg) rotateX(-4deg) translateY(-2vh) scale(1.12)}56%{transform:rotateY(-14deg) rotateX(2deg) translateY(0) scale(1)}74%{transform:rotateY(8deg) scale(1.05)}100%{transform:rotateY(0) translateY(-6vh) scale(1.12);opacity:1}}'+
  '#bf-spec-cine.bf-sc-robot .bf-sc-img{filter:drop-shadow(0 0 50px rgba(60,160,255,.85)) saturate(1.2);animation:bfScRobot 3s cubic-bezier(.2,.9,.3,1) forwards}'+
  '@keyframes bfScRobot{0%{transform:rotateY(90deg) translateZ(-500px) scale(.3);opacity:0}16%{opacity:1}34%{transform:rotateY(-18deg) translateZ(0) scale(1.1)}44%{transform:rotateY(-14deg) translateX(-8px) scale(1.08)}50%{transform:rotateY(-16deg) translateX(8px) scale(1.1)}56%{transform:rotateY(-15deg) translateX(-5px) scale(1.09)}72%{transform:rotateY(10deg) scale(1)}100%{transform:rotateY(0) scale(1.06);opacity:1}}'+
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

  function playCine(kind){
    if(document.getElementById('bf-spec-cine'))return;
    var ov=document.createElement('div');
    ov.id='bf-spec-cine';
    ov.className=kind==='phoenix'?'bf-sc-phoenix':'bf-sc-robot';
    var html='<div class="bf-sc-bg"></div><div class="bf-sc-flash"></div>';
    if(kind==='phoenix'){
      for(var i=0;i<16;i++)html+='<span class="bf-sc-ember" style="left:'+(6+Math.random()*88)+'%;--dx:'+((Math.random()*120-60).toFixed(0))+'px;animation-delay:'+(Math.random()*1.4).toFixed(2)+'s;width:'+(5+Math.random()*8)+'px;height:'+(5+Math.random()*8)+'px"></span>';
    }else{
      for(var j=0;j<8;j++)html+='<span class="bf-sc-arc" style="left:'+(12+Math.random()*76)+'%;top:'+(15+Math.random()*60)+'%;height:'+(50+Math.random()*90)+'px;animation-delay:'+(Math.random()*0.5).toFixed(2)+'s"></span>';
    }
    html+='<img class="bf-sc-img" src="'+(kind==='phoenix'?PHOENIX_IMG:ROBOT_IMG)+'" alt="">';
    html+='<div class="bf-sc-ttl">'+(kind==='phoenix'?'¡RENACE EL FÉNIX!':'¡TRANSFORMACIÓN!')+'</div>';
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
        if(/f[eé]nix/i.test(n))playCine('phoenix');
        else if(/transformer/i.test(n))playCine('robot');
      }catch(e){}
      return orig.apply(this,arguments);
    };
    window.__bfShowCardReveal.__bfSpec=1;
    return true;
  }
  var tries=0,iv=setInterval(function(){if(hook()||tries++>120)clearInterval(iv);},200);
})();
</script>
`;