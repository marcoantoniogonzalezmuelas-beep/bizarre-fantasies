// Parche inyectado en el iframe: añade un cuarto botón "Top Ranking" al menú
// de la portada (junto a Razas) que abre la pantalla del ranking en la app.
export const RANKING_BUTTON_PATCH = `
<script>
(function(){
  if(window.__bfRankingBtn)return;
  window.__bfRankingBtn=true;
  var ICON='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5f6dbe23d_generated_image.png';
  function install(){
    var links=document.querySelector('#s-title .title-links');
    if(!links||document.getElementById('bf-ranking-btn'))return;
    var btn=document.createElement('button');
    btn.id='bf-ranking-btn';
    btn.className='btn sm';
    btn.innerHTML='<span class="tc-img"><img src="'+ICON+'" alt=""></span><span>Top<br>Ranking</span>';
    btn.onclick=function(){window.parent.postMessage({bfNavigate:'/ranking'},'*');};
    links.appendChild(btn);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>
`;