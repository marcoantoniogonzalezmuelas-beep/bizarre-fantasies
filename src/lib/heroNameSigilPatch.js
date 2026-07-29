// Sustituye el emoji de clan "aleatorio" (heroEmoji) por el SIGILO de raza SVG
// (raceSigilSvg) junto al nombre del héroe — en equipamiento, batalla y panel
// de acciones. La lógica visual del rectángulo de batalla (arte degradado +
// tintes anime + velo de sangre) vive en battleAnimePatch.js.
export const HERO_NAME_SIGIL_PATCH = `
<script>
(function(){
  if(window.__bfNameSigilPatch)return;
  window.__bfNameSigilPatch=true;
  var css='.bf-name-sigil{display:inline-flex;vertical-align:middle;width:18px;height:18px;border-radius:50%;align-items:center;justify-content:center;background:radial-gradient(circle at 34% 28%,color-mix(in srgb,var(--clan,#caa14a) 55%,transparent),color-mix(in srgb,var(--clan,#caa14a) 80%,transparent) 45%,#1a1420);border:1.5px solid color-mix(in srgb,var(--clan,#caa14a) 60%,transparent);box-shadow:0 2px 5px rgba(0,0,0,.5),0 0 7px color-mix(in srgb,var(--clan,#caa14a) 35%,transparent);margin-right:5px;flex-shrink:0;position:relative;top:-1px}.bf-name-sigil svg{width:12px;height:12px;display:block}.active-hero-name .bf-name-sigil{width:24px;height:24px;margin-right:8px;top:0}.active-hero-name .bf-name-sigil svg{width:16px;height:16px}.eq-hero-name .bf-name-sigil{width:20px;height:20px}.eq-hero-name .bf-name-sigil svg{width:13px;height:13px}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  function install(){
    if(typeof window.bfRaceSigilSvg!=='function')return false;
    if(window.heroEmoji&&window.heroEmoji.__bfSigil)return true;
    var fn=function(h){try{var clan=(h&&h.clan)||'';var col=(h&&h.clanColor)||'#caa14a';return '<span class="bf-name-sigil" style="--clan:'+col+'" title="'+clan+'">'+window.bfRaceSigilSvg(clan,col)+'</span>';}catch(e){return '';}};
    fn.__bfSigil=1;window.heroEmoji=fn;return true;
  }
  var t=0,timer=setInterval(function(){t++;if(install()||t>120)clearInterval(timer);},120);
  install();
})();
</script>
`;