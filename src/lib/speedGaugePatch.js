// Parche: indicador VISUAL de velocidad (gráfico, no numérico) en todo el juego.
// La velocidad real la calcula el juego con velocity(h) = stat primaria + equipo
// + estados. Aquí solo leemos el número ya renderizado (o el stat de la fase en
// subasta) y lo dibujamos como una barra ⚡ de 5 segmentos (más llena = más rápido).
//
// - Batalla: reemplaza "VEL X" (.vel-badge) y "vX" (.ctb-vel) por la barra; en
//   .vel-tag sustituye solo el "vX" conservando el icono de rol.
// - Subasta: añade a cada carta de héroe un indicador de su velocidad base
//   (el stat del tipo de la fase: CC/AD/HE) para planificar al elegir.
export const SPEED_GAUGE_PATCH = `
<script>
(function(){
  if (window.__bfSpeedGauge) return;
  window.__bfSpeedGauge = true;

  var MAXV = 20; // referencia para los 5 segmentos (más lleno = más rápido)
  function fillCount(v){ return Math.max(0, Math.min(5, Math.round(v / MAXV * 5))); }
  function segs(v, compact){
    var n = fillCount(v);
    var s = '<span class="bf-vel-segs' + (compact ? ' bf-vel-compact' : '') + '">';
    for (var i=0;i<5;i++) s += '<span class="bf-vel-seg' + (i<n ? ' on' : '') + '"></span>';
    return s + '</span>';
  }
  function gauge(v, compact){
    return '<span class="bf-vel-gauge" title="Velocidad ' + v + '"><span class="bf-vel-ico">⚡</span>' + segs(v, compact) + '</span>';
  }

  var css = ''+
  '.bf-vel-gauge{display:inline-flex;align-items:center;gap:3px;vertical-align:middle;line-height:1;white-space:nowrap}'+
  '.bf-vel-ico{font-size:12px;color:#FFD24A;filter:drop-shadow(0 0 3px rgba(255,210,74,.7));line-height:1}'+
  '.bf-vel-segs{display:inline-flex;gap:2px}'+
  '.bf-vel-seg{width:5px;height:11px;border-radius:2px;background:#2a2030;border:1px solid #15101e}'+
  '.bf-vel-seg.on{background:linear-gradient(180deg,#ffe27a,#FFD24A);border-color:#a9771f;box-shadow:0 0 4px rgba(255,210,74,.55)}'+
  '.bf-vel-compact .bf-vel-seg{width:3px;height:8px}'+
  '.bf-vel-compact.bf-vel-segs{gap:1.5px}'+
  // Indicador en la carta de subasta: esquina superior izquierda, bajo la moneda
  '.bf-vel-auction{position:absolute;top:62px;left:14px;z-index:6;display:inline-flex;align-items:center;gap:3px;padding:3px 6px 3px 4px;border-radius:8px;background:rgba(10,6,16,.72);border:1px solid rgba(255,210,74,.4);backdrop-filter:blur(2px)}'+
  '.bf-vel-auction .bf-vel-ico{font-size:10px}'+
  '.bf-vel-auction .bf-vel-seg{width:4px;height:9px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function numFromTxt(t){ var m = String(t).match(/-?\\d+(\\.\\d+)?/); return m ? parseFloat(m[0]) : null; }

  function patchBadges(){
    // Batalla — "VEL X" → barra
    document.querySelectorAll('.vel-badge').forEach(function(el){
      if (el.querySelector('.bf-vel-gauge')) return;
      var v = numFromTxt(el.textContent);
      if (v == null) return;
      el.innerHTML = gauge(v);
    });
    // Barra de turnos — "vX" → barra compacta
    document.querySelectorAll('.ctb-vel').forEach(function(el){
      if (el.querySelector('.bf-vel-gauge')) return;
      var v = numFromTxt(el.textContent);
      if (v == null) return;
      el.innerHTML = gauge(v, true);
    });
    // Etiqueta de nombre — sustituye solo el "vX" conservando el icono de rol
    document.querySelectorAll('.vel-tag').forEach(function(el){
      if (el.querySelector('.bf-vel-gauge')) return;
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var node, hit = null;
      while ((node = w.nextNode())) {
        var m = node.nodeValue.match(/v\\s*(-?\\d+(\\.\\d+)?)/i);
        if (m) { hit = { node: node, index: m.index, len: m[0].length }; break; }
      }
      if (!hit) return;
      var v = parseFloat(hit.node.nodeValue.slice(hit.index, hit.index + hit.len).replace(/[^\\d.-]/g, ''));
      var span = document.createElement('span');
      span.className = 'bf-vel-gauge';
      span.innerHTML = '<span class="bf-vel-ico" style="font-size:10px">⚡</span>' + segs(v, true);
      hit.node.nodeValue = hit.node.nodeValue.slice(0, hit.index) + hit.node.nodeValue.slice(hit.index + hit.len);
      hit.node.parentNode.insertBefore(span, hit.node.nextSibling);
    });
  }

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
    rec.querySelectorAll('.cardface.bf-hero-card').forEach(function(card){
      var statEl = card.querySelector('.bf-stat-' + key);
      if (!statEl) return;
      var v = numFromTxt(statEl.textContent);
      if (v == null) return;
      var old = card.querySelector('.bf-vel-auction');
      if (old && card.getAttribute('data-bf-velphase') === ph) return; // ya puesto esta fase
      if (old) old.remove();
      var g = document.createElement('span');
      g.className = 'bf-vel-auction';
      g.innerHTML = '<span class="bf-vel-ico">⚡</span>' + segs(v, false);
      card.appendChild(g);
      card.setAttribute('data-bf-velphase', ph);
    });
  }

  function tick(){ patchBadges(); patchAuction(); }
  setInterval(tick, 280);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
  var lastT = 0;
  new MutationObserver(function(){ var n = Date.now(); if (n - lastT < 200) return; lastT = n; tick(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;