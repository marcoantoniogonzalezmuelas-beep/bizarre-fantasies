// Parche inyectado en el iframe: FRANJA DE HÉROES al final de partida.
//
// Cuando termina la partida (showResult), aparece una franja fija en la parte
// inferior de la pantalla mostrando los héroes de ambos equipos:
//   · Vencedores: a todo color, con borde dorado y brillo dorado suave.
//   · Caídos: en gris (grayscale), con borde carmesí y brillo ensangrentado.
//
// La franja NO tapa los videos nativos de victoria/derrota del juego (castillos,
// caballeros…): se ancla solo al borde inferior, dejando el centro libre para
// el video. Se elimina sola al cabo de unos segundos o al iniciar otra partida.
//
// El arte de cada héroe se resuelve desde los mapas que ya mantiene
// endGameFixPatch (window.__bfAvatarMap / __bfBattleArtMap) y, como respaldo,
// leyendo el background-image de la carta de batalla en el DOM.
export const END_HEROES_PATCH = `
<style id="bf-end-heroes-css">
#bf-end-heroes {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 100055;
  display: flex; justify-content: center; align-items: flex-end; gap: clamp(8px, 2.5vw, 22px);
  padding: 14px 12px 12px;
  background: linear-gradient(180deg, transparent 0%, rgba(8,5,16,.55) 35%, rgba(8,5,16,.92) 100%);
  pointer-events: none;
  animation: bfEhRise .6s cubic-bezier(.2,.8,.3,1);
}
@keyframes bfEhRise { from { transform: translateY(40%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
#bf-end-heroes .bf-eh-team {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
#bf-end-heroes .bf-eh-label {
  font-family: 'Cinzel', serif; font-weight: 1000; font-size: clamp(9px, 2vw, 12px);
  letter-spacing: 1.5px; text-transform: uppercase; padding: 2px 10px; border-radius: 999px;
  text-shadow: 0 1px 3px #000;
}
#bf-end-heroes .bf-eh-row {
  display: flex; gap: clamp(5px, 1.4vw, 10px); justify-content: center;
}
#bf-end-heroes .bf-eh-port {
  width: clamp(42px, 11vw, 64px); aspect-ratio: 3/4; border-radius: 9px;
  background-color: #0a0710; overflow: hidden;
  border: 2px solid; position: relative;
  animation: bfEhPop .5s cubic-bezier(.2,.8,.3,1) both;
  animation-delay: calc(var(--bf-eh-d, 0s));
}
@keyframes bfEhPop { 0% { opacity: 0; transform: translateY(14px) scale(.7); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
#bf-end-heroes .bf-eh-art { position: absolute; inset: 0; background-size: cover; background-position: center 18%; }
#bf-end-heroes .bf-eh-name {
  font-size: clamp(7px, 1.6vw, 10px); font-weight: 700; max-width: 70px; text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 2px #000;
}
/* Vencedores: color + dorado */
#bf-end-heroes .bf-eh-win .bf-eh-label { color: #3a2600; background: linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f); box-shadow: 0 2px 8px rgba(255,210,74,.4); }
#bf-end-heroes .bf-eh-win .bf-eh-port {
  border-color: #ffd24a;
  box-shadow: 0 4px 12px rgba(0,0,0,.5), 0 0 14px rgba(255,210,74,.45), inset 0 0 0 1px rgba(255,240,180,.3);
}
#bf-end-heroes .bf-eh-win .bf-eh-name { color: #fff5dc; }
/* Brillo dorado sobre la imagen del vencedor */
#bf-end-heroes .bf-eh-win .bf-eh-port::after {
  content: ''; position: absolute; inset: 0; border-radius: 7px; pointer-events: none;
  background: radial-gradient(circle at 50% 30%, rgba(255,224,120,.4), rgba(255,210,74,.14) 45%, transparent 72%);
  mix-blend-mode: screen;
  animation: bfEhGoldShine 1.8s ease-in-out infinite;
}
@keyframes bfEhGoldShine { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
/* Caídos: gris + brillo ensangrentado */
#bf-end-heroes .bf-eh-lose .bf-eh-label { color: #e0b0b0; background: rgba(40,12,16,.7); border: 1px solid rgba(180,60,60,.4); }
#bf-end-heroes .bf-eh-lose .bf-eh-port {
  border-color: #8a2020;
  box-shadow: 0 4px 12px rgba(0,0,0,.55), 0 0 16px rgba(170,30,30,.7), 0 0 26px rgba(120,10,10,.45), inset 0 0 10px rgba(60,6,6,.5);
  animation: bfEhPop .5s cubic-bezier(.2,.8,.3,1) both, bfEhBloodPulse 2.2s ease-in-out infinite calc(var(--bf-eh-d,0s) + .5s);
}
#bf-end-heroes .bf-eh-lose .bf-eh-name { color: #b88; }
#bf-end-heroes .bf-eh-lose .bf-eh-art { filter: grayscale(1) brightness(.55) contrast(1.05); }
/* Velo rojo sangre sobre el retrato caído + gusanos de fondo */
#bf-end-heroes .bf-eh-lose .bf-eh-port::before {
  content: '🪱 🪱\\A🪱  🪱\\A 🪱 🪱'; white-space: pre;
  position: absolute; inset: 0; pointer-events: none; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  font-size: clamp(9px, 2.2vw, 13px); line-height: 1.6; opacity: .5;
  background: linear-gradient(180deg, rgba(120,10,10,.35), rgba(60,4,4,.55));
  border-radius: 7px;
}
#bf-end-heroes .bf-eh-lose .bf-eh-port::after {
  content: 'RIP'; position: absolute; inset: 0; z-index: 2; pointer-events: none;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cinzel', serif; font-weight: 1000; letter-spacing: 2px;
  font-size: clamp(11px, 2.8vw, 16px); color: #ffdada;
  text-shadow: 0 0 8px rgba(200,30,30,.95), 0 2px 3px #000;
}
@keyframes bfEhBloodPulse {
  0%,100% { box-shadow: 0 4px 12px rgba(0,0,0,.55), 0 0 14px rgba(170,30,30,.6), 0 0 22px rgba(120,10,10,.4), inset 0 0 10px rgba(60,6,6,.5); }
  50% { box-shadow: 0 4px 12px rgba(0,0,0,.55), 0 0 22px rgba(200,40,40,.9), 0 0 36px rgba(150,15,15,.6), inset 0 0 12px rgba(80,8,8,.6); }
}
@media (max-width: 1024px) {
  #bf-end-heroes { padding: 10px 8px 9px; }
  #bf-end-heroes .bf-eh-port { width: clamp(38px, 13vw, 56px); }
}
</style>
<script>
(function(){
  if(window.__bfEndHeroesPatch) return;
  window.__bfEndHeroesPatch = true;

  function heroArt(hh){
    if(!hh) return '';
    var aid = hh._token ? hh._token : (hh.id || '');
    var nm = hh.name || '';
    var isElite = !!(hh.eliteMode || hh._bfElite || hh.eliteUsed);
    var av = window.__bfAvatarMap || {}, ba = window.__bfBattleArtMap || {};
    if(aid && av[aid]) return av[aid];
    if(nm && av[nm]) return av[nm];
    if(aid && ba[aid]){ var e=ba[aid]; return isElite ? (e.elite||e.base) : e.base; }
    // Respaldo: lee el background-image de la carta de batalla si aún está en el DOM
    try {
      var side = '';
      if(typeof G!=='undefined' && G.team){ if(G.team.p&&G.team.p.indexOf(hh)>=0)side='p'; else if(G.team.o&&G.team.o.indexOf(hh)>=0)side='o'; }
      if(side){ var c=document.getElementById('b_'+side+'_'+aid); if(c){ var a=c.querySelector('.bf-battle-art'); if(a){ var m=(a.style.backgroundImage||'').match(/url\\(['"]?(.*?)['"]?\\)/); if(m&&m[1]) return m[1]; } } }
    } catch(e){}
    return '';
  }

  function buildRow(team, isWin){
    var arr = (team||[]).filter(function(h){ return h && !h._bfDuck; });
    if(!arr.length) return '';
    var ports = arr.map(function(hh, j){
      var u = heroArt(hh);
      var nm = (hh && hh.name) ? hh.name : 'Héroe';
      var el = (hh && (hh.eliteMode||hh._bfElite)) ? ' ★' : '';
      var d = (j * 0.08) + 's';
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
        '<div class="bf-eh-port" style="--bf-eh-d:'+d+'"><span class="bf-eh-art" style="background-image:url(\\''+u+'\\')"></span></div>' +
        '<div class="bf-eh-name">'+nm+el+'</div>' +
      '</div>';
    }).join('');
    var lbl = isWin
      ? (typeof L==='function' ? L('Vencedores','Winners') : 'Vencedores')
      : (typeof L==='function' ? L('Caídos','Fallen') : 'Caídos');
    return '<div class="bf-eh-team '+(isWin?'bf-eh-win':'bf-eh-lose')+'">' +
      '<span class="bf-eh-label">'+lbl+'</span>' +
      '<div class="bf-eh-row">'+ports+'</div>' +
    '</div>';
  }

  function showHeroes(youWin){
    try {
      if(typeof G==='undefined' || !G || !G.team) return;
      // Quita una franja previa si existe
      var old = document.getElementById('bf-end-heroes');
      if(old) old.remove();

      // Determina el bando del jugador y el ganador/perdedor
      var mySide = 'p';
      if(typeof NET!=='undefined' && NET && NET.role==='client') mySide = 'o';
      else if(typeof NET!=='undefined' && NET && NET.mySide) mySide = NET.mySide;
      var winnerSide = (youWin === (mySide==='p')) ? 'p' : 'o';
      var loserSide = winnerSide==='p' ? 'o' : 'p';

      var winRow = buildRow(G.team[winnerSide], true);
      var loseRow = buildRow(G.team[loserSide], false);
      if(!winRow && !loseRow) return;

      var wrap = document.createElement('div');
      wrap.id = 'bf-end-heroes';
      wrap.innerHTML = winRow + loseRow;
      document.body.appendChild(wrap);

      // Auto-elimina tras 7s
      setTimeout(function(){ if(wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 7000);
    } catch(e){}
  }

  // Engancha showResult: se llama una vez al terminar la partida con youWin booleano.
  function hook(){
    if(typeof window.showResult!=='function' || window.showResult.__bfEndHeroes) return false;
    var orig = window.showResult;
    window.showResult = function(youWin){
      try { showHeroes(youWin); } catch(e){}
      return orig.apply(this, arguments);
    };
    window.showResult.__bfEndHeroes = 1;
    return true;
  }
  var attempts = 0, t = setInterval(function(){ if(hook() || ++attempts > 120) clearInterval(t); }, 200);
  hook();

  // Limpia la franja si el jugador inicia otra partida (cambia de pantalla)
  setInterval(function(){
    try {
      var title = document.getElementById('s-title');
      if(title && title.classList.contains('active')){
        var w = document.getElementById('bf-end-heroes');
        if(w) w.remove();
      }
    } catch(e){}
  }, 800);
})();
</script>
`;