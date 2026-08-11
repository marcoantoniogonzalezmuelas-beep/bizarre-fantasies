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
  '.bf-abx-banner{position:absolute;left:50%;top:6%;transform:translateX(-50%);white-space:nowrap;font-family:Cinzel,serif;font-weight:900;font-size:16px;letter-spacing:.4px;padding:5px 15px;border-radius:10px;background:rgba(8,5,14,.92);border:1.5px solid currentColor;box-shadow:0 0 16px currentColor;animation:bfAbxBanner 2.5s ease forwards}'+
  '@keyframes bfAbxBanner{0%{opacity:0;transform:translateX(-50%) translateY(10px) scale(.5)}15%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.12)}28%{transform:translateX(-50%) scale(1)}78%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-16px)}}'+
  '.bf-abx-ring{position:absolute;left:50%;top:50%;width:82%;aspect-ratio:1/1;transform:translate(-50%,-50%);border-radius:50%;border:3.5px dashed currentColor;box-shadow:0 0 18px currentColor,inset 0 0 18px currentColor;animation:bfAbxSpin 2.3s ease-out forwards}'+
  '@keyframes bfAbxSpin{0%{transform:translate(-50%,-50%) rotate(0deg) scale(.35);opacity:0}25%{opacity:.95}100%{transform:translate(-50%,-50%) rotate(260deg) scale(1.25);opacity:0}}'+
  '.bf-abx-flash{position:absolute;inset:-4%;border-radius:14px;background:radial-gradient(circle at 50% 55%,currentColor,transparent 72%);opacity:0;animation:bfAbxFlash 1.8s ease-out forwards;mix-blend-mode:screen}'+
  '@keyframes bfAbxFlash{0%{opacity:0}22%{opacity:.75}100%{opacity:0}}'+
  '.bf-abx-slash{position:absolute;left:50%;top:50%;width:135%;height:6px;background:linear-gradient(90deg,transparent,#fff,currentColor,transparent);box-shadow:0 0 14px currentColor;opacity:0;transform:translate(-50%,-50%) rotate(var(--rot,45deg)) scaleX(0);animation:bfAbxSlash 1.55s ease-out forwards}'+
  '@keyframes bfAbxSlash{0%{opacity:0;transform:translate(-50%,-50%) rotate(var(--rot,45deg)) scaleX(0)}30%{opacity:1;transform:translate(-50%,-50%) rotate(var(--rot,45deg)) scaleX(1.05)}70%{opacity:.9}100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--rot,45deg)) scaleX(1.15)}}'+
  '.bf-abx-p{position:absolute;font-size:24px;opacity:0;text-shadow:0 0 10px currentColor}'+
  '.bf-abx-rise{animation:bfAbxRise 2.15s ease-out forwards}'+
  '@keyframes bfAbxRise{0%{opacity:0;transform:translateY(14px) scale(.5) rotate(-8deg)}22%{opacity:1}100%{opacity:0;transform:translateY(-52px) scale(1.25) rotate(10deg)}}'+
  '.bf-abx-fall{animation:bfAbxFall 2.15s ease-in forwards}'+
  '@keyframes bfAbxFall{0%{opacity:0;transform:translateY(-18px) scale(.6)}22%{opacity:1}100%{opacity:0;transform:translateY(46px) scale(1.15) rotate(-14deg)}}'+
  '.bf-abx-shake{animation:bfAbxShake .45s ease}'+
  '@keyframes bfAbxShake{0%,100%{translate:0 0}15%{translate:-4px 2px}30%{translate:4px -3px}45%{translate:-3px -2px}60%{translate:3px 2px}75%{translate:-2px 1px}}'+
  '.bf-abx-glow{}'+
  '.bf-sfx-pop{animation:bfSfxPop .85s cubic-bezier(.2,1.5,.4,1) both}'+
  '@keyframes bfSfxPop{0%{transform:scale(0) rotate(-14deg);opacity:0}55%{transform:scale(1.14) rotate(4deg);opacity:1}75%{transform:scale(.96) rotate(-2deg)}100%{transform:scale(1) rotate(0)}}'+
  '.bf-sfx-ring{position:absolute;left:50%;top:50%;width:96%;aspect-ratio:1/1;transform:translate(-50%,-50%);border-radius:50%;border:4px solid currentColor;box-shadow:0 0 22px currentColor,inset 0 0 22px currentColor;opacity:0;animation:bfSfxRing 2.1s ease-out forwards}'+
  '@keyframes bfSfxRing{0%{opacity:0;transform:translate(-50%,-50%) scale(.15)}30%{opacity:.95}100%{opacity:0;transform:translate(-50%,-50%) scale(1.55)}}'+
  // ===== RESURRECCIÓN (Revive — luz celestial blanca) =====
  '.bf-abx-revive{position:absolute;inset:0;pointer-events:none;z-index:82;overflow:visible}'+
  // Haz de luz vertical que baja desde arriba (luz celestial)
  '.bf-revive-beam{position:absolute;left:50%;top:-30%;width:60%;height:140%;transform:translateX(-50%);background:linear-gradient(180deg,transparent 0%,rgba(255,255,255,.15) 15%,rgba(255,250,230,.55) 45%,rgba(255,255,255,.7) 50%,rgba(255,250,230,.55) 55%,rgba(255,255,255,.15) 85%,transparent 100%);filter:blur(6px);opacity:0;animation:bfReviveBeam 2.6s ease-out forwards}'+
  '@keyframes bfReviveBeam{0%{opacity:0;transform:translateX(-50%) scaleY(0)}20%{opacity:1;transform:translateX(-50%) scaleY(1)}75%{opacity:.85}100%{opacity:0;transform:translateX(-50%) scaleY(1.1)}}'+
  // Halo celestial expandiéndose (anillo de luz sagrada)
  '.bf-revive-halo{position:absolute;left:50%;top:50%;width:120%;aspect-ratio:1/1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.65) 0%,rgba(255,250,220,.35) 35%,rgba(255,255,255,.1) 60%,transparent 75%);opacity:0;animation:bfReviveHalo 2.4s ease-out forwards}'+
  '@keyframes bfReviveHalo{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}25%{opacity:1}60%{opacity:.8}100%{opacity:0;transform:translate(-50%,-50%) scale(1.4)}}'+
  // Cruz celestial (cruz de luz sagrada que se forma y se disuelve)
  '.bf-revive-cross{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0;animation:bfReviveCross 2.2s ease-out forwards}'+
  '.bf-revive-cross::before,.bf-revive-cross::after{content:"";position:absolute;background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);box-shadow:0 0 18px rgba(255,255,255,.8)}'+
  '.bf-revive-cross::before{width:120px;height:5px;left:-60px;top:-2.5px}'+
  '.bf-revive-cross::after{width:5px;height:120px;left:-2.5px;top:-60px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.9),transparent)}'+
  '@keyframes bfReviveCross{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-20deg)}30%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0deg)}65%{opacity:.7}100%{opacity:0;transform:translate(-50%,-50%) scale(1.2) rotate(8deg)}}'+
  // Chispas/luciérnagas blancas que suben
  '.bf-revive-spark{position:absolute;bottom:10%;width:4px;height:4px;border-radius:50%;background:#fff;box-shadow:0 0 8px #fff,0 0 14px rgba(255,250,200,.8);opacity:0;animation:bfReviveSpark 2s ease-out forwards}'+
  '@keyframes bfReviveSpark{0%{opacity:0;transform:translateY(0) scale(.3)}15%{opacity:1}100%{opacity:0;transform:translateY(-90px) scale(1.4)}}'+
  // Resplandor blanco del retrato del héroe
  '.bf-revive-glow{animation:bfReviveGlow 1.4s ease-out forwards}'+
  '@keyframes bfReviveGlow{0%{filter:none}30%{filter:brightness(2.2) saturate(.3) drop-shadow(0 0 30px rgba(255,255,255,.9))}100%{filter:none}}'+
  // Banner específico de resurrección
  '.bf-revive-banner{position:absolute;left:50%;top:4%;transform:translateX(-50%);white-space:nowrap;font-family:Cinzel,serif;font-weight:900;font-size:17px;letter-spacing:.6px;padding:6px 18px;border-radius:12px;background:rgba(255,255,255,.95);color:#1a0b2e;border:2px solid #fff;box-shadow:0 0 24px rgba(255,255,255,.8),0 0 40px rgba(255,250,200,.4);animation:bfReviveBanner 3s ease forwards}'+
  '@keyframes bfReviveBanner{0%{opacity:0;transform:translateX(-50%) translateY(12px) scale(.5)}12%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.15)}22%{transform:translateX(-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-18px)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // ===== COFFETATH — Cafetera Nespresso (cortado / café con leche) =====
  '.bf-coffee-fx{position:absolute;inset:0;pointer-events:none;z-index:82;overflow:visible}'+
  '.bf-coffee-machine{position:absolute;left:50%;bottom:8%;transform:translateX(-50%);width:72px;height:90px;animation:bfCoffeeMachineIn .4s ease-out both}'+
  '@keyframes bfCoffeeMachineIn{0%{opacity:0;transform:translateX(-50%) translateY(20px) scale(.6)}100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}'+
  '.bf-coffee-machine-body{width:72px;height:78px;border-radius:8px 8px 6px 6px;background:linear-gradient(180deg,#1a1a1a 0%,#2d2d2d 20%,#1a1a1a 100%);border:2px solid #000;box-shadow:0 4px 14px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.15);position:relative}'+
  '.bf-coffee-machine-top{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:48px;height:16px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#2d2d2d,#1a1a1a);border:2px solid #000;border-bottom:0}'+
  '.bf-coffee-spout{position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:14px;height:8px;background:#444;border-radius:0 0 3px 3px;border:2px solid #000;border-top:0}'+
  '.bf-coffee-light{position:absolute;top:12px;right:8px;width:8px;height:8px;border-radius:50%;background:#ff3333;box-shadow:0 0 8px #ff3333;animation:bfCoffeeBlink .6s ease-in-out infinite}'+
  '@keyframes bfCoffeeBlink{0%,100%{background:#ff3333;box-shadow:0 0 8px #ff3333}50%{background:#66ff66;box-shadow:0 0 12px #66ff66}}'+
  '.bf-coffee-label{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font-family:Rubik,sans-serif;font-size:5px;font-weight:900;color:#fff;letter-spacing:.3px;text-align:center;line-height:1.1}'+
  // Cortado (espresso normal) — taza pequeña
  '.bf-coffee-cup{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);width:26px;height:24px;opacity:0;animation:bfCoffeeCupSlide 2.2s ease-in forwards}'+
  '@keyframes bfCoffeeCupSlide{0%{opacity:0;transform:translateX(-50%) translateY(0) scale(.4)}10%{opacity:1;transform:translateX(-50%) translateY(0) scale(.8)}25%{transform:translateX(-50%) translateY(-8px) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-60px) scale(.7)}}'+
  '.bf-coffee-cup-body{width:26px;height:16px;border-radius:4px 4px 6px 6px;background:linear-gradient(180deg,#fff 0%,#e0e0e0 40%,#c8c8c8 100%);border:1.5px solid #888;position:relative;box-shadow:0 2px 6px rgba(0,0,0,.4)}'+
  '.bf-coffee-cup-body::before{content:"☕";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:9px}'+
  // Vaso de cristal con café con leche (élite) — tarro más alto
  '.bf-coffee-jar{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);width:30px;height:40px;opacity:0;animation:bfCoffeeJarSlide 2.6s ease-in forwards}'+
  '@keyframes bfCoffeeJarSlide{0%{opacity:0;transform:translateX(-50%) translateY(0) scale(.4)}10%{opacity:1;transform:translateX(-50%) translateY(0) scale(.8)}20%{transform:translateX(-50%) translateY(-6px) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-72px) scale(.7)}}'+
  '.bf-coffee-jar-body{width:30px;height:40px;border-radius:4px 4px 8px 8px;background:linear-gradient(180deg,rgba(255,255,255,.3) 0%,rgba(220,240,255,.25) 100%);border:1.5px solid rgba(255,255,255,.6);position:relative;box-shadow:0 2px 8px rgba(0,0,0,.5),inset 0 0 10px rgba(255,255,255,.1);overflow:hidden}'+
  '.bf-coffee-jar-milk{position:absolute;bottom:0;left:0;width:100%;height:50%;background:linear-gradient(180deg,#fff8e0,#ffe9b0)}'+
  '.bf-coffee-jar-coffee{position:absolute;bottom:50%;left:0;width:100%;height:40%;background:linear-gradient(180deg,#6b3a1a,#4a2a10)}'+
  '.bf-coffee-jar-lid{position:absolute;top:-3px;left:50%;transform:translateX(-50%);width:32px;height:5px;border-radius:2px;background:#c8c8c8;border:1px solid #999}'+
  // Partículas de café (humo / café fluyendo)
  '.bf-coffee-drop{position:absolute;width:5px;height:5px;border-radius:50%;background:#8b4513;opacity:0;animation:bfCoffeeDrop 1.2s ease-in forwards}'+
  '@keyframes bfCoffeeDrop{0%{opacity:0;transform:translate(0,0) scale(.3)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),var(--dy,-40px)) scale(1.2)}}'+
  // Banner
  '.bf-coffee-banner{position:absolute;left:50%;top:4%;transform:translateX(-50%);white-space:nowrap;font-family:Cinzel,serif;font-weight:900;font-size:15px;letter-spacing:.4px;padding:5px 15px;border-radius:10px;background:rgba(20,12,6,.95);border:1.5px solid #8b4513;box-shadow:0 0 16px rgba(139,69,19,.6);color:#ffd9a0;animation:bfCoffeeBanner 2.8s ease forwards}'+
  '@keyframes bfCoffeeBanner{0%{opacity:0;transform:translateX(-50%) translateY(10px) scale(.5)}12%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.1)}22%{transform:translateX(-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-14px)}}'+
  // Glow del retrato del héroe
  '.bf-coffee-glow{animation:bfCoffeeGlow 1.2s ease-out forwards}'+
  '@keyframes bfCoffeeGlow{0%{filter:none}30%{filter:brightness(1.5) saturate(1.3) drop-shadow(0 0 18px rgba(255,210,120,.7))}100%{filter:none}}';

  // Familias visuales según el tipo de habilidad (akind) del héroe.
  var FAM={
    'aoe-cc':'melee','execute':'melee','pierce-cc':'melee','lifesteal-cc':'melee','crush-cc':'melee','unblock-cc':'melee','smash-equip':'melee',
    'aoe-ad':'ranged','pierce-ad':'ranged','big-ad':'ranged','double-ad':'ranged','mark':'ranged','evade':'ranged',
    'aoe-he':'magic','big-he':'magic','silence':'magic','drain':'magic','skip-turn':'magic','tk_dizzy':'magic','tk_confuse':'magic','tk_drunk':'magic','tk_none':'magic',
    'self-heal':'holy','heal-ally':'holy','heal-all':'holy','revive':'revive','shield-ally':'holy',
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
    reflect:{color:'#c79bff',icon:'↺',glyphs:['◆','✦','◇'],ring:1,flash:1},
    revive:{color:'#ffffff',icon:'✚',glyphs:['✚','❋','✦','✨'],special:'revive'}
  };

  // Héroes con cinemática propia en epicAbilityFxPatch.js — no duplicar.
  // Matching por ID (card_id de la BD) — los nombres pueden cambiar.
  var EPIC_FX_NAMES={};
  var EPIC_FX_IDS={'kre':1,'hev':1,'syx':1,'gor':1,'zer':1,'sol':1,'nar':1};

  function play(side,hero){
    var card=document.getElementById('b_'+side+'_'+(hero&&hero.id));
    if(!card)return;
    // Los héroes épicos con animación propia se saltan la genérica.
    if(hero&&(EPIC_FX_NAMES[hero.name]||EPIC_FX_IDS[hero.id]))return;
    var theme=THEMES[FAM[hero.akind]||'magic'];
    var fam=FAM[hero.akind]||'magic';
    var clan=hero.clanColor||theme.color;
    if(getComputedStyle(card).position==='static')card.style.position='relative';

    // ===== Tema especial: COFFETATH (cafetera Nespresso) =====
    if(hero.name==='Coffetath'){
      var clayer=document.createElement('div');
      clayer.className='bf-coffee-fx';
      var cname=hero.eliteMode?(hero.eAbility||hero.ability||'☕'): (hero.ability||'☕');
      var isEliteCoffee=!!hero.eliteMode;
      var chtml='<div class="bf-coffee-banner">'+String(cname).toUpperCase()+'</div>';
      chtml+='<div class="bf-coffee-machine"><div class="bf-coffee-machine-body"><div class="bf-coffee-machine-top"></div><div class="bf-coffee-spout"></div><div class="bf-coffee-light"></div><div class="bf-coffee-label">NESPRESSO</div></div></div>';
      // Partículas de café fluyendo desde la boquilla
      for(var ci=0;ci<6;ci++){
        chtml+='<div class="bf-coffee-drop" style="left:'+(44+Math.random()*12)+'%;bottom:'+(32+Math.random()*8)+'%;animation-delay:'+(0.3+ci*0.15).toFixed(2)+'s;--dx:'+(Math.random()*16-8).toFixed(0)+'px;--dy:-'+(30+Math.random()*30).toFixed(0)+'px"></div>';
      }
      if(isEliteCoffee){
        // Élite: café con leche en vaso de cristal
        chtml+='<div class="bf-coffee-jar"><div class="bf-coffee-jar-lid"></div><div class="bf-coffee-jar-body"><div class="bf-coffee-jar-milk"></div><div class="bf-coffee-jar-coffee"></div></div></div>';
      }else{
        // Normal: cortado espresso (taza pequeña)
        chtml+='<div class="bf-coffee-cup"><div class="bf-coffee-cup-body"></div></div>';
      }
      clayer.innerHTML=chtml;
      card.appendChild(clayer);
      card.classList.add('bf-coffee-glow');
      setTimeout(function(){card.classList.remove('bf-coffee-glow');},1300);
      setTimeout(function(){if(clayer.parentNode)clayer.parentNode.removeChild(clayer);},3000);
      var CA=window.__bfAnime;
      if(CA){
        var crc=card.getBoundingClientRect(),ccc={x:crc.left+crc.width/2,y:crc.top+crc.height/2};
        CA.speedLines(ccc);
      }
      return;
    }

    // ===== Tema especial: RESURRECCIÓN (luz celestial blanca) =====
    if(theme.special==='revive'){
      var rlayer=document.createElement('div');
      rlayer.className='bf-abx-revive';
      var rname=hero.eliteMode?(hero.eAbility||hero.ability||'Reaviva'):(hero.ability||'Reaviva');
      var rhtml='<div class="bf-revive-beam"></div>';
      rhtml+='<div class="bf-revive-halo"></div>';
      rhtml+='<div class="bf-revive-halo" style="animation-delay:.25s"></div>';
      rhtml+='<div class="bf-revive-cross"></div>';
      for(var si=0;si<12;si++){
        rhtml+='<div class="bf-revive-spark" style="left:'+(6+Math.random()*88)+'%;animation-delay:'+(Math.random()*0.6).toFixed(2)+'s;animation-duration:'+(1.6+Math.random()*0.8).toFixed(1)+'s"></div>';
      }
      rhtml+='<div class="bf-revive-banner">✚ '+String(rname).toUpperCase()+' ✚</div>';
      rlayer.innerHTML=rhtml;
      card.appendChild(rlayer);
      card.classList.add('bf-revive-glow');
      setTimeout(function(){card.classList.remove('bf-revive-glow');},1500);
      setTimeout(function(){if(rlayer.parentNode)rlayer.parentNode.removeChild(rlayer);},3200);
      // Remate anime del sistema
      var A0=window.__bfAnime;
      if(A0){
        var rc0=card.getBoundingClientRect(),cc0={x:rc0.left+rc0.width/2,y:rc0.top+rc0.height/2};
        A0.speedLines(cc0);
        if(A0.spriteBurst)A0.spriteBurst('ab_holy',cc0,260,2200);
      }
      return;
    }

    var layer=document.createElement('div');
    layer.className='bf-abx';
    layer.style.color=theme.color;
    var name=hero.eliteMode?(hero.eAbility||hero.ability||'Habilidad'):(hero.ability||'Habilidad');
    var html='';
    if(theme.ring)html+='<div class="bf-abx-ring"></div>';
    // (flash de destello eliminado: se veía como un recuadro blanco sobre la carta)
    for(var i=0;i<8;i++){
      var g=theme.glyphs[i%theme.glyphs.length];
      var cls=theme.fall?'bf-abx-fall':'bf-abx-rise';
      html+='<span class="bf-abx-p '+cls+'" style="left:'+(8+Math.random()*78)+'%;top:'+(theme.fall?(5+Math.random()*20):(55+Math.random()*32))+'%;animation-delay:'+(Math.random()*0.45).toFixed(2)+'s;font-size:'+(18+Math.random()*15)+'px">'+g+'</span>';
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
      // Sprite anime grande de la habilidad: el efecto más espectacular.
      if(A.spriteBurst)A.spriteBurst('ab_'+fam,cc,260,2150);
      if(fam==='melee'||fam==='ranged'||fam==='debuff')setTimeout(function(){A.hitStar(cc);},180);
    }
    card.classList.add(theme.shake?'bf-abx-shake':'bf-abx-glow');
    setTimeout(function(){card.classList.remove('bf-abx-shake','bf-abx-glow');},1000);
    setTimeout(function(){if(layer.parentNode)layer.parentNode.removeChild(layer);},2600);
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
    var html='<div class="bf-sfx-ring"></div><div class="bf-sfx-ring" style="animation-delay:.18s"></div>';
    for(var i=0;i<10;i++){
      html+='<span class="bf-abx-p bf-abx-rise" style="left:'+(6+Math.random()*82)+'%;top:'+(45+Math.random()*42)+'%;animation-delay:'+(Math.random()*0.5).toFixed(2)+'s;font-size:'+(19+Math.random()*16)+'px">'+glyphs[i%glyphs.length]+'</span>';
    }
    html+='<div class="bf-abx-banner">✨ ¡INVOCADO!</div>';
    layer.innerHTML=html;
    card.appendChild(layer);
    // Remate anime de la invocación: líneas de velocidad + estrella al aparecer.
    var A2=window.__bfAnime;
    if(A2){
      var rs=card.getBoundingClientRect(),cs={x:rs.left+rs.width/2,y:rs.top+rs.height/2};
      // Portal de invocación anime girando bajo el token que aparece.
      if(A2.spriteBurst)A2.spriteBurst('summon_portal',cs,260,2250);
      A2.speedLines(cs);
      setTimeout(function(){A2.hitStar(cs);},220);
    }
    card.classList.add('bf-sfx-pop');
    setTimeout(function(){card.classList.remove('bf-sfx-pop');},950);
    setTimeout(function(){if(layer.parentNode)layer.parentNode.removeChild(layer);},2700);
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

  // Deduplicación: evita que la animación se dispare dos veces si tanto el
  // hook de useAbility como el escaneo periódico detectan el mismo uso.
  var lastFx={};
  function tryPlay(side,hero){
    if(!hero)return;
    // Los héroes épicos con animación propia los gestiona epicAbilityFxPatch.js.
    if(hero.name&&EPIC_FX_NAMES[hero.name])return;
    if(hero.id&&EPIC_FX_IDS[hero.id])return;
    var key=side+'_'+hero.id;
    var now=Date.now();
    if(lastFx[key]&&now-lastFx[key]<1200)return;
    lastFx[key]=now;
    try{play(side,hero);}catch(e){}
  }

  // Expone el play para que mpAbilityCinePatch pueda disparar los FX genéricos
  // en el cliente cuando recibe el mensaje de sincronización del host.
  window.__bfPlayAbilityFx=function(side,hero){ if(hero)try{tryPlay(side,hero);}catch(e){} };

  // Escaneo periódico: detecta cuando abilityUsed pasa de false a true.
  // Funciona en AMBOS jugadores (host y cliente) — el cliente no recibe
  // la llamada a useAbility, solo la actualización de estado con abilityUsed.
  // G.team viaja en el snapshot online, así que esto corre en ambos.
  var prevUsed={};
  function scanAbilities(){
    if(typeof G==='undefined'||!G||!G.team)return;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.id)return;
        var key=side+'_'+h.id;
        var used=!!h.abilityUsed;
        if(used&&!prevUsed[key]){
          tryPlay(side,h);
        }
        prevUsed[key]=used;
      });
    });
  }

  function install(){
    if(typeof window.useAbility!=='function'||window.__bfAbxHooked)return false;
    window.__bfAbxHooked=true;
    var orig=window.useAbility;
    window.useAbility=function(side,hero){
      if(hero)try{tryPlay(side,hero);}catch(e){}
      return orig.apply(this,arguments);
    };
    return true;
  }
  var tries=0,t=setInterval(function(){
    scanAbilities();
    if(!window.__bfAbxHooked){
      if(install()||tries++>100)clearInterval(t);
    }
  },150);
})();
</script>
`;