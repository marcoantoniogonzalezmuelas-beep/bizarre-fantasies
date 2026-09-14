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
      // Reconstruye el lookup por nombre para hechizos/objetos de la mano.
      spellByName={};
      Object.keys(animMap).forEach(function(k){
        var ent=animMap[k];
        if(ent&&ent.name)spellByName[String(ent.name).toLowerCase()]=ent;
      });
      // Pre-recorta todas las imágenes para que el primer disparo ya salga sin fondo.
      Object.keys(animMap).forEach(function(k){
        var ent=animMap[k];if(!ent)return;
        if(ent.base)cutout(ent.base);
        if(ent.elite)cutout(ent.elite);
      });
      // Al recibir el mapa, marca como "ya reproducidos" los héroes que ya
      // tienen abilityUsed=true. Así NO se relanzan sus cinemáticas cada vez
      // que el mapa se reenvía (cada cambio de pantalla envía el mapa otra
      // vez, y antes el reset prev={} provocaba que todos los héroes usados
      // repitieran su animación sin sentido). Solo los héroes que usen su
      // habilidad DESPUÉS de este momento dispararán la cinemática.
      if(typeof G!=='undefined'&&G&&G.team){
        ['p','o'].forEach(function(side){
          (G.team[side]||[]).forEach(function(h){
            if(h&&h.id&&h.abilityUsed)prev[side+'_'+h.id]=true;
          });
        });
      }
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

  var lastCine=0;
  // Cola de cinemáticas: si se pide una nueva mientras otra está en curso, se
  // reproduce cuando termine la actual (5s). Así nunca se solapan, pero el
  // jugador ve ambas (antes se saltaban con el cooldown de 5s y se perdían —
  // p.ej. la Refracción Arcana de Juniana al recibir daño justo tras la
  // cinemática del atacante).
  var queuedCine=null,cineTimer=null;
  // URL de la cinemática que se está reproduciendo ahora mismo. Se usa para
  // evitar que la MISMA animación se encole dos veces (p.ej. si el hook de
  // useAbility y el escaneo periódico la disparan a la vez).
  var playingUrl=null;
  // Última vez que se reprodujo cada imagen (antirrebote por URL).
  var lastUrlPlay={};
  // Cinemáticas ya vistas en ESTA partida: no se repiten (regla del motor).
  var played={};
  // Nueva partida (pantallas de preparación/subasta): se olvidan las vistas.
  var lastSid='';
  setInterval(function(){
    var a=document.querySelector('.screen.active');
    var sid=a?(a.id||''):'';
    if(sid===lastSid)return;
    lastSid=sid;
    if(sid==='s-setup'||sid==='s-title'){played={};lastUrlPlay={};}
  },500);
  // Núcleo compartido: monta el overlay 3D a pantalla completa con la imagen
  // recortada, el título, las partículas y el movimiento temático. Lo usan
  // tanto los héroes (playAnim) como los hechizos de la mano (playSpellCinematic).
  function showCinematic(url,title,cc,desc,motionId,descText,once){
    // Si el jugador ha desactivado las cinemáticas 3D (botón "Desactivar
    // animaciones" en batalla), se salta el overlay 3D. La carta revelada y
    // los FX 2D (rayo en cadena, tormenta ígnea, banners…) siguen funcionando.
    if(window.__bfNoCinematics)return;
    // REGLA DEL MOTOR: la cinemática 3D de una HABILIDAD DE HÉROE se reproduce
    // una sola vez por partida (once=true). Los HECHIZOS y OBJETOS de la mano
    // salen SIEMPRE que se juegan (once=false).
    if(once&&played[url])return;
    // Antirrebote POR IMAGEN: evita que el mismo disparo se duplique (varios
    // hooks a la vez). Largo para héroes (una vez por partida).
    // REGLA PARA HECHIZOS/OBJETOS: la cinemática 3D se reproduce UNA sola vez por
    // cada acción jugada. El antirrebote cubre toda la duración del overlay (5 s)
    // + colas, así aunque varios ganchos disparen la misma acción (castSpell,
    // __bfPlayItemCine, reenvíos de red…), solo se ve una vez. La acción
    // siguiente (ya pasado ese margen) sí vuelve a sonar.
    var deb=once?9000:5500;
    if(lastUrlPlay[url]&&Date.now()-lastUrlPlay[url]<deb)return;
    // Si ya hay una cinemática en curso, encola esta para reproducirla cuando
    // termine la actual. Solo se guarda la última pendiente (no acumula cola).
    // Cualquier capa cinemática en pantalla bloquea la siguiente: además de
    // otra cinemática 3D, también el golpe mortal (#bf-kill-ov) y las cartas
    // especiales (#bf-spec-cine). Así nunca se solapan (p.ej. la curación de
    // la IA encima de la cinemática de muerte).
    // También se espera a que terminen los EFECTOS VISUALES de la acción
    // anterior (disparos, impactos, números de daño/curación): si Surucho está
    // lanzando sus flechas, la cinemática de la poción de la IA espera su turno
    // en vez de colarse por encima.
    var fxOn=false;
    try{
      var fxl=document.getElementById('bf-fx-layer');
      fxOn=!!((fxl&&fxl.children.length)||document.querySelector('.bf-dmg-num,.bf-heal-num,.bf-absorb-pop'));
    }catch(e){}
    if(fxOn||document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov')){
      // Si la cinemática en curso o ya en cola es la MISMA (misma URL), no la
      // encola de nuevo: evita que se repita la misma animación.
      if(playingUrl===url)return;
      if(queuedCine&&queuedCine.url===url)return;
      queuedCine={url:url,title:title,cc:cc,desc:desc,motionId:motionId,descText:descText,once:once};
      if(!cineTimer){
        cineTimer=setTimeout(function(){
          cineTimer=null;var q=queuedCine;queuedCine=null;
          // Si al vencer el turno de espera sigue habiendo una capa en
          // pantalla, showCinematic vuelve a encolarla sola (sin solapar).
          if(q)showCinematic(q.url,q.title,q.cc,q.desc,q.motionId,q.descText,q.once);
        },1200);
      }
      return;
    }
    playingUrl=url;
    if(once)played[url]=true;
    lastUrlPlay[url]=Date.now();
    lastCine=Date.now();
    var ov=document.createElement('div');ov.id='bf-abil-anim';
    ov.style.setProperty('--aa-color',cc);
    ov.style.setProperty('--aa-glow',hexToRgba(cc,0.38)||'rgba(255,210,74,0.38)');
    ov.style.setProperty('--aa-flash',hexToRgba(cc,0.7)||'rgba(255,255,255,0.7)');
    var motion=pickMotionDesc(desc||title,motionId);
    var html='<div class="bf-aa-dim"></div><div class="bf-aa-glowdisc"></div><div class="bf-aa-veil"></div><div class="bf-aa-flash"></div>';
    for(var sp=0;sp<14;sp++)html+='<span class="bf-aa-spark" style="left:'+(4+Math.random()*92).toFixed(0)+'%;--dx:'+((Math.random()*100-50).toFixed(0))+'px;animation-delay:'+(Math.random()*1.2).toFixed(2)+'s"></span>';
    if(motion.fxTag)html+=motion.fxTag;
    var cu=CUT[url];
    html+='<img class="bf-aa-img'+(cu?'':' bf-aa-raw')+'" style="animation:'+motion.anim+' 4.5s cubic-bezier(.2,.85,.3,1) forwards" src="'+(cu||url)+'" alt="">';
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
        if(c2){imEl.src=c2;imEl.classList.remove('bf-aa-raw');clearInterval(swp);}
      },250);
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
    return !!(document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov')||playingUrl||queuedCine||cineTimer);
  };
  // Una sola cinemática por héroe y acción: las habilidades que piden objetivo
  // (Batur y compañía) pasan por useAbility antes y después de targetear, y eso
  // lanzaba la misma animación dos veces.
  var lastPlay={};
  function playAnim(side,hero,force){
    if(!hero)return;
    var entry=lookup(hero);
    if(!entry)return;
    var pk=(side||'')+'_'+(hero.id||hero.name||'');
    // force: la habilidad se acaba de ACTIVAR (p.ej. Juniana) — se ignora el
    // antirrebote para que la cinemática se vea siempre en ese momento.
    if(force)delete lastPlay[pk];
    if(lastPlay[pk]&&Date.now()-lastPlay[pk]<9000)return;
    lastPlay[pk]=Date.now();
    var isElite=!!hero.eliteMode;
    var url=isElite?(entry.elite||entry.base):entry.base;
    if(!url)return;
    var cc=clanColorOf(hero)||'#ffd24a';
    var ability=isElite?(hero.eAbility||hero.ability||hero.name):(hero.ability||hero.name);
    var descSrc=isElite?(entry.eliteDesc||entry.desc):entry.desc;
    var motionId=isElite?(entry.eliteMotion||entry.motion):entry.motion;
    var isEn=!!window.__bfLangEn;
    var descText=isElite?(isEn?(entry.eliteTextEn||entry.eliteText||entry.text):(entry.eliteText||entry.text)):(isEn?(entry.textEn||entry.text):(entry.text));
    showCinematic(url,ability,cc,descSrc||ability,motionId,descText,true);
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
  function installSpell(){
    if(typeof window.castSpell!=='function'||window.__bfAbilityAnimSpellHooked)return false;
    window.__bfAbilityAnimSpellHooked=true;
    var orig=window.castSpell;
    window.castSpell=function(id){
      try{
        if(typeof SPELLS!=='undefined'){
          var spell=typeof byId==='function'?byId(SPELLS,id):null;
          if(spell&&spell.name){
            var entry=spellByName[String(spell.name).toLowerCase()];
            if(entry&&entry.base)playItemCinematic(spell,entry);
          }
        }
      }catch(e){}
      return orig.apply(this,arguments);
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
      try{
        if(typeof G!=='undefined'&&G.items&&typeof B!=='undefined'&&B.current){
          var side=B.current.side;
          var o=G.items[side]&&G.items[side][idx];
          if(o&&o.name){
            var entry=spellByName[String(o.name).toLowerCase()];
            if(entry&&entry.base)playItemCinematic(o,entry);
          }
        }
      }catch(e){}
      return orig.apply(this,arguments);
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

  // Hook directo sobre useAbility: feedback inmediato en el host. No
  // intercepta los héroes token (los gestiona tokenAbilitiesPatch).
  function install(){
    if(typeof window.useAbility!=='function'||window.__bfAbilityAnimHooked)return false;
    window.__bfAbilityAnimHooked=true;
    var orig=window.useAbility;
    window.useAbility=function(side,h){
      try{
        var k=h&&h.akind;
        if(!(k&&String(k).indexOf('tk_')===0)){
          playAnim(side,h);
          // Marca este héroe como ya reproducido para que el escaneo periódico
          // (que detecta abilityUsed false→true) NO lo dispare de nuevo. Sin
          // esto, la cinemática se repite: useAbility la reproduce al instante
          // y el escaneo la vuelve a encolar al ver el flag abilityUsed cambiar.
          if(h&&h.id)prev[side+'_'+h.id]=true;
        }
      }catch(e){}
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
    // Hook de hechizos y objetos: castSpell / useItem pueden envolverlos otros
    // parches (Transformer), así que se reintenta hasta que ambos existan.
    installSpell();
    installItem();
  },150);
})();
</script>
`;