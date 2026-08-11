// Parche inyectado en el iframe: FIN DE PARTIDA — tres arreglos:
//
// 1) RED DE SEGURIDAD: si todos los héroes de un bando están muertos pero el
//    juego no ha terminado, se fuerza checkWin.
//
// 2) CINEMÁTICA FINAL (bfEndCinematic): crea un overlay a pantalla completa que
//    muestra ambos equipos — los ganadores con brillo dorado y los caídos en
//    gris con lápida 🪦. Es el remate visual épico de cada partida.
//    Solo se lanza cuando se llama con un argumento booleano explícito (true =
//    victoria, false = derrota). El IIFE del juego llama bfEndCinematic() sin
//    argumentos cada 400ms (línea 2426 del entry.ts) — esas llamadas se ignoran
//    para no mostrar la cinemática durante la batalla.
//
// 3) CINEMÁTICA DE MUERTE (bfKillCinematic): animación de muerte cuando un
//    héroe cae en batalla — humo oscuro, calavera y lápida.
//
// ARTE DE LOS HÉROES: ART_BY_ID / ART_BY_NAME / ELITE_BY_ID son variables
// LOCALES del IIFE del juego (no están en window). Este parche recibe el mapa
// de arte desde la página padre por postMessage (bfBattleArt y bfAvatarMap) y
// lo guarda en window.__bfBattleArtMap / window.__bfAvatarMap para que la
// cinemática pueda mostrar el retrato de cada héroe.
export const END_GAME_FIX_PATCH = `
<style id="bf-end-game-fix">
/* ---- CINEMÁTICA FINAL: overlay a pantalla completa ---- */
#bf-end-cine {
  position: fixed; inset: 0; z-index: 100060; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 20px;
  background: radial-gradient(ellipse at 50% 35%, rgba(34,24,58,.9), rgba(16,11,30,.95));
  backdrop-filter: blur(5px); animation: bfCineFadeIn .4s ease;
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

/* Héroe VENCEDOR: aura de color giratoria + corona + chispas */
#bf-end-cine .bf-cine-team-winner .bf-cine-portrait {
  border-color: #ffd24a;
  box-shadow: 0 8px 24px rgba(0,0,0,.6), 0 0 20px rgba(255,210,74,.4), inset 0 0 0 1px rgba(255,240,180,.3);
  animation: bfCinePortIn .6s cubic-bezier(.2,.8,.3,1) both, bfCineWinnerGlow 2.4s ease-in-out infinite calc(var(--bf-delay, 0s) + .6s);
}
/* Aura de color (conic-gradient arcoíris) girando detrás del héroe */
#bf-end-cine .bf-cine-team-winner .bf-cine-portrait::after {
  content: ''; position: absolute; inset: -50%; z-index: 2; pointer-events: none;
  background: conic-gradient(from 0deg, rgba(255,210,74,.22), rgba(255,120,60,.16), rgba(180,90,255,.16), rgba(90,180,255,.16), rgba(120,255,160,.16), rgba(255,210,74,.22));
  animation: bfAuraSpin 6s linear infinite;
}
/* Corona flotando sobre el vencedor */
#bf-end-cine .bf-cine-team-winner .bf-cine-portrait::before {
  content: "👑"; position: absolute; top: -18px; left: 50%; transform: translateX(-50%);
  z-index: 3; font-size: clamp(22px, 4.5vw, 34px); line-height: 1;
  filter: drop-shadow(0 3px 6px #000) drop-shadow(0 0 12px rgba(255,210,74,.7)) !important;
  animation: bfCrownFloat 2.5s ease-in-out infinite;
}
/* Chispas brillantes sobre el vencedor */
#bf-end-cine .bf-cine-team-winner .bf-cine-portrait .bf-cine-spark {
  position: absolute; left: var(--sx,50%); top: var(--sy,50%); z-index: 4;
  width: 6px; height: 6px; pointer-events: none;
  background: radial-gradient(circle, #fff 0%, rgba(255,210,74,.85) 40%, transparent 70%);
  border-radius: 50%;
  animation: bfSparkle 2.2s ease-in-out infinite var(--sd,0s);
}
@keyframes bfCineWinnerGlow {
  0%, 100% { box-shadow: 0 8px 24px rgba(0,0,0,.6), 0 0 16px rgba(255,210,74,.35), inset 0 0 0 1px rgba(255,240,180,.3); }
  50% { box-shadow: 0 8px 24px rgba(0,0,0,.6), 0 0 32px rgba(255,210,74,.7), 0 0 50px rgba(255,180,40,.4), inset 0 0 0 1px rgba(255,245,200,.5); }
}
@keyframes bfAuraSpin { to { transform: rotate(360deg); } }
@keyframes bfCrownFloat { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-4px); } }
@keyframes bfSparkle { 0%,100% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1.6); } }

/* Héroe CAÍDO: luz tenue rojiza + zarzas entrelazadas + tumba con gusanos */
#bf-end-cine .bf-cine-fallen .bf-cine-portrait {
  filter: brightness(.8) contrast(1.12) sepia(.35) hue-rotate(-18deg) saturate(1.25) !important;
  border-color: #8a3030 !important;
  box-shadow: 0 8px 20px rgba(0,0,0,.55), 0 0 24px rgba(140,40,40,.4), inset 0 0 18px rgba(60,12,12,.35) !important;
  opacity: 1 !important;
}
/* Velo rojizo + enredadera de espinas (SVG de zarzas entrelazadas) */
#bf-end-cine .bf-cine-fallen .bf-cine-portrait::after {
  content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background:
    linear-gradient(180deg, rgba(90,15,15,.12) 0%, rgba(30,5,5,.2) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg stroke='%232a1010' stroke-width='1.4' fill='none' opacity='0.55'%3E%3Cpath d='M0,40 Q20,20 40,40 T80,40'/%3E%3Cpath d='M0,60 Q20,45 40,60 T80,60'/%3E%3Cpath d='M0,20 Q20,5 40,20 T80,20'/%3E%3Cpath d='M12,28 l-4,-6 M28,48 l4,6 M44,28 l-4,-6 M60,48 l4,6 M8,55 l-4,-6 M24,15 l4,6 M40,55 l-4,-6 M56,15 l4,6'/%3E%3C/g%3E%3C/svg%3E");
  background-size: cover, 80px 80px;
  border-radius: inherit;
}
/* Tumba en la tierra con gusanos en la base del retrato caído */
#bf-end-cine .bf-cine-fallen .bf-cine-portrait::before {
  content: "🪱 🪦 🪱";
  position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
  z-index: 3; font-size: clamp(13px, 2.8vw, 18px); line-height: 1;
  filter: drop-shadow(0 2px 4px #000) drop-shadow(0 0 8px rgba(140,30,30,.5)) !important;
  white-space: nowrap;
  animation: bfTombAppear .6s ease-out calc(.8s + var(--bf-delay)) both, bfWormCrawl 3s ease-in-out infinite calc(1.4s + var(--bf-delay));
}
@keyframes bfWormCrawl { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-3px); } }
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
/* Marcador de muerte bizarro: lápida de piedra con calavera y RIP esculpido */
.bhero.bf-truedead::after {
  content: "💀\A RIP"; white-space: pre; text-align: center;
  position: absolute; top: 4px; left: 50%; transform: translateX(-50%);
  z-index: 20; font-family: 'Cinzel', serif; font-weight: 1000;
  font-size: clamp(9px, 2vw, 13px); letter-spacing: 1.5px; line-height: 1.2;
  color: #d4c5a0;
  background: linear-gradient(180deg, #3a2e48 0%, #2a2038 45%, #181028 100%);
  border: 2px solid #6a5a82;
  border-radius: 11px 11px 5px 5px;
  padding: 3px 8px 5px;
  box-shadow: 0 4px 10px #000, 0 0 12px rgba(120,100,150,.45), inset 0 1px 0 rgba(255,255,255,.1), inset 0 -2px 4px rgba(0,0,0,.5) !important;
  text-shadow: 0 0 8px rgba(180,160,200,.6), 0 1px 2px #000;
  pointer-events: none;
  animation: bfTombFadeIn .4s ease-out, bfTombWobble 4s ease-in-out infinite 1.5s;
}
@keyframes bfTombFadeIn { 0% { opacity: 0; transform: translateX(-50%) scale(.3); } 100% { opacity: 1; transform: translateX(-50%) scale(1); } }
@keyframes bfTombWobble { 0%,100% { transform: translateX(-50%) rotate(-1.5deg); } 50% { transform: translateX(-50%) rotate(2deg); } }
</style>
<script>
(function(){
  if(window.__bfEndGameFix) return;
  window.__bfEndGameFix = true;

  // ---- Mapas de arte recibidos del padre por postMessage ----
  // ART_BY_ID / ART_BY_NAME / ELITE_BY_ID son LOCALES del IIFE del juego y no
  // se pueden acceder desde este script. El padre (Home.jsx) envía el arte de
  // batalla (bfBattleArt) y el catálogo de retratos (bfAvatarMap) por
  // postMessage; los guardamos aquí para que la cinemática los use.
  var battleArtMap = {};
  var avatarMap = {};
  window.__bfBattleArtMap = battleArtMap;
  window.__bfAvatarMap = avatarMap;

  window.addEventListener('message', function(e){
    if(e.data && e.data.bfBattleArt && typeof e.data.bfBattleArt === 'object'){
      battleArtMap = e.data.bfBattleArt;
      window.__bfBattleArtMap = battleArtMap;
    }
    if(e.data && e.data.bfAvatarMap && typeof e.data.bfAvatarMap === 'object'){
      // bfAvatarMap es un array de {id, name, url, clan} — lo convertimos a
      // un diccionario id -> url y name -> url para búsqueda rápida.
      var m = {};
      (e.data.bfAvatarMap || []).forEach(function(a){
        if(a && a.id) m[a.id] = a.url || '';
        if(a && a.name) m[a.name] = a.url || '';
      });
      avatarMap = m;
      window.__bfAvatarMap = avatarMap;
    }
  });

  // ---- Resuelve la URL del retrato de un héroe ----
  // Busca en: mapa de avatares (bfAvatarMap, arte de carta), mapa de arte de
  // batalla (bfBattleArt, arte de combate), y el DOM (cartas de batalla).
  function heroArtUrl(hh) {
    if(!hh) return '';
    var aid = (hh._token) ? hh._token : (hh.id || '');
    var nm = hh.name || '';
    var isElite = !!(hh.eliteMode || hh._bfElite || hh.eliteUsed);

    // 1) Mapa de avatares (retrato de carta) — el más adecuado para la cinemática
    if(aid && avatarMap[aid]) return avatarMap[aid];
    if(nm && avatarMap[nm]) return avatarMap[nm];

    // 2) Mapa de arte de batalla (escena de combate)
    if(aid && battleArtMap[aid]) {
      var ent = battleArtMap[aid];
      return isElite ? (ent.elite || ent.base) : ent.base;
    }

    // 3) DOM: leer el background-image de la carta de batalla si aún existe
    try {
      var side = (typeof tSide === 'function') ? tSide(hh) : '';
      if(!side && typeof G !== 'undefined' && G.team) {
        if(G.team.p && G.team.p.indexOf(hh) >= 0) side = 'p';
        else if(G.team.o && G.team.o.indexOf(hh) >= 0) side = 'o';
      }
      if(side) {
        var card = document.getElementById('b_' + side + '_' + aid);
        if(card) {
          var art = card.querySelector('.bf-battle-art');
          if(art) {
            var bg = art.style.backgroundImage || '';
            var m = bg.match(/url\\(['"]?(.*?)['"]?\\)/);
            if(m && m[1]) return m[1];
          }
        }
      }
    } catch(e) {}

    return '';
  }

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

  // ---- 1b) MARCA LOS HÉROES CAÍDOS con bf-truedead (lapida 💀 RIP) ----
  // Recorre las cartas de batalla del DOM (más fiable que iterar G.team:
  // solo procesa cartas que existen) y añade/quita bf-truedead según el
  // héroe esté vivo o muerto. También engancha renderBattle para reaplicar
  // la clase inmediatamente tras cada repintado (el juego recrea las cartas
  // y perderían la clase hasta el siguiente ciclo de 400ms).
  function applyDeadMarkers(){
    try {
      if(typeof G === 'undefined' || !G || !G.team) return;
      document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
        var m = String(card.id||'').match(/^b_([po])_(.+)$/);
        if(!m) return;
        var side = m[1], hid = m[2];
        var h = (G.team[side]||[]).find(function(hh){ return hh && hh.id === hid; });
        if(!h || h._token || h._bfDuck) return;
        if(!h.alive) card.classList.add('bf-truedead');
        else card.classList.remove('bf-truedead');
      });
    } catch(e) {}
  }
  setInterval(applyDeadMarkers, 400);
  // Hook renderBattle: reaplica bf-truedead justo después de que el juego
  // repinte el tablero (sin esto, la clase se pierde hasta el próximo ciclo).
  function hookRenderForDead(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfTrueDead) return false;
    var o = window.renderBattle;
    window.renderBattle = function(){
      var r = o.apply(this, arguments);
      setTimeout(applyDeadMarkers, 0);
      return r;
    };
    window.renderBattle.__bfTrueDead = 1;
    return true;
  }
  var _bfDh = 0, _bfDhTimer = setInterval(function(){
    if(hookRenderForDead() || ++_bfDh > 60) clearInterval(_bfDhTimer);
  }, 300);
  hookRenderForDead();

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
  // Solo se muestra cuando youWin es booleano (true/false). Si es undefined
  // (llamada desde el intervalo de 400ms del IIFE del juego), se ignora.
  window.bfEndCinematic = function(youWin) {
    // Evita que el intervalo de 400ms del juego (que llama bfEndCinematic()
    // sin argumentos) dispare la cinemática durante la batalla.
    if(youWin !== true && youWin !== false) return;

    // Evita duplicar la cinemática si ya existe y se creó hace menos de 1.5s
    // (showResult y checkWin pueden disparar ambos; sin este guardia, el
    // segundo reemplaza al primero y provoca un parpadeo).
    var existing = document.getElementById('bf-end-cine');
    if(existing && existing.dataset.bfCreated && (Date.now() - Number(existing.dataset.bfCreated)) < 1500) return;
    if(existing) existing.remove();

    // Limpia la pantalla de resultado estática: SOLO marcador, sin héroes.
    // (Online ya la limpia matchModePatch; esto es para IA/local.)
    var bfIsOnline = (typeof online === 'function') && online();
    if(!bfIsOnline) {
      try {
        var rs = document.getElementById('s-result');
        if(rs) {
          var gen = (window.bfSeriesScore && window.bfSeriesScore.get) ? window.bfSeriesScore.get() : null;
          var nameP = (gen && gen.selfNick) || (typeof G !== 'undefined' && G.names && G.names.p) || 'Tú';
          var nameO = (gen && gen.oppNick) || (typeof G !== 'undefined' && G.names && G.names.o) || 'Rival';
          var sp = gen ? gen.self : 0, so = gen ? gen.opp : 0;
          var L2 = function(es, en) { try { return localStorage.getItem('bfLang') === 'en' ? en : es; } catch(e) { return es; } };
          var rTitle = youWin ? L2('¡VICTORIA!', 'VICTORY!') : L2('DERROTA', 'DEFEAT');
          var rSub = youWin ? L2('Has ganado la partida', 'You won the match') : L2('Tu rival ha ganado', 'Your rival won');
          rs.innerHTML = '<div style="text-align:center;padding:20px">' +
            '<div style="font-size:72px;margin-bottom:4px;filter:drop-shadow(0 4px 16px rgba(0,0,0,.6))">' + (youWin ? '🏆' : '💀') + '</div>' +
            '<div class="gtitle" style="font-size:clamp(34px,7vw,64px);letter-spacing:1px">' + rTitle + '</div>' +
            '<div style="font-size:18px;color:#ffd24a;margin:8px 0 2px;font-weight:700">' + rSub + '</div>' +
            '<div style="margin:20px auto 8px;max-width:460px;display:flex;justify-content:center;gap:32px;align-items:center;padding:24px 32px;border-radius:20px;background:linear-gradient(180deg,rgba(28,18,50,.85),rgba(10,6,20,.92));border:2px solid rgba(255,210,74,.45);box-shadow:0 10px 40px rgba(0,0,0,.6),0 0 36px rgba(255,210,74,.18)">' +
              '<div style="text-align:center"><div style="font-size:15px;font-weight:800;color:#cfc6dd;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + nameP + '</div><div style="font-family:Cinzel,serif;font-weight:1000;font-size:clamp(52px,11vw,84px);color:#ffd24a;line-height:1;text-shadow:0 3px 10px #000,0 0 28px rgba(255,210,74,.55)">' + sp + '</div></div>' +
              '<div style="font-family:Cinzel,serif;font-weight:1000;font-size:clamp(30px,7vw,52px);color:#8a8099">—</div>' +
              '<div style="text-align:center"><div style="font-size:15px;font-weight:800;color:#cfc6dd;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + nameO + '</div><div style="font-family:Cinzel,serif;font-weight:1000;font-size:clamp(52px,11vw,84px);color:#ffd24a;line-height:1;text-shadow:0 3px 10px #000,0 0 28px rgba(255,210,74,.55)">' + so + '</div></div>' +
            '</div>' +
            '<div style="font-size:13px;color:#ffe49a;font-weight:700;margin-top:6px;letter-spacing:.3px">' + L2('Marcador general (histórico)', 'General score (all-time)') + '</div>' +
            '<div style="margin-top:24px">' +
              '<button class="btn primary big" onclick="goSetup()">' + L2('Jugar de nuevo', 'Play again') + '</button>' +
              '<button class="btn big" style="margin-left:10px" onclick="show(\'s-title\')">' + L2('Volver al inicio', 'Back to title') + '</button>' +
            '</div>' +
          '</div>';
        }
      } catch(e) {}
    }

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
          var u = heroArtUrl(hh);
          var fall = !hh.alive;
          var dl = (j * 0.12) + 's';
          var pc = fall ? 'bf-cine-fallen' : '';
          var nm = (hh && hh.name) ? hh.name : 'Héroe';
          var el = (hh && (hh.eliteMode || hh._bfElite)) ? ' ★' : '';
          var sparkles = isWinner
            ? '<span class="bf-cine-spark" style="--sx:18%;--sy:25%;--sd:0s"></span><span class="bf-cine-spark" style="--sx:72%;--sy:45%;--sd:.7s"></span><span class="bf-cine-spark" style="--sx:38%;--sy:68%;--sd:1.4s"></span><span class="bf-cine-spark" style="--sx:82%;--sy:75%;--sd:2.1s"></span>'
            : '';
          return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px">' +
            '<div class="bf-cine-portrait ' + pc + '" style="background-image:url(\\'' + u + '\\');--bf-delay:' + dl + '">' + sparkles + '</div>' +
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
      overlay.dataset.bfCreated = String(Date.now());
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