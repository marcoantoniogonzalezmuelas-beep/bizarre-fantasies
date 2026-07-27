// Parche: agranda el botón "⌂ Salir" (arriba a la derecha) y añade en la
// portada un botón recogido "¡Contacta Con Los Bizarros!" con icono épico que
// despliega la explicación al hacer clic. Va elevado para no chocar en móvil
// con Punkito ni con el icono del Oráculo.
const CONTACT_ICON = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/448e1c85d_generated_image.png';

export const QUIT_CONTACT_PATCH = `
<script>
(function(){
  if (window.__bfQuitContactPatch) return;
  window.__bfQuitContactPatch = true;

  var style = document.createElement('style');
  style.textContent = [
    '#homeBtn{font-size:19px!important;font-weight:900!important;padding:12px 22px!important;border-radius:14px!important;letter-spacing:.5px;}',
    // Reserva la esquina superior derecha para el botón Salir: la cabecera de
    // la subasta (insignia de fase) y la de batalla no se meten debajo de él.
    '.r-header{padding-right:130px!important;box-sizing:border-box;}',
    '.b-header{padding-right:130px!important;padding-left:130px!important;box-sizing:border-box;}',
    '@keyframes bfContactGlow{0%,100%{box-shadow:0 0 14px rgba(192,91,255,.45),0 6px 20px rgba(0,0,0,.55);}50%{box-shadow:0 0 26px rgba(255,210,74,.65),0 6px 20px rgba(0,0,0,.55);}}',
    '.bf-contact{position:relative;z-index:500;text-align:center;margin-top:16px;}',
    '.bf-contact-pill{display:inline-flex;align-items:center;gap:9px;cursor:pointer;background:linear-gradient(135deg,#1a0f2eee,#2a1040ee);border:2px solid #c06bff;border-radius:999px;padding:5px 16px 5px 6px;animation:bfContactGlow 3s ease-in-out infinite;backdrop-filter:blur(4px);user-select:none;}',
    '.bf-contact-pill:active{transform:scale(.96);}',
    '.bf-contact-pill img{width:34px;height:34px;border-radius:50%;border:1.5px solid rgba(255,210,74,.7);object-fit:cover;}',
    '.bf-contact-pill span{font-family:Cinzel,serif;font-weight:900;font-size:13px;color:#ffd24a;letter-spacing:1px;text-shadow:0 0 10px rgba(255,210,74,.5);white-space:nowrap;}',
    '.bf-contact-body{display:none;max-width:min(560px,90vw);margin:8px auto 0;background:linear-gradient(135deg,#1a0f2ef2,#2a1040f2);border:2px solid #c06bff;border-radius:14px;padding:14px 18px;font-size:16px;color:#e6ddf5;line-height:1.55;backdrop-filter:blur(4px);box-shadow:0 8px 24px rgba(0,0,0,.6);}',
    '.bf-contact.open .bf-contact-body{display:block;}',
    '.bf-contact a{color:#ff7ad9;font-weight:900;text-decoration:none;text-shadow:0 0 8px rgba(255,122,217,.6);}',
    '.bf-contact a:hover{color:#ffd24a;}',
    '.bf-contact .bf-c-rank{color:#9be26b;font-weight:700;}',
    '.bf-contact-body{background:linear-gradient(135deg,#1a0f2e,#2a1040)!important;}'
  ].join('');
  // En pantallas táctiles (móvil y tablet) el botón Salir va más compacto para
  // no solaparse con los marcadores de la subasta ni de la batalla.
  var isTouch = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') || navigator.maxTouchPoints > 1;
  if (isTouch) style.textContent += '#homeBtn{font-size:15px!important;padding:8px 14px!important;}';
  document.head.appendChild(style);

  function inject(){
    var title = document.getElementById('s-title');
    if (!title || document.getElementById('bf-contact')) return;
    var box = document.createElement('div');
    box.id = 'bf-contact';
    box.className = 'bf-contact';
    box.innerHTML = '<div class="bf-contact-pill"><img src="${CONTACT_ICON}" alt=""/><span>¡Contacta Con Los Bizarros!</span></div>'
      + '<div class="bf-contact-body">Escríbenos a <a href="mailto:retrolandbcn@gmail.com">retrolandbcn@gmail.com</a> y cuéntanos tus ideas: cartas que quieras crear, mejorar, empeorar, subir de nivel… lo que sea. <span class="bf-c-rank">Además lo iremos haciendo por los rankings.</span></div>';
    box.querySelector('.bf-contact-pill').addEventListener('click', function(e){
      e.stopPropagation();
      box.classList.toggle('open');
    });
    var links = title.querySelector('.title-links');
    var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') || navigator.maxTouchPoints > 1;
    if (links) links.insertAdjacentElement(isMobile ? 'beforebegin' : 'afterend', box);
    else title.appendChild(box);
    if (isMobile) box.style.margin = '10px 0';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
  new MutationObserver(inject).observe(document.documentElement, { childList:true, subtree:true });
})();
</script>
`;