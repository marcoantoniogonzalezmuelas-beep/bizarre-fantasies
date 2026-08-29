// Batalla: junto a las iniciales del tipo (CC / AD / HE) de cada héroe se
// muestra el NÚMERO del stat efectivo, más los otros dos stats y la velocidad.
// El valor se calcula con stat() del motor, así que refleja en vivo los
// cambios que las habilidades, equipo y estados aplican sobre los stats.
//
// SIN REPINTADOS: toda la barra se construye de UNA SOLA VEZ (un único nodo
// con todo el contenido) y se pinta en el mismo instante en que el motor
// dibuja el tablero (hook de renderBattle), no en ticks sucesivos. Así al
// empezar la partida la barra aparece ya completa y no se ve crecer por
// partes. Después solo se reescribe si el texto cambia de verdad.
export const TYPE_STAT_NUMBER_PATCH = `
<script>
(function(){
  if(window.__bfTypeStatNum) return;
  window.__bfTypeStatNum = true;

  var COLORS = { cc:'#ff6a5f', ad:'#54e876', he:'#b06cff' };

  var st = document.createElement('style');
  st.textContent = '.bf-stats-block{display:inline-block;font-family:Rubik,sans-serif;font-weight:900;font-size:17px;line-height:1;letter-spacing:.3px;white-space:nowrap;text-shadow:0 1px 2px #000,0 0 6px rgba(0,0,0,.6)}'+
    '.bf-stats-block .bf-type-num{font-size:19px}'+
    // Barra más ancha y con más cuerpo (antes era una tira de 17px con letra de
    // 14px, y se veía muy estrecha). Alto FIJO: aunque el contenido cambie,
    // nunca mueve la carta.
    '.bhero .vel-tag{min-height:28px!important;height:28px!important;display:flex!important;align-items:center!important;padding:0 10px!important;border-radius:8px!important;background:rgba(8,5,14,.55)!important;border:1px solid rgba(255,210,74,.22)!important;white-space:nowrap!important;overflow:hidden!important;contain:layout style!important}';
  document.head.appendChild(st);

  function keyOf(t){
    if(typeof primKey === 'function'){ try{ return primKey(t); }catch(e){} }
    var s = String(t || '').toLowerCase();
    return s === 'cc' || s === 'ad' || s === 'he' ? s : 'cc';
  }

  function effStat(h, k){
    if(typeof stat === 'function'){ try{ return stat(h, k); }catch(e){} }
    return h && h[k] != null ? h[k] : null;
  }

  function buildHtml(h){
    var k = keyOf(h.type);
    var v = effStat(h, k);
    if(v == null) return null;
    var html = '<span class="bf-type-num" style="color:' + (COLORS[k] || '#ffe49a') + '">' + v + '</span>';
    ['cc','ad','he'].forEach(function(x){
      if(x === k) return;
      var vv = effStat(h, x);
      if(vv == null) return;
      html += ' · <span style="color:' + COLORS[x] + '">' + x.toUpperCase() + ' ' + vv + '</span>';
    });
    var vel = (typeof velocity === 'function') ? velocity(h) : null;
    if(vel != null) html += ' · <span style="color:#ffd24a">⚡' + vel + '</span>';
    return html;
  }

  function paint(){
    if(typeof G === 'undefined' || !G || !G.team) return;
    document.querySelectorAll('.bhero[id^="b_"] .vel-tag').forEach(function(tag){
      var card = tag.closest('.bhero');
      var m = String((card && card.id) || '').match(/^b_([po])_(.+)$/);
      if(!m) return;
      var h = (G.team[m[1]] || []).find(function(x){ return x && x.id === m[2]; });
      if(!h) return;
      var html = buildHtml(h);
      if(html == null) return;
      var block = tag.querySelector('.bf-stats-block');
      if(!block){
        // Punto de inserción: justo después de las iniciales del tipo.
        var w = document.createTreeWalker(tag, NodeFilter.SHOW_TEXT, null);
        var node, hit = null;
        while((node = w.nextNode())){
          var mm = node.nodeValue.match(/\\b(CC|AD|HE)\\b/);
          if(mm){ hit = { node: node, end: mm.index + mm[0].length }; break; }
        }
        if(!hit) return;
        block = document.createElement('span');
        block.className = 'bf-stats-block';
        // Se rellena ANTES de insertarlo: entra en el DOM ya completo.
        block.innerHTML = ' ' + html;
        block.__bfHtml = html;
        var rest = hit.node.splitText(hit.end);
        rest.parentNode.insertBefore(block, rest);
        return;
      }
      if(block.__bfHtml !== html){ block.__bfHtml = html; block.innerHTML = ' ' + html; }
    });
  }

  // Se pinta en el mismo ciclo en el que el motor redibuja el tablero, para que
  // la barra nunca se vea "a medias" ni aparezca un instante después.
  function hookRender(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfTypeStat) return false;
    var orig = window.renderBattle;
    window.renderBattle = function(){ var r = orig.apply(this, arguments); paint(); return r; };
    window.renderBattle.__bfTypeStat = 1;
    return true;
  }

  var tries = 0, iv = setInterval(function(){ if(hookRender() || tries++ > 200) clearInterval(iv); }, 150);
  // Red de seguridad (cambios de stats sin repintado del tablero).
  setInterval(paint, 500);
  paint();
})();
</script>
`;