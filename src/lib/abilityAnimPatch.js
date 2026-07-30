// Parche inyectado en el iframe: cinemáticas 3D para CUALQUIER habilidad de
// héroe que tenga un arte de animación asignado (ability_anim_url /
// elite_ability_anim_url en la BD). Reproduce un overlay a pantalla completa
// con la imagen del héroe entrando en 3D (rotación + translateZ), flash,
// halo, anillos y partículas del color de clan — mismo estilo que el
// Transformer/Tanque/Fénix de specialCardCinematicPatch.
//
// Toma precedencia sobre epicAbilityFxPatch: si un héroe tiene animación 3D
// propia, este parche la reproduce y epicAbilityFxPatch se salta la suya
// (comprueba window.__bfAbilityAnimMap). Así Solenna, Narbón y cualquier
// héroe pueden tener su cinemática 3D dedicada gestionada desde el editor.
//
// Funciona en AMBOS jugadores online: G.team viaja en el snapshot, así que
// el escaneo de abilityUsed corre en host y cliente.
import { ALL_MOTION_CSS, MOTIONS_MIN_JSON } from '@/lib/abilityAnimMotions';

export const ABILITY_ANIM_PATCH = `
<script>
(function(){
  if(window.__bfAbilityAnimPatch)return;
  window.__bfAbilityAnimPatch=true;

  // Mapa card_id -> {base, elite} recibido del padre por postMessage.
  var animMap={};
  window.__bfAbilityAnimMap=animMap;
  // Recorta el fondo oscuro/negro de las imágenes de animación (lo vuelve
  // transparente con un canvas) para que solo quede la criatura, igual que las
  // cinemáticas del Tanque/Transformer/Patitos. Se cachea por URL.
  var CUT={};
  function cutout(url){
    if(!url)return;
    if(CUT[url])return CUT[url];
    if(CUT[url]===false)return; // ya intentado (fallo/CORS): se usa la URL original
    CUT[url]=false; // pendiente: mientras llega, se usa la URL original
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
      }catch(e){CUT[url]=false;}
    };
    img.onerror=function(){CUT[url]=false;};
    img.src=url;
  }
  window.addEventListener('message',function(e){
    if(e.data&&e.data.bfAbilityAnim&&typeof e.data.bfAbilityAnim==='object'){
      animMap=e.data.bfAbilityAnim;
      // Pre-recorta todas las imágenes para que el primer disparo ya salga sin fondo.
      Object.keys(animMap).forEach(function(k){
        var ent=animMap[k];if(!ent)return;
        if(ent.base)cutout(ent.base);
        if(ent.elite)cutout(ent.elite);
      });
    }
  });

  var css=''+
  '#bf-abil-anim{position:fixed;inset:0;z-index:100007;pointer-events:none;overflow:hidden;perspective:900px;animation:bfAaIn .3s ease-out}'+
  '#bf-abil-anim.bf-aa-out{transition:opacity .4s;opacity:0}'+
  '@keyframes bfAaIn{from{opacity:0}to{opacity:1}}'+
  // Criatura suelta (sin marco) centrada y grande; la animación de entrada
  // se asigna inline según la variante de movimiento (abilityAnimMotions).
  '#bf-abil-anim .bf-aa-img{position:absolute;top:50%;left:50%;transform-origin:center;width:min(74vmin,640px);height:min(78vmin,680px);object-fit:contain;transform-style:preserve-3d;margin:calc(min(78vmin,680px)/-2) 0 0 calc(min(74vmin,640px)/-2);filter:drop-shadow(0 0 28px var(--aa-glow,#fff)) saturate(1.25) brightness(1.1)}'+
  '@media(max-width:900px){#bf-abil-anim .bf-aa-img{width:min(60vmin,460px);height:min(64vmin,480px);margin:calc(min(64vmin,480px)/-2) 0 0 calc(min(60vmin,460px)/-2)}}'+
  '#bf-abil-anim .bf-aa-ttl{position:absolute;top:8%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(22px,5vw,48px);letter-spacing:4px;white-space:nowrap;opacity:0;animation:bfAaTtl 2.9s ease-out .3s forwards;color:var(--aa-color,#fff);text-shadow:0 0 28px var(--aa-glow,#fff),0 4px 12px #000}'+
  '@keyframes bfAaTtl{0%{opacity:0;transform:translateX(-50%) scale(2)}15%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0;transform:translateX(-50%) scale(1.1)}}'+
  '#bf-abil-anim .bf-aa-flash{position:absolute;inset:0;background:radial-gradient(circle,var(--aa-flash,#fff),transparent 65%);animation:bfAaFlash .7s ease-out .25s both}'+
  '@keyframes bfAaFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}'+
  '#bf-abil-anim .bf-aa-veil{position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(0,0,0,.4),transparent);animation:bfAaVeil 2s ease-out forwards}'+
  '@keyframes bfAaVeil{0%{opacity:0}30%{opacity:.6}100%{opacity:0}}'+
  '.bf-aa-spark{position:absolute;bottom:10%;width:4px;height:4px;border-radius:50%;background:var(--aa-color,#fff);box-shadow:0 0 8px var(--aa-color,#fff),0 0 14px var(--aa-glow,#fff);opacity:0;animation:bfAaSpark 2s ease-out forwards}'+
  '@keyframes bfAaSpark{0%{opacity:0;transform:translateY(0) scale(.3)}15%{opacity:1}100%{opacity:0;transform:translateY(-85vh) scale(1.4) translateX(var(--dx,0px))}}'+
  '.bf-aa-ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;border:3px solid var(--aa-color,#fff);box-shadow:0 0 20px var(--aa-glow,#fff);opacity:0;animation:bfAaRing 1.5s ease-out forwards}'+
  '@keyframes bfAaRing{0%{width:10%;height:10%;opacity:1;border-width:4px}100%{width:250%;height:250%;opacity:0;border-width:1px}}'+
  ALL_MOTION_CSS;
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // Variantes de movimiento temático (tajo, fogonazo, etc.) elegidas por
  // palabras clave en la descripción de la animación. Inyectado desde el módulo
  // compartido abilityAnimMotions para que juego y vista previa coincidan.
  var MOTIONS_MIN = ${MOTIONS_MIN_JSON};
  function pickMotionDesc(desc){
    var d=String(desc||'').toLowerCase();
    if(!d)return MOTIONS_MIN[MOTIONS_MIN.length-1];
    for(var i=0;i<MOTIONS_MIN.length-1;i++){
      var m=MOTIONS_MIN[i];
      if(m.keywords.some(function(k){return d.indexOf(k)!==-1;}))return m;
    }
    return MOTIONS_MIN[MOTIONS_MIN.length-1];
  }

  function hexToRgba(hex,a){
    if(!hex)return null;
    var m=/^#?([0-9a-f]{6})$/i.exec(String(hex));
    if(!m)return null;
    var r=parseInt(m[1].slice(0,2),16),g=parseInt(m[1].slice(2,4),16),b=parseInt(m[1].slice(4,6),16);
    return 'rgba('+r+','+g+','+b+','+a+')';
  }

  // Color de clan del héroe desde G.team (si está disponible).
  function clanColorOf(hero){
    try{
      if(typeof G!=='undefined'&&G&&G.team){
        for(var s=0;s<2;s++){var side=s?'o':'p';var arr=G.team[side]||[];for(var i=0;i<arr.length;i++){if(arr[i]&&arr[i].id===hero.id){return arr[i].clanColor||arr[i].clan_color||null;}}}
      }
    }catch(e){}
    return null;
  }

  function lookup(hero){
    if(!hero)return null;
    return animMap[hero.id]||animMap[hero.cid]||animMap[hero.card_id]||null;
  }

  var lastCine=0;
  function playAnim(side,hero){
    if(!hero)return;
    var entry=lookup(hero);
    if(!entry)return;
    var isElite=!!hero.eliteMode;
    var url=isElite?(entry.elite||entry.base):entry.base;
    if(!url)return;
    var now=Date.now();
    if(document.getElementById('bf-abil-anim')||now-lastCine<3200)return;
    lastCine=now;
    var cc=clanColorOf(hero)||'#ffd24a';
    var ov=document.createElement('div');ov.id='bf-abil-anim';
    ov.style.setProperty('--aa-color',cc);
    ov.style.setProperty('--aa-glow',hexToRgba(cc,0.38)||'rgba(255,210,74,0.38)');
    ov.style.setProperty('--aa-flash',hexToRgba(cc,0.7)||'rgba(255,255,255,0.7)');
    var ability=isElite?(hero.eAbility||hero.ability||hero.name):(hero.ability||hero.name);
    var motion=pickMotionDesc(isElite?(entry.eliteDesc||entry.desc):entry.desc);
    var html='<div class="bf-aa-veil"></div><div class="bf-aa-flash"></div>';
    for(var r=0;r<3;r++)html+='<div class="bf-aa-ring" style="animation-delay:'+(r*0.25).toFixed(2)+'s"></div>';
    for(var sp=0;sp<14;sp++)html+='<span class="bf-aa-spark" style="left:'+(4+Math.random()*92).toFixed(0)+'%;--dx:'+((Math.random()*100-50).toFixed(0))+'px;animation-delay:'+(Math.random()*1.2).toFixed(2)+'s"></span>';
    if(motion.fxTag)html+=motion.fxTag;
    html+='<img class="bf-aa-img" style="animation:'+motion.anim+' 3.2s cubic-bezier(.2,.85,.3,1) forwards" src="'+(CUT[url]||url)+'" alt="">';
    html+='<div class="bf-aa-ttl">'+String(ability).toUpperCase()+'</div>';
    ov.innerHTML=html;
    document.body.appendChild(ov);
    setTimeout(function(){ov.classList.add('bf-aa-out');},2700);
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},3200);
  }
  window.__bfPlayAbilityAnim=playAnim;

  // Hook directo sobre useAbility: feedback inmediato en el host. No
  // intercepta los héroes token (los gestiona tokenAbilitiesPatch).
  function install(){
    if(typeof window.useAbility!=='function'||window.__bfAbilityAnimHooked)return false;
    window.__bfAbilityAnimHooked=true;
    var orig=window.useAbility;
    window.useAbility=function(side,h){
      try{var k=h&&h.akind;if(!(k&&String(k).indexOf('tk_')===0))playAnim(side,h);}catch(e){}
      return orig.apply(this,arguments);
    };
    return true;
  }

  // Escaneo periódico: detecta abilityUsed false->true. Funciona en AMBOS
  // jugadores online (G.team viaja en el snapshot).
  var prev={};
  function scan(){
    if(typeof G==='undefined'||!G||!G.team)return;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.id)return;
        var key=side+'_'+h.id;
        var used=!!h.abilityUsed;
        if(used&&!prev[key]){try{playAnim(side,h);}catch(e){}}
        prev[key]=used;
      });
    });
  }

  var tries=0,t=setInterval(function(){
    scan();
    if(!window.__bfAbilityAnimHooked){if(install()||tries++>120)clearInterval(t);}
  },150);
})();
</script>
`;