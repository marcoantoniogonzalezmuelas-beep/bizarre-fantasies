// GUARDIÁN ANTI-ENCALLE de la batalla.
//
// Síntoma que arregla: al invocar criaturas (los Patitos de Goma de KillerDucks,
// la Grulla de Daidoji…) el equipo pasa de 3 a 5 cartas y, si el repintado del
// tablero falla en ese momento, la cadena de turnos del motor se corta:
// `endTurn()` ya había apagado su vigilante y nadie vuelve a llamar a
// `stepTurn()`, así que la partida se queda congelada para siempre.
//
// Dos garantías, sin tocar ninguna regla del juego:
//  1) Repintar el tablero nunca puede romper la cadena de turnos: si
//     `renderBattle()` lanza un error, se ignora y el turno sigue avanzando.
//  2) Guardián de continuidad: si el turno de la IA (o un turno sin dueño) se
//     queda quieto más de 12 s sin cinemática en pantalla y sin objetivo
//     pendiente, se reanuda la partida. Los turnos del jugador NUNCA se fuerzan.
export const STALL_GUARD_PATCH = `
<script>
(function(){
  if(window.__bfStallGuard) return;
  window.__bfStallGuard = true;

  // 1) El repintado no puede cortar la cadena de turnos.
  var n0 = 0, iv0 = setInterval(function(){
    if(typeof window.renderBattle === 'function' && !window.renderBattle.__bfSafe){
      var orig = window.renderBattle;
      var w = function(){ try{ return orig.apply(this, arguments); }catch(e){ return null; } };
      w.__bfSafe = 1;
      window.renderBattle = w;
      clearInterval(iv0);
    }
    if(++n0 > 300) clearInterval(iv0);
  }, 200);

  // 2) Guardián de continuidad.
  var STALL_MS = 12000;
  var lastSig = '', lastAt = Date.now();

  function sig(){
    try{
      var t = (G.team.p || []).concat(G.team.o || []);
      return [B.round, B.qi, B.current ? (B.current.side + B.current.id) : '-', t.length,
              t.filter(function(h){ return h && h.alive; }).length,
              window.__bfLogSeq || 0].join('|');
    }catch(e){ return 'x'; }
  }

  function busy(){
    if(document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov')) return true;
    try{ if(B && B.pending) return true; }catch(e){}
    try{ if(document.getElementById('modalRoot') && document.getElementById('modalRoot').children.length) return true; }catch(e){}
    return false;
  }

  function tick(){
    var scr = document.getElementById('s-battle');
    if(!scr || !scr.classList.contains('active')) { lastAt = Date.now(); return; }
    if(typeof B === 'undefined' || !B || B.over) { lastAt = Date.now(); return; }
    try{ if(typeof NET !== 'undefined' && NET && NET.role === 'client') { lastAt = Date.now(); return; } }catch(e){}

    var s = sig();
    if(s !== lastSig){ lastSig = s; lastAt = Date.now(); return; }
    if(busy()){ lastAt = Date.now(); return; }
    if(Date.now() - lastAt < STALL_MS) return;

    // Turno del jugador: se espera lo que haga falta, nunca se fuerza.
    try{
      if(B.current && typeof humanCtl === 'function' && humanCtl(B.current.side)) { lastAt = Date.now(); return; }
    }catch(e){}

    lastAt = Date.now();
    try{ if(typeof pushLog === 'function') pushLog('li', '\\u{1F6E1}\\uFE0F La partida se hab\\u00eda quedado esperando: se reanuda el turno.'); }catch(e){}
    try{
      if(B.current && typeof window.endTurn === 'function') window.endTurn();
      else if(typeof window.stepTurn === 'function') window.stepTurn();
    }catch(e){}
  }

  setInterval(tick, 1000);
})();
</script>
`;