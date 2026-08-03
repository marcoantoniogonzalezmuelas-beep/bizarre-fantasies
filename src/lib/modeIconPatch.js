// Parche inyectado en el iframe: sustituye los emojis de las cartas de modo
// (vs IA 🤖 y Multijugador 🌐) por ilustraciones IA con estética dark fantasy
// de la app. El juego reemplaza el innerHTML de #s-setup en cada render, así
// que re-aplicamos en cada tick mientras la pantalla de setup esté activa.
export const MODE_ICON_PATCH = `
<script>
(function(){
  if(window.__bfModeIconPatch)return;
  window.__bfModeIconPatch=true;

  var ICONS={
    'vs IA':'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/25bfb76a3_generated_image.png',
    'Multijugador':'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/4eac06c37_generated_image.png'
  };

  var st=document.createElement('style');
  st.textContent=[
    '.mode-icon{display:flex!important;align-items:center!important;justify-content:center!important;width:72px!important;height:72px!important;margin:0 auto 6px!important;border-radius:14px!important;overflow:hidden!important;background:radial-gradient(circle at 50% 35%,rgba(48,34,84,.55),rgba(10,7,20,.9))!important;border:1.5px solid rgba(255,210,74,.3)!important;box-shadow:0 4px 14px rgba(0,0,0,.5),inset 0 0 18px rgba(192,107,255,.12)!important}',
    '.mode-card.active .mode-icon{border-color:rgba(255,210,74,.7)!important;box-shadow:0 4px 14px rgba(0,0,0,.5),0 0 16px rgba(255,210,74,.3),inset 0 0 22px rgba(255,210,74,.1)!important}',
    '.mode-icon img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}'
  ].join('');
  document.head.appendChild(st);

  function patchIcons(){
    var setup=document.getElementById('s-setup');
    if(!setup||!setup.classList.contains('active'))return;
    setup.querySelectorAll('.mode-card').forEach(function(card){
      var icon=card.querySelector('.mode-icon');
      var label=card.querySelector('.mode-label');
      if(!icon||!label)return;
      var key=label.textContent.trim();
      var url=ICONS[key];
      if(!url)return;
      if(icon.dataset.bfIcon===url)return;
      icon.innerHTML='<img src="'+url+'" alt="'+key+'">';
      icon.dataset.bfIcon=url;
    });
  }

  setInterval(patchIcons,400);
  if(document.readyState!=='loading')patchIcons();
  else document.addEventListener('DOMContentLoaded',patchIcons);
})();
</script>
`;