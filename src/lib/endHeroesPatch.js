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
@keyframes bfEhRise { from { transform: translateY(40%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes bfEhPop { 0% { opacity: 0; transform: translateY(14px) scale(.7); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes bfEhGoldShine { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
@keyframes bfEhBloodPulse { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
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

  var PORT_W = 'width:clamp(42px,11vw,64px);aspect-ratio:3/4;';

  function buildPort(hh, isWin, delay){
    var art = heroArt(hh);
    var nm = (hh && hh.name) ? hh.name : 'Héroe';
    if(hh && (hh.eliteMode || hh._bfElite)) nm += ' ★';

    var col = el('div', 'display:flex;flex-direction:column;align-items:center;gap:3px');
    var port = el('div', PORT_W + 'position:relative;border-radius:9px;overflow:hidden;background-color:#0a0710;' +
      'border:2px solid ' + (isWin ? '#ffd24a' : '#8a2020') + ';' +
      'box-shadow:' + (isWin
        ? '0 4px 12px rgba(0,0,0,.5),0 0 14px rgba(255,210,74,.5)'
        : '0 4px 12px rgba(0,0,0,.55),0 0 18px rgba(170,30,30,.75),inset 0 0 10px rgba(60,6,6,.5)') + ';' +
      'animation:bfEhPop .5s cubic-bezier(.2,.8,.3,1) both;animation-delay:' + delay + 's');

    // Arte del héroe (los caídos en gris y oscurecidos)
    port.appendChild(el('div', 'position:absolute;inset:0;background-size:cover;background-position:center 18%;' +
      'background-image:url(\\'' + art + '\\');' +
      (isWin ? '' : 'filter:grayscale(1) brightness(.5) contrast(1.05);')));

    if(isWin){
      // Brillo dorado pulsante sobre la imagen del vencedor
      port.appendChild(el('div', 'position:absolute;inset:0;pointer-events:none;' +
        'background:radial-gradient(circle at 50% 30%,rgba(255,228,140,.55),rgba(255,210,74,.2) 45%,rgba(255,190,40,0) 74%);' +
        'animation:bfEhGoldShine 1.8s ease-in-out infinite'));
    } else {
      // Velo de sangre pulsante
      port.appendChild(el('div', 'position:absolute;inset:0;pointer-events:none;' +
        'background:linear-gradient(180deg,rgba(150,12,12,.45),rgba(70,4,4,.65));' +
        'animation:bfEhBloodPulse 2.2s ease-in-out infinite'));
      // Gusanos de fondo
      port.appendChild(el('div', 'position:absolute;inset:0;pointer-events:none;display:flex;align-items:center;' +
        'justify-content:center;text-align:center;line-height:1.7;opacity:.55;' +
        'font-size:clamp(9px,2.2vw,13px);white-space:pre',
        '🪱 🪱\\n🪱  🪱\\n 🪱 🪱'));
      // Lápida grabada
      port.appendChild(el('div', 'position:absolute;inset:0;pointer-events:none;display:flex;align-items:center;' +
        'justify-content:center;font-family:\\'Cinzel\\',serif;font-weight:1000;letter-spacing:2px;' +
        'font-size:clamp(11px,2.8vw,16px);color:#ffdada;' +
        'text-shadow:0 0 9px rgba(210,30,30,.95),0 2px 3px #000', 'RIP'));
    }

    col.appendChild(port);
    col.appendChild(el('div', 'font-size:clamp(7px,1.6vw,10px);font-weight:700;max-width:72px;text-align:center;' +
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 2px #000;' +
      'color:' + (isWin ? '#fff5dc' : '#bb8888'), nm));
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
    var row = el('div', 'display:flex;gap:clamp(5px,1.4vw,10px);justify-content:center');
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
        'justify-content:center;align-items:flex-end;gap:clamp(8px,2.5vw,22px);padding:14px 12px 12px;' +
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