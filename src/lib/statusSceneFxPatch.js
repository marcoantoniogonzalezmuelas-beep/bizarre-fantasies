// Efectos visuales de ESCENA sobre el retrato del héroe según su estado.
// Sangre brotando (agonía), copos+estalactitas (congelado), calaveras+velitas
// negras (maldición), etc. Diseñados para NO parpadear, NO hacer intermitencias
// de luz y NO mover al héroe: todo vive en una capa absoluta con
// contain:layout style paint, solo se animan partículas sueltas con transforms
// suaves y opacidad de fundido lento (4-8 s).
//
// IMPORTANTE: cada efecto tiene elementos FIJOS (siempre visibles) + partículas
// animadas. Las partículas nunca empiezan fuera del contenedor (overflow:hidden
// las recortaría). Los elementos fijos usan posiciones dentro del área visible.
export const STATUS_SCENE_FX_PATCH = `
<script>
(function(){
  if(window.__bfStatusSceneFx) return;
  window.__bfStatusSceneFx = true;

  var css = [
    '.bf-scene-fx{position:absolute!important;inset:0!important;z-index:18!important;pointer-events:none!important;overflow:hidden!important;border-radius:inherit;contain:layout style paint!important}',
    '',
    '/* AGONÍA — sangre goteando desde el borde superior + charco oscuro abajo */',
    '.bf-fx-agony{background:linear-gradient(180deg,rgba(100,0,0,.28) 0%,transparent 40%),radial-gradient(ellipse at 50% 100%,rgba(70,0,0,.4) 0%,transparent 55%)}',
    '.bf-fx-agony .bf-blood{position:absolute;top:0;width:6px;height:28px;border-radius:0 0 50% 50%;background:linear-gradient(180deg,#7a0000,#c00000);box-shadow:0 0 6px rgba(150,0,0,.7);animation:bfBloodDrip 4s linear infinite}',
    '.bf-fx-agony .bf-blood:nth-child(1){left:10%;animation-delay:0s;animation-duration:3.5s}',
    '.bf-fx-agony .bf-blood:nth-child(2){left:25%;animation-delay:1.2s;animation-duration:4s;height:22px}',
    '.bf-fx-agony .bf-blood:nth-child(3){left:42%;animation-delay:.6s;animation-duration:3s;height:32px}',
    '.bf-fx-agony .bf-blood:nth-child(4){left:60%;animation-delay:2s;animation-duration:4.5s;height:24px}',
    '.bf-fx-agony .bf-blood:nth-child(5){left:78%;animation-delay:.3s;animation-duration:3.8s;height:26px}',
    '.bf-fx-agony .bf-blood:nth-child(6){left:90%;animation-delay:1.8s;animation-duration:4.2s;height:20px}',
    '@keyframes bfBloodDrip{0%{transform:scaleY(0);transform-origin:top;opacity:0}10%{transform:scaleY(1);opacity:1}85%{transform:scaleY(1) translateY(0);opacity:1}100%{transform:scaleY(1) translateY(180px);opacity:0}}',
    '.bf-fx-agony .bf-splatter{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(140,0,0,.5),transparent 65%);animation:bfSplatPulse 3s ease-in-out infinite}',
    '.bf-fx-agony .bf-splatter:nth-child(7){left:15%;top:30%;width:24px;height:24px;animation-delay:0s}',
    '.bf-fx-agony .bf-splatter:nth-child(8){right:12%;top:55%;width:30px;height:30px;animation-delay:1.5s}',
    '.bf-fx-agony .bf-splatter:nth-child(9){left:40%;bottom:20%;width:20px;height:20px;animation-delay:.8s}',
    '@keyframes bfSplatPulse{0%,100%{opacity:.4;transform:scale(.9)}50%{opacity:.7;transform:scale(1.1)}}',
    '',
    '/* CONGELADO — estalactitas estáticas + copos cayendo */',
    '.bf-fx-frozen{background:linear-gradient(180deg,rgba(120,200,255,.18) 0%,transparent 35%),radial-gradient(ellipse at 50% 100%,rgba(100,180,255,.15) 0%,transparent 55%)}',
    '.bf-fx-frozen .bf-stalactite{position:absolute;top:0;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:28px solid rgba(180,220,255,.55);filter:drop-shadow(0 2px 3px rgba(100,180,255,.5))}',
    '.bf-fx-frozen .bf-stalactite:nth-child(1){left:8%;border-left-width:6px;border-right-width:6px;border-top-width:22px}',
    '.bf-fx-frozen .bf-stalactite:nth-child(2){left:30%;border-top-width:34px}',
    '.bf-fx-frozen .bf-stalactite:nth-child(3){left:55%;border-left-width:7px;border-right-width:7px;border-top-width:26px}',
    '.bf-fx-frozen .bf-stalactite:nth-child(4){left:78%;border-top-width:30px}',
    '.bf-fx-frozen .bf-stalactite:nth-child(5){left:92%;border-left-width:5px;border-right-width:5px;border-top-width:20px}',
    '.bf-fx-frozen .bf-snow{position:absolute;top:0;font-size:14px;color:rgba(200,230,255,.9);text-shadow:0 0 6px rgba(150,200,255,.7);animation:bfSnowFall 6s linear infinite}',
    '.bf-fx-frozen .bf-snow:nth-child(6){left:15%;animation-delay:0s;animation-duration:5s}',
    '.bf-fx-frozen .bf-snow:nth-child(7){left:40%;animation-delay:2s;animation-duration:7s;font-size:10px}',
    '.bf-fx-frozen .bf-snow:nth-child(8){left:65%;animation-delay:1s;animation-duration:6s;font-size:16px}',
    '.bf-fx-frozen .bf-snow:nth-child(9){left:85%;animation-delay:3s;animation-duration:5.5s;font-size:11px}',
    '.bf-fx-frozen .bf-snow:nth-child(10){left:25%;animation-delay:4s;animation-duration:6.5s;font-size:13px}',
    '@keyframes bfSnowFall{0%{transform:translateY(0) rotate(0);opacity:0}10%{opacity:.9}85%{opacity:.8}100%{transform:translateY(200px) rotate(180deg);opacity:0}}',
    '',
    '/* MALDITO — calaveras flotando + velitas negras con llama violeta */',
    '.bf-fx-curse{background:linear-gradient(180deg,rgba(60,0,80,.2) 0%,transparent 40%),radial-gradient(ellipse at 50% 80%,rgba(40,0,60,.28) 0%,transparent 50%)}',
    '.bf-fx-curse .bf-skull{position:absolute;bottom:0;font-size:18px;filter:drop-shadow(0 0 6px rgba(120,0,180,.8));animation:bfSkullFloat 6s ease-in-out infinite}',
    '.bf-fx-curse .bf-skull:nth-child(1){left:10%;animation-delay:0s;animation-duration:5.5s}',
    '.bf-fx-curse .bf-skull:nth-child(2){left:50%;animation-delay:2s;animation-duration:6s;font-size:14px}',
    '.bf-fx-curse .bf-skull:nth-child(3){left:82%;animation-delay:1s;animation-duration:5s;font-size:16px}',
    '@keyframes bfSkullFloat{0%{transform:translateY(0);opacity:0}12%{opacity:.8}80%{opacity:.7}100%{transform:translateY(-180px);opacity:0}}',
    '.bf-fx-curse .bf-candle{position:absolute;bottom:6px;width:7px;height:28px;background:linear-gradient(180deg,#1a1a1a,#050505);border-radius:2px;box-shadow:0 0 8px rgba(80,0,120,.4)}',
    '.bf-fx-curse .bf-candle:nth-child(4){left:3px}',
    '.bf-fx-curse .bf-candle:nth-child(5){right:3px;left:auto}',
    '.bf-fx-curse .bf-candle::after{content:"";position:absolute;top:-13px;left:50%;transform:translateX(-50%);width:6px;height:12px;border-radius:50% 50% 50% 50%;background:linear-gradient(180deg,rgba(190,110,255,.8),rgba(120,40,180,.3));box-shadow:0 0 10px rgba(160,80,255,.7);animation:bfFlameSway 3.5s ease-in-out infinite}',
    '@keyframes bfFlameSway{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.12)}}',
    '',
    '/* DORMIDO — Zzz flotando hacia arriba */',
    '.bf-fx-sleep{background:linear-gradient(180deg,rgba(80,100,180,.12) 0%,transparent 40%)}',
    '.bf-fx-sleep .bf-zzz{position:absolute;bottom:20px;font-family:Cinzel,serif;font-weight:900;color:rgba(150,170,255,.8);text-shadow:0 0 8px rgba(100,130,220,.6);animation:bfZzzFloat 5s ease-out infinite}',
    '.bf-fx-sleep .bf-zzz:nth-child(1){left:30%;font-size:14px;animation-delay:0s;animation-duration:4.5s}',
    '.bf-fx-sleep .bf-zzz:nth-child(2){left:55%;font-size:18px;animation-delay:1.5s;animation-duration:5s}',
    '.bf-fx-sleep .bf-zzz:nth-child(3){left:42%;font-size:11px;animation-delay:3s;animation-duration:4s}',
    '@keyframes bfZzzFloat{0%{transform:translateY(0) scale(.8);opacity:0}15%{opacity:.8}80%{opacity:.7}100%{transform:translateY(-150px) scale(1.2);opacity:0}}',
    '',
    '/* BENDITO — rayos de luz dorados desde arriba + destellos + aura sagrada */',
    '.bf-fx-bless{background:linear-gradient(180deg,rgba(255,210,74,.22) 0%,transparent 40%),radial-gradient(ellipse at 50% 0%,rgba(255,220,100,.28) 0%,transparent 55%)}',
    '.bf-fx-bless .bf-ray{position:absolute;top:0;width:3px;height:100%;background:linear-gradient(180deg,rgba(255,230,120,.55),transparent 70%);transform-origin:top;animation:bfRayPulse 3s ease-in-out infinite}',
    '.bf-fx-bless .bf-ray:nth-child(1){left:20%;animation-delay:0s}',
    '.bf-fx-bless .bf-ray:nth-child(2){left:50%;animation-delay:1s;animation-duration:3.5s}',
    '.bf-fx-bless .bf-ray:nth-child(3){left:80%;animation-delay:2s}',
    '@keyframes bfRayPulse{0%,100%{opacity:.3;transform:scaleY(.8)}50%{opacity:.8;transform:scaleY(1)}}',
    '.bf-fx-bless .bf-spark{position:absolute;font-size:16px;color:rgba(255,235,130,1);text-shadow:0 0 10px rgba(255,210,74,.95),0 0 20px rgba(255,200,50,.6);animation:bfSparkFloat 4s ease-in-out infinite}',
    '.bf-fx-bless .bf-spark:nth-child(4){left:15%;top:25%;animation-delay:0s}',
    '.bf-fx-bless .bf-spark:nth-child(5){left:68%;top:30%;animation-delay:1.2s;font-size:13px}',
    '.bf-fx-bless .bf-spark:nth-child(6){left:38%;top:55%;animation-delay:2.4s;font-size:18px}',
    '.bf-fx-bless .bf-spark:nth-child(7){left:82%;top:20%;animation-delay:.8s;font-size:12px}',
    '.bf-fx-bless .bf-spark:nth-child(8){left:25%;top:70%;animation-delay:3s;font-size:14px}',
    '@keyframes bfSparkFloat{0%,100%{transform:translateY(0) scale(1);opacity:.5}50%{transform:translateY(-14px) scale(1.3);opacity:1}}',
    '',
    '/* PARALIZADO — relámpagos estáticos (sin intermitencia) */',
    '.bf-fx-para{background:linear-gradient(180deg,rgba(255,225,74,.1) 0%,transparent 40%)}',
    '.bf-fx-para .bf-bolt{position:absolute;font-size:22px;color:rgba(255,230,100,.85);text-shadow:0 0 10px rgba(255,210,74,.7),0 0 20px rgba(255,200,50,.4);animation:bfBoltPulse 4s ease-in-out infinite}',
    '.bf-fx-para .bf-bolt:nth-child(1){left:8%;top:15%;animation-delay:0s}',
    '.bf-fx-para .bf-bolt:nth-child(2){right:8%;top:40%;left:auto;animation-delay:1.5s;font-size:18px}',
    '.bf-fx-para .bf-bolt:nth-child(3){left:20%;bottom:20%;animation-delay:.8s;font-size:16px}',
    '@keyframes bfBoltPulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:.9;transform:scale(1.1)}}',
    '',
    '/* CONFUSO — estrellas orbitando lentamente */',
    '.bf-fx-confuse{background:radial-gradient(circle at 50% 50%,rgba(255,150,230,.1) 0%,transparent 55%)}',
    '.bf-fx-confuse .bf-star{position:absolute;left:50%;top:50%;font-size:14px;color:rgba(255,160,220,.9);text-shadow:0 0 8px rgba(255,120,200,.6);transform-origin:0 0;animation:bfStarOrbit 6s linear infinite}',
    '.bf-fx-confuse .bf-star:nth-child(1){animation-delay:0s}',
    '.bf-fx-confuse .bf-star:nth-child(2){animation-delay:2s;font-size:10px}',
    '.bf-fx-confuse .bf-star:nth-child(3){animation-delay:4s;font-size:12px}',
    '@keyframes bfStarOrbit{from{transform:rotate(0deg) translateX(55px) rotate(0deg)}to{transform:rotate(360deg) translateX(55px) rotate(-360deg)}}',
    '',
    '/* SILENCIADO — runas rotas cayendo */',
    '.bf-fx-silence{background:linear-gradient(180deg,rgba(150,120,200,.1) 0%,transparent 40%)}',
    '.bf-fx-silence .bf-rune{position:absolute;top:0;font-size:16px;color:rgba(180,150,220,.65);text-shadow:0 0 6px rgba(150,120,200,.5);animation:bfRuneFall 5s linear infinite}',
    '.bf-fx-silence .bf-rune:nth-child(1){left:20%;animation-delay:0s;animation-duration:4.5s}',
    '.bf-fx-silence .bf-rune:nth-child(2){left:55%;animation-delay:1.8s;animation-duration:5s;font-size:12px}',
    '.bf-fx-silence .bf-rune:nth-child(3){left:80%;animation-delay:3s;animation-duration:4s;font-size:14px}',
    '@keyframes bfRuneFall{0%{transform:translateY(0) rotate(0);opacity:0}12%{opacity:.7}85%{opacity:.6}100%{transform:translateY(200px) rotate(90deg);opacity:0}}',
    '',
    '/* BORRACHO — burbujas de espuma subiendo */',
    '.bf-fx-drunk{background:linear-gradient(180deg,transparent 60%,rgba(180,130,50,.12) 100%)}',
    '.bf-fx-drunk .bf-bubble{position:absolute;bottom:0;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,220,120,.55),rgba(180,130,50,.25));border:1px solid rgba(255,200,100,.35);animation:bfBubbleRise 5s ease-in infinite}',
    '.bf-fx-drunk .bf-bubble:nth-child(1){left:20%;width:10px;height:10px;animation-delay:0s;animation-duration:4.5s}',
    '.bf-fx-drunk .bf-bubble:nth-child(2){left:50%;width:7px;height:7px;animation-delay:1.5s;animation-duration:5s}',
    '.bf-fx-drunk .bf-bubble:nth-child(3){left:75%;width:12px;height:12px;animation-delay:.8s;animation-duration:4s}',
    '.bf-fx-drunk .bf-bubble:nth-child(4){left:35%;width:6px;height:6px;animation-delay:2.5s;animation-duration:5.5s}',
    '@keyframes bfBubbleRise{0%{transform:translateY(0);opacity:0}12%{opacity:.8}85%{opacity:.7}100%{transform:translateY(-180px);opacity:0}}',
    '',
    '/* MAREADO — espirales girando */',
    '.bf-fx-dizzy{background:radial-gradient(circle at 50% 50%,rgba(120,230,220,.08) 0%,transparent 55%)}',
    '.bf-fx-dizzy .bf-spiral{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:2px dashed rgba(120,220,210,.5);animation:bfSpiralSpin 4s linear infinite}',
    '.bf-fx-dizzy .bf-spiral:nth-child(1){animation-delay:0s}',
    '.bf-fx-dizzy .bf-spiral:nth-child(2){width:60px;height:60px;margin:-30px 0 0 -30px;animation-delay:1s;animation-direction:reverse}',
    '@keyframes bfSpiralSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
    '',
    '@media(max-width:880px){.bf-fx-agony .bf-blood{height:18px;width:4px}.bf-fx-frozen .bf-snow{font-size:11px}.bf-fx-frozen .bf-stalactite{border-top-width:20px!important}.bf-fx-curse .bf-skull{font-size:14px}.bf-fx-curse .bf-candle{height:22px}.bf-fx-bless .bf-spark{font-size:10px}.bf-fx-confuse .bf-star{font-size:11px}}'
  ].join('\\n');

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // Detección de estados (mismos tests que statusLabelPatch)
  function modSum(h){
    var total=0;(h._mods||[]).forEach(function(m){if(!m||(m.turns!==undefined&&m.turns<=0))return;total+=(m.cc||0)+(m.ad||0)+(m.he||0);});
    return total;
  }
  var STATES=[
    {key:'agony',test:function(h){return h.alive&&h.hp>0&&h.maxHp>=15&&h.hp<=Math.ceil(h.maxHp*.1);}},
    {key:'sleep',test:function(h){return h.sleep>0;}},
    {key:'para',test:function(h){return h.para>0;}},
    {key:'silence',test:function(h){return h.silence>0;}},
    {key:'frozen',test:function(h){return h.frozen>0||(h._mods||[]).some(function(m){return m&&(m.turns===undefined||m.turns>0)&&Number(m.vel)<0;});}},
    {key:'confuse',test:function(h){return h._bfConfused>0;}},
    {key:'drunk',test:function(h){return h._bfDrunk>0;}},
    {key:'dizzy',test:function(h){return h._bfDizzy>0;}},
    {key:'curse',test:function(h){return modSum(h)<0;}},
    {key:'bless',test:function(h){return modSum(h)>0;}}
  ];

  var HTML={
    agony:'<div class="bf-blood"></div><div class="bf-blood"></div><div class="bf-blood"></div><div class="bf-blood"></div><div class="bf-blood"></div><div class="bf-blood"></div><div class="bf-splatter"></div><div class="bf-splatter"></div><div class="bf-splatter"></div>',
    frozen:'<div class="bf-stalactite"></div><div class="bf-stalactite"></div><div class="bf-stalactite"></div><div class="bf-stalactite"></div><div class="bf-stalactite"></div><div class="bf-snow">\\u2744</div><div class="bf-snow">\\u2745</div><div class="bf-snow">\\u2744</div><div class="bf-snow">\\u2745</div><div class="bf-snow">\\u2744</div>',
    curse:'<div class="bf-skull">\\ud83d\\udc80</div><div class="bf-skull">\\ud83d\\udc80</div><div class="bf-skull">\\ud83d\\udc80</div><div class="bf-candle"></div><div class="bf-candle"></div>',
    sleep:'<div class="bf-zzz">Z</div><div class="bf-zzz">Z</div><div class="bf-zzz">Z</div>',
    bless:'<div class="bf-ray"></div><div class="bf-ray"></div><div class="bf-ray"></div><div class="bf-spark">\\u2728</div><div class="bf-spark">\\u2726</div><div class="bf-spark">\\u2728</div><div class="bf-spark">\\u2726</div><div class="bf-spark">\\u2728</div>',
    para:'<div class="bf-bolt">\\u26a1</div><div class="bf-bolt">\\u26a1</div><div class="bf-bolt">\\u26a1</div>',
    confuse:'<div class="bf-star">\\u2b50</div><div class="bf-star">\\u2b50</div><div class="bf-star">\\u2b50</div>',
    silence:'<div class="bf-rune">\\ud83d\\udd07</div><div class="bf-rune">\\ud83d\\udd07</div><div class="bf-rune">\\ud83d\\udd07</div>',
    drunk:'<div class="bf-bubble"></div><div class="bf-bubble"></div><div class="bf-bubble"></div><div class="bf-bubble"></div>',
    dizzy:'<div class="bf-spiral"></div><div class="bf-spiral"></div>'
  };

  function heroFromCard(card){
    var parts=String(card.id||'').split('_');
    if(parts.length<3||typeof getHero!=='function')return null;
    try{return getHero(parts[1],parts.slice(2).join('_'));}catch(e){return null;}
  }

  function paint(card){
    var hero=heroFromCard(card);
    // Se ancla a la carta completa (.bhero) y no al retrato (.bf-battle-art):
    // antes el efecto se inyectaba dentro del retrato y quedaba oculto detrás
    // del arte de batalla. En la carta, con z-index:18, el efecto se ve por
    // encima del retrato y por debajo de los rótulos de estado (z-index:20).
    var host=card;
    var fx=host.querySelector('.bf-scene-fx');
    var active=[];
    if(hero&&hero.alive)STATES.forEach(function(s){try{if(s.test(hero))active.push(s.key);}catch(e){}});
    var key=active[0]||'';
    if(!key){if(fx)fx.remove();return;}
    if(!fx){fx=document.createElement('div');fx.className='bf-scene-fx bf-fx-'+key;fx.dataset.bfKey=key;fx.innerHTML=HTML[key]||'';host.appendChild(fx);return;}
    var cls='bf-scene-fx bf-fx-'+key;
    if(fx.className!==cls||fx.dataset.bfKey!==key){
      fx.className=cls;
      fx.dataset.bfKey=key;
      fx.innerHTML=HTML[key]||'';
    }
  }

  function update(){document.querySelectorAll('.bhero[id^="b_"]').forEach(paint);}

  function hookRender(){
    if(typeof window.renderBattle!=='function'||window.renderBattle.__bfSceneFx)return false;
    var original=window.renderBattle;
    window.renderBattle=function(){var r=original.apply(this,arguments);update();return r;};
    window.renderBattle.__bfSceneFx=1;
    return true;
  }

  var tries=0,timer=setInterval(function(){if(hookRender()||tries++>120)clearInterval(timer);},200);
  setInterval(update,500);
  update();
})();
</script>
`;