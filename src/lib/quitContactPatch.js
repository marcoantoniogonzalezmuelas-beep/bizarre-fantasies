// Parche: agranda el botón "⌂ Salir" (arriba a la derecha) y añade en la
// portada un botón recogido "¡Contacta Con Los Bizarros!" con icono épico que
// despliega la explicación al hacer clic. El texto (etiqueta + cuerpo) lo
// configura el admin desde la entidad HomeText; si no hay, usa los valores por
// defecto. Va elevado para no chocar en móvil con Punkito ni con el Oráculo.
const CONTACT_ICON = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/448e1c85d_generated_image.png';
const DEFAULT_LABEL = '¡Contacta Con Los Bizarros!';
const DEFAULT_LABEL_EN = 'Contact The Bizarros!';
const DEFAULT_BODY = 'Escríbenos a retrolandbcn@gmail.com y cuéntanos tus ideas: cartas que quieras crear, mejorar, empeorar, subir de nivel… lo que sea. Además lo iremos haciendo por los rankings.';
const DEFAULT_BODY_EN = 'Write to us at retrolandbcn@gmail.com and share your ideas: cards you’d like to create, improve, weaken, level up… anything goes. We’ll roll them out through the rankings too.';

export function buildQuitContactPatch(texts) {
  const label = (texts && texts.contactLabel) || DEFAULT_LABEL;
  const labelEn = (texts && texts.contactLabelEn) || DEFAULT_LABEL_EN;
  const body = (texts && texts.contactBody) || DEFAULT_BODY;
  const bodyEn = (texts && texts.contactBodyEn) || DEFAULT_BODY_EN;
  return `
<script>
(function(){
  if (window.__bfQuitContactPatch) return;
  window.__bfQuitContactPatch = true;

  var CONTACT_ICON = ${JSON.stringify(CONTACT_ICON)};
  var LABEL_ES = ${JSON.stringify(label)};
  var LABEL_EN = ${JSON.stringify(labelEn)};
  var BODY_ES = ${JSON.stringify(body)};
  var BODY_EN = ${JSON.stringify(bodyEn)};
  function pick(es,en){ return (window.__bfLangEn ? en : es); }
  var LABEL = pick(LABEL_ES, LABEL_EN);
  var BODY = pick(BODY_ES, BODY_EN);
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
    // Modal de "Salir" — SIEMPRE la ventanita limpia (sin fondo/overlay negro),
    // para todos los casos y dispositivos. El overlay no bloquea la pantalla
    // detrás (pointer-events:none); solo el cuadro es interactivo. Ventanita
    // estándar: borde dorado, fondo oscuro, compacta, flotando junto al botón.
    '@keyframes bfQuitZoom{from{opacity:0;transform:scale(.9) translateY(-6px);}to{opacity:1;transform:scale(1) translateY(0);}}',
    '.bf-confirm-overlay{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;pointer-events:none!important;padding:0!important;align-items:flex-start!important;justify-content:flex-end!important}',
    '.bf-confirm-box{pointer-events:auto!important;position:relative!important;top:70px!important;right:12px!important;margin:0!important;width:min(320px,calc(100vw - 24px))!important;max-width:min(320px,calc(100vw - 24px))!important;animation:bfQuitZoom .18s ease-out!important;}',
    // Solo el modal de "Salir" (marcado con .bf-quit) se reencuadra como
    // ventanita compacta junto al botón. Los demás modales del juego
    // (Aprende a jugar, Razas, info de héroe…) siguen abriéndose centrados.
    '#modalRoot .mo.bf-quit{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;pointer-events:none!important;animation:none!important;padding:0!important;}',
    '#modalRoot .mo.bf-quit>.mb{pointer-events:auto!important;position:fixed!important;top:74px!important;right:12px!important;left:auto!important;width:min(320px,calc(100vw - 24px))!important;max-width:min(320px,calc(100vw - 24px))!important;margin:0!important;transform:none!important;animation:bfQuitZoom .18s ease-out!important;}'
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
  // Marca el modal de "Salir" (abierto por quitToHome) con la clase bf-quit,
  // para que el reencuadre compacto solo le afecte a él. Los demás modales
  // del juego no llevan la clase y se abren centrados como siempre. El
  // observer se dispara como microtask antes de pintar → sin parpadeo.
  function markQuitModal(){
    var root=document.getElementById('modalRoot'); if(!root)return;
    var mo=root.querySelector('.mo');
    if(mo && !mo.classList.contains('bf-quit')){
      if(/Salir de la partida|Salir al inicio/i.test(mo.textContent||'')){
        mo.classList.add('bf-quit');
      }
    }
  }
  function setupQuitMark(){
    var root=document.getElementById('modalRoot'); if(!root)return false;
    new MutationObserver(markQuitModal).observe(root,{childList:true,subtree:true});
    return true;
  }
  function whenRoot(){
    if(setupQuitMark()) return;
    new MutationObserver(function(){ if(setupQuitMark()) this.disconnect(); }).observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',whenRoot);
  else whenRoot();

  function watchModal(){
    var last=null;
    setInterval(function(){
      // Solo el modal de Salir (.bf-quit) dispara el scroll y oculta la zona
      // táctil del botón. Los demás modales no se ven afectados.
      var ov=document.querySelector('#modalRoot .mo.bf-quit');
      if(ov&&ov!==last){
        last=ov;
        if(hitEl) hitEl.style.display='none';
        var box=ov.querySelector('.mb')||ov;
        // Pequeño retardo para que el CSS de posicionamiento aplique.
        setTimeout(function(){scrollToModal(box);},60);
      }else if(!ov){last=null; if(hitEl) hitEl.style.display='';}
    },250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchModal);
  else watchModal();

  // Móvil/tablet: zona táctil invisible muy ampliada (~48px) alrededor del
  // botón "Salir" para que sea muy fácil acertar al pulsar sin apuntar con
  // precisión. La zona es transparente, sigue al botón al reposicionarse y
  // reenvía el toque.
  function patchHomeHit(){
    if (!isTouch) return;
    var btn = document.getElementById('homeBtn');
    if (!btn || btn.dataset.bfHit === '1') return;
    btn.dataset.bfHit = '1';
    var hit = document.createElement('div');
    hit.className = 'bf-home-hit';
    hit.setAttribute('aria-hidden', 'true');
    function sync(){
      var r = btn.getBoundingClientRect();
      if (!r.width) return;
      // Zona táctil muy ampliada (~48px) alrededor del botón: bastante mayor
      // que el botón visible para que acertar al pulsar "Salir" sea muy fácil
      // en móvil sin need de apuntar con precisión.
      var pad = 48;
      var s = hit.style;
      s.position = 'fixed';
      s.width = (r.width + pad*2) + 'px';
      s.height = (r.height + pad*2) + 'px';
      s.left = (r.left - pad) + 'px';
      s.top = (r.top - pad) + 'px';
    }
    function fire(e){ e.preventDefault(); e.stopPropagation(); btn.click(); }
    hit.addEventListener('click', fire);
    hit.addEventListener('touchstart', fire, { passive:false });
    document.body.appendChild(hit);
    hitEl = hit;
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', function(){ setTimeout(sync, 300); });
    window.addEventListener('scroll', sync, true);
    setInterval(sync, 400);
  }
  var hitEl = null;
  var hitStyle = document.createElement('style');
  hitStyle.textContent = '.bf-home-hit{position:fixed;z-index:5990;background:transparent;border:0;cursor:pointer;pointer-events:auto;}';
  document.head.appendChild(hitStyle);
  function ensureHomeHit(){
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', patchHomeHit); }
    else patchHomeHit();
    new MutationObserver(function(){ var n=Date.now(); if(n-(patchHomeHit._t||0)<400)return; patchHomeHit._t=n; patchHomeHit(); }).observe(document.documentElement, { childList:true, subtree:true });
  }
  ensureHomeHit();

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