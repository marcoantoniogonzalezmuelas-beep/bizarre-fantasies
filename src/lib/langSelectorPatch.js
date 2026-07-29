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

    var FLAG_ES = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f1ea-1f1f8.svg';
    var FLAG_EN = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f1ec-1f1e7.svg';

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