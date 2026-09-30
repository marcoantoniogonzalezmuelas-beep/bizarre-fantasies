// BUS DE MUTACIONES ÚNICO para el iframe del juego.
//
// Antes había ~33 MutationObserver, casi todos sobre documentElement con
// childList+subtree: cada nodo insertado en cualquier parte (un número de daño,
// una chispa) despertaba a todos. Ahora hay UN observer y cada suscriptor se
// ejecuta como mucho una vez por fotograma, justo antes de pintar.
//
//   bfDom.on(fn)            fn() cuando cambia el DOM, salvo si TODOS los cambios del
//                           fotograma ocurrieron dentro de #bf-fx-layer (efectos).
//   bfDom.on(fn,{fx:true})  igual, pero también se ejecuta por cambios de la capa de FX.
//
// Solo para callbacks que IGNORAN la lista de mutaciones ("inyecta el botón si
// falta"). Los que necesitan los registros (nodos añadidos) siguen con su observer.
export const DOM_BUS_PATCH = `
<script>
(function(){
  if(window.bfDom)return;
  var subs=[],mo=null,pending=false,fxOnly=true,raf=0,tmo=0;
  function inFx(n){
    try{return !!(n&&(n.id==='bf-fx-layer'||(n.closest&&n.closest('#bf-fx-layer'))));}catch(e){return false;}
  }
  function flush(){
    if(raf){try{cancelAnimationFrame(raf);}catch(e){}raf=0;}
    clearTimeout(tmo);tmo=0;
    var all=!fxOnly;pending=false;fxOnly=true;
    for(var i=0;i<subs.length;i++){
      var s=subs[i];
      if(all||s.fx){try{s.fn();}catch(e){}}
    }
  }
  function onMut(recs){
    if(fxOnly){
      for(var i=0;i<recs.length;i++){if(!inFx(recs[i].target)){fxOnly=false;break;}}
    }
    if(pending)return;
    pending=true;
    // rAF = justo antes de pintar. El temporizador cubre pestañas ocultas (rAF parado).
    raf=requestAnimationFrame(flush);
    tmo=setTimeout(flush,120);
  }
  window.bfDom={
    on:function(fn,opts){
      subs.push({fn:fn,fx:!!(opts&&opts.fx)});
      if(!mo){mo=new MutationObserver(onMut);mo.observe(document.documentElement,{childList:true,subtree:true});}
    },
    _count:function(){return subs.length;}
  };
})();
</script>
`;
