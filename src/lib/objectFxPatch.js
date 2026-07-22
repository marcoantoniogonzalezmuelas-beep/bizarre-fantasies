// Parche inyectado en el iframe: animaciones temáticas al usar OBJETOS.
// Cada tipo de objeto (curación, escudo, limpieza, bomba, maná, revivir)
// muestra su propio efecto sobre el héroe objetivo: partículas, anillo,
// destello y un rótulo con el nombre del objeto. Reutiliza las clases CSS
// del parche de habilidades (bf-abx-*) y añade las suyas propias.
export const OBJECT_FX_PATCH = `
<script>
(function(){
  if(window.__bfObjectFx)return;
  window.__bfObjectFx=true;

  var css=''+
  '.bf-ofx-drop{position:absolute;width:15px;height:22px;border-radius:50% 50% 55% 55%/40% 40% 60% 60%;opacity:0;box-shadow:0 0 8px currentColor;background:currentColor;animation:bfOfxDrop 1.1s ease-in forwards}'+
  '@keyframes bfOfxDrop{0%{opacity:0;transform:translateY(-26px) scale(.5)}20%{opacity:.95}100%{opacity:0;transform:translateY(40px) scale(1)}}'+
  '.bf-ofx-swirl{position:absolute;left:50%;top:50%;width:70%;aspect-ratio:1/1;transform:translate(-50%,-50%);border-radius:50%;border:4px dotted currentColor;box-shadow:0 0 16px currentColor;animation:bfOfxSwirl 1.2s ease-out forwards}'+
  '@keyframes bfOfxSwirl{0%{transform:translate(-50%,-50%) rotate(0) scale(.3);opacity:0}25%{opacity:.95}100%{transform:translate(-50%,-50%) rotate(-320deg) scale(1.3);opacity:0}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // Tema visual por tipo de objeto. Los que ya tienen efecto propio del juego
  // (bomba→fuego, escudo→shieldup, maná→manaup, revivir→elite) reciben además
  // el rótulo y partículas para que todos los objetos "se sientan" igual.
  var THEMES={
    heal:{color:'#7dff9a',icon:'🧪',glyphs:['✚','❋','✦'],ring:1,flash:1,rise:1},
    healBig:{color:'#5aff8a',icon:'⚗️',glyphs:['✚','❤','✦'],ring:1,flash:1,rise:1},
    shield:{color:'#7ad6ff',icon:'🛡️',glyphs:['⬡','✦','◆'],ring:1,rise:1},
    cleanse:{color:'#fff2b0',icon:'✨',glyphs:['✦','❋','✧'],swirl:1,flash:1,rise:1},
    bomb:{color:'#ff8a2a',icon:'💣',glyphs:['✦','💥','✸'],flash:1,rise:1},
    mana:{color:'#7a9bff',icon:'🔮',glyphs:['✦','◆','✧'],drops:1,ring:1},
    manaBig:{color:'#5a7bff',icon:'🔮',glyphs:['✦','◆','✧'],drops:1,ring:1,flash:1},
    revive:{color:'#ffd24a',icon:'⚗️',glyphs:['✚','✦','❋'],ring:1,flash:1,rise:1},
    reviveAll:{color:'#ffe27a',icon:'🌟',glyphs:['✚','🌟','✦'],ring:1,flash:1,rise:1}
  };

  // Sprite anime por tipo de objeto (poción, escudo, bomba, cristal…).
  var OSPR={heal:'ob_heal',healBig:'ob_heal',shield:'ob_shield',cleanse:'ob_cleanse',bomb:'ob_bomb',mana:'ob_mana',manaBig:'ob_mana',revive:'ob_revive',reviveAll:'ob_revive'};

  function play(card,theme,name,kind){
    if(getComputedStyle(card).position==='static')card.style.position='relative';
    var layer=document.createElement('div');
    layer.className='bf-abx';
    layer.style.color=theme.color;
    var html='';
    if(theme.flash)html+='<div class="bf-abx-flash"></div>';
    if(theme.ring)html+='<div class="bf-sfx-ring"></div>';
    if(theme.swirl)html+='<div class="bf-ofx-swirl"></div>';
    for(var i=0;i<8;i++){
      if(theme.drops){
        html+='<span class="bf-ofx-drop" style="left:'+(12+Math.random()*72)+'%;top:'+(10+Math.random()*30)+'%;animation-delay:'+(Math.random()*0.45).toFixed(2)+'s"></span>';
      }else{
        var g=theme.glyphs[i%theme.glyphs.length];
        html+='<span class="bf-abx-p bf-abx-rise" style="left:'+(8+Math.random()*78)+'%;top:'+(52+Math.random()*35)+'%;animation-delay:'+(Math.random()*0.45).toFixed(2)+'s;font-size:'+(18+Math.random()*15)+'px">'+g+'</span>';
      }
    }
    html+='<div class="bf-abx-banner">'+theme.icon+' '+String(name).toUpperCase()+'</div>';
    layer.innerHTML=html;
    card.appendChild(layer);
    // Remate anime: líneas de velocidad en el objetivo; estrella y sacudida
    // solo en objetos de impacto (bomba).
    var A=window.__bfAnime;
    if(A){
      var rc=card.getBoundingClientRect(),cc={x:rc.left+rc.width/2,y:rc.top+rc.height/2};
      A.speedLines(cc);
      if(A.spriteBurst&&OSPR[kind])A.spriteBurst(OSPR[kind],cc,205,1050);
      if(theme===THEMES.bomb){ setTimeout(function(){A.hitStar(cc);},160); }
    }
    card.classList.add('bf-abx-glow');
    setTimeout(function(){card.classList.remove('bf-abx-glow');},1000);
    setTimeout(function(){if(layer.parentNode)layer.parentNode.removeChild(layer);},1700);
  }

  // Encuentra en el mensaje del registro al héroe objetivo (por nombre).
  function findTarget(msg){
    if(typeof G==='undefined'||!G.team)return null;
    var best=null;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.name)return;
        if(msg.indexOf(h.name)!==-1&&(!best||h.name.length>best.h.name.length))best={side:side,h:h};
      });
    });
    return best;
  }

  // El objeto "pendiente": se apunta al usarlo y se resuelve cuando llega su
  // línea de registro ("Nombre del objeto: Héroe ..."), que ya conoce el
  // objetivo elegido. Caduca a los 8s (p. ej. si se cancela la selección).
  function markPending(o){
    if(o&&o.name)window.__bfPendItem={name:o.name,kind:o.kind,until:Date.now()+8000};
  }
  function hookUse(fnName,getObj){
    if(typeof window[fnName]!=='function'||window[fnName].__bfOfx)return;
    var orig=window[fnName];
    window[fnName]=function(){
      try{markPending(getObj(arguments));}catch(e){}
      return orig.apply(this,arguments);
    };
    window[fnName].__bfOfx=1;
  }

  function hookLog(){
    if(typeof window.pushLog!=='function'||window.pushLog.__bfOfx)return;
    var orig=window.pushLog;
    window.pushLog=function(type,msg){
      try{
        var p=window.__bfPendItem;
        if(p&&Date.now()<p.until&&typeof msg==='string'&&msg.indexOf(p.name+':')===0){
          var t=findTarget(msg.slice(p.name.length+1));
          var theme=THEMES[p.kind];
          if(t&&theme){
            var card=document.getElementById('b_'+t.side+'_'+t.h.id);
            if(card){
              if(window.__bfFocusCard)try{window.__bfFocusCard(t.side,t.h.id,false);}catch(e){}
              play(card,theme,p.name,p.kind);
            }
          }
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
    window.pushLog.__bfOfx=1;
  }

  function hook(){
    hookUse('useItem',function(args){return (typeof B!=='undefined'&&B.current&&typeof G!=='undefined')?G.items[B.current.side][args[0]]:null;});
    hookUse('useItem_AI',function(args){return (typeof G!=='undefined')?G.items[args[0]][args[1]]:null;});
    hookLog();
  }
  var iv=setInterval(function(){
    hook();
    if(window.useItem&&window.useItem.__bfOfx&&window.useItem_AI&&window.useItem_AI.__bfOfx&&window.pushLog&&window.pushLog.__bfOfx)clearInterval(iv);
  },200);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook); else hook();
})();
</script>
`;