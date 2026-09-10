// Parche inyectado en el iframe: HÉROE MUERTO NO ACTÚA.
//
// Si un héroe muere durante su propio turno (p.ej. por la pasiva de Doji
// Conpuri que mata al atacante), el juego no comprobaba si seguía vivo y le
// dejaba ejecutar acciones (lanzar hechizos, usar objetos, atacar).
//
// Este parche:
// 1) Envuelve castSpell / useItem / useAbility: si el héroe activo está
//    muerto, bloquea la acción y pasa su turno al siguiente.
// 2) Auto-skip periódico: si el héroe actual muere durante su turno (por una
//    pasiva rival), se pasa el turno automáticamente sin esperar a que el
//    jugador pulse nada.
//
// Preparado para una futura habilidad "Último Suspiro": si el héroe tiene
// h._bfLastBreath = true, se le permite actuar una vez aunque esté muerto.
export const DEAD_HERO_SKIP_PATCH = `
<script>
(function(){
  if(window.__bfDeadHeroSkip) return;
  window.__bfDeadHeroSkip = true;

  function curHero(){
    try {
      if(typeof B === 'undefined' || !B || !B.current || B.over) return null;
      if(typeof getHero !== 'function') return null;
      return getHero(B.current.side, B.current.id);
    } catch(e) { return null; }
  }

  function isDead(h){
    return h && !h.alive && !h._bfLastBreath;
  }

  function skipDead(name){
    try {
      if(typeof pushLog === 'function') pushLog('ld', '💀 ' + (name || 'El héroe') + ' está caído: se pasa su turno.');
      if(typeof endTurn === 'function') endTurn();
      else if(typeof finishAct === 'function') finishAct();
    } catch(e){}
  }

  // Envuelve las funciones de acción para bloquear héroes muertos.
  function wrapActions(){
    if(typeof window.castSpell === 'function' && !window.castSpell.__bfDeadCheck){
      var origCast = window.castSpell;
      window.castSpell = function(id){
        var h = curHero();
        if(isDead(h)){ if(typeof notif === 'function') notif(h.name + ' está caído y no puede actuar.'); skipDead(h ? h.name : ''); return; }
        return origCast.apply(this, arguments);
      };
      window.castSpell.__bfDeadCheck = 1;
    }
    if(typeof window.useItem === 'function' && !window.useItem.__bfDeadCheck){
      var origItem = window.useItem;
      window.useItem = function(idx){
        var h = curHero();
        if(isDead(h)){ if(typeof notif === 'function') notif(h.name + ' está caído y no puede actuar.'); skipDead(h ? h.name : ''); return; }
        return origItem.apply(this, arguments);
      };
      window.useItem.__bfDeadCheck = 1;
    }
    if(typeof window.useAbility === 'function' && !window.useAbility.__bfDeadCheck){
      var origAbil = window.useAbility;
      window.useAbility = function(side, hero, done){
        var h = hero || curHero();
        if(isDead(h)){ if(typeof notif === 'function') notif((h ? h.name : 'El héroe') + ' está caído y no puede actuar.'); skipDead(h ? h.name : ''); return; }
        return origAbil.apply(this, arguments);
      };
      window.useAbility.__bfDeadCheck = 1;
    }
    // Ataque: el juego usa doAttack / attack. Se envuelven ambos si existen.
    ['doAttack','attack'].forEach(function(fn){
      if(typeof window[fn] === 'function' && !window[fn].__bfDeadCheck){
        var orig = window[fn];
        window[fn] = function(){
          var h = curHero();
          if(isDead(h)){ if(typeof notif === 'function') notif(h.name + ' está caído y no puede actuar.'); skipDead(h ? h.name : ''); return; }
          return orig.apply(this, arguments);
        };
        window[fn].__bfDeadCheck = 1;
      }
    });
  }

  // Auto-skip periódico: si el héroe actual muere durante su turno, se pasa.
  var skipCd = 0;
  function autoSkip(){
    try {
      var battle = document.getElementById('s-battle');
      if(!battle || !battle.classList.contains('active')) return;
      if(typeof B === 'undefined' || !B || !B.current || B.over || B.pending) return;
      if(document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov')) return;
      var h = curHero();
      if(!isDead(h)) return;
      var now = Date.now();
      if(now - skipCd < 800) return;
      skipCd = now;
      skipDead(h.name);
    } catch(e){}
  }

  var tries = 0, iv = setInterval(function(){
    wrapActions();
    autoSkip();
    if(tries++ > 200) clearInterval(iv);
  }, 200);
  setInterval(autoSkip, 300);
})();
</script>
`;