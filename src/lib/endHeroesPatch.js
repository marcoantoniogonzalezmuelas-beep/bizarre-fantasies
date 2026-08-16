// Parche inyectado en el iframe: FRANJA DE HÉROES al final de partida.
//
// Cuando termina la partida (showResult), aparece una franja fija en la parte
// inferior de la pantalla mostrando los héroes de ambos equipos:
//   · Vencedores: a todo color, con borde dorado y brillo dorado pulsante.
//   · Caídos: en gris, velo rojo sangre, gusanos de fondo y "RIP" grabado.
//
// IMPORTANTE: los efectos (sangre, gusanos, RIP, brillo dorado) se pintan como
// ELEMENTOS REALES con estilos en línea, no con pseudo-elementos ni clases.
// Los parches anti-parpadeo de móvil/tablet neutralizan propiedades de las
// clases con prefijo bf- (blend modes) y otros <style> se reinyectan al final
// del <head>, lo que antes dejaba la franja sin efectos. Con estilos en línea
// nada puede anularlos.
//
// La franja NO tapa los videos nativos de victoria/derrota del juego: se ancla
// solo al borde inferior. Se elimina sola a los pocos segundos.
export const END_HEROES_PATCH = `
<style id="bf-end-heroes-css">
/* El juego ya pinta su propia alineación VERTICAL de los 6 héroes dentro de la
   cinemática final (#bf-end-cine .bf-cine-team). Se oculta para no duplicarlos:
   los héroes se muestran solo en la franja horizontal de este parche. */
#bf-end-cine .bf-cine-team, #bf-end-cine .bf-cine-vs { display: none !important; }
@keyframes bfEhRise { from { transform: translateY(40%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes bfEhPop { 0% { opacity: 0; transform: translateY(14px) scale(.7); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes bfEhGoldShine { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
@keyframes bfEhBloodPulse { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
@keyframes bfEhMist { 0% { transform: translateX(-12%) translateY(4%); opacity: .35; } 50% { transform: translateX(10%) translateY(-3%); opacity: .7; } 100% { transform: translateX(-12%) translateY(4%); opacity: .35; } }
@keyframes bfEhCrown { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-3px) scale(1.1); } }
@keyframes bfEhSweep { 0% { transform: translateX(-120%) rotate(12deg); } 60%,100% { transform: translateX(160%) rotate(12deg); } }
@keyframes bfEhRing { 0%,100% { box-shadow: 0 0 0 0 rgba(255,210,74,.55), 0 6px 16px rgba(0,0,0,.55); } 50% { box-shadow: 0 0 22px 5px rgba(255,196,40,.75), 0 6px 16px rgba(0,0,0,.55); } }
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
    var av = window.__bfAvatarMap || {}, ba = window.__bfBattleArtMap || {}, ca = window.__bfCardArtMap || {};
    if(aid && av[aid]) return av[aid];
    if(nm && av[nm]) return av[nm];
    if(aid && ba[aid]){ var e=ba[aid]; return isElite ? (e.elite||e.base) : e.base; }
    // Arte de la carta (tokens y bizarros como la Grulla, que no están en el
    // mapa de avatares ni tienen escena de batalla).
    if(aid && ca[aid]){ var k=ca[aid]; return isElite ? (k.elite||k.base) : k.base; }
    if(nm && ca[nm]){ var k2=ca[nm]; return isElite ? (k2.elite||k2.base) : k2.base; }
    try {
      var side = '';
      if(typeof G!=='undefined' && G.team){ if(G.team.p&&G.team.p.indexOf(hh)>=0)side='p'; else if(G.team.o&&G.team.o.indexOf(hh)>=0)side='o'; }
      if(side){ var c=document.getElementById('b_'+side+'_'+aid); if(c){ var a=c.querySelector('.bf-battle-art'); if(a){ var m=(a.style.backgroundImage||'').match(/url\\(['"]?(.*?)['"]?\\)/); if(m&&m[1]) return m[1]; } } }
    } catch(e){}
    return '';
  }

  function el(tag, css, html){
    var n = document.createElement(tag);
    n.setAttribute('style', css);
    if(html != null) n.innerHTML = html;
    return n;
  }

  // Ancho del retrato: calibrado para que quepan LOS 6 héroes (3 vencedores +
  // 3 caídos) dentro del iframe de móvil (1200 px) sin desbordar por la derecha.
  // 6 × 168 + gaps + padding ≈ 1140 px < 1200 px.
  var PORT_W = 'width:clamp(64px,13vw,168px);aspect-ratio:3/4;';

  function buildPort(hh, isWin, delay){
    var art = heroArt(hh);
    var nm = (hh && hh.name) ? hh.name : 'Héroe';
    if(hh && (hh.eliteMode || hh._bfElite)) nm += ' ★';

    var col = el('div', 'display:flex;flex-direction:column;align-items:center;gap:3px;position:relative');
    var port = el('div', PORT_W + 'position:relative;border-radius:9px;overflow:hidden;background-color:#07050c;' +
      'border:2px solid ' + (isWin ? '#ffd24a' : '#2b2b33') + ';' +
      (isWin
        ? 'transform:scale(1.06);animation:bfEhPop .5s cubic-bezier(.2,.8,.3,1) both,bfEhRing 1.6s ease-in-out infinite;'
        : 'box-shadow:0 4px 14px rgba(0,0,0,.7),inset 0 0 18px rgba(0,0,0,.9);animation:bfEhPop .5s cubic-bezier(.2,.8,.3,1) both;') +
      'animation-delay:' + delay + 's');

    // Arte del héroe: los caídos, en gris real (el filtro va en la propia <img>,
    // así ningún estilo del juego ni parche anti-parpadeo puede anularlo).
    var img = document.createElement('img');
    img.src = art;
    img.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;' +
      'object-position:center 18%;' +
      (isWin ? '' : '-webkit-filter:grayscale(100%) brightness(.42) contrast(1.15);' +
                    'filter:grayscale(100%) brightness(.42) contrast(1.15);'));
    port.appendChild(img);

    if(isWin){
      // Vencedor: halo dorado + destello que barre el retrato
      port.appendChild(el('div', 'position:absolute;inset:0;pointer-events:none;' +
        'background:radial-gradient(circle at 50% 28%,rgba(255,232,150,.5),rgba(255,205,70,.18) 48%,rgba(255,190,40,0) 76%);' +
        'animation:bfEhGoldShine 1.8s ease-in-out infinite'));
      var sweepBox = el('div', 'position:absolute;inset:0;overflow:hidden;pointer-events:none');
      sweepBox.appendChild(el('div', 'position:absolute;top:-30%;bottom:-30%;width:38%;' +
        'background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,246,214,.75),rgba(255,255,255,0));' +
        'animation:bfEhSweep 2.6s ease-in-out infinite'));
      port.appendChild(sweepBox);
    } else {
      // Caído: tinieblas — viñeta negra profunda + niebla que se arrastra
      port.appendChild(el('div', 'position:absolute;inset:0;pointer-events:none;' +
        'background:radial-gradient(ellipse at 50% 30%,rgba(0,0,0,0) 20%,rgba(0,0,0,.55) 62%,rgba(0,0,0,.95) 100%)'));
      port.appendChild(el('div', 'position:absolute;left:-20%;right:-20%;bottom:-10%;height:70%;pointer-events:none;' +
        'background:radial-gradient(ellipse at 50% 100%,rgba(150,160,180,.35),rgba(90,95,120,.12) 45%,transparent 75%);' +
        'animation:bfEhMist 5s ease-in-out infinite'));
      // Tenue velo de sangre (sin tapar la escala de grises)
      port.appendChild(el('div', 'position:absolute;inset:0;pointer-events:none;' +
        'background:linear-gradient(180deg,rgba(120,10,10,.18),rgba(50,3,3,.4));' +
        'animation:bfEhBloodPulse 2.6s ease-in-out infinite'));
    }

    if(isWin){
      // Corona flotando sobre el retrato del vencedor
      col.appendChild(el('div', 'position:absolute;top:-13px;left:50%;transform:translateX(-50%);z-index:3;' +
        'font-size:clamp(15px,3vw,26px);filter:drop-shadow(0 0 7px rgba(255,210,74,.95));' +
        'animation:bfEhCrown 1.8s ease-in-out infinite', '👑'));
    }

    col.appendChild(port);

    if(!isWin){
      // Lápida bajo el retrato (fuera de la imagen): ☠ RIP + gusanos
      col.appendChild(el('div', 'display:flex;align-items:center;gap:3px;padding:1px 6px;border-radius:4px 4px 2px 2px;' +
        'background:linear-gradient(180deg,#2a2a30,#15151a);border:1px solid #3d3d46;' +
        'font-family:\\'Cinzel\\',serif;font-weight:1000;letter-spacing:1.5px;' +
        'font-size:clamp(7px,1.8vw,10px);color:#ff5a5a;' +
        'text-shadow:0 0 8px rgba(220,30,30,.9),0 1px 2px #000',
        '<span style="color:#ff4444">\\u2620\\uFE0E</span> RIP ' +
        '<span style="font-size:.85em;filter:hue-rotate(-15deg)">🪱</span>'));
    }

    col.appendChild(el('div', 'font-size:clamp(11px,2.2vw,16px);font-weight:800;max-width:190px;text-align:center;' +
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 2px #000;' +
      'color:' + (isWin ? '#fff5dc' : '#7c7c88'), nm));
    return col;
  }

  function buildTeam(team, isWin){
    var arr = (team||[]).filter(function(h){ return h && !h._bfDuck; });
    if(!arr.length) return null;
    var wrap = el('div', 'display:flex;flex-direction:column;align-items:center;gap:6px');
    var lbl = isWin
      ? (typeof L==='function' ? L('Vencedores','Winners') : 'Vencedores')
      : (typeof L==='function' ? L('Caídos','Fallen') : 'Caídos');
    wrap.appendChild(el('span', 'font-family:\\'Cinzel\\',serif;font-weight:1000;font-size:clamp(9px,2vw,12px);' +
      'letter-spacing:1.5px;text-transform:uppercase;padding:2px 10px;border-radius:999px;text-shadow:0 1px 3px #000;' +
      (isWin
        ? 'color:#3a2600;background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f);box-shadow:0 2px 8px rgba(255,210,74,.4)'
        : 'color:#e0b0b0;background:rgba(40,12,16,.75);border:1px solid rgba(180,60,60,.45)'), lbl));
    var row = el('div', 'display:flex;gap:clamp(5px,1.2vw,12px);justify-content:center;align-items:flex-start');
    arr.forEach(function(hh, j){ row.appendChild(buildPort(hh, isWin, j * 0.08)); });
    wrap.appendChild(row);
    return wrap;
  }

  function showHeroes(youWin){
    try {
      if(typeof G==='undefined' || !G || !G.team) return;
      var old = document.getElementById('bf-end-heroes');
      if(old) old.remove();

      var mySide = 'p';
      if(typeof NET!=='undefined' && NET && NET.role==='client') mySide = 'o';
      else if(typeof NET!=='undefined' && NET && NET.mySide) mySide = NET.mySide;
      var winnerSide = (youWin === (mySide==='p')) ? 'p' : 'o';
      var loserSide = winnerSide==='p' ? 'o' : 'p';

      var win = buildTeam(G.team[winnerSide], true);
      var lose = buildTeam(G.team[loserSide], false);
      if(!win && !lose) return;

      var wrap = el('div', 'position:fixed;left:0;right:0;bottom:0;z-index:100055;display:flex;' +
        'justify-content:center;align-items:flex-start;gap:clamp(10px,2.5vw,32px);padding:18px 10px 14px;' +
        'background:linear-gradient(180deg,rgba(8,5,16,0) 0%,rgba(8,5,16,.55) 35%,rgba(8,5,16,.92) 100%);' +
        'pointer-events:none;animation:bfEhRise .6s cubic-bezier(.2,.8,.3,1)');
      wrap.id = 'bf-end-heroes';
      if(win) wrap.appendChild(win);
      if(lose) wrap.appendChild(lose);
      document.body.appendChild(wrap);

      setTimeout(function(){ if(wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 9000);
    } catch(e){}
  }

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