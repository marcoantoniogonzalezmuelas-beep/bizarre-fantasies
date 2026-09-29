// SINCRONIZACIÓN DEL FIN DE PARTIDA (multiplayer).
//
// Cuando la partida termina en un cliente, se avisa al otro jugador con un
// mensaje de red propio ('bfEndSync') para que los dos vean su pantalla final.
// Solo actúa con la pantalla de BATALLA activa: nunca durante subastas ni
// equipamiento (ahí no hay resultado que mostrar).
export const END_GAME_SYNC_PATCH = `
<script>
(function(){
  if(window.__bfEndSync) return;
  window.__bfEndSync = true;

  function inBattle(){
    var s = document.getElementById('s-battle');
    return !!(s && s.classList.contains('active'));
  }
  function resultShown(){
    var r = document.getElementById('s-result');
    return !!(r && r.classList.contains('active'));
  }
  function mySide(){
    try{ if(typeof NET!=='undefined'&&NET&&NET.role) return NET.mySide||(NET.role==='client'?'o':'p'); }catch(e){}
    return 'p';
  }

  // Avisa al rival en cuanto este cliente muestra su pantalla final.
  function hookShowResult(){
    if(typeof window.showResult !== 'function' || window.showResult.__bfEndSync) return false;
    var orig = window.showResult;
    window.showResult = function(youWin){
      try{
        if(typeof netSend === 'function' && !window.__bfEndSyncGot && (!G.bfMission || (typeof NET !== 'undefined' && NET.role === 'host'))){
          // pWin: victoria del anfitrión (lado 'p'), independiente de quién avisa.
          var pWin = G._result && typeof G._result.pWin === 'boolean' ? G._result.pWin : (youWin === (mySide() === 'p'));
          netSend({ t: 'bfEndSync', pWin: pWin, bfMissionRun: G.bfMission && G.bfMission.run_id, fb: window.__bfFinalBlow || null });
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    window.showResult.__bfEndSync = 1;
    return true;
  }

  // Recibe el aviso del rival y muestra la pantalla final correcta.
  function handle(msg){
    if(msg && msg.t === 'bfEndSyncAck'){ if(msg.bfMissionRun) window.__bfEndSyncAcked = msg.bfMissionRun; return; }
    if(!msg || msg.t !== 'bfEndSync') return;
    // El golpe mortal solo se calcula en el anfitrión: el invitado lo recibe aquí
    // para mostrar la misma acción definitiva antes de la animación final.
    if(msg.fb && msg.fb.actorName && !(typeof NET !== 'undefined' && NET.role === 'host')) window.__bfFinalBlow = msg.fb;
    // Reenvíos del anfitrión: si ya se aplicó este resultado, solo se confirma.
    if(msg.bfMissionRun && window.__bfEndSyncApplied === msg.bfMissionRun && typeof NET !== 'undefined' && NET.role === 'client' && resultShown() && G._result && G._result.pWin === !!msg.pWin){
      try{ NET.conn.send({t:'bfEndSyncAck',bfMissionRun:msg.bfMissionRun}); }catch(e){}
      return;
    }
    // Solo actúa en batalla o en la propia pantalla de resultado (para
    // corregir el vídeo si el cliente ya transicionó con un resultado local
    // equivocado). Nunca durante subastas ni equipamiento.
    var authoritative = !!(msg.bfMissionRun && typeof G !== 'undefined' && G.bfMission && G.bfMission.run_id === msg.bfMissionRun && typeof NET !== 'undefined' && NET.role === 'client');
    if(!inBattle() && !resultShown()){
      // Resultado autorizado del anfitrión: también se aplica si el invitado está
      // en una pantalla intermedia (cinemática, transición), salvo preparación.
      var act = document.querySelector('.screen.active');
      var prep = !act || /^s-(equip|auction|recruit|setup)$/.test(act.id);
      if(!authoritative || prep || !G._gameOver && !(G.team && G.team.p)) return;
    }
    if(msg.bfMissionRun && !authoritative) return;
    // SAFETY: no procesar bfEndSync si ambos bandos siguen teniendo héroes
    // vivos. Previene finales falsos por mensajes bfEndSync erróneos o
    // duplicados (p. ej. cuando team.o no tiene el flag 'alive' puesto aún).
    if(!authoritative && inBattle() && typeof G !== 'undefined' && G && G.team && G.team.p && G.team.o){
      var pA = (G.team.p || []).filter(function(h){ return h && h.alive !== false && !h._bfDuck; }).length;
      var oA = (G.team.o || []).filter(function(h){ return h && h.alive !== false && !h._bfDuck; }).length;
      if(pA > 0 && oA > 0) return;
    }
    if(authoritative && resultShown() && G._result && G._result.pWin === !!msg.pWin && document.getElementById('bf-end-cine')) return;
    window.__bfEndSyncGot = true;
    if(authoritative){
      window.__bfEndSyncApplied = msg.bfMissionRun;
      try{ NET.conn.send({t:'bfEndSyncAck',bfMissionRun:msg.bfMissionRun}); }catch(e){}
    }
    try{
      if(typeof G !== 'undefined' && G) { G._result = { pWin: !!msg.pWin }; if(authoritative) G._gameOver = true; }
      if(authoritative && typeof B !== 'undefined' && B) B.over = true;
      ['bf-abil-anim','bf-kill-ov','bf-spec-cine','bf-target-pick'].forEach(function(id){
        var el = document.getElementById(id);
        if(el && el.parentNode) el.parentNode.removeChild(el);
      });
      // Si la pantalla de resultado YA está activa, no la relanzamos: solo
      // actualizamos G._result (arriba) y reseteamos el guardián de la
      // cinemática para que bfEndCinematic relea el resultado correcto en
      // su próximo ciclo de 400ms y muestre el vídeo adecuado (victoria
      // o derrota) aunque ya hubiera proyectado el equivocado.
      if(resultShown()){
        window.__bfEndCine = 0;
        var oldCine = document.getElementById('bf-end-cine');
        if(oldCine && oldCine.parentNode) oldCine.parentNode.removeChild(oldCine);
        return;
      }
      var youWin = (!!msg.pWin === (mySide() === 'p'));
      if(typeof showResult === 'function') showResult(youWin);
      else if(typeof show === 'function') show('s-result');
    }catch(e){}
    setTimeout(function(){ window.__bfEndSyncGot = false; }, 4000);
  }

  // Escucha los datos de red del juego sin romper su propio manejador.
  function hookNetRecv(){
    if(typeof window.netOnData !== 'function' || window.netOnData.__bfEndSync) return false;
    var orig = window.netOnData;
    window.netOnData = function(msg){
      try{ handle(msg); }catch(e){}
      return orig.apply(this, arguments);
    };
    window.netOnData.__bfEndSync = 1;
    return true;
  }

  var observedConn = null, sentRun = '', sentCount = 0, lastSent = 0;
  setInterval(function(){
    hookShowResult(); hookNetRecv();
    try{
      if(typeof NET === 'undefined' || !NET || !NET.conn || !NET.conn.open) return;
      if(observedConn !== NET.conn){
        observedConn = NET.conn;
        observedConn.on('data', handle);
      }
      // Nueva ronda (revancha con el mismo run_id): se reinicia el estado de envío/confirmación.
      if(!G._gameOver && !resultShown()){ window.__bfEndSyncAcked = null; window.__bfEndSyncApplied = null; sentRun = ''; sentCount = 0; }
      // El anfitrión reenvía el resultado cada ~1,4 s hasta que el invitado lo confirma.
      if(NET.role === 'host' && G.bfMission && G.bfMission.modality && G._gameOver && G._result && typeof G._result.pWin === 'boolean' && window.__bfEndSyncAcked !== G.bfMission.run_id){
        if(sentRun !== G.bfMission.run_id){ sentRun = G.bfMission.run_id; sentCount = 0; }
        if(sentCount < 30 && Date.now() - lastSent > 1400){
          lastSent = Date.now(); sentCount++;
          NET.conn.send({t:'bfEndSync',pWin:G._result.pWin,bfMissionRun:sentRun,fb:window.__bfFinalBlow||null});
        }
      }
    }catch(e){}
  }, 350);
})();
</script>
`;