// Parche inyectado en el iframe: cuando un héroe ejecuta su acción (habilidad,
// ataque o hechizo), la vista se desplaza automáticamente para centrar la
// carta implicada en pantalla. Así los efectos visuales siempre se ven aunque
// el jugador tuviera el scroll abajo (mirando su mano o el panel de acciones).
export const ACTION_FOCUS_PATCH = `
<script>
(function(){
  if(window.__bfActionFocus)return;
  window.__bfActionFocus=true;

  function cardEl(side,id){ return document.getElementById('b_'+side+'_'+id); }

  // Centra la carta si no está razonablemente visible. smooth=false hace un
  // salto instantáneo (necesario antes de dibujar proyectiles, que calculan
  // sus coordenadas en ese mismo instante).
  function focusCard(side,id,smooth){
    var el=cardEl(side,id); if(!el)return;
    var r=el.getBoundingClientRect();
    var vh=window.innerHeight||document.documentElement.clientHeight;
    if(r.top>=70&&r.bottom<=vh-30)return; // ya se ve entera: no mover
    try{ el.scrollIntoView({block:'center',behavior:smooth?'smooth':'auto'}); }catch(e){ el.scrollIntoView(); }
  }

  // 1) Habilidades: centrar al héroe que la usa justo antes de la animación.
  function hookAbility(){
    if(typeof window.useAbility!=='function'||window.useAbility.__bfFocus)return;
    var orig=window.useAbility;
    window.useAbility=function(side,hero){
      if(hero)try{focusCard(side,hero.id,false);}catch(e){}
      return orig.apply(this,arguments);
    };
    window.useAbility.__bfFocus=1;
  }

  // 2) Ataques y hechizos: centrar en el objetivo antes de que los parches de
  // efectos dibujen proyectiles/olas (calculan posiciones al ejecutarse, por lo
  // que este envoltorio debe quedar POR FUERA: se instala solo cuando los
  // parches de efectos ya han envuelto flushFx).
  function hookFlush(){
    if(typeof window.flushFx!=='function'||window.flushFx.__bfFocus)return;
    if(!window.flushFx.__bfAfx||!window.flushFx.__bfSpellFx)return;
    var orig=window.flushFx;
    window.flushFx=function(list){
      try{
        if(list&&list.length){
          var ev=null;
          for(var i=0;i<list.length;i++){
            var e=list[i];
            if(e&&(e.k==='arrow'||e.k==='slash'||e.k==='spell')&&e.toSide!=null){ev=e;break;}
          }
          if(ev)focusCard(ev.toSide,ev.toId,false);
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
    // Conservar las marcas de los otros parches para que no vuelvan a envolver.
    window.flushFx.__bfAfx=1;
    window.flushFx.__bfSpellFx=1;
    window.flushFx.__bfFocus=1;
  }

  function hook(){ hookAbility(); hookFlush(); }
  var iv=setInterval(function(){
    hook();
    if(window.useAbility&&window.useAbility.__bfFocus&&window.flushFx&&window.flushFx.__bfFocus)clearInterval(iv);
  },200);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook); else hook();
})();
</script>
`;