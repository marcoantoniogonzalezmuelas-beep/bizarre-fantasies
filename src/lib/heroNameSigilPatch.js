// Sustituye el emoji de clan "aleatorio" (heroEmoji) por el SIGILO de raza SVG
// (raceSigilSvg) junto al nombre del héroe — en equipamiento, batalla y panel
// de acciones. Además, en la batalla, inyecta el arte DEL héroe difuminado en
// el rectángulo derecho de cada .bhero (como ya hace el panel de acciones con
// .bf-action-bg), para dar profundidad al recuadro.
export const HERO_NAME_SIGIL_PATCH = `
<script>
(function(){
  if(window.__bfNameSigilPatch)return;
  window.__bfNameSigilPatch=true;

  var css=''+
  '.bf-name-sigil{display:inline-flex;vertical-align:middle;width:18px;height:18px;border-radius:50%;align-items:center;justify-content:center;background:radial-gradient(circle at 34% 28%,color-mix(in srgb,var(--clan,#caa14a) 55%,transparent),color-mix(in srgb,var(--clan,#caa14a) 80%,transparent) 45%,#1a1420);border:1.5px solid color-mix(in srgb,var(--clan,#caa14a) 60%,transparent);box-shadow:0 2px 5px rgba(0,0,0,.5),0 0 7px color-mix(in srgb,var(--clan,#caa14a) 35%,transparent);margin-right:5px;flex-shrink:0;position:relative;top:-1px}'+
  '.bf-name-sigil svg{width:12px;height:12px;display:block}'+
  '.active-hero-name .bf-name-sigil{width:24px;height:24px;margin-right:8px;top:0}'+
  '.active-hero-name .bf-name-sigil svg{width:16px;height:16px}'+
  '.eq-hero-name .bf-name-sigil{width:20px;height:20px}'+
  '.eq-hero-name .bf-name-sigil svg{width:13px;height:13px}'+
  // Arte degradado del héroe en el panel derecho del .bhero (batalla).
  '.bf-bhero-bgart{position:absolute;left:122px;right:0;top:0;bottom:0;z-index:1;pointer-events:none;background-size:cover;background-position:center 18%;background-repeat:no-repeat;filter:blur(7px) saturate(1.2) brightness(.55);opacity:.6}'+
  '.bf-bhero-bgart::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(14,9,22,.96) 0%,rgba(14,9,22,.5) 26%,rgba(14,9,22,.5) 74%,rgba(14,9,22,.92) 100%),linear-gradient(180deg,rgba(14,9,22,.35),rgba(14,9,22,.72))}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // Reemplaza heroEmoji por el sigilo de raza. El juego llama heroEmoji(h) en
  // los templates de .bhero-name, .eq-hero-name y .active-hero-name, así que al
  // redefinir la función global se cambia en todos los sitios a la vez.
  function install(){
    if(typeof window.bfRaceSigilSvg!=='function')return false;
    if(window.heroEmoji&&window.heroEmoji.__bfSigil)return true;
    var fn=function(h){
      try{
        var clan=(h&&h.clan)||'';
        var col=(h&&h.clanColor)||'#caa14a';
        var svg=window.bfRaceSigilSvg(clan,col);
        return '<span class="bf-name-sigil" style="--clan:'+col+'" title="'+clan+'">'+svg+'</span>';
      }catch(e){return '';}
    };
    fn.__bfSigil=1;
    window.heroEmoji=fn;
    return true;
  }

  // Inyecta/actualiza el arte degradado del héroe en el panel derecho de cada .bhero.
  function injectBgArt(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var art=card.querySelector('.bf-battle-art');
      if(!art)return;
      var bg=art.style.backgroundImage||'';
      if(!bg||bg==='none')return;
      var el=card.querySelector('.bf-bhero-bgart');
      if(!el){el=document.createElement('div');el.className='bf-bhero-bgart';card.insertBefore(el,card.firstChild);}
      if(el.style.backgroundImage!==bg) el.style.backgroundImage=bg;
    });
  }

  function hookRender(){
    if(typeof window.renderBattle!=='function'||window.renderBattle.__bfBgArt)return;
    var o=window.renderBattle;
    window.renderBattle=function(){o.apply(this,arguments);try{injectBgArt();}catch(e){}};
    window.renderBattle.__bfBgArt=1;
  }

  var t=0,timer=setInterval(function(){t++;install();hookRender();injectBgArt();if(t>120)clearInterval(timer);},120);
  install();hookRender();injectBgArt();
  new MutationObserver(function(){injectBgArt();}).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>
`;