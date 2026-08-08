// Parche inyectado en el iframe: FIN DE PARTIDA — tres arreglos:
//
// 1) RED DE SEGURIDAD: si todos los héroes de un bando están muertos pero el
//    juego no ha terminado, se fuerza checkWin.
//
// 2) CINEMÁTICA FINAL (bfEndCinematic): crea un overlay a pantalla completa que
//    muestra ambos equipos — los ganadores con brillo dorado y los caídos en
//    gris con lápida 🪦. Es el remate visual épico de cada partida.
//
// 3) CINEMÁTICA DE MUERTE (bfKillCinematic): animación de muerte cuando un
//    héroe cae en batalla — humo oscuro, calavera y lápida.
export const END_GAME_FIX_PATCH = `
<style id="bf-end-game-fix">
/* ---- CINEMÁTICA FINAL: overlay a pantalla completa ---- */
#bf-end-cine {
  position: fixed; inset: 0; z-index: 100060; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 20px;
  background: radial-gradient(ellipse at 50% 40%, rgba(20,12,40,.82), rgba(4,2,10,.96));
  backdrop-filter: blur(6px); animation: bfCineFadeIn .5s ease;
  overflow: hidden;
}
@keyframes bfCineFadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Partículas de fondo (cenizas / almas) */
#bf-end-cine .bf-cine-bg {
  position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
}
#bf-end-cine .bf-cine-ember {
  position: absolute; width: 4px; height: 4px; border-radius: 50%;
  background: rgba(255,210,74,.6); box-shadow: 0 0 6px rgba(255,210,74,.5);
  animation: bfCineEmber linear infinite;
}
@keyframes bfCineEmber {
  0% { transform: translateY(100vh) scale(.5); opacity: 0; }
  10% { opacity: .8; }
  90% { opacity: .6; }
  100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
}

/* Título VICTORIA / DERROTA */
#bf-end-cine .bf-cine-title {
  position: relative; z-index: 2; font-family: 'Cinzel', serif; font-weight: 1000;
  font-size: clamp(36px, 9vw, 72px); letter-spacing: 3px; margin-bottom: 6px;
  animation: bfCineTitleIn .8s cubic-bezier(.2,.8,.3,1);
}
#bf-end-cine.bf-cine-win .bf-cine-title {
  color: #ffd24a; text-shadow: 0 0 30px rgba(255,210,74,.8), 0 4px 14px #000, 0 0 60px rgba(255,180,40,.5);
}
#bf-end-cine.bf-cine-lose .bf-cine-title {
  color: #c44; text-shadow: 0 0 30px rgba(200,60,60,.7), 0 4px 14px #000;
}
@keyframes bfCineTitleIn {
  0% { opacity: 0; transform: translateY(-30px) scale(.6); }
  60% { opacity: 1; transform: translateY(4px) scale(1.12); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
#bf-end-cine .bf-cine-sub {
  position: relative; z-index: 2; font-size: clamp(14px, 3vw, 20px); font-weight: 700;
  color: #cfc6dd; margin-bottom: 24px; text-shadow: 0 2px 6px #000;
  animation: bfCineFadeIn .8s ease .3s both;
}

/* Contenedor de los dos equipos */
#bf-end-cine .bf-cine-teams {
  position: relative; z-index: 2; display: flex; gap: clamp(16px, 5vw, 60px);
  align-items: flex-start; justify-content: center; flex-wrap: wrap;
  max-width: 900px; width: 100%;
}
#bf-end-cine .bf-cine-team {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
#bf-end-cine .bf-cine-team-label {
  font-family: 'Cinzel', serif; font-weight: 1000; font-size: clamp(12px, 2.5vw, 16px);
  letter-spacing: 2px; text-transform: uppercase; padding: 4px 16px; border-radius: 999px;
  text-shadow: 0 2px 4px #000; animation: bfCineFadeIn .6s ease .5s both;
}
#bf-end-cine .bf-cine-team-winner .bf-cine-team-label {
  color: #3a2600; background: linear-gradient(180deg, #ffe27a, #FFD24A 55%, #c8901f);
  box-shadow: 0 4px 14px rgba(255,210,74,.5);
}
#bf-end-cine .bf-cine-team-loser .bf-cine-team-label {
  color: #cfc6dd; background: rgba(30,20,50,.7); border: 1px solid rgba(120,100,150,.4);
}

/* Retrato de héroe en la cinemática */
#bf-end-cine .bf-cine-portrait {
  position: relative; width: clamp(80px, 22vw, 130px); aspect-ratio: 3/4;
  border-radius: 14px; overflow: hidden; border: 2.5px solid;
  background-size: cover; background-position: center 18%; background-color: #0a0710;
  animation: bfCinePortIn .6s cubic-bezier(.2,.8,.3,1) both;
  animation-delay: calc(var(--bf-delay, 0s));
}
@keyframes bfCinePortIn {
  0% { opacity: 0; transform: translateY(24px) scale(.7); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Héroe VIVO (ganador): brillo dorado, vibrante */
#bf-end-cine .bf-cine-team-winner .bf-cine-portrait {
  border-color: #ffd24a;
  box-shadow: 0 8px 24px rgba(0,0,0,.6), 0 0 20px rgba(255,210,74,.4), inset 0 0 0 1px rgba(255,240,180,.3);
  animation: bfCinePortIn .6s cubic-bezier(.2,.8,.3,1) both, bfCineWinnerGlow 2.4s ease-in-out infinite calc(var(--bf-delay, 0s) + .6s);
}
#bf-end-cine .bf-cine-team-winner .bf-cine-portrait::after {
  content: ''; position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,210,74,.08) 0%, transparent 30%, transparent 60%, rgba(0,0,0,.3) 100%);
}
@keyframes bfCineWinnerGlow {
  0%, 100% { box-shadow: 0 8px 24px rgba(0,0,0,.6), 0 0 16px rgba(255,210,74,.35), inset 0 0 0 1px rgba(255,240,180,.3); }
  50% { box-shadow: 0 8px 24px rgba(0,0,0,.6), 0 0 32px rgba(255,210,74,.7), 0 0 50px rgba(255,180,40,.4), inset 0 0 0 1px rgba(255,245,200,.5); }
}

/* Héroe CAÍDO (perdedor): grayscale + velo oscuro + lápida */
#bf-end-cine .bf-cine-fallen .bf-cine-portrait,
#bf-end-cine .bf-cine-fallen .bf-cine-portrait img {
  filter: grayscale(.9) brightness(.4) contrast(1.1) !important;
}
#bf-end-cine .bf-cine-fallen .bf-cine-portrait {
  border-color: #5a4a72 !important;
  box-shadow: 0 8px 20px rgba(0,0,0,.85), inset 0 0 30px rgba(0,0,0,.7) !important;
  opacity: .88 !important;
}
#bf-end-cine .bf-cine-fallen .bf-cine-portrait::after {
  content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: linear-gradient(180deg, rgba(20,10,30,.5), rgba(0,0,0,.65));
  border-radius: inherit;
}
/* Lápida sobre el retrato caído */
#bf-end-cine .bf-cine-fallen .bf-cine-portrait::before {
  content: "🪦"; position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
  z-index: 3; font-size: clamp(26px, 5vw, 42px); line-height: 1;
  filter: drop-shadow(0 3px 6px #000) drop-shadow(0 0 10px rgba(120,100,150,.6)) !important;
  animation: bfTombAppear .6s ease-out calc(.8s + var(--bf-delay)) both;
}
@keyframes bfTombAppear {
  0% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(.5); }
  60% { opacity: 1; transform: translateX(-50%) translateY(4px) scale(1.1); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

/* Nombre del héroe */
#bf-end-cine .bf-cine-name {
  font-family: 'Cinzel', serif; font-weight: 900; font-size: clamp(11px, 2.2vw, 15px);
  text-align: center; padding: 3px 10px; border-radius: 8px; max-width: 140px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  text-shadow: 0 2px 4px #000; animation: bfCineFadeIn .5s ease calc(var(--bf-delay, 0s) + .3s) both;
}
#bf-end-cine .bf-cine-team-winner .bf-cine-name {
  color: #fff5dc; background: rgba(10,6,18,.7); border: 1px solid rgba(255,210,74,.3);
}
#bf-end-cine .bf-cine-fallen .bf-cine-name {
  color: #9a8ba8 !important; border-color: rgba(90,74,114,.5) !important;
  background: rgba(10,6,18,.85) !important;
}

/* Niebla oscura bajo los caídos */
#bf-end-cine .bf-cine-team-loser::after {
  content: ""; position: absolute; inset: -20px -40px; z-index: -1; pointer-events: none;
  background: radial-gradient(ellipse at 50% 60%, rgba(60,30,80,.3), transparent 70%);
  filter: blur(20px);
}

/* ---- CINEMÁTICA DE MUERTE en batalla (bfKillCinematic) ---- */
.bf-kill-fx {
  position: absolute; inset: 0; z-index: 8; pointer-events: none; border-radius: inherit; overflow: hidden;
  animation: bfKillFade 1.6s ease-out forwards;
}
.bf-kill-fx .bf-kill-smoke {
  position: absolute; left: 0; right: 0; bottom: -20px; height: 120px;
  background: radial-gradient(circle at 45% 70%, rgba(15,15,18,.9), rgba(90,38,120,.4) 38%, transparent 72%);
  animation: bfKillSmoke 1.4s ease-out forwards;
}
.bf-kill-fx .bf-kill-skull {
  position: absolute; left: 50%; top: 38%; transform: translate(-50%,-50%);
  font-size: 48px; filter: drop-shadow(0 0 15px #000);
  animation: bfKillSkull 1.1s ease-out forwards;
}
.bf-kill-fx .bf-kill-grave {
  position: absolute; left: 50%; top: 46%; transform: translate(-50%,-50%);
  font-size: 52px; filter: drop-shadow(0 4px 8px #000);
  animation: bfKillGrave 1.3s cubic-bezier(.2,.8,.3,1) forwards;
  animation-delay: .3s; opacity: 0;
}
.bf-kill-fx .bf-kill-rip {
  position: absolute; left: 50%; top: 30%; transform: translate(-50%,-50%);
  font-family: 'Cinzel', serif; font-weight: 1000; font-size: 22px; color: #cbb9ee;
  text-shadow: 0 0 12px rgba(120,100,150,.8), 0 3px 6px #000; letter-spacing: 2px;
  animation: bfKillRip 1.2s ease-out forwards; animation-delay: .5s; opacity: 0;
}
@keyframes bfKillFade { 0% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; } }
@keyframes bfKillSmoke { 0% { opacity: 0; transform: translateY(22px) scale(.8); } 35% { opacity: 1; } 100% { opacity: 0; transform: translateY(-18px) scale(1.22); } }
@keyframes bfKillSkull { 0% { opacity: 0; transform: translate(-50%,-18%) scale(.7); } 25% { opacity: 1; transform: translate(-50%,-50%) scale(1.1); } 100% { opacity: 0; transform: translate(-50%,-112%) scale(.9); } }
@keyframes bfKillGrave { 0% { opacity: 0; transform: translate(-50%,10%) scale(.5) rotate(-8deg); } 40% { opacity: 1; transform: translate(-50%,-50%) scale(1.15) rotate(4deg); } 70% { transform: translate(-50%,-50%) scale(1) rotate(0); } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
@keyframes bfKillRip { 0% { opacity: 0; transform: translate(-50%,-20%) scale(.6); } 40% { opacity: 1; transform: translate(-50%,-50%) scale(1.1); } 100% { opacity: 0; transform: translate(-50%,-80%) scale(.9); } }

/* Refuerzo del grayscale en batalla (el anti-parpadeo lo anula en móvil) */
.bhero.bf-truedead {
  filter: grayscale(.85) brightness(.5) !important;
  opacity: .85 !important;
}
.bhero.bf-truedead .bf-battle-art {
  filter: grayscale(1) brightness(.45) !important;
}
.bhero.bf-truedead::after {
  content: "🪦"; position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  z-index: 12; font-size: clamp(20px, 4vw, 32px); line-height: 1;
  filter: drop-shadow(0 3px 6px #000) drop-shadow(0 0 10px rgba(120,100,150,.6)) !important;
  pointer-events: none;
  animation: bfTombAppear .5s ease-out;
}
</style>
<script>
(function(){
  if(window.__bfEndGameFix) return;
  window.__bfEndGameFix = true;

  // ---- 1) RED DE SEGURIDAD: fuerza el fin de partida si un bando está extinto ----
  setInterval(function(){
    try {
      if(typeof G === 'undefined' || !G || G.demo) return;
      if(typeof B === 'undefined' || !B || B.over) return;
      var battle = document.getElementById('s-battle');
      if(!battle || !battle.classList.contains('active')) return;
      if(!G.team || !G.team.p || !G.team.o) return;
      var pAlive = (G.team.p || []).filter(function(h){ return h && h.alive && !h._bfDuck; }).length;
      var oAlive = (G.team.o || []).filter(function(h){ return h && h.alive && !h._bfDuck; }).length;
      if(pAlive === 0 || oAlive === 0) {
        if(typeof checkWin === 'function') checkWin();
        else if(typeof window.checkWin === 'function') window.checkWin();
      }
    } catch(e) {}
  }, 500);

  // ---- 2) CINEMÁTICA DE MUERTE en batalla ----
  // Animación que se reproduce sobre la carta del héroe cuando cae en combate.
  window.bfKillCinematic = function(card) {
    if(!card || !card.isConnected) return;
    // Evita duplicar el FX si ya tiene uno
    var existing = card.querySelector('.bf-kill-fx');
    if(existing) existing.remove();
    var fx = document.createElement('div');
    fx.className = 'bf-kill-fx';
    fx.innerHTML =
      '<div class="bf-kill-smoke"></div>' +
      '<div class="bf-kill-skull">💀</div>' +
      '<div class="bf-kill-grave">🪦</div>' +
      '<div class="bf-kill-rip">R.I.P.</div>';
    card.appendChild(fx);
    setTimeout(function() { if(fx.parentNode) fx.parentNode.removeChild(fx); }, 1700);
  };

  // ---- 3) CINEMÁTICA FINAL de fin de partida ----
  // Crea un overlay a pantalla completa mostrando ambos equipos: los ganadores
  // con brillo dorado y los caídos en gris con lápida.
  window.bfEndCinematic = function(youWin) {
    // Evita duplicar la cinemática si ya existe
    var existing = document.getElementById('bf-end-cine');
    if(existing) existing.remove();

    try {
      if(typeof G === 'undefined' || !G || !G.team) return;

      // Determina qué bando ganó y cuál perdió
      var pAlive = (G.team.p || []).filter(function(h){ return h && h.alive; }).length;
      var oAlive = (G.team.o || []).filter(function(h){ return h && h.alive; }).length;
      // Si youWin es true, el jugador ganó. En modo IA/local el jugador es 'p'.
      // Si todos los héroes de un bando están muertos, ese bando perdió.
      var winnerSide = pAlive > 0 && oAlive === 0 ? 'p' : (oAlive > 0 && pAlive === 0 ? 'o' : (youWin ? 'p' : 'o'));
      var loserSide = winnerSide === 'p' ? 'o' : 'p';

      // Construye las filas de héroes
      function buildTeam(side, isWinner) {
        var team = (G.team[side] || []).filter(function(h){ return h && !h._bfDuck; });
        if(!team.length) return '';
        var label = isWinner
          ? (typeof L === 'function' ? L('Vencedores', 'Winners') : 'Vencedores')
          : (typeof L === 'function' ? L('Caídos', 'Fallen') : 'Caídos');
        var cls = isWinner ? 'bf-cine-team-winner' : 'bf-cine-team-loser';
        var heroes = team.map(function(hh, j) {
          var aid = (hh && hh._token) ? hh._token : (hh && hh.id);
          var u = '';
          if(typeof ART_BY_ID !== 'undefined' && aid) u = ART_BY_ID[aid] || '';
          if(!u && typeof ART_BY_NAME !== 'undefined' && hh && hh.name) u = ART_BY_NAME[hh.name] || '';
          if(!u && typeof ELITE_BY_ID !== 'undefined' && aid) u = ELITE_BY_ID[aid] || '';
          var fall = !hh.alive;
          var dl = (j * 0.12) + 's';
          var pc = fall ? 'bf-cine-fallen' : '';
          var nm = (hh && hh.name) ? hh.name : 'Héroe';
          var el = (hh && (hh.eliteMode || hh._bfElite)) ? ' ★' : '';
          return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px">' +
            '<div class="bf-cine-portrait ' + pc + '" style="background-image:url(\\'' + u + '\\');--bf-delay:' + dl + '"></div>' +
            '<div class="bf-cine-name" style="--bf-delay:' + dl + '">' + nm + el + '</div>' +
          '</div>';
        }).join('');
        return '<div class="bf-cine-team ' + cls + '">' +
          '<span class="bf-cine-team-label">' + label + '</span>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' + heroes + '</div>' +
        '</div>';
      }

      var winTeam = buildTeam(winnerSide, true);
      var loseTeam = buildTeam(loserSide, false);

      // Título según resultado
      var isWin = youWin;
      var title = isWin
        ? (typeof L === 'function' ? L('¡VICTORIA!', 'VICTORY!') : '¡VICTORIA!')
        : (typeof L === 'function' ? L('DERROTA', 'DEFEAT') : 'DERROTA');
      var sub = isWin
        ? (typeof L === 'function' ? L('Tus héroes prevalecen', 'Your heroes prevail') : 'Tus héroes prevalecen')
        : (typeof L === 'function' ? L('Tus héroes han caído', 'Your heroes have fallen') : 'Tus héroes han caído');

      // Partículas de fondo
      var embers = '';
      for(var i = 0; i < 18; i++) {
        var left = Math.random() * 100;
        var dur = 4 + Math.random() * 4;
        var delay = Math.random() * 4;
        var size = 3 + Math.random() * 4;
        embers += '<div class="bf-cine-ember" style="left:' + left + '%;width:' + size + 'px;height:' + size + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's"></div>';
      }

      var overlay = document.createElement('div');
      overlay.id = 'bf-end-cine';
      overlay.className = isWin ? 'bf-cine-win' : 'bf-cine-lose';
      overlay.innerHTML =
        '<div class="bf-cine-bg">' + embers + '</div>' +
        '<div class="bf-cine-title">' + title + '</div>' +
        '<div class="bf-cine-sub">' + sub + '</div>' +
        '<div class="bf-cine-teams">' + winTeam + loseTeam + '</div>';

      document.body.appendChild(overlay);

      // Auto-elimina tras 5 segundos (el resultado del juego se muestra debajo)
      setTimeout(function() {
        if(overlay.parentNode) {
          overlay.style.transition = 'opacity .6s ease';
          overlay.style.opacity = '0';
          setTimeout(function() { if(overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 600);
        }
      }, 5000);
    } catch(e) {}
  };

  // ---- Reinyecta el CSS si el anti-parpadeo lo anula ----
  setInterval(function(){
    var s = document.getElementById('bf-end-game-fix');
    if(!s) return;
    var anti = document.getElementById('bf-antiflicker');
    if(anti && anti.parentNode === s.parentNode && anti.previousSibling === s) {
      document.head.appendChild(s);
    }
  }, 1000);
})();
</script>
`;