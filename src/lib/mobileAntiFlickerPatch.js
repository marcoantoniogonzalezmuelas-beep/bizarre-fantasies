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
/* CADA retrato de héroe (.bhero) sí se promueve a su propia capa GPU pequeña.
   Las animaciones de box-shadow/filter/opacity del estado (statusAuraPatch:
   bfStateEdge, bfStateBanner, bfAuraPulse) repintan SOLO la capa de ese
   retrato, no el iframe entero. Sin esto, en tablet cada pulso de un héroe
   repinta toda la textura del iframe → parpadeo constante. El retrato es
   pequeño, así que su capa es barata de repintar. */
.bhero{transform:translateZ(0)!important;isolation:isolate!important;backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important}
/* Overlays de cinemática: capa propia y aislada. */
#bf-abil-anim,#bf-spec-cine{isolation:isolate!important;contain:layout style paint!important;transform:translateZ(0)!important}
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

  // Efectos temporales que deben vivir en la capa aislada. Antes solo se
  // detectaban algunos nombres de hechizo: los sprites anime (.bf-afx) y los
  // impactos nativos (.fx-*) seguían entrando directamente al body, que es lo
  // que mantenía el parpadeo de Tormenta Ígnea y Rayo en Cadena en tablet.
  // Todo nodo efímero bf-* o fx-* añadido DIRECTAMENTE al body se redirige.
  // Las piezas persistentes del tablero se insertan dentro de sus cartas, así
  // que no pasan por aquí.
  function isFx(n){
    if(!n||n.nodeType!==1)return false;
    if(n.id==='bf-fx-layer'||n.id==='bf-abil-anim'||n.id==='bf-spec-cine')return false;
    var cn=typeof n.className==='string'?n.className:'';
    if(!cn)return false;
    var parts=cn.split(/\\s+/);
    for(var i=0;i<parts.length;i++){
      if(parts[i]==='bf-afx'||/^bf-/.test(parts[i])||/^fx-/.test(parts[i]))return true;
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
})();
</script>
`;