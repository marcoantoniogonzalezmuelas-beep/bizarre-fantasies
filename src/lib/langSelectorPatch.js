// Selector de idioma 🇪🇸/🇬🇧 anclado dentro de la portada del juego (s-title).
// Al formar parte del contenido del juego, escala con el zoom y con la vista
// móvil/tablet, y desaparece automáticamente al salir de la portada.
export const buildLangSelectorPatch = (lang) => `
<script>
(function(){
  if (window.__bfLangSelPatch) return;
  window.__bfLangSelPatch = true;
  var LANG = ${JSON.stringify(lang === 'en' ? 'en' : 'es')};

  function add(){
    var title = document.getElementById('s-title');
    if (!title || document.getElementById('bf-lang-sel')) return;
    if (getComputedStyle(title).position === 'static') title.style.position = 'relative';

    var wrap = document.createElement('div');
    wrap.id = 'bf-lang-sel';
    wrap.style.cssText = 'position:absolute;top:10px;right:10px;z-index:80;display:flex;border:1.5px solid rgba(255,210,74,.7);border-radius:999px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.65),0 0 14px rgba(255,210,74,.35);';

    var FLAG_ES = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><rect width="60" height="13.3" fill="%23c40037"/><rect y="13.3" width="60" height="13.4" fill="%23ffffff"/><rect y="26.7" width="60" height="13.3" fill="%23c40037"/></svg>';
    var FLAG_EN = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><rect width="60" height="40" fill="%23012a44"/><path d="M0 0L12 0L60 28L60 40L48 40L0 12Z" fill="%23ffffff"/><path d="M48 0L60 0L60 12L12 40L0 40L0 28Z" fill="%23ffffff"/><path d="M0 0L8 0L60 32L60 40L52 40L0 8Z" fill="%23c41e30"/><path d="M52 0L60 0L60 8L8 40L0 40L0 32Z" fill="%23c41e30"/><rect x="24" width="12" height="40" fill="%23ffffff"/><rect y="14" width="60" height="12" fill="%23ffffff"/><rect x="26" width="8" height="40" fill="%23c41e30"/><rect y="16" width="60" height="8" fill="%23c41e30"/></svg>';

    function btn(l, label, flagUrl){
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', l === 'es' ? 'Español' : 'English');
      b.style.cssText = 'display:flex;align-items:center;gap:5px;padding:6px 11px;font-size:12px;font-weight:900;letter-spacing:.04em;border:0;cursor:pointer;line-height:1;' +
        (LANG === l
          ? 'background:linear-gradient(180deg,#ffe27a,#FFD24A,#c8901f);color:#3a2600;'
          : 'background:rgba(18,10,30,.92);color:#e2cf9a;');
      var img = document.createElement('img');
      img.src = flagUrl;
      img.alt = '';
      img.style.cssText = 'width:18px;height:12px;border-radius:1px;object-fit:cover;flex-shrink:0;';
      b.appendChild(img);
      b.appendChild(document.createTextNode(label));
      b.onclick = function(e){
        e.preventDefault(); e.stopPropagation();
        if (LANG !== l) { try { window.parent.postMessage({ bfSetLang: l }, '*'); } catch (err) {} }
      };
      return b;
    }

    wrap.appendChild(btn('es', 'ES', FLAG_ES));
    wrap.appendChild(btn('en', 'EN', FLAG_EN));
    title.appendChild(wrap);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add);
  else add();
  new MutationObserver(add).observe(document.documentElement, { childList:true, subtree:true });
})();
</script>
`;