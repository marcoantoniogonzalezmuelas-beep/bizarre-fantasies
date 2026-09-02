// La cinemática de GOLPE MORTAL nunca debe solaparse: siempre va DESPUÉS de
// que hayan terminado la cinemática 3D de la habilidad / hechizo / objeto, los
// efectos visuales del golpe y el marcador de daño.
//
// El juego la lanzaba a los 80 ms del evento de muerte, encima de todo lo
// anterior. Aquí se envuelve bfKillCinematic: si hay algo en pantalla, espera a
// que la escena quede limpia (con un tope de seguridad) y entonces la lanza.
export const KILL_CINE_QUEUE_PATCH = `
<script>
(function(){
  if(window.__bfKillCineQueue) return;
  window.__bfKillCineQueue = true;

  // Última vez que se ha VISTO una cinemática de acción en pantalla. Sirve para
  // saber si la habilidad que causó la muerte llegó ya a reproducirse o si su
  // cinemática todavía está por salir.
  var lastCineSeen = 0;
  setInterval(function(){
    try{ if(document.querySelector('#bf-abil-anim,#bf-spec-cine')) lastCineSeen = Date.now(); }catch(e){}
  }, 120);

  // ¿Hay algo reproduciéndose ahora mismo?
  function busy(){
    try{
      // Cola de cinemáticas 3D (habilidad/hechizo EN CURSO o ENCOLADA): si la
      // animación que genera la muerte aún no ha salido o está encolada, el
      // golpe mortal la espera. Sin esto, el remate veía la escena "limpia"
      // (la cinemática aún no estaba en pantalla, solo encolada) y se
      // adelantaba, solapándose con ella cuando por fin salía.
      if(typeof window.__bfCinematicBusy === 'function' && window.__bfCinematicBusy()) return true;
      // GRACIA: la acción que mata (habilidad/hechizo/objeto, registrada en
      // __bfActionCtx por killActorPatch) puede NO tener su cinemática en
      // pantalla todavía, ni siquiera encolada. Si la acción es reciente y
      // desde entonces no se ha visto NINGUNA cinemática, se considera ocupado:
      // PRIMERO la animación de la habilidad del atacante, DESPUÉS sus efectos
      // y el número de daño, y SOLO AL FINAL el golpe mortal.
      var ctx = window.__bfActionCtx;
      if(ctx && ctx.ts && (Date.now() - ctx.ts) < 2500 && lastCineSeen < ctx.ts) return true;
      // Cinemáticas a pantalla completa (habilidad 3D, carta especial, otro remate).
      if(document.querySelector('#bf-abil-anim,#bf-spec-cine,#bf-kill-ov')) return true;
      if(document.body.classList.contains('bf-cine-active')) return true;
      // Efectos visuales del golpe (tajos, ondas, escudos, proyectiles…).
      var fx = document.getElementById('bf-fx-layer');
      if(fx && fx.children.length) return true;
      if(document.querySelector('.bf-combat-fx,.bf-fx-projectile,.bf-fx-magic-orb,.bf-cast-flash,.bf-cast-runes')) return true;
      // Números de daño en cola: se están esperando a que acabe una cinemática,
      // así que el golpe mortal NO puede adelantarse a ellos.
      if(window.__bfDmgPending > 0) return true;
      // Marcadores de daño / curación / estado flotantes.
      if(document.querySelector('.bf-dmg-pop,.bf-heal-pop,.bf-absorb-pop,.bf-stat-pop,.bf-status-pop,.bf-loss-pop,.bf-fx-float')) return true;
    }catch(e){}
    return false;
  }

  function install(){
    var orig = window.bfKillCinematic;
    if(typeof orig !== 'function' || orig.__bfQueued) return false;
    var pending = [];
    var wrapped = function(card){
      if(!card || pending.indexOf(card) !== -1) return;
      pending.push(card);
      var waited = 0;
      // Margen inicial: el marcador de daño se pinta unas décimas DESPUÉS del
      // evento de muerte. Sin esta espera, la escena parecía limpia y el remate
      // se adelantaba al marcador.
      setTimeout(function(){ wait(); }, 900);
      function wait(){
        // Tope de seguridad: no se queda esperando para siempre.
        if(busy() && waited < 9000){ waited += 200; setTimeout(wait, 200); return; }
        // Pequeño margen para que el último fotograma del efecto anterior
        // termine de desaparecer antes de entrar el remate.
        setTimeout(function(){
          // Reintento: si en ese margen ha aparecido el número de daño (se pinta
          // unas décimas después), se vuelve a esperar en vez de solaparse.
          if(busy() && waited < 9000){ waited += 200; setTimeout(wait, 200); return; }
          var i = pending.indexOf(card); if(i !== -1) pending.splice(i, 1);
          try { orig(card); } catch(e){}
        }, 260);
      }
    };
    wrapped.__bfQueued = 1;
    window.bfKillCinematic = wrapped;
    return true;
  }

  var tries = 0, t = setInterval(function(){ if(install() || tries++ > 200) clearInterval(t); }, 150);
  install();
})();
</script>
`;
