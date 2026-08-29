// Parche SOLO móvil/tablet contra el parpadeo de la pantalla durante los FX.
//
// CAUSA REAL (revisada a fondo): en móvil/tablet el body del juego lleva un
// translate3d permanente (noFlickerPatch) para que el pellizco sea estable.
// Eso convierte al body en UNA capa GPU gigantesca (1200 × alto del juego).
// Los efectos de hechizo, las cinemáticas y las partículas se añaden
// directamente a document.body, así que cada frame de su animación repinta esa
// textura enorme: en tablet la GPU no da y se ve parpadear todo el campo de
// batalla.
//
// SOLUCIÓN: todos los FX se redirigen a UNA capa propia (#bf-fx-layer) que es
// su propia capa compuesta y está aislada (isolation + contain). Sus repintados
// ya no tocan la textura del body. Además se quitan los filtros animados
// (drop-shadow/blur sobre elementos que se mueven), que obligan a repintar por
// frame, sustituyéndolos por box-shadow, que sí se compone en GPU.
export const MOBILE_ANTIFLICKER_PATCH = `
<style id="bf-antiflicker">
*,*::before,*::after{will-change:auto!important}
/* Capa de efectos: contenedor ligero (NO capa GPU propia). Si #bf-fx-layer fuera
   una capa compuesta translateZ(0)+contain:paint, en tablet su textura ocupa
   toda la pantalla y cada hechizo la repinta entera → parpadeo. Ahora es solo
   un stacking context barato (isolation); cada efecto es SU PROPIA capa GPU
   pequeña (will-change/translateZ) y repinta solo su área. */
#bf-fx-layer{position:fixed!important;inset:0!important;pointer-events:none!important;z-index:90030!important;isolation:isolate!important}
/* Cada efecto temporal se compone de forma independiente. Es importante que
   la promoción esté en el hijo, nunca en el contenedor a pantalla completa. */
#bf-fx-layer>*{will-change:transform,opacity,left,top!important;transform:translateZ(0)!important;backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important}
/* Efectos anidados (olas/salpicaduras dentro de .bf-wave-overlay): cada uno
   promueve a su propia capa para no repintar el overlay entero. */
.bf-wave,.bf-splash{will-change:transform,opacity!important;transform:translateZ(0)!important}
/* Excluye .bhero: los héroes caídos (bf-truedead) necesitan su filter
   grayscale, y los retratos de batalla no son capas FX temporales. */
[class^="bf-"]:not(.bhero),[class*=" bf-"]:not(.bhero),
[class^="bf-"]:not(.bhero)::before,[class*=" bf-"]:not(.bhero)::before,
[class^="bf-"]:not(.bhero)::after,[class*=" bf-"]:not(.bhero)::after{
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  backface-visibility:hidden!important;
  -webkit-backface-visibility:hidden!important;
  mix-blend-mode:normal!important;
}
/* Capas de impacto nativas del juego: sin blend en táctil (parpadean sobre el
   iframe escalado). Sus fondos ya son translúcidos (whiteFlashFixPatch), así
   que en modo normal se ven bien y sin cuadros blancos. */
.fx-slash,.fx-burst,.fx-ring{mix-blend-mode:normal!important}
/* Filtros animados: un filter sobre un elemento que se mueve fuerza repintado
   por frame. Se eliminan y, donde el brillo importa, se pasa a box-shadow. */
.bf-wave,.bf-frost-mist,.bf-sc-img,.bf-aa-img,.bf-sc-ember,.bf-aa-spark,
.bf-sc-feather,.bf-sc-flame,.bf-sc-shell,.bf-sc-smoke,.bf-sc-cannon,
.bf-sc-boom,.bf-sc-arc,.bf-aa-ring{filter:none!important}
.bf-fireball{filter:none!important;box-shadow:0 0 30px 12px rgba(255,120,30,.8)!important}
.bf-ember{filter:none!important;box-shadow:0 0 12px 4px rgba(255,120,30,.7)!important}
.bf-ice-shard{filter:none!important;box-shadow:0 0 10px 2px rgba(150,220,255,.7)!important}
/* TABLET: NO se promueve el tablero de batalla a una capa GPU propia. En
   tablet esa capa es enorme y cada pulso/aura repinta TODA su textura →
   parpadeo constante. Sin translateZ, el navegador pinta solo las regiones
   pequeñas que cambian (el héroe que pulsa, el FX), no todo el tablero.
   isolation:isolate basta para que los FX de #bf-fx-layer no afecten al body. */
#s-battle,.army-panel,.action-panel{isolation:isolate!important}
/* Cada retrato (.bhero) es su propia capa GPU pequeña: las auras y pulsos de
   estado repintan solo ese recuadro, no el tablero entero. */
.bhero{transform:translateZ(0)!important;isolation:isolate!important;backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important}
/* CAUSA REAL DEL PARPADEO EN BATALLA (móvil y tablet): los estados de los
   héroes animan propiedades que NO se pueden componer en GPU y obligan a
   repintar el tablero en cada fotograma:
     · bfStateEdge  → box-shadow con 64px de halo alrededor del retrato
     · bfAuraPulse  → opacidad del degradado ::before
     · bfScanMove   → background-position de 6 capas SVG (.bf-pat)
     · bfStateBanner→ box-shadow + filter brightness de la etiqueta ::after
     · bfAgonPulse  → filter brightness sobre el arte de batalla
   Se congelan en táctil: el halo, el degradado, el patrón y la etiqueta se
   siguen viendo exactamente igual, pero fijos, sin latido. Las decoraciones
   (arañas, copos, Zzz…) se conservan porque solo animan transform. */
.bhero,.bhero::before,.bhero::after,
.bhero .bf-pat,.bhero .bf-battle-art,.bhero .bf-agonize-badge{animation:none!important}
/* El arte de la escena de batalla del héroe llevaba filter:blur(). Un blur
   dentro de un documento escalado se re-rasteriza en CADA repintado, y en
   tablet (escala ~0,7) esa textura es enorme: era la causa del parpadeo del
   campo de batalla durante animaciones y cinemáticas. Se quita el blur y se
   mantiene el look oscurecido con opacidad (el degradado ::after ya difumina
   visualmente el borde). */
.bf-bhero-bgart{filter:none!important;opacity:.72!important}
/* Sacudida del héroe agonizante: sin filtros animados encima del arte. */
.bhero.bf-agonizing .bf-battle-art{filter:none!important}
/* Overlays de cinemática: capa propia y aislada. */
#bf-abil-anim,#bf-spec-cine,#bf-kill-ov{isolation:isolate!important;contain:layout style!important;transform:translateZ(0)!important}
/* Hijos animados de los overlays de cinemática 3D: cada uno su propia capa GPU
   para que sus fotogramas no repinten la textura a pantalla completa del overlay
   (eso es lo que parpadea en tablet). will-change promociona sin pisar el
   transform de la animación. */
#bf-abil-anim>*,#bf-spec-cine>*,#bf-kill-ov>*{will-change:transform,opacity!important}
/* Móvil/tablet: la cinemática 3D a pantalla completa (perspective +
   preserve-3d + filter drop-shadow + backdrop-filter) fuerza a la GPU a
   recomponer TODO el documento (body + batalla) en cada fotograma →
   parpadeo intenso, héroes en negro, pantalla descompuesta. Se simplifica a
   un overlay 2D plano: la imagen sale grande y nítida con fade+scale, sin
   perspectiva ni filtros pesados. Se ve igual de clara y no parpadea. */
#bf-abil-anim{perspective:none!important}
#bf-abil-anim .bf-aa-img{
  transform-style:flat!important;
  filter:none!important;
  animation:bfAaMobileImg 4.5s ease-out forwards!important;
}
#bf-abil-anim .bf-aa-desc{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
#bf-abil-anim .bf-aa-ring{display:none!important}
@keyframes bfAaMobileImg{
  0%{opacity:0;transform:scale(.72)}
  15%{opacity:1;transform:scale(1)}
  82%{opacity:1;transform:scale(1)}
  100%{opacity:0;transform:scale(1.08)}
}
/* El "cuadrado blanco" de los impactos se corrige en whiteFlashFixPatch.js
   (se aplica en todo el juego, móvil y escritorio). */
</style>
<script>
(function(){
  if(window.__bfAntiFlicker)return;window.__bfAntiFlicker=true;

  // Una sola reubicación del <style> al final del head (mover un <style>
  // invalida todos los estilos: hacerlo en bucle era parpadeo constante).
  function toEnd(){
    var s=document.getElementById('bf-antiflicker');
    if(s&&document.head.lastElementChild!==s)document.head.appendChild(s);
  }
  if(document.readyState==='complete')setTimeout(toEnd,1500);
  else window.addEventListener('load',function(){setTimeout(toEnd,1500)});

  // ---- Capa única de FX ----
  // Todo lo que los parches añaden al body y es un efecto temporal (clases
  // bf-* de hechizos/partículas y los overlays de cinemática) se redirige aquí.
  // Las coordenadas no cambian: la capa es position:fixed inset:0 dentro del
  // mismo bloque contenedor (el body transformado) que usaban los FX.
  var layer=null;
  function fxLayer(){
    if(layer&&layer.parentNode)return layer;
    layer=document.createElement('div');
    layer.id='bf-fx-layer';
    document.body.appendChild(layer);
    return layer;
  }

  // Solo los proyectiles e impactos creados por los parches visuales se mueven
  // a la capa aislada. La regla anterior aceptaba cualquier clase "bf-*" y
  // podía capturar elementos reales de la interfaz, como el modal de compra.
  var FX_CLASSES={
    'bf-afx':1,'bf-wave-overlay':1,'bf-fireball':1,'bf-fire-ring':1,
    'bf-ember':1,'bf-frost-overlay':1,'bf-frost-mist':1,'bf-ice-shard':1,
    'bf-bolt':1,'bf-flash':1
  };
  function isFx(n){
    if(!n||n.nodeType!==1)return false;
    if(n.id==='bf-fx-layer'||n.id==='bf-abil-anim'||n.id==='bf-spec-cine')return false;
    var cn=typeof n.className==='string'?n.className:'';
    if(!cn)return false;
    var parts=cn.split(/\\s+/);
    for(var i=0;i<parts.length;i++){
      if(FX_CLASSES[parts[i]]||/^fx-(slash|burst|ring)$/.test(parts[i]))return true;
    }
    return false;
  }

  var origAppend=document.body.appendChild.bind(document.body);
  document.body.appendChild=function(node){
    try{ if(isFx(node))return fxLayer().appendChild(node); }catch(e){}
    return origAppend(node);
  };

  // La capa se crea ya (vacía no cuesta nada) para que su textura exista antes
  // del primer efecto y no haya un salto al crearla en mitad de una animación.
  if(document.body)fxLayer();
  else window.addEventListener('DOMContentLoaded',fxLayer);

  // Durante una cinemática 3D o la pausa de muerte, el motor puede pedir varios
  // renderBattle aunque el estado jugable no cambie. Reconstruir los retratos y
  // sus escenas de fondo bajo un overlay compuesto es el destello que quedaba
  // en tablet. Guardamos solo el último repintado y lo aplicamos al terminar la
  // capa visual; la lógica de combate no se toca.
  function installBattleFreeze(){
    if(typeof window.renderBattle!=='function'||window.renderBattle.__bfFxFreeze)return false;
    var original=window.renderBattle, pending=false;
    function frozen(){
      return !!document.getElementById('bf-abil-anim')||!!document.getElementById('bf-spec-cine')||!!document.getElementById('bf-kill-ov')||Date.now()<(window.__bfDeathDelayUntil||0);
    }
    function flush(){
      if(!pending||frozen())return;
      pending=false;
      original.call(window);
    }
    function wrapped(){
      if(frozen()){pending=true;return;}
      return original.apply(this,arguments);
    }
    wrapped.__bfFxFreeze=1;
    window.renderBattle=wrapped;
    setInterval(flush,180);
    return true;
  }
  var freezeTries=0,freezeTimer=setInterval(function(){
    if(installBattleFreeze()||freezeTries++>160)clearInterval(freezeTimer);
  },150);
})();
</script>
`;