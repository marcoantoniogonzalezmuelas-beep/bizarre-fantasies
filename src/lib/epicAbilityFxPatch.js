// Parche inyectado en el iframe: animaciones especiales temáticas para las
// habilidades (normal y élite) de todos los héroes de la raza Épicas.
// Cada héroe tiene una animación única que sustituye al efecto genérico.
// Coffetath y KillerDucks tienen animaciones propias en abilityFxPatch y
// specialCardCinematicPatch respectivamente.
export const EPIC_ABILITY_FX_PATCH = `
<script>
(function(){
  if(window.__bfEpicAbxFx) return;
  window.__bfEpicAbxFx = true;

  var css = ''+
  '.bf-epic-fx{position:absolute;inset:0;pointer-events:none;z-index:81;overflow:visible}'+
  '.bf-epic-banner{position:absolute;left:50%;top:4%;transform:translateX(-50%);white-space:nowrap;font-family:Cinzel,serif;font-weight:900;font-size:15px;letter-spacing:.4px;padding:5px 15px;border-radius:10px;background:rgba(8,5,14,.92);border:1.5px solid currentColor;box-shadow:0 0 16px currentColor;animation:bfEpicBanner 2.8s ease forwards}'+
  '@keyframes bfEpicBanner{0%{opacity:0;transform:translateX(-50%) translateY(10px) scale(.5)}12%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.12)}22%{transform:translateX(-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-16px)}}'+
  '.bf-epic-glow{animation:bfEpicGlow 1.2s ease-out forwards}'+
  '@keyframes bfEpicGlow{0%{filter:none}30%{filter:brightness(1.5) saturate(1.4) drop-shadow(0 0 20px currentColor)}100%{filter:none}}'+
  // === KRUNDERKRAK — Devastación (martillo/rotura) / Aniquilación (fuego+calavera) ===
  '.bf-kk-hammer{position:absolute;left:50%;top:28%;transform:translateX(-50%);font-size:52px;opacity:0;animation:bfKkHammer .9s ease-out forwards;text-shadow:0 0 20px currentColor}'+
  '@keyframes bfKkHammer{0%{opacity:0;transform:translateX(-50%) scale(3) rotate(-35deg)}30%{opacity:1;transform:translateX(-50%) scale(1.2) rotate(8deg)}55%{transform:translateX(-50%) scale(.85) rotate(-3deg)}100%{opacity:0;transform:translateX(-50%) scale(1) rotate(0)}}'+
  '.bf-kk-crack{position:absolute;left:50%;top:50%;height:3px;background:linear-gradient(90deg,transparent,#fff,transparent);transform:translate(-50%,-50%);animation:bfKkCrack 1s ease-out forwards;box-shadow:0 0 8px #fff}'+
  '@keyframes bfKkCrack{0%{width:0;opacity:1}30%{width:130%;opacity:1}100%{width:150%;opacity:0}}'+
  '.bf-kk-flame{position:absolute;font-size:30px;opacity:0;animation:bfKkFlame 1.6s ease-out forwards}'+
  '@keyframes bfKkFlame{0%{opacity:0;transform:translateY(20px) scale(.5)}20%{opacity:1;transform:translateY(0) scale(1.3)}100%{opacity:0;transform:translateY(-50px) scale(.7)}}'+
  '.bf-kk-skull{position:absolute;left:50%;top:35%;transform:translateX(-50%);font-size:46px;opacity:0;animation:bfKkSkull 2s ease-out forwards;filter:drop-shadow(0 0 16px #ff3333)}'+
  '@keyframes bfKkSkull{0%{opacity:0;transform:translateX(-50%) scale(.3) rotate(-15deg)}25%{opacity:1;transform:translateX(-50%) scale(1.3) rotate(5deg)}70%{opacity:.8}100%{opacity:0;transform:translateX(-50%) scale(1.5) rotate(0)}}'+
  // === EL HEAVY — Headbang (ondas sónicas) / Wall of Death (muro de calaveras) ===
  '.bf-eh-ripple{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;border:3px solid currentColor;opacity:0;animation:bfEhRipple 1.5s ease-out forwards}'+
  '@keyframes bfEhRipple{0%{width:10%;height:10%;opacity:1;border-width:4px}100%{width:220%;height:220%;opacity:0;border-width:1px}}'+
  '.bf-eh-note{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:28px;opacity:0;animation:bfEhNote 1s ease-out forwards}'+
  '@keyframes bfEhNote{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}40%{opacity:1;transform:translate(-50%,-50%) scale(1.3)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.6)}}'+
  // Guitarra tocándose
  '.bf-eh-guitar{position:absolute;left:50%;top:30%;transform:translateX(-50%);font-size:48px;opacity:0;animation:bfEhGuitar 2.5s ease-out forwards;filter:drop-shadow(0 0 16px currentColor)}'+
  '@keyframes bfEhGuitar{0%{opacity:0;transform:translateX(-50%) scale(.3) rotate(-20deg)}15%{opacity:1;transform:translateX(-50%) scale(1.2) rotate(8deg)}35%{transform:translateX(-50%) scale(1) rotate(-5deg)}55%{transform:translateX(-50%) scale(1.1) rotate(6deg)}100%{opacity:0;transform:translateX(-50%) scale(1) rotate(0)}}'+
  // Notas musicales cayendo
  '.bf-eh-mnote{position:absolute;font-size:18px;opacity:0;animation:bfEhMnote 1.8s ease-in forwards}'+
  '@keyframes bfEhMnote{0%{opacity:0;transform:translateY(-20px) scale(.4) rotate(-15deg)}20%{opacity:1;transform:translateY(0) scale(1.1) rotate(10deg)}100%{opacity:0;transform:translateY(70px) scale(.7) rotate(360deg)}}'+
  '.bf-eh-wall{position:absolute;left:50%;top:50%;transform:translateX(-50%);font-size:38px;opacity:0;animation:bfEhWall 2s ease-out forwards}'+
  '@keyframes bfEhWall{0%{opacity:0;transform:translateX(-50%) translateY(30px) scale(.4)}20%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.2)}80%{opacity:.8}100%{opacity:0;transform:translateX(-50%) translateY(-20px) scale(1.4)}}'+
  '.bf-eh-bloodbar{position:absolute;left:50%;top:60%;transform:translateX(-50%);width:80%;height:4px;border-radius:2px;background:linear-gradient(90deg,#ff0000,#8b0000);opacity:0;animation:bfEhBlood 1.5s ease-out forwards}'+
  '@keyframes bfEhBlood{0%{opacity:0;width:0}30%{opacity:1;width:80%}100%{opacity:0;width:100%}}'+
  // === SYLVEX — Mutación (ADN) / Evolución Suprema (espiral dorada) ===
  '.bf-sy-dna{position:absolute;font-size:22px;opacity:0;animation:bfSyDna 2s ease-out forwards}'+
  '@keyframes bfSyDna{0%{opacity:0;transform:scale(.3) rotate(0)}20%{opacity:1}100%{opacity:0;transform:scale(1.5) rotate(360deg)}}'+
  '.bf-sy-mutate{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:50%;aspect-ratio:1;border-radius:50%;border:2px dashed currentColor;opacity:0;animation:bfSyMutate 1.8s ease-out forwards}'+
  '@keyframes bfSyMutate{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(0)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.6) rotate(540deg)}}'+
  '.bf-sy-evo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:55%;aspect-ratio:1;border-radius:50%;border:3px solid #ffd24a;box-shadow:0 0 24px #ffd24a,inset 0 0 24px #ffd24a;opacity:0;animation:bfSyEvo 2.2s ease-out forwards}'+
  '@keyframes bfSyEvo{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(0)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(2) rotate(720deg)}}'+
  '.bf-sy-star{position:absolute;font-size:26px;opacity:0;animation:bfSyStar 1.8s ease-out forwards}'+
  '@keyframes bfSyStar{0%{opacity:0;transform:scale(0) rotate(0)}30%{opacity:1;transform:scale(1.3) rotate(180deg)}100%{opacity:0;transform:scale(1.6) rotate(360deg)}}'+
  '.bf-sy-bar{position:absolute;left:50%;bottom:20%;transform:translateX(-50%);width:6px;height:0;border-radius:2px;background:linear-gradient(180deg,#ffd24a,#ff8c00);box-shadow:0 0 8px #ffd24a;animation:bfSyBar 1.5s ease-out forwards}'+
  '@keyframes bfSyBar{0%{height:0;opacity:1}40%{height:50px;opacity:1}100%{height:80px;opacity:0}}'+
  // === GORVAK — Onda de Impacto (anillos) / Devastación Orbital (proyectiles) ===
  '.bf-go-ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;border:3px solid currentColor;opacity:0;animation:bfGoRing 1.5s ease-out forwards}'+
  '@keyframes bfGoRing{0%{width:10%;height:10%;opacity:1;border-width:4px}100%{width:250%;height:250%;opacity:0;border-width:1px}}'+
  '.bf-go-target{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:36px;opacity:0;animation:bfGoTarget 1s ease-out forwards}'+
  '@keyframes bfGoTarget{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}40%{opacity:1;transform:translate(-50%,-50%) scale(1.3)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.6)}}'+
  '.bf-go-proj{position:absolute;font-size:22px;opacity:0;animation:bfGoProj 1.4s ease-out forwards;text-shadow:0 0 10px currentColor}'+
  '@keyframes bfGoProj{0%{opacity:0;transform:scale(.3) translate(0,0)}25%{opacity:1;transform:scale(1.2) translate(var(--tx,40px),var(--ty,-30px))}100%{opacity:0;transform:scale(.6) translate(calc(var(--tx,40px)*2.5),calc(var(--ty,-30px)*2.5))}}'+
  '.bf-go-orbit{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:60%;aspect-ratio:1;border-radius:50%;border:2px solid #ffd24a;box-shadow:0 0 20px #ffd24a;opacity:0;animation:bfGoOrbit 2s ease-out forwards}'+
  '@keyframes bfGoOrbit{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(0)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.8) rotate(360deg)}}'+
  // === ZARMANDIS — Juicio Divino (cruz sagrada) / Divinidad (halo dorado) ===
  '.bf-za-cross{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0;animation:bfZaCross 1.8s ease-out forwards}'+
  '@keyframes bfZaCross{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-20deg)}30%{opacity:1;transform:translate(-50%,-50%) scale(1.2) rotate(0)}70%{opacity:.8}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5) rotate(10deg)}}'+
  '.bf-za-ray{position:absolute;left:50%;top:50%;width:4px;height:80px;background:linear-gradient(180deg,transparent,currentColor,transparent);transform-origin:bottom center;opacity:0;animation:bfZaRay 1.5s ease-out forwards}'+
  '@keyframes bfZaRay{0%{opacity:0;transform:translate(-50%,-100%) rotate(var(--rot,0deg)) scaleY(0)}30%{opacity:1;transform:translate(-50%,-100%) rotate(var(--rot,0deg)) scaleY(1.2)}100%{opacity:0;transform:translate(-50%,-100%) rotate(var(--rot,0deg)) scaleY(1.5)}}'+
  '.bf-za-halo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:120%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(255,215,0,.55) 0%,rgba(255,180,0,.25) 40%,transparent 70%);opacity:0;animation:bfZaHalo 2s ease-out forwards}'+
  '@keyframes bfZaHalo{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.6)}}'+
  '.bf-za-god{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:40px;opacity:0;animation:bfZaGod 2s ease-out forwards;filter:drop-shadow(0 0 16px #ffd700)}'+
  '@keyframes bfZaGod{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-15deg)}25%{opacity:1;transform:translate(-50%,-50%) scale(1.3) rotate(5deg)}70%{opacity:.8}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5) rotate(0)}}'+
  // Donuts que flotan cayendo
  '.bf-za-donut{position:absolute;font-size:22px;opacity:0;animation:bfZaDonut 2.2s ease-in forwards;filter:drop-shadow(0 0 8px rgba(255,200,100,.7))}'+
  '@keyframes bfZaDonut{0%{opacity:0;transform:translateY(-30px) scale(.4) rotate(0deg)}15%{opacity:1;transform:translateY(0) scale(1.2) rotate(20deg)}100%{opacity:0;transform:translateY(80px) scale(.8) rotate(360deg)}}'+
  // Lechugas (frascos de leche) que emergen
  '.bf-za-milk{position:absolute;font-size:20px;opacity:0;animation:bfZaMilk 2s ease-out forwards;filter:drop-shadow(0 0 8px rgba(200,240,255,.7))}'+
  '@keyframes bfZaMilk{0%{opacity:0;transform:scale(.3) rotate(0deg)}20%{opacity:1;transform:scale(1.1) rotate(-15deg)}100%{opacity:0;transform:scale(1.5) rotate(30deg) translateY(-40px)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function makeBanner(name,color){
    return '<div class="bf-epic-banner" style="color:'+color+'">'+String(name).toUpperCase()+'</div>';
  }

  function buildLayer(html,color){
    var layer=document.createElement('div');
    layer.className='bf-epic-fx';
    layer.style.color=color;
    layer.innerHTML=html;
    return layer;
  }

  function attach(card,layer,duration){
    card.appendChild(layer);
    card.classList.add('bf-epic-glow');
    setTimeout(function(){card.classList.remove('bf-epic-glow');},1200);
    setTimeout(function(){if(layer.parentNode)layer.parentNode.removeChild(layer);},duration||3000);
  }

  function animeHook(card){
    var A=window.__bfAnime;
    if(A){var r=card.getBoundingClientRect(),c={x:r.left+r.width/2,y:r.top+r.height/2};A.speedLines(c);}
  }

  // === KRUNDERKRAK === Devastación: martillo que rompe / Aniquilación: calavera + fuego
  function playKrunderKrak(card,isElite,ability,clan){
    var color='#ff5544';
    var html=makeBanner(ability,color);
    html+='<span class="bf-kk-hammer" style="color:'+color+'">🔨</span>';
    html+='<div class="bf-kk-crack"></div>';
    html+='<div class="bf-kk-crack" style="transform:translate(-50%,-50%) rotate(60deg);animation-delay:.1s"></div>';
    html+='<div class="bf-kk-crack" style="transform:translate(-50%,-50%) rotate(-60deg);animation-delay:.15s"></div>';
    if(isElite){
      html+='<span class="bf-kk-skull">☠️</span>';
      for(var i=0;i<6;i++)html+='<span class="bf-kk-flame" style="left:'+(15+Math.random()*70)+'%;top:'+(40+Math.random()*35)+'%;animation-delay:'+(Math.random()*0.5).toFixed(2)+'s">🔥</span>';
    }
    var layer=buildLayer(html,color);attach(card,layer,3000);animeHook(card);
  }

  // === EL HEAVY === Headbang: ondas sónicas / Wall of Death: muro de calaveras
  function playHeavy(card,isElite,ability,clan){
    var color='#ffaa44';
    var html=makeBanner(ability,color);
    if(isElite){
      html+='<span class="bf-eh-wall" style="color:#ff3333">☠️💀☠️</span>';
      html+='<div class="bf-eh-bloodbar"></div>';
      for(var i=0;i<5;i++)html+='<span class="bf-kk-flame" style="left:'+(15+Math.random()*70)+'%;top:'+(35+Math.random()*40)+'%;animation-delay:'+(Math.random()*0.6).toFixed(2)+'s">💀</span>';
    }else{
      html+='<span class="bf-eh-guitar" style="color:'+color+'">🎸</span>';
      for(var i=0;i<6;i++)html+='<span class="bf-eh-mnote" style="left:'+(15+Math.random()*70)+'%;top:'+(15+Math.random()*50)+'%;animation-delay:'+(Math.random()*0.9).toFixed(2)+'s;color:'+color+'">'+(['🎵','🎶','♪','♫'][i%4])+'</span>';
      for(var i=0;i<3;i++)html+='<div class="bf-eh-ripple" style="color:'+color+';animation-delay:'+(i*0.3).toFixed(2)+'s"></div>';
    }
    var layer=buildLayer(html,color);attach(card,layer,3000);animeHook(card);
  }

  // === SYLVEX === Mutación: ADN / Evolución Suprema: espiral dorada + barras
  function playSylvex(card,isElite,ability,clan){
    var color=isElite?'#ffd24a':'#44ddff';
    var html=makeBanner(ability,color);
    if(isElite){
      html+='<div class="bf-sy-evo"></div>';
      html+='<div class="bf-sy-evo" style="animation-delay:.3s"></div>';
      for(var i=0;i<3;i++)html+='<span class="bf-sy-star" style="left:'+(20+Math.random()*60)+'%;top:'+(20+Math.random()*50)+'%;animation-delay:'+(Math.random()*0.6).toFixed(2)+'s">⭐</span>';
      for(var i=0;i<4;i++)html+='<div class="bf-sy-bar" style="left:'+(30+i*12)+'%;animation-delay:'+(i*0.15).toFixed(2)+'s"></div>';
    }else{
      for(var i=0;i<6;i++)html+='<span class="bf-sy-dna" style="left:'+(10+Math.random()*80)+'%;top:'+(10+Math.random()*70)+'%;animation-delay:'+(Math.random()*0.5).toFixed(2)+'s;color:'+color+'">🧬</span>';
      html+='<div class="bf-sy-mutate" style="color:'+color+'"></div>';
    }
    var layer=buildLayer(html,color);attach(card,layer,3000);animeHook(card);
  }

  // === GORVAK === Onda de Impacto: anillos / Devastación Orbital: proyectiles
  function playGorvak(card,isElite,ability,clan){
    var color=isElite?'#ffaa00':'#ffcc44';
    var html=makeBanner(ability,color);
    if(isElite){
      html+='<div class="bf-go-orbit"></div>';
      for(var i=0;i<8;i++){
        var ang=(i/8)*360;
        var tx=Math.cos(ang*Math.PI/180)*50;
        var ty=Math.sin(ang*Math.PI/180)*50;
        html+='<span class="bf-go-proj" style="left:50%;top:50%;--tx:'+tx.toFixed(0)+'px;--ty:'+ty.toFixed(0)+'px;animation-delay:'+(i*0.1).toFixed(2)+'s;color:'+color+'">➤</span>';
      }
    }else{
      for(var i=0;i<4;i++)html+='<div class="bf-go-ring" style="color:'+color+';animation-delay:'+(i*0.2).toFixed(2)+'s"></div>';
      html+='<span class="bf-go-target" style="color:'+color+'">🎯</span>';
    }
    var layer=buildLayer(html,color);attach(card,layer,3000);animeHook(card);
  }

  // === ZARMANDIS === Juicio Divino: cruz sagrada / Divinidad: halo dorado
  function playZarmandis(card,isElite,ability,clan){
    var color=isElite?'#ffd700':'#ffe88a';
    var html=makeBanner(ability,color);
    if(isElite){
      html+='<div class="bf-za-halo"></div>';
      html+='<span class="bf-za-god">🙏</span>';
      for(var i=0;i<8;i++){
        var rot=(i/8)*360;
        html+='<div class="bf-za-ray" style="--rot:'+rot.toFixed(0)+'deg;color:'+color+';animation-delay:'+(i*0.08).toFixed(2)+'s"></div>';
      }
      for(var i=0;i<6;i++)html+='<span class="bf-za-donut" style="left:'+(8+Math.random()*84)+'%;top:'+(10+Math.random()*60)+'%;animation-delay:'+(Math.random()*0.8).toFixed(2)+'s">🍩</span>';
      for(var i=0;i<5;i++)html+='<span class="bf-za-milk" style="left:'+(10+Math.random()*80)+'%;top:'+(15+Math.random()*55)+'%;animation-delay:'+(Math.random()*0.8).toFixed(2)+'s">🥛</span>';
    }else{
      html+='<span class="bf-za-god" style="font-size:36px">✝️</span>';
      for(var i=0;i<6;i++){
        var rot=(i/6)*360;
        html+='<div class="bf-za-ray" style="--rot:'+rot.toFixed(0)+'deg;color:'+color+';animation-delay:'+(i*0.1).toFixed(2)+'s"></div>';
      }
      for(var i=0;i<4;i++)html+='<span class="bf-za-donut" style="left:'+(10+Math.random()*80)+'%;top:'+(15+Math.random()*55)+'%;animation-delay:'+(Math.random()*0.7).toFixed(2)+'s">🍩</span>';
      for(var i=0;i<3;i++)html+='<span class="bf-za-milk" style="left:'+(15+Math.random()*70)+'%;top:'+(20+Math.random()*50)+'%;animation-delay:'+(Math.random()*0.7).toFixed(2)+'s">🥛</span>';
    }
    var layer=buildLayer(html,color);attach(card,layer,3000);animeHook(card);
  }

  function play(side,hero){
    var card=document.getElementById('b_'+side+'_'+(hero&&hero.id));
    if(!card)return;
    if(getComputedStyle(card).position==='static')card.style.position='relative';
    var isElite=!!hero.eliteMode;
    var ability=isElite?(hero.eAbility||hero.ability||'Habilidad'):(hero.ability||'Habilidad');
    var clan=hero.clanColor||'#cc88ff';
    var name=hero.name;
    if(name==='KrunderKrak')return playKrunderKrak(card,isElite,ability,clan);
    if(name==='El Heavy')return playHeavy(card,isElite,ability,clan);
    if(name==='Sylvex')return playSylvex(card,isElite,ability,clan);
    if(name==='Gorvak')return playGorvak(card,isElite,ability,clan);
    if(name==='Zarmandis')return playZarmandis(card,isElite,ability,clan);
  }

  function install(){
    if(typeof window.useAbility!=='function'||window.__bfEpicAbxHooked)return false;
    window.__bfEpicAbxHooked=true;
    var orig=window.useAbility;
    window.useAbility=function(side,hero){
      if(hero&&hero.name&&hero.clan==='Épicas')try{play(side,hero);}catch(e){}
      return orig.apply(this,arguments);
    };
    return true;
  }
  var tries=0,t=setInterval(function(){if(install()||tries++>100)clearInterval(t);},150);
})();
</script>
`;