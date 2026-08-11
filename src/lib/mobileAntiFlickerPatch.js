// Parche SOLO móvil/tablet: elimina de raíz las propiedades que provocan
// parpadeos de pantalla en los FX del juego (golpes mortales, tormenta ígnea,
// bolas de fuego, maremoto…). En estos dispositivos el iframe va escalado con
// transform, y las capas FX que usan mix-blend-mode, backdrop-filter, filter
// animado (blur/brightness/drop-shadow) o will-change fuerzan re-composiciones
// GPU que hacen parpadear toda la pantalla. Este CSS con !important gana
// incluso a los valores de los @keyframes (las animaciones CSS no pueden
// sobreescribir declaraciones !important), así que neutraliza los filtros
// animados de TODOS los parches FX (clases con prefijo bf-) sin tocarlos.
// Los efectos siguen viéndose (opacidad, transform, box-shadow y text-shadow
// no se tocan): solo se pierden los brillos por filtro, que son los que
// parpadean.
export const MOBILE_ANTIFLICKER_PATCH = `
<style id="bf-antiflicker">
*,*::before,*::after{will-change:auto!important}
/* Excluye .bhero: los héroes caídos (bf-truedead) necesitan su filter
   grayscale, y los retratos de batalla no son capas FX temporales. */
[class^="bf-"]:not(.bhero),[class*=" bf-"]:not(.bhero),
[class^="bf-"]:not(.bhero)::before,[class*=" bf-"]:not(.bhero)::before,
[class^="bf-"]:not(.bhero)::after,[class*=" bf-"]:not(.bhero)::after{
  mix-blend-mode:normal!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  filter:none!important;
  box-shadow:none!important;
  clip-path:none!important;
  backface-visibility:hidden!important;
  -webkit-backface-visibility:hidden!important;
}
/* CAUSA DEL "CUADRADO BLANCO": estas capas de impacto se diseñaron con
   mix-blend-mode:screen (el blanco se funde con la carta). Al desactivar el
   blend aquí para evitar el parpadeo, su núcleo blanco se pinta opaco y se ve
   como un recuadro blanco sobre el héroe. Solución: sustituir el blanco por
   el color temático con poca opacidad (el background no lo animan los
   keyframes, así que el fundido de entrada/salida se conserva). */
.bf-fx-bigblast{background:radial-gradient(circle at 50% 45%,rgba(255,150,60,.5),rgba(255,77,60,.28) 26%,transparent 62%)!important}
.bf-fx-frost-burst{background:radial-gradient(circle at 50% 45%,rgba(150,225,255,.45),rgba(120,195,255,.2) 28%,transparent 62%)!important}
.bf-fx-bless-burst{background:radial-gradient(circle at 50% 45%,rgba(255,224,121,.45),rgba(255,200,80,.2) 28%,transparent 62%)!important}
.bf-fx-tank-burst{background:radial-gradient(circle at 50% 50%,rgba(255,190,90,.45),rgba(255,130,30,.2) 28%,transparent 64%)!important}
.bf-fx-elite-flip,.bf-fx-elite-aura{background:radial-gradient(circle at 50% 45%,rgba(255,210,74,.35),rgba(176,108,255,.15) 40%,transparent 70%)!important}
.bf-cast-flash{background:radial-gradient(circle at 50% 45%,rgba(199,155,255,.28),rgba(176,108,255,.14) 32%,transparent 62%)!important}
.bf-fx-magic-orb{background:radial-gradient(circle,currentColor,transparent 72%)!important}
.bf-frost-sheet,.bf-frost-crack,.bf-fx-shock,.bf-shock-fx::before,.bf-shock-fx::after{opacity:.45!important}
</style>
<script>
(function(){
  if(window.__bfAntiFlicker)return;window.__bfAntiFlicker=true;
  // Mantiene el estilo anti-parpadeo como ÚLTIMO del <head>: otros parches
  // añaden sus <style> en tiempo de ejecución y, a igual especificidad e
  // !important, gana el que va después. Así este siempre prevalece.
  setInterval(function(){
    var s=document.getElementById('bf-antiflicker');
    if(s&&document.head.lastElementChild!==s)document.head.appendChild(s);
  },800);
  // Refuerzo: los parches FX también ponen filtros por estilo inline
  // (el.style.filter='brightness…'). El CSS !important ya los anula, pero
  // algunos scripts los reponen en cada frame; aquí los limpiamos al vuelo.
  new MutationObserver(function(muts){
    for(var i=0;i<muts.length;i++){
      var el=muts[i].target;
      if(!el||el.nodeType!==1)continue;
      var cls=typeof el.className==='string'?el.className:'';
      if(cls.indexOf('bf-')===-1)continue;
      var st=el.style;
      if(st.filter&&st.filter!=='none')st.setProperty('filter','none','important');
      if(st.mixBlendMode&&st.mixBlendMode!=='normal')st.setProperty('mix-blend-mode','normal','important');
    }
  }).observe(document.documentElement,{attributes:true,attributeFilter:['style'],subtree:true});
})();
</script>
`;