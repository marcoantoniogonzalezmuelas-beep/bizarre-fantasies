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
  // Cola de recortes: se procesa UNA imagen a la vez y solo cuando el navegador
  // está libre. Antes se recortaban todas de golpe (bucle de píxeles + PNG en
  // base64 de cada héroe): eso bloqueaba frames y llenaba memoria, y el tablet
  // perdía capas GPU → parpadeo al abrir cualquier cinemática.
  var QUEUE=[],BUSY=false;
  var idle=window.requestIdleCallback||function(f){return setTimeout(f,300);};
  function pump(){
    if(BUSY||!QUEUE.length)return;
    BUSY=true;
    var url=QUEUE.shift();
    idle(function(){ build(url); });
  }
  function done(){ BUSY=false; idle(pump); }
  function cutout(url){
    if(!url||CUT.hasOwnProperty(url))return;
    CUT[url]=false; // pendiente: mientras llega, se usa la URL original
    QUEUE.push(url);
    pump();
  }
  function build(url){
    var img=new Image();img.crossOrigin='anonymous';
    img.onload=function(){
      try{
        var c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
        var x=c.getContext('2d');x.drawImage(img,0,0);
        var d=x.getImageData(0,0,c.width,c.height),p=d.data,W=c.width,H=c.height;
        // Recorte por RELLENO DESDE LOS BORDES: solo se vuelve transparente el
        // fondo oscuro conectado al marco de la imagen. Así las ropas, sombras
        // y zonas negras del personaje conservan su color y opacidad completos
        // (antes cualquier píxel oscuro se volvía translúcido).
        // Umbral bajo (14): solo el negro puro del fondo se recorta. Con 30 se
        // comía las ropas y sombras oscuras del personaje conectadas al fondo y
        // dejaba huecos por los que se veía el escenario → aspecto translúcido.
        var BG=14;
        var seen=new Uint8Array(W*H),q=new Int32Array(W*H),qs=0,qe=0;
        function lum(i){var o=i*4;return Math.max(p[o],p[o+1],p[o+2]);}
        function push(i){if(!seen[i]&&lum(i)<BG){seen[i]=1;q[qe++]=i;}}
        for(var xx=0;xx<W;xx++){push(xx);push((H-1)*W+xx);}
        for(var yy=0;yy<H;yy++){push(yy*W);push(yy*W+W-1);}
        while(qs<qe){
          var i0=q[qs++],cx=i0%W,cy=(i0-cx)/W;
          p[i0*4+3]=0;
          if(cx>0)push(i0-1);
          if(cx<W-1)push(i0+1);
          if(cy>0)push(i0-W);
          if(cy<H-1)push(i0+W);
        }
        // NADA de alfa parcial: el personaje queda 100% opaco. Antes se
        // difuminaba el contorno bajando el alfa de los píxeles oscuros
        // pegados al fondo, y eso hacía que la figura (Patrón, Surucho…)
        // se viera translúcida. Solo se recorta el negro exterior, a fondo
        // completo o nada.
        // Encaja el lienzo exactamente a la figura ya recortada. No se aplica
        // máscara, halo ni ningún efecto: solo se elimina el negro exterior.
        var minX=W,minY=H,maxX=-1,maxY=-1;
        for(var ay=0;ay<H;ay++){for(var ax=0;ax<W;ax++){if(p[(ay*W+ax)*4+3]>8){minX=Math.min(minX,ax);minY=Math.min(minY,ay);maxX=Math.max(maxX,ax);maxY=Math.max(maxY,ay);}}}
        if(maxX<0){CUT[url]=false;done();return;}
        var pad=3,l=Math.max(0,minX-pad),t=Math.max(0,minY-pad),r=Math.min(W,maxX+pad+1),b=Math.min(H,maxY+pad+1);
        x.putImageData(d,0,0);
        var out=document.createElement('canvas');out.width=r-l;out.height=b-t;
        out.getContext('2d').drawImage(c,l,t,r-l,b-t,0,0,r-l,b-t);
        // Blob URL (no base64): mucho menos memoria que un data URL, y se
        // pre-decodifica antes de cachearla para que al abrir la cinemática la
        // imagen ya esté lista y no haya un frame en blanco.
        out.toBlob(function(bl){
          if(!bl){CUT[url]=false;done();return;}
          var bu=URL.createObjectURL(bl);
          var pre=new Image();
          pre.onload=function(){CUT[url]=bu;done();};
          pre.onerror=function(){CUT[url]=false;done();};
          pre.src=bu;
        },'image/png');
      }catch(e){CUT[url]=false;done();}
    };
    img.onerror=function(){CUT[url]=false;done();};
    img.src=url;
  }
  window.addEventListener('message',function(e){
    if(e.data&&e.data.bfAbilityAnim&&typeof e.data.bfAbilityAnim==='object'){
      animMap=e.data.bfAbilityAnim;
      // CRÍTICO: también actualizamos la referencia global para que otros
      // parches (epicAbilityFxPatch) vean el mapa poblado y NO reproduzcan su
      // cinemática antigua cuando este héroe ya tiene una animación nueva.
      window.__bfAbilityAnimMap=animMap;
      // Pre-recorta todas las imágenes para que el primer disparo ya salga sin fondo.
      Object.keys(animMap).forEach(function(k){
        var ent=animMap[k];if(!ent)return;
        if(ent.base)cutout(ent.base);
        if(ent.elite)cutout(ent.elite);
      });
      // Si el mapa llega después de que un héroe ya usó su habilidad, el
      // escaneo anterior no pudo encontrar la animación (lookup vacío) y
      // marcó prev[key]=true. Reseteando prev, el próximo escaneo reevalúa
      // todos los héroes con abilityUsed=true y reproduce la animación ahora
      // que el mapa está disponible.
      prev={};
    }
  });

  var css=''+
  '#bf-abil-anim{position:fixed;inset:0;z-index:100007;pointer-events:none;overflow:hidden;perspective:900px;animation:bfAaIn .3s ease-out}'+
  '#bf-abil-anim.bf-aa-out{transition:opacity .4s;opacity:0}'+
  '@keyframes bfAaIn{from{opacity:0}to{opacity:1}}'+
  // Criatura suelta (sin marco) centrada y grande; la animación de entrada
  // se asigna inline según la variante de movimiento (abilityAnimMotions).
  '#bf-abil-anim .bf-aa-dim{position:absolute;inset:0;background:radial-gradient(circle at 50% 52%,transparent 24%,rgba(0,0,0,.55) 62%,rgba(0,0,0,.78) 100%);animation:bfAaDim .5s ease-out both}'+
  '@keyframes bfAaDim{from{opacity:0}to{opacity:1}}'+
  '#bf-abil-anim .bf-aa-glowdisc{position:absolute;top:50%;left:50%;width:min(80vmin,700px);height:min(80vmin,700px);transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,var(--aa-glow,rgba(255,210,74,.4)) 0%,transparent 68%);opacity:0;animation:bfAaGlowIn .6s ease-out .05s both}'+
  '@keyframes bfAaGlowIn{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}'+
  // COLORES ORIGINALES: sin brillos de color pegados a la figura (los dos
  // drop-shadow del color de clan la teñían y la hacían parecer translúcida) y
  // sin brightness. Solo una sombra negra de apoyo, saturación/contraste leves
  // para que las ropas se vean vivas, y opacidad forzada al 100%.
  '#bf-abil-anim .bf-aa-img{position:absolute;top:50%;left:50%;transform-origin:center;width:min(74vmin,640px);height:min(78vmin,680px);object-fit:contain;transform-style:preserve-3d;margin:calc(min(78vmin,680px)/-2) 0 0 calc(min(74vmin,640px)/-2);opacity:1;mix-blend-mode:normal;filter:saturate(1.18) contrast(1.08) drop-shadow(0 16px 38px rgba(0,0,0,.8))}'+
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
  ${JSON.stringify(ALL_MOTION_CSS)};
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // Variantes de movimiento temático (tajo, fogonazo, etc.) elegidas por
  // palabras clave en la descripción de la animación. Inyectado desde el módulo
  // compartido abilityAnimMotions para que juego y vista previa coincidan.
  var MOTIONS_MIN = ${MOTIONS_MIN_JSON};
  function pickMotionDesc(desc,forcedId){
    if(forcedId&&forcedId!=='auto'){
      for(var j=0;j<MOTIONS_MIN.length;j++){if(MOTIONS_MIN[j].id===forcedId)return MOTIONS_MIN[j];}
    }
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
    var descSrc=isElite?(entry.eliteDesc||entry.desc):entry.desc;
    var motionId=isElite?(entry.eliteMotion||entry.motion):entry.motion;
    var motion=pickMotionDesc(descSrc||ability,motionId);
    var html='<div class="bf-aa-dim"></div><div class="bf-aa-glowdisc"></div><div class="bf-aa-veil"></div><div class="bf-aa-flash"></div>';
    // Sin anillos de halo del color de clan: parpadeaban al expandirse.
    for(var sp=0;sp<14;sp++)html+='<span class="bf-aa-spark" style="left:'+(4+Math.random()*92).toFixed(0)+'%;--dx:'+((Math.random()*100-50).toFixed(0))+'px;animation-delay:'+(Math.random()*1.2).toFixed(2)+'s"></span>';
    if(motion.fxTag)html+=motion.fxTag;
    var cu=CUT[url];
    // El recorte se prepara al recibir las imágenes; si aún está procesándose,
    // se muestra la original únicamente en ese primer instante.
    html+='<img class="bf-aa-img" style="animation:'+motion.anim+' 3.2s cubic-bezier(.2,.85,.3,1) forwards" src="'+(cu||url)+'" alt="">';
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