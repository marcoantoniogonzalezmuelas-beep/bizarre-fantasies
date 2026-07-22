// Parche inyectado en el iframe: al jugar una carta (hechizo u objeto), la
// carta aparece en grande en el centro de la pantalla durante unos segundos
// para que el rival vea qué carta se ha jugado. Viaja por el canal de efectos
// (pushFx/flushFx), que ya se sincroniza entre ambos jugadores online.
export const CARD_PLAY_REVEAL_PATCH = `
<script>
(function(){
  if(window.__bfCardReveal)return;
  window.__bfCardReveal=true;

  var st=document.createElement('style');
  st.textContent=''+
  '.bf-reveal{position:fixed;inset:0;z-index:2147480000;display:flex;align-items:center;justify-content:center;pointer-events:none;background:radial-gradient(circle at 50% 50%,rgba(0,0,0,.45),rgba(0,0,0,0) 70%);animation:bfRevFade 2.6s ease forwards}'+
  '@keyframes bfRevFade{0%{opacity:0}8%{opacity:1}82%{opacity:1}100%{opacity:0}}'+
  '.bf-reveal-card{position:relative;width:210px;height:294px;border-radius:16px;overflow:hidden;border:4px solid #ffd24a;box-shadow:0 0 40px rgba(255,210,74,.75),0 18px 50px rgba(0,0,0,.8);background:#120a1e center/cover no-repeat;animation:bfRevPop 2.6s cubic-bezier(.2,1.4,.4,1) forwards}'+
  '@keyframes bfRevPop{0%{transform:scale(.2) rotate(-10deg)}12%{transform:scale(1.06) rotate(2deg)}20%{transform:scale(1) rotate(0)}82%{transform:scale(1)}100%{transform:scale(.92)}}'+
  '.bf-reveal-name{position:absolute;left:0;right:0;bottom:0;padding:8px 6px;text-align:center;font-family:Cinzel,serif;font-weight:900;font-size:16px;color:#fff7ea;background:linear-gradient(0deg,rgba(8,5,14,.95),rgba(8,5,14,.55) 70%,transparent);text-shadow:0 2px 6px #000}'+
  '.bf-reveal-who{position:absolute;left:50%;top:-16px;transform:translateX(-50%);white-space:nowrap;font-size:11px;font-weight:1000;letter-spacing:.6px;color:#3a2600;background:linear-gradient(180deg,#ffe27a,#e0a92e);border:1px solid rgba(255,240,180,.85);border-radius:10px;padding:3px 12px;box-shadow:0 3px 10px rgba(0,0,0,.55)}'+
  '.bf-reveal-kind{position:absolute;top:10px;right:10px;font-size:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.7))}';
  document.head.appendChild(st);

  // El arte de las cartas se pide a la página (base de datos de cartas).
  var __artMap={};
  window.addEventListener('message',function(e){
    if(e.data&&e.data.bfArtMap)__artMap=e.data.bfArtMap||{};
  });
  try{window.parent.postMessage({bfArtMapRequest:1},'*');}catch(e){}
  function artFor(name){
    if(__artMap[name])return __artMap[name];
    // Respaldo: si la carta está decorada en alguna mano visible, usa su arte.
    var chips=document.querySelectorAll('.bf-chip-card');
    for(var i=0;i<chips.length;i++){
      var nm=chips[i].querySelector('.bf-chip-name');
      if(nm&&nm.textContent.trim()===name){
        var art=chips[i].querySelector('.bf-chip-art-layer');
        var bg=art&&art.style.backgroundImage;
        if(bg)return bg.replace(/^url\\(["']?/,'').replace(/["']?\\)$/,'');
      }
    }
    return '';
  }

  function showReveal(ev){
    var old=document.querySelector('.bf-reveal');
    if(old&&old.parentNode)old.parentNode.removeChild(old);
    var who='';
    try{who=(typeof G!=='undefined'&&G.names&&G.names[ev.side])||'';}catch(e){}
    var url=artFor(ev.name);
    var wrap=document.createElement('div');
    wrap.className='bf-reveal';
    var card=document.createElement('div');
    card.className='bf-reveal-card';
    if(url)card.style.backgroundImage='url("'+url+'")';
    card.style.borderColor=ev.kind==='spell'?'#c79bff':'#ffd24a';
    card.style.boxShadow='0 0 40px '+(ev.kind==='spell'?'rgba(199,155,255,.75)':'rgba(255,210,74,.75)')+',0 18px 50px rgba(0,0,0,.8)';
    card.innerHTML=(who?'<div class="bf-reveal-who">'+String(who).toUpperCase()+' JUEGA</div>':'')+
      '<div class="bf-reveal-kind">'+(ev.kind==='spell'?'🔮':'🎒')+'</div>'+
      '<div class="bf-reveal-name">'+String(ev.name)+'</div>';
    wrap.appendChild(card);
    document.body.appendChild(wrap);
    setTimeout(function(){if(wrap.parentNode)wrap.parentNode.removeChild(wrap);},2650);
  }
  window.__bfShowCardReveal=showReveal;

  // Emisor: cuando el anfitrión ejecuta la jugada, encola el evento de carta.
  // Los enganches se marcan en variables globales (no en la propia función)
  // porque otros parches vuelven a envolver estas funciones y borrarían la
  // marca, provocando envolturas repetidas.
  var H={};
  function hookCast(){
    if(typeof window.castSpell!=='function'||H.cast)return;
    H.cast=1;
    var orig=window.castSpell;
    window.castSpell=function(id){
      try{
        if(!(typeof NET!=='undefined'&&NET.role==='client')&&typeof B!=='undefined'&&B.current){
          var h=getHero(B.current.side,B.current.id),s=byId(SPELLS,id);
          if(h&&s&&h.mana>=s.mana)pushFx({k:'bfcard',name:s.name,kind:'spell',side:B.current.side});
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
  }
  function hookItem(){
    if(typeof window.useItem!=='function'||H.item)return;
    H.item=1;
    var orig=window.useItem;
    window.useItem=function(idx){
      try{
        if(!(typeof NET!=='undefined'&&NET.role==='client')&&typeof B!=='undefined'&&B.current){
          var o=G.items[B.current.side][idx];
          if(o)pushFx({k:'bfcard',name:o.name,kind:'object',side:B.current.side});
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
  }
  function hookItemAI(){
    if(typeof window.useItem_AI!=='function'||H.ai)return;
    H.ai=1;
    var orig=window.useItem_AI;
    window.useItem_AI=function(side,idx){
      try{var o=G.items[side][idx];if(o)pushFx({k:'bfcard',name:o.name,kind:'object',side:side});}catch(e){}
      return orig.apply(this,arguments);
    };
  }

  // Receptor: flushFx corre en ambos lados (el snapshot online lleva los fx),
  // así que la carta se ve tanto en tu pantalla como en la del rival.
  function hookFlush(){
    if(typeof window.flushFx!=='function'||H.flush)return;
    H.flush=1;
    var orig=window.flushFx;
    window.flushFx=function(list){
      try{
        (list||[]).forEach(function(ev){if(ev&&ev.k==='bfcard')showReveal(ev);});
      }catch(e){}
      return orig.apply(this,arguments);
    };
  }

  function hook(){hookCast();hookItem();hookItemAI();hookFlush();}
  hook();
  window.__bfRevHooks=H;
  var iv=setInterval(function(){
    hook();
    if(H.cast&&H.item&&H.ai&&H.flush)clearInterval(iv);
  },200);
})();
</script>
`;