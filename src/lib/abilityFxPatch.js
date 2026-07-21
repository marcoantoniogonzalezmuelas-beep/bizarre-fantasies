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
  '@keyframes bfAbxGlow{0%{filter:none}30%{filter:brightness(1.55) saturate(1.5)}100%{filter:none}}';
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
    card.classList.add(theme.shake?'bf-abx-shake':'bf-abx-glow');
    setTimeout(function(){card.classList.remove('bf-abx-shake','bf-abx-glow');},1000);
    setTimeout(function(){if(layer.parentNode)layer.parentNode.removeChild(layer);},1600);
    // Retira el aviso genérico anterior para que no se solape con éste.
    setTimeout(function(){
      card.querySelectorAll('.bf-fx-spell-wave,.bf-fx-status-txt').forEach(function(e){if(e.parentNode)e.parentNode.removeChild(e);});
    },90);
  }

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