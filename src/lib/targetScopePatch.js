// Mirilla de selección compartida por habilidades, hechizos y objetos.
export const TARGET_SCOPE_PATCH = `
<script>
(function(){
  if(window.__bfScopeInstalled)return;
  window.__bfScopeInstalled=true;
  var style=document.createElement('style');
  style.textContent=[
    '#s-battle .bhero.targetable{position:relative;cursor:none!important;animation:none!important;outline:2px solid #ffd97e!important;outline-offset:2px;box-shadow:0 0 0 4px rgba(8,5,14,.8),0 0 22px rgba(255,210,74,.55)!important}',
    '#s-battle .bhero.targetable::before{content:"OBJETIVO ◉";position:absolute;right:8px;top:8px;z-index:20;pointer-events:none;padding:3px 8px;border:1px solid #f7d783;border-radius:4px;background:rgba(8,12,17,.88);color:#fff2bf;font:800 10px Rubik,sans-serif;letter-spacing:1px;text-shadow:0 1px 2px #000}',
    '#s-battle .bhero.targetable:hover{outline-color:#fff!important;box-shadow:0 0 0 5px rgba(255,210,74,.4),0 0 28px #ffd24a!important}',
    '#bf-scope-cursor{position:fixed;left:0;top:0;z-index:100800;width:42px;height:42px;transform:translate(-50%,-50%);border:2px solid #fff3c1;border-radius:50%;pointer-events:none;display:none;background:radial-gradient(circle,#ffeaaa 0 2px,transparent 3px 9px,#ffeaaa 10px 11px,transparent 12px),linear-gradient(90deg,transparent 48%,#fff3c1 49% 51%,transparent 52%),linear-gradient(0deg,transparent 48%,#fff3c1 49% 51%,transparent 52%),rgba(7,12,17,.18);box-shadow:0 0 0 2px #13131b,0 0 0 3px #ffd24a,0 0 10px #ffd24a,inset 0 0 8px #000}',
    '@media(pointer:coarse){#bf-scope-cursor{display:none!important}#s-battle .bhero.targetable{cursor:pointer!important}}'
  ].join('');
  document.head.appendChild(style);
  var lens=document.createElement('div');lens.id='bf-scope-cursor';document.body.appendChild(lens);
  document.addEventListener('pointermove',function(e){
    var card=e.target.closest&&e.target.closest('#s-battle .bhero.targetable');
    lens.style.display=card&&!e.target.closest('.bf-battle-zoom,.bf-gear-icon,button')?'block':'none';
    if(card){lens.style.left=e.clientX+'px';lens.style.top=e.clientY+'px';}
  });
  document.addEventListener('pointerleave',function(){lens.style.display='none';});
  document.addEventListener('pointerdown',function(){lens.style.display='none';});
})();
</script>
`;