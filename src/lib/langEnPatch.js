// Parche de traducción inyectado en el iframe del juego cuando el idioma
// elegido es inglés. Traduce en vivo (nodos de texto + atributos) usando el
// diccionario ES→EN y vigila el DOM con un MutationObserver. Los nodos que la
// lógica del juego lee por texto (nombres de carta, estados, etiquetas de arte)
// NO se tocan para no romper la detección interna.
import { DICT_EXACT, DICT_WORDS } from '@/lib/translationsEn';

export function buildLangEnPatch(lang) {
  if (lang !== 'en') return '';
  return `
<script>
(function(){
  if (window.__bfLangEn) return;
  window.__bfLangEn = true;
  var EXACT = ${JSON.stringify(DICT_EXACT)};
  var WORDS = ${JSON.stringify(DICT_WORDS)};
  // Elementos cuyo texto usa la lógica del juego (detección por nombre/estado).
  var SKIP = '.bhero-status,.hand-lbl,.ctb-hero-name,.cf-name,.bhero-name,.bf-hero-name,.bf-chip-name,.shop-name,.bf-shop-name,.bsum-hero,input,textarea';
  function esc(s){ return s.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&'); }
  var LETTER = 'A-Za-z\\u00c0-\\u00ff';
  var WORD_RES = Object.keys(WORDS).sort(function(a,b){ return b.length-a.length; }).map(function(k){
    return { re: new RegExp('(^|[^' + LETTER + '])' + esc(k) + '(?=$|[^' + LETTER + '])', 'g'), to: WORDS[k] };
  });
  function tr(t){
    var k = t.trim();
    if (EXACT[k] != null) return t.replace(k, EXACT[k]);
    var out = t;
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
    try {
      var wkr = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var n; while ((n = wkr.nextNode())) transNode(n);
      document.querySelectorAll('[placeholder],[title],[aria-label]').forEach(transAttrs);
    } catch(e) {}
  }
  var pend = null;
  function queue(){ if (pend) return; pend = setTimeout(function(){ pend = null; scan(); }, 180); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  new MutationObserver(queue).observe(document.documentElement, { childList:true, subtree:true, characterData:true });
})();
</script>
`;
}