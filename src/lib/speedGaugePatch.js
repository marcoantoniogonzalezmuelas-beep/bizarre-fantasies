// Parche: indicador de VELOCIDAD claro y visual en todo el juego.
// Muestra ⚡ + el número de velocidad de cada héroe; los más veloces brillan
// en ORO con la etiqueta "RÁPIDO" para que destaquen:
//  - Subasta: el héroe más rápido de cada fase lleva el sello dorado → incentivo
//    para pujar por los veloces.
//  - Batalla: el héroe más veloz de los presentes luce el sello dorado.
// La velocidad la calcula el juego (stat primaria + equipo + estados); aquí
// solo leemos el número ya renderizado (o el stat de la fase en subasta).
export const SPEED_GAUGE_PATCH = `
<script>
(function(){
  if (window.__bfSpeedGauge) return;
  window.__bfSpeedGauge = true;

  var RAPIDO = 21; // umbral absoluto de "muy rápido" (top ~25% del set: 8-26)

  function numFromTxt(t){ var m = String(t).match(/-?\\d+(\\.\\d+)?/); return m ? parseFloat(m[0]) : null; }

  var css = ''+
  // Píldora de velocidad (batalla, stat row)
  '.bf-vel-pill{display:inline-flex;align-items:center;gap:2px;font-family:Rubik,sans-serif;font-weight:900;font-size:16px;line-height:1;color:#ffd24a;white-space:nowrap}'+
  '.bf-vel-pill.bf-vel-fast{color:#fff5cc;text-shadow:0 0 8px rgba(255,210,74,.9),0 1px 2px #000;filter:drop-shadow(0 0 5px rgba(255,210,74,.7));animation:bfVelPulse 1.8s ease-in-out infinite}'+
  '.bf-vel-pill .bf-vel-ico{font-size:15px;line-height:1}'+
  // Mini (barra de turnos y etiqueta de nombre)
  '.bf-vel-mini{display:inline-flex;align-items:center;gap:1px;font-family:Rubik,sans-serif;font-weight:900;font-size:14px;line-height:1;color:#ffd24a;white-space:nowrap}'+
  '.bf-vel-mini.bf-vel-fast{color:#fff5cc;text-shadow:0 0 6px rgba(255,210,74,.9);filter:drop-shadow(0 0 4px rgba(255,210,74,.7))}'+
  // Sello en la carta de subasta (esquina superior central, prominente)
  '.bf-vel-auc{position:absolute;top:7px;left:50%;transform:translateX(-50%);z-index:8;display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:999px;font-family:Rubik,sans-serif;font-size:13px;font-weight:900;letter-spacing:.3px;background:rgba(8,5,16,.85);border:1.5px solid rgba(255,210,74,.55);color:#ffd24a;backdrop-filter:blur(2px);white-space:nowrap;line-height:1}'+
  '.bf-vel-auc.bf-vel-fast{background:radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614);border:2px solid #6f4809;color:#4a2e03;box-shadow:0 0 16px rgba(255,210,74,.85),0 2px 8px rgba(0,0,0,.55);animation:bfVelPulse 1.8s ease-in-out infinite}'+
  '.bf-vel-auc .bf-vel-lbl{font-size:8px;letter-spacing:1.2px;font-weight:1000}'+
  '@keyframes bfVelPulse{0%,100%{filter:drop-shadow(0 0 4px rgba(255,210,74,.5))}50%{filter:drop-shadow(0 0 10px rgba(255,210,74,.95))}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function pillHtml(v, fast){ return '<span class="bf-vel-pill' + (fast ? ' bf-vel-fast' : '') + '"><span class="bf-vel-ico">⚡</span>' + v + '</span>'; }
  function miniHtml(v, fast){ return '<span class="bf-vel-mini' + (fast ? ' bf-vel-fast' : '') + '"><span class="bf-vel-ico">⚡</span>' + v + '</span>'; }

  // Batalla: velocidad máxima entre los héroes presentes (para marcar el más veloz)
  function battleMaxV(){
    var mx = null;
    document.querySelectorAll('.vel-badge,.ctb-vel,.vel-tag').forEach(function(el){
      var v = (el.__bfV != null) ? el.__bfV : numFromTxt(el.textContent);
      if (v != null && (mx == null || v > mx)) mx = v;
    });
    return mx;
  }

  function patchBattle(){
    var mx = battleMaxV();
    // Stat row del héroe activo — "VEL X" → ⚡X (dororo si es el más veloz)
    document.querySelectorAll('.vel-badge').forEach(function(el){
      var v = (el.__bfV != null) ? el.__bfV : numFromTxt(el.textContent);
      if (v == null) return;
      el.__bfV = v;
      el.innerHTML = pillHtml(v, v === mx && mx != null);
    });
    // Barra de turnos — "vX" → ⚡X mini
    document.querySelectorAll('.ctb-vel').forEach(function(el){
      var v = (el.__bfV != null) ? el.__bfV : numFromTxt(el.textContent);
      if (v == null) return;
      el.__bfV = v;
      el.innerHTML = miniHtml(v, v === mx && mx != null);
    });
    // Etiqueta de nombre — sustituye solo el "vX" conservando icono de rol
    document.querySelectorAll('.vel-tag').forEach(function(el){
      if (el.querySelector('.bf-vel-mini')) return;
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var node, hit = null;
      while ((node = w.nextNode())) {
        var m = node.nodeValue.match(/v\\s*(-?\\d+(\\.\\d+)?)/i);
        if (m) { hit = { node: node, index: m.index, len: m[0].length }; break; }
      }
      if (!hit) return;
      var v = parseFloat(hit.node.nodeValue.slice(hit.index, hit.index + hit.len).replace(/[^\\d.-]/g, ''));
      el.__bfV = v;
      var span = document.createElement('span');
      span.innerHTML = miniHtml(v, v === mx && mx != null);
      hit.node.nodeValue = hit.node.nodeValue.slice(0, hit.index) + hit.node.nodeValue.slice(hit.index + hit.len);
      hit.node.parentNode.insertBefore(span, hit.node.nextSibling);
    });
  }

  // Subasta: velocidad base = stat del tipo de la fase (CC/AD/HE)
  function phaseStatKey(){
    var rec = document.getElementById('s-recruit');
    var t = rec ? (rec.textContent || '') : '';
    if (/cuerpo a cuerpo|melee/i.test(t)) return 'cc';
    if (/distancia|ranged/i.test(t)) return 'ad';
    if (/magia|magic/i.test(t)) return 'he';
    return null;
  }
  function phaseLabel(){
    var rec = document.getElementById('s-recruit');
    return rec ? ((rec.textContent.match(/Fase \\d\\/3/) || [''])[0]) : '';
  }

  function patchAuction(){
    var rec = document.getElementById('s-recruit');
    if (!rec || !rec.classList.contains('active')) return;
    var key = phaseStatKey();
    if (!key) return;
    var ph = phaseLabel();
    // Cada héroe tiene 2 caras (normal + élite); la base es la de menor stat.
    // El sello dorado RÁPIDO marca la cara base del héroe más veloz de la fase
    // (la que se ve al pujar), para incentivar pujar por los veloces.
    var entries = [];
    rec.querySelectorAll('.cardface.bf-hero-card').forEach(function(card){
      var statEl = card.querySelector('.bf-stat-' + key);
      if (!statEl) return;
      var v = numFromTxt(statEl.textContent);
      if (v == null) return;
      var nm = (card.querySelector('.bf-hero-name') || {}).textContent || '';
      entries.push({ card: card, v: v, name: nm });
    });
    if (!entries.length) return;
    var baseByName = {};
    entries.forEach(function(e){ if (!(e.name in baseByName) || e.v < baseByName[e.name]) baseByName[e.name] = e.v; });
    var baseMax = null;
    Object.keys(baseByName).forEach(function(nm){ if (baseMax == null || baseByName[nm] > baseMax) baseMax = baseByName[nm]; });
    entries.forEach(function(e){
      var isBase = (e.v === baseByName[e.name]);
      var fast = isBase && baseMax != null && e.v === baseMax;
      var old = e.card.querySelector('.bf-vel-auc');
      if (old && e.card.getAttribute('data-bf-velphase') === ph && old.__bfV === e.v && old.classList.contains('bf-vel-fast') === fast) return;
      if (old) old.remove();
      var g = document.createElement('span');
      g.className = 'bf-vel-auc' + (fast ? ' bf-vel-fast' : '');
      g.__bfV = e.v;
      g.innerHTML = '<span class="bf-vel-ico">⚡</span>' + e.v + (fast ? '<span class="bf-vel-lbl">RÁPIDO</span>' : '');
      e.card.appendChild(g);
      e.card.setAttribute('data-bf-velphase', ph);
    });
  }

  function tick(){ patchBattle(); patchAuction(); }
  setInterval(tick, 280);
  (window.__bfAfterRender=window.__bfAfterRender||[]).push(patchBattle);   // en el mismo instante del repintado
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
  var lastT = 0;
  (function(f){ if(window.bfDom)window.bfDom.on(f); else new MutationObserver(f).observe(document.documentElement,{childList:true,subtree:true}); })(function(){ var n = Date.now(); if (n - lastT < 200) return; lastT = n; tick(); });
})();
</script>
`;