// Parche inyectado en el HTML del juego (iframe) para la fase de batalla:
// 1) Miniaturas del "Orden de turno": redondas (círculo con borde dorado),
//    sin solaparse con el nombre y con recorte que elimina bordes blancos.
// 2) Retratos de los héroes en batalla: mismo marco uniforme que en la fase
//    de equipamiento (rectángulo fijo, esquinas redondeadas, zoom de recorte).
// 3) 3 vs 3 garantizado: al terminar la subasta, cualquier equipo con menos
//    de 3 héroes se completa automáticamente con héroes Bizarros.
export const BATTLE_UI_PATCH = `
<script>
(function(){
  if (window.__bfBattleUiPatch) return;
  window.__bfBattleUiPatch = true;

  var st = document.createElement('style');
  st.textContent = [
    // ---- 1) Miniaturas del orden de turno: circulares, más grandes y sin solapar el nombre ----
    '.ctb-slot{min-width:122px!important;padding-left:62px!important}',
    '.bf-ctb-thumb{left:6px!important;top:50%!important;bottom:auto!important;transform:translateY(-50%)!important;width:46px!important;height:46px!important;border-radius:50%!important;overflow:hidden!important;border:1.5px solid rgba(255,210,74,.55)!important;background-color:#0a0710!important;background-size:cover!important}',
    '.bf-ctb-thumb::before{content:"";position:absolute;inset:var(--bf-fit2,-26%);background-image:inherit;background-size:cover;background-position:inherit;background-repeat:no-repeat}',
    // ---- 2) Retrato de héroe en batalla: mismo marco que en equipamiento ----
    '.bhero{padding-left:134px!important}',
    '.bf-battle-art{left:6px!important;top:6px!important;bottom:6px!important;width:116px!important;border-radius:12px!important;overflow:hidden!important;border:1.5px solid rgba(255,210,74,.45)!important;box-shadow:0 5px 12px rgba(0,0,0,.45)!important;opacity:1!important;transform:none!important}',
    '.bf-battle-art::before{content:"";position:absolute;inset:var(--bf-fit2,-26%);background-image:inherit;background-size:cover;background-position:inherit;background-repeat:no-repeat}',
    '.bf-battle-art::after{display:none!important}',
    '.bhero.active-turn .bf-battle-art{width:116px!important;transform:none!important;filter:saturate(1.3) contrast(1.14) brightness(1.06)!important;border-color:rgba(255,210,74,.85)!important;box-shadow:0 5px 12px rgba(0,0,0,.45),0 0 16px rgba(255,210,74,.55)!important}'
  ].join('');
  document.head.appendChild(st);

  // ---- 3) 3 vs 3 garantizado: completar con héroes Bizarros al cerrar la subasta ----
  function bfTokenPool(){
    var t = (typeof TOKENS !== 'undefined' && TOKENS && TOKENS.length) ? TOKENS : (window.TOKENS || []);
    if (t && t.length) return t;
    return (window.HEROES || []).filter(function(h){ return h && String(h.id || '').indexOf('tk_') === 0; });
  }
  function bfFillBizarros(){
    try{
      if (typeof G === 'undefined' || !G || !G.team) return;
      ['p','o'].forEach(function(side){
        var guard = 0;
        while (((G.team[side] || []).length) < 3 && guard++ < 5) {
          var inTeam = {};
          (G.team[side] || []).forEach(function(h){ if (h) { inTeam[h.id] = true; if (h._token) inTeam[h._token] = true; } });
          var all = bfTokenPool();
          var pool = all.filter(function(h){ return h && !inTeam[h.id]; });
          if (!pool.length) pool = all;
          if (!pool.length) break;
          var tk = pool[Math.floor(Math.random() * pool.length)];
          var inst = (typeof makeInstance === 'function') ? makeInstance(tk) : JSON.parse(JSON.stringify(tk));
          inst.boughtFor = 0; inst._token = tk.id;
          if (!G.team[side]) G.team[side] = [];
          G.team[side].push(inst);
          if (typeof pushLog === 'function') pushLog('lx', '⚠️ Equipo incompleto: '+((G.names && G.names[side]) || side)+' recibe al héroe Bizarro «'+tk.name+'» para jugar 3 vs 3.');
        }
      });
    }catch(e){}
  }

  // ---- 4) Encuadre inteligente de retratos y miniaturas ----
  // Algunas ilustraciones son la CARTA completa (marco dorado + borde blanco +
  // nombre abajo). El recorte fijo no basta: detectamos el margen blanco de la
  // imagen y, si es una carta enmarcada, aplicamos más zoom y centramos la cara
  // (como se ve en el Oráculo). Si es una ilustración limpia, apenas recortamos.
  var FIT_CACHE = {};
  function detectMargin(url, cb){
    if (FIT_CACHE.hasOwnProperty(url)) { cb(FIT_CACHE[url]); return; }
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function(){
      try{
        var w = 48, h = 48, cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        var ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var d = ctx.getImageData(0, 0, w, h).data;
        function isBg(x, y){ var i = (y*w+x)*4; return d[i+3] < 10 || (d[i] > 232 && d[i+1] > 232 && d[i+2] > 232); }
        var mx = Math.floor(w/2), my = Math.floor(h/2);
        function depth(dir){ var s = 0; if (dir==='t'){ while(s<h && isBg(mx,s)) s++; } else if (dir==='b'){ while(s<h && isBg(mx,h-1-s)) s++; } else if (dir==='l'){ while(s<w && isBg(s,my)) s++; } else { while(s<w && isBg(w-1-s,my)) s++; } return s; }
        var m = Math.max(depth('t')/h, depth('b')/h, depth('l')/w, depth('r')/w);
        FIT_CACHE[url] = m; cb(m);
      }catch(e){ FIT_CACHE[url] = 0; cb(0); }
    };
    img.onerror = function(){ FIT_CACHE[url] = 0; cb(0); };
    img.src = url;
  }
  function bgUrl(el){ var m = (el.style.backgroundImage || '').match(/url\\(["']?(.*?)["']?\\)/); return m ? m[1] : ''; }
  function refitEl(el, url){
    if (!url || el.dataset.bfRefit === url) return;
    el.dataset.bfRefit = url;
    el.dataset.bfFitUrl = url; // evita que el ajuste del juego pise el nuestro
    detectMargin(url, function(margin){
      if (margin > 0.015) {
        // Carta enmarcada: zoom para saltar borde blanco + marco dorado, cara centrada.
        var zoom = 1 / (1 - 2 * (margin + 0.06));
        var pct = Math.max(20, Math.min(44, Math.round((zoom - 1) * 50) + 4));
        el.style.setProperty('--bf-fit2', '-' + pct + '%');
        el.style.backgroundPosition = 'center 26%';
        if (el.classList.contains('bf-acq-thumb')) { el.style.backgroundSize = (100 + pct * 2) + '% ' + (100 + pct * 2) + '%'; }
      } else {
        // Ilustración limpia: mostrarla casi entera, como en el Oráculo.
        el.style.setProperty('--bf-fit2', '-8%');
        if (el.classList.contains('bf-acq-thumb')) { el.style.backgroundSize = 'cover'; }
      }
    });
  }
  // Cartas grandes de la subasta: si la ilustración es una carta enmarcada,
  // aumentamos el zoom (--bf-fit) para recortar el marco dorado y el rótulo.
  function refitCard(el){
    var s = el.style.getPropertyValue('--bf-art');
    var m = s && s.match(/url\\(["']?(.*?)["']?\\)/);
    var url = m ? m[1] : '';
    if (!url || el.dataset.bfRefit === url) return;
    el.dataset.bfRefit = url;
    detectMargin(url, function(margin){
      if (margin <= 0.015) return; // ilustración limpia: la deja el juego como está
      var zoom = 1 / (1 - 2 * (margin + 0.06));
      var pct = Math.max(20, Math.min(44, Math.round((zoom - 1) * 50) + 4));
      el.style.setProperty('--bf-fit', '-' + pct + '%');
      el.dataset.bfFitUrl = url;
    });
  }
  function refitAll(){
    document.querySelectorAll('.bf-battle-art,.bf-ctb-thumb,.bf-acq-thumb').forEach(function(el){ refitEl(el, bgUrl(el)); });
    document.querySelectorAll('.bf-hero-card,.cf-art.has-art').forEach(refitCard);
  }
  setInterval(refitAll, 600);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refitAll);
  else refitAll();

  var tries = 0;
  var iv = setInterval(function(){
    tries++;
    if (typeof window.finishAuction === 'function' && !window.finishAuction.__bf3v3) {
      var orig = window.finishAuction;
      window.finishAuction = function(){ if (typeof NET === 'undefined' || NET.role !== 'client') bfFillBizarros(); return orig.apply(this, arguments); };
      window.finishAuction.__bf3v3 = 1;
    }
    // Red de seguridad definitiva: aunque la subasta acabe raro, ningún equipo
    // entra a la batalla con menos de 3 héroes — se rellena con Bizarros.
    if (typeof window.startBattle === 'function' && !window.startBattle.__bf3v3) {
      var origSB = window.startBattle;
      window.startBattle = function(){ if (typeof NET === 'undefined' || NET.role !== 'client') bfFillBizarros(); return origSB.apply(this, arguments); };
      window.startBattle.__bf3v3 = 1;
    }
    // La IA aprende a usar monedas de equipamiento: si no le llega para el
    // héroe más barato del pool, transfiere lo justo (máx. 70 en total, como
    // el jugador) a la subasta antes de pujar.
    if (typeof window.aiBid === 'function' && !window.aiBid.__bfXfer) {
      var origAB = window.aiBid;
      window.aiBid = function(s){
        try{
          if (typeof G !== 'undefined' && G && ((G.team && G.team[s] && G.team[s].length) || 0) < 3) {
            var c = Number((G.coins && G.coins[s]) || 0);
            var pool = (G.epicCands && G.epicCands[s]) || G.cands || [];
            var mc = Infinity;
            for (var i = 0; i < pool.length; i++) { var co = Number((pool[i] && pool[i].cost) || 0); if (co < mc) mc = co; }
            if (mc < Infinity && c < mc) {
              if (!G.bfEquipXfer) G.bfEquipXfer = { p: 0, o: 0 };
              var xl = 70 - (G.bfEquipXfer[s] || 0);
              var t = Math.max(0, Math.min(xl, (mc - c) + 5));
              if (t > 0) {
                G.coins[s] = c + t;
                G.bfEquipXfer[s] = (G.bfEquipXfer[s] || 0) + t;
                if (typeof pushLog === 'function') pushLog('lx', '🪙 ' + ((G.names && G.names[s]) || 'La IA') + ' transfiere ' + t + ' monedas de equipamiento a la subasta para poder reclutar.');
              }
            }
          }
        }catch(e){}
        return origAB.apply(this, arguments);
      };
      window.aiBid.__bfXfer = 1;
    }
    if (window.finishAuction && window.finishAuction.__bf3v3 && window.startBattle && window.startBattle.__bf3v3 && window.aiBid && window.aiBid.__bfXfer) clearInterval(iv);
    if (tries > 120) clearInterval(iv);
  }, 150);
})();
</script>
`;