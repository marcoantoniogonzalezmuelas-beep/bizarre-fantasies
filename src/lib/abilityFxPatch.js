// Parche inyectado en el iframe: animaciones temáticas al usar habilidades.
// Cada héroe muestra un efecto acorde a su tipo de habilidad (tajos, runas
// arcanas, luz sagrada, plumas…) con el nombre de la habilidad y el color de
// su clan. Sustituye al aviso genérico anterior.
export const ABILITY_FX_PATCH = `
<script>
(function(){
  if(window.__bfAbilityFx)return;
  window.__bfAbilityFx=true;

  var css=''+
  '.bf-abx{position:absolute;inset:0;pointer-events:none;z-index:80;overflow:visible;color:#7ad6ff}'+
  '.bf-abx-banner{position:absolute;left:50%;top:6%;transform:translateX(-50%);white-space:nowrap;font-family:Cinzel,serif;font-weight:900;font-size:12px;letter-spacing:.4px;padding:3px 11px;border-radius:10px;background:rgba(8,5,14,.92);border:1.5px solid currentColor;box-shadow:0 0 16px currentColor;animation:bfAbxBanner 1.5s ease forwards}'+
  '@keyframes bfAbxBanner{0%{opacity:0;transform:translateX(-50%) translateY(10px) scale(.5)}15%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.12)}28%{transform:translateX(-50%) scale(1)}78%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-16px)}}'+
  '.bf-abx-ring{position:absolute;left:50%;top:50%;width:82%;aspect-ratio:1/1;transform:translate(-50%,-50%);border-radius:50%;border:2px dashed currentColor;box-shadow:0 0 18px currentColor,inset 0 0 18px currentColor;animation:bfAbxSpin 1.3s ease-out forwards}'+
  '@keyframes bfAbxSpin{0%{transform:translate(-50%,-50%) rotate(0deg) scale(.35);opacity:0}25%{opacity:.95}100%{transform:translate(-50%,-50%) rotate(260deg) scale(1.25);opacity:0}}'+
  '.bf-abx-flash{position:absolute;inset:-4%;border-radius:14px;background:radial-gradient(circle at 50% 55%,currentColor,transparent 72%);opacity:0;animation:bfAbxFlash .8s ease-out forwards;mix-blend-mode:screen}'+
  '@keyframes bfAbxFlash{0%{opacity:0}22%{opacity:.75}100%{opacity:0}}'+
  '.bf-abx-slash{position:absolute;left:50%;top:50%;width:135%;height:3px;background:linear-gradient(90deg,transparent,#fff,currentColor,transparent);box-shadow:0 0 14px currentColor;opacity:0;transform:translate(-50%,-50%) rotate(var(--rot,45deg)) scaleX(0);animation:bfAbxSlash .55s ease-out forwards}'+
  '@keyframes bfAbxSlash{0%{opacity:0;transform:translate(-50%,-50%) rotate(var(--rot,45deg)) scaleX(0)}30%{opacity:1;transform:translate(-50%,-50%) rotate(var(--rot,45deg)) scaleX(1.05)}70%{opacity:.9}100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--rot,45deg)) scaleX(1.15)}}'+
  '.bf-abx-p{position:absolute;font-size:15px;opacity:0;text-shadow:0 0 10px currentColor}'+
  '.bf-abx-rise{animation:bfAbxRise 1.15s ease-out forwards}'+
  '@keyframes bfAbxRise{0%{opacity:0;transform:translateY(14px) scale(.5) rotate(-8deg)}22%{opacity:1}100%{opacity:0;transform:translateY(-52px) scale(1.25) rotate(10deg)}}'+
  '.bf-abx-fall{animation:bfAbxFall 1.15s ease-in forwards}'+
  '@keyframes bfAbxFall{0%{opacity:0;transform:translateY(-18px) scale(.6)}22%{opacity:1}100%{opacity:0;transform:translateY(46px) scale(1.15) rotate(-14deg)}}'+
  '.bf-abx-shake{animation:bfAbxShake .45s ease}'+
  '@keyframes bfAbxShake{0%,100%{translate:0 0}15%{translate:-4px 2px}30%{translate:4px -3px}45%{translate:-3px -2px}60%{translate:3px 2px}75%{translate:-2px 1px}}'+
  '.bf-abx-glow{animation:bfAbxGlow .95s ease}'+
  '@keyframes bfAbxGlow{0%{filter:none}30%{filter:brightness(1.55) saturate(1.5)}100%{filter:none}}'+
  '.bf-sfx-pop{animation:bfSfxPop .85s cubic-bezier(.2,1.5,.4,1) both}'+
  '@keyframes bfSfxPop{0%{transform:scale(0) rotate(-14deg);opacity:0}55%{transform:scale(1.14) rotate(4deg);opacity:1}75%{transform:scale(.96) rotate(-2deg)}100%{transform:scale(1) rotate(0)}}'+
  '.bf-sfx-ring{position:absolute;left:50%;top:50%;width:96%;aspect-ratio:1/1;transform:translate(-50%,-50%);border-radius:50%;border:2.5px solid currentColor;box-shadow:0 0 22px currentColor,inset 0 0 22px currentColor;opacity:0;animation:bfSfxRing 1.1s ease-out forwards}'+
  '@keyframes bfSfxRing{0%{opacity:0;transform:translate(-50%,-50%) scale(.15)}30%{opacity:.95}100%{opacity:0;transform:translate(-50%,-50%) scale(1.55)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // Familias visuales según el tipo de habilidad (akind) del héroe.
  var FAM={
    'aoe-cc':'melee','execute':'melee','pierce-cc':'melee','lifesteal-cc':'melee','crush-cc':'melee','unblock-cc':'melee','smash-equip':'melee',
    'aoe-ad':'ranged','pierce-ad':'ranged','big-ad':'ranged','double-ad':'ranged','mark':'ranged','evade':'ranged',
    'aoe-he':'magic','big-he':'magic','silence':'magic','drain':'magic','skip-turn':'magic','tk_dizzy':'magic','tk_confuse':'magic','tk_drunk':'magic','tk_none':'magic',
    'self-heal':'holy','heal-ally':'holy','heal-all':'holy','revive':'holy','shield-ally':'holy',
    'self-buff':'buff','debuff':'debuff','debuff-all':'debuff',
    'duck-summon':'duck','reflect-damage':'reflect'
  };
  var THEMES={
    melee:{color:'#ff6a4a',icon:'⚔',glyphs:['✦','💢','⚔'],slashes:1,shake:1,flash:1},
    ranged:{color:'#ffc84a',icon:'🎯',glyphs:['➤','✦','➶'],ring:1,flash:1},
    magic:{color:'#b06cff',icon:'🔮',glyphs:['ᚱ','ᛟ','ᚷ','ᛉ','✦'],ring:1,rise:1},
    holy:{color:'#7dff9a',icon:'✚',glyphs:['✚','❋','✦'],rise:1,flash:1},
    buff:{color:'#ffd24a',icon:'▲',glyphs:['▲','✦','▲'],rise:1,flash:1},
    debuff:{color:'#8fe3ff',icon:'▼',glyphs:['▼','☁','✦'],fall:1,ring:1},
    duck:{color:'#ffe14a',icon:'🦆',glyphs:['🦆','🪶','🪶'],rise:1,shake:1,flash:1},
    reflect:{color:'#c79bff',icon:'↺',glyphs:['◆','✦','◇'],ring:1,flash:1}
  };

  function play(side,hero){
    var card=document.getElementById('b_'+side+'_'+(hero&&hero.id));
    if(!card)return;
    var theme=THEMES[FAM[hero.akind]||'magic'];
    var clan=hero.clanColor||theme.color;
    if(getComputedStyle(card).position==='static')card.style.position='relative';
    var layer=document.createElement('div');
    layer.className='bf-abx';
    layer.style.color=theme.color;
    var name=hero.eliteMode?(hero.eAbility||hero.ability||'Habilidad'):(hero.ability||'Habilidad');
    var html='';
    if(theme.flash)html+='<div class="bf-abx-flash"></div>';
    if(theme.ring)html+='<div class="bf-abx-ring"></div>';
    if(theme.slashes)html+='<div class="bf-abx-slash" style="--rot:45deg"></div><div class="bf-abx-slash" style="--rot:-45deg;animation-delay:.13s"></div>';
    for(var i=0;i<8;i++){
      var g=theme.glyphs[i%theme.glyphs.length];
      var cls=theme.fall?'bf-abx-fall':'bf-abx-rise';
      html+='<span class="bf-abx-p '+cls+'" style="left:'+(8+Math.random()*78)+'%;top:'+(theme.fall?(5+Math.random()*20):(55+Math.random()*32))+'%;animation-delay:'+(Math.random()*0.45).toFixed(2)+'s;font-size:'+(11+Math.random()*10)+'px">'+g+'</span>';
    }
    html+='<div class="bf-abx-banner" style="border-color:'+clan+';box-shadow:0 0 16px '+clan+'">'+theme.icon+' '+String(name).toUpperCase()+'</div>';
    layer.innerHTML=html;
    card.appendChild(layer);
    // Remate anime: líneas de velocidad sobre el héroe y estrella de impacto
    // en las habilidades ofensivas.
    var A=window.__bfAnime;
    if(A){
      var rc=card.getBoundingClientRect(),cc={x:rc.left+rc.width/2,y:rc.top+rc.height/2};
      A.speedLines(cc);
      var fam=FAM[hero.akind]||'magic';
      // Sprite anime grande de la habilidad: el efecto más espectacular.
      if(A.spriteBurst)A.spriteBurst('ab_'+fam,cc,150,1150);
      if(fam==='melee'||fam==='ranged'||fam==='debuff')setTimeout(function(){A.hitStar(cc);},180);
    }
    card.classList.add(theme.shake?'bf-abx-shake':'bf-abx-glow');
    setTimeout(function(){card.classList.remove('bf-abx-shake','bf-abx-glow');},1000);
    setTimeout(function(){if(layer.parentNode)layer.parentNode.removeChild(layer);},1600);
    // Retira el aviso genérico anterior para que no se solape con éste.
    setTimeout(function(){
      card.querySelectorAll('.bf-fx-spell-wave,.bf-fx-status-txt').forEach(function(e){if(e.parentNode)e.parentNode.removeChild(e);});
    },90);
  }

  // Aparición de invocaciones: cuando un token nuevo (patito de goma u otras
  // invocaciones futuras) entra en el tablero, su carta llega con un "pop",
  // anillos de portal, destellos y el rótulo ¡INVOCADO!
  function playSummon(card,hero){
    if(getComputedStyle(card).position==='static')card.style.position='relative';
    var color=(hero&&hero.clanColor)||'#ffe14a';
    var glyphs=(hero&&(hero._bfDuck||String(hero.id).indexOf('duck')===0))?['🦆','🪶','✦','✨']:['✦','✨','◆','❋'];
    var layer=document.createElement('div');
    layer.className='bf-abx';
    layer.style.color=color;
    var html='<div class="bf-abx-flash"></div><div class="bf-sfx-ring"></div><div class="bf-sfx-ring" style="animation-delay:.18s"></div>';
    for(var i=0;i<10;i++){
      html+='<span class="bf-abx-p bf-abx-rise" style="left:'+(6+Math.random()*82)+'%;top:'+(45+Math.random()*42)+'%;animation-delay:'+(Math.random()*0.5).toFixed(2)+'s;font-size:'+(12+Math.random()*11)+'px">'+glyphs[i%glyphs.length]+'</span>';
    }
    html+='<div class="bf-abx-banner">✨ ¡INVOCADO!</div>';
    layer.innerHTML=html;
    card.appendChild(layer);
    // Remate anime de la invocación: líneas de velocidad + estrella al aparecer.
    var A2=window.__bfAnime;
    if(A2){
      var rs=card.getBoundingClientRect(),cs={x:rs.left+rs.width/2,y:rs.top+rs.height/2};
      // Portal de invocación anime girando bajo el token que aparece.
      if(A2.spriteBurst)A2.spriteBurst('summon_portal',cs,150,1250);
      A2.speedLines(cs);
      setTimeout(function(){A2.hitStar(cs);},220);
    }
    card.classList.add('bf-sfx-pop');
    setTimeout(function(){card.classList.remove('bf-sfx-pop');},950);
    setTimeout(function(){if(layer.parentNode)layer.parentNode.removeChild(layer);},1700);
  }

  // Vigila el tablero: los héroes ya presentes se registran sin animar; solo
  // los tokens invocados que aparecen de nuevas reciben la animación.
  var seenUnit={};
  function scanSummons(){
    if(typeof G==='undefined'||!G.team)return;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.id)return;
        var key=side+'_'+h.id;
        if(seenUnit[key])return;
        var card=document.getElementById('b_'+side+'_'+h.id);
        if(!card)return;
        seenUnit[key]=1;
        if((h._token||h._bfDuck)&&h.alive)try{playSummon(card,h);}catch(e){}
      });
    });
  }
  new MutationObserver(scanSummons).observe(document.documentElement,{childList:true,subtree:true});

  function install(){
    if(typeof window.useAbility!=='function'||window.__bfAbxHooked)return false;
    window.__bfAbxHooked=true;
    var orig=window.useAbility;
    window.useAbility=function(side,hero){
      if(hero)try{play(side,hero);}catch(e){}
      return orig.apply(this,arguments);
    };
    return true;
  }
  var tries=0,t=setInterval(function(){if(install()||tries++>100)clearInterval(t);},150);
})();
</script>
`;