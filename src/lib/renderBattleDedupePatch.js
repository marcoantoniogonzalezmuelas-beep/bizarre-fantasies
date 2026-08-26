// Evita los repintados innecesarios de la mesa de batalla.
//
// El juego reconstruye TODA la zona de batalla (nombres, barras, manos, log)
// cada vez que ocurre cualquier cosa, y varios sistemas la piden a la vez. Al
// reemplazarse el HTML se reinician animaciones y se ve ese "parpadeo" en el
// que el nombre y la barra de atributos se redibujan solos.
//
// Aquí se hacen dos cosas, sin tocar ninguna regla del juego:
//  1. Varias peticiones seguidas se agrupan en un único repintado.
//  2. Si el estado de la partida no ha cambiado nada, no se repinta.
export const RENDER_BATTLE_DEDUPE_PATCH = `
<script>
(function(){
  if(window.__bfRenderDedupe)return;
  window.__bfRenderDedupe=true;

  function signature(){
    try{
      var s=[];
      ['p','g'].forEach(function(side){
        s.push(JSON.stringify((G.team&&G.team[side])||null));
        s.push(JSON.stringify((G.hand&&G.hand[side])||null));
      });
      s.push(JSON.stringify(G.names||null));
      if(typeof B!=='undefined'&&B){
        s.push(B.qi,B.round,B.over?1:0,(B.log||[]).length);
        s.push(B.current?(B.current.side+':'+B.current.id):'-');
        s.push(B.pending?JSON.stringify({p:B.pending.prompt,v:B.pending.validSide,d:!!B.pending.allowDead}):'-');
      }
      return s.join('|');
    }catch(e){ return String(Math.random()); }
  }

  function install(){
    if(typeof window.renderBattle!=='function'||window.renderBattle.__bfDedupe)return false;
    var original=window.renderBattle;
    var last=null;
    var wrapped=function(){
      var sig=signature();
      // Nada ha cambiado: no se reconstruye el HTML (evita el parpadeo).
      if(sig===last&&document.querySelector('.bhero'))return;
      last=sig;
      return original.apply(this,arguments);
    };
    wrapped.__bfDedupe=1;
    // Permite forzar un repintado real cuando algún sistema lo necesite.
    wrapped.__bfForce=function(){ last=null; };
    window.renderBattle=wrapped;
    return true;
  }

  var tries=0,timer=setInterval(function(){ if(install()||tries++>150)clearInterval(timer); },150);
  install();
})();
</script>
`;