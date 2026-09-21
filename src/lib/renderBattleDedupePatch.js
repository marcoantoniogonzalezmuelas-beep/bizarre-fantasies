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
      // The engine uses p/o; g exists only in the relay protocol.
      ['p','o'].forEach(function(side){
        s.push(JSON.stringify((G.team&&G.team[side])||null));
        s.push(JSON.stringify((G.spellbook&&G.spellbook[side])||null));
        s.push(JSON.stringify((G.items&&G.items[side])||null));
      });
      s.push(G.demo, G.oppHuman, G.online);
      if(typeof NET!=='undefined')s.push(NET.role,NET.mySide);
      s.push(JSON.stringify(G.names||null));
      if(typeof B!=='undefined'&&B){
        s.push(B.qi,B.round,B.over?1:0,JSON.stringify(B.log||[]));
        s.push(B.current?(B.current.side+':'+B.current.id):'-');
        s.push(B.pending?JSON.stringify(B.pending):'-');
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
      // An existing portrait is NOT proof that the current action panel rendered.
      var needsMenu = typeof B!=='undefined' && B && !B.over && B.current && !B.pending
        && typeof humanCtl==='function' && humanCtl(B.current.side);
      var complete = document.querySelector('#s-battle .bhero') &&
        (!needsMenu || document.querySelector('#s-battle .active-hero-panel .jrpg-menu'));
      if(sig===last && complete)return;
      var result = original.apply(this,arguments);
      last=sig;
      return result;
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