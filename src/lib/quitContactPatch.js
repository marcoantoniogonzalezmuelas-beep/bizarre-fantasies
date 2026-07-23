// Parche: agranda el botón "⌂ Salir" (arriba a la derecha) y añade en la
// portada un aviso bizarro de contacto por email para proponer ideas y cartas.
export const QUIT_CONTACT_PATCH = `
<script>
(function(){
  if (window.__bfQuitContactPatch) return;
  window.__bfQuitContactPatch = true;

  var style = document.createElement('style');
  style.textContent = [
    '#homeBtn{font-size:19px!important;font-weight:900!important;padding:12px 22px!important;border-radius:14px!important;letter-spacing:.5px;}',
    '@keyframes bfContactGlow{0%,100%{box-shadow:0 0 14px rgba(192,91,255,.45),0 6px 20px rgba(0,0,0,.55);}50%{box-shadow:0 0 26px rgba(255,210,74,.65),0 6px 20px rgba(0,0,0,.55);}}',
    '@keyframes bfContactFloat{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(-5px);}}',
    '.bf-contact{position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:60;max-width:min(620px,92vw);background:linear-gradient(135deg,#1a0f2eee,#2a1040ee);border:2px solid #c06bff;border-radius:16px;padding:10px 16px;text-align:center;animation:bfContactGlow 3s ease-in-out infinite,bfContactFloat 5s ease-in-out infinite;backdrop-filter:blur(4px);}',
    '.bf-contact .bf-c-title{font-family:Cinzel,serif;font-weight:900;font-size:14px;color:#ffd24a;letter-spacing:1px;text-shadow:0 0 10px rgba(255,210,74,.5);}',
    '.bf-contact .bf-c-body{font-size:12px;color:#e6ddf5;line-height:1.45;margin-top:3px;}',
    '.bf-contact a{color:#ff7ad9;font-weight:900;text-decoration:none;text-shadow:0 0 8px rgba(255,122,217,.6);}',
    '.bf-contact a:hover{color:#ffd24a;}',
    '.bf-contact .bf-c-rank{color:#9be26b;font-weight:700;}'
  ].join('');
  document.head.appendChild(style);

  function inject(){
    var title = document.getElementById('s-title');
    if (!title || document.getElementById('bf-contact')) return;
    var box = document.createElement('div');
    box.id = 'bf-contact';
    box.className = 'bf-contact';
    box.innerHTML = '<div class="bf-c-title">🧙‍♂️ ¡EL ORÁCULO ESCUCHA TUS BIZARRADAS! 🦆</div>'
      + '<div class="bf-c-body">Escríbenos a <a href="mailto:retrolandbcn@gmail.com">retrolandbcn@gmail.com</a> y cuéntanos tus ideas: cartas que quieras crear, mejorar, empeorar, subir de nivel… lo que sea. <span class="bf-c-rank">Además lo iremos haciendo por los rankings.</span></div>';
    title.appendChild(box);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
  new MutationObserver(inject).observe(document.documentElement, { childList:true, subtree:true });
})();
</script>
`;