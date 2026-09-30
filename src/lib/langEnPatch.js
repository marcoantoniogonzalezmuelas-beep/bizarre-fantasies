// Parche de traducción inyectado en el iframe del juego cuando el idioma
// elegido es inglés. Traduce en vivo (nodos de texto + atributos) usando el
// diccionario ES→EN y vigila el DOM con un MutationObserver. Los nodos que la
// lógica del juego lee por texto (nombres de carta, estados, etiquetas de arte)
// NO se tocan para no romper la detección interna.
import { DICT_EXACT, DICT_WORDS, DICT_PATTERNS } from '@/lib/translationsEn';

export function buildLangEnPatch(lang) {
  if (lang !== 'en') return '';
  return `
<script>
(function(){
  if (window.__bfLangEn) return;
  window.__bfLangEn = true;
  var EXACT = ${JSON.stringify(DICT_EXACT)};
  var WORDS = ${JSON.stringify(DICT_WORDS)};
  var PATS = ${JSON.stringify(DICT_PATTERNS)}.map(function(p){ return { re: new RegExp(p[0], 'g'), to: p[1] }; });
  // Elementos cuyo texto usa la lógica del juego (detección por nombre/estado).
  var SKIP = '.bf-tip,.bhero-status,.hand-lbl,.ctb-hero-name,.cf-name,.bhero-name,.bf-hero-name,.bf-chip-name,.shop-name,.bf-shop-name,.bsum-hero,input,textarea';
  function esc(s){ return s.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&'); }
  var LETTER = 'A-Za-z\\u00c0-\\u00ff';
  var WORD_RES = Object.keys(WORDS).sort(function(a,b){ return b.length-a.length; }).map(function(k){
    return { re: new RegExp('(^|[^' + LETTER + '])' + esc(k) + '(?=$|[^' + LETTER + '])', 'g'), to: WORDS[k] };
  });
  function tr(t){
    var k = t.trim();
    if (EXACT[k] != null) return t.replace(k, EXACT[k]);
    var out = t;
    for (var j = 0; j < PATS.length; j++) out = out.replace(PATS[j].re, PATS[j].to);
    for (var i = 0; i < WORD_RES.length; i++) out = out.replace(WORD_RES[i].re, function(m, p1){ return p1 + WORD_RES[i].to; });
    return out;
  }
  function transNode(n){
    if (n.__bfT === n.textContent) return;
    var p = n.parentElement;
    if (!p || p.closest('script,style,' + SKIP)) return;
    var t = n.textContent;
    if (!t || !/[A-Za-z\\u00c0-\\u00ff\\u00bf\\u00a1]/.test(t)) return;
    var out = tr(t);
    if (out !== t) n.textContent = out;
    n.__bfT = n.textContent;
  }
  function transAttrs(el){
    ['placeholder','title','aria-label'].forEach(function(a){
      var v = el.getAttribute(a);
      if (!v) return;
      var out = tr(v);
      if (out !== v) el.setAttribute(a, out);
    });
  }
  function scan(){
    lastFull = Date.now();
    try {
      var wkr = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var n; while ((n = wkr.nextNode())) transNode(n);
      document.querySelectorAll('[placeholder],[title],[aria-label]').forEach(transAttrs);
    } catch(e) {}
  }
  // Diccionario dinámico de textos de cartas (habilidades, títulos,
  // descripciones) que envía la página con las traducciones de la base de
  // datos. Al llegar, se reinicia la caché de nodos y se re-escanea.
  window.addEventListener('message', function(e){
    if (!e.data || !e.data.bfCardDict) return;
    var added = 0;
    for (var k in e.data.bfCardDict) { EXACT[k] = e.data.bfCardDict[k]; added++; }
    window.__bfCardDictCount = added;
    try {
      var w2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var n2; while ((n2 = w2.nextNode())) n2.__bfT = null;
    } catch(err) {}
    scan();
  });
  // Incremental: solo se traducen los nodos que cambiaron (añadidos o con texto editado).
  // El recorrido completo (por si cambió algún atributo sin nodos nuevos) se hace como
  // mucho cada 2 s y solo si hubo cambios. Antes: recorrido completo cada 180 ms, y en
  // combate hay mutaciones continuas (números de daño, contadores).
  var dirty = new Set(), pend = null, fullTimer = null, lastFull = 0;
  function scanRoot(root){
    try {
      if (root.nodeType === 3) { transNode(root); return; }
      if (root.nodeType !== 1 || !root.isConnected) return;
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) transNode(n);
      transAttrs(root);
      root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(transAttrs);
    } catch(e) {}
  }
  // Dos temporizadores independientes: los nodos cambiados se traducen a los 120 ms
  // SIEMPRE; el recorrido completo va aparte y nunca retrasa a los anteriores.
  function flushDirty(){
    pend = null;
    var roots = Array.from(dirty); dirty.clear();
    roots.forEach(scanRoot);
  }
  function runFull(){ fullTimer = null; dirty.clear(); scan(); }
  function queue(records){
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (r.type === 'characterData') dirty.add(r.target);
      else for (var j = 0; j < r.addedNodes.length; j++) dirty.add(r.addedNodes[j]);
    }
    if (!pend) pend = setTimeout(flushDirty, 120);
    if (!fullTimer) fullTimer = setTimeout(runFull, Math.max(120, 2000 - (Date.now() - lastFull)));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  new MutationObserver(queue).observe(document.documentElement, { childList:true, subtree:true, characterData:true });
})();
</script>
`;
}