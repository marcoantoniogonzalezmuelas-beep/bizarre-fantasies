// Portada: tres accesos principales (Aprende a jugar, Habitación Bizarra y
// Top Ranking). Reglas y Razas se trasladan junto al Oráculo desde React.
export const HOME_MENU_PATCH = `
<script>
(function(){
  if(window.__bfHomeMenuPatch)return;
  window.__bfHomeMenuPatch=true;
  var ICON='https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/6f23172d1_generated_image.png';

  function openBizarre(){
    try{
      if(typeof goSetup==='function')goSetup();
      if(typeof setMode==='function')setMode('mp');
      if(typeof enterLobby==='function')enterLobby();
      var tries=0,iv=setInterval(function(){
        var entry=document.getElementById('bf-bizarre-entry');
        if(entry){clearInterval(iv);entry.click();}
        else if(tries++>30)clearInterval(iv);
      },100);
    }catch(e){}
  }

  function install(){
    var links=document.querySelector('#s-title .title-links');
    if(!links)return;
    links.querySelectorAll('button').forEach(function(btn){
      var txt=(btn.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase();
      if(/^reglas$|^rules$|^razas$|^races$/.test(txt))btn.style.setProperty('display','none','important');
    });
    var btn=document.getElementById('bf-bizarre-home-btn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='bf-bizarre-home-btn';
      btn.className='btn sm';
      btn.innerHTML='<span class="tc-img"><img src="'+ICON+'" alt=""></span><span>'+(window.__bfLangEn?'Bizarre<br>Room':'Habitación<br>Bizarra')+'</span>';
      btn.onclick=openBizarre;
    }
    var ranking=document.getElementById('bf-ranking-btn');
    if(ranking&&btn.parentNode!==links)links.insertBefore(btn,ranking);
    else if(!btn.parentNode)links.appendChild(btn);
  }
  install();
  (window.bfDom?window.bfDom.on(install):new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true}));
})();
</script>
`;