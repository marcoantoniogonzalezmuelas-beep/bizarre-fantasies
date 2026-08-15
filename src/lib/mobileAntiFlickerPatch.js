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
/* Capa única de efectos: propia capa GPU, aislada del resto del documento. */
#bf-fx-layer{position:fixed!important;inset:0!important;pointer-events:none!important;z-index:90030!important;transform:translateZ(0)!important;isolation:isolate!important;contain:layout style paint!important;overflow:hidden!important}
#bf-fx-layer>*{will-change:transform,opacity!important}
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
/* TABLET: el tablero de batalla se promociona a SUS PROPIAS capas GPU. Sin
   esto, cada pulso/aura/animación de una carta de héroe repinta la textura
   gigante del body (1200 × alto del juego) y en tablet se ve parpadear todo.
   Se usa solo translateZ + isolation (sin contain:paint) para no recortar los
   brillos que sobresalen de los paneles. */
#s-battle,.army-panel,.action-panel{transform:translateZ(0)!important;isolation:isolate!important}
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

  // Clases/ids de efectos temporales que deben vivir en la capa aislada.
  var FX_RE=/^bf-(wave-overlay|wave|splash|fireball|fire-ring|ember|frost-overlay|frost-mist|ice-shard|bolt|flash|hit|star|slash|burst|ring|shock|aura|blood|heal|kill|shield|dmg|num|spark|glow|obj|abil|epic)/;
  // Las cinemáticas a pantalla completa NO se redirigen: ya están aisladas por
  // CSS y necesitan su z-index propio por encima de todo.
  function isFx(n){
    if(!n||n.nodeType!==1)return false;
    if(n.id==='bf-fx-layer'||n.id==='bf-abil-anim'||n.id==='bf-spec-cine')return false;
    var cn=typeof n.className==='string'?n.className:'';
    if(!cn)return false;
    var parts=cn.split(/\\s+/);
    for(var i=0;i<parts.length;i++){ if(FX_RE.test(parts[i]))return true; }
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