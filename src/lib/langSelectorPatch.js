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
    if (!document.getElementById('bf-intro-pulse-style')) {
      var st = document.createElement('style');
      st.id = 'bf-intro-pulse-style';
      st.textContent = '@keyframes bfIntroPulse{0%,100%{box-shadow:0 0 0 4px rgba(255,210,74,.22),0 8px 22px rgba(0,0,0,.7),0 0 22px rgba(255,210,74,.75),inset 0 0 0 1px rgba(255,233,168,.6)}50%{box-shadow:0 0 0 6px rgba(255,210,74,.4),0 8px 22px rgba(0,0,0,.7),0 0 34px rgba(255,210,74,1),0 0 54px rgba(255,210,74,.5),inset 0 0 0 1px rgba(255,233,168,.8)}}';
      document.head.appendChild(st);
    }
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

    // Botón "Intro" (cinemática de bienvenida) justo debajo del selector
    // de idioma. Pequeño, con diseño de píldora violeta y icono de cine.
    if (!document.getElementById('bf-intro-btn')) {
      var intro = document.createElement('button');
      intro.id = 'bf-intro-btn';
      intro.type = 'button';
      intro.setAttribute('aria-label', 'Intro');
      intro.style.cssText = 'position:absolute !important;top:46px !important;right:8px !important;z-index:92;display:inline-flex;align-items:center;gap:8px;padding:6px 16px 6px 6px;font-family:Cinzel,serif;font-size:15px;font-weight:900;letter-spacing:.16em;border:3px solid #FFD24A;border-radius:999px;cursor:pointer;line-height:1;background:linear-gradient(135deg,#7c1fd6 0%,#b13bff 45%,#5a1f8a 100%);color:#fff7d6;box-shadow:0 0 0 4px rgba(255,210,74,.22),0 8px 22px rgba(0,0,0,.7),0 0 22px rgba(255,210,74,.75),inset 0 0 0 1px rgba(255,233,168,.6);text-shadow:0 1px 3px #000,0 0 12px rgba(255,210,74,.95);animation:bfIntroPulse 1.8s ease-in-out infinite;transition:transform .15s ease;';
      var ico = document.createElement('img');
      ico.src = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c4111d79e_generated_image.png';
      ico.alt = '';
      ico.style.cssText = 'width:34px;height:34px;border-radius:999px;object-fit:cover;flex-shrink:0;box-shadow:0 0 10px rgba(255,210,74,.8),0 0 4px #000;';
      intro.appendChild(ico);
      var lbl = document.createElement('span');
      lbl.textContent = 'INTRO';
      intro.appendChild(lbl);
      intro.onmouseenter = function(){ intro.style.transform='scale(1.08)'; };
      intro.onmouseleave = function(){ intro.style.transform=''; };
      intro.onclick = function(e){ e.preventDefault(); e.stopPropagation(); try { window.parent.postMessage({ bfOpenIntro: true }, '*'); } catch(err){} };
      title.appendChild(intro);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add);
  else add();
  (window.bfDom?window.bfDom.on(add):new MutationObserver(add).observe(document.documentElement,{childList:true,subtree:true}));
})();
</script>
`;