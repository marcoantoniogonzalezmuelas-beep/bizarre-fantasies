// Parche: agranda el botón "⌂ Salir" (arriba a la derecha) y añade en la
// portada un botón recogido "¡Contacta Con Los Bizarros!" con icono épico que
// despliega la explicación al hacer clic. El texto (etiqueta + cuerpo) lo
// configura el admin desde la entidad HomeText; si no hay, usa los valores por
// defecto. Va elevado para no chocar en móvil con Punkito ni con el Oráculo.
const CONTACT_ICON = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/448e1c85d_generated_image.png';
const DEFAULT_LABEL = '¡Contacta Con Los Bizarros!';
const DEFAULT_BODY = 'Escríbenos a retrolandbcn@gmail.com y cuéntanos tus ideas: cartas que quieras crear, mejorar, empeorar, subir de nivel… lo que sea. Además lo iremos haciendo por los rankings.';

export function buildQuitContactPatch(texts) {
  const label = (texts && texts.contactLabel) || DEFAULT_LABEL;
  const body = (texts && texts.contactBody) || DEFAULT_BODY;
  return `
<script>
(function(){
  if (window.__bfQuitContactPatch) return;
  window.__bfQuitContactPatch = true;

  var CONTACT_ICON = ${JSON.stringify(CONTACT_ICON)};
  var LABEL = ${JSON.stringify(label)};
  var BODY = ${JSON.stringify(body)};
  function linkify(s){ return String(s).replace(/([^\\s@]+@[^\\s@]+\\.[^\\s@]+)/g, '<a href="mailto:$1">$1</a>'); }

  var style = document.createElement('style');
  style.textContent = [
    '#homeBtn{font-size:19px!important;font-weight:900!important;padding:12px 22px!important;border-radius:14px!important;letter-spacing:.5px;}',
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
    '.bf-contact-body{background:linear-gradient(135deg,#1a0f2e,#2a1040)!important;}',
    // Modal de "Salir" en móvil/tablet: fondo con gradiente radial sutil
    // (oscuro junto al cuadro, casi transparente lejos) para dar contraste
    // sin negro pesado; cuadro posicionado junto al botón Salir (arriba dcha).
    '@media (max-width:1024px){#modalRoot .mo{background:radial-gradient(circle at 88% 12%,rgba(10,7,20,.5),rgba(8,5,14,.12) 70%)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;animation:none!important;padding:0!important}#modalRoot .mo>.mb{position:fixed!important;top:74px!important;right:10px!important;left:auto!important;max-width:min(340px,calc(100vw - 20px))!important;width:auto!important;max-height:72vh!important;margin:0!important;transform:none!important}.bf-confirm-overlay{background:radial-gradient(circle at 88% 12%,rgba(10,7,20,.5),rgba(8,5,14,.12) 70%)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;padding:0!important;align-items:flex-start!important;justify-content:flex-end!important}.bf-confirm-box{position:relative!important;top:64px!important;right:10px!important;margin:0!important;max-width:min(320px,calc(100vw - 20px))!important}}'
  ].join('');
  var isTouch = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') || navigator.maxTouchPoints > 1;
  if (isTouch) style.textContent += '#homeBtn{font-size:28px!important;padding:16px 28px!important;min-height:54px!important;line-height:1!important;}';
  document.head.appendChild(style);

  // Scroll automático visual al modal de salir: cuando aparece el overlay
  // (o el modal nativo), desplaza la vista suavemente hacia arriba para
  // que el cuadro quede visible junto al botón Salir.
  function scrollToModal(el){
    try{
      var r=el.getBoundingClientRect();
      // Lleva el borde superior del cuadro a ~8px del top del viewport.
      var dy=r.top-8;
      if(Math.abs(dy)>4){
        window.scrollTo({top:Math.max(0,window.scrollY+dy),behavior:'smooth'});
        try{window.parent.scrollTo({top:Math.max(0,window.parent.scrollY+dy),behavior:'smooth'});}catch(e){}
      }
    }catch(e){}
  }
  function watchModal(){
    var last=null;
    setInterval(function(){
      var ov=document.querySelector('.bf-confirm-overlay');
      if(!ov){ov=document.querySelector('#modalRoot .mo');}
      if(ov&&ov!==last){
        last=ov;
        var box=ov.querySelector('.bf-confirm-box')||ov.querySelector('.mb')||ov;
        // Pequeño retardo para que el CSS de posicionamiento aplique.
        setTimeout(function(){scrollToModal(box);},60);
      }else if(!ov){last=null;}
    },250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchModal);
  else watchModal();

  function inject(){
    var title = document.getElementById('s-title');
    if (!title || document.getElementById('bf-contact')) return;
    var box = document.createElement('div');
    box.id = 'bf-contact';
    box.className = 'bf-contact';
    box.innerHTML = '<div class="bf-contact-pill"><img src="' + CONTACT_ICON + '" alt=""/><span>' + LABEL + '</span></div>'
      + '<div class="bf-contact-body">' + linkify(BODY) + '</div>';
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
}