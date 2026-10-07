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
import { createAbilityCinematicQueue } from '@/lib/abilityCinematicQueue';

export const ABILITY_ANIM_PATCH = `
<script>
(function(){
  if(window.__bfAbilityAnimPatch)return;
  window.__bfAbilityAnimPatch=true;

  // Mapa card_id -> {base, elite} recibido del padre por postMessage.
  var animMap={};
  window.__bfAbilityAnimMap=animMap;
  // Lookup por nombre para hechizos/objetos de la mano (su id del juego no
  // coincide con el card_id de la BD, así que se emparejan por nombre).
  var spellByName={};
  // Color por elemento del hechizo para el halo/título de la cinemática.
  var SPELL_COLORS={fuego:'#ff5a2a',hielo:'#5ad0ff',rayo:'#ffe14a',agua:'#3aa0ff',curacion:'#5fffa0',proteccion:'#ffd23a',arcano:'#c79bff',estado:'#c79bff'};
  // Recorta el fondo oscuro/negro de las imágenes de animación (lo vuelve
  // transparente con un canvas) para que solo quede la criatura, igual que las
  // cinemáticas del Tanque/Transformer/Patitos. Se cachea por URL.
  var CUT={};
  // Cola de recortes: se procesa UNA imagen a la vez y solo cuando el navegador
  // está libre. Antes se recortaban todas de golpe (bucle de píxeles + PNG en
  // base64 de cada héroe): eso bloqueaba frames y llenaba memoria, y el tablet
  // perdía capas GPU → parpadeo al abrir cualquier cinemática.
  var QUEUE=[],BUSY=false;
  // Como mucho 24 recortes guardados: al pasar, se libera el más antiguo (su memoria vuelve al navegador).
  var KEPT=[];
  function keep(url){
    var i=KEPT.indexOf(url);if(i>=0)KEPT.splice(i,1);KEPT.push(url);
    while(KEPT.length>24){ var old=KEPT.shift(); try{ if(CUT[old])URL.revokeObjectURL(CUT[old]); }catch(e){} delete CUT[old]; }
  }
  var idle=window.requestIdleCallback||function(f){return setTimeout(f,300);};
  function pump(){
    if(BUSY||!QUEUE.length)return;
    BUSY=true;
    var url=QUEUE.shift();
    idle(function(){ build(url); });
  }
  function done(){ BUSY=false; idle(pump); }
  // La cinemática que se va a mostrar ya no espera su turno en la cola (en el
  // móvil del invitado tardaba y salía la imagen original con fondo blanco).
  function prioritize(url){
    var qi=QUEUE.indexOf(url);
    if(qi<0)return;
    QUEUE.splice(qi,1);
    if(BUSY){QUEUE.unshift(url);return;}
    BUSY=true;build(url);
  }
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
        // Tamaño máximo 720 px en el lado largo: la cinemática nunca se ve más grande, y recortar a tamaño completo
        // costaba mucha CPU y memoria (en iPhone, Safari acababa recargando la página).
        var sc=Math.min(1,720/Math.max(img.naturalWidth||1,img.naturalHeight||1));
        var c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*sc));c.height=Math.max(1,Math.round(img.naturalHeight*sc));
        var x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);
        var d=x.getImageData(0,0,c.width,c.height),p=d.data,W=c.width,H=c.height;
        // Recorte por DISTANCIA DE COLOR + RELLENO DESDE LOS BORDES: se muestrea
        // el color real del fondo desde los bordes de la imagen y se vuelve
        // transparente todo lo conectado al marco que esté cerca de ese color.
        // Así se eliminan fondos que no son negro puro (gris oscuro, azul
        // oscuro, morado oscuro…) que el umbral de luminancia anterior (14) no
        // detectaba. La conectividad desde los bordes protege las zonas oscuras
        // del personaje que no tocan el marco: ropas, sombras y contornos
        // conservan su color y opacidad completos.
        var bgR=0,bgG=0,bgB=0,bgN=0;
        var sPts=[[0,0],[W-1,0],[0,H-1],[W-1,H-1],[W>>1,0],[W>>1,H-1],[0,H>>1],[W-1,H>>1]];
        for(var si=0;si<sPts.length;si++){
          var sxx=sPts[si][0],syy=sPts[si][1];
          for(var dx=-3;dx<=3;dx++){for(var dy=-3;dy<=3;dy++){
            var px=Math.max(0,Math.min(W-1,sxx+dx)),py=Math.max(0,Math.min(H-1,syy+dy));
            var oo=(py*W+px)*4;bgR+=p[oo];bgG+=p[oo+1];bgB+=p[oo+2];bgN++;
          }}
        }
        bgR/=bgN;bgG/=bgN;bgB/=bgN;
        // Tolerancia CONSERVADORA: con 58 el relleno se comía zonas oscuras de
        // la propia figura (ropa, sombras, contornos) que tocan el marco, y eso
        // es lo que hacía que el héroe se viera translúcido/fantasmal. Con 30
        // solo se elimina el fondo real, la figura queda entera y opaca.
        var TOL=30,TOL2=TOL*TOL;
        var seen=new Uint8Array(W*H),q=new Int32Array(W*H),qs=0,qe=0;
        function bgDist(i){var o=i*4;var dr=p[o]-bgR,dg=p[o+1]-bgG,db=p[o+2]-bgB;return dr*dr+dg*dg+db*db;}
        // Un píxel casi negro conectado al marco SIEMPRE es fondo, aunque el
        // muestreo de esquinas se haya desviado (brillos/rayos de luz en las
        // esquinas, como en Curación Divina): sin esto el relleno se bloqueaba
        // y el fondo negro se quedaba sin recortar.
        // Fondo negro: se recorta en TODA la imagen (Curación Divina y demás
        // escenas con fondo negro puro), pero solo cuando el píxel forma parte
        // de una MANCHA negra ancha: se exige que él y sus 4 vecinos sean casi
        // negros. Así el relleno no puede colarse por los contornos negros de
        // 1-2 px del personaje y abrirle agujeros (eso era lo que hacía que la
        // figura se viera translúcida/fantasmal).
        function pitch(i){var o=i*4;return p[o]<20&&p[o+1]<20&&p[o+2]<20;}
        function dark(i){
          var ix=i%W,iy=(i-ix)/W;
          if(!pitch(i))return false;
          if(ix>0&&!pitch(i-1))return false;
          if(ix<W-1&&!pitch(i+1))return false;
          if(iy>0&&!pitch(i-W))return false;
          if(iy<H-1&&!pitch(i+W))return false;
          return true;
        }
        function push(i){if(!seen[i]&&(bgDist(i)<TOL2||dark(i))){seen[i]=1;q[qe++]=i;}}
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
        // SEGURO ANTI-BORRADO: si la escena es MUY oscura en su conjunto (p.ej.
        // el drenaje de la bruja: figura negra sobre fondo negro), el relleno
        // desde los bordes se come casi toda la figura y la cinemática se veía
        // transparente / no se veía. Si queda menos del 15% de la imagen, se
        // descarta el recorte y se usa la imagen ORIGINAL (con su fondo), que
        // siempre se ve. Vale para esta y para cualquier animación futura.
        var kept=0;
        for(var ci=0;ci<W*H;ci++)if(p[ci*4+3]>8)kept++;
        if(kept<W*H*0.15){CUT[url]=false;done();return;}
        // AFINADO DE BORDES: tras el relleno conservador (TOL 30) suele quedar
        // una franja oscura de 1-4 px pegada al contorno de la figura (el halo
        // negro que se ve alrededor del personaje). Se erosiona SOLO esa franja:
        // píxeles del borde (vecinos de un transparente) que sigan pareciéndose
        // al fondo con una tolerancia mayor. Máx 4 pasadas de 1 px → no puede
        // comerse el interior de la figura (ropas/sombras quedan intactas).
        // Tolerancia MODERADA y una sola pasada: con 85 y 4 pasadas se comía
        // ropa, sombras y contornos del personaje, y por eso la figura salía
        // desvaída/translúcida en vez de con sus colores originales.
        var EDGE_TOL=45,EDGE_TOL2=EDGE_TOL*EDGE_TOL;
        for(var pass=0;pass<1;pass++){
          var kill=[];
          for(var ey=0;ey<H;ey++){for(var ex=0;ex<W;ex++){
            var ei=ey*W+ex;
            if(p[ei*4+3]===0)continue;
            var nT=(ex>0&&p[(ei-1)*4+3]===0)||(ex<W-1&&p[(ei+1)*4+3]===0)||(ey>0&&p[(ei-W)*4+3]===0)||(ey<H-1&&p[(ei+W)*4+3]===0);
            if(nT&&(bgDist(ei)<EDGE_TOL2||dark(ei)))kill.push(ei);
          }}
          if(!kill.length)break;
          for(var ki=0;ki<kill.length;ki++)p[kill[ki]*4+3]=0;
        }
        // Suavizado de 1 px SOLO en el contorno final: el píxel de borde baja a
        // alfa 165 para que el recorte no se vea dentado. La figura sigue 100%
        // opaca por dentro (nunca translúcida).
        var edge=[];
        for(var fy=0;fy<H;fy++){for(var fx=0;fx<W;fx++){
          var fi=fy*W+fx;
          if(p[fi*4+3]===0)continue;
          var fT=(fx>0&&p[(fi-1)*4+3]===0)||(fx<W-1&&p[(fi+1)*4+3]===0)||(fy>0&&p[(fi-W)*4+3]===0)||(fy<H-1&&p[(fi+W)*4+3]===0);
          if(fT)edge.push(fi);
        }}
        for(var fe=0;fe<edge.length;fe++)p[edge[fe]*4+3]=165;
        // NADA de alfa parcial (interior): el personaje queda 100% opaco. Antes se
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
          pre.onload=function(){CUT[url]=bu;keep(url);done();};
          pre.onerror=function(){CUT[url]=false;done();};
          pre.src=bu;
        },'image/png');
      }catch(e){CUT[url]=false;done();}
    };
    img.onerror=function(){CUT[url]=false;done();};
    img.src=url;
  }
  // Pre-recorte SOLO de los héroes de la batalla en curso (6 héroes × normal/élite), y nunca con "Anim OFF".
  var precutKey='';
  function precutBattle(){
    try{
      if(window.__bfNoCinematics||!animMap||!document.querySelector('#s-battle.active')||typeof G==='undefined'||!G||!G.team)return;
      var ids=[].concat(G.team.p||[],G.team.o||[]).map(function(h){return h&&(h.id||h.cid||h.card_id);}).filter(Boolean);
      var key=ids.join(',');if(!key||key===precutKey)return;
      precutKey=key;
      ids.forEach(function(id){ var ent=animMap[id]; if(!ent)return; if(ent.base)cutout(ent.base); if(ent.elite&&ent.elite!==ent.base)cutout(ent.elite); });
    }catch(e){}
  }
  setInterval(precutBattle,1500);
  window.addEventListener('message',function(e){
    if(e.data&&e.data.bfAbilityAnim&&typeof e.data.bfAbilityAnim==='object'){
      animMap=e.data.bfAbilityAnim;
      // CRÍTICO: también actualizamos la referencia global para que otros
      // parches (epicAbilityFxPatch) vean el mapa poblado y NO reproduzcan su
      // cinemática antigua cuando este héroe ya tiene una animación nueva.
      window.__bfAbilityAnimMap=animMap;
      // Reconstruye el lookup por nombre para hechizos/objetos de la mano.
      spellByName={};
      Object.keys(animMap).forEach(function(k){
        var ent=animMap[k];
        if(ent&&ent.name)spellByName[String(ent.name).toLowerCase()]=ent;
      });
      // Ya NO se pre-recortan las ~270 imágenes de todas las cartas: en iPhone (sin requestIdleCallback) se procesaban
      // durante toda la partida, llenaban la memoria y Safari recargaba la página (desconexiones y reanudaciones en
      // bucle), y en Android retrasaban el juego aun con "Anim OFF". Solo se preparan las de los héroes de la batalla
      // en curso (precutBattle) y las de hechizos/objetos cuando se usan (prioritize/cutout al mostrarlas).
      // Re-sending assets must not consume an ability awaiting playback.
      // The queue deduplicates by side, hero and normal/elite form.
    }
  });
  // Ask for the map after the listener exists, rather than before iframe boot.
  window.parent.postMessage({bfAbilityAnimReady:true}, '*');

  var css=''+ 
  '#bf-abil-anim{position:fixed;inset:0;z-index:100007;pointer-events:none;overflow:hidden;perspective:900px;animation:bfAaIn .3s ease-out}'+
  '#bf-abil-anim.bf-aa-out{transition:opacity .4s;opacity:0}'+
  '@keyframes bfAaIn{from{opacity:0}to{opacity:1}}'+
  // Criatura suelta (sin marco) centrada y grande; la animación de entrada
  // se asigna inline según la variante de movimiento (abilityAnimMotions).
  '#bf-abil-anim .bf-aa-dim{position:absolute;inset:0;background:radial-gradient(circle at 50% 52%,transparent 24%,rgba(0,0,0,.55) 62%,rgba(0,0,0,.78) 100%);animation:bfAaDim .5s ease-out both}'+
  '@keyframes bfAaDim{from{opacity:0}to{opacity:1}}'+
  '#bf-abil-anim .bf-aa-glowdisc{position:absolute;top:50%;left:50%;width:min(80vmin,700px);height:min(80vmin,700px);transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,var(--aa-glow,rgba(255,210,74,.22)) 0%,transparent 68%);opacity:0;animation:bfAaGlowIn .6s ease-out .05s both;z-index:1}'+
  '@keyframes bfAaGlowIn{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}'+
  // COLORES ORIGINALES PUROS: sin saturate/contrast (alteraban los colores y
  // daban un aspecto translúcido/falso), sin mix-blend-mode, sin brillos de
  // color. Solo una sombra negra de apoyo y opacidad forzada al 100%. z-index
  // alto para que la imagen SIEMPRE esté encima del dim/glowdisc/veil/flash.
  '#bf-abil-anim .bf-aa-img{position:absolute;top:50%;left:50%;transform-origin:center;width:min(74vmin,640px);height:min(78vmin,680px);object-fit:contain;transform-style:preserve-3d;margin:calc(min(78vmin,680px)/-2) 0 0 calc(min(74vmin,640px)/-2);opacity:1;mix-blend-mode:normal;z-index:5;filter:drop-shadow(0 16px 38px rgba(0,0,0,.8))}'+
  // Imagen SIN recorte (escenas muy oscuras que no se pueden recortar sin
  // borrar la figura): se muestra con un realce de brillo/contraste y un marco
  // sutil para que se distinga del fondo oscuro del overlay.
  '#bf-abil-anim .bf-aa-img.bf-aa-raw{filter:brightness(1.35) contrast(1.12) drop-shadow(0 16px 38px rgba(0,0,0,.8));border-radius:18px;box-shadow:0 0 0 2px rgba(255,255,255,.14),0 18px 46px rgba(0,0,0,.75)}'+
  '@media(max-width:900px){#bf-abil-anim .bf-aa-img{width:min(60vmin,460px);height:min(64vmin,480px);margin:calc(min(64vmin,480px)/-2) 0 0 calc(min(60vmin,460px)/-2)}}'+
  '#bf-abil-anim .bf-aa-ttl{position:absolute;top:7%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(22px,5vw,48px);letter-spacing:4px;white-space:nowrap;opacity:0;animation:bfAaTtl 4.2s ease-out .3s forwards;color:var(--aa-color,#fff);text-shadow:0 0 28px var(--aa-glow,#fff),0 4px 12px #000}'+
  '@keyframes bfAaTtl{0%{opacity:0;transform:translateX(-50%) scale(2)}15%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0;transform:translateX(-50%) scale(1.1)}}'+
  '#bf-abil-anim .bf-aa-desc{position:absolute;top:calc(7% + clamp(28px,5vw,56px));left:50%;transform:translateX(-50%);max-width:min(82vw,620px);text-align:center;font-family:Rubik,sans-serif;font-weight:600;font-size:clamp(13px,2.4vw,19px);line-height:1.4;color:#fff7ea;opacity:0;animation:bfAaDesc 4.5s ease-out .6s forwards;text-shadow:0 2px 8px #000,0 0 12px rgba(0,0,0,.85);padding:8px 18px;background:rgba(8,5,14,.6);border-radius:12px;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.12)}'+
  '@keyframes bfAaDesc{0%{opacity:0;transform:translateX(-50%) translateY(10px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}82%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-6px)}}'+
  '#bf-abil-anim .bf-aa-flash{position:absolute;inset:0;background:radial-gradient(circle,var(--aa-flash,#fff),transparent 65%);animation:bfAaFlash .7s ease-out .25s both}'+
  '@keyframes bfAaFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}'+
  '#bf-abil-anim .bf-aa-veil{position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(0,0,0,.4),transparent);animation:bfAaVeil 2s ease-out forwards}'+
  '@keyframes bfAaVeil{0%{opacity:0}30%{opacity:.6}100%{opacity:0}}'+
  '.bf-aa-spark{position:absolute;bottom:10%;width:4px;height:4px;border-radius:50%;background:var(--aa-color,#fff);box-shadow:0 0 8px var(--aa-color,#fff),0 0 14px var(--aa-glow,#fff);opacity:0;animation:bfAaSpark 2s ease-out forwards}'+
  '@keyframes bfAaSpark{0%{opacity:0;transform:translateY(0) scale(.3)}15%{opacity:1}100%{opacity:0;transform:translateY(-85vh) scale(1.4) translateX(var(--dx,0px))}}'+
  '.bf-aa-ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;border:3px solid var(--aa-color,#fff);box-shadow:0 0 20px var(--aa-glow,#fff);opacity:0;animation:bfAaRing 1.5s ease-out forwards}'+
  '@keyframes bfAaRing{0%{width:10%;height:10%;opacity:1;border-width:4px}100%{width:250%;height:250%;opacity:0;border-width:1px}}'+
  ${JSON.stringify(ALL_MOTION_CSS)}+
  // Congelación real de los paneles de batalla durante la cinemática 3D:
  // pausa TODAS las animaciones y transiciones de los paneles (auras, pulsos,
  // estados animados, retratos con respiración…) para que la GPU no los
  // repinte fotograma a fotograma mientras compone la cinemática. Los retratos
  // SIGUEN VISIBLES como fotograma estático — no desaparecen.
  '.bf-cine-frozen,.bf-cine-frozen *,.bf-cine-frozen *::before,.bf-cine-frozen *::after{animation-play-state:paused!important;transition:none!important}';
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
    // Fallback por nombre: si el card_id cambió en el editor (p.ej. un héroe
    // editado que antes era otro), el lookup por id falla. El nombre es estable
    // y permite encontrar la animación aunque el card_id haya cambiado.
    return animMap[hero.id]||animMap[hero.cid]||animMap[hero.card_id]||animMap[hero._token]||(hero.name?spellByName[String(hero.name).toLowerCase()]:null)||null;
  }

  // Devuelve el lado ('p' u 'o') de un héroe, buscándolo en G.team.
  function sideOf(hero){
    try{
      if(typeof G==='undefined'||!G||!G.team)return null;
      for(var s=0;s<2;s++){var side=s?'o':'p';var arr=G.team[side]||[];for(var i=0;i<arr.length;i++){if(arr[i]&&arr[i].id===hero.id)return side;}}
    }catch(e){}
    return null;
  }

  var playingUrl=null,busySince=0;
  function cineDiag(msg){ try{ window.parent.postMessage({bfRelayError:{room_code:'',side:'',nick:'',error_type:'cine_stuck',action:'abilityAnim',error_message:String(msg).slice(0,400)}},'*'); }catch(e){} }
  var cineQueue=(${createAbilityCinematicQueue.toString()})({
    enabled:function(){return !window.__bfNoCinematics;},
    now:function(){return Date.now();},
    schedule:function(fn,ms){return setTimeout(fn,ms);},
    cancel:function(id){clearTimeout(id);},
    blocked:function(){
      // Solo bloquean los efectos RECIENTES (menos de 2,5 s): un resto viejo que nadie borró dejaba la animación
      // esperando para siempre y, con ella, el paso de turno. (Los efectos nuevos que siguen llegando sí la hacen esperar.)
      var now=Date.now(),fxl=document.getElementById('bf-fx-layer'),recentFx=false;
      if(fxl){ for(var i=0;i<fxl.children.length;i++){ var n=fxl.children[i]; if(!n.__bfSeen)n.__bfSeen=now; if(now-n.__bfSeen<2500){ recentFx=true; break; } } }
      return !!(playingUrl||recentFx||document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov,#bf-epic-cine,.bf-hdice'));
    },
    play:function(q){
      // Si la animación falla al montarse, se libera al momento (antes la marca "reproduciendo" quedaba puesta para
      // siempre y ningún turno volvía a avanzar).
      try{ renderCinematic(q.url,q.title,q.cc,q.desc,q.motionId,q.descText); }
      catch(e){ playingUrl=null; var o=document.getElementById('bf-abil-anim'); if(o&&o.parentNode)o.parentNode.removeChild(o); cineDiag('error al montar la animaci\\u00f3n de '+(q&&q.title)+': '+String((e&&e.message)||e)); }
    }
  });
  var lastSid='';
  function syncSession(){
    var a=document.querySelector('.screen.active'),sid=a?(a.id||''):'';
    if(sid!==lastSid){
      lastSid=sid;
      if(['s-setup','s-title','s-recruit','s-equip'].indexOf(sid)!==-1){cineQueue.reset();prev={};}
    }
    return sid==='s-battle';
  }
  function showCinematic(url,title,cc,desc,motionId,descText,once,key){
    syncSession();
    return cineQueue.enqueue({key:key||'item:'+url,url:url,title:title,cc:cc,desc:desc,motionId:motionId,descText:descText,once:once});
  }
  function renderCinematic(url,title,cc,desc,motionId,descText){
    playingUrl=url;
    var ov=document.createElement('div');ov.id='bf-abil-anim';
    ov.style.setProperty('--aa-color',cc);
    ov.style.setProperty('--aa-glow',hexToRgba(cc,0.38)||'rgba(255,210,74,0.38)');
    ov.style.setProperty('--aa-flash',hexToRgba(cc,0.7)||'rgba(255,255,255,0.7)');
    var motion=pickMotionDesc(desc||title,motionId);
    var html='<div class="bf-aa-dim"></div><div class="bf-aa-glowdisc"></div><div class="bf-aa-veil"></div><div class="bf-aa-flash"></div>';
    for(var sp=0;sp<14;sp++)html+='<span class="bf-aa-spark" style="left:'+(4+Math.random()*92).toFixed(0)+'%;--dx:'+((Math.random()*100-50).toFixed(0))+'px;animation-delay:'+(Math.random()*1.2).toFixed(2)+'s"></span>';
    if(motion.fxTag)html+=motion.fxTag;
    var cu=CUT[url];
    if(!cu){ if(!CUT.hasOwnProperty(url))cutout(url); prioritize(url); }   // (ya no se pre-recorta todo: se pide aquí)
    html+='<img class="bf-aa-img'+(cu?'':' bf-aa-raw')+'" style="'+(cu?'':'visibility:hidden;')+'animation:'+motion.anim+' 4.5s cubic-bezier(.2,.85,.3,1) forwards" src="'+(cu||url)+'" alt="">';
    html+='<div class="bf-aa-ttl">'+String(title).toUpperCase()+'</div>';
    if(descText)html+='<div class="bf-aa-desc">'+String(descText)+'</div>';
    ov.innerHTML=html;
    (window.__bfAppend||function(n){document.body.appendChild(n);})(ov);
    // CONGELAR EL TABLERO RIVAL durante la cinemática 3D: la GPU del tablet no
    // puede repintar el tablero de batalla (retratos, auras, estados animados)
    // Y componer la cinemática 3D a la vez — eso era el parpadeo. Se oculta el
    // panel del rival con visibility:hidden (no toda la pantalla: el overlay
    // ya la cubre con el dim). Al terminar la cinemática se restaura.
    var frozen=[];
    try{
      var battle=document.getElementById('s-battle');
      if(battle){
        var panels=battle.querySelectorAll('.army-panel');
        // Se CONGELAN ambos paneles (jugador + rival): pausando todas sus
        // animaciones y transiciones la GPU no repinta auras, pulsos ni estados
        // animados mientras compone la cinemática 3D. Los retratos siguen
        // visibles como fotograma estático — no desaparecen en ningún momento.
        panels.forEach(function(p){
          p.classList.add('bf-cine-frozen');
          frozen.push(p);
        });
      }
    }catch(e){}
    // Si el recorte de fondo aún no estaba listo al abrir la cinemática, la
    // imagen original (con fondo negro) se sustituye por la recortada en
    // cuanto termina de procesarse.
    if(!cu){
      var imEl=ov.querySelector('.bf-aa-img');
      var swp=setInterval(function(){
        if(!ov.parentNode){clearInterval(swp);return;}
        var c2=CUT[url];
        if(c2){imEl.src=c2;imEl.classList.remove('bf-aa-raw');imEl.style.visibility='';clearInterval(swp);}
      },100);
      setTimeout(function(){if(imEl)imEl.style.visibility='';},2500);
      setTimeout(function(){clearInterval(swp);},5000);
    }
    setTimeout(function(){ov.classList.add('bf-aa-out');},4500);
    setTimeout(function(){
      if(ov.parentNode)ov.parentNode.removeChild(ov);
      playingUrl=null;
      // Restaurar los paneles congelados (reanudar animaciones).
      frozen.forEach(function(p){try{p.classList.remove('bf-cine-frozen');}catch(e){}});
    },5000);
  }
  // Devuelve true mientras hay una cinemática 3D en curso o en cola. Lo usa
  // el motor de dados (__bfHeroRoll) para que cualquier tirada espere a que
  // termine la animación 3D anterior (p.ej. la del ataque que generó el daño
  // que disparó el dado) antes de lanzarse. Así nunca se solapan.
  window.__bfCinematicBusy=function(){
    var b=!!(document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov,#bf-epic-cine,.bf-hdice')||playingUrl||cineQueue.busy());
    // Marca "reproduciendo" sin animación en pantalla: se libera (la animación ya no está).
    if(playingUrl&&!document.getElementById('bf-abil-anim')){ if(!window.__bfPlayOrphanAt)window.__bfPlayOrphanAt=Date.now(); else if(Date.now()-window.__bfPlayOrphanAt>1500){ playingUrl=null; window.__bfPlayOrphanAt=0; cineDiag('marca de reproducci\\u00f3n sin animaci\\u00f3n en pantalla: liberada'); } } else window.__bfPlayOrphanAt=0;
    // TOPE ABSOLUTO: más de 12 s seguidos "con cinemática" no puede ser real: se deja de esperar y se anota qué había.
    if(!b){ busySince=0; return false; }
    if(!busySince)busySince=Date.now();
    if(Date.now()-busySince>12000){
      var what=[];
      if(document.querySelector('#bf-abil-anim'))what.push('#bf-abil-anim');if(document.querySelector('#bf-spec-cine'))what.push('#bf-spec-cine');
      if(document.querySelector('#bf-kill-ov'))what.push('#bf-kill-ov');if(document.querySelector('#bf-epic-cine'))what.push('#bf-epic-cine');
      if(document.querySelector('.bf-hdice'))what.push('.bf-hdice');if(playingUrl)what.push('reproduciendo');if(cineQueue.busy())what.push('cola');
      cineDiag('cinem\\u00e1tica "ocupada" m\\u00e1s de 12 s: '+what.join(','));
      try{ cineQueue.reset(); }catch(e){}
      playingUrl=null; busySince=0;
      var stale=document.querySelectorAll('#bf-abil-anim,#bf-spec-cine,#bf-epic-cine,.bf-hdice');
      for(var i=0;i<stale.length;i++){ if(stale[i].parentNode)stale[i].parentNode.removeChild(stale[i]); }
      return false;
    }
    return true;
  };
  // Una sola cinemática por héroe y acción: las habilidades que piden objetivo
  // (Batur y compañía) pasan por useAbility antes y después de targetear, y eso
  // lanzaba la misma animación dos veces.
  function abilityKey(side,hero){return (side||'')+'_'+(hero.id||hero.name||'')+'_'+(hero.eliteMode?'elite':'normal');}
  var abilityCallDepth=0;
  function playAnim(side,hero,force){
    // Dedicated hero patches may request playback inside useAbility, before
    // they open the target picker. The outer hook decides after they return.
    if(abilityCallDepth)return false;
    // No playback until the last valid target is confirmed, including tokens.
    if(hero && ((window.__bfTargetAbilityPending && window.__bfTargetAbilityPending.hero===hero) ||
      (typeof B!=='undefined' && B && B.pending && B.current && B.current.side===side && B.current.id===hero.id)))return false;
    if(!hero||hero._bfAbilityCineSuppressed===(hero.eliteMode?'elite':'normal'))return;
    var entry=lookup(hero);
    if(!entry)return;
    var isElite=!!hero.eliteMode;
    var url=isElite?(entry.elite||entry.base):entry.base;
    if(!url)return;
    var cc=clanColorOf(hero)||'#ffd24a';
    var ability=isElite?(hero.eAbility||hero.ability||hero.name):(hero.ability||hero.name);
    var descSrc=isElite?(entry.eliteDesc||entry.desc):entry.desc;
    var motionId=isElite?(entry.eliteMotion||entry.motion):entry.motion;
    var isEn=!!window.__bfLangEn;
    var descText=isElite?(isEn?(entry.eliteTextEn||entry.eliteText||entry.text):(entry.eliteText||entry.text)):(isEn?(entry.textEn||entry.text):(entry.text));
    return showCinematic(url,ability,cc,descSrc||ability,motionId,descText,true,abilityKey(side,hero));
  }
  window.__bfPlayAbilityAnim=playAnim;

  // Cinemática 3D para HECHIZOS y OBJETOS de la mano. Los hechizos/objetos no
  // están en G.team ni tienen flag abilityUsed, así que se engancha
  // directamente a castSpell / useItem (y sus versiones IA) en vez de usar el
  // escaneo. Marca window.__bfCardCineName para que cardPlayRevealPatch NO
  // muestre la carta revelada al mismo tiempo (sin solapar ambas animaciones).
  // REGLA: una sola cinemática 3D por acción de hechizo/objeto. Candado por
  // nombre que dura lo que se ve el overlay (5 s) + margen de cola: aunque
  // varios ganchos disparen la misma acción a la vez, solo el primero pasa.
  var itemActionLock={};
  var itemCall=null;
  function needsCardTarget(item,spell){
    var kinds=spell?['dmg1','dmg1slow','heal1','shield','ward','sleep','para','debuff','buff']:['heal','healBig','shield','cleanse','bomb','mana','manaBig','revive','bf_drain'];
    return !!item&&kinds.indexOf(item.kind)>=0;
  }
  function playItemCinematic(item,entry){
    // Cinemáticas 3D desactivadas: se salta el overlay 3D y NO se fija
    // __bfCardCineName, así la carta revelada sí se muestra en el centro.
    if(window.__bfNoCinematics)return;
    var lockKey=String(item&&item.name||'').toLowerCase();
    if(lockKey&&itemActionLock[lockKey]&&Date.now()-itemActionLock[lockKey]<5500)return;
    if(lockKey)itemActionLock[lockKey]=Date.now();
    var url=entry.base;
    if(!url)return;
    var cc=(item&&item.element&&SPELL_COLORS[item.element])||'#ffd24a';
    var isEn=!!window.__bfLangEn;
    // El Drenaje y el Ladrón Enmascarado tienen cinemáticas propias con título
    // pero SIN texto de carta: aquí se omite la descripción para que no salga
    // el bloque de texto que sí llevan el resto de hechizos/objetos.
    var nm=String(item&&item.name||'').toLowerCase();
    var noDesc=nm==='drenaje'||nm.indexOf('ladr')!==-1;
    var descText=noDesc?null:(isEn?(entry.textEn||entry.text):(entry.text));
    showCinematic(url,item?item.name:'Objeto',cc,entry.desc||(item?item.name:''),entry.motion,descText,false);
    // Suprime la carta revelada de este hechizo/objeto durante la cinemática 3D.
    window.__bfCardCineName=item?item.name:null;
    setTimeout(function(){window.__bfCardCineName=null;},5200);
  }
  // API pública: reproduce la cinemática 3D de la BD de un hechizo/objeto por
  // NOMBRE. La usan los parches que resuelven un objeto por su cuenta (p. ej.
  // Drenaje) y por tanto no pasan por el hook de useItem.
  window.__bfPlayItemCine=function(name){
    var e=spellByName[String(name||'').toLowerCase()];
    if(e&&e.base){playItemCinematic({name:name},e);return true;}
    return false;
  };
  // Record target requests issued synchronously by a card. The callback is
  // invoked only after pickTarget has accepted a living/dead valid target.
  function installItemTarget(){
    if(window.__bfOnce__bfItemTarget_pendTarget||typeof window.pendTarget!=='function')return; window.__bfOnce__bfItemTarget_pendTarget=1;   /* instalación única: reinstalarse apilaba capas sin fin ("Maximum call stack") */
    var orig=window.pendTarget;
    var w=function(prompt,side,cb,opts){
      var action=itemCall;
      if(!action)return orig.apply(this,arguments);
      action.targeted=true;
      var args=Array.prototype.slice.call(arguments);
      args[2]=function(target){
        if(!action.confirmed && target){
          action.confirmed=true;
          playItemCinematic(action.item,action.entry);
          if(typeof NET!=='undefined'&&NET.role==='host'&&typeof pushFx==='function')pushFx({k:'bfItemCine',name:action.item.name});
        }
        return cb.apply(this,arguments);
      };
      return orig.apply(this,args);
    };
    w.__bfItemTarget=true;
    window.pendTarget=w;
  }
  // Targeted card playback is relayed after confirmation, not on cast intent.
  function installItemSync(){
    if(window.__bfOnce__bfItemCine_flushFx||typeof window.flushFx!=='function')return; window.__bfOnce__bfItemCine_flushFx=1;   /* instalación única: reinstalarse apilaba capas sin fin ("Maximum call stack") */
    var orig=window.flushFx;
    var w=function(events){
      if(typeof NET!=='undefined'&&NET.role==='client'){
        (events||[]).forEach(function(e){if(e&&e.k==='bfItemCine')window.__bfPlayItemCine(e.name);});
      }
      return orig.apply(this,arguments);
    };
    w.__bfItemCine=true;
    window.flushFx=w;
  }
  function installSpell(){
    if(typeof window.castSpell!=='function'||window.__bfAbilityAnimSpellHooked)return false;
    window.__bfAbilityAnimSpellHooked=true;
    var orig=window.castSpell;
    window.castSpell=function(id){
      var spell=typeof SPELLS!=='undefined'&&typeof byId==='function'?byId(SPELLS,id):null;
      var entry=spell&&spell.name?spellByName[String(spell.name).toLowerCase()]:null;
      var action=entry&&entry.base?{item:spell,entry:entry,targeted:false,confirmed:false}:null;
      var previous=itemCall;
      itemCall=action;
      var result;
      try{result=orig.apply(this,arguments);}finally{itemCall=previous;}
      if(action&&!action.targeted && (!(typeof NET!=='undefined'&&NET.role==='client')||!needsCardTarget(spell,true)))playItemCinematic(spell,entry);
      return result;
    };
    // IA: también reproduce la cinemática cuando la IA lanza un hechizo.
    if(typeof window.castSpell_AI==='function'&&!window.__bfAbilityAnimSpellAiHooked){
      window.__bfAbilityAnimSpellAiHooked=true;
      var origAi=window.castSpell_AI;
      window.castSpell_AI=function(side,h,s,target){
        try{
          if(s&&s.name){
            var entry=spellByName[String(s.name).toLowerCase()];
            if(entry&&entry.base)playItemCinematic(s,entry);
          }
        }catch(e){}
        return origAi.apply(this,arguments);
      };
    }
    return true;
  }
  // Objetos de la mano: useItem(idx) y useItem_AI(side,idx). El objeto se
  // busca en G.items[side][idx] y se empareja por nombre con el mapa de la BD.
  function installItem(){
    if(typeof window.useItem!=='function'||window.__bfAbilityAnimItemHooked)return false;
    window.__bfAbilityAnimItemHooked=true;
    var orig=window.useItem;
    window.useItem=function(idx){
      var side=typeof B!=='undefined'&&B&&B.current&&B.current.side;
      var o=typeof G!=='undefined'&&G&&G.items&&side&&G.items[side]&&G.items[side][idx];
      var entry=o&&o.name?spellByName[String(o.name).toLowerCase()]:null;
      var action=entry&&entry.base?{item:o,entry:entry,targeted:false,confirmed:false}:null;
      var previous=itemCall;
      itemCall=action;
      var result;
      try{result=orig.apply(this,arguments);}finally{itemCall=previous;}
      if(action&&!action.targeted && (!(typeof NET!=='undefined'&&NET.role==='client')||!needsCardTarget(o,false)))playItemCinematic(o,entry);
      return result;
    };
    if(typeof window.useItem_AI==='function'&&!window.__bfAbilityAnimItemAiHooked){
      window.__bfAbilityAnimItemAiHooked=true;
      var origAi=window.useItem_AI;
      window.useItem_AI=function(side,idx){
        try{
          if(typeof G!=='undefined'&&G.items){
            var o=G.items[side]&&G.items[side][idx];
            if(o&&o.name){
              var entry=spellByName[String(o.name).toLowerCase()];
              if(entry&&entry.base)playItemCinematic(o,entry);
            }
          }
        }catch(e){}
        return origAi.apply(this,arguments);
      };
    }
    return true;
  }

  // Los bizarros lanzan su cinemática al resolver la habilidad en sus
  // propios parches (tras seleccionar objetivo); no anticiparla aquí.
  function isBizarre(hero){
    return !!hero && [hero._token,hero.cid,hero.card_id,hero.id].some(function(id){return /^tk_/.test(String(id||''));});
  }
  function install(){
    if(typeof window.useAbility!=='function'||window.__bfAbilityAnimHooked)return false;
    window.__bfAbilityAnimHooked=true;
    var orig=window.useAbility;
    window.useAbility=function(side,h){
      var result;
      // Forma y vida ANTES de la habilidad: si el héroe muere (o muere y renace en élite) en mitad de su propia
      // habilidad —pinchos, reflejo de Juniana…—, al terminar ya está en otra forma y la animación salía DESPUÉS del
      // renacer (y con la imagen de la forma nueva). Las cinemáticas de muerte y renacer ya cuentan lo que pasó.
      var wasElite=!!(h&&h.eliteMode),wasAlive=!!(h&&h.alive!==false),wasUsed=!!(h&&h.abilityUsed);
      abilityCallDepth++;
      try{result=orig.apply(this,arguments);}finally{abilityCallDepth--;}
      if(h&&wasAlive&&(h.alive===false||!!h.eliteMode!==wasElite)){
        try{ prev[abilityKey(side,h)]=true; }catch(e){}
        return result;
      }
      // Solo hay animación si la habilidad SE HA EJECUTADO: si se bloqueó (élite ya usada, héroe muerto, silencio…)
      // o no hizo nada, no queda marcada como usada y no debe salir su animación (salía "la animación sin la
      // habilidad", p. ej. tras renacer). Si espera a que elijas objetivo, la animación sale al confirmarlo.
      if(h&&!wasUsed&&!h.abilityUsed&&!window.__bfTargetAbilityPending)return result;
      // A pending hero target owns the cinematic; never launch it at activation.
      if(!isBizarre(h) && !window.__bfTargetAbilityPending){
        try{if(playAnim(side,h)&&h&&h.id)prev[abilityKey(side,h)]=true;}catch(e){}
      }
      return result;
    };
    return true;
  }
  // Escaneo periódico: detecta abilityUsed false->true. Funciona en AMBOS
  // jugadores online (G.team viaja en el snapshot).
  var memo=window.bfNewAbilityMemo?window.bfNewAbilityMemo():{prev:{},known:{},alive:{},quiet:{},restored:{}};
  var prev=memo.prev;
  // Partida nueva: se olvida lo visto (si no, el estado de la anterior contaminaba la siguiente).
  // Al empezar otra partida se vacía TODO lo pendiente de animaciones: antes las que quedaban en cola al acabar una
  // partida se reproducían al empezar la siguiente (jugadas viejas en la partida nueva).
  function purgeCine(){
    try{ cineQueue.reset(); }catch(e){}
    playingUrl=null; busySince=0; window.__bfPlayOrphanAt=0;
    ['bf-abil-anim','bf-spec-cine','bf-epic-cine'].forEach(function(id){ var n=document.getElementById(id); if(n&&n.parentNode)n.parentNode.removeChild(n); });
  }
  if(window.bfOnMatchReset)window.bfOnMatchReset(function(){if(window.bfResetAbilityMemo)window.bfResetAbilityMemo(memo);purgeCine();});
  window.__bfPurgeCine=purgeCine;   // el invitado que se queda atrás descarta las animaciones atrasadas
  // Y al TERMINAR la partida (pantalla de resultado): nada de la partida acabada queda esperando su turno.
  // (Cuando la cinemática final ya terminó, o pasados 15 s: así no se corta la animación del último golpe.)
  var purgedFor=null,resultSince=0;
  setInterval(function(){
    var r=document.getElementById('s-result'),on=!!(r&&r.classList.contains('active'));
    if(!on){ resultSince=0; if(purgedFor!==null&&document.querySelector('#s-battle.active'))purgedFor=null; return; }
    if(!resultSince)resultSince=Date.now();
    var ended=!!window.__bfEndCineDoneAt||Date.now()-resultSince>15000;
    if(ended&&purgedFor!==(window.__bfMatchEpoch|0)){ purgedFor=window.__bfMatchEpoch|0; purgeCine(); }
  },500);
  function scan(){
    if(!syncSession()||typeof G==='undefined'||!G||!G.team)return;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.id)return;
        var key=abilityKey(side,h);
        var pending=window.__bfTargetAbilityPending;
        var awaiting=(pending&&pending.hero===h)||(typeof B!=='undefined'&&B&&B.pending&&B.current&&B.current.side===side&&B.current.id===h.id);
        // Una activación REAL es un false->true observado en un héroe ya conocido, fuera de una
        // resurrección y sin ser la restauración del flag "Usada" (ver animGuardPatch).
        var verdict=window.bfAbilityGate?window.bfAbilityGate(memo,key,h,Date.now(),awaiting):((h.abilityUsed&&!prev[key]&&!awaiting)?'play':'idle');
        // Con "Anim OFF" no se encola nada: la habilidad se da por VISTA sin reproducirla. Así, al volver a "Anim ON"
        // no salen de golpe las animaciones atrasadas; solo las de las habilidades usadas a partir de ese momento.
        if(verdict==='play'){ if(window.__bfNoCinematics){ prev[key]=true; } else { try{if(playAnim(side,h))prev[key]=true;}catch(e){} } }
      });
    });
  }

  setInterval(function(){
    scan();
    if(!window.__bfAbilityAnimHooked)install();
    // Hook de hechizos y objetos: castSpell / useItem pueden envolverlos otros
    // parches (Transformer), así que se reintenta hasta que ambos existan.
    installItemTarget();
    installItemSync();
    installSpell();
    installItem();
  },150);
})();
</script>
`;