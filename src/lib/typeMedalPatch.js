// Parche inyectado en el iframe: el badge de tipo de las cartas de héroe
// (.bf-type-medal, arriba a la derecha) muestra el emblema IA de CC/AD/HE
// ocupando todo el círculo, sin fondo negro/blanco ni borde. El anagrama
// rellena el círculo igual que en el Oráculo y la página de Reglas.
export const TYPE_MEDAL_PATCH = `
<script>
(function(){
  if(window.__bfTypeMedalPatch) return;
  window.__bfTypeMedalPatch = true;

  var EMBLEM = {
    CC: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab147bafb_generated_image.png',
    AD: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fd388871c_generated_image.png',
    HE: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/cfd5e317c_generated_image.png'
  };

  var st = document.createElement('style');
  st.textContent = [
    '.bf-type-medal{background:transparent!important;border:0!important;box-shadow:none!important;}',
    '.bf-type-medal>span{display:none!important;}',
    '.bf-type-medal.bf-emblem{width:44px!important;height:44px!important;border-radius:50%!important;overflow:hidden!important;display:flex!important;align-items:center!important;justify-content:center!important;background:transparent!important;border:0!important;box-shadow:none!important;}',
    '.bf-type-medal.bf-emblem img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;transform:scale(1.85)!important;}'
  ].join('');
  document.head.appendChild(st);

  function patch(){
    document.querySelectorAll('.bf-type-medal').forEach(function(m){
      if (m.classList.contains('bf-emblem') && m.dataset.bfEmblem) return;
      var span = m.querySelector('span');
      var key = span ? span.textContent.trim() : '';
      if (!EMBLEM[key]) return;
      m.classList.add('bf-emblem');
      m.dataset.bfEmblem = key;
      m.innerHTML = '<img src="' + EMBLEM[key] + '" alt="' + key + '">';
    });
  }

  setInterval(patch, 400);
  if (document.readyState !== 'loading') patch();
  else document.addEventListener('DOMContentLoaded', patch);
  var _t = 0;
  new MutationObserver(function(){ var n = Date.now(); if (n - _t < 300) return; _t = n; patch(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;